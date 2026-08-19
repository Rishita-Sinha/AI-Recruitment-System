from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_recruiter
from app.schemas.job import JobRequest
from app.services.matching_service import match_candidates
from app.models.job_match import JobMatch
from app.models.recruiter import Recruiter


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
)


@router.post("/match")
def match_job(
    job: JobRequest,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_recruiter),
):
    # =========================================================
    # Run candidate matching
    # =========================================================

    ranked_candidates = match_candidates(
        db,
        job,
    )


    # =========================================================
    # Get top candidate
    # =========================================================

    top_candidate = None

    if ranked_candidates:
        top_candidate = ranked_candidates[0]


    # =========================================================
    # Create job match history record
    # =========================================================

    job_match = JobMatch(
        recruiter_id=recruiter.id,

        job_title=job.title,
        required_experience=job.experience,
        required_skills=job.skills,
        required_qualification=job.qualification,
        location=job.location,
        description=job.description,

        total_candidates=len(ranked_candidates),

        top_candidate_id=(
            top_candidate["id"]
            if top_candidate
            else None
        ),

        top_candidate_name=(
            top_candidate["name"]
            if top_candidate
            else None
        ),

        top_match_score=(
            top_candidate["match_score"]
            if top_candidate
            else None
        ),
    )


    # =========================================================
    # Save match history
    # =========================================================

    db.add(job_match)
    db.commit()
    db.refresh(job_match)


    # =========================================================
    # Return ranking
    # =========================================================

    return {
        "success": True,

        "job": job.model_dump(),

        "total_candidates": len(
            ranked_candidates
        ),

        "ranked_candidates": ranked_candidates,

        "job_match_id": str(
            job_match.id
        ),
    }