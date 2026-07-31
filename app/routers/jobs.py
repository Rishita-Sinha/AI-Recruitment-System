from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.job import JobRequest
from app.services.matching_service import match_candidates

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
)


@router.post("/match")
def match_job(
    job: JobRequest,
    db: Session = Depends(get_db)
):
    ranked_candidates = match_candidates(db, job)

    return {
        "success": True,
        "job": job.model_dump(),
        "total_candidates": len(ranked_candidates),
        "ranked_candidates": ranked_candidates
    }