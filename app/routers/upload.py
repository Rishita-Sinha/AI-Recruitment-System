from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.crud.candidate_crud import create_candidate
from app.services.resume_parser import extract_resume_text
from app.services.gemini_parser import parse_resume_with_gemini

import os
import shutil

router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract resume text
    resume_text = extract_resume_text(file_path)

    # Parse using Gemini
    candidate_details = parse_resume_with_gemini(resume_text)

    # Save to PostgreSQL
    candidate = create_candidate(
        db=db,
        data=candidate_details,
        resume_text=resume_text,
        resume_file=file.filename
    )

    # Duplicate candidate
    if candidate is None:
        raise HTTPException(
            status_code=409,
            detail=f"Candidate with email {candidate_details.get('email')} already exists."
        )

    return {
        "message": "Resume uploaded successfully!",
        "candidate_id": str(candidate.id),
        "candidate": candidate_details
    }