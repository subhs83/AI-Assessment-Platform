from smart_exam_system.api.services.subscription_management_service import (
    get_school_subscription_summary,
)

from smart_exam_system.api.services.subscription_service import (
    get_ai_feature_summary,
    get_school_ai_quota
)


def get_ai_configuration(school_id):
    """
    Returns everything required by AI pages.
    """

    subscription = get_school_subscription_summary(
        school_id
    )
    quota = get_school_ai_quota(school_id)

    return {
        "subscription": {
            "plan": subscription["plan"]["name"],
            "status": subscription["subscription"]["status"],
            "total_ai_credits": quota["total_credits"],
            "used_ai_credits": quota["used_credits"],
            "remaining_ai_credits": quota["remaining_credits"],
            "expires_at": subscription["subscription"]["expires_at"],
        },

        "ai_features": get_ai_feature_summary(),
    }