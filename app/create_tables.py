from app.database import Base, engine

# Import all models so SQLAlchemy knows about them
from app.models import Candidate

# Create all tables
Base.metadata.create_all(bind=engine)

print("✅ Tables created successfully!")