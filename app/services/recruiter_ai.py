from app.services.llm_service import ask_llm


def ask_recruiter_ai(candidates: list, question: str):
    print("========== AI Recruiter Started ==========")

    candidate_context = ""

    for candidate in candidates:
        candidate_context += f"""
Candidate Name:
{candidate.get("name")}

Professional Summary:
{candidate.get("summary")}

Skills:
{candidate.get("skills")}

Experience:
{candidate.get("experience")}

Projects:
{candidate.get("projects")}

----------------------------------------
"""

    print("✅ Candidate context created")

    prompt = f"""
You are an expert AI Recruiter.

Below are the resumes of all available candidates.

{candidate_context}

Recruiter's Question:
{question}

Rules:
- Answer ONLY using the candidate information above.
- If the recruiter mentions a candidate name, answer only about that candidate.
- If the recruiter compares candidates, compare only using the provided data.
- If the information is unavailable, say:
  "Based on the available resume information, I cannot determine that."
- Never invent information.
- Keep the response concise and professional.
- Use bullet points whenever appropriate.
"""

    print("✅ Prompt created")
    print("Calling Gemini...")

    response = ask_llm(prompt)

    print("✅ Gemini returned successfully")
    print("========== AI Recruiter Finished ==========")

    return response