from sqlalchemy.orm import Session
from app.models.candidate import Candidate
from app.services.semantic_service import calculate_semantic_similarity

import re


# -------------------------------------------------
# Matching Configuration
# -------------------------------------------------
# Technical skill relevance is intentionally the largest
# component of the final score. Other factors support the
# decision but should not overpower a weak skill match.
MATCH_WEIGHTS = {
    "skills": 40,
    "experience": 15,
    "semantic": 15,
    "qualification": 10,
    "projects": 10,
    "location": 5,
    "career_gap": 5,
}

# -------------------------------------------------
# Skill Coverage Ranking Safeguards
# -------------------------------------------------
# Skill coverage is calculated as:
#
# matched required skills / total required skills
#
# Candidates with weak technical coverage receive
# a graduated ranking penalty.
#
# 0% - 19.99%   -> 25% penalty
# 20% - 39.99%  -> 10% penalty
# 40%+          -> no penalty

VERY_LOW_SKILL_THRESHOLD = 20.0
VERY_LOW_SKILL_PENALTY = 0.75

LOW_SKILL_THRESHOLD = 40.0
LOW_SKILL_PENALTY = 0.90


# -------------------------------------------------
# Helper Functions
# -------------------------------------------------

def normalize_text(text):
    """
    Convert text into lowercase for comparison.
    """

    if not text:
        return ""

    return str(text).strip().lower()


def extract_number(value):
    """
    Extract first numeric value.

    Examples

    3+ Years -> 3

    2 Years -> 2

    1.5 Years -> 1.5
    """

    if value is None:
        return 0

    match = re.search(r"\d+(\.\d+)?", str(value))

    if match:
        return float(match.group())

    return 0

def build_candidate_semantic_text(candidate):
    """
    Build a single text representation of the candidate
    for semantic similarity comparison.

    Uses:
    - Candidate summary
    - Experience descriptions
    - Project descriptions
    """

    parts = []

    # Candidate summary
    if candidate.summary:
        parts.append(str(candidate.summary))

    # Experience
    for experience in (candidate.experience or []):
        if isinstance(experience, dict):
            title = experience.get("title", "")
            company = experience.get("company", "")
            description = experience.get("description", "")

            parts.append(
                f"{title} at {company}. {description}"
            )
        else:
            parts.append(str(experience))

    # Projects
    for project in (candidate.projects or []):
        if isinstance(project, dict):
            title = project.get("title", "")
            description = project.get("description", "")
            technologies = project.get("technologies", "")

            parts.append(
                f"{title}. {description}. Technologies: {technologies}"
            )
        else:
            parts.append(str(project))

    return " ".join(parts)
def build_job_semantic_text(job):
    """
    Build a complete text representation of the Job Description
    for semantic similarity comparison.
    """

    parts = []

    if job.title:
        parts.append(f"Job Title: {job.title}")

    if job.experience:
        parts.append(f"Required Experience: {job.experience}")

    if job.skills:
        parts.append(f"Required Skills: {job.skills}")

    if job.qualification:
        parts.append(
            f"Required Qualification: {job.qualification}"
        )

    if job.location:
        parts.append(
            f"Preferred Location: {job.location}"
        )

    if job.description:
        parts.append(
            f"Job Description: {job.description}"
        )

    return " ".join(parts)


# -------------------------------------------------
# Skills Score
# -------------------------------------------------

def normalize_skill(skill):
    """
    Normalize common variations of technical skills
    so that equivalent names can be matched.
    """

    if not skill:
        return ""

    skill = str(skill).strip().lower()

    # Remove common punctuation/spacing variations
    skill = skill.replace("’", "'")
    skill = skill.replace(".", "")
    skill = skill.replace("-", " ")

    # Common skill aliases
    aliases = {
        "reactjs": "react",
        "react js": "react",
        "react": "react",

        "nodejs": "node",
        "node js": "node",

        "postgres": "postgresql",
        "postgresql db": "postgresql",
        "postgresql database": "postgresql",

        "mysql db": "mysql",
        "mysql database": "mysql",

        "rest api": "rest api",
        "rest apis": "rest api",
        "restful api": "rest api",
        "restful apis": "rest api",
        "rest api development": "rest api",

        "fast api": "fastapi",
        "fastapi framework": "fastapi",

        "docker container": "docker",
        "docker containers": "docker",

        "git version control": "git",
        "git scm": "git",

        "javascript": "javascript",
        "java script": "javascript",

        "typescript": "typescript",
        "type script": "typescript",

        "c plus plus": "c++",
        "cpp": "c++",

        "data structures": "data structures and algorithms",
        "data structure": "data structures and algorithms",
        "dsa": "data structures and algorithms",
    }

    return aliases.get(skill, skill)

