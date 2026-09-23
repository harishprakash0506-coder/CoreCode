from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, UserRole, Question, TestCase
from app.schemas import QuestionAdmin, TestCasePublic
from app.security import get_current_user, require_role

router = APIRouter(prefix="/api/questions", tags=["Questions"])

@router.get("/admin/bank", response_model=List[QuestionAdmin])
def get_admin_question_bank(
    level: Optional[int] = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.ASSESSMENT_ADMIN, UserRole.REVIEWER]))
):
    """
    Admin-only route to inspect all 300 questions imported from Excel.
    """
    query = db.query(Question)
    if level is not None:
        query = query.filter(Question.level_num == level)
    
    questions = query.order_by(Question.level_num, Question.question_id).all()
    
    res = []
    for q in questions:
        samples = db.query(TestCase).filter(TestCase.question_id == q.question_id, TestCase.is_sample == True).all()
        hidden_count = db.query(TestCase).filter(TestCase.question_id == q.question_id, TestCase.is_sample == False).count()
        
        q_dict = QuestionAdmin(
            id=q.id,
            question_id=q.question_id,
            level_num=q.level_num,
            level_name=q.level_name,
            topic=q.topic,
            difficulty=q.difficulty,
            title=q.title,
            problem_statement=q.problem_statement,
            input_format=q.input_format,
            output_format=q.output_format,
            tags=q.tags,
            supported_languages=q.supported_languages,
            status=q.status,
            version=q.version,
            question_max_marks=q.question_max_marks,
            sample_test_cases=[TestCasePublic.from_orm(tc) for tc in samples],
            hidden_test_cases_count=hidden_count,
            assessment_selection=q.assessment_selection,
            retry_rule=q.retry_rule,
            language_locked=q.language_locked,
            checker_type=q.checker_type,
            source=q.source
        )
        res.append(q_dict)
    return res

@router.get("/verify-counts")
def verify_question_counts(db: Session = Depends(get_db)):
    """
    Public verification endpoint showing question counts per level.
    """
    level_counts = {}
    for lvl in range(1, 11):
        count = db.query(Question).filter(Question.level_num == lvl).count()
        level_counts[f"Level {lvl}"] = count
    
    total = db.query(Question).count()
    return {
        "levels": level_counts,
        "total_questions": total,
        "verified": total == 300 and all(c == 30 for c in level_counts.values())
    }
