from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# Load the embedding model once when the application starts.
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def calculate_semantic_similarity(job_text: str, candidate_text: str) -> float:
    """
    Calculate semantic similarity between a Job Description
    and candidate-related text.

    Returns a score between 0 and 100.
    """

    if not job_text or not candidate_text:
        return 0.0

    job_embedding = model.encode(
        job_text,
        convert_to_numpy=True
    )

    candidate_embedding = model.encode(
        candidate_text,
        convert_to_numpy=True
    )

    similarity = cosine_similarity(
        [job_embedding],
        [candidate_embedding]
    )[0][0]

    # Convert cosine similarity (-1 to 1) into 0-100.
    score = ((similarity + 1) / 2) * 100

    return round(float(score), 2)