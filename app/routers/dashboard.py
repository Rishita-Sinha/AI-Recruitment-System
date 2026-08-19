import re
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.dependencies import get_db, get_current_recruiter
from app.models.candidate import Candidate
from app.models.recruiter import Recruiter
from app.models.job_match import JobMatch


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


# =========================================================
# Experience Category Helper
# =========================================================

def get_experience_category(value):
    """
    Convert years of experience into a simple dashboard category.
    """

    if value is None:
        return "Fresher"

    value = str(value).strip()

    if not value:
        return "Fresher"

    # Try to find a numeric value
    match = re.search(
        r"\d+(?:\.\d+)?",
        value,
    )

    if not match:
        return "Fresher"

    try:
        years = float(match.group())
    except ValueError:
        return "Fresher"

    if years <= 0:
        return "Fresher"

    elif years <= 2:
        return "1–2 Years"

    elif years <= 5:
        return "3–5 Years"

    else:
        return "5+ Years"


# =========================================================
# Dashboard
# =========================================================

@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_recruiter),
):

    # =====================================================
    # Total Candidates
    # =====================================================

    total_candidates = (
        db.query(Candidate)
        .count()
    )


    # =====================================================
    # Uploaded Today
    # =====================================================

    uploaded_today = (
        db.query(Candidate)
        .filter(
            func.date(
                Candidate.created_at
            ) == date.today()
        )
        .count()
    )


    # =====================================================
    # Total Job Matches
    # =====================================================

    job_matches = (
        db.query(JobMatch)
        .filter(
            JobMatch.recruiter_id == recruiter.id
        )
        .count()
    )


    # =====================================================
    # Latest Job Matching
    # =====================================================

    latest_job_match = (
        db.query(JobMatch)
        .filter(
            JobMatch.recruiter_id == recruiter.id
        )
        .order_by(
            JobMatch.created_at.desc()
        )
        .first()
    )


    latest_job_matching = None

    if latest_job_match:

        latest_job_matching = {
            "id": str(
                latest_job_match.id
            ),

            "job_title":
                latest_job_match.job_title,

            "total_candidates":
                latest_job_match.total_candidates,

            "top_candidate_id": (
                str(
                    latest_job_match.top_candidate_id
                )
                if latest_job_match.top_candidate_id
                else None
            ),

            "top_candidate_name":
                latest_job_match.top_candidate_name,

            "top_match_score":
                latest_job_match.top_match_score,

            "created_at":
                latest_job_match.created_at,
        }


    # =====================================================
    # Candidate Experience Distribution
    # =====================================================

    experience_distribution = {
        "Fresher": 0,
        "1–2 Years": 0,
        "3–5 Years": 0,
        "5+ Years": 0,
    }


    candidates = (
        db.query(
            Candidate.years_of_experience
        )
        .all()
    )


    for candidate in candidates:

        category = get_experience_category(
            candidate.years_of_experience
        )

        experience_distribution[
            category
        ] += 1


    # =====================================================
    # Recent Activity
    # =====================================================
    # Kept in backend for possible future use,
    # but it is no longer displayed on the dashboard.

    recent_candidates = (
        db.query(Candidate)
        .order_by(
            Candidate.created_at.desc()
        )
        .limit(5)
        .all()
    )


    recent_activity = []

    for candidate in recent_candidates:

        recent_activity.append(
            {
                "title":
                    f"Resume uploaded: {candidate.name}",

                "time":
                    candidate.created_at,
            }
        )


    # =====================================================
    # Response
    # =====================================================

    return {

        # Main cards
        "total_candidates":
            total_candidates,

        "uploaded_today":
            uploaded_today,

        "job_matches":
            job_matches,


        # Latest job matching
        "latest_job_matching":
            latest_job_matching,


        # Experience distribution
        "experience_distribution":
            experience_distribution,


        # Recruiter
        "recruiter": {
            "id":
                str(recruiter.id),

            "full_name":
                recruiter.full_name,

            "email":
                recruiter.email,
        },


        # Kept for backward compatibility
        "recent_activity":
            recent_activity,
    }