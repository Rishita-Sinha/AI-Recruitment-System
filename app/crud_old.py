from sqlalchemy.orm import Session

from app.models.candidate import Candidate


def create_candidate(
    db: Session,
    full_name: str,
    email: str,
    phone: str = None,
    linkedin: str = None,
    github: str = None,
    location: str = None,
    experience_years: int = None,
    resume_path: str = None,
    resume_text: str = None,
):
    candidate = Candidate(
        full_name=full_name,
        email=email,
        phone=phone,
        linkedin=linkedin,
        github=github,
        location=location,
        experience_years=experience_years,
        resume_path=resume_path,
        resume_text=resume_text,
    )

    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    return candidate