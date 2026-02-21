"""
XAPPY Document API Endpoints

Secure document upload, download, and verification.
"""

from typing import Optional, List
from uuid import UUID
from datetime import datetime
import hashlib

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.tenant_document import (
    TenantDocument, DocumentAccessLog,
    DocumentType, DocumentStatus
)
from app.models.tenant import Tenant
from app.api.v1.deps import (
    get_current_active_user,
    require_property_manager,
    require_landlord,
    require_tenant,
)

router = APIRouter()


# Pydantic schemas
class UploadRequestResponse(BaseModel):
    upload_url: str
    document_id: UUID
    s3_key: str
    expires_in_seconds: int


class DocumentUploadComplete(BaseModel):
    document_id: UUID
    original_filename: str
    file_size_bytes: int
    file_hash_sha256: str
    gdpr_consent: bool = True
    gdpr_purpose: str = "Tenant verification and referencing"


class DocumentVerifyRequest(BaseModel):
    verification_notes: Optional[str] = None
    document_number: Optional[str] = None
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None


class DocumentRejectRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=10)


class DocumentResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    document_type: DocumentType
    original_filename: str
    file_size_bytes: int
    status: DocumentStatus
    verified: bool
    verified_at: Optional[datetime]
    document_number: Optional[str]
    issue_date: Optional[datetime]
    expiry_date: Optional[datetime]
    gdpr_consent_given: bool
    gdpr_consent_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class DownloadResponse(BaseModel):
    download_url: str
    expires_in_seconds: int
    filename: str


async def generate_s3_key(tenant_id: UUID, document_type: DocumentType) -> str:
    """Generate S3 key for document storage"""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    return f"documents/{tenant_id}/{document_type.value}/{timestamp}"


async def log_document_access(
    db: AsyncSession,
    document: TenantDocument,
    user: User,
    access_type: str,
    request: Request,
    access_reason: Optional[str] = None,
):
    """Log document access with hash chain"""
    # Get previous log entry
    prev_result = await db.execute(
        select(DocumentAccessLog)
        .where(DocumentAccessLog.document_id == document.id)
        .order_by(DocumentAccessLog.accessed_at.desc())
        .limit(1)
    )
    prev_log = prev_result.scalar_one_or_none()

    log_entry = DocumentAccessLog(
        document_id=document.id,
        accessed_by_id=user.id,
        accessed_by_role=user.role.value,
        access_type=access_type,
        access_reason=access_reason,
        ip_address=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("user-agent", "")[:500],
        previous_log_id=prev_log.id if prev_log else None,
        previous_hash=prev_log.entry_hash if prev_log else None,
        entry_hash="",  # Will be computed
    )

    # Compute hash
    log_entry.entry_hash = log_entry.compute_hash()

    db.add(log_entry)


@router.post("/request-upload", response_model=UploadRequestResponse)
async def request_upload(
    tenant_id: UUID,
    document_type: DocumentType,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Request a presigned URL for document upload.

    Returns an S3 presigned URL that the client can use to upload directly.
    """
    # Verify tenant exists and access
    tenant_result = await db.execute(
        select(Tenant).where(Tenant.id == tenant_id)
    )
    tenant = tenant_result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )

    # Verify access
    if current_user.role == UserRole.TENANT and tenant.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only upload your own documents"
        )

    # Generate S3 key
    s3_key = await generate_s3_key(tenant_id, document_type)

    # Create placeholder document record
    document = TenantDocument(
        tenant_id=tenant_id,
        document_type=document_type,
        original_filename="pending",
        file_extension="",
        mime_type="application/octet-stream",
        file_size_bytes=0,
        s3_bucket="xappy-documents",  # Would come from config
        s3_key=s3_key,
        file_hash_sha256="",
        status=DocumentStatus.PENDING,
        uploaded_by_id=current_user.id,
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)

    # In production, generate actual S3 presigned URL
    # For now, return placeholder
    upload_url = f"https://xappy-documents.s3.amazonaws.com/{s3_key}?presigned=true"

    return UploadRequestResponse(
        upload_url=upload_url,
        document_id=document.id,
        s3_key=s3_key,
        expires_in_seconds=3600,
    )


@router.post("/upload", response_model=DocumentResponse)
async def complete_upload(
    data: DocumentUploadComplete,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Complete document upload after file is uploaded to S3.

    Updates the document record with file details and GDPR consent.
    """
    result = await db.execute(
        select(TenantDocument).where(TenantDocument.id == data.document_id)
    )
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document record not found"
        )

    # Extract extension
    ext = data.original_filename.rsplit('.', 1)[-1] if '.' in data.original_filename else ''

    # Determine mime type from extension
    mime_types = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }

    document.original_filename = data.original_filename
    document.file_extension = ext
    document.mime_type = mime_types.get(ext.lower(), 'application/octet-stream')
    document.file_size_bytes = data.file_size_bytes
    document.file_hash_sha256 = data.file_hash_sha256
    document.gdpr_consent_given = data.gdpr_consent
    document.gdpr_consent_at = datetime.utcnow() if data.gdpr_consent else None
    document.gdpr_consent_ip = request.client.host if request.client else None
    document.gdpr_purpose = data.gdpr_purpose
    document.status = DocumentStatus.PENDING
    document.upload_ip_address = request.client.host if request.client else None

    # Set retention period (e.g., 7 years for UK regulatory compliance)
    from datetime import timedelta
    document.retention_until = datetime.utcnow() + timedelta(days=7*365)

    await db.commit()
    await db.refresh(document)

    return document


