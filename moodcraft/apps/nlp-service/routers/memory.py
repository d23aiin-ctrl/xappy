"""
CereBro AI Service - Memory/RAG Router

Endpoints for user memory management and RAG retrieval.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

from vectorstores.memory_store import get_store

router = APIRouter(prefix="/memory", tags=["Memory RAG"])


# ─── Models ──────────────────────────────────────────────────────

class AddMemoryRequest(BaseModel):
    user_id: str
    content: str
    memory_type: str  # journal, mood, chat, insight, entity
    source_id: str
    metadata: Optional[dict] = None


class AddMemoryResponse(BaseModel):
    success: bool
    memory_id: str


class SearchMemoryRequest(BaseModel):
    user_id: str
    query: str
    k: int = 5
    memory_types: Optional[List[str]] = None
    min_score: float = 0.5


class MemoryResult(BaseModel):
    content: str
    metadata: dict
    score: float


class SearchMemoryResponse(BaseModel):
    memories: List[MemoryResult]
    count: int


class BatchAddRequest(BaseModel):
    user_id: str
    memories: List[dict]  # [{content, memory_type, source_id, metadata}]


class BatchAddResponse(BaseModel):
    success: bool
    count: int
    ids: List[str]


# ─── Endpoints ───────────────────────────────────────────────────

@router.post("/add", response_model=AddMemoryResponse)
async def add_memory(request: AddMemoryRequest):
    """
    Add a memory to the vector store.

    Memories are used for RAG retrieval in AI Twin conversations.
    """
    try:
        store = get_store()

        metadata = request.metadata or {}
        metadata["timestamp"] = datetime.utcnow().isoformat()

        memory_id = await store.add_memory(
            user_id=request.user_id,
            content=request.content,
            memory_type=request.memory_type,
            source_id=request.source_id,
            metadata=metadata,
        )

        return AddMemoryResponse(success=True, memory_id=memory_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search", response_model=SearchMemoryResponse)
async def search_memories(request: SearchMemoryRequest):
    """
    Search user memories with semantic similarity.

    Uses vector embeddings to find relevant past content.
    """
    try:
        store = get_store()

        results = await store.search_memories(
            user_id=request.user_id,
            query=request.query,
            k=request.k,
            memory_types=request.memory_types,
            min_score=request.min_score,
        )

        memories = [
            MemoryResult(
                content=r["content"],
                metadata=r["metadata"],
                score=r["score"],
            )
            for r in results
        ]

        return SearchMemoryResponse(memories=memories, count=len(memories))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch-add", response_model=BatchAddResponse)
async def batch_add_memories(request: BatchAddRequest):
    """
    Add multiple memories at once.

    Useful for bulk indexing journals, mood entries, etc.
    """
    try:
        store = get_store()
        ids = []

        for mem in request.memories:
            metadata = mem.get("metadata", {})
            metadata["timestamp"] = datetime.utcnow().isoformat()

            memory_id = await store.add_memory(
                user_id=request.user_id,
                content=mem["content"],
                memory_type=mem["memory_type"],
                source_id=mem["source_id"],
                metadata=metadata,
            )
            ids.append(memory_id)

        return BatchAddResponse(success=True, count=len(ids), ids=ids)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/user/{user_id}")
async def delete_user_memories(user_id: str):
    """
    Delete all memories for a user.

    For GDPR compliance and account deletion.
    """
    try:
        store = get_store()
        await store.delete_user_memories(user_id)

        return {"success": True, "message": f"Deleted all memories for user {user_id}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def memory_health():
    """Check memory store connection."""
    try:
        store = get_store()
        return {"status": "healthy", "store_type": type(store).__name__}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
