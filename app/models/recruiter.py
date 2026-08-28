import uuid

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database import Base


class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    full_name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String,
        nullable=False
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False
    )

    # =====================================================
    # Password Reset
    # =====================================================

    reset_token = Column(
        String,
        nullable=True,
        unique=True,
        index=True
    )

    reset_token_expires = Column(
        DateTime(timezone=True),
        nullable=True
    )

    # =====================================================
    # Account Creation
    # =====================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )