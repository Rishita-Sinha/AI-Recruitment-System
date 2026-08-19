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

Field Extraction Rules:

- Extract all information exactly as it appears in the resume.
- Do not guess or invent missing information.
- If a field is unavailable, return "" for strings and [] for lists.

Experience Rules:

- Extract every professional experience exactly as it appears in the resume.
- Include full-time jobs, internships, apprenticeships, trainee roles, research roles, contract roles, freelance work and part-time work.
- Do not omit any experience entry.
- Do not calculate the total years of experience.
- Do not calculate internship duration.
- Do not calculate career gap from experience.
- Do not infer missing dates.
- Preserve the original order of experiences from newest to oldest.

For every experience entry, you MUST include:

- title
- company
- employment_type
- location
- start_date
- end_date
- description
- achievements

employment_type must be ONLY one of:

- Full Time
- Internship
- Part Time
- Contract
- Freelance
- Research
- Trainee
- Apprenticeship

If it cannot be determined, return "".
Never omit the employment_type field.

Career Gap Rules:
- Calculate career_gap in years.
- Ignore normal education periods.
- Ignore vacation periods.
- If there is no career gap, return 0.

Education Rules:
- highest_qualification should contain only the highest completed or currently pursuing qualification.
- graduation_year should contain the expected or completed graduation year.
- college_name should contain the college or university name.
- cgpa should contain only the CGPA or percentage if available.

Skills Rules:

- Extract all technical, software, engineering, management, business, healthcare, finance, mechanical, civil, electrical, electronics and domain-specific skills into skills.
- Do not include soft skills inside skills.
- Remove duplicate skills.
- Keep the original skill names as written in the resume.

Soft Skills Rules:

- Extract communication, teamwork, leadership, critical thinking, adaptability, problem solving, time management, presentation skills and similar qualities into soft_skills.

Tools Rules:

- Extract all software, IDEs, frameworks, databases, cloud platforms, operating systems, libraries and development tools into tools.
- Examples: VS Code, AutoCAD, SolidWorks, Docker, Kubernetes, AWS, Azure, Git, GitHub, MySQL, PostgreSQL, MATLAB, TensorFlow, PyTorch, Excel.

Project Rules:

- Extract every project mentioned in the resume.
- Do not omit any project.
- Preserve the original order of projects as they appear in the resume.
- Do not invent project information.
- For every project, extract:
  - title
  - description
  - technologies

- "title" must contain the exact project name/title as written in the resume.
- "description" must contain the project description or details exactly as stated in the resume.
- "technologies" must contain the technologies, programming languages, frameworks, libraries, databases, platforms or tools explicitly associated with the project.
- If a project does not explicitly mention technologies, return [] for technologies.
- If a project has no description, return "" for description.
- Do not infer technologies from the project title or description.
- Do not add technologies simply because they are listed elsewhere in the resume.

Languages Rules:

- Extract spoken languages such as English, Hindi, Assamese, Bengali, etc.
- Do NOT include programming languages here.

Links:
- Extract GitHub URL if available.
- Extract LinkedIn URL if available.
- Extract Portfolio URL if available.

Return ONLY valid JSON.

Return this exact JSON schema:

{{
    "name": "",
    "email": "",
    "phone": "",

    "location": "",
    "date_of_birth": "",

    "highest_qualification": "",
    "graduation_year": "",
    "college_name": "",
    "cgpa": "",

    "current_designation": "",
    "current_company": "",

    "years_of_experience": 0,
    "career_gap": 0,

    "skills": [],
    "soft_skills": [],
    "tools": [],
    "languages": [],

    "experience": [
    {{
        "title": "",
        "company": "",
        "employment_type": "",
        "location": "",
        "start_date": "",
        "end_date": "",
        "description": [],
        "achievements": []
    }}
    ],
    "projects": [
    {{
        "title": "",
        "description": "",
        "technologies": []
    }}
    ],
    "certifications": [],
    "achievements": [],

    "linkedin": "",
    "github": "",
    "portfolio": "",

    "summary": ""
}}
Before generating the JSON:

1. Read the entire resume carefully.
2. Identify all sections such as Education, Experience, Skills, Projects, Certifications, Achievements, Languages and Contact Information.
3. Cross-check information from multiple sections before extracting values.
4. Never infer information that is not present.
5. If multiple values are found, choose the most appropriate one.
6. Normalize dates and qualification names whenever possible.
7. Return complete and accurate structured data.

Final Instructions:

- Double-check every extracted field before generating the response.
- Ensure every field in the JSON schema is present.
- If information is unavailable, use "" for string fields and [] for list fields.
- Do not omit any keys from the JSON.
- Return exactly one valid JSON object.
- Do not include explanations, comments, markdown or additional text.

The experience array MUST contain the employment_type field for every experience object.

Do not omit employment_type.

Return every experience object using the exact schema provided.

Resume Text:

------------------------
{resume_text}
------------------------
"""

    print("========== RESUME TEXT ==========")
    print(resume_text[:3000])
    print("================================")

    result = ask_llm(prompt).strip()

    print("========== GEMINI RESPONSE ==========")
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