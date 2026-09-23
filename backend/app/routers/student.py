from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict
from app.database import get_db
from app.models import User, StudentAttempt, Assessment, Question
from app.security import get_current_user

router = APIRouter(prefix="/api/student", tags=["Student"])

@router.get("/dashboard-stats")
def get_student_dashboard_stats(
    db: Session = Depends(get_db),
    student: User = Depends(get_current_user)
):
    level_progress: Dict[str, Dict] = {}
    for lvl in range(1, 11):
        attempted_count = db.query(StudentAttempt).filter(
            StudentAttempt.student_id == student.id,
            StudentAttempt.level_num == lvl
        ).count()
        level_progress[f"Level {lvl}"] = {
            "level_num": lvl,
            "attempted_questions": attempted_count,
            "total_pool": 30,
            "remaining": max(0, 30 - attempted_count)
        }

    completed_assessments = db.query(Assessment).filter(
        Assessment.student_id == student.id,
        Assessment.status == "SUBMITTED"
    ).all()

    avg_score = 0
    if completed_assessments:
        avg_score = round(sum(a.total_score for a in completed_assessments) / len(completed_assessments), 1)

    return {
        "student_id": student.id,
        "full_name": student.full_name,
        "email": student.email,
        "total_assessments_taken": len(completed_assessments),
        "average_score": avg_score,
        "level_progress": level_progress
    }

@router.get("/history")
def get_student_history(
    db: Session = Depends(get_db),
    student: User = Depends(get_current_user)
):
    assessments = db.query(Assessment).filter(
        Assessment.student_id == student.id
    ).order_by(Assessment.started_at.desc()).all()

    res = []
    for a in assessments:
        res.append({
            "id": a.id,
            "level_num": a.level_num,
            "started_at": a.started_at,
            "status": a.status,
            "q1_score": a.q1_score,
            "q2_score": a.q2_score,
            "total_score": a.total_score
        })
    return res
