from flask_login import login_required, current_user
from flask import request
from smart_exam_system.extensions import db
from smart_exam_system.api.teacher import api_teacher_bp
from smart_exam_system.api.utils.api_response import api_response
from smart_exam_system.api.utils.helpers import serialize_school_class
from smart_exam_system.api.utils.decorators import teacher_required

from smart_exam_system.models import SchoolModel
from smart_exam_system.api.services.react_student_service import normalize_text
from smart_exam_system.api.services.school_class_service import (
    create_school_class,
    list_school_classes,
    update_school_class,
    delete_school_class,
    get_school_class,
)

from smart_exam_system.api.services.school_section_service import (
    create_section,
    list_sections,
    update_section,
    delete_section,
    get_section,
)

import logging

logger = logging.getLogger(__name__)



@api_teacher_bp.route("/<school_slug>/school-classes", methods=["GET"])
@login_required
@teacher_required
def school_classes_api(school_slug):

    school = SchoolModel.query.filter_by( slug=school_slug).first()

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

        school_classes = list_school_classes(school_id=school.id)

        return api_response(
            success=True,
            message="School classes fetched successfully",
            data={
                "school_classes": [
                    serialize_school_class(school_class)
                    for school_class in school_classes
                ]
            }
        )

    except Exception:
        logger.exception("Failed to fetch school classes")

        return api_response(
            success=False,
            message="Server error while fetching school classes",
            status=500
        )
    


@api_teacher_bp.route("/<school_slug>/school-classes", methods=["POST"])
@login_required
@teacher_required
def create_school_class_api(school_slug):

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

        data = request.get_json() or {}

        name = normalize_text(
            data.get("name")
        )

        display_order = data.get("display_order")

        errors = {}

        if not name:
            errors["name"] = "Class name is required."

        if display_order is None:
            errors["display_order"] = "Display order is required."

        if errors:
            return api_response(
                success=False,
                message="Validation failed",
                errors=errors,
                status=400
            )

        school_class = create_school_class(
            school_id=school.id,
            name=name,
            display_order=display_order,
        )

        db.session.commit()

        return api_response(
            success=True,
            message="School class saved successfully",
            data={
                "school_class": serialize_school_class(school_class)
            },
            status=201
        )

    except ValueError as e:

        db.session.rollback()

        return api_response(
            success=False,
            message=str(e),
            status=400
        )

    except Exception:

        db.session.rollback()

        logger.exception(
            "Failed to create school class"
        )

        return api_response(
            success=False,
            message="Server error while creating school class",
            status=500
        )
    


@api_teacher_bp.route("/<school_slug>/school-classes/<int:class_id>", methods=["PUT"])
@login_required
@teacher_required
def update_school_class_api(school_slug, class_id):

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

        data = request.get_json() or {}

        name = normalize_text(
            data.get("name")
        )

        display_order = data.get("display_order")

        if not name:
            return api_response(
                success=False,
                message="Class name is required",
                status=400
            )

        if display_order is None:
            return api_response(
                success=False,
                message="Display order is required",
                status=400
            )

        school_class = get_school_class(
            school_class_id=class_id,
            school_id=school.id,
        )

        if not school_class:
            return api_response(
                success=False,
                message="Class not found",
                status=404
            )

        school_class = update_school_class(
            school_class=school_class,
            name=name,
            display_order=display_order,
        )

        db.session.commit()

        return api_response(
            success=True,
            message="School class updated successfully",
            data={
                 "school_class": serialize_school_class(school_class)
            }
        )

    except ValueError as e:
        db.session.rollback()

        return api_response(
            success=False,
            message=str(e),
            status=400
        )

    except Exception:
        db.session.rollback()
        logger.exception("Failed to update school class")

        return api_response(
            success=False,
            message="Server error while updating school class",
            status=500
        )
    


@api_teacher_bp.route("/<school_slug>/school-classes/<int:class_id>", methods=["DELETE"])
@login_required
@teacher_required
def delete_school_class_api(school_slug, class_id):

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

        delete_school_class(
            school_class_id=class_id,
            school_id=school.id,
        )

        db.session.commit()

        return api_response(
            success=True,
            message="School class deleted successfully"
        )

    except ValueError as e:
        db.session.rollback()

        return api_response(
            success=False,
            message=str(e),
            status=400
        )

    except Exception:
        db.session.rollback()
        logger.exception("Failed to delete school class")

        return api_response(
            success=False,
            message="Server error while deleting school class",
            status=500
        )
    

# SECTION MANAGEMENT ROUTES


