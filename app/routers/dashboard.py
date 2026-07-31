from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.dependencies import get_db
from app.models.candidate import Candidate

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def get_dashboard(db: Session = Depends(get_db)):
    # Total candidates
    total_candidates = db.query(Candidate).count()

    # Uploaded today
    uploaded_today = (
        db.query(Candidate)
        .filter(func.date(Candidate.created_at) == date.today())
        .count()
    )

    # Latest 5 candidates
    recent_candidates = (
        db.query(Candidate)
        .order_by(Candidate.created_at.desc())
        
        .all()
    )

    candidate_list = []

    for c in recent_candidates:
        candidate_list.append(
            {
                "id": str(c.id),
                "name": c.name,
                "skills": c.skills,
                "experience": c.experience,
                "created_at": c.created_at,
            }
        )

    # Recent activity
    recent_activity = []

    for c in recent_candidates:
        recent_activity.append(
            {
                "title": f"Resume uploaded: {c.name}",
                "time": c.created_at,
            }
        )

    return {
        "total_candidates": total_candidates,
        "uploaded_today": uploaded_today,
        "recent_candidates": candidate_list,
        "recent_activity": recent_activity,
    }