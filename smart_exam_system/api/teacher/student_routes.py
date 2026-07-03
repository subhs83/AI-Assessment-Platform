
from flask_login import login_required, current_user
from flask import send_file,request,jsonify
from smart_exam_system.api.teacher import api_teacher_bp
from smart_exam_system.api.utils.api_response import api_response
from smart_exam_system.api.utils.decorators import teacher_required
from smart_exam_system.extensions import db
from smart_exam_system.models import (
    SchoolModel,
    StudentModel,   
    )
from smart_exam_system.api.services.student_management_service import (
    get_students,
     get_student_template,
     import_students,
)

from smart_exam_system.api.services.react_student_service import create_student

import logging

logger = logging.getLogger(__name__)


@api_teacher_bp.route("/<school_slug>/students", methods=["GET"])
@login_required
@teacher_required
def students_api(school_slug):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first()

    if not school:
        return api_response(
            success=False,
            message="School not found",
            status=404
        )

    if school.id != current_user.school_id:
        return api_response(
            success=False,
            message="Unauthorized school access",
            status=403
        )

    try:

        students = get_students(
            school_id=school.id
        )

        return api_response(
            success=True,
            message="Students fetched successfully",
            data={
                "students": students
            }
        )

    except Exception:
        logger.exception("Failed to fetch students")

        return api_response(
            success=False,
            message="Server error while fetching students",
            status=500
        )
    



@api_teacher_bp.route("/<school_slug>/students/template", methods=["GET"])
@login_required
@teacher_required
def download_student_template_api(school_slug):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first()

    if not school:
        return api_response(
            success=False,
            message="School not found",
            status=404
        )

    if school.id != current_user.school_id:
        return api_response(
            success=False,
            message="Unauthorized school access",
            status=403
        )

    file_path = get_student_template()

    return send_file(
        file_path,
        as_attachment=True,
        download_name="student_import_template.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )



@api_teacher_bp.route("/<school_slug>/students/import", methods=["POST"])
@login_required
@teacher_required
def import_students_api(school_slug):

    school = SchoolModel.query.filter_by(slug=school_slug).first()

    if not school:
        return api_response(
            success=False,
            message="School not found",
            status=404
        )

    if school.id != current_user.school_id:
        return api_response(
            success=False,
            message="Unauthorized school access",
            status=403
        )

    excel_file = request.files.get("excel_file")

    if not excel_file:
        return api_response(
            success=False,
            message="No file uploaded",
            status=400
        )

    success, result = import_students(
        school_id=school.id,
        excel_file=excel_file,
    )

    if not success:
        return api_response(
            success=False,
            message=result,
            status=400,
        )

    return api_response(
        success=True,
        message="Students imported successfully",
        data=result,
    )


@api_teacher_bp.route("/<school_slug>/students", methods=["POST"])
@login_required
@teacher_required
def create_student_api(school_slug):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first()

    if not school:
        return api_response(
            success=False,
            message="School not found",
            status=404
        )

    if school.id != current_user.school_id:
        return api_response(
            success=False,
            message="Unauthorized school access",
            status=403
        )

    data = request.get_json() or {}

    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    student_class = (data.get("student_class") or "").strip()
    roll_number = (data.get("roll_number") or "").strip()
    mobile = (data.get("mobile") or "").strip()

    if not first_name:
        return api_response(
            success=False,
            message="First Name is required.",
            status=400,
        )

    if not student_class:
        return api_response(
            success=False,
            message="Class is required.",
            status=400,
        )

    if not roll_number:
        return api_response(
            success=False,
            message="Roll Number is required.",
            status=400,
        )

    existing_student = StudentModel.query.filter_by(
        school_id=school.id,
        student_class=student_class,
        roll_number=roll_number,
    ).first()

    if existing_student:
        return api_response(
            success=False,
            message="Student already exists.",
            status=409,
        )

    try:

        student = create_student(
            school_id=school.id,
            first_name=first_name,
            last_name=last_name,
            student_class=student_class,
            roll_number=roll_number,
            mobile=mobile or None,
        )

        db.session.commit()

        return api_response(
            success=True,
            message="Student added successfully.",
            data={
                "student_id": student.id,
            },
        )

    except Exception:

        db.session.rollback()

        logger.exception("Failed to create student")

        return api_response(
            success=False,
            message="Server error while creating student.",
            status=500,
        )



@api_teacher_bp.route( "/<school_slug>/students/<student_uid>",  methods=["PUT"],)
@login_required
@teacher_required
def update_student_api(school_slug, student_uid):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first()

    if not school:
        return api_response(
            success=False,
            message="School not found",
            status=404,
        )

    if school.id != current_user.school_id:
        return api_response(
            success=False,
            message="Unauthorized school access",
            status=403,
        )

    student = StudentModel.query.filter_by(
        school_id=school.id,
        student_uid=student_uid,
    ).first()

    if not student:
        return api_response(
            success=False,
            message="Student not found.",
            status=404,
        )

    data = request.get_json() or {}

    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    student_class = (data.get("student_class") or "").strip()
    roll_number = (data.get("roll_number") or "").strip()
    mobile = (data.get("mobile") or "").strip()

    if not first_name:
        return api_response(
            success=False,
            message="First Name is required.",
            status=400,
        )

    if not student_class:
        return api_response(
            success=False,
            message="Class is required.",
            status=400,
        )

    if not roll_number:
        return api_response(
            success=False,
            message="Roll Number is required.",
            status=400,
        )

    existing_student = (
        StudentModel.query
        .filter(
            StudentModel.school_id == school.id,
            StudentModel.student_class == student_class,
            StudentModel.roll_number == roll_number,
            StudentModel.id != student.id,
        )
        .first()
    )

    if existing_student:
        return api_response(
            success=False,
            message="Student already exists.",
            status=409,
        )

    try:

        student.first_name = first_name
        student.last_name = last_name
        student.student_class = student_class
        student.roll_number = roll_number
        student.mobile = mobile or None

        db.session.commit()

        return api_response(
            success=True,
            message="Student updated successfully.",
            data={
                "student_uid": student.student_uid,
            },
        )

    except Exception:

        db.session.rollback()

        logger.exception("Failed to update student")

        return api_response(
            success=False,
            message="Server error while updating student.",
            status=500,
        )
    

@api_teacher_bp.route("/<school_slug>/students/<student_uid>", methods=["DELETE"],)
@login_required
@teacher_required
def delete_student_api(school_slug, student_uid):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first()

    if not school:
        return api_response(
            success=False,
            message="School not found",
            status=404,
        )

    if school.id != current_user.school_id:
        return api_response(
            success=False,
            message="Unauthorized school access",
            status=403,
        )

    student = StudentModel.query.filter_by(
        school_id=school.id,
        student_uid=student_uid,
    ).first()

    if not student:
        return api_response(
            success=False,
            message="Student not found.",
            status=404,
        )

    try:

        db.session.delete(student)

        db.session.commit()

        return api_response(
            success=True,
            message="Student deleted successfully.",
        )

    except Exception:

        db.session.rollback()

        logger.exception("Failed to delete student")

        return api_response(
            success=False,
            message="Server error while deleting student.",
            status=500,
        )