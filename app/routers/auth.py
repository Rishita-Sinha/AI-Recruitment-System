from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.recruiter import Recruiter
from app.schemas.auth import LoginRequest, RegisterRequest
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


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

    # =====================================================
    # Create JWT access token
    # =====================================================

    access_token = create_access_token(
        {
            "sub": str(recruiter.id)
        }
    )

    # =====================================================
    # Return login response
    # =====================================================

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