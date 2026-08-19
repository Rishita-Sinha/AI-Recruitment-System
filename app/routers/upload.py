from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_recruiter
from app.models.recruiter import Recruiter
from app.crud.candidate_crud import create_candidate
from app.services.resume_parser import extract_resume_text
from app.services.gemini_parser import parse_resume_with_gemini

import os
import shutil


router = APIRouter(
    tags=["Resume Upload"]
)


UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# =========================================================
# Resume Upload
# =========================================================

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    recruiter: Recruiter = Depends(
        get_current_recruiter
    ),
):
    # =====================================================
    # Save uploaded file
    # =====================================================

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )


    # =====================================================
    # Extract resume text
    # =====================================================

    resume_text = extract_resume_text(
        file_path
    )


    print(
        "========== EXTRACTED RESUME TEXT =========="
    )

    print(
        resume_text[:5000]
    )

    print(
        "============================================"
    )


    # =====================================================
    # Parse resume
    # =====================================================

    candidate_details = parse_resume_with_gemini(
        resume_text
    )


    # =====================================================
    # Save candidate to PostgreSQL
    # =====================================================

    candidate = create_candidate(
        db=db,
        data=candidate_details,
        resume_text=resume_text,
        resume_file=file.filename
    )


    # =====================================================
    # Duplicate candidate
    # =====================================================

    if candidate is None:

        raise HTTPException(
            status_code=409,
            detail=(
                f"Candidate with email "
                f"{candidate_details.get('email')} "
                f"already exists."
            )
        )


    # =====================================================
    # Response
    # =====================================================

    return {
        "message": "Resume uploaded successfully!",
        "candidate_id": str(candidate.id),
        "candidate": candidate_details
    }