"""Pick Groq when GROQ_API_KEY is set, otherwise Google Gemini."""

from app.rag.config import settings


def make_llm(temperature: float, max_tokens: int = 4000):
    if settings.groq_api_key:
        from langchain_groq import ChatGroq

        return ChatGroq(
            model=settings.groq_model,
            temperature=temperature,
            api_key=settings.groq_api_key,
            max_tokens=max_tokens,
        )

    if settings.google_api_key:
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            temperature=temperature,
            google_api_key=settings.google_api_key,
        )

    raise ValueError(
        "No API key provided. Please set either GOOGLE_API_KEY or GROQ_API_KEY in your .env file."
    )