@router.get("/{document_id}/download", response_model=DownloadResponse)
async def download_document(
    document_id: UUID,
    access_reason: Optional[str] = None,
    request: Request = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """
    Get a presigned URL to download a document.

    Access is logged for audit trail.
    """
    result = await db.execute(
        select(TenantDocument).where(TenantDocument.id == document_id)
    )
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    if not document.is_accessible:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Document is not accessible"
        )

    # Log access
    await log_document_access(
        db, document, current_user, "download", request, access_reason
    )
    await db.commit()

    # In production, generate actual S3 presigned URL
    download_url = f"https://xappy-documents.s3.amazonaws.com/{document.s3_key}?presigned=download"

    return DownloadResponse(
        download_url=download_url,
        expires_in_seconds=300,  # 5 minutes
        filename=document.original_filename,
    )


@router.post("/{document_id}/verify", response_model=DocumentResponse)
async def verify_document(
    document_id: UUID,
    data: DocumentVerifyRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """
    Verify a document as authentic.

    AI should NOT auto-verify documents - human review required.
    """
    result = await db.execute(
        select(TenantDocument).where(TenantDocument.id == document_id)
    )
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    document.status = DocumentStatus.VERIFIED
    document.verified_by_id = current_user.id
    document.verified_at = datetime.utcnow()
    document.verification_notes = data.verification_notes
    document.document_number = data.document_number
    document.issue_date = data.issue_date
    document.expiry_date = data.expiry_date

    # Log verification
    await log_document_access(
        db, document, current_user, "verify", request, "Document verification"
    )

    await db.commit()
    await db.refresh(document)

    return document


@router.post("/{document_id}/reject", response_model=DocumentResponse)
async def reject_document(
    document_id: UUID,
    data: DocumentRejectRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """Reject a document."""
    result = await db.execute(
        select(TenantDocument).where(TenantDocument.id == document_id)
    )
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    document.status = DocumentStatus.REJECTED
    document.rejection_reason = data.rejection_reason
    document.verified_by_id = current_user.id
    document.verified_at = datetime.utcnow()

    await log_document_access(
        db, document, current_user, "reject", request, data.rejection_reason
    )

    await db.commit()
    await db.refresh(document)

    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    deletion_reason: str = Query(..., min_length=5),
    request: Request = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """
    Soft delete a document (GDPR compliance).

    Document is marked as deleted but access logs are retained.
    """
    result = await db.execute(
        select(TenantDocument).where(TenantDocument.id == document_id)
    )
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    document.is_deleted = True
    document.deleted_at = datetime.utcnow()
    document.deleted_by_id = current_user.id
    document.deletion_reason = deletion_reason
    document.status = DocumentStatus.DELETED

    # Log deletion
    await log_document_access(
        db, document, current_user, "delete", request, deletion_reason
    )

    await db.commit()


@router.get("/tenant/{tenant_id}", response_model=List[DocumentResponse])
async def list_tenant_documents(
    tenant_id: UUID,
    document_type: Optional[DocumentType] = None,
    status: Optional[DocumentStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """List all documents for a tenant."""
    query = select(TenantDocument).where(
        TenantDocument.tenant_id == tenant_id,
        TenantDocument.is_deleted == False
    )

    if document_type:
        query = query.where(TenantDocument.document_type == document_type)
    if status:
        query = query.where(TenantDocument.status == status)

    result = await db.execute(query.order_by(TenantDocument.created_at.desc()))
    return result.scalars().all()
