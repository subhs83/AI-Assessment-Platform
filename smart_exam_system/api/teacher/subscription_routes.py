from flask_login import login_required, current_user
from smart_exam_system.api.teacher import api_teacher_bp
from smart_exam_system.api.utils.decorators import teacher_required
from smart_exam_system.models import SchoolModel, ExamModel
from smart_exam_system.api.utils.api_response import api_response
from smart_exam_system.api.services.subscription_management_service import get_school_subscription_summary


import logging
logger = logging.getLogger(__name__)



@api_teacher_bp.route(
    "/<school_slug>/subscription",
    methods=["GET"],
)
@login_required
@teacher_required
def subscription(school_slug):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first()

    if not school:
        return api_response(
            success=False,
            message="School not found.",
            status=404,
        )

    if school.id != current_user.school_id:
        return api_response(
            success=False,
            message="Invalid school access.",
            status=403,
        )

    summary = get_school_subscription_summary(
        school.id
    )

    return api_response(
        success=True,
        message="Subscription loaded successfully.",
        data=summary,
    )