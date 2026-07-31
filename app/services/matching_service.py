from sqlalchemy.orm import Session
from app.models.candidate import Candidate


def match_candidates(db: Session, job):
    """
    Match candidates against a job description.

    V1 Matching Criteria:
    - Skills Match (Primary)
    - Experience (Basic)
    """

    candidates = db.query(Candidate).all()

    ranked_candidates = []

    # Convert JD skills into a clean set
    required_skills = {
        skill.strip().lower()
        for skill in job.skills.split(",")
        if skill.strip()
    }

    for candidate in candidates:

        candidate_skills = candidate.skills or []

        # Convert candidate skills into lowercase set
        candidate_skill_set = {
            str(skill).strip().lower()
            for skill in candidate_skills
        }

        matched_skills = list(required_skills.intersection(candidate_skill_set))

        if len(required_skills) > 0:
            skill_score = (
                len(matched_skills) / len(required_skills)
            ) * 100
        else:
            skill_score = 0

        ranked_candidates.append({
            "id": str(candidate.id),
            "name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "match_score": round(skill_score, 2),
            "matched_skills": matched_skills,
            "candidate_skills": candidate.skills,
            "summary": candidate.summary,
            "experience": candidate.experience,
            "projects": candidate.projects,
            "resume_file": candidate.resume_file
        })

    ranked_candidates.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return ranked_candidates