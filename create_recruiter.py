from app.database import SessionLocal
from app.models.recruiter import Recruiter
from app.utils.auth import hash_password


# Recruiter details
full_name = "Test Recruiter"
email = "recruiter@vaysinfotech.com"
password = "Recruiter@123"


# Create database session
db = SessionLocal()

try:
    # Check if recruiter already exists
    existing_recruiter = (
        db.query(Recruiter)
        .filter(Recruiter.email == email)
        .first()
    )

    if existing_recruiter:
        print("❌ Recruiter already exists.")
    else:
        # Hash password before storing it
        hashed_password = hash_password(password)

        recruiter = Recruiter(
            full_name=full_name,
            email=email,
            password_hash=hashed_password,
            is_active=True,
        )

        db.add(recruiter)
        db.commit()
        db.refresh(recruiter)

        print("✅ Recruiter created successfully!")
        print(f"ID: {recruiter.id}")
        print(f"Name: {recruiter.full_name}")
        print(f"Email: {recruiter.email}")

finally:
    db.close()