from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers.upload import router as upload_router
from app.routers.candidates import router as candidates_router
from app.routers.jobs import router as jobs_router
from app.routers.chat import router as chat_router
from app.routers.dashboard import router as dashboard_router
from app.routers.auth import router as auth_router
app = FastAPI(
    title="AI Resume Screening API",
    version="1.0.0",
)

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Uploads Folder
# =========================

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads",
)

# =========================
# Root
# =========================

@app.get("/")
def root():
    return {
        "message": "AI Resume Screening & Candidate Ranking Chatbot API is running!"
    }

# =========================
# Register Routers
# =========================

app.include_router(upload_router)
app.include_router(candidates_router)
app.include_router(jobs_router)
app.include_router(chat_router)
app.include_router(dashboard_router)
app.include_router(auth_router)
