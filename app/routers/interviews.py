from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
import secrets

from app.dependencies import get_db, get_current_recruiter
from app.models.interview import Interview
from app.models.interview_answer import InterviewAnswer
from app.models.candidate import Candidate
from app.models.job_match import JobMatch
from app.models.recruiter import Recruiter


router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"],
)


class InterviewAnswerRequest(BaseModel):
    answer: str


# =========================================================
# Create Interview Link
# =========================================================

@router.post("/create")
def create_interview(
    candidate_id: str,
    job_match_id: str,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_recruiter),
):

    # -----------------------------------------------------
    # Check candidate
    # -----------------------------------------------------

    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found",
        )

    # -----------------------------------------------------
    # Check Job Description / Job Match
    # -----------------------------------------------------

    job_match = (
        db.query(JobMatch)
        .filter(JobMatch.id == job_match_id)
        .first()
    )

    if not job_match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found",
        )

    # -----------------------------------------------------
    # Generate secure unique token
    # -----------------------------------------------------

    token = secrets.token_urlsafe(32)

    # -----------------------------------------------------
    # Create interview
    # -----------------------------------------------------

    interview = Interview(
        candidate_id=candidate.id,
        job_match_id=job_match.id,
        token=token,
        status="pending",
        current_question="1",
    )

    db.add(interview)
    db.commit()
    db.refresh(interview)

    # -----------------------------------------------------
    # Return interview information
    # -----------------------------------------------------

    return {
        "success": True,
        "interview_id": str(interview.id),
        "candidate_id": str(candidate.id),
        "candidate_name": candidate.name,
        "job_title": job_match.job_title,
        "token": interview.token,
        "status": interview.status,
    }


# =========================================================
# Get Interview by Public Token
# =========================================================

@router.get("/{token}")
def get_interview_by_token(
    token: str,
    db: Session = Depends(get_db),
):

    interview = (
        db.query(Interview)
        .filter(Interview.token == token)
        .first()
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )

    # -----------------------------------------------------
    # Get candidate
    # -----------------------------------------------------

    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == interview.candidate_id)
        .first()
    )

    # -----------------------------------------------------
    # Get job description
    # -----------------------------------------------------

    job_match = (
        db.query(JobMatch)
        .filter(JobMatch.id == interview.job_match_id)
        .first()
    )

    if not candidate or not job_match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview information is incomplete",
        )

    return {
        "success": True,
        "interview_id": str(interview.id),
        "candidate_name": candidate.name,
        "job_title": job_match.job_title,
        "status": interview.status,
        "current_question": int(interview.current_question),
    }


# =========================================================
# Start Interview
# =========================================================

@router.post("/{token}/start")
def start_interview(
    token: str,
    db: Session = Depends(get_db),
):

    interview = (
        db.query(Interview)
        .filter(Interview.token == token)
        .first()
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )

    # -----------------------------------------------------
    # Prevent restarting completed interview
    # -----------------------------------------------------

    if interview.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview has already been completed",
        )

    # -----------------------------------------------------
    # Import questions
    # -----------------------------------------------------

    from app.services.interview_questions import (
        INTERVIEW_QUESTIONS
    )

    # -----------------------------------------------------
    # Start interview
    # -----------------------------------------------------

    interview.status = "in_progress"
    interview.current_question = "1"

    from datetime import datetime, timezone

    interview.started_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(interview)

    # -----------------------------------------------------
    # Get candidate
    # -----------------------------------------------------

    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == interview.candidate_id)
        .first()
    )

    # -----------------------------------------------------
    # Get job
    # -----------------------------------------------------

    job_match = (
        db.query(JobMatch)
        .filter(JobMatch.id == interview.job_match_id)
        .first()
    )

    return {
        "success": True,
        "interview_id": str(interview.id),
        "candidate_name": (
            candidate.name if candidate else "Candidate"
        ),
        "job_title": (
            job_match.job_title if job_match else "Position"
        ),
        "status": interview.status,
        "question_number": 1,
        "question": INTERVIEW_QUESTIONS[0],
    }


# =========================================================
# Submit Interview Answer
# =========================================================

