from flask import g, jsonify
from flask_login import current_user
from smart_exam_system.api.school import api_school_bp
from smart_exam_system.api.utils.decorators import school_access_required
from smart_exam_system.api.utils.api_response import api_response

from smart_exam_system.api.services.subscription_management_service import get_school_subscription_summary

from smart_exam_system.api.services.exam_service import ( 
    get_exam_options_api
    
    )

from smart_exam_system.api.services.branding_service import  get_school_branding

import logging
logger = logging.getLogger(__name__)





@api_school_bp.route(
    "/<school_slug>/options",
    methods=["GET"],
)
@school_access_required
def exam_options_api(school_slug):

    result, status = get_exam_options_api(
        school_id=g.school.id,
        teacher_id=current_user.id,
    )

    result["data"] = {
        "exams": result["data"],
    }

    return api_response(
        **result,
        status=status,
    )


@api_school_bp.route("/<school_slug>/subscription-summary", methods=["GET"],)
@school_access_required
def subscription_summary_api(school_slug):

    data = get_school_subscription_summary(
        school_id=g.school.id,
    )

    return api_response(
        success=True,
        data=data,
        status=200,
    )


@api_school_bp.route("/<school_slug>/branding",  methods=["GET"],)
def get_branding(school_slug):

    branding = get_school_branding(school_slug)

    if not branding:
        return jsonify({
            "success": False,
            "message": "School not found",
            "data": None,
            "error": "school_not_found",
        }), 404

    return jsonify({
        "success": True,
        "message": "Branding fetched successfully",
        "data": branding,
        "error": None,
    }), 200