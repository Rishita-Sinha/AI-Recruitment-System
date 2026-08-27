from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class LLMConfigCreate(BaseModel):
    provider: str = Field(..., min_length=1)
    model: str = Field(..., min_length=1)
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    temperature: float = Field(default=0.2, ge=0.0, le=2.0)
    max_tokens: int = Field(default=2048, gt=0)


class LLMConfigResponse(BaseModel):
    id: UUID
    provider: str
    model: str
    base_url: Optional[str] = None
    temperature: float
    max_tokens: int
    is_active: bool

    class Config:
        from_attributes = True