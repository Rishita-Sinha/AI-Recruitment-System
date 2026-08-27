from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # Candidate being interviewed
    candidate_id = Column(
        UUID(as_uuid=True),
        ForeignKey("candidates.id"),
        nullable=False,
    )

    # Job Description / Job Match associated with this interview
    job_match_id = Column(
        UUID(as_uuid=True),
        ForeignKey("job_matches.id"),
        nullable=False,
    )

    # Secure unique token used in the candidate's interview URL
    token = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    # pending / in_progress / completed
    status = Column(
        String,
        nullable=False,
        default="pending",
    )

    # Current question number
    current_question = Column(
        String,
        nullable=False,
        default="1",
    )

    # Final AI-generated interview summary
    summary = Column(
        Text,
        nullable=True,
    )

    started_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )