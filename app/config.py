from dotenv import load_dotenv
import os

# Load variables from the .env file
load_dotenv()

# Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# PostgreSQL Database URL
DATABASE_URL = os.getenv("DATABASE_URL")