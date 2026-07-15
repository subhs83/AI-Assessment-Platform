from sqlalchemy import func

from smart_exam_system.models import (
    AdditionalAttemptGrant,
    UserModel,
    StudentModel,
    ExamModel
)
from smart_exam_system.api.services.exam_service import get_exam_by_uid
from smart_exam_system.extensions import db


def get_attempt_limit_info(
    *,
    school_id,
    exam_uid,
    student_db_id,
):
    exam = ExamModel.query.filter_by(
        exam_uid=exam_uid,
        school_id=school_id,
    ).first()

    if not exam:
        raise ValueError("Exam not found")

    base_attempts = exam.max_attempts_per_student or 0

    granted_attempts = get_total_granted_attempts(
        school_id=school_id,
        exam_uid=exam_uid,
        student_db_id=student_db_id,
    )

    allowed_attempts = (
        base_attempts
        + granted_attempts
    )

    return {
        "base_attempts": base_attempts,
        "granted_attempts": granted_attempts,
        "allowed_attempts": allowed_attempts,
    }


def get_total_granted_attempts(
    school_id,
    exam_uid,
    student_db_id,
):
    """
    Returns the total additional attempts granted
    to a student for a specific exam.
    """

    exam = get_exam_by_uid(
        school_id=school_id,
        exam_uid=exam_uid,
    )

    if not exam:
        return 0

    total = (
        db.session.query(
            func.coalesce(
                func.sum(
                    AdditionalAttemptGrant.granted_attempts
                ),
                0,
            )
        )
        .filter_by(
            school_id=school_id,
            exam_id=exam.id,
            student_db_id=student_db_id,
        )
        .scalar()
    )

    return total





def grant_additional_attempt(
    *,
    school_id,
    exam_uid,
    student_db_id,
    teacher_id,
    granted_attempts,
    reason,
):
    """
    Creates a new additional attempt grant.
    """
    if granted_attempts < 1:
        return {
            "success": False,
            "message": "Granted attempts must be at least 1.",
        }, 400

    reason = reason.strip()

    if not reason:
        return {
            "success": False,
            "message": "Reason is required.",
        }, 400
    
    exam = get_exam_by_uid(
        school_id=school_id,
        exam_uid=exam_uid,
    )

    if not exam:
        return {
            "success": False,
            "message": "Exam not found.",
        }, 404
    

    student = StudentModel.query.filter_by(
        id=student_db_id, 
        school_id=school_id,
        ).first()

    if not student:
        return {
            "success": False,
            "message": "Student not found.",
        }, 404
    

    teacher = UserModel.query.filter_by(
        id=teacher_id,
        school_id=school_id,
        role="teacher",
    ).first()

    if not teacher:
        return {
            "success": False,
            "message": "Teacher not found.",
        }, 404

    try:
        grant = AdditionalAttemptGrant(
            school_id=school_id,
            exam_id=exam.id,
            student_db_id=student_db_id,
            teacher_id=teacher_id,
            granted_attempts=granted_attempts,
            reason=reason,
        )

        db.session.add(grant)
        db.session.commit()

        total_granted_attempts = get_total_granted_attempts(
            school_id=school_id,
            exam_uid=exam_uid,
            student_db_id=student_db_id,
        )

        return {
            "success": True,
            "message": "Additional attempt granted successfully.",
            "data": {
                "grant_uid": grant.grant_uid,
                "granted_attempts": grant.granted_attempts,
                "total_granted_attempts": total_granted_attempts,
            },
        }, 200

    except Exception:
        db.session.rollback()

        return {
            "success": False,
            "message": "Failed to grant additional attempt.",
        }, 500
        

def get_additional_attempt_grants(
    *,
    school_id,
    exam_uid,
    student_db_id,
):
    
    exam = get_exam_by_uid(
        school_id=school_id,
        exam_uid=exam_uid,
    )

    if not exam:
        return {
            "success": False,
            "message": "Exam not found.",
        }, 404

    grants = (
        AdditionalAttemptGrant.query
        .filter_by(
            school_id=school_id,
            exam_id=exam.id,
            student_db_id=student_db_id,
        )
        .order_by(
            AdditionalAttemptGrant.created_at.desc()
        )
        .all()
    )

    return {
    "success": True,
    "message": "Additional attempts fetched successfully.",
    "data": {
        "total_granted_attempts": get_total_granted_attempts(
            school_id=school_id,
            exam_uid=exam_uid,
            student_db_id=student_db_id,
        ),
        "grants": [
            {
                "grant_uid": g.grant_uid,
                "granted_attempts": g.granted_attempts,
                "reason": g.reason,
                "created_at": (
                    g.created_at.isoformat()
                    if g.created_at
                    else None
                ),
            }
            for g in grants
        ],
    },
}, 200