def skill_phrase_matches(required_skill, candidate_skill):
    """
    Check whether two skill phrases represent the same skill.

    Uses:
    1. Exact normalized matching
    2. Complete-word phrase matching
    3. Controlled skill aliases

    Does NOT use broad substring or semantic matching,
    to avoid false-positive skill matches.
    """

    required = required_skill.lower().strip()
    candidate = candidate_skill.lower().strip()

    if not required or not candidate:
        return False

    # -------------------------------------------------
    # 1. Exact match
    # -------------------------------------------------

    if required == candidate:
        return True

    # -------------------------------------------------
    # 2. Complete-word matching
    # -------------------------------------------------

    required_words = set(
        re.findall(
            r"\b[a-zA-Z0-9+#.]+\b",
            required
        )
    )

    candidate_words = set(
        re.findall(
            r"\b[a-zA-Z0-9+#.]+\b",
            candidate
        )
    )

    if not required_words or not candidate_words:
        return False

    # Required phrase contained in candidate phrase
    if required_words.issubset(candidate_words):
        return True

    # Candidate phrase contained in required phrase
    if candidate_words.issubset(required_words):
        return True

    # -------------------------------------------------
    # 3. Controlled skill aliases
    # -------------------------------------------------

    skill_aliases = {

        # -------------------------
        # Programming Languages
        # -------------------------

        "python": {
            "python",
            "python programming",
            "python development",
            "python developer",
            "python scripting",
            "python programming language",
        },

        "javascript": {
            "javascript",
            "js",
            "javascript programming",
            "javascript development",
        },

        "typescript": {
            "typescript",
            "ts",
        },

        # -------------------------
        # Frontend
        # -------------------------

        "react": {
            "react",
            "react.js",
            "reactjs",
            "react js",
            "react development",
            "react frontend",
        },

        "angular": {
            "angular",
            "angular.js",
            "angularjs",
            "angular framework",
        },

        "vue": {
            "vue",
            "vue.js",
            "vuejs",
            "vue js",
        },

        # -------------------------
        # Backend / APIs
        # -------------------------

        "fastapi": {
            "fastapi",
            "fast api",
            "fastapi framework",
            "fastapi development",
        },

        "rest apis": {
            "rest api",
            "rest apis",
            "restful api",
            "restful apis",
            "rest api development",
            "rest api development",
            "restful web services",
        },

        # -------------------------
        # Databases
        # -------------------------

        "sql": {
            "sql",
            "sql programming",
            "sql database",
            "structured query language",
        },

        "postgresql": {
            "postgresql",
            "postgres",
            "postgres db",
            "postgresql database",
            "postgres database",
        },

        "mysql": {
            "mysql",
            "mysql database",
        },

        "mongodb": {
            "mongodb",
            "mongo",
            "mongo db",
            "mongodb database",
        },

        # -------------------------
        # Version Control
        # -------------------------

        "git": {
            "git",
            "git version control",
            "git vcs",
            "version control with git",
        },

        # -------------------------
        # Containers
        # -------------------------

        "docker": {
            "docker",
            "docker containers",
            "docker containerization",
            "dockerized applications",
        },

        # -------------------------
        # Cloud
        # -------------------------

        "aws": {
            "aws",
            "amazon web services",
            "amazon aws",
        },

        "azure": {
            "azure",
            "microsoft azure",
        },

        "gcp": {
            "gcp",
            "google cloud",
            "google cloud platform",
        },
    }

    # -------------------------------------------------
    # Normalize aliases
    # -------------------------------------------------

    def normalize_alias(value):
        return re.sub(
            r"[^a-z0-9+#]+",
            " ",
            value.lower()
        ).strip()

    required_normalized = normalize_alias(
        required
    )

    candidate_normalized = normalize_alias(
        candidate
    )

    # -------------------------------------------------
    # Check whether both belong to same alias group
    # -------------------------------------------------

    for canonical_skill, aliases in skill_aliases.items():

        normalized_aliases = {
            normalize_alias(alias)
            for alias in aliases
        }

        canonical_normalized = normalize_alias(
            canonical_skill
        )

        normalized_aliases.add(
            canonical_normalized
        )

        if (
            required_normalized in normalized_aliases
            and candidate_normalized in normalized_aliases
        ):
            return True

    return False


