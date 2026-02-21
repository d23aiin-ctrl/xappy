"""
CereBro AI Service - Vector Store for User Memory RAG

Supports both Pinecone (managed) and Qdrant (self-hosted).
Uses LangChain for unified interface.
"""
from typing import Optional, List, Dict, Any
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from langchain_community.vectorstores import Qdrant, Pinecone
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
import logging

from core.config import settings

logger = logging.getLogger(__name__)


# ─── Embeddings ──────────────────────────────────────────────────

def get_embeddings() -> OpenAIEmbeddings:
    """Get OpenAI embeddings model."""
    return OpenAIEmbeddings(
        model=settings.OPENAI_EMBEDDING_MODEL,
        openai_api_key=settings.OPENAI_API_KEY,
    )


# ─── Qdrant Vector Store (Self-hosted option) ────────────────────

class QdrantMemoryStore:
    """Vector store using Qdrant for user memories."""

    COLLECTION_NAME = "user_memories"
    VECTOR_SIZE = 1536  # text-embedding-3-small dimensions

    def __init__(self):
        self.client = QdrantClient(
            url=settings.QDRANT_URL or "http://localhost:6333",
            api_key=settings.QDRANT_API_KEY,
        )
        self.embeddings = get_embeddings()
        self._ensure_collection()

    def _ensure_collection(self):
        """Create collection if it doesn't exist."""
        collections = self.client.get_collections().collections
        exists = any(c.name == self.COLLECTION_NAME for c in collections)

        if not exists:
            self.client.create_collection(
                collection_name=self.COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=self.VECTOR_SIZE,
                    distance=Distance.COSINE,
                ),
            )
            logger.info(f"Created Qdrant collection: {self.COLLECTION_NAME}")

    def get_vectorstore(self, user_id: str) -> Qdrant:
        """Get LangChain Qdrant vectorstore for a user namespace."""
        return Qdrant(
            client=self.client,
            collection_name=self.COLLECTION_NAME,
            embeddings=self.embeddings,
        )

    async def add_memory(
        self,
        user_id: str,
        content: str,
        memory_type: str,
        source_id: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Add a memory to the vector store."""
        doc = Document(
            page_content=content,
            metadata={
                "user_id": user_id,
                "type": memory_type,
                "source_id": source_id,
                **(metadata or {}),
            },
        )

        vectorstore = self.get_vectorstore(user_id)
        ids = await vectorstore.aadd_documents([doc])
        return ids[0]

    async def search_memories(
        self,
        user_id: str,
        query: str,
        k: int = 5,
        memory_types: Optional[List[str]] = None,
        min_score: float = 0.5,
    ) -> List[Dict[str, Any]]:
        """Search user memories with semantic similarity."""
        vectorstore = self.get_vectorstore(user_id)

        # Build filter
        filter_dict = {"user_id": user_id}
        if memory_types:
            filter_dict["type"] = {"$in": memory_types}

        results = await vectorstore.asimilarity_search_with_score(
            query,
            k=k,
            filter=filter_dict,
        )

        return [
            {
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": score,
            }
            for doc, score in results
            if score >= min_score
        ]

    async def delete_user_memories(self, user_id: str) -> int:
        """Delete all memories for a user (GDPR compliance)."""
        result = self.client.delete(
            collection_name=self.COLLECTION_NAME,
            points_selector={
                "filter": {
                    "must": [{"key": "user_id", "match": {"value": user_id}}]
                }
            },
        )
        return result.status


# ─── Pinecone Vector Store (Managed option) ──────────────────────

class PineconeMemoryStore:
    """Vector store using Pinecone for user memories."""

    def __init__(self):
        from pinecone import Pinecone

        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index_name = settings.PINECONE_INDEX_NAME
        self.embeddings = get_embeddings()
        self._ensure_index()

    def _ensure_index(self):
        """Create index if it doesn't exist."""
        existing = [idx.name for idx in self.pc.list_indexes()]

        if self.index_name not in existing:
            self.pc.create_index(
                name=self.index_name,
                dimension=1536,
                metric="cosine",
                spec={
                    "serverless": {
                        "cloud": "aws",
                        "region": settings.PINECONE_ENVIRONMENT,
                    }
                },
            )
            logger.info(f"Created Pinecone index: {self.index_name}")

    def get_vectorstore(self, user_id: str) -> Pinecone:
        """Get LangChain Pinecone vectorstore for a user namespace."""
        index = self.pc.Index(self.index_name)
        return Pinecone(
            index=index,
            embedding=self.embeddings,
            text_key="text",
            namespace=user_id,
        )

    async def add_memory(
        self,
        user_id: str,
        content: str,
        memory_type: str,
        source_id: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Add a memory to the vector store."""
        doc = Document(
            page_content=content,
            metadata={
                "type": memory_type,
                "source_id": source_id,
                **(metadata or {}),
            },
        )

        vectorstore = self.get_vectorstore(user_id)
        ids = await vectorstore.aadd_documents([doc])
        return ids[0]

    async def search_memories(
        self,
        user_id: str,
        query: str,
        k: int = 5,
        memory_types: Optional[List[str]] = None,
        min_score: float = 0.5,
    ) -> List[Dict[str, Any]]:
        """Search user memories with semantic similarity."""
        vectorstore = self.get_vectorstore(user_id)

        # Build filter
        filter_dict = {}
        if memory_types:
            filter_dict["type"] = {"$in": memory_types}

        results = await vectorstore.asimilarity_search_with_score(
            query,
            k=k,
            filter=filter_dict if filter_dict else None,
        )

        return [
            {
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": score,
            }
            for doc, score in results
            if score >= min_score
        ]

    async def delete_user_memories(self, user_id: str) -> bool:
        """Delete all memories for a user namespace (GDPR compliance)."""
        index = self.pc.Index(self.index_name)
        index.delete(delete_all=True, namespace=user_id)
        return True


# ─── Factory Function ────────────────────────────────────────────

def get_memory_store():
    """Get the configured memory store."""
    if settings.PINECONE_API_KEY:
        logger.info("Using Pinecone vector store")
        return PineconeMemoryStore()
    else:
        logger.info("Using Qdrant vector store")
        return QdrantMemoryStore()


# Singleton instance
memory_store = None


def get_store():
    """Get or create memory store singleton."""
    global memory_store
    if memory_store is None:
        memory_store = get_memory_store()
    return memory_store
