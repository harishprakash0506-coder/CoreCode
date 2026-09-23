from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, UserRole, Question, Assessment, Submission
from app.schemas import SystemStats, UserResponse
from app.security import require_role

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/stats", response_model=SystemStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.ASSESSMENT_ADMIN, UserRole.REVIEWER]))
):
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    total_questions = db.query(Question).count()
    total_assessments = db.query(Assessment).count()

    q_per_level = {}
    for lvl in range(1, 11):
        q_per_level[f"Level {lvl}"] = db.query(Question).filter(Question.level_num == lvl).count()

    return SystemStats(
        total_users=total_users,
        total_students=total_students,
        total_questions=total_questions,
        total_assessments=total_assessments,
        questions_per_level=q_per_level
    )

@router.get("/students", response_model=List[UserResponse])
def get_all_students(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.ASSESSMENT_ADMIN]))
):
    students = db.query(User).filter(User.role == UserRole.STUDENT).all()
    return students
