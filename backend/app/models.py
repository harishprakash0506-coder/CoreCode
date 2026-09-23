import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    SUPER_ADMIN = "SUPER_ADMIN"
    ASSESSMENT_ADMIN = "ASSESSMENT_ADMIN"
    REVIEWER = "REVIEWER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    attempts = relationship("StudentAttempt", back_populates="student")
    assessments = relationship("Assessment", back_populates="student")
    submissions = relationship("Submission", back_populates="student")

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. L01-Q01
    level_num = Column(Integer, index=True, nullable=False) # 1 to 10
    level_name = Column(String(50), nullable=False) # e.g. Level 1
    topic = Column(String(100), nullable=True)
    difficulty = Column(String(50), nullable=True)
    title = Column(String(255), nullable=False)
    problem_statement = Column(Text, nullable=False)
    input_format = Column(Text, nullable=True)
    output_format = Column(Text, nullable=True)
    tags = Column(String(255), nullable=True)
    supported_languages = Column(String(255), nullable=True)
    status = Column(String(50), default="Active")
    version = Column(String(50), default="1.0")
    question_max_marks = Column(Integer, default=50)
    assessment_selection = Column(String(255), nullable=True)
    retry_rule = Column(String(255), nullable=True)
    language_locked = Column(String(50), nullable=True)
    checker_type = Column(String(50), nullable=True)
    source = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    test_cases = relationship("TestCase", back_populates="question", cascade="all, delete-orphan")
    versions = relationship("QuestionVersion", back_populates="question", cascade="all, delete-orphan")

class QuestionVersion(Base):
    __tablename__ = "question_versions"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(String(50), ForeignKey("questions.question_id"), nullable=False)
    version = Column(String(50), nullable=False)
    problem_statement = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("Question", back_populates="versions")

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(String(50), ForeignKey("questions.question_id"), nullable=False)
    input_data = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=False)
    is_sample = Column(Boolean, default=False) # True = visible sample case, False = hidden test case
    marks = Column(Integer, default=10) # 10 marks per hidden test case
    order_index = Column(Integer, default=0)

    question = relationship("Question", back_populates="test_cases")

class StudentAttempt(Base):
    __tablename__ = "student_attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    level_num = Column(Integer, nullable=False)
    question_id = Column(String(50), ForeignKey("questions.question_id"), nullable=False)
    attempted_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="attempts")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(100), primary_key=True) # UUID
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    level_num = Column(Integer, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False) # 60 minutes after started_at
    status = Column(String(50), default="IN_PROGRESS") # IN_PROGRESS, SUBMITTED, EXPIRED
    q1_score = Column(Integer, default=0)
    q2_score = Column(Integer, default=0)
    total_score = Column(Integer, default=0)

    student = relationship("User", back_populates="assessments")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(String(100), ForeignKey("assessments.id"), nullable=False)
    question_id = Column(String(50), ForeignKey("questions.question_id"), nullable=False)
    q_order = Column(Integer, nullable=False) # 1 or 2

    assessment = relationship("Assessment", back_populates="questions")
    question = relationship("Question")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(String(100), ForeignKey("assessments.id"), nullable=False)
    question_id = Column(String(50), ForeignKey("questions.question_id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    code = Column(Text, nullable=False)
    language = Column(String(50), nullable=False)
    score = Column(Integer, default=0)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    assessment = relationship("Assessment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
    execution_results = relationship("ExecutionResult", back_populates="submission", cascade="all, delete-orphan")

class ExecutionResult(Base):
    __tablename__ = "execution_results"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    test_case_id = Column(Integer, ForeignKey("test_cases.id"), nullable=False)
    passed = Column(Boolean, default=False)
    stdout = Column(Text, nullable=True)
    stderr = Column(Text, nullable=True)
    execution_time_ms = Column(Integer, default=0)

    submission = relationship("Submission", back_populates="execution_results")

class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(String(100), ForeignKey("assessments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    violation_type = Column(String(100), nullable=False) # TAB_SWITCH, COPY_PASTE, LEAVE_FULLSCREEN
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
