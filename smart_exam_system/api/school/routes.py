from flask import g
from flask_login import current_user
from smart_exam_system.api.school import api_school_bp
from smart_exam_system.api.utils.decorators import school_access_required
from smart_exam_system.api.utils.api_response import api_response

from smart_exam_system.api.services.subscription_management_service import get_school_subscription_summary

from smart_exam_system.api.services.exam_service import ( 
    get_exam_options_api
    
    )

import logging
logger = logging.getLogger(__name__)





@api_school_bp.route( "/<school_slug>/options", methods=["GET"],)
@school_access_required
def exam_options_api(school_slug):

    result, status = get_exam_options_api(
        school_id=g.school.id,
        teacher_id=current_user.id,
    )

    subscription = get_school_subscription_summary(
        school_id=g.school.id,
    )

    result["data"] = {
        "exams": result["data"],
        "ai_quota": {
            "plan": subscription["plan"]["name"],
            "total_ai_credits": subscription["usage"]["total_ai_credits"],
            "used_ai_credits": subscription["usage"]["used_ai_credits"],
            "remaining_ai_credits": subscription["usage"]["remaining_ai_credits"],
        },
    }

    return api_response(
        **result,
        status=status,
    )