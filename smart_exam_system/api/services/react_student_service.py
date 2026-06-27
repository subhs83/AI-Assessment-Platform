from flask import session,request
from uuid import uuid4
from sqlalchemy import func
from smart_exam_system.extensions import db
from datetime import datetime, timezone, timedelta
from smart_exam_system.models import (
    ExamModel,
    QuestionModel,
    StudentAnswerModel,
    AttemptModel,
    StudentModel,   
    SchoolModel,
)
import  uuid, json, random


def normalize_text(value):
    return " ".join((value or "").split())

def find_student(
    school_id,
    first_name,
    last_name,
    student_class,
    roll_number,
):
    return (
        StudentModel.query
        .filter_by(
            school_id=school_id,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            student_class=student_class.strip(),
            roll_number=roll_number.strip(),
        )
        .first()
    )


def create_student(
    school_id,
    first_name,
    last_name,
    student_class,
    roll_number,
    mobile=None,
):
    student = StudentModel(
        student_uid=str(uuid4()),
        school_id=school_id,
        first_name=first_name.strip(),
        last_name=last_name.strip(),
        student_class=student_class.strip(),
        roll_number=roll_number.strip(),
        mobile=mobile,
    )

    db.session.add(student)
    db.session.flush()

    return student


def find_or_create_student(
    school_id,
    first_name,
    last_name,
    student_class,
    roll_number,
    mobile=None,
):
    student = find_student(
        school_id,
        first_name,
        last_name,
        student_class,
        roll_number,
    )

    if student:
        return student

    return create_student(
        school_id,
        first_name,
        last_name,
        student_class,
        roll_number,
        mobile,
    )

def set_student_identity(student_db_id):
    session["student_db_id"] = student_db_id


def get_student_identity():
    student_db_id = session.get("student_db_id")

    if not student_db_id:
        student_db_id = request.cookies.get("student_db_id")

    if not student_db_id:
        return None

    try:
        student_db_id = int(student_db_id)
    except:
        return None

    session["student_db_id"] = student_db_id

    return student_db_id


def clear_student_identity(response=None):
    session.pop("student_db_id", None)

    if response:
        response.set_cookie(
            "student_db_id",
            "",
            expires=0
        )

    return response


def start_student_attempt(exam_id, school_id, form_data, ip_address=None):
    first_name = normalize_text(form_data.get("first_name"))
    last_name = normalize_text(form_data.get("last_name"))
    student_class = normalize_text(form_data.get("student_class"))
    roll_number = normalize_text(form_data.get("roll_number"))
    mobile = normalize_text(form_data.get("mobile"))


    # ==================================================
    # 🔥 DUPLICATE STUDENT CHECK (INSERT HERE)
    # ==================================================

    existing_student = find_existing_student(
        school_id,
        first_name,
        last_name,
        student_class,
        roll_number
    )

    if existing_student:

        last_attempt = get_latest_result_attempt(
            existing_student.id,
            exam_id
        )

        if last_attempt:
            return {
                "status": "redirect_result",
                "attempt_id": last_attempt.id,
                "student_db_id": existing_student.id
            }, 200
    # --------------------------------------------------
    # 1. STUDENT (NEW SOURCE OF TRUTH)
    # --------------------------------------------------
    student = find_or_create_student(
        school_id=school_id,
        first_name=first_name,
        last_name=last_name,
        student_class=student_class,
        roll_number=roll_number,
        mobile=mobile,
    )

    student_db_id = student.id

    # --------------------------------------------------
    # 2. CHECK EXISTING ATTEMPTS (NEW LOGIC)
    # --------------------------------------------------
    previous_attempts = AttemptModel.query.filter_by(
        exam_id=exam_id,
        student_db_id=student_db_id
    ).count()

    exam = db.session.get(ExamModel, exam_id)

    if exam.max_attempts_per_student and previous_attempts >= exam.max_attempts_per_student:
        latest_attempt = (
            AttemptModel.query.filter_by(
                exam_id=exam_id,
                student_db_id=student_db_id
            )
            .order_by(AttemptModel.id.desc())
            .first()
        )

        return {
            "success": False,
            "message": "Max attempts reached",
            "attempt_id": latest_attempt.id if latest_attempt else None,
            "student_id": student_db_id,
        }, 403

    attempt_number = previous_attempts + 1

    # --------------------------------------------------
    # 3. QUESTIONS
    # --------------------------------------------------
    questions = QuestionModel.query.filter_by(exam_id=exam_id).all()
    if not questions:
        return {
            "success": False,
            "message": "No questions available"
        }, 404

    question_ids = [q.id for q in questions]
    random.shuffle(question_ids)

    question_order = json.dumps(question_ids)

    option_order_map = {}
    for q in questions:
        options = ["A", "B", "C", "D"]
        random.shuffle(options)
        option_order_map[str(q.id)] = options

    option_order = json.dumps(option_order_map)

    # --------------------------------------------------
    # 4. CREATE ATTEMPT (HYBRID MODE)
    # --------------------------------------------------
    new_attempt = AttemptModel(
    exam_id=exam_id,
    school_id=school_id,

    # ONLY REFERENCES (NO DUPLICATION)
    student_db_id=student_db_id,

    ip_address=ip_address,
    start_time=datetime.utcnow(),
    end_time=None,
    attempt_number=attempt_number,

    question_order=question_order,
    option_order=option_order,
)

    db.session.add(new_attempt)
    db.session.commit()

    # --------------------------------------------------
    # 5. RESPONSE
    # --------------------------------------------------
    return {
        "success": True,
        "message": "Exam started successfully",
        "attempt_id": new_attempt.id,
        "student_id": student_db_id,
        "attempt_number": attempt_number,
        "question_count": len(question_ids),
    }