def calculate_skill_score(
    required_skills,
    candidate_skills,
    candidate_tools=None,
    candidate_projects=None
):
    """
    Calculate skill match score using normalized skill names
    and phrase-level matching.

    Candidate evidence comes from:
    - skills
    - tools
    - explicitly listed project technologies
    - controlled technical terms found in project descriptions

    Project titles/descriptions are NOT treated as arbitrary skills.
    Only terms that correspond to the controlled skill aliases used
    by skill_phrase_matches() can become skill evidence.
    """

    candidate_tools = candidate_tools or []
    candidate_projects = candidate_projects or []

    # -------------------------------------------------
    # Candidate skill/tool evidence
    # -------------------------------------------------

    all_candidate_items = (
        list(candidate_skills or [])
        + list(candidate_tools)
    )

    # -------------------------------------------------
    # Project evidence
    # -------------------------------------------------

    # These are technical terms that are safe to recognize when
    # they explicitly occur in a project description. This prevents
    # normal English project text from becoming a "skill".
    project_skill_terms = {
        "python",
        "fastapi",
        "fast api",
        "react",
        "react.js",
        "reactjs",
        "javascript",
        "js",
        "typescript",
        "angular",
        "angular.js",
        "angularjs",
        "vue",
        "vue.js",
        "vuejs",
        "rest api",
        "rest apis",
        "restful api",
        "restful apis",
        "restful web services",
        "sql",
        "postgresql",
        "postgres",
        "mysql",
        "mongodb",
        "mongo",
        "git",
        "docker",
        "aws",
        "amazon web services",
        "azure",
        "microsoft azure",
        "gcp",
        "google cloud",
        "google cloud platform",
    }

    for project in candidate_projects:

        # Structured project object
        if isinstance(project, dict):

            # Explicit technology list is strongest project evidence.
            technologies = project.get(
                "technologies",
                []
            )

            if isinstance(technologies, str):
                technologies = [technologies]

            if technologies:
                all_candidate_items.extend(
                    technologies
                )

            # Also inspect project description, but only extract
            # controlled technical terms from it.
            description = project.get(
                "description",
                ""
            )

            if isinstance(description, list):
                description = " ".join(
                    str(item) for item in description
                )

            if isinstance(description, str):
                description_lower = description.lower()

                for term in project_skill_terms:
                    if re.search(
                        rf"(?<![a-zA-Z0-9+#]){re.escape(term)}(?![a-zA-Z0-9+#])",
                        description_lower
                    ):
                        all_candidate_items.append(term)

        # Some older parsed resumes store projects as strings.
        elif isinstance(project, str):

            project_lower = project.lower()

            for term in project_skill_terms:
                if re.search(
                    rf"(?<![a-zA-Z0-9+#]){re.escape(term)}(?![a-zA-Z0-9+#])",
                    project_lower
                ):
                    all_candidate_items.append(term)

    # -------------------------------------------------
    # Normalize candidate evidence
    # -------------------------------------------------

    candidate_items = {
        normalize_skill(item)
        for item in all_candidate_items
        if normalize_skill(item)
    }

    # -------------------------------------------------
    # Normalize required JD skills
    # -------------------------------------------------

    required_items = {
        normalize_skill(skill)
        for skill in (required_skills or [])
        if normalize_skill(skill)
    }

    if not required_items:
        return 100.0, []

    # -------------------------------------------------
    # Match required skills
    # -------------------------------------------------

    matched_skills = []

    for required_skill in required_items:

        for candidate_skill in candidate_items:

            if skill_phrase_matches(
                required_skill,
                candidate_skill
            ):
                matched_skills.append(
                    required_skill
                )
                break

    matched_skills = sorted(
        set(matched_skills)
    )

    # -------------------------------------------------
    # Calculate percentage
    # -------------------------------------------------

    score = (
        len(matched_skills)
        / len(required_items)
    ) * 100

    return round(score, 2), matched_skills

def get_fit_category(match_score):
    """
    Convert the final numerical match score into a recruiter-friendly
    fit category.
    """

    if match_score >= 80:
        return "Excellent Fit"

    if match_score >= 65:
        return "Strong Fit"

    if match_score >= 50:
        return "Moderate Fit"

    if match_score >= 35:
        return "Weak Fit"

    return "Poor Fit"


# -------------------------------------------------
# Experience Score
# -------------------------------------------------

def calculate_experience_score(
    required_experience,
    candidate_experience
):

    required = extract_number(required_experience)
    candidate = extract_number(candidate_experience)

    print(
        f"EXPERIENCE DEBUG | "
        f"JD Required: {required_experience} -> {required} | "
        f"Candidate: {candidate_experience} -> {candidate}"
    )

    if required == 0:
        return 100

    if candidate >= required:
        return 100

    score = (
        candidate / required
    ) * 100

    return round(score, 2)

# -------------------------------------------------
# Qualification Score
# -------------------------------------------------

QUALIFICATION_LEVELS = {
    "phd": 6,
    "doctorate": 6,
    "doctor of philosophy": 6,

    "mtech": 5,
    "master of technology": 5,
    "me": 5,
    "master of engineering": 5,
    "mca": 5,
    "master of computer applications": 5,
    "msc": 5,
    "master of science": 5,
    "mba": 5,
    "master of business administration": 5,

    "btech": 4,
    "bachelor of technology": 4,
    "be": 4,
    "bachelor of engineering": 4,
    "bca": 4,
    "bachelor of computer applications": 4,
    "bsc": 4,
    "bachelor of science": 4,

    "diploma": 3,
    "12th": 2,
    "higher secondary": 2,
    "10th": 1,
    "secondary school": 1,
}


