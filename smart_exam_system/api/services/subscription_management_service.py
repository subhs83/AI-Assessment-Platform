
from smart_exam_system.extensions import db
from datetime import UTC, date, datetime, timedelta
from smart_exam_system.models import (
    SchoolModel,
)


from smart_exam_system.api.services.subscription_service import (
    get_school_subscription,
    get_school_limits,
    get_school_ai_quota,
    get_current_school_usage,
    get_subscription_plan,
    calculate_subscription_expiry,
    get_school_subscription_record,
    get_school_resource_usage,
    get_subscription_billing_period,
)


def get_school_subscription_summary(school_id):
    """
    Return complete subscription information for a school.

    Used by the Super Admin Subscription page.
    """
    
    school = db.session.get(SchoolModel, school_id)
    

    if not school:
        raise ValueError("School not found.")

    subscription = get_school_subscription(school_id)
    

    limits = get_school_limits(school_id)


    quota = get_school_ai_quota(school_id)

    subscription = get_school_subscription(school_id)

    billing_period = get_subscription_billing_period(subscription)

    usage = get_current_school_usage(
        school_id,
        billing_period,
    )

    resource_usage = get_school_resource_usage( school_id)

    plan = subscription.plan

    return {
        "school": {
            "id": school.id,
            "name": school.name,
            "slug": school.slug,
        },

        "plan": {
            "plan_uid": plan.plan_uid,
            "plan_code": plan.plan_code,
            "name": plan.name,
            "description": plan.description,
        },

        "subscription": {
            "status": subscription.status,
            "billing_cycle": subscription.billing_cycle,
            "starts_at": subscription.starts_at,
            "expires_at": subscription.expires_at,
        },

        "limits": {
            "max_students": limits["max_students"],
            "max_teachers": limits["max_teachers"],
            "max_upload_size_mb": limits["storage_mb"],
            "max_pdf_pages": limits["max_pdf_pages"],
            "max_images_per_request": limits["max_images_per_request"],
            "max_questions_per_generation": limits["max_questions_per_generation"],
            "monthly_ai_credits": limits["monthly_ai_credits"],
        },


        "usage": {

            "bonus_ai_credits": usage.bonus_ai_credits,

            "total_ai_credits": quota["total_credits"],
            "used_ai_credits": quota["used_credits"],
            "remaining_ai_credits": quota["remaining_credits"],
        },

        "resources": resource_usage,
    }


def change_school_subscription_plan(
    school_id,
    plan_code,
    billing_cycle,
    duration_days,
):
    """
    Change a school's subscription plan.

    This operation immediately activates the selected plan.
    """

    school = db.session.get(SchoolModel, school_id)

    if not school:
        raise ValueError("School not found.")

    if duration_days <= 0:
        raise ValueError("Duration must be greater than zero.")

    allowed_cycles = {
        "MONTHLY",
        "YEARLY",
        "LIFETIME",
    }

    if billing_cycle not in allowed_cycles:
        raise ValueError("Invalid billing cycle.")

    subscription = get_school_subscription_record(school_id)

    plan = get_subscription_plan(plan_code)

    starts_at, expires_at = calculate_subscription_expiry(
        duration_days
    )

    subscription.plan_id = plan.id
    subscription.status = "ACTIVE"
    subscription.billing_cycle = billing_cycle
    subscription.starts_at = starts_at
    subscription.expires_at = expires_at

    db.session.commit()

    return subscription



def extend_school_subscription(
    school_id,
    duration_days,
):
    """
    Extend a school's subscription.

    If the subscription is still active, extend from the current
    expiry date.

    If the subscription has already expired, extend from today.
    """

    if duration_days <= 0:
        raise ValueError("Duration must be greater than zero.")

    subscription = get_school_subscription_record(school_id)

    now = datetime.now(UTC)

    base_date = max(
        subscription.expires_at,
        now,
    )

    subscription.expires_at = base_date + timedelta(
        days=duration_days
    )

    db.session.commit()

    return subscription


 

def add_bonus_ai_credits(
    school_id,
    credits,
):
    """
    Add bonus AI credits to a school's current billing period.
    """

    if credits <= 0:
        raise ValueError("Credits must be greater than zero.")

    subscription = get_school_subscription(school_id)

    billing_period = get_subscription_billing_period(subscription)

    usage = get_current_school_usage(
        school_id,
        billing_period,
    )

    usage.bonus_ai_credits += credits

    db.session.commit()

    return usage





def update_subscription_status(
    school_id,
    status,
):
    """
    Update a school's subscription status.
    """

    allowed_statuses = {
        "TRIAL",
        "ACTIVE",
        "EXPIRED",
        "SUSPENDED",
        "CANCELLED",
    }

    if status not in allowed_statuses:
        raise ValueError("Invalid subscription status.")

    subscription = get_school_subscription_record(school_id)

    subscription.status = status

    db.session.commit()

    return subscription



