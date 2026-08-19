from sqlalchemy import Column, String, Text, DateTime, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database import Base


class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # Recruiter who performed the matching
    recruiter_id = Column(
        UUID(as_uuid=True),
        nullable=False,
    )

    # Job information
    job_title = Column(
        String,
        nullable=False,
    )

    required_experience = Column(
        String,
        nullable=True,
    )

    required_skills = Column(
        Text,
        nullable=True,
    )

    required_qualification = Column(
        String,
        nullable=True,
    )

    location = Column(
        String,
        nullable=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    # Matching information
    total_candidates = Column(
        Integer,
        default=0,
    )

    top_candidate_id = Column(
        UUID(as_uuid=True),
        nullable=True,
    )

    top_candidate_name = Column(
        String,
        nullable=True,
    )

    top_match_score = Column(
        Float,
        nullable=True,
    )

    # Timestamp
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )