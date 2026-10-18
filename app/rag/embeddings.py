"""
app/rag/embeddings.py

Provides a lazily-loaded embedding model for the RAG pipeline.
The model is loaded once per process and reused for subsequent
document and query embedding operations.
"""

from functools import lru_cache
from pathlib import Path

from langchain_huggingface import HuggingFaceEmbeddings

from app.rag.config import settings

_PROJECT_ROOT = Path(__file__).resolve().parents[2]


@lru_cache(maxsize=1)
def get_embedding_model() -> HuggingFaceEmbeddings:
    """
    Return the local embedding model.

    The model is downloaded on the first call and cached in memory.
    Subsequent calls reuse the same model.
    """
    model_name = settings.embedding_model
    local_model = _PROJECT_ROOT / model_name
    if local_model.is_dir():
        model_name = str(local_model)

    return HuggingFaceEmbeddings(
        model_name=model_name,
        encode_kwargs={"normalize_embeddings": True},
    )


def embed_query(text: str) -> list[float]:
    """Generate an embedding vector for a single query."""
    return get_embedding_model().embed_query(text)


def embed_documents(texts: list[str]) -> list[list[float]]:
    """Generate embedding vectors for multiple document chunks."""
    return get_embedding_model().embed_documents(texts)