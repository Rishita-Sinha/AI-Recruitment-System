from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_recruiter
from app.models.candidate import Candidate
from app.models.recruiter import Recruiter


router = APIRouter(
    tags=["Candidates"]
)


# =========================================================
# Get All Candidates
# =========================================================

@router.get("/candidates")
def get_candidates(
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_recruiter),
):
    return db.query(Candidate).all()


# =========================================================
# Get Single Candidate
# =========================================================

@router.get("/candidates/{candidate_id}")
def get_candidate(
    candidate_id: str,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_recruiter),
):
    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    return candidate


# =========================================================
# Update Candidate
# =========================================================

@router.put("/candidates/{candidate_id}")
def update_candidate(
    candidate_id: str,
    updated_data: dict = Body(...),
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_recruiter),
):
    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    for key, value in updated_data.items():
        if hasattr(candidate, key):
            setattr(candidate, key, value)

    db.commit()
    db.refresh(candidate)

    return candidate


# =========================================================
# Delete Candidate
# =========================================================

@router.delete("/candidates/{candidate_id}")
def delete_candidate(
    candidate_id: str,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_recruiter),
):
    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    db.delete(candidate)
    db.commit()

    return {
        "message": "Candidate deleted successfully"
    }