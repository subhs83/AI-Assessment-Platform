from smart_exam_system.extensions import db
from smart_exam_system.models.exam import ExamModel
from smart_exam_system.models.democontact import ContactMessage  # adjust if needed
from datetime import datetime
from sqlalchemy import inspect, text

def fix_contact_phone_column():
    """
    Ensure phone column exists safely (Render-safe)
    """
   

    inspector = inspect(db.engine)
    columns = [c["name"] for c in inspector.get_columns("contact_messages")]

    if "phone" not in columns:
        db.session.execute(
            text("ALTER TABLE contact_messages ADD COLUMN phone VARCHAR(20)")
        )
        db.session.commit()
        print("✅ Added phone column to contact_messages")
    else:
        print("ℹ️ phone column already exists")


def fix_exam_null_dates():
    """
    Fix NULL values caused by migration change
    """
    exams = ExamModel.query.all()

    fixed = 0

    for exam in exams:
        changed = False

        if exam.start_date is None:
            exam.start_date = datetime.utcnow()
            changed = True

        if exam.end_date is None:
            exam.end_date = datetime.utcnow()
            changed = True

        if changed:
            fixed += 1

    db.session.commit()
    print(f"✅ Fixed {fixed} exam records")


def run_all_fixes():
    print("🔧 Running DB Fixes...")

    fix_contact_phone_column()
    fix_exam_null_dates()

    print("✅ All DB fixes completed")