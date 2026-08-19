from datetime import datetime
from dateutil.relativedelta import relativedelta




def parse_date(date_string):
    """
    Convert date string into datetime object.
    Supports common resume date formats.
    """

    if not date_string:
        return None

    date_string = date_string.strip()

    if date_string.lower() in (
        "present",
        "current",
        "now",
        "till date",
        "till now",
        "ongoing",
    ):
        return datetime.today()

    # Normalize common month variations
    date_string = date_string.replace("Sept", "Sep")

    formats = [
        "%b %Y",          # Aug 2024
        "%B %Y",          # August 2024
        "%b-%Y",          # Aug-2024
        "%B-%Y",          # August-2024
        "%b/%Y",          # Aug/2024
        "%B/%Y",          # August/2024
        "%b %d, %Y",      # Dec 15, 2025
        "%B %d, %Y",      # December 15, 2025
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_string, fmt)
        except ValueError:
            continue

    return None


def calculate_experience(experience_list):
    """
    Calculates:
    - years_of_experience
    - internship_count
    - experience_display
    """

    total_months = 0
    internship_count = 0

    for exp in experience_list:

        employment_type = (
            exp.get("employment_type", "")
            .strip()
            .lower()
        )
        start = parse_date(exp.get("start_date"))
        end = parse_date(exp.get("end_date"))

        print(
            "EXPERIENCE CALC DEBUG |",
            exp.get("title"),
            "| Start:", start,
            "| End:", end,
            "| Type:", employment_type
        )

        # Count internships separately,
        # but INCLUDE them in total experience
        if employment_type == "internship":
            internship_count += 1

        

        if not start or not end:
            continue

        diff = relativedelta(end, start)

        months = diff.years * 12 + diff.months

        total_months += months

    years = round(total_months / 12, 1)

    if years > 0:
        experience_display = f"{years} Years"

    elif internship_count == 1:
        experience_display = "Fresher (1 Internship)"

    elif internship_count > 1:
        experience_display = f"Fresher ({internship_count} Internships)"

    else:
        experience_display = "Fresher"

    return {
        "years_of_experience": years,
        "internship_count": internship_count,
        "experience_display": experience_display,
    }
def calculate_career_gap(experience_list):
    """
    Calculate total career gap between professional experiences.

    Gaps are calculated only between experience entries.
    Time before the first job and after the last job is ignored.
    Overlapping experiences do not create a gap.
    """

    if not experience_list:
        return 0.0

    periods = []

    for exp in experience_list:

        start = parse_date(
            exp.get("start_date")
        )

        end = parse_date(
            exp.get("end_date")
        )

        if not start or not end:
            continue

        periods.append(
            (start, end)
        )

    if len(periods) < 2:
        return 0.0

    # Sort experiences from oldest to newest
    periods.sort(
        key=lambda x: x[0]
    )

    total_gap_months = 0

    for i in range(1, len(periods)):

        previous_end = periods[i - 1][1]
        current_start = periods[i][0]

        # No gap if experiences overlap
        # or directly connect.
        if current_start <= previous_end:
            continue

        gap = relativedelta(
            current_start,
            previous_end
        )

        gap_months = (
            gap.years * 12
            + gap.months
        )

        total_gap_months += gap_months

    return round(
        total_gap_months / 12,
        1
    )