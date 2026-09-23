from app.database import SessionLocal, engine, Base
from app.models import User, UserRole, Question, TestCase
from app.schemas import UserCreate, UserLogin
from app.routers import auth, questions, admin, student
from app.security import verify_password, get_password_hash
from fastapi import HTTPException

def test_database_connection_and_seeding():
    db = SessionLocal()
    try:
        q_count = db.query(Question).count()
        tc_count = db.query(TestCase).count()
        assert q_count == 300, f"Expected 300 questions, got {q_count}"
        assert tc_count == 2100, f"Expected 2100 test cases, got {tc_count}"
        
        # Verify 30 per level
        for lvl in range(1, 11):
            c = db.query(Question).filter(Question.level_num == lvl).count()
            assert c == 30, f"Level {lvl} has {c} questions, expected 30"
            
        print("[OK] Database connection & Excel seeding verified (300 questions, 2100 test cases)")
    finally:
        db.close()

def test_question_security():
    db = SessionLocal()
    try:
        sample_q = db.query(Question).first()
        samples = db.query(TestCase).filter(TestCase.question_id == sample_q.question_id, TestCase.is_sample == True).all()
        hiddens = db.query(TestCase).filter(TestCase.question_id == sample_q.question_id, TestCase.is_sample == False).all()
        
        assert len(samples) == 2, "Each question must have 2 sample test cases"
        assert len(hiddens) == 5, "Each question must have 5 hidden test cases"
        
        admin_qs = questions.get_admin_question_bank(level=1, db=db, admin_user=None)
        assert len(admin_qs) == 30
        for q in admin_qs:
            # Verify hidden test cases count is returned, but NOT hidden test case contents!
            assert q.hidden_test_cases_count == 5
            assert len(q.sample_test_cases) == 2
            for tc in q.sample_test_cases:
                assert tc.is_sample is True
                
        print("[OK] Question security verified (Hidden test cases are strictly backend-only)")
    finally:
        db.close()

def test_student_authentication_flow():
    db = SessionLocal()
    try:
        test_email = "autotest_student@corecode.io"
        test_pass = "StudentPass2026!"
        
        # Clean up existing test user
        existing = db.query(User).filter(User.email == test_email).first()
        if existing:
            db.delete(existing)
            db.commit()

        # 1. Register student
        reg_input = UserCreate(email=test_email, full_name="Auto Student", password=test_pass, role=UserRole.STUDENT)
        created_user = auth.register_student(reg_input, db)
        assert created_user.email == test_email
        assert created_user.role == UserRole.STUDENT
        assert verify_password(test_pass, created_user.hashed_password) is True

        # 2. Login student
        login_input = UserLogin(email=test_email, password=test_pass)
        token_res = auth.login(login_input, db)
        assert token_res["access_token"] is not None
        assert token_res["user"].email == test_email

        # 3. Duplicate registration check
        try:
            auth.register_student(reg_input, db)
            assert False, "Should have raised HTTPException for duplicate email"
        except HTTPException as e:
            assert e.status_code == 400

        # 4. Student dashboard stats
        stats = student.get_student_dashboard_stats(db=db, student=created_user)
        assert stats["email"] == test_email
        assert len(stats["level_progress"]) == 10

        print("[OK] Student registration, BCrypt password hashing, login, and dashboard stats verified")
    finally:
        db.close()

def test_superadmin_authentication_and_authorization():
    db = SessionLocal()
    try:
        admin_email = "harishprakash0506@gmail.com"
        admin_pass = "Admin@CoreCode2026!"

        # 1. Verify Super Admin exists
        admin_user = db.query(User).filter(User.email == admin_email).first()
        assert admin_user is not None, "Super Admin user not found"
        assert admin_user.role == UserRole.SUPER_ADMIN
        assert verify_password(admin_pass, admin_user.hashed_password) is True

        # 2. Login Super Admin
        login_res = auth.login(UserLogin(email=admin_email, password=admin_pass), db)
        assert login_res["access_token"] is not None

        # 3. Admin stats endpoint
        stats = admin.get_admin_stats(db=db, admin_user=admin_user)
        assert stats.total_questions == 300
        assert stats.total_users >= 2

        print("[OK] Initial Super Admin account, authentication, and protected admin endpoints verified")
    finally:
        db.close()

if __name__ == "__main__":
    print("\n==================================================")
    print(" CORECODE PHASE 1 VERIFICATION & TEST SUITE")
    print("==================================================\n")
    test_database_connection_and_seeding()
    test_question_security()
    test_student_authentication_flow()
    test_superadmin_authentication_and_authorization()
    print("\n[SUCCESS] ALL PHASE 1 TESTS PASSED SUCCESSFULLY WITH 100% COMPLIANCE!\n")
