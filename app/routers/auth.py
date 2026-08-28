from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from datetime import datetime, timezone, timedelta
import secrets
import os

from pydantic import BaseModel, EmailStr

from app.dependencies import get_db
from app.models.recruiter import Recruiter
from app.schemas.auth import LoginRequest, RegisterRequest
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
)

from app.services.email_service import send_password_reset_email


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# =========================================================
# Forgot / Reset Password Schemas
# =========================================================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str


# =========================================================
# Recruiter Registration
# =========================================================

@router.post("/register")
def register(
    register_data: RegisterRequest,
    db: Session = Depends(get_db),
):
    # Check whether passwords match
    if register_data.password != register_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )

    # Check whether email is already registered
    existing_recruiter = (
        db.query(Recruiter)
        .filter(Recruiter.email == register_data.email)
        .first()
    )

    if existing_recruiter:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A recruiter with this email already exists",
        )

    # Create new recruiter
    recruiter = Recruiter(
        full_name=register_data.full_name,
        email=register_data.email,
        password_hash=hash_password(register_data.password),
        is_active=True,
    )

    # Save recruiter to database
    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)

    return {
        "message": "Recruiter registered successfully",
        "recruiter": {
            "id": str(recruiter.id),
            "full_name": recruiter.full_name,
            "email": recruiter.email,
        },
    }


# =========================================================
# Recruiter Login
# =========================================================

@router.post("/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    # Find recruiter by email
    recruiter = (
        db.query(Recruiter)
        .filter(Recruiter.email == login_data.email)
        .first()
    )

    # Recruiter does not exist
    if not recruiter:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check if recruiter account is active
    if not recruiter.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter account is inactive",
        )

    # Verify password
    password_is_valid = verify_password(
        login_data.password,
        recruiter.password_hash,
    )

    if not password_is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Create JWT access token
    access_token = create_access_token(
        {
            "sub": str(recruiter.id)
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "recruiter": {
            "id": str(recruiter.id),
            "full_name": recruiter.full_name,
            "email": recruiter.email,
        },
    }


# =========================================================
# Forgot Password
# =========================================================

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Generate a secure password-reset token and send
    the password-reset link to the recruiter's email.

    SMTP configuration is loaded from the .env file,
    so Gmail, Outlook, Zoho, or another SMTP provider
    can be used without changing this backend code.
    """

    recruiter = (
        db.query(Recruiter)
        .filter(Recruiter.email == request.email)
        .first()
    )

    # Do not reveal whether an email exists
    if not recruiter:
        return {
            "message": (
                "If an account with this email exists, "
                "a password reset link has been sent."
            )
        }

    # Generate secure random token
    reset_token = secrets.token_urlsafe(32)

    # Token valid for 30 minutes
    reset_token_expires = (
        datetime.now(timezone.utc)
        + timedelta(minutes=30)
    )

    # Save token and expiry in database
    recruiter.reset_token = reset_token
    recruiter.reset_token_expires = reset_token_expires

    db.commit()

    # Get frontend URL from .env
    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )

    # Create password reset link
    reset_link = (
        f"{frontend_url}/reset-password"
        f"?token={reset_token}"
    )

    try:
        # Send password reset email
        send_password_reset_email(
            recipient_email=recruiter.email,
            reset_link=reset_link,
        )

    except Exception as e:
        print(
            "Password reset email failed:",
            str(e),
        )

        # Remove token if email sending fails
        recruiter.reset_token = None
        recruiter.reset_token_expires = None

        db.commit()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to send password reset email.",
        )

    return {
        "message": (
            "If an account with this email exists, "
            "a password reset link has been sent."
        )
    }


# =========================================================
# Reset Password
# =========================================================

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    # Check whether passwords match
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )

    # Basic password validation
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long",
        )

    # Find recruiter using reset token
    recruiter = (
        db.query(Recruiter)
        .filter(
            Recruiter.reset_token == request.token
        )
        .first()
    )

    if not recruiter:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    # Check token expiry
    if (
        not recruiter.reset_token_expires
        or recruiter.reset_token_expires
        < datetime.now(timezone.utc)
    ):
        # Remove expired token
        recruiter.reset_token = None
        recruiter.reset_token_expires = None

        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    # Update password
    recruiter.password_hash = hash_password(
        request.new_password
    )

    # Invalidate token after successful use
    recruiter.reset_token = None
    recruiter.reset_token_expires = None

    db.commit()

    return {
        "message": (
            "Password reset successfully. "
            "You can now login."
        )
    }