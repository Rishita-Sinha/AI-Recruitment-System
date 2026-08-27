from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.recruiter import Recruiter
from app.utils.auth import decode_access_token


# =========================================================
# Database Dependency
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# JWT Authentication
# =========================================================

security = HTTPBearer()


def get_current_recruiter(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Get the currently authenticated recruiter from the JWT.
    """

    token = credentials.credentials

    # Decode JWT
    try:
        payload = decode_access_token(token)

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    # Get recruiter ID from JWT
    recruiter_id = payload.get("sub")

    if not recruiter_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    # Find recruiter in database
    recruiter = (
        db.query(Recruiter)
        .filter(Recruiter.id == recruiter_id)
        .first()
    )

    if not recruiter:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Recruiter account not found",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    # Check account status
    if not recruiter.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter account is inactive",
        )

    return recruiter
