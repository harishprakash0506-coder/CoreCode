from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.seed import seed_database
from app.routers import auth, questions, assessments, admin, student

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"{settings.PROJECT_FULL_NAME} - {settings.TAGLINE}",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(assessments.router)
app.include_router(admin.router)
app.include_router(student.router)

@app.on_event("startup")
def on_startup():
    print("[*] Initializing CoreCode database and seeding question bank...")
    seed_database()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "full_name": settings.PROJECT_FULL_NAME,
        "tagline": settings.TAGLINE
    }
