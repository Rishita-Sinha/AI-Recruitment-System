from sqlalchemy.orm import Session

from app.models.candidate import Candidate


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

    candidate = Candidate(
        name=data.get("name"),
        email=data.get("email"),
        phone=data.get("phone"),
        skills=data.get("skills", []),
        education=data.get("education", []),
        experience=data.get("experience", []),
        projects=data.get("projects", []),
        certifications=data.get("certifications", []),
        summary=data.get("summary", ""),
        resume_text=resume_text,
        resume_file=resume_file,
    )

    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    return candidate


def get_all_candidates(db: Session):
    return db.query(Candidate).all()