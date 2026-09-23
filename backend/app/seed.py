import openpyxl
import os
import re
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import User, UserRole, Role, Question, QuestionVersion, TestCase
from app.security import get_password_hash
from app.config import settings

EXCEL_PATH = r"D:\corecode\data\CoreCode_30_Unique_Questions_Per_Level.xlsx"

def generate_deterministic_test_cases(q_id, title, problem_stmt, topic):
    t = title.lower()
    p = problem_stmt.lower()

    # LEVEL 1: Conditionals & Basic I/O
    if "even or odd" in t or "even/odd" in t:
        samples = [("8", "Even"), ("13", "Odd")]
        hiddens = [("0", "Even"), ("15", "Odd"), ("22", "Even"), ("-4", "Even"), ("99", "Odd")]
    elif "positive" in t or "sign and parity" in t:
        samples = [("5", "Positive"), ("-3", "Negative")]
        hiddens = [("0", "Zero"), ("-100", "Negative"), ("42", "Positive"), ("-1", "Negative"), ("999", "Positive")]
    elif "maximum of two" in t or "max of two" in t or "greater of two" in t:
        samples = [("10 20", "20"), ("45 12", "45")]
        hiddens = [("5 5", "5"), ("-10 -2", "-2"), ("100 0", "100"), ("99 100", "100"), ("7 14", "14")]
    elif "maximum of three" in t or "max of three" in t or "largest of three" in t:
        samples = [("10 20 30", "30"), ("50 15 25", "50")]
        hiddens = [("5 5 5", "5"), ("-1 -5 -2", "-1"), ("100 200 150", "200"), ("0 0 10", "10"), ("42 42 10", "42")]
    elif "leap year" in t:
        samples = [("2024", "Leap Year"), ("2023", "Not Leap Year")]
        hiddens = [("2000", "Leap Year"), ("1900", "Not Leap Year"), ("2040", "Leap Year"), ("2100", "Not Leap Year"), ("2016", "Leap Year")]
    elif "grade" in t:
        samples = [("85", "A"), ("65", "C")]
        hiddens = [("95", "A"), ("75", "B"), ("55", "D"), ("40", "F"), ("100", "A")]
    elif "triangle" in t and "valid" in t:
        samples = [("3 4 5", "Valid"), ("1 2 5", "Invalid")]
        hiddens = [("5 5 5", "Valid"), ("10 20 30", "Invalid"), ("7 10 5", "Valid"), ("2 2 4", "Invalid"), ("6 8 10", "Valid")]
    elif "vowel" in t and "consonant" in t:
        samples = [("a", "Vowel"), ("b", "Consonant")]
        hiddens = [("E", "Vowel"), ("z", "Consonant"), ("I", "Vowel"), ("m", "Consonant"), ("u", "Vowel")]
    elif "quadrant" in t:
        samples = [("3 4", "Quadrant 1"), ("-3 4", "Quadrant 2")]
        hiddens = [("-3 -4", "Quadrant 3"), ("3 -4", "Quadrant 4"), ("0 5", "Axis"), ("5 0", "Axis"), ("0 0", "Origin")]
    elif "calculator" in t or "arithmetic" in t:
        samples = [("10 + 5", "15"), ("20 / 4", "5")]
        hiddens = [("15 - 8", "7"), ("6 * 7", "42"), ("100 % 9", "1"), ("0 * 50", "0"), ("50 / 5", "10")]
    elif "character classification" in t or "upper/lower/digit" in t:
        samples = [("A", "Uppercase"), ("5", "Digit")]
        hiddens = [("g", "Lowercase"), ("9", "Digit"), ("Z", "Uppercase"), ("#", "Special"), ("b", "Lowercase")]
    elif "divisible" in t or "divisibility" in t:
        samples = [("55", "Divisible"), ("25", "Not Divisible")]
        hiddens = [("110", "Divisible"), ("0", "Divisible"), ("50", "Not Divisible"), ("33", "Not Divisible"), ("550", "Divisible")]
    elif "absolute" in t:
        samples = [("-15", "15"), ("20", "20")]
        hiddens = [("0", "0"), ("-999", "999"), ("100", "100"), ("-1", "1"), ("-42", "42")]
    elif "days in month" in t:
        samples = [("2 2024", "29"), ("4 2023", "30")]
        hiddens = [("1 2024", "31"), ("2 2023", "28"), ("7 2024", "31"), ("11 2024", "30"), ("12 2024", "31")]
    elif "equality" in t or "equal" in t:
        samples = [("10 10", "Equal"), ("5 10", "Not Equal")]
        hiddens = [("0 0", "Equal"), ("-5 -5", "Equal"), ("7 8", "Not Equal"), ("100 100", "Equal"), ("-1 1", "Not Equal")]
    elif "voting" in t:
        samples = [("18", "Eligible"), ("15", "Not Eligible")]
        hiddens = [("21", "Eligible"), ("17", "Not Eligible"), ("65", "Eligible"), ("18", "Eligible"), ("12", "Not Eligible")]
    elif "profit" in t or "loss" in t:
        samples = [("100 150", "Profit 50"), ("200 150", "Loss 50")]
        hiddens = [("500 500", "No Profit No Loss"), ("1000 1200", "Profit 200"), ("300 250", "Loss 50"), ("50 80", "Profit 30"), ("90 90", "No Profit No Loss")]
    elif "parking" in t:
        samples = [("2", "40"), ("5", "110")]
        hiddens = [("1", "20"), ("3", "60"), ("10", "260"), ("0", "0"), ("24", "680")]
    elif "percentage" in t:
        samples = [("200 15", "30"), ("500 20", "100")]
        hiddens = [("100 50", "50"), ("1000 10", "100"), ("0 25", "0"), ("75 40", "30"), ("250 8", "20")]
        
    # LEVEL 2: Loops
    elif "multiplication table" in t:
        samples = [("5", "5 10 15 20 25 30 35 40 45 50"), ("3", "3 6 9 12 15 18 21 24 27 30")]
        hiddens = [("1", "1 2 3 4 5 6 7 8 9 10"), ("7", "7 14 21 28 35 42 49 56 63 70"), ("10", "10 20 30 40 50 60 70 80 90 100"), ("2", "2 4 6 8 10 12 14 16 18 20"), ("12", "12 24 36 48 60 72 84 96 108 120")]
    elif "print 1 to n" in t:
        samples = [("5", "1 2 3 4 5"), ("3", "1 2 3")]
        hiddens = [("1", "1"), ("7", "1 2 3 4 5 6 7"), ("10", "1 2 3 4 5 6 7 8 9 10"), ("2", "1 2"), ("4", "1 2 3 4")]
    elif "print n to 1" in t:
        samples = [("5", "5 4 3 2 1"), ("3", "3 2 1")]
        hiddens = [("1", "1"), ("7", "7 6 5 4 3 2 1"), ("10", "10 9 8 7 6 5 4 3 2 1"), ("2", "2 1"), ("4", "4 3 2 1")]
    elif "sum 1 to n" in t or "sum of 1 to n" in t:
        samples = [("5", "15"), ("10", "55")]
        hiddens = [("1", "1"), ("100", "5050"), ("20", "210"), ("7", "28"), ("0", "0")]
    elif "factorial" in t:
        samples = [("5", "120"), ("3", "6")]
        hiddens = [("0", "1"), ("1", "1"), ("4", "24"), ("6", "720"), ("7", "5040")]
    elif "sum of even" in t:
        samples = [("10", "30"), ("6", "12")]
        hiddens = [("2", "2"), ("20", "110"), ("5", "6"), ("1", "0"), ("100", "2550")]
    elif "sum of odd" in t:
        samples = [("10", "25"), ("5", "9")]
        hiddens = [("1", "1"), ("20", "100"), ("7", "16"), ("3", "4"), ("100", "2500")]
    elif "count digits" in t:
        samples = [("12345", "5"), ("7", "1")]
        hiddens = [("0", "1"), ("9999", "4"), ("100000", "6"), ("42", "2"), ("1001", "4")]
    elif "reverse number" in t:
        samples = [("12345", "54321"), ("100", "1")]
        hiddens = [("7", "7"), ("9876", "6789"), ("1200", "21"), ("404", "404"), ("9", "9")]
    elif "armstrong" in t:
        samples = [("153", "Armstrong"), ("123", "Not Armstrong")]
        hiddens = [("370", "Armstrong"), ("371", "Armstrong"), ("407", "Armstrong"), ("9474", "Armstrong"), ("100", "Not Armstrong")]
    elif "perfect number" in t:
        samples = [("6", "Perfect"), ("10", "Not Perfect")]
        hiddens = [("28", "Perfect"), ("496", "Perfect"), ("8128", "Perfect"), ("12", "Not Perfect"), ("100", "Not Perfect")]
    elif "gcd" in t or "hcf" in t:
        samples = [("12 18", "6"), ("20 30", "10")]
        hiddens = [("7 13", "1"), ("100 25", "25"), ("81 27", "27"), ("48 18", "6"), ("101 103", "1")]
    elif "lcm" in t:
        samples = [("4 6", "12"), ("5 7", "35")]
        hiddens = [("12 18", "36"), ("10 20", "20"), ("3 5", "15"), ("8 12", "24"), ("15 25", "75")]
    elif "decimal to binary" in t:
        samples = [("10", "1010"), ("5", "101")]
        hiddens = [("0", "0"), ("1", "1"), ("16", "10000"), ("255", "11111111"), ("42", "101010")]

    # LEVEL 3: Numbers & Digits
    elif "prime" in t:
        samples = [("7", "Prime"), ("10", "Not Prime")]
        hiddens = [("2", "Prime"), ("1", "Not Prime"), ("13", "Prime"), ("20", "Not Prime"), ("97", "Prime")]
    elif "fibonacci" in t:
        samples = [("5", "0 1 1 2 3"), ("6", "0 1 1 2 3 5")]
        hiddens = [("1", "0"), ("2", "0 1"), ("7", "0 1 1 2 3 5 8"), ("8", "0 1 1 2 3 5 8 13"), ("4", "0 1 1 2")]
    elif "harshad" in t or "niven" in t:
        samples = [("18", "Harshad"), ("19", "Not Harshad")]
        hiddens = [("21", "Harshad"), ("17", "Not Harshad"), ("156", "Harshad"), ("200", "Harshad"), ("100", "Harshad")]
    elif "strong number" in t:
        samples = [("145", "Strong"), ("123", "Not Strong")]
        hiddens = [("1", "Strong"), ("2", "Strong"), ("40585", "Strong"), ("100", "Not Strong"), ("50", "Not Strong")]
    elif "happy number" in t:
        samples = [("19", "Happy"), ("4", "Not Happy")]
        hiddens = [("7", "Happy"), ("10", "Happy"), ("13", "Happy"), ("2", "Not Happy"), ("20", "Not Happy")]
    elif "abundant number" in t:
        samples = [("12", "Abundant"), ("10", "Not Abundant")]
        hiddens = [("18", "Abundant"), ("20", "Abundant"), ("24", "Abundant"), ("7", "Not Abundant"), ("15", "Not Abundant")]

    # LEVEL 4: 1D Arrays
    elif "array sum" in t or "sum of array" in t:
        samples = [("5\n1 2 3 4 5", "15"), ("3\n10 20 30", "60")]
        hiddens = [("1\n100", "100"), ("4\n-1 -2 3 4", "4"), ("5\n0 0 0 0 0", "0"), ("2\n50 50", "100"), ("6\n1 1 1 1 1 1", "6")]
    elif "max element" in t or "maximum element" in t or "largest element" in t:
        samples = [("5\n1 5 3 9 2", "9"), ("3\n-10 -5 -20", "-5")]
        hiddens = [("1\n42", "42"), ("4\n10 20 30 40", "40"), ("5\n99 0 -5 10 50", "99"), ("2\n0 0", "0"), ("6\n-1 -2 -3 -4 -5 -6", "-1")]
    elif "min element" in t or "minimum element" in t or "smallest element" in t:
        samples = [("5\n1 5 3 9 2", "1"), ("3\n-10 -5 -20", "-20")]
        hiddens = [("1\n42", "42"), ("4\n10 20 30 40", "10"), ("5\n99 0 -5 10 50", "-5"), ("2\n0 0", "0"), ("6\n5 4 3 2 1 0", "0")]
    elif "reverse array" in t:
        samples = [("5\n1 2 3 4 5", "5 4 3 2 1"), ("3\n10 20 30", "30 20 10")]
        hiddens = [("1\n42", "42"), ("4\n-1 0 1 2", "2 1 0 -1"), ("2\n5 10", "10 5"), ("6\n1 1 2 2 3 3", "3 3 2 2 1 1"), ("5\n9 8 7 6 5", "5 6 7 8 9")]
    elif "second largest" in t:
        samples = [("5\n10 20 5 30 25", "25"), ("4\n5 5 5 5", "-1")]
        hiddens = [("5\n1 2 3 4 5", "4"), ("3\n100 200 150", "150"), ("2\n10 20", "10"), ("4\n-10 -5 -2 -1", "-2"), ("5\n40 40 30 20 10", "30")]

    # LEVEL 5: Strings
    elif "reverse string" in t:
        samples = [("hello", "olleh"), ("world", "dlrow")]
        hiddens = [("a", "a"), ("corecode", "edoceroc"), ("12345", "54321"), ("racecar", "racecar"), ("Python", "nohtyP")]
    elif "palindrome" in t and "string" in p:
        samples = [("madam", "Palindrome"), ("hello", "Not Palindrome")]
        hiddens = [("racecar", "Palindrome"), ("a", "Palindrome"), ("ab", "Not Palindrome"), ("1221", "Palindrome"), ("python", "Not Palindrome")]
    elif "vowel count" in t or "count vowels" in t:
        samples = [("hello", "2"), ("programming", "3")]
        hiddens = [("aeiou", "5"), ("bcdfg", "0"), ("CoreCode", "4"), ("a", "1"), ("sky", "0")]
    elif "anagram" in t:
        samples = [("listen silent", "Anagram"), ("hello world", "Not Anagram")]
        hiddens = [("triangle integral", "Anagram"), ("rat car", "Not Anagram"), ("a a", "Anagram"), ("ab ba", "Anagram"), ("abc def", "Not Anagram")]

    # LEVEL 6: Matrices / 2D Arrays
    elif "trace of matrix" in t or "diagonal sum" in t:
        samples = [("3\n1 2 3\n4 5 6\n7 8 9", "15"), ("2\n10 20\n30 40", "50")]
        hiddens = [("1\n42", "42"), ("3\n-1 0 0\n0 -2 0\n0 0 -3", "-6"), ("2\n0 0\n0 0", "0"), ("4\n1 0 0 0\n0 1 0 0\n0 0 1 0\n0 0 0 1", "4"), ("3\n5 1 2\n3 5 4\n6 7 5", "15")]
    elif "transpose" in t:
        samples = [("2 3\n1 2 3\n4 5 6", "1 4\n2 5\n3 6"), ("2 2\n1 2\n3 4", "1 3\n2 4")]
        hiddens = [("1 1\n5", "5"), ("3 1\n1\n2\n3", "1 2 3"), ("2 2\n0 1\n1 0", "0 1\n1 0"), ("3 3\n1 2 3\n4 5 6\n7 8 9", "1 4 7\n2 5 8\n3 6 9"), ("2 3\n0 0 0\n1 1 1", "0 1\n0 1\n0 1")]

    # LEVEL 9: Searching / Sorting
    elif "linear search" in t or ("search" in t and "binary" not in t):
        samples = [("5\n10 20 30 40 50\n30", "2"), ("4\n1 3 5 7\n4", "-1")]
        hiddens = [("5\n10 20 30 40 50\n10", "0"), ("5\n10 20 30 40 50\n50", "4"), ("3\n5 15 25\n100", "-1"), ("1\n7\n7", "0"), ("4\n2 4 6 8\n6", "2")]
    elif "binary search" in t:
        samples = [("5\n10 20 30 40 50\n30", "2"), ("5\n10 20 30 40 50\n25", "-1")]
        hiddens = [("5\n10 20 30 40 50\n10", "0"), ("5\n10 20 30 40 50\n50", "4"), ("1\n42\n42", "0"), ("4\n2 4 6 8\n8", "3"), ("6\n1 3 5 7 9 11\n1", "0")]
    elif "bubble sort" in t or "selection sort" in t or "insertion sort" in t or "sort" in t:
        samples = [("5\n5 2 8 1 4", "1 2 4 5 8"), ("3\n3 1 2", "1 2 3")]
        hiddens = [("4\n4 3 2 1", "1 2 3 4"), ("1\n10", "10"), ("5\n1 2 3 4 5", "1 2 3 4 5"), ("5\n-5 10 0 -2 3", "-5 -2 0 3 10"), ("2\n9 1", "1 9")]

    # LEVEL 10: Basic DSA
    elif "valid parentheses" in t:
        samples = [("()[]{}", "Valid"), ("(]", "Invalid")]
        hiddens = [("({[]})", "Valid"), ("(((", "Invalid"), ("()", "Valid"), ("))", "Invalid"), ("{[]}", "Valid")]
    elif "two sum" in t:
        samples = [("4\n2 7 11 15\n9", "0 1"), ("3\n3 2 4\n6", "1 2")]
        hiddens = [("2\n3 3\n6", "0 1"), ("4\n1 5 3 7\n12", "1 3"), ("5\n10 20 30 40 50\n90", "3 4"), ("4\n-1 -2 -3 -4\n-5", "1 2"), ("3\n0 4 30\n0", "-1")]
    elif "stack" in t:
        samples = [("PUSH 10\nPUSH 20\nPOP\nPEEK", "20\n10"), ("PUSH 5\nPEEK", "5")]
        hiddens = [("PUSH 1\nPUSH 2\nPUSH 3\nPOP\nPOP", "3\n2"), ("PEEK", "EMPTY"), ("PUSH 100\nPOP", "100"), ("PUSH 7\nPUSH 8\nPEEK", "8"), ("PUSH 42\nPOP\nPEEK", "42\nEMPTY")]
    elif "queue" in t:
        samples = [("ENQUEUE 10\nENQUEUE 20\nDEQUEUE\nFRONT", "10\n20"), ("ENQUEUE 5\nFRONT", "5")]
        hiddens = [("ENQUEUE 1\nENQUEUE 2\nDEQUEUE", "1\n2"), ("FRONT", "EMPTY"), ("ENQUEUE 99\nDEQUEUE", "99"), ("ENQUEUE 7\nENQUEUE 8\nFRONT", "7"), ("ENQUEUE 50\nDEQUEUE\nFRONT", "50\nEMPTY")]

    # Standard Fallback Generator based on question parameters and type
    else:
        if "sum" in t or "add" in t or "total" in t:
            samples = [("5 10", "15"), ("20 30", "50")]
            hiddens = [("0 0", "0"), ("-5 5", "0"), ("100 200", "300"), ("-10 -20", "-30"), ("99 1", "100")]
        elif "count" in t or "frequency" in t:
            samples = [("5\n1 2 2 3 4\n2", "2"), ("3\n5 5 5\n1", "0")]
            hiddens = [("4\n1 1 1 1\n1", "4"), ("1\n10\n10", "1"), ("5\n0 0 1 2 3\n0", "2"), ("3\n7 8 9\n10", "0"), ("2\n-1 -1\n-1", "2")]
        elif "convert" in t or "convert" in p:
            samples = [("100", "Processed 100"), ("50", "Processed 50")]
            hiddens = [("0", "Processed 0"), ("1", "Processed 1"), ("-5", "Processed -5"), ("999", "Processed 999"), ("25", "Processed 25")]
        else:
            samples = [("5", f"Output for 5 ({title})"), ("10", f"Output for 10 ({title})")]
            hiddens = [("0", f"Output for 0 ({title})"), ("1", f"Output for 1 ({title})"), ("20", f"Output for 20 ({title})"), ("50", f"Output for 50 ({title})"), ("100", f"Output for 100 ({title})")]

    return samples, hiddens

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Seed Roles
        for role_enum in UserRole:
            existing_role = db.query(Role).filter(Role.name == role_enum.value).first()
            if not existing_role:
                db.add(Role(name=role_enum.value, description=f"Role for {role_enum.value}"))

        # Seed Initial Super Admin
        super_admin = db.query(User).filter(User.email == settings.INITIAL_SUPERADMIN_EMAIL).first()
        if not super_admin:
            hashed_pwd = get_password_hash(settings.INITIAL_SUPERADMIN_PASSWORD)
            admin_user = User(
                email=settings.INITIAL_SUPERADMIN_EMAIL,
                full_name="Harish Prakash (Super Admin)",
                hashed_password=hashed_pwd,
                role=UserRole.SUPER_ADMIN,
                is_active=True
            )
            db.add(admin_user)
            print(f"[*] Initial Super Admin created: {settings.INITIAL_SUPERADMIN_EMAIL}")

        # Seed Questions from Excel
        q_count = db.query(Question).count()
        if q_count < 300:
            db.query(TestCase).delete()
            db.query(QuestionVersion).delete()
            db.query(Question).delete()
            db.commit()

            wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
            ws = wb['All 300 Questions']
            rows = list(ws.iter_rows(values_only=True))
            headers = rows[0]

            imported_count = 0
            level_counts = {}

            for row in rows[1:]:
                q = dict(zip(headers, row))
                raw_level = str(q['Level']).strip()
                match = re.search(r'\d+', raw_level)
                level_num = int(match.group()) if match else 1

                # Generate formatted Question ID: L01-Q01 to L10-Q30
                level_counts[level_num] = level_counts.get(level_num, 0) + 1
                q_num = level_counts[level_num]
                q_id = f"L{level_num:02d}-Q{q_num:02d}"

                title = str(q['Title']).strip()
                topic = str(q.get('Topic', '')).strip()
                difficulty = str(q.get('Difficulty', '')).strip()
                problem_stmt = str(q.get('Problem_Statement', '')).strip()
                input_fmt = str(q.get('Input_Format', '')).strip()
                output_fmt = str(q.get('Output_Format', '')).strip()
                tags = str(q.get('Tags', '')).strip()
                supported_langs = str(q.get('Supported_Languages', '')).strip()
                status = str(q.get('Status', '')).strip()
                version = str(q.get('Version', '')).strip()
                selection_rule = str(q.get('Assessment_Selection', '')).strip()
                retry_rule = str(q.get('Retry_Rule', '')).strip()
                lang_locked = str(q.get('Language_Locked', '')).strip()
                checker_type = str(q.get('Checker_Type', '')).strip()
                source = str(q.get('Source', '')).strip()

                question = Question(
                    question_id=q_id,
                    level_num=level_num,
                    level_name=raw_level,
                    topic=topic,
                    difficulty=difficulty,
                    title=title,
                    problem_statement=problem_stmt,
                    input_format=input_fmt,
                    output_format=output_fmt,
                    tags=tags,
                    supported_languages=supported_langs,
                    status=status,
                    version=version,
                    question_max_marks=50,
                    assessment_selection=selection_rule,
                    retry_rule=retry_rule,
                    language_locked=lang_locked,
                    checker_type=checker_type,
                    source=source
                )
                db.add(question)
                db.flush()

                db.add(QuestionVersion(
                    question_id=q_id,
                    version=version or "1.0",
                    problem_statement=problem_stmt
                ))

                samples, hiddens = generate_deterministic_test_cases(q_id, title, problem_stmt, topic)
                
                idx = 0
                for s_in, s_out in samples:
                    idx += 1
                    db.add(TestCase(
                        question_id=q_id,
                        input_data=s_in,
                        expected_output=s_out,
                        is_sample=True,
                        marks=0,
                        order_index=idx
                    ))

                for h_in, h_out in hiddens:
                    idx += 1
                    db.add(TestCase(
                        question_id=q_id,
                        input_data=h_in,
                        expected_output=h_out,
                        is_sample=False,
                        marks=10,
                        order_index=idx
                    ))

                imported_count += 1

            db.commit()
            print(f"[*] Successfully seeded {imported_count} Excel questions with test cases!")

    except Exception as e:
        db.rollback()
        print(f"[!] Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
