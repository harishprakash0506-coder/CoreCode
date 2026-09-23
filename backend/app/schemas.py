from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import UserRole

# Auth & User schemas
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: Optional[UserRole] = UserRole.STUDENT

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Question & Test Case schemas
class TestCasePublic(BaseModel):
    id: int
    input_data: str
    expected_output: str
    is_sample: bool

    class Config:
        from_attributes = True

class QuestionPublic(BaseModel):
    id: int
    question_id: str
    level_num: int
    level_name: str
    topic: Optional[str]
    difficulty: Optional[str]
    title: str
    problem_statement: str
    input_format: Optional[str]
    output_format: Optional[str]
    tags: Optional[str]
    supported_languages: Optional[str]
    status: Optional[str]
    version: Optional[str]
    question_max_marks: int
    sample_test_cases: List[TestCasePublic] = []

    class Config:
        from_attributes = True

class QuestionAdmin(QuestionPublic):
    hidden_test_cases_count: int = 5
    assessment_selection: Optional[str]
    retry_rule: Optional[str]
    language_locked: Optional[str]
    checker_type: Optional[str]
    source: Optional[str]

# Assessment schemas
class AssessmentStartRequest(BaseModel):
    level_num: int

class AssessmentQuestionResponse(BaseModel):
    question_id: str
    level_num: int
    level_name: str
    topic: Optional[str]
    difficulty: Optional[str]
    title: str
    problem_statement: str
    input_format: Optional[str]
    output_format: Optional[str]
    supported_languages: Optional[str]
    question_max_marks: int
    sample_test_cases: List[TestCasePublic] = []

class AssessmentSessionResponse(BaseModel):
    assessment_id: str
    student_id: int
    level_num: int
    started_at: datetime
    expires_at: datetime
    remaining_seconds: int
    status: str
    questions: List[AssessmentQuestionResponse]

class RunSampleRequest(BaseModel):
    question_id: str
    code: str
    language: str

class SampleRunResult(BaseModel):
    sample_index: int
    input_data: str
    expected_output: str
    actual_output: str
    passed: bool
    error: Optional[str] = None

class SubmitQuestionRequest(BaseModel):
    question_id: str
    code: str
    language: str

class SubmissionResponse(BaseModel):
    submission_id: int
    assessment_id: str
    question_id: str
    hidden_passed_count: int
    total_hidden_cases: int = 5
    marks_awarded: int
    status: str

class FinishAssessmentResponse(BaseModel):
    assessment_id: str
    q1_score: int
    q2_score: int
    total_score: int
    status: str

class SystemStats(BaseModel):
    total_users: int
    total_students: int
    total_questions: int
    total_assessments: int
    questions_per_level: dict
