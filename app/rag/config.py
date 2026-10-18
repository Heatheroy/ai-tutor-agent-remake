from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()
class Settings(BaseSettings):
    chunk_size: int = 500
    chunk_overlap: int = 50
    embedding_model: str = "models/all-MiniLM-L6-v2"
    chroma_collection_name: str = "ai_tutor"
    chroma_persist_dir: str = "chroma_db"

    retrieval_k: int = 4
    min_relevance_score: float = 0.5
    max_retrieval_distance: float = 2.0
    google_api_key: str = ""
    gemini_model: str = "gemini-3.6-flash"
    
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-20b"

    moonshot_api_key: str = ""
    moonshot_base_url: str = "https://api.moonshot.cn/v1"
    moonshot_model: str = "moonshot-v1-8k"
    
    llm_temperature: float = 0.0

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )
settings = Settings()
