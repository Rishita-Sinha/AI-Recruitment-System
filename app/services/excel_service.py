from openpyxl import Workbook
from io import BytesIO


def generate_candidate_excel(candidates):
    """
    Generate an Excel file containing candidate information.

    Columns:
    - Candidate Name
    - Location
    - Skills
    - Qualification
    """

    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "Candidates"

    # Header row
    worksheet.append([
        "Candidate Name",
        "Location",
        "Skills",
        "Qualification"
    ])

    # Candidate rows
    for candidate in candidates:

        # Convert skills JSON/list into readable text
        skills = candidate.skills or []

        if isinstance(skills, list):
            skills_text = ", ".join(
                str(skill) for skill in skills
            )
        else:
            skills_text = str(skills)

        worksheet.append([
            candidate.name or "",
            candidate.location or "",
            skills_text,
            candidate.highest_qualification or ""
        ])

    # Adjust column widths
    worksheet.column_dimensions["A"].width = 30
    worksheet.column_dimensions["B"].width = 25
    worksheet.column_dimensions["C"].width = 50
    worksheet.column_dimensions["D"].width = 30

    # Save workbook to memory
    excel_file = BytesIO()
    workbook.save(excel_file)
    excel_file.seek(0)

    return excel_file