def _qualification_text(text):
    """Normalize qualification text and degree abbreviations."""

    text = normalize_text(text)

    compact = re.sub(
        r"[.\-/,:()]+",
        " ",
        text
    )

    compact = re.sub(
        r"\s+",
        " ",
        compact
    ).strip()

    aliases = [
        (r"\bbachelor\s+of\s+technology\b", "btech"),
        (r"\bbachelor\s+of\s+engineering\b", "be"),
        (r"\bmaster\s+of\s+technology\b", "mtech"),
        (r"\bmaster\s+of\s+engineering\b", "me"),
        (r"\bmaster\s+of\s+computer\s+applications\b", "mca"),
        (r"\bbachelor\s+of\s+computer\s+applications\b", "bca"),
        (r"\bmaster\s+of\s+business\s+administration\b", "mba"),
        (r"\bmaster\s+of\s+science\b", "msc"),
        (r"\bdoctor\s+of\s+philosophy\b", "phd"),

        (r"\bb\s*tech\b", "btech"),
        (r"\bb\s*e\b", "be"),
        (r"\bm\s*tech\b", "mtech"),
        (r"\bm\s*e\b", "me"),
        (r"\bm\s*c\s*a\b", "mca"),
        (r"\bm\s*s\s*c\b", "msc"),
        (r"\bm\s*b\s*a\b", "mba"),
        (r"\bb\s*c\s*a\b", "bca"),
        (r"\bb\s*sc\b", "bsc"),
        (r"\bph\s*d\b", "phd"),
    ]

    canonical = compact

    for pattern, replacement in aliases:
        canonical = re.sub(
            pattern,
            replacement,
            canonical
        )

    canonical = re.sub(
        r"\s+",
        " ",
        canonical
    ).strip()

    return text, canonical


def get_qualification_degree(text):
    """
    Return the canonical degree category.

    Examples:
        B.Tech CSE -> btech
        BTech CSE -> btech
        B.E. ECE -> be
        MCA -> mca
        MBA -> mba
    """

    _, canonical = _qualification_text(text)

    degree_patterns = [
        ("phd", r"\bphd\b"),
        ("mtech", r"\bmtech\b"),
        ("me", r"\bme\b"),
        ("mca", r"\bmca\b"),
        ("msc", r"\bmsc\b"),
        ("mba", r"\bmba\b"),

        ("btech", r"\bbtech\b"),
        ("be", r"\bbe\b"),
        ("bca", r"\bbca\b"),
        ("bsc", r"\bbsc\b"),

        ("diploma", r"\bdiploma\b"),
    ]

    for degree, pattern in degree_patterns:

        if re.search(
            pattern,
            canonical
        ):
            return degree

    return ""


def get_qualification_fields(text):
    """Extract normalized academic fields."""

    original, canonical = _qualification_text(text)

    fields = set()

    field_keywords = {

        # Computer / IT
        "computer science and engineering":
            "computer science",

        "computer science engineering":
            "computer science",

        "computer science":
            "computer science",

        "computer engineering":
            "computer science",

        "cse":
            "computer science",

        "information technology":
            "information technology",

        "information science":
            "information technology",

        "ise":
            "information technology",

        "software engineering":
            "software engineering",

        "artificial intelligence":
            "artificial intelligence",

        "ai and ml":
            "artificial intelligence",

        "ai ml":
            "artificial intelligence",

        "machine learning":
            "machine learning",

        "data science":
            "data science",

        # Electronics
        "electronics and communication engineering":
            "electronics",

        "electronics and communication":
            "electronics",

        "electronics communication":
            "electronics",

        "electronics and instrumentation":
            "electronics",

        "electronics":
            "electronics",

        "ece":
            "electronics",

        # Electrical
        "electrical and electronics engineering":
            "electrical",

        "electrical engineering":
            "electrical",

        "electrical":
            "electrical",

        # Mechanical
        "mechanical engineering":
            "mechanical",

        "mechanical":
            "mechanical",

        # Civil
        "civil engineering":
            "civil",

        "civil":
            "civil",

        # Business
        "business administration":
            "business administration",

        "management":
            "management",

        "finance":
            "finance",

        "marketing":
            "marketing",

        # MCA
        "master of computer applications":
            "mca",

        "mca":
            "mca",
    }

    searchable = (
        f"{original} {canonical}"
    )

    for keyword, field in field_keywords.items():

        if re.search(
            r"(?<!\w)"
            + re.escape(keyword)
            + r"(?!\w)",
            searchable
        ):
            fields.add(field)

    return fields


def get_qualification_level(text):
    """Return the recognized academic qualification level."""

    degree = get_qualification_degree(text)

    if degree:
        return QUALIFICATION_LEVELS.get(
            degree,
            0
        )

    return 0


