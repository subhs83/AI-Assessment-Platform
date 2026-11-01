from smart_exam_system.api.services.student_management_service import is_registration_allowed
from smart_exam_system.extensions import db
from smart_exam_system.models import (
    StudentModel,
    AttemptModel
)
 

from smart_exam_system.api.services.student_service import (
    get_submitted_attempts,
    get_max_attempts,
    get_student_identity,
    is_attempt_expired,
    auto_submit_attempt,
)


def build_quiz_session(exam):
    student = _get_authenticated_student()

    registration_valid = _validate_registration(
        exam,
        student,
    )

    # Check active attempt first.
    # This may finalize an expired attempt.
    active_attempt = (
        _get_active_attempt(exam, student)
        if registration_valid
        else None
    )

    # Load submitted attempts after expiry processing.
    attempt_data = _load_attempts(
        exam,
        student,
    )

    max_attempts = _calculate_attempt_limit(
        exam,
        student,
    )

    state = _determine_state(
        student=student,
        registration_valid=registration_valid,
        active_attempt=active_attempt,
        latest_attempt=attempt_data["latest_attempt"],
    )

    return {
        "exam": exam,
        "student": student,
        "student_id": student.id if student else None,
        "attempts": attempt_data["attempts"],
        "latest_attempt": (
            active_attempt or attempt_data["latest_attempt"]
        ),
        "used_attempts": attempt_data["used_attempts"],
        "max_attempts": max_attempts,
        "state": state,
    }


def _get_authenticated_student():
    student_id = get_student_identity()

    if not student_id:
        return None

    return db.session.get(StudentModel, student_id)



def _validate_registration(exam, student):
    return is_registration_allowed(exam, student)


def _load_attempts(
    exam,
    student,
):
    """
    Load all submitted attempts for the current student.

    Returns:
        {
            "attempts": list,
            "latest_attempt": AttemptModel | None,
            "used_attempts": int,
        }
    """

    if not student:
        return {
            "attempts": [],
            "latest_attempt": None,
            "used_attempts": 0,
        }

    attempts = get_submitted_attempts(
        exam.id,
        student.id,
    )

    latest_attempt = attempts[0] if attempts else None

    return {
        "attempts": attempts,
        "latest_attempt": latest_attempt,
        "used_attempts": len(attempts),
    }


def _calculate_attempt_limit(
    exam,
    student,
):
    """
    Calculate the effective maximum attempts
    available for the student.

    Future:
        - AdditionalAttemptGrant
        - School policies
        - Manual overrides
    """

    return get_max_attempts(exam)


def _determine_state(
    student,
    registration_valid,
    active_attempt,
    latest_attempt,
):
    if not student or not registration_valid:
        return "register"

    if active_attempt:
        return "quiz"

    if latest_attempt:
        return "result"

    return "register"


def _get_active_attempt(exam, student):
    if not student:
        return None

    attempt = (
        AttemptModel.query
        .filter_by(
            exam_id=exam.id,
            student_db_id=student.id,
            is_submitted=False,
        )
        .order_by(AttemptModel.id.desc())
        .first()
    )

    if not attempt:
        return None

    # Expired attempts must not resume.
    if is_attempt_expired(attempt):
        auto_submit_attempt(
            attempt,
            submit_reason="time_expired"
        )
        return None

    return attempt