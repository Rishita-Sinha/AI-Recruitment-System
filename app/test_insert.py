from app.database import SessionLocal
from app.crud import create_candidate

# Create a database session
db = SessionLocal()

try:
    candidate = create_candidate(
        db=db,
        full_name="John Doe",
        email="john.doe@example.com",
        phone="9876543210",
        linkedin="https://linkedin.com/in/johndoe",
        github="https://github.com/johndoe",
        location="Bangalore",
        experience_years=3,
        resume_path="uploads/john_doe_resume.pdf",
        resume_text="Python, FastAPI, SQL, Machine Learning"
    )

    print("Candidate inserted successfully!")
    print(f"Candidate ID: {candidate.candidate_id}")

except Exception as e:
    print("Error:", e)

finally:
    db.close()