def _required_qualification_options(required_text):
    """
    Convert the JD qualification requirement into
    explicit acceptable degree + field combinations.

    Supports:
    - Specific degrees such as MCA, B.Tech and B.E.
    - Generic Bachelor's Degree requirements
    - Common business/marketing/communication degree fields
    """

    _, canonical = _qualification_text(
        required_text
    )

    options = []

    # -----------------------------------------
    # MCA
    # -----------------------------------------

    if re.search(
        r"(?<!\w)mca(?!\w)",
        canonical
    ):

        options.append({
            "degree": "mca",
            "level": 5,
            "fields": {
                "mca"
            }
        })

    # -----------------------------------------
    # B.Tech / B.E.
    # -----------------------------------------

    has_btech = bool(
        re.search(
            r"(?<!\w)btech(?!\w)",
            canonical
        )
    )

    has_be = bool(
        re.search(
            r"(?<!\w)be(?!\w)",
            canonical
        )
    )

    technical_bachelor_fields = {
        "computer science",
        "information technology",
        "software engineering",
        "artificial intelligence",
        "machine learning",
        "data science",
    }

    if has_btech:

        options.append({
            "degree": "btech",
            "level": 4,
            "fields": technical_bachelor_fields
        })

    if has_be:

        options.append({
            "degree": "be",
            "level": 4,
            "fields": technical_bachelor_fields
        })

    # -----------------------------------------
    # Generic Bachelor's Degree
    # -----------------------------------------
    # Example:
    # Bachelor's Degree in Marketing, Business
    # Administration, Mass Communication, etc.
    # -----------------------------------------

    has_bachelor = bool(
        re.search(
            r"\bbachelor(?:'s|s)?\b",
            canonical
        )
    )

    if has_bachelor:

        bachelor_fields = set()

        field_aliases = {
            # Computer / IT
            "computer science and engineering": "computer science",
            "computer science engineering": "computer science",
            "computer science": "computer science",
            "computer engineering": "computer science",
            "information technology": "information technology",
            "information science": "information technology",
            "software engineering": "software engineering",
            "artificial intelligence": "artificial intelligence",
            "machine learning": "machine learning",
            "data science": "data science",

            # Business / Management
            "business administration": "business administration",
            "management": "management",
            "finance": "finance",
            "economics": "economics",
            "marketing": "marketing",
            "mass communication": "mass communication",
            "commerce": "commerce",
            "accounting": "accounting",
            "business": "business administration",
        }

        for keyword, field in field_aliases.items():
            if re.search(
                r"(?<!\w)"
                + re.escape(keyword)
                + r"(?!\w)",
                canonical
            ):
                bachelor_fields.add(field)

        # If the JD says only "Bachelor's Degree" without naming
        # a field, treat any recognized bachelor's degree as acceptable.
        if not bachelor_fields:
            bachelor_fields = {
                "__any_bachelor_field__"
            }

        options.append({
            "degree": "bachelor",
            "level": 4,
            "fields": bachelor_fields
        })

    return options