def get_attempt_state(exam_id, school_id):
    """
    Returns current UI state:
    - register
    - resume
    - result
    - new_attempt
    """

    # --------------------------------------------------
    # 1. NEW IDENTITY SOURCE
    # --------------------------------------------------
    student_db_id = get_student_identity()

    if not student_db_id:
        return {
            "state": "register"
        }

    # --------------------------------------------------
    # 2. GET STUDENT ATTEMPTS (NEW LOGIC)
    # --------------------------------------------------
    attempts = AttemptModel.query.filter_by(
        exam_id=exam_id,
        student_db_id=student_db_id
    ).order_by(AttemptModel.id.asc()).all()

    if not attempts:
        return {
            "state": "register"
        }

    latest_attempt = attempts[-1]

    exam = db.session.get(ExamModel, exam_id)

    # --------------------------------------------------
    # 3. ACTIVE ATTEMPT CHECK
    # --------------------------------------------------
    if latest_attempt.end_time is None:
        return {
            "state": "resume",
            "attempt_id": latest_attempt.id
        }

    # --------------------------------------------------
    # 4. MAX ATTEMPTS CHECK
    # --------------------------------------------------
    attempt_count = len(attempts)

    if exam.max_attempts_per_student and attempt_count >= exam.max_attempts_per_student:
        return {
            "state": "result",
            "attempt_id": latest_attempt.id
        }

    # --------------------------------------------------
    # 5. DEFAULT → NEW ATTEMPT ALLOWED
    # --------------------------------------------------
    return {
        "state": "new_attempt",
        "attempt_number": attempt_count + 1
    }


def resolve_attempt(attempt_id, student_db_id=None):
    """
    Resolves attempt safely using:
    - attempt_id (primary)
    - optional student_db_id (future-safe)
    """

    if not attempt_id:
        return None

    try:
        attempt_id = int(attempt_id)
    except (TypeError, ValueError):
        return None

    attempt = db.session.get(AttemptModel, attempt_id)

    if not attempt:
        return None

    # --------------------------------------------------
    # SAFETY CHECK (NEW LAYER)
    # --------------------------------------------------
    if student_db_id is not None:
        if attempt.student_db_id != student_db_id:
            return None

    return attempt


