from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.dependencies import (
    get_db,
    get_current_recruiter,
)

from app.models.recruiter import Recruiter

from app.crud.candidate_crud import create_candidate

from app.services.resume_parser import (
    extract_resume_text,
)

from app.services.gemini_parser import (
    parse_resume_with_gemini,
)

import os
import shutil
import uuid


router = APIRouter(
    tags=["Resume Upload"]
)


UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# =========================================================
# Allowed File Extensions
# =========================================================

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
}


# =========================================================
# Helper Function
# =========================================================

def is_allowed_file(filename: str) -> bool:

    extension = os.path.splitext(
        filename
    )[1].lower()

    return extension in ALLOWED_EXTENSIONS


# =========================================================
# Single Resume Upload
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
    # Validate File
    # =====================================================

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid file type. "
                "Please upload PDF, DOC, or DOCX."
            )
        )

    # =====================================================
    # Create Unique Filename
    # =====================================================

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    unique_filename = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        unique_filename
    )

    # =====================================================
    # Save File
    # =====================================================

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    # =====================================================
    # Extract Resume Text
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
    # Parse Resume
    # =====================================================

    candidate_details = parse_resume_with_gemini(
        resume_text
    )

    # =====================================================
    # Save Candidate
    # =====================================================

    candidate = create_candidate(
        db=db,
        data=candidate_details,
        resume_text=resume_text,
        resume_file=unique_filename
    )

    # =====================================================
    # Duplicate Candidate
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
        "candidate": candidate_details,
    }


# =========================================================
# BATCH RESUME UPLOAD
# =========================================================

@router.post("/upload-resumes")
async def upload_resumes(
    files: list[UploadFile] = File(...),

    db: Session = Depends(get_db),

    recruiter: Recruiter = Depends(
        get_current_recruiter
    ),
):

    # =====================================================
    # Validate Number of Files
    # =====================================================

    if not files:

        raise HTTPException(
            status_code=400,
            detail="No resumes were uploaded."
        )

    if len(files) > 20:

        raise HTTPException(
            status_code=400,
            detail=(
                "Maximum 20 resumes can be "
                "uploaded at one time."
            )
        )

    # =====================================================
    # Result Lists
    # =====================================================

    successful_files = []
    failed_files = []

    # =====================================================
    # Process Each Resume
    # =====================================================

    for file in files:

        original_filename = (
            file.filename or "unknown"
        )

        file_path = None

        try:

            # =============================================
            # Validate File
            # =============================================

            if not file.filename:

                raise ValueError(
                    "File has no filename."
                )

            if not is_allowed_file(
                file.filename
            ):

                raise ValueError(
                    "Invalid file type. "
                    "Only PDF, DOC, and DOCX "
                    "files are supported."
                )

            # =============================================
            # Unique Filename
            # =============================================

            extension = os.path.splitext(
                file.filename
            )[1].lower()

            unique_filename = (
                f"{uuid.uuid4().hex}"
                f"{extension}"
            )

            file_path = os.path.join(
                UPLOAD_FOLDER,
                unique_filename
            )

            # =============================================
            # Save File
            # =============================================

            with open(
                file_path,
                "wb"
            ) as buffer:

                shutil.copyfileobj(
                    file.file,
                    buffer
                )

            # =============================================
            # Extract Text
            # =============================================

            resume_text = extract_resume_text(
                file_path
            )

            if not resume_text or not resume_text.strip():

                raise ValueError(
                    "Could not extract text from resume."
                )

            # =============================================
            # Parse Resume With Gemini
            # =============================================

            candidate_details = (
                parse_resume_with_gemini(
                    resume_text
                )
            )

            if not candidate_details:

                raise ValueError(
                    "AI parser returned no candidate details."
                )

            # =============================================
            # Save Candidate
            # =============================================

            candidate = create_candidate(
                db=db,
                data=candidate_details,
                resume_text=resume_text,
                resume_file=unique_filename
            )

            # =============================================
            # Duplicate Candidate
            # =============================================

            if candidate is None:

                failed_files.append({
                    "filename": original_filename,
                    "error": (
                        "Candidate already exists."
                    )
                })

                continue

            # =============================================
            # Successful
            # =============================================

            successful_files.append({
                "filename": original_filename,
                "candidate_id": str(
                    candidate.id
                ),
            })

        except Exception as e:

            print(
                f"ERROR PROCESSING "
                f"{original_filename}: {e}"
            )

            failed_files.append({
                "filename": original_filename,
                "error": str(e),
            })

            # =============================================
            # Remove Partially Saved File
            # =============================================

            if file_path and os.path.exists(
                file_path
            ):

                try:
                    os.remove(file_path)

                except Exception:
                    pass

            # =============================================
            # Continue With Next Resume
            # =============================================

            continue

    # =====================================================
    # Final Response
    # =====================================================

    return {
        "success": True,

        "total": len(files),

        "successful": len(
            successful_files
        ),

        "failed": len(
            failed_files
        ),

        "successful_files":
            successful_files,

        "failed_files":
            failed_files,
    }