
"""Choose Kimi, Groq, or Gemini based on available API keys."""

from app.rag.config import settings


def make_llm(temperature: float, max_tokens: int = 4000):

    # 1. 优先使用 Kimi
    if settings.moonshot_api_key:
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=settings.moonshot_model,
            api_key=settings.moonshot_api_key,
            base_url=settings.moonshot_base_url,
            max_tokens=max_tokens,
            extra_body={"thinking": {"type": "disabled"}},
        )

    # 2. 其次使用 Groq
    if settings.groq_api_key:
        from langchain_groq import ChatGroq

        return ChatGroq(
            model=settings.groq_model,
            temperature=temperature,
            api_key=settings.groq_api_key,
            max_tokens=max_tokens,
        )

    # 3. 最后使用 Gemini
    if settings.google_api_key:
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            temperature=temperature,
            google_api_key=settings.google_api_key,
        )

    raise ValueError(
        "No API key provided. Please set MOONSHOT_API_KEY, "
        "GROQ_API_KEY, or GOOGLE_API_KEY in .env."
    )