@router.post("/{token}/answer")
def submit_interview_answer(
    token: str,
    request: InterviewAnswerRequest,
    db: Session = Depends(get_db),
):

    # -----------------------------------------------------
    # Find interview
    # -----------------------------------------------------

    interview = (
        db.query(Interview)
        .filter(Interview.token == token)
        .first()
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )

    # -----------------------------------------------------
    # Check interview status
    # -----------------------------------------------------

    if interview.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview is not currently in progress",
        )

    # -----------------------------------------------------
    # Validate answer
    # -----------------------------------------------------

    if not request.answer.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Answer cannot be empty",
        )

    # -----------------------------------------------------
    # Get current question number
    # -----------------------------------------------------

    current_question_number = int(
        interview.current_question
    )

    from app.services.interview_questions import (
        INTERVIEW_QUESTIONS
    )

    # -----------------------------------------------------
    # Validate question number
    # -----------------------------------------------------

    if (
        current_question_number < 1
        or current_question_number > len(INTERVIEW_QUESTIONS)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid interview question number",
        )

    # -----------------------------------------------------
    # Save candidate answer
    # -----------------------------------------------------

    answer = InterviewAnswer(
        interview_id=interview.id,
        question_number=current_question_number,
        question=INTERVIEW_QUESTIONS[
            current_question_number - 1
        ],
        answer=request.answer.strip(),
    )

    db.add(answer)

    # -----------------------------------------------------
    # Determine next question
    # -----------------------------------------------------

    next_question_number = (
        current_question_number + 1
    )

    # -----------------------------------------------------
    # More questions remaining
    # -----------------------------------------------------

    if next_question_number <= len(INTERVIEW_QUESTIONS):

        interview.current_question = str(
            next_question_number
        )

        db.commit()
        db.refresh(interview)

        return {
            "success": True,
            "completed": False,
            "question_number": next_question_number,
            "question": INTERVIEW_QUESTIONS[
                next_question_number - 1
            ],
        }

    # =====================================================
    # Interview completed
    # =====================================================

    from datetime import datetime, timezone

    interview.status = "completed"
    interview.completed_at = datetime.now(timezone.utc)

    # -----------------------------------------------------
    # Commit first so the final answer is saved
    # -----------------------------------------------------

    db.commit()
    db.refresh(interview)

    # -----------------------------------------------------
    # Get candidate
    # -----------------------------------------------------

    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == interview.candidate_id)
        .first()
    )

    # -----------------------------------------------------
    # Get job
    # -----------------------------------------------------

    job_match = (
        db.query(JobMatch)
        .filter(JobMatch.id == interview.job_match_id)
        .first()
    )

    # -----------------------------------------------------
    # Get all interview answers
    # -----------------------------------------------------

    answers = (
        db.query(InterviewAnswer)
        .filter(
            InterviewAnswer.interview_id == interview.id
        )
        .order_by(
            InterviewAnswer.question_number.asc()
        )
        .all()
    )

    # -----------------------------------------------------
    # Generate AI interview summary
    # -----------------------------------------------------

    try:

        from app.services.interview_summary import (
            generate_interview_summary
        )

        interview.summary = generate_interview_summary(
            candidate_name=(
                candidate.name
                if candidate
                else "Candidate"
            ),
            job_title=(
                job_match.job_title
                if job_match
                else "Position"
            ),
            answers=answers,
        )

    except Exception as exc:

        print(
            f"Interview summary generation failed: {exc}"
        )

        interview.summary = (
            "Interview completed successfully, "
            "but the AI summary could not be generated. "
            "Please review the candidate answers."
        )

    # -----------------------------------------------------
    # Save generated summary
    # -----------------------------------------------------

    db.commit()
    db.refresh(interview)

    return {
        "success": True,
        "completed": True,
        "message": "Interview completed successfully.",
        "summary_available": bool(interview.summary),
    }


# =========================================================
# Get Interview Results for Recruiter
# =========================================================

@router.get("/{interview_id}/results")
def get_interview_results(
    interview_id: str,
    db: Session = Depends(get_db),
    recruiter: Recruiter = Depends(get_current_recruiter),
):

    # -----------------------------------------------------
    # Find interview
    # -----------------------------------------------------

    interview = (
        db.query(Interview)
        .filter(Interview.id == interview_id)
        .first()
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )

    # -----------------------------------------------------
    # Get candidate
    # -----------------------------------------------------

    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == interview.candidate_id)
        .first()
    )

    # -----------------------------------------------------
    # Get job
    # -----------------------------------------------------

    job_match = (
        db.query(JobMatch)
        .filter(JobMatch.id == interview.job_match_id)
        .first()
    )

    # -----------------------------------------------------
    # Get answers
    # -----------------------------------------------------

    answers = (
        db.query(InterviewAnswer)
        .filter(
            InterviewAnswer.interview_id == interview.id
        )
        .order_by(
            InterviewAnswer.question_number.asc()
        )
        .all()
    )

    # -----------------------------------------------------
    # Return complete interview results
    # -----------------------------------------------------

    return {
        "success": True,

        "interview": {
            "id": str(interview.id),
            "status": interview.status,
            "summary": interview.summary,
            "started_at": interview.started_at,
            "completed_at": interview.completed_at,
            "created_at": interview.created_at,
        },

        "candidate": {
            "id": (
                str(candidate.id)
                if candidate
                else None
            ),
            "name": (
                candidate.name
                if candidate
                else None
            ),
            "email": (
                candidate.email
                if candidate
                else None
            ),
        },

        "job": {
            "id": (
                str(job_match.id)
                if job_match
                else None
            ),
            "title": (
                job_match.job_title
                if job_match
                else None
            ),
        },

        "answers": [
            {
                "question_number": item.question_number,
                "question": item.question,
                "answer": item.answer,
                "created_at": item.created_at,
            }
            for item in answers
        ],
    }