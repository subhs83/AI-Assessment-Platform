from flask import current_app, request
from smart_exam_system.extensions import db
from smart_exam_system.api.superAdmin import api_superadmin_bp
from flask_login import login_required, current_user
from smart_exam_system.api.utils.decorators import super_admin_required

from smart_exam_system.api.utils.api_response import api_response
from smart_exam_system.api.utils.request_validator import validate_required_fields
from smart_exam_system.api.services.subscription_management_service import (
    get_school_subscription_summary,
    change_school_subscription_plan,
    extend_school_subscription,
    add_bonus_ai_credits,
    update_subscription_status

)

import logging
logger = logging.getLogger(__name__)



@api_superadmin_bp.route(
    "/schools/<int:school_id>/subscription",
    methods=["GET"],
)
@login_required
@super_admin_required
def get_school_subscription_api(school_id):
    """
    Get complete subscription summary for a school.
    """
    print("Get complete subscription summary for a school. :")

    try:
        data = get_school_subscription_summary(school_id)

        

        return api_response(
            success=True,
            message="Subscription retrieved successfully.",
            data=data,
            status=200,
        )

    except ValueError as e:
        return api_response(
            success=False,
            message=str(e),
            status=404,
        )

    except Exception:
        current_app.logger.exception(
            "Failed to retrieve school subscription."
        )

        return api_response(
            success=False,
            message="Failed to retrieve subscription.",
            status=500,
        )



@api_superadmin_bp.route(
    "/schools/<int:school_id>/subscription/plan",
    methods=["PUT"],
)
@login_required
@super_admin_required
def change_school_subscription_plan_api(school_id):
    """
    Change a school's subscription plan.
    """

    try:
        data = request.get_json() or {}

        validate_required_fields(
            data,
            [
                "plan_code",
                "billing_cycle",
                "duration_days",
            ],
        )

        change_school_subscription_plan(
            school_id=school_id,
            plan_code=data["plan_code"],
            billing_cycle=data["billing_cycle"],
            duration_days=data["duration_days"],
        )

        return api_response(
            success=True,
            message="Subscription plan updated successfully.",
            status=200,
        )

    except ValueError as e:
        return api_response(
            success=False,
            message=str(e),
            status=400,
        )

    except Exception:
        logger.exception("Failed to change subscription plan.")

        return api_response(
            success=False,
            message="Failed to update subscription plan.",
            status=500,
        )
    


@api_superadmin_bp.route(
    "/schools/<int:school_id>/subscription/extend",
    methods=["PUT"],
)
@login_required
@super_admin_required
def extend_school_subscription_api(school_id):
    """
    Extend a school's subscription.
    """

    try:
        data = request.get_json() or {}
        validate_required_fields(
            data,
            [
                "duration_days",
            ],
        )

        extend_school_subscription(
            school_id=school_id,
            duration_days=data["duration_days"],
        )

        return api_response(
            success=True,
            message="Subscription extended successfully.",
            status=200,
        )

    except ValueError as e:
        return api_response(
            success=False,
            message=str(e),
            status=400,
        )

    except Exception:
        logger.exception("Failed to extend subscription.")

        return api_response(
            success=False,
            message="Failed to extend subscription.",
            status=500,
        )
    


@api_superadmin_bp.route(
    "/schools/<int:school_id>/subscription/bonus-credits",
    methods=["PUT"],
)
@login_required
@super_admin_required
def add_bonus_ai_credits_api(school_id):
    """
    Add bonus AI credits.
    """

    try:
        data = request.get_json() or {}
        validate_required_fields(
            data,
            [
                "credits",
            ],
        )

        add_bonus_ai_credits(
            school_id=school_id,
            credits=data["credits"],
        )

        return api_response(
            success=True,
            message="Bonus AI credits added successfully.",
            status=200,
        )

    except ValueError as e:
        return api_response(
            success=False,
            message=str(e),
            status=400,
        )

    except Exception:
        logger.exception("Failed to add bonus AI credits.")

        return api_response(
            success=False,
            message="Failed to add bonus AI credits.",
            status=500,
        )
    


@api_superadmin_bp.route(
    "/schools/<int:school_id>/subscription/status",
    methods=["PUT"],
)
@login_required
@super_admin_required
def update_subscription_status_api(school_id):
    """
    Update a school's subscription status.
    """

    try:
        data = request.get_json() or {}
        validate_required_fields(
            data,
            [
                "status",
            ],
        )

        update_subscription_status(
            school_id=school_id,
            status=data["status"],
        )

        return api_response(
            success=True,
            message="Subscription status updated successfully.",
            status=200,
        )

    except ValueError as e:
        return api_response(
            success=False,
            message=str(e),
            status=400,
        )

    except Exception:
        logger.exception("Failed to update subscription status.")

        return api_response(
            success=False,
            message="Failed to update subscription status.",
            status=500,
        )