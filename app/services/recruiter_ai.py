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
You are an expert AI Recruiter Assistant.

You have access to the complete candidate database provided below.

================ CANDIDATE DATABASE ================

{candidate_context}

=====================================================

Recruiter's Question:
{question}

================ INSTRUCTIONS =======================

1. USE THE CANDIDATE DATABASE
- Treat the candidate information above as your complete source of truth.
- Answer questions using only the information provided.
- Never invent candidate information.

2. SINGLE CANDIDATE QUESTIONS
- If the recruiter mentions a specific candidate name, answer about that candidate.
- If the recruiter asks for a candidate's skills, experience, projects, summary, or background, use the corresponding candidate information.

3. COMPARING CANDIDATES

- If the recruiter asks to compare candidates WITHOUT providing names,
  automatically select the requested number of relevant candidates from
  the candidate database.

- For example:
  "Compare 2 candidates" → select 2 relevant candidates.
  "Compare 3 candidates" → select 3 relevant candidates.
  "Compare 5 candidates" → select 5 relevant candidates.

- If the recruiter says "compare candidates" without specifying a number,
  select the most relevant candidates available based on their skills,
  experience, projects, and overall profile.

- If specific candidate names are provided, compare ONLY those candidates.

- NEVER ask the recruiter for candidate names when the recruiter has
  explicitly asked the AI to select candidates automatically.

- When automatically selecting candidates, briefly explain why they
  were selected.

- IMPORTANT: Do NOT use a side-by-side comparison table.

- Each candidate MUST be presented in their own clearly separated section.

- For EACH candidate, use this exact structure:

  ### Candidate 1 — [Candidate Name]

  **Professional Summary**
  [Candidate's professional summary]

  **Experience**
  [Candidate's experience]

  **Skills**
  [Candidate's skills]

  **Strengths**
  [Candidate's strengths based only on the provided information]

  **Projects**
  [Candidate's projects]

  **Overall Suitability**
  [Explain the candidate's suitability based only on the available
  candidate information.]

- Then present the second candidate separately:

  ### Candidate 2 — [Candidate Name]

  **Professional Summary**
  ...

  **Experience**
  ...

  **Skills**
  ...

  **Strengths**
  ...

  **Projects**
  ...

  **Overall Suitability**
  ...

- For 3 candidates, continue with:

  ### Candidate 3 — [Candidate Name]

- For 4 candidates, continue with Candidate 4, and so on.

- NEVER mix the information of different candidates inside the same
  section.

- Keep every candidate's information grouped together.

- After ALL candidate sections, ALWAYS provide:

  ### Summary of Comparison

  Compare the candidates based on:

  **Experience**
  - Explain the important differences in experience.

  **Skills**
  - Explain the important differences in technical and professional skills.

  **Projects**
  - Explain relevant project differences.

  **Strengths**
  - Explain the major strengths of each candidate.

  **Overall Suitability**
  - Explain which candidate appears stronger based on the available
    information.

  **Recommendation**
  - Recommend the most suitable candidate only when the available
    information supports a clear recommendation.
  - Explain the reasoning.
  - If candidates are similarly qualified, clearly state that instead
    of forcing a winner.

- If the recruiter specifies a job or role, evaluate suitability
  specifically for that role.

- If fewer candidates are available than requested, compare all available
  candidates and clearly mention that fewer candidates were available.

4. RANKING AND RECOMMENDATIONS
- If the recruiter asks:
  "Who is the best candidate?"
  "Who should I interview first?"
  "Who has the strongest technical skills?"
  "Who is most suitable?"
  evaluate the available candidates using ONLY the provided candidate information.
- Explain the reasoning using skills, experience, and projects found in the database.
- Do not invent missing qualifications.

5. NUMBER OF CANDIDATES
- If the recruiter specifies a number, respect that number whenever enough candidates are available.
- If fewer candidates are available than requested, compare all available candidates and clearly mention that fewer candidates were available.

6. MISSING INFORMATION
- If the requested information is not present in the candidate database, say:
  "Based on the available resume information, I cannot determine that."

7. PROFESSIONAL RESPONSE

- Keep responses professional and informative.
- Keep each candidate's information in a separate section.
- Do not mix information between candidates.
- Use clear headings and bullet points where appropriate.
- Always provide a "Summary of Comparison" after all candidate sections.
- Do not unnecessarily repeat the same information in the summary.

8. NO HALLUCINATION
- Never create skills, experience, projects, qualifications, or other information that is not present in the candidate database.

=====================================================

Now answer the recruiter's question.
"""

    print("✅ Prompt created")
    print("Calling Gemini...")

    response = ask_llm(prompt)

    print("✅ Gemini returned successfully")
    print("========== AI Recruiter Finished ==========")

    return response