def calculate_qualification_score(
    required_qualification,
    candidate_qualification
):
    """
    Calculate qualification compatibility using:

    1. Accepted degree level
    2. Relevant academic field

    Scores:
        100 = accepted degree/level + relevant field
         40 = accepted degree + unrelated field
          0 = qualification not accepted

    A higher-level qualification is accepted when its field is
    relevant to a lower-level JD requirement.
    """

    required_text = normalize_text(
        required_qualification
    )

    candidate_text = normalize_text(
        candidate_qualification
    )

    if not required_text:
        return 100

    if not candidate_text:
        return 0

    candidate_degree = get_qualification_degree(
        candidate_text
    )

    candidate_level = get_qualification_level(
        candidate_text
    )

    candidate_fields = get_qualification_fields(
        candidate_text
    )

    acceptable_options = (
        _required_qualification_options(
            required_text
        )
    )

    print(
        "QUALIFICATION DEBUG |",
        "JD:", required_qualification,
        "| Candidate:", candidate_qualification,
        "| Candidate Degree:", candidate_degree,
        "| Candidate Level:", candidate_level,
        "| Candidate Fields:", candidate_fields
    )

    if not acceptable_options:
        return 0

    print(
        "QUALIFICATION OPTIONS DEBUG |",
        acceptable_options
    )

    best_score = 0.0

    bachelor_degrees = {
        "btech",
        "be",
        "bca",
        "bsc",
    }

    for option in acceptable_options:

        required_degree = option["degree"]
        required_level = option["level"]
        required_fields = option["fields"]

        # -----------------------------------------
        # Determine degree/level compatibility
        # -----------------------------------------

        if required_degree == "bachelor":

            # A generic Bachelor's Degree requirement accepts
            # recognized bachelor's degrees (or a higher degree)
            # at the degree/level stage. Field relevance is checked
            # separately below.
            degree_match = (
                candidate_degree in bachelor_degrees
                or candidate_level >= required_level
            )

        else:

            # Specific degree requirements (e.g. MCA) require the
            # candidate to hold that exact degree category.
            # Higher-level degrees are handled through the
            # relevant-field + lower/higher-level logic below.
            degree_match = (
                candidate_degree == required_degree
            )

        # -----------------------------------------
        # Determine field compatibility
        # -----------------------------------------

        if "__any_bachelor_field__" in required_fields:
            # JD explicitly accepts any bachelor's field.
            field_match = (
                candidate_level >= required_level
                and candidate_degree in bachelor_degrees
            )
        else:
            # When the JD names specific fields, the candidate must
            # have a recognized relevant academic field. Merely having
            # a bachelor's/master's degree is NOT enough.
            field_match = bool(
                candidate_fields.intersection(
                    required_fields
                )
            )

        # -----------------------------------------
        # Accepted degree/level + relevant field
        # -----------------------------------------

        if degree_match and field_match:

            score = 100

        # -----------------------------------------
        # Accepted degree/level but unrelated field
        # -----------------------------------------

        elif degree_match and not field_match:

            score = 40

        # -----------------------------------------
        # Lower qualification but relevant field
        # -----------------------------------------

        elif (
            field_match
            and candidate_level > 0
            and candidate_level < required_level
        ):

            score = round(
                (
                    candidate_level
                    / required_level
                ) * 100,
                2
            )

        else:

            score = 0

        best_score = max(
            best_score,
            score
        )

    print(
        "QUALIFICATION RESULT |",
        candidate_qualification,
        "| Score:",
        best_score
    )

    return round(
        best_score,
        2
    )


# -------------------------------------------------
# Project Relevance Score
# -------------------------------------------------

def calculate_project_score(
    required_skills,
    candidate_projects
):
    """
    Calculates project relevance using:
    50% exact required-skill overlap
    50% semantic relevance
    """

    if not candidate_projects:
        return 0.0

    if not required_skills:
        return 100.0

    required = {
        normalize_text(skill)
        for skill in required_skills
        if skill
    }

    project_scores = []

    # Text used for semantic comparison
    required_text = " ".join(sorted(required))

    for project in candidate_projects:

        # -----------------------------------------
        # Build project text
        # -----------------------------------------

        if isinstance(project, dict):

            title = str(
                project.get("title", "")
            )

            description = project.get(
                "description",
                ""
            )

            technologies = project.get(
                "technologies",
                []
            )

            if isinstance(description, list):
                description = " ".join(
                    str(x)
                    for x in description
                )

            if isinstance(technologies, list):
                technologies = " ".join(
                    str(x)
                    for x in technologies
                )

            project_text = " ".join([
                title,
                str(description),
                str(technologies)
            ]).strip()

        else:

            project_text = str(
                project
            ).strip()

        if not project_text:
            continue

        normalized_project = normalize_text(
            project_text
        )

        # -----------------------------------------
        # Exact skill overlap
        # -----------------------------------------

        matched_skills = set()

        for skill in required:

            if skill in normalized_project:
                matched_skills.add(skill)

        exact_score = (
            len(matched_skills)
            / len(required)
        ) * 100

        # -----------------------------------------
        # Semantic relevance
        # -----------------------------------------

        semantic_score = calculate_semantic_similarity(
            required_text,
            project_text
        )

        # -----------------------------------------
        # Hybrid score
        # -----------------------------------------

        project_score = (
            exact_score * 0.50
            +
            semantic_score * 0.50
        )

        project_scores.append(
            project_score
        )

    if not project_scores:
        return 0.0

    # Best project represents the candidate's
    # strongest relevant project.
    best_score = max(project_scores)

    return round(best_score, 2)




# -------------------------------------------------
# Location Score
# -------------------------------------------------

def normalize_location(location):
    if not location:
        return ""

    location = normalize_text(location)

    aliases = {
        "bangalore": "bengaluru",
        "bengaluru": "bengaluru",

        "bombay": "mumbai",
        "mumbai": "mumbai",

        "calcutta": "kolkata",
        "kolkata": "kolkata",

        "madras": "chennai",
        "chennai": "chennai",

        "new delhi": "delhi",
        "delhi": "delhi",

        "gurgaon": "gurugram",
        "gurugram": "gurugram",

        "trivandrum": "thiruvananthapuram",
        "thiruvananthapuram": "thiruvananthapuram",
    }

    return aliases.get(location, location)


# -------------------------------------------------
# Location Score
# -------------------------------------------------