@api_teacher_bp.route("/<school_slug>/school-classes/<int:class_id>/sections", methods=["POST"])
@login_required
@teacher_required
def create_section_api(school_slug, class_id):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first()

    if not school:
        return api_response(False, "School not found", status=404)

    if school.id != current_user.school_id:
        return api_response(False, "Unauthorized access", status=403)

    school_class = get_school_class(
        school_class_id=class_id,
        school_id=school.id
    )

    if not school_class:
        return api_response(False, "Class not found", status=404)

    try:
        data = request.get_json() or {}

        name = normalize_text(data.get("name"))
        display_order = data.get("display_order")

        errors = {}

        if not name:
            errors["name"] = "Section name is required"

        if display_order is None:
            errors["display_order"] = "Display order is required"

        if errors:
            return api_response(False, "Validation failed", errors=errors, status=400)

        section = create_section(
            school_id=school.id,
            school_class_id=school_class.id,
            name=name,
            display_order=display_order
        )

        db.session.commit()

        return api_response(
            True,
            "Section created successfully",
            data={
                "section": {
                    "id": section.id,
                    "name": section.name,
                    "display_order": section.display_order
                }
            },
            status=201
        )

    except ValueError as e:
        db.session.rollback()
        return api_response(False, str(e), status=400)

    except Exception:
        db.session.rollback()
        logger.exception("Failed to create section")
        return api_response(False, "Server error", status=500)
    



@api_teacher_bp.route("/<school_slug>/school-classes/<int:class_id>/sections", methods=["GET"])
@login_required
@teacher_required
def list_sections_api(school_slug, class_id):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first()

    if not school:
        return api_response(False, "School not found", status=404)

    if school.id != current_user.school_id:
        return api_response(False, "Unauthorized access", status=403)

    school_class = get_school_class(
        school_class_id=class_id,
        school_id=school.id
    )

    if not school_class:
        return api_response(False, "Class not found", status=404)

    try:

        sections = list_sections(
            school_class_id=school_class.id
        )

        return api_response(
            True,
            "Sections fetched successfully",
            data={
                "sections": [
                    {
                        "id": s.id,
                        "name": s.name,
                        "display_order": s.display_order,
                        "is_active": s.is_active
                    }
                    for s in sections
                ]
            }
        )

    except Exception:
        logger.exception("Failed to fetch sections")
        return api_response(False, "Server error", status=500)



@api_teacher_bp.route("/<school_slug>/school-classes/<int:class_id>/sections/<int:section_id>", methods=["PUT"])
@login_required
@teacher_required
def update_section_api(school_slug, class_id, section_id):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first()

    if not school:
        return api_response(False, "School not found", status=404)

    if school.id != current_user.school_id:
        return api_response(False, "Unauthorized access", status=403)

    school_class = get_school_class(
        school_class_id=class_id,
        school_id=school.id
    )

    if not school_class:
        return api_response(False, "Class not found", status=404)

    section = get_section(
        section_id=section_id,
        school_class_id=school_class.id
    )

    if not section:
        return api_response(False, "Section not found", status=404)

    try:
        data = request.get_json() or {}

        name = normalize_text(data.get("name"))
        display_order = data.get("display_order")

        section = update_section(
            section=section,
            name=name,
            display_order=display_order
        )

        db.session.commit()

        return api_response(
            True,
            "Section updated successfully",
            data={
                "section": {
                    "id": section.id,
                    "name": section.name,
                    "display_order": section.display_order
                }
            }
        )

    except Exception:
        db.session.rollback()
        logger.exception("Failed to update section")
        return api_response(False, "Server error", status=500)




@api_teacher_bp.route("/<school_slug>/school-classes/<int:class_id>/sections/<int:section_id>", methods=["DELETE"])
@login_required
@teacher_required
def delete_section_api(school_slug, class_id, section_id):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first()

    if not school:
        return api_response(False, "School not found", status=404)

    if school.id != current_user.school_id:
        return api_response(False, "Unauthorized access", status=403)

    school_class = get_school_class(
        school_class_id=class_id,
        school_id=school.id
    )

    if not school_class:
        return api_response(False, "Class not found", status=404)

    try:

        section = delete_section(
            section_id=section_id,
            school_class_id=school_class.id
        )

        db.session.commit()

        return api_response(
            True,
            "Section deleted successfully"
        )

    except ValueError as e:
        db.session.rollback()
        return api_response(False, str(e), status=404)

    except Exception:
        db.session.rollback()
        logger.exception("Failed to delete section")
        return api_response(False, "Server error", status=500)