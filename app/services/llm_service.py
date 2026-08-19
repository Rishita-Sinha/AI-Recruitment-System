import os
from dotenv import load_dotenv

load_dotenv()


# =========================================================
# LLM CONFIGURATION
# =========================================================

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini").lower()
LLM_MODEL = os.getenv("LLM_MODEL", "").strip()


# =========================================================
# Gemini
# =========================================================

def _ask_gemini(prompt: str) -> str:
    from google import genai

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured in the .env file."
        )

    model = LLM_MODEL or "gemini-2.5-flash"

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=model,
        contents=prompt,
    )

    return response.text


# =========================================================
# OpenAI
# =========================================================

def _ask_openai(prompt: str) -> str:
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is not configured in the .env file."
        )

    model = LLM_MODEL

    if not model:
        raise RuntimeError(
            "LLM_MODEL must be specified when using OpenAI."
        )

    client = OpenAI(api_key=api_key)

    response = client.responses.create(
        model=model,
        input=prompt,
    )

    return response.output_text


# =========================================================
# Anthropic Claude
# =========================================================

def _ask_claude(prompt: str) -> str:
    from anthropic import Anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not configured in the .env file."
        )

    model = LLM_MODEL

    if not model:
        raise RuntimeError(
            "LLM_MODEL must be specified when using Claude."
        )

    client = Anthropic(api_key=api_key)

    response = client.messages.create(
        model=model,
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    return response.content[0].text


# =========================================================
# Ollama
# =========================================================

def _ask_ollama(prompt: str) -> str:
    import requests

    model = LLM_MODEL

    if not model:
        raise RuntimeError(
            "LLM_MODEL must be specified when using Ollama."
        )

    base_url = os.getenv(
        "OLLAMA_BASE_URL",
        "http://localhost:11434",
    )

    url = f"{base_url.rstrip('/')}/api/generate"

    response = requests.post(
        url,
        json={
            "model": model,
            "prompt": prompt,
            "stream": False,
        },
        timeout=300,
    )

    response.raise_for_status()

    data = response.json()

    return data.get("response", "")


# =========================================================
# OpenAI-Compatible API
# =========================================================

def _ask_openai_compatible(prompt: str) -> str:
    from openai import OpenAI

    api_key = os.getenv(
        "OPENAI_COMPATIBLE_API_KEY",
        "not-required",
    )

    base_url = os.getenv("OPENAI_COMPATIBLE_BASE_URL")

    model = LLM_MODEL

    if not base_url:
        raise RuntimeError(
            "OPENAI_COMPATIBLE_BASE_URL is not configured."
        )

    if not model:
        raise RuntimeError(
            "LLM_MODEL must be specified."
        )

    client = OpenAI(
        api_key=api_key,
        base_url=base_url,
    )

    response = client.responses.create(
        model=model,
        input=prompt,
    )

    return response.output_text


# =========================================================
# Main LLM Function
# =========================================================

def ask_llm(prompt: str) -> str:

    provider = LLM_PROVIDER

    print("========================================")
    print(f"LLM Provider : {provider}")
    print(f"LLM Model    : {LLM_MODEL or 'provider default'}")
    print("========================================")

    if provider == "gemini":
        return _ask_gemini(prompt)

    elif provider == "openai":
        return _ask_openai(prompt)

    elif provider in ("claude", "anthropic"):
        return _ask_claude(prompt)

    elif provider == "ollama":
        return _ask_ollama(prompt)

    elif provider in (
        "openai-compatible",
        "openai_compatible",
    ):
        return _ask_openai_compatible(prompt)

    else:
        raise RuntimeError(
            f"Unsupported LLM_PROVIDER: {provider}. "
            f"Supported providers are: "
            f"gemini, openai, claude, ollama, "
            f"openai-compatible."
        )