def calculate_location_score(
    required_location,
    candidate_location
):
    required = normalize_text(required_location)
    candidate = normalize_text(candidate_location)

    # No JD location provided
    if not required:
        return 100

    # No candidate location available
    if not candidate:
        return 0

    # Split JD locations
    required_locations = [
        normalize_text(location.strip())
        for location in required_location.split(",")
        if location.strip()
    ]

    # Check each allowed location
    for location in required_locations:

        # Remote candidate
        if location == "remote" and candidate == "remote":
            return 100

        # Normal location matching
        if location in candidate:
            return 100

        # Handle Bengaluru/Bangalore difference
        if location == "bangalore" and "bengaluru" in candidate:
            return 100

        if location == "bengaluru" and "bangalore" in candidate:
            return 100

    return 0


# -------------------------------------------------
# Career Gap Score
# -------------------------------------------------

def calculate_career_gap_score(
    career_gap
):

    gap = extract_number(career_gap)

    if gap == 0:
        return 100

    if gap <= 1:
        return 80

    if gap <= 2:
        return 60

    return 40


def match_candidates(db: Session, job):

    candidates = db.query(Candidate).all()

    valid_candidates = []

    for candidate in candidates:
        if not candidate.name or not candidate.email:
            print(
                "SKIPPING INVALID CANDIDATE |",
                "Name:", candidate.name,
                "| Email:", candidate.email
            )
            continue

        valid_candidates.append(candidate)

    candidates = valid_candidates

    ranked_candidates = []

    # -----------------------------
    # Required Skills
    # -----------------------------
    required_skills = {
        normalize_text(skill)
        for skill in job.skills.split(",")
        if skill.strip()
    }

    for candidate in candidates:

        # -----------------------------------
        # Individual Scores
        # -----------------------------------
        print("CANDIDATE:", candidate.name)
        print("SKILLS:", candidate.skills)
        print("TOOLS:", candidate.tools)
        skill_score, matched_skills = calculate_skill_score(
            required_skills,
            candidate.skills,
            candidate.tools,
            candidate.projects
        )
        # -----------------------------------
        # Semantic Relevance Score
        # -----------------------------------

        candidate_semantic_text = build_candidate_semantic_text(
            candidate
        )

        job_semantic_text = build_job_semantic_text(job)

        semantic_score = calculate_semantic_similarity(
            job_semantic_text,
            candidate_semantic_text
        )

        experience_score = calculate_experience_score(
            job.experience,
            candidate.years_of_experience
        )

        qualification_score = calculate_qualification_score(
            job.qualification,
            candidate.highest_qualification
        )
        print(
            "QUALIFICATION DEBUG |",
            candidate.name,
            "| JD:",
            job.qualification,
            "| Candidate:",
            candidate.highest_qualification,
            "| JD Accepted Levels:",
            [opt["level"] for opt in _required_qualification_options(job.qualification)] or [get_qualification_level(job.qualification)],
            "| Candidate Level:",
            get_qualification_level(candidate.highest_qualification),
            "| Score:",
            qualification_score
        )   

        print(
            "PROJECT DEBUG |",
            candidate.name,
            "| Required Skills:",
            required_skills,
            "| Projects:",
            candidate.projects
        )

        project_score = calculate_project_score(
            required_skills,
            candidate.projects
        )
        print(
            f"LOCATION DEBUG | "
            f"{candidate.name} | "
            f"JD: {job.location} | "
            f"Candidate: {candidate.location}"
        )

        location_score = calculate_location_score(
            job.location,
            candidate.location
        )

        print(
            "CAREER GAP DEBUG |",
            candidate.name,
            "| Career Gap:",
            candidate.career_gap
        )

        career_gap_score = calculate_career_gap_score(
        candidate.career_gap
        )
        
        
        # TEMPORARY DEBUG PRINTS
        print("\n==============================")
        print("CANDIDATE:", candidate.name)
        print("Skill Score:", skill_score)
        print("Experience Score:", experience_score)
        print("Qualification Score:", qualification_score)
        print("Semantic Score:", semantic_score)
        print("Project Score:", project_score)
        print("Location Score:", location_score)
        print("Career Gap Score:", career_gap_score)
        print("==============================")

        # -----------------------------------
        # Hybrid Weighted Match Score
        # -----------------------------------
        # Skills are deliberately the strongest signal. The other
        # dimensions provide supporting evidence without allowing
        # weak technical overlap to be hidden by semantic similarity.

        weighted_score = 0
        total_weight = 0

        # Skills - 40%
        weighted_score += skill_score * MATCH_WEIGHTS["skills"]
        total_weight += MATCH_WEIGHTS["skills"]

        # Experience - 15%
        if job.experience.strip():
            weighted_score += experience_score * MATCH_WEIGHTS["experience"]
            total_weight += MATCH_WEIGHTS["experience"]

        # Semantic Relevance - 15%
        weighted_score += semantic_score * MATCH_WEIGHTS["semantic"]
        total_weight += MATCH_WEIGHTS["semantic"]

        # Qualification - 10%
        if job.qualification.strip():
            weighted_score += qualification_score * MATCH_WEIGHTS["qualification"]
            total_weight += MATCH_WEIGHTS["qualification"]

        # Projects - 10%
        if candidate.projects:
            weighted_score += project_score * MATCH_WEIGHTS["projects"]
            total_weight += MATCH_WEIGHTS["projects"]

        # Location - 5%
        if job.location.strip():
            weighted_score += location_score * MATCH_WEIGHTS["location"]
            total_weight += MATCH_WEIGHTS["location"]

        # Career Gap - 5%
        if candidate.career_gap is not None:
            weighted_score += career_gap_score * MATCH_WEIGHTS["career_gap"]
            total_weight += MATCH_WEIGHTS["career_gap"]

        if total_weight == 0:
            base_score = 0.0
        else:
            base_score = round(weighted_score / total_weight, 2)

        # -----------------------------------
        # Skill-Based Ranking Safeguard
        # -----------------------------------
        # Skill coverage remains a ranking safeguard rather than
        # a hard candidate filter. Candidates are still returned,
        # but very weak technical matches are prevented from being
        # classified as strong fits solely because of other scores.
        skill_match_percentage = skill_score

        ranking_penalty_applied = False
        ranking_penalty_factor = 1.0

        # Human-readable skill coverage level for debugging/UI logic.
        if skill_match_percentage < VERY_LOW_SKILL_THRESHOLD:

            skill_coverage_level = "Very Low"

        elif skill_match_percentage < LOW_SKILL_THRESHOLD:

            skill_coverage_level = "Low"

        elif skill_match_percentage < 60.0:

            skill_coverage_level = "Moderate"

        else:

            skill_coverage_level = "Good"

        # -----------------------------------
        # Apply graduated ranking penalty
        # -----------------------------------

        # Very low skill coverage: below 20%
        if skill_match_percentage < VERY_LOW_SKILL_THRESHOLD:

            ranking_penalty_factor = VERY_LOW_SKILL_PENALTY
            ranking_penalty_applied = True

        # Low skill coverage: 20% to below 40%
        elif skill_match_percentage < LOW_SKILL_THRESHOLD:

            ranking_penalty_factor = LOW_SKILL_PENALTY
            ranking_penalty_applied = True

        # 40% or higher: no penalty
        else:

            ranking_penalty_factor = 1.0
            ranking_penalty_applied = False

        # -----------------------------------
        # Calculate final score
        # -----------------------------------

        final_score = round(
            base_score * ranking_penalty_factor,
            2
        )

        # -----------------------------------
        # Final fit category
        # -----------------------------------

        fit_category = get_fit_category(final_score)

        # Do not allow very low skill coverage to be presented
        # as an Excellent/Strong technical fit.
        if skill_match_percentage < VERY_LOW_SKILL_THRESHOLD:

            if fit_category in [
                "Excellent Fit",
                "Strong Fit"
            ]:
                fit_category = "Weak Fit"

        elif skill_match_percentage < LOW_SKILL_THRESHOLD:

            if fit_category == "Excellent Fit":
                fit_category = "Moderate Fit"

        required_skill_count = len(required_skills)
        matched_skill_count = len(matched_skills)

        print(
            f"MATCHING DEBUG | {candidate.name} | "
            f"Skill Coverage: {matched_skill_count}/{required_skill_count} "
            f"({skill_match_percentage:.2f}%) | "
            f"Skill Level: {skill_coverage_level} | "
            f"Base Score: {base_score:.2f} | "
            f"Penalty Factor: {ranking_penalty_factor:.2f} | "
            f"Penalty Applied: {ranking_penalty_applied} | "
            f"Final Score: {final_score:.2f} | "
            f"Fit: {fit_category}"
        )

        ranked_candidates.append({

            "id": str(candidate.id),

            "name": candidate.name,

            "email": candidate.email,

            "phone": candidate.phone,

            "location": candidate.location,

            "highest_qualification": candidate.highest_qualification,

            "years_of_experience": candidate.years_of_experience,

            "experience_display": candidate.experience_display,

            "career_gap": candidate.career_gap,

            "summary": candidate.summary,

            "matched_skills": matched_skills,

            "candidate_skills": candidate.skills,

            "projects": candidate.projects,

            "experience": candidate.experience,

            "resume_file": candidate.resume_file,

            "match_score": final_score,
            "base_match_score": base_score,
            "skill_match_percentage": skill_match_percentage,
            "matched_skill_count": matched_skill_count,
            "required_skill_count": required_skill_count,
            "fit_category": fit_category,
            "ranking_penalty_applied": ranking_penalty_applied,
            "ranking_penalty_factor": ranking_penalty_factor,
            "skill_coverage_level": skill_coverage_level
        })

    ranked_candidates.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return ranked_candidates