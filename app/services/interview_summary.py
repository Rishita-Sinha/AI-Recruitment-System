from app.services.llm_service import ask_llm


def generate_interview_summary(
    candidate_name: str,
    job_title: str,
    answers: list,
) -> str:
    answer_text = ""

    for item in answers:
        answer_text += f"""
Question {item.question_number}:
{item.question}

Candidate Answer:
{item.answer}

----------------------------------------
"""

    prompt = f"""
You are an expert recruitment assistant.

Analyze the following candidate interview.

Candidate Name:
{candidate_name}

Job Title:
{job_title}

Interview Questions and Answers:
{answer_text}

Create a professional interview evaluation.

Include:

### Interview Summary
Give a concise overall summary of the candidate.

### Key Strengths
Mention the candidate's important strengths based ONLY on their answers.

### Key Concerns
Mention weaknesses, concerns, or missing information.

### Skills and Experience
Summarize relevant skills and experience demonstrated during the interview.

### Overall Assessment
Give an overall assessment of the candidate's suitability for the role.

### Recommendation
Provide one of:
- Strongly Recommended
- Recommended
- Consider
- Not Recommended

Explain the reasoning briefly.

IMPORTANT:
- Use ONLY the information provided in the interview answers.
- Do not invent qualifications or experience.
- Do not assume information that the candidate did not provide.
"""

    return ask_llm(prompt).strip()
