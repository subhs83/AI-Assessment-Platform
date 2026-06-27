import random
import string
from smart_exam_system.extensions import db
from sqlalchemy import func
from smart_exam_system.models import (
ExamModel,  
QuestionModel,
AttemptModel,
UserModel, 
SchoolModel
)
 
from smart_exam_system.api.utils.helpers import apply_exam_status
from datetime import datetime, timezone

import logging

logger = logging.getLogger(__name__)


def get_school_analytics(school_id):

    total_teachers = UserModel.query.filter_by(
        role="teacher",
        school_id=school_id
    ).count()

    exams = ExamModel.query.filter_by(
        school_id=school_id
    ).all()

    exam_ids = [exam.id for exam in exams]

    attempts = []

    if exam_ids:
        attempts = AttemptModel.query.filter(
            AttemptModel.exam_id.in_(exam_ids),
            AttemptModel.is_submitted == True
        ).all()

    school_average = 0

    if attempts:
        school_average = round(
            sum(a.percentage or 0 for a in attempts) /
            len(attempts),
            0
        )

    top_teachers = sorted(
        get_teacher_performance_by_school(school_id),
        key=lambda x: (
            x["avg_percentage"],
            x["attempt_count"]
        ),
        reverse=True
    )[:5]

    top_exams = sorted(
        get_exam_performance_by_school(school_id),
        key=lambda x: (
            x["avg_percentage"],
            x["attempt_count"]
        ),
        reverse=True
    )[:5]

    return {
        "total_teachers": total_teachers,
        "total_exams": len(exams),
        "total_attempts": len(attempts),
        "school_average": school_average,

        "top_teachers": top_teachers,
        "top_exams": top_exams
    }

def get_exam_performance_by_school(school_id):

    exams = ExamModel.query.filter_by(
        school_id=school_id
    ).all()

    data = []

    for exam in exams:

        attempts = AttemptModel.query.filter(
            AttemptModel.exam_id == exam.id,
            AttemptModel.is_submitted == True
        ).all()

        avg_percentage = 0

        if attempts:
            avg_percentage = round(
                sum(a.percentage or 0 for a in attempts) /
                len(attempts),
                2
            )

        teacher = db.session.get(UserModel, exam.teacher_id)

        data.append({
            "exam_id": exam.id,
            "exam_title": exam.title,
            "class_name": exam.class_name,
            "teacher_id": teacher.id if teacher else None,
            "teacher_name": teacher.name if teacher else "Unknown",

            "attempt_count": len(attempts),
            "avg_percentage": avg_percentage,

            "status": exam.status,
            "start_date": (
                exam.start_date.isoformat()
                if exam.start_date else None
            ),

            "end_date": (
                exam.end_date.isoformat()
                if exam.end_date else None
            )
        })

    return data


def get_teacher_performance_by_school( school_id):

        teachers = UserModel.query.filter_by(
            role="teacher",
            school_id=school_id
        ).all()

        data = []

        for teacher in teachers:

            exams = ExamModel.query.filter_by(
                teacher_id=teacher.id,
                school_id=school_id
            ).all()

            exam_ids = [exam.id for exam in exams]

            attempts = []

            if exam_ids:
                attempts = AttemptModel.query.filter(
                    AttemptModel.exam_id.in_(exam_ids),
                    AttemptModel.is_submitted == True
                ).all()

            avg_percentage = 0

            if attempts:
                avg_percentage = round(
                    sum(a.percentage or 0 for a in attempts) /
                    len(attempts),
                    2
                )

            data.append({
                "teacher_id": teacher.id,
                "teacher_name": teacher.name,
                "email": teacher.email,
                "is_active": teacher.is_active,

                "exam_count": len(exams),
                "attempt_count": len(attempts),
                "avg_percentage": avg_percentage
            })

        return data




def get_teacher_performance(school_id):

    return UserModel.get_teacher_performance_by_school(
        school_id
    )

def apply_exam_status(exam):

    now = datetime.now()   # ✅ naive datetime (matches DB)

    status = exam.get("status")
    end_date = exam.get("end_date")

    display_status = "draft"

    # Safe comparison
    if end_date and end_date < now:
        display_status = "expired"

    elif status == "published":
        display_status = "published"

    elif status in [None, "", "draft"]:
        display_status = "draft"

    else:
        display_status = status

    exam["display_status"] = display_status
    exam["is_expired"] = display_status == "expired"
    exam["is_published"] = display_status == "published"
    exam["is_draft"] = display_status == "draft"

    return exam



def get_teacher_exams(teacher_id, school_id):

    exams = db.session.query(
        ExamModel.id,
        ExamModel.title,
        ExamModel.duration_minutes,
        ExamModel.status,
        ExamModel.quiz_code,
        ExamModel.max_attempts_per_student,
        ExamModel.created_at,
        ExamModel.end_date,

        func.count(func.distinct(QuestionModel.id)).label("total_questions"),
        func.count(func.distinct(AttemptModel.id)).label("total_attempts")

    ).outerjoin(
        QuestionModel, QuestionModel.exam_id == ExamModel.id
    ).outerjoin(
        AttemptModel, AttemptModel.exam_id == ExamModel.id
    ).filter(
        ExamModel.teacher_id == teacher_id,
        ExamModel.school_id == school_id   # ✅ IMPORTANT FIX
    ).group_by(
        ExamModel.id,
        ExamModel.title,
        ExamModel.duration_minutes,
        ExamModel.status,
        ExamModel.quiz_code,
        ExamModel.max_attempts_per_student,
        ExamModel.created_at,
        ExamModel.end_date
    ).order_by(
        ExamModel.created_at.desc()
    ).all()

    result = []

    for e in exams:
        exam = dict(e._mapping)
        result.append(apply_exam_status(exam))

    return result

# -------------------------------
# Create Exam
# -------------------------------


def create_exam(
    teacher_id,
    school_id,
    title,
    class_name,
    duration_minutes,
    marks,
    negative,
    max_attempts,
    start_date,
    end_date,
    show_result_review=True
    ):
    try:
        if duration_minutes <= 0:
            return False, "Duration must be greater than 0."
        
        if marks <= 0:
            return False, "Marks per question must be greater than 0."

        if negative < 0:
            return False, "Negative marks cannot be negative."

        if max_attempts <= 0:
            return False, "Max attempts must be at least 1."
        exam = ExamModel(
            title=title,
            class_name=class_name,
            duration_minutes= duration_minutes,
            marks_per_question=marks,
            negative_marks=negative,
            max_attempts_per_student=max_attempts,
            school_id=school_id,
            teacher_id=teacher_id,
            start_date=start_date,
            end_date=end_date,
            show_result_review=show_result_review    
        )

        db.session.add(exam)
        db.session.commit()

        return True, "Exam created successfully (Draft mode)"

    except Exception:
        db.session.rollback()
        logger.exception("Failed to create exam")
        return False, "Failed to create exam."


def parse_exam_datetime(datetime_string):

    return datetime.strptime(
        datetime_string,
        "%Y-%m-%dT%H:%M"
    ).astimezone(timezone.utc)


def extract_exam_form_data(form_data):

    show_result_review = str(
        form_data.get("show_result_review", "true")
    ).lower() == "true"

    start_date = parse_exam_datetime(
        form_data.get("start_date")
    )

    end_date = parse_exam_datetime(
        form_data.get("end_date")
    )


    if not start_date or not end_date:
        raise ValueError(
            "Start date and end date are required."
        )

    if end_date <= start_date:
        raise ValueError(
            "End date must be after start date."
        )
    
    if len(form_data.get("class_name", "")) > 50:
        raise ValueError(
            "Class name cannot exceed 50 characters."
        )

    return {
        "title": form_data.get("title"),

        "class_name": (
            form_data.get("class_name") or ""
        ).strip(),

        "duration_minutes": int(
            form_data.get("duration_minutes") or 0
        ),

        "marks": float(
            form_data.get("marks") or 1
        ),

        "negative": float(
            form_data.get("negative") or 0
        ),

        "max_attempts": int(
            form_data.get("max_attempts") or 1
        ),

        "start_date": start_date,
        "end_date": end_date,

        "show_result_review": show_result_review,
    }
# -------------------------------
# Publish Exam
# -------------------------------
def generate_quiz_code(length=8):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def generate_unique_quiz_code():

    while True:

        quiz_code = generate_quiz_code()

        exists = ExamModel.query.filter_by(
            quiz_code=quiz_code
        ).first()

        if not exists:
            return quiz_code

def publish_exam(exam_id, school_id, teacher_id=None):

    # ---------------------------------
    # SECURITY: validate exam belongs to school (and teacher if needed)
    # ---------------------------------
    exam = ExamModel.query.filter_by(
        id=exam_id,
        school_id=school_id
    ).first()

    if not exam:
        return False, "Invalid exam or unauthorized access"

    # Optional extra safety (recommended in LMS)
    if teacher_id and exam.teacher_id != teacher_id:
        return False, "You are not allowed to publish this exam"

    # ---------------------------------
    # CHECK QUESTIONS (SCOPED SAFE)
    # ---------------------------------
    q_count = db.session.query(func.count(QuestionModel.id))\
        .filter(QuestionModel.exam_id == exam_id)\
        .scalar()

    if q_count == 0:
        return False, "Cannot publish exam without questions"

    # ---------------------------------
    # GENERATE QUIZ CODE
    # ---------------------------------
    quiz_code = generate_unique_quiz_code()

    # ---------------------------------
    # UPDATE EXAM
    # ---------------------------------
    exam.status = "published"
    exam.quiz_code = quiz_code
    exam.published_at = db.func.current_timestamp()

    db.session.commit()

    return True, quiz_code

# -------------------------------
# Delete Exam (only if no attempts)
# -------------------------------

def delete_exam(exam_id):

    attempt_count = db.session.query(func.count(AttemptModel.id))\
        .filter(AttemptModel.exam_id == exam_id)\
        .scalar()

    if attempt_count > 0:
        return False, "Cannot delete exam with student attempts."

    # delete questions
    try:

        QuestionModel.query.filter_by(
            exam_id=exam_id
        ).delete(synchronize_session=False)

        ExamModel.query.filter_by(
            id=exam_id
        ).delete(synchronize_session=False)

        db.session.commit()

        return True, "Exam deleted successfully."

    except Exception:
        db.session.rollback()
        logger.exception("Failed to delete question")
        return False, "Failed to delete question."

