from sqlalchemy.orm import Session

from app.models.candidate import Candidate
from app.services.experience_calculator import (
    calculate_experience,
    calculate_career_gap
)


def create_candidate(
    db: Session,
    data: dict,
    resume_text: str,
    resume_file: str,
):
    # Check if candidate already exists
    existing_candidate = (
        db.query(Candidate)
        .filter(Candidate.email == data.get("email"))
        .first()
    )

    if existing_candidate:
        return None

    # ----------------------------------------
    # Calculate Experience using Python
    # ----------------------------------------
    print("========== EXPERIENCE DEBUG ==========")
    print("CANDIDATE:", data.get("name"))
    print("EXPERIENCE DATA:", data.get("experience", []))
    print("=====================================")
    
    experience_data = data.get(
        "experience",
        []
    )

    experience_result = calculate_experience(
        experience_data
    )

    career_gap = calculate_career_gap(
        experience_data
    )
    print(
        "CAREER GAP CALC DEBUG |",
        data.get("name"),
        "| Career Gap:",
        career_gap
    )

    candidate = Candidate(
        # Basic Details
        name=data.get("name"),
        email=data.get("email"),
        phone=data.get("phone"),

        # New Structured Fields
        location=data.get("location"),
        date_of_birth=data.get("date_of_birth"),

        highest_qualification=data.get("highest_qualification"),
        graduation_year=data.get("graduation_year"),

        years_of_experience=str(
            experience_result["years_of_experience"]
        ),

        internship_count=experience_result["internship_count"],

        experience_display=experience_result["experience_display"],

        career_gap=str(career_gap),

        # Resume Information
        skills=data.get("skills", []),
        tools=data.get("tools", []),
        education=data.get("education", []),
        experience=data.get("experience", []),
        projects=data.get("projects", []),
        certifications=data.get("certifications", []),

        summary=data.get("summary", ""),

        # Resume File
        resume_text=resume_text,
        resume_file=resume_file,
    )

    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    return candidate


def get_all_candidates(db: Session):
    return db.query(Candidate).all()