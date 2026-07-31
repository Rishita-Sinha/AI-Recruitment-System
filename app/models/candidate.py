from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    phone = Column(String, nullable=True)

    skills = Column(JSONB, nullable=True)
    education = Column(JSONB, nullable=True)
    experience = Column(JSONB, nullable=True)
    projects = Column(JSONB, nullable=True)
    certifications = Column(JSONB, nullable=True)

    summary = Column(Text, nullable=True)

    resume_text = Column(Text, nullable=False)
    resume_file = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())