def get_student_result(attempt_id, student_db_id=None):

    try:
        attempt_id = int(attempt_id)
    except (TypeError, ValueError):
        return None

    attempt = db.session.get(AttemptModel, attempt_id)
    if not attempt:
        return None

    student = db.session.get(StudentModel, student_db_id)
    if not student:
        return None

    # --------------------------------------------------
    # SECURITY CHECK (OK AS IS)
    # --------------------------------------------------
    if student_db_id is not None:
        if attempt.student_db_id != student_db_id:
            return None

    exam = attempt.exam

    # --------------------------------------------------
    # QUESTIONS + SCORE
    # --------------------------------------------------
    total_questions = get_total_questions(exam.id)
    marks_per_question = exam.marks_per_question or 1
    total_marks = total_questions * marks_per_question

    score = get_student_score(attempt_id)

    percentage = (score / total_marks * 100) if total_marks > 0 else 0
    percentage = max(0, round(percentage, 2))

    # --------------------------------------------------
    # ANSWERS STATS
    # --------------------------------------------------
    attempted = StudentAnswerModel.query.filter_by(attempt_id=attempt_id).count()

    correct_answers = StudentAnswerModel.query.filter_by(
        attempt_id=attempt_id,
        is_correct=True
    ).count()

    wrong_answers = StudentAnswerModel.query.filter_by(
        attempt_id=attempt_id,
        is_correct=False
    ).count()

    not_attempted = max(0, total_questions - attempted)

    # --------------------------------------------------
    # RANKING SYSTEM
    # --------------------------------------------------
    base_query = AttemptModel.query.filter(
        AttemptModel.exam_id == attempt.exam_id,
        AttemptModel.is_submitted == True,
        AttemptModel.percentage.isnot(None)
    )

    total_participants = base_query.count()

    rank = (
        base_query.filter(AttemptModel.percentage > percentage).count() + 1
        if total_participants > 0 else 1
    )

    below_count = base_query.filter(
        AttemptModel.percentage <= percentage
    ).count()

    percentile = (
        round((below_count / total_participants) * 100, 0)
        if total_participants > 0 else 0
    )

    # --------------------------------------------------
    # SAFE MAX ATTEMPT LOGIC
    # --------------------------------------------------
    max_attempts = exam.max_attempts_per_student

    can_take_next_attempt = (
        True if not max_attempts else attempt.attempt_number < max_attempts
    )

    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------
    return {
        "score": score,
        "total_marks": total_marks,
        "total_questions": total_questions,
        "percentage": percentage,

        "correct_answers": correct_answers,
        "wrong_answers": wrong_answers,
        "not_attempted": not_attempted,
        "attempted": attempted,

        "student_name": f"{student.first_name} {student.last_name}",
        "student_class": student.student_class,
        "roll_number": student.roll_number,

        "rank": rank,
        "total_participants": total_participants,
        "percentile": percentile,

        "exam": exam,
        "auto_submitted_reason": attempt.auto_submitted_reason,
        "attempt_number": attempt.attempt_number,
        "max_attempts": max_attempts,

        "can_take_next_attempt": can_take_next_attempt,
        "review_enabled": exam.show_result_review,
        "quiz_code": exam.quiz_code,
    }

