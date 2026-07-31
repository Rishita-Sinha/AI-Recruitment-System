import json

from app.services.llm_service import ask_llm


def parse_resume_with_gemini(resume_text: str):
    prompt = f"""
You are an expert Resume Parsing AI.

Your task is to extract structured information from the resume.

STRICT RULES:
- Return ONLY valid JSON.
- Do NOT explain anything.
- Do NOT write markdown.
- Do NOT write ```json.
- Do NOT write any text before the JSON.
- Do NOT write any text after the JSON.
- If a field is unavailable, use "" or [].
- Your response MUST start with {{ and end with }}.

Return this exact JSON schema:

{{
    "name": "",
    "email": "",
    "phone": "",
    "skills": [],
    "education": [],
    "experience": [],
    "projects": [],
    "certifications": [],
    "summary": ""
}}

Resume Text:

------------------------
{resume_text}
------------------------
"""

    print("========== RESUME TEXT ==========")
    print(resume_text[:3000])
    print("================================")

    result = ask_llm(prompt).strip()

    print("========== OLLAMA RESPONSE ==========")
    print(result)
    print("=====================================")

    # Remove markdown if returned
    if result.startswith("```"):
        result = (
            result.replace("```json", "")
            .replace("```", "")
            .strip()
        )

    return json.loads(result)