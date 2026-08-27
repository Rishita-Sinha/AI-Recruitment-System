import os

from dotenv import load_dotenv

from app.database import SessionLocal
from app.models.llm_config import LLMConfig
from app.utils.encryption import decrypt_api_key

load_dotenv()


# =========================================================
# DATABASE LLM CONFIGURATION
# =========================================================

def get_active_llm_config():
    """
    Get the currently active LLM configuration from PostgreSQL.
    """

    db = SessionLocal()

    try:
        config = (
            db.query(LLMConfig)
            .filter(LLMConfig.is_active == True)
            .first()
        )

        return config

    finally:
        db.close()


# =========================================================
# Gemini
# =========================================================

def _ask_gemini(
    prompt: str,
    model: str,
    api_key: str,
) -> str:

    from google import genai

    if not api_key:
        raise RuntimeError(
            "Gemini API key is not configured."
        )

    client = genai.Client(
        api_key=api_key
    )

    response = client.models.generate_content(
        model=model,
        contents=prompt,
    )

    return response.text


# =========================================================
# OpenAI
# =========================================================

def _ask_openai(
    prompt: str,
    model: str,
    api_key: str,
) -> str:

    from openai import OpenAI

    if not api_key:
        raise RuntimeError(
            "OpenAI API key is not configured."
        )

    client = OpenAI(
        api_key=api_key
    )

    response = client.responses.create(
        model=model,
        input=prompt,
    )

    return response.output_text


# =========================================================
# Anthropic Claude
# =========================================================

def _ask_claude(
    prompt: str,
    model: str,
    api_key: str,
) -> str:

    from anthropic import Anthropic

    if not api_key:
        raise RuntimeError(
            "Anthropic API key is not configured."
        )

    client = Anthropic(
        api_key=api_key
    )

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

def _ask_ollama(
    prompt: str,
    model: str,
    base_url: str | None,
) -> str:

    import requests

    if not model:
        raise RuntimeError(
            "Ollama model is not configured."
        )

    base_url = (
        base_url
        or "http://localhost:11434"
    )

    url = (
        f"{base_url.rstrip('/')}"
        "/api/generate"
    )

    try:
        response = requests.post(
            url,
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
            },
            timeout=60,
    )

        response.raise_for_status()

    except requests.exceptions.ConnectionError as exc:
        raise RuntimeError(
            "Ollama service is unavailable. "
            "Please make sure the Ollama server is running."
        ) from exc

    except requests.exceptions.Timeout as exc:
        raise RuntimeError(
            "Ollama took too long to respond. "
            "Please check the Ollama server and model."
        ) from exc

    except requests.exceptions.RequestException as exc:
        raise RuntimeError(
            f"Ollama request failed: {exc}"
        ) from exc

    response.raise_for_status()

    data = response.json()

    return data.get("response", "")


# =========================================================
# OpenAI-Compatible API
# =========================================================

def _ask_openai_compatible(
    prompt: str,
    model: str,
    api_key: str | None,
    base_url: str | None,
) -> str:

    from openai import OpenAI

    if not base_url:
        raise RuntimeError(
            "OpenAI-compatible base URL is not configured."
        )

    client = OpenAI(
        api_key=api_key or "not-required",
        base_url=base_url,
    )

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    return response.choices[0].message.content


# =========================================================
# Main LLM Function
# =========================================================

def ask_llm(prompt: str) -> str:

    config = get_active_llm_config()

    # -----------------------------------------------------
    # Temporary fallback to .env
    # -----------------------------------------------------
    # This keeps the existing Gemini setup working if
    # there is no active database configuration.
    # -----------------------------------------------------

    if config is None:

        provider = os.getenv(
            "LLM_PROVIDER",
            "gemini",
        ).lower()

        model = os.getenv(
            "LLM_MODEL",
            "",
        ).strip()

        print("========================================")
        print("LLM Source   : .env fallback")
        print(f"LLM Provider : {provider}")
        print(f"LLM Model    : {model or 'provider default'}")
        print("========================================")

        if provider == "gemini":

            return _ask_gemini(
                prompt,
                model or "gemini-2.5-flash",
                os.getenv("GEMINI_API_KEY"),
            )

        raise RuntimeError(
            "No active LLM configuration found."
        )

    # -----------------------------------------------------
    # Database configuration
    # -----------------------------------------------------

    provider = config.provider.lower()
    model = config.model
    api_key = decrypt_api_key(config.api_key)
    base_url = config.base_url

    print("========================================")
    print("LLM Source   : PostgreSQL")
    print(f"LLM Provider : {provider}")
    print(f"LLM Model    : {model}")
    print("========================================")

    # -----------------------------------------------------
    # Provider selection
    # -----------------------------------------------------

    if provider == "gemini":

        return _ask_gemini(
            prompt,
            model,
            api_key,
        )

    elif provider == "openai":

        return _ask_openai(
            prompt,
            model,
            api_key,
        )

    elif provider in (
        "claude",
        "anthropic",
    ):

        return _ask_claude(
            prompt,
            model,
            api_key,
        )

    elif provider == "ollama":

        return _ask_ollama(
            prompt,
            model,
            base_url,
        )

    elif provider in (
        "openai-compatible",
        "openai_compatible",
        "groq",
    ):

        return _ask_openai_compatible(
            prompt,
            model,
            api_key,
            base_url,
        )

    else:

        raise RuntimeError(
            f"Unsupported LLM provider: {provider}"
        )