def start_next_attempt(previous_attempt_id):

    previous_attempt = db.session.get(AttemptModel, previous_attempt_id)


    if not previous_attempt:
        return {
            "success": False,
            "message": "Attempt not found"
        }, 404
    
    exam = db.session.get(ExamModel, previous_attempt.exam_id)

    if not exam:
        return {
            "success": False,
            "message": "Exam not found"
        }, 404

    # ==================================================
    # FIX 1: GET TRUE LATEST ATTEMPT OF THIS STUDENT
    # ==================================================
    latest_attempt = AttemptModel.query.filter(
        AttemptModel.exam_id == exam.id,
        AttemptModel.student_db_id == previous_attempt.student_db_id
    ).order_by(AttemptModel.attempt_number.desc()).first()

    # ==================================================
    # FIX 2: USE LATEST FOR LIMIT CHECK
    # ==================================================
    if (
        exam.max_attempts_per_student
        and latest_attempt
        and latest_attempt.attempt_number >= exam.max_attempts_per_student
    ):
        return {
            "success": False,
            "message": "Max attempts reached"
        }, 403

    # ==================================================
    # FIX 3: SAFE NEXT ATTEMPT NUMBER
    # ==================================================
    next_attempt_number = (
        latest_attempt.attempt_number + 1
        if latest_attempt
        else 1
    )

    # ==================================================
    # QUESTIONS RANDOMIZATION (UNCHANGED)
    # ==================================================
    questions = QuestionModel.query.filter_by(
        exam_id=exam.id
    ).all()

    if not questions:
        return {
            "success": False,
            "message": "No questions available"
        }, 404

    question_ids = [q.id for q in questions]
    random.shuffle(question_ids)

    question_order = json.dumps(question_ids)

    option_order_map = {}

    for q in questions:
        options = ["A", "B", "C", "D"]
        random.shuffle(options)
        option_order_map[str(q.id)] = options

    option_order = json.dumps(option_order_map)

    # ==================================================
    # FIX 4: CREATE ATTEMPT USING LATEST LOGIC
    # ==================================================
    new_attempt = AttemptModel(
        exam_id=previous_attempt.exam_id,
        school_id=previous_attempt.school_id,
        student_db_id=previous_attempt.student_db_id,
        ip_address=previous_attempt.ip_address,

        start_time=datetime.utcnow(),
        end_time=None,

        attempt_number=next_attempt_number,   # 🔥 FIX HERE

        question_order=question_order,
        option_order=option_order,

        is_submitted=False,
        violation_count=0,
        violation_log=None,
        auto_submitted_reason=None,
        last_violation_time=None
    )

    db.session.add(new_attempt)
    db.session.commit()

    return {
        "success": True,
        "attempt_id": new_attempt.id,
        "student_id": previous_attempt.student_db_id,
        "attempt_number": new_attempt.attempt_number  # (optional: can return new_attempt_number)
    }




def get_student_attempts(exam_id, student_db_id, submitted_only=False):

    query = AttemptModel.query.filter_by(
        exam_id=exam_id,
        student_db_id=student_db_id
    )

    if submitted_only:
        query = query.filter_by(is_submitted=True)

    return query.order_by(AttemptModel.id.desc()).all()



def get_submitted_attempts(exam_id, student_db_id):

    return AttemptModel.query.filter_by(
        exam_id=exam_id,
        student_db_id=student_db_id,
        is_submitted=True
    ).order_by(AttemptModel.id.desc()).all()

def get_used_attempt_count(exam_id, student_db_id):
    return len(get_submitted_attempts(exam_id, student_db_id))

def get_max_attempts(exam):
    return exam.max_attempts_per_student or 1


def normalize_question_index(q_index, total_questions):

    if q_index < 0:
        return 0

    if q_index >= total_questions:
        return None

    return q_index

def get_attempt_question_order(attempt):

    question_order = json.loads(attempt.question_order)

    return {
        "question_order": question_order,
        "total_questions": len(question_order)
    }


def get_exam_by_quiz_code(quiz_code):
    return ExamModel.query.filter_by(
        quiz_code=quiz_code
    ).first()

def get_total_questions(exam_id):

    return db.session.query(func.count(QuestionModel.id))\
        .filter(QuestionModel.exam_id == exam_id)\
        .scalar()



def get_student_score(attempt_id):

    attempt = db.session.get(AttemptModel, attempt_id)

    if not attempt:
        return 0

    exam = attempt.exam

    answers = StudentAnswerModel.query.filter_by(
        attempt_id=attempt_id
    ).all()

    score = 0
    marks = exam.marks_per_question or 1
    negative = exam.negative_marks or 0

    for answer in answers:

        if answer.is_correct:
            score += marks
        else:
            score -= negative

    return round(score, 2)



def is_attempt_expired(attempt):
    """
    Returns True if exam duration has elapsed.
    """

    if attempt.is_submitted:
        return False

    deadline = (
        attempt.start_time +
        timedelta(
            minutes=attempt.exam.duration_minutes
        )
    )

    return datetime.utcnow() >= deadline


def auto_submit_attempt(attempt, reason):
    return finalize_attempt(attempt, submit_reason=reason)


def finalize_attempt(attempt, submit_reason="manual"):

    if attempt.is_submitted:
        return attempt

    score, total_marks = calculate_attempt_score(attempt)

    attempt.score = score
    attempt.total_marks = total_marks

    attempt.percentage = (
        round((score / total_marks) * 100, 2)
        if total_marks > 0 else 0
    )

    attempt.is_submitted = True
    attempt.end_time = datetime.utcnow()

    if submit_reason != "manual":
        attempt.auto_submitted_reason = submit_reason

    db.session.commit()

    return attempt


def calculate_attempt_score(attempt):

    exam = attempt.exam

    total_questions = get_total_questions(exam.id)

    total_marks = total_questions * (exam.marks_per_question or 1)

    score = get_student_score(attempt.id)  # must be attempt-based

    return score, total_marks



def record_violation(attempt_id, reason):

    attempt = db.session.get(AttemptModel, attempt_id)

    if not attempt:
        return None

    # 🚫 Already submitted
    if attempt.is_submitted:
        return {
            "violation_count": attempt.violation_count or 0,
            "auto_submitted": True
        }

    now = datetime.utcnow()

    # 🔒 HARD LOCK: ignore duplicate within 3 seconds
    if attempt.last_violation_time:
        diff = (now - attempt.last_violation_time).total_seconds()

        if diff < 9:
            return {
                "violation_count": attempt.violation_count or 0,
                "auto_submitted": attempt.is_submitted
            }

    # ✅ SAFE TO COUNT
    attempt.last_violation_time = now
    attempt.violation_count = (
        attempt.violation_count or 0
    ) + 1

    MAX_VIOLATIONS = 3

    if (
        attempt.violation_count > MAX_VIOLATIONS
        and not attempt.is_submitted
    ):
        attempt = auto_submit_attempt(
            attempt,
            "max_violations"
        )

    db.session.commit()
    return {
        "violation_count": attempt.violation_count,
        "auto_submitted": attempt.is_submitted
    }


def find_existing_student(school_id, first_name, last_name, student_class, roll_number):

    return StudentModel.query.filter_by(
        school_id=school_id,
        first_name=first_name,
        last_name=last_name,
        student_class=student_class,
        roll_number=roll_number
    ).first()


def get_latest_result_attempt(student_db_id, exam_id):

    return (
        AttemptModel.query
        .filter_by(
            student_db_id=student_db_id,
            exam_id=exam_id,
            is_submitted=True
        )
        .order_by(AttemptModel.id.desc())
        .first()
    )

def get_attempt_detailed_report(attempt_id):

    # ---------------------------------
    # SECURITY: resolve attempt via exam join (source of truth)
    # ---------------------------------
    attempt = db.session.query(AttemptModel).join(ExamModel).filter(
        AttemptModel.id == attempt_id
    ).first()

    if not attempt:
        return None

    # NOW we safely know exam + school context
    exam = attempt.exam  # relationship assumed OR use join if needed
    school_id = exam.school_id

    # ---------------------------------
    # STUDENT (SOURCE OF TRUTH)
    # ---------------------------------
    student = StudentModel.query.filter_by(
        id=attempt.student_db_id,
        school_id=school_id
    ).first()

    student_name = (
        f"{student.first_name} {student.last_name}"
        if student else "Unknown Student"
    )

    # ---------------------------------
    # QUESTION ORDER
    # ---------------------------------
    question_order = json.loads(attempt.question_order or "[]")

    report = []

    for q_id in question_order:
        
        question = db.session.get(QuestionModel, q_id)

        if not question:
            continue

        answer = StudentAnswerModel.query.filter_by(
            attempt_id=attempt_id,
            question_id=q_id
        ).first()

        selected = answer.selected_option if answer else None
        correct = question.correct_option

        option_map = {
            "A": question.option_a,
            "B": question.option_b,
            "C": question.option_c,
            "D": question.option_d
        }

        selected_text = option_map.get(selected) if selected else None

        if selected is None:
            remark = "Not Attempted"
            is_correct = False
        elif selected == correct:
            remark = "Correct"
            is_correct = True
        else:
            remark = "Incorrect"
            is_correct = False

        report.append({
            "question_id": question.id,
            "question_text": question.question_text,
            "selected_option": selected if selected else "NA",
            "selected_text": selected_text if selected else "Not Attempted",
            "options": option_map,
            "is_correct": is_correct,
            "remark": remark
        })

    return {
        "student_name": student_name,
        "score": attempt.score,
        "total_marks": attempt.total_marks,
        "total_questions": len(report),
        "percentage": attempt.percentage,
        "questions": report
    }

  