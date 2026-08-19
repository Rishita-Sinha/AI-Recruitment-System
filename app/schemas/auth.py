from pydantic import BaseModel, EmailStr, Field


# =========================
# Login
# =========================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# =========================
# Recruiter Registration
# =========================

class RegisterRequest(BaseModel):
    full_name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128
    )

    confirm_password: str = Field(
        min_length=8,
        max_length=128
    )