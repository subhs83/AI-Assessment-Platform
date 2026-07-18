import random
import string
from smart_exam_system.extensions import db
from sqlalchemy import func
from pathlib import Path
from werkzeug.exceptions import NotFound
from smart_exam_system.models import (
ExamModel,  
QuestionModel,
AttemptModel,
UserModel, 
ExamTargetModel,
)
from smart_exam_system.api.services.exam_target_service import (
    create_exam_targets,
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

    # ---------------------------------
    # Load all exams
    # ---------------------------------
    exams = ExamModel.query.filter_by(
        school_id=school_id
    ).all()

    if not exams:
        return []

    # ---------------------------------
    # Load all teachers once
    # ---------------------------------
    teachers = {
        teacher.id: teacher
        for teacher in UserModel.query.filter_by(
            school_id=school_id,
            role="teacher",
        ).all()
    }

    # ---------------------------------
    # Load attempt statistics once
    # ---------------------------------
    attempt_stats = {
        row.exam_id: {
            "attempt_count": row.attempt_count,
            "avg_percentage": round(
                float(row.avg_percentage or 0),
                2,
            ),
        }
        for row in (
            db.session.query(
                AttemptModel.exam_id,
                func.count(AttemptModel.id).label(
                    "attempt_count"
                ),
                func.avg(AttemptModel.percentage).label(
                    "avg_percentage"
                ),
            )
            .filter(
                AttemptModel.is_submitted == True
            )
            .group_by(
                AttemptModel.exam_id
            )
            .all()
        )
    }

    # ---------------------------------
    # Build response
    # ---------------------------------
    data = []

    for exam in exams:

        stats = attempt_stats.get(
            exam.id,
            {
                "attempt_count": 0,
                "avg_percentage": 0,
            },
        )

        teacher = teachers.get(exam.teacher_id)

        data.append({
            "exam_id": exam.id,
            "exam_uid": exam.exam_uid,
            "exam_title": exam.title,
            "class_section": exam.class_section,

            "teacher_id": teacher.id if teacher else None,
            "teacher_name": teacher.name if teacher else "Unknown",

            "attempt_count": stats["attempt_count"],
            "avg_percentage": stats["avg_percentage"],

            "status": exam.status,

            "start_date": (
                exam.start_date.isoformat()
                if exam.start_date
                else None
            ),

            "end_date": (
                exam.end_date.isoformat()
                if exam.end_date
                else None
            ),
        })

    return data


from sqlalchemy import func


def get_teacher_performance_by_school(school_id):

    # ---------------------------------
    # Load all teachers
    # ---------------------------------
    teachers = UserModel.query.filter_by(
        role="teacher",
        school_id=school_id,
    ).all()

    if not teachers:
        return []

    # ---------------------------------
    # Load all exams once
    # ---------------------------------
    exams = ExamModel.query.filter_by(
        school_id=school_id,
    ).all()

    teacher_exam_count = {}
    exam_to_teacher = {}

    for exam in exams:

        exam_to_teacher[exam.id] = exam.teacher_id

        teacher_exam_count[exam.teacher_id] = (
            teacher_exam_count.get(
                exam.teacher_id,
                0,
            )
            + 1
        )

    # ---------------------------------
    # Load all attempt statistics once
    # ---------------------------------
    teacher_stats = {}

    rows = (
        db.session.query(
            AttemptModel.exam_id,
            func.count(AttemptModel.id).label(
                "attempt_count"
            ),
            func.sum(AttemptModel.percentage).label(
                "total_percentage"
            ),
        )
        .filter(
            AttemptModel.is_submitted == True,
            AttemptModel.exam_id.in_(exam_to_teacher.keys()),
        )
        .group_by(
            AttemptModel.exam_id,
        )
        .all()
    )

    for row in rows:

        teacher_id = exam_to_teacher.get(
            row.exam_id
        )

        if teacher_id is None:
            continue

        stats = teacher_stats.setdefault(
            teacher_id,
            {
                "attempt_count": 0,
                "percentage_sum": 0,
            },
        )

        stats["attempt_count"] += row.attempt_count
        stats["percentage_sum"] += (
            row.total_percentage or 0
        )

    # ---------------------------------
    # Build response
    # ---------------------------------
    data = []

    for teacher in teachers:

        stats = teacher_stats.get(
            teacher.id,
            {
                "attempt_count": 0,
                "percentage_sum": 0,
            },
        )

        avg_percentage = 0

        if stats["attempt_count"]:
            avg_percentage = round(
                stats["percentage_sum"] /
                stats["attempt_count"],
                2,
            )

        data.append({
            "teacher_id": teacher.id,
            "teacher_name": teacher.name,
            "email": teacher.email,
            "is_active": teacher.is_active,

            "exam_count": teacher_exam_count.get(
                teacher.id,
                0,
            ),

            "attempt_count": stats["attempt_count"],
            "avg_percentage": avg_percentage,
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

    exams = (
        db.session.query(
            ExamModel,
            func.count(func.distinct(QuestionModel.id)).label("total_questions"),
            func.count(func.distinct(AttemptModel.id)).label("total_attempts"),
        )
        .outerjoin(
            QuestionModel,
            QuestionModel.exam_id == ExamModel.id,
        )
        .outerjoin(
            AttemptModel,
            AttemptModel.exam_id == ExamModel.id,
        )
        .filter(
            ExamModel.teacher_id == teacher_id,
            ExamModel.school_id == school_id,
        )
        .group_by(ExamModel.id)
        .order_by(ExamModel.created_at.desc())
        .all()
    )

    result = []

    for exam, total_questions, total_attempts in exams:

        data = {
            "exam_uid": exam.exam_uid,
            "title": exam.title,
            "duration_minutes": exam.duration_minutes,
            "status": exam.status,
            "quiz_code": exam.quiz_code,
            "max_attempts_per_student": exam.max_attempts_per_student,
            "created_at": exam.created_at,
            "end_date": exam.end_date,

            "total_questions": total_questions,
            "total_attempts": total_attempts,

            # From ExamModel properties
            "class_name": exam.class_name,
            "section_name": exam.section_name,
            "class_section": exam.class_section,
        }

        result.append(apply_exam_status(data))

    return result

# -------------------------------
# Create Exam
# -------------------------------


def create_exam(
    teacher_id,
    school_id,
    title,
    targets,
    duration_minutes,
    marks,
    negative,
    max_attempts,
    start_date,
    end_date,
    registration_mode="open",
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
        
        if registration_mode not in ("open", "verified"):
            return False, "Invalid exam mode."

        exam = ExamModel(
            title=title,
            duration_minutes= duration_minutes,
            marks_per_question=marks,
            negative_marks=negative,
            max_attempts_per_student=max_attempts,
            registration_mode=registration_mode,      # ✅ NEW
            school_id=school_id,
            teacher_id=teacher_id,
            start_date=start_date,
            end_date=end_date,
            show_result_review=show_result_review    
        )

        db.session.add(exam)
        db.session.flush()

        create_exam_targets(
            exam_id=exam.id,
            targets=targets,
        )

        db.session.commit()

        return True, "Exam created successfully (Draft mode)"

    except Exception:
        db.session.rollback()
        logger.exception("Failed to create exam")
        return False, "Failed to create exam."


def parse_exam_datetime(datetime_string):

    if not datetime_string:
        return None

    for fmt in (
        "%Y-%m-%dT%H:%M",
        "%Y-%m-%dT%H:%M:%S",
    ):
        try:
            return datetime.strptime(
                datetime_string,
                fmt,
            ).astimezone(timezone.utc)
        except ValueError:
            continue

    raise ValueError("Invalid datetime format.")


def extract_exam_form_data(form_data):


    title = (form_data.get("title") or "").strip()

    if not title:
        raise ValueError(
            "Exam title is required."
        )

    show_result_review = str(
        form_data.get("show_result_review", "true")
    ).lower() == "true"

    start_date = parse_exam_datetime(
        form_data.get("start_date")
    )

    end_date = parse_exam_datetime(
        form_data.get("end_date")
    )

    registration_mode = (
        form_data.get("registration_mode") or "open"
    ).strip().lower()

    if registration_mode not in ("open", "verified"):
        raise ValueError(
            "Invalid registration mode."
        )

    if not start_date or not end_date:
        raise ValueError(
            "Start date and end date are required."
        )

    if end_date <= start_date:
        raise ValueError(
            "End date must be after start date."
        )
    
    targets = form_data.get("targets") or []

    if not isinstance(targets, list):
        raise ValueError(
            "Invalid academic target."
        )
    

    return {
        "title": title,

        "targets": targets,

        "duration_minutes": int(
            form_data.get("duration_minutes") or 0
        ),

        "marks": float(
            form_data.get("marks") or 1
        ),

        "negative": float(
            form_data.get("negative") or 0
        ),

        # ✅ NEW
        "registration_mode": registration_mode,

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

def publish_exam(exam_uid, school_id, teacher_id=None):

    # ---------------------------------
    # SECURITY: validate exam belongs to school (and teacher if needed)
    # ---------------------------------
    exam = get_exam_by_uid(
        school_id=school_id,
        exam_uid=exam_uid,
    )

    if not exam:
        return False, "Invalid exam or unauthorized access"

    # Optional extra safety (recommended in LMS)
    if teacher_id and exam.teacher_id != teacher_id:
        return False, "You are not allowed to publish this exam"

    # ---------------------------------
    # CHECK QUESTIONS (SCOPED SAFE)
    # ---------------------------------
    q_count = db.session.query(func.count(QuestionModel.id))\
        .filter(QuestionModel.exam_id == exam.id)\
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

def delete_exam(
    school_id,
    exam_uid,
):
    exam = get_exam_by_uid(
        school_id=school_id,
        exam_uid=exam_uid,
    )

    if not exam:
        return (
            False,
            "Exam not found.",
        )

    attempt_count = (
        db.session.query(func.count(AttemptModel.id))
        .filter(
            AttemptModel.exam_id == exam.id,
        )
        .scalar()
    )

    if attempt_count > 0:
        return (
            False,
            "Cannot delete an exam that has student attempts.",
        )

    try:
        # Delete questions
        QuestionModel.query.filter_by(
            exam_id=exam.id,
        ).delete(
            synchronize_session=False,
        )

        # Delete exam targets
        ExamTargetModel.query.filter_by(
            exam_id=exam.id,
        ).delete(
            synchronize_session=False,
        )

        # Delete exam
        db.session.delete(exam)

        db.session.commit()

        return (
            True,
            "Exam deleted successfully.",
        )

    except Exception:
        db.session.rollback()

        logger.exception(
            "Failed to delete exam.",
        )

        return (
            False,
            "Failed to delete exam.",
        )



def get_question_template():

    file_path = (
        Path(__file__).resolve().parents[2]
        / "static"
        / "downloads"
        / "sample_question_template.xlsx"
    )


    if not file_path.exists():
        raise NotFound("Question template not found.")

    return file_path



def get_exam_options_api(
    school_id,
    teacher_id,
):

    exams = (
        ExamModel.query.filter(
            ExamModel.school_id == school_id,
            ExamModel.teacher_id == teacher_id,
            ExamModel.status == "draft",   # use your existing status value
        )
        .order_by(ExamModel.created_at.desc())
        .all()
    )
    return (
        {
            "success": True,
            "message": "Exam options fetched successfully.",
            "data": [
                {
                    "exam_uid": exam.exam_uid,
                    "title": exam.title,
                }
                for exam in exams
            ],
        },
        200,
    )



def get_exam_by_uid(
    school_id,
    exam_uid,
):
    return (
        ExamModel.query
        .filter_by(
            school_id=school_id,
            exam_uid=exam_uid,
        )
        .first()
    )

def get_teacher_exam_detail(
    school_id,
    exam_uid,
):
    exam = get_exam_by_uid( school_id, exam_uid)
    if not exam:
        return None
    

    total_questions = QuestionModel.query.filter_by(
        exam_id=exam.id
    ).count()

    
    targets = []

    for target in exam.targets:
        targets.append({
            "school_class_id": target.school_class_id,
            "school_section_id": target.school_section_id,
        })


    return {
        "exam_uid": exam.exam_uid,
        "title": exam.title,

        "duration_minutes": exam.duration_minutes,

        "marks": exam.marks_per_question,

        "negative": exam.negative_marks,

        "total_questions": total_questions,

        "max_attempts": exam.max_attempts_per_student,

        "registration_mode": exam.registration_mode.value
            if hasattr(exam.registration_mode, "value")
            else exam.registration_mode,

        "show_result_review": exam.show_result_review,

        "start_date": exam.start_date.strftime("%Y-%m-%dT%H:%M")
            if exam.start_date
            else "",

        "end_date": exam.end_date.strftime("%Y-%m-%dT%H:%M")
            if exam.end_date
            else "",

        "targets": targets,

        "status": exam.status.value
            if hasattr(exam.status, "value")
            else exam.status,
    }

def update_exam(
    school_id,
    exam_uid,
    title,
    targets,
    duration_minutes,
    marks,
    negative,
    max_attempts,
    start_date,
    end_date,
    registration_mode="open",
    show_result_review=True,
):
    try:

        exam = get_exam_by_uid(
            school_id,
            exam_uid,
        )

        if not exam:
            return False, "Exam not found."

        if duration_minutes <= 0:
            return False, "Duration must be greater than 0."

        if marks <= 0:
            return False, "Marks per question must be greater than 0."

        if negative < 0:
            return False, "Negative marks cannot be negative."

        if max_attempts <= 0:
            return False, "Max attempts must be at least 1."

        if registration_mode not in ("open", "verified"):
            return False, "Invalid exam mode."

        exam.title = title
        exam.duration_minutes = duration_minutes
        exam.marks_per_question = marks
        exam.negative_marks = negative
        exam.max_attempts_per_student = max_attempts
        exam.registration_mode = registration_mode
        exam.start_date = start_date
        exam.end_date = end_date
        exam.show_result_review = show_result_review

        ExamTargetModel.query.filter_by(
            exam_id=exam.id
        ).delete(
            synchronize_session=False
        )

        create_exam_targets(
            exam_id=exam.id,
            targets=targets,
        )

        db.session.commit()

        return True, "Exam updated successfully."

    except Exception:
        db.session.rollback()

        logger.exception(
            "Failed to update exam"
        )

        return False, "Failed to update exam."

