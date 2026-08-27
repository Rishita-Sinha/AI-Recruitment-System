from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_recruiter
from app.models.llm_config import LLMConfig
from app.models.recruiter import Recruiter
from app.schemas.llm import (
    LLMConfigCreate,
    LLMConfigResponse,
)
from app.utils.encryption import encrypt_api_key


router = APIRouter(
    prefix="/llm",
    tags=["LLM Configuration"],
)


# =========================================================
# Get all LLM configurations
# =========================================================

@router.get(
    "/configs",
    response_model=list[LLMConfigResponse],
)
def get_llm_configs(
    db: Session = Depends(get_db),
    current_recruiter: Recruiter = Depends(get_current_recruiter),
):
    return (
        db.query(LLMConfig)
        .order_by(LLMConfig.created_at.desc())
        .all()
    )


# =========================================================
# Create LLM configuration
# =========================================================

@router.post(
    "/configs",
    response_model=LLMConfigResponse,
)
def create_llm_config(
    config: LLMConfigCreate,
    db: Session = Depends(get_db),
    current_recruiter: Recruiter = Depends(get_current_recruiter),
):
    llm_config = LLMConfig(
        provider=config.provider.lower(),
        model=config.model,
        api_key=encrypt_api_key(config.api_key),
        base_url=config.base_url,
        temperature=config.temperature,
        max_tokens=config.max_tokens,
        is_active=False,
    )

    db.add(llm_config)
    db.commit()
    db.refresh(llm_config)

    return llm_config


# =========================================================
# Activate an LLM configuration
# =========================================================

@router.put(
    "/configs/{config_id}/activate",
    response_model=LLMConfigResponse,
)
def activate_llm_config(
    config_id: str,
    db: Session = Depends(get_db),
    current_recruiter: Recruiter = Depends(get_current_recruiter),
):
    config = (
        db.query(LLMConfig)
        .filter(LLMConfig.id == config_id)
        .first()
    )

    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="LLM configuration not found",
        )

    # Deactivate all existing configurations
    db.query(LLMConfig).update(
        {
            LLMConfig.is_active: False
        }
    )

    # Activate selected configuration
    config.is_active = True

    db.commit()
    db.refresh(config)

    return config