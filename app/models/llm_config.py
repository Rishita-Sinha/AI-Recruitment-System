import uuid

from sqlalchemy import Column, String, Boolean, Float, Integer, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database import Base


class LLMConfig(Base):
    __tablename__ = "llm_configs"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    provider = Column(
        String,
        nullable=False
    )

    model = Column(
        String,
        nullable=False
    )

    api_key = Column(
        Text,
        nullable=True
    )

    base_url = Column(
        Text,
        nullable=True
    )

    temperature = Column(
        Float,
        default=0.2,
        nullable=False
    )

    max_tokens = Column(
        Integer,
        default=2048,
        nullable=False
    )

    is_active = Column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )