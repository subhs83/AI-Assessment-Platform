
from flask import g
from functools import wraps
from flask import jsonify
from flask_login import current_user
from smart_exam_system.models import ExamModel,SchoolModel
from smart_exam_system.extensions import db


def _json_error(message, status_code):
    return (
        jsonify({
            "success": False,
            "message": message,
        }),
        status_code,
    )


def super_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        if not current_user.is_authenticated:
            return _json_error("Please login first.", 401)

        if current_user.role != "super_admin":
            return _json_error(
                "Access denied. Super Admin only.",
                403,
            )

        return f(*args, **kwargs)

    return decorated_function



def school_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        if not current_user.is_authenticated:
            return _json_error("Please login first.", 401)

        if current_user.role != "school_admin":
            return _json_error(
                "Access denied. School Admin only.",
                403,
            )

        return f(*args, **kwargs)

    return decorated_function


def teacher_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # print("Authenticated:", current_user.is_authenticated)
        # print("Current user:", current_user)
        # print("Role:", getattr(current_user, "role", None))

        if not current_user.is_authenticated:
            return _json_error("Please login first.", 401)

        if current_user.role != "teacher":
            return _json_error(
                "Access denied. Teacher account required.",
                403,
            )

        return f(*args, **kwargs)

    return decorated_function


def exam_owner_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        if not current_user.is_authenticated:
            return _json_error(
                "Please login first.",
                401,
            )

        exam_uid = (
            kwargs.get("exam_uid")
            or (args[0] if args else None)
        )
        if not exam_uid:
            return _json_error(
                "Exam not found.",
                404,
            )

        exam = (
            ExamModel.query
            .filter_by(
                exam_uid=exam_uid,
                school_id=current_user.school_id,
            )
            .first()
        )


        if not exam:
            return _json_error(
                "Exam not found.",
                404,
            )

        if exam.teacher_id != current_user.id:
            return _json_error(
                "You are not authorized to access this exam.",
                403,
            )

        return f(*args, **kwargs)

    return decorated_function


def school_access_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        if not current_user.is_authenticated:
            return _json_error(
                "Please login first.",
                401,
            )

        # Super Admin can access everything
        if current_user.role == "super_admin":
            return f(*args, **kwargs)

        school = None

        # Route uses school_id
        school_id = kwargs.get("school_id")
        if school_id is not None:
            school = db.session.get(
                SchoolModel,
                school_id,
            )

        # Route uses school_slug
        if school is None:
            school_slug = kwargs.get("school_slug")
            if school_slug:
                school = SchoolModel.query.filter_by(
                    slug=school_slug,
                ).first()

        if school is None:
            return _json_error(
                "School not found.",
                404,
            )

        # Store for downstream use
        g.school = school

        if current_user.school_id != school.id:
            return _json_error(
                "Access denied for this school.",
                403,
            )

        return f(*args, **kwargs)

    return decorated_function