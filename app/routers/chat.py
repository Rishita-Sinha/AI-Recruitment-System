from fastapi import APIRouter
from pydantic import BaseModel
import traceback

from app.database import SessionLocal
from app.crud.candidate_crud import get_all_candidates
from app.services.recruiter_ai import ask_recruiter_ai

router = APIRouter(
    prefix="/chat",
    tags=["AI Recruiter"],
)


class ChatRequest(BaseModel):
    question: str


@router.post("/")
def recruiter_chat(request: ChatRequest):
    db = SessionLocal()

    try:
        candidates = get_all_candidates(db)

        candidate_list = []

        for candidate in candidates:
            candidate_list.append(
                {
                    "name": candidate.name,
                    "summary": candidate.summary,
                    "skills": candidate.skills,
                    "experience": candidate.experience,
                    "projects": candidate.projects,
                }
            )

        answer = ask_recruiter_ai(
            candidates=candidate_list,
            question=request.question,
        )

        return {
            "response": answer
        }

    except Exception:
        traceback.print_exc()
        raise

    finally:
        db.close()