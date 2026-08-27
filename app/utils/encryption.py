import os

from cryptography.fernet import Fernet
from dotenv import load_dotenv


load_dotenv()


def _get_fernet() -> Fernet:
    key = os.getenv("LLM_ENCRYPTION_KEY")

    if not key:
        raise RuntimeError(
            "LLM_ENCRYPTION_KEY is not configured in the .env file."
        )

    try:
        return Fernet(key.encode())
    except Exception as exc:
        raise RuntimeError(
            "LLM_ENCRYPTION_KEY is invalid."
        ) from exc


def encrypt_api_key(api_key: str | None) -> str | None:
    """
    Encrypt an API key before storing it in the database.
    """

    if not api_key:
        return None

    fernet = _get_fernet()

    encrypted = fernet.encrypt(
        api_key.encode()
    )

    return encrypted.decode()


def decrypt_api_key(
    encrypted_api_key: str | None,
) -> str | None:
    """
    Decrypt an API key when it is needed by the LLM service.
    """

    if not encrypted_api_key:
        return None

    fernet = _get_fernet()

    try:
        decrypted = fernet.decrypt(
            encrypted_api_key.encode()
        )

        return decrypted.decode()

    except Exception as exc:
        raise RuntimeError(
            "Unable to decrypt the stored LLM API key."
        ) from exc