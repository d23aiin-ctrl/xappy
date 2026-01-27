"""
XAPPY AI Media Attachment Model

Photos, videos, audio, and documents attached to reports.
"""

import enum
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .report import Report
    from .user import User


class MediaType(str, enum.Enum):
    """Types of media attachments"""
    PHOTO = "photo"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"


class MediaAttachment(Base):
    """
    Media attachment model for reports.

    Stores photos, videos, audio recordings, and documents.
    """
    __tablename__ = "media_attachments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Link to report
    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reports.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Media type
    media_type: Mapped[MediaType] = mapped_column(
        Enum(MediaType),
        nullable=False
    )

    # File information
    file_url: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        comment="URL to stored file (S3 or local)"
    )
    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Original file name"
    )
    file_size_bytes: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )
    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    # Thumbnail (for images/videos)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True
    )

    # Audio/Video specific
    duration_seconds: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Duration for audio/video files"
    )

    # Image specific
    width: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    height: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # AI processing results
    transcription: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Transcription for audio files"
    )
    transcription_language: Mapped[Optional[str]] = mapped_column(
        String(10),
        nullable=True
    )
    transcription_confidence: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True
    )
    ai_description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="AI-generated description of image/video content"
    )
    ai_extracted_text: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="OCR-extracted text from images"
    )
    ai_tags: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="AI-generated tags for searchability"
    )

    # Integrity verification
    sha256_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="SHA256 hash for integrity verification"
    )

    # Caption/notes
    caption: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="User-provided caption"
    )

    # Upload tracking
    uploaded_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    source: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Source: whatsapp, web, mobile"
    )
    source_message_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Original message ID from source"
    )

    # GPS coordinates (if embedded in image)
    gps_coordinates: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Extracted GPS coordinates {lat, lng}"
    )
    capture_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="When the media was captured (from EXIF or metadata)"
    )

    # Additional metadata
    extra_data: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Additional metadata (EXIF, etc.)"
    )

    # Timestamps
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    report: Mapped["Report"] = relationship("Report", back_populates="attachments")
    uploaded_by: Mapped[Optional["User"]] = relationship("User")

    def __repr__(self) -> str:
        return f"<MediaAttachment {self.media_type.value}: {self.file_name}>"
