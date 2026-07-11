# subscription_service.py
from datetime import UTC, date, datetime, timedelta
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from smart_exam_system.extensions import db
from smart_exam_system.constants.subscription import (
    BillingCycle,
    SubscriptionStatus,
)

from smart_exam_system.models import (
    SchoolSubscriptionModel,
    SubscriptionPlanModel,
    SchoolUsageModel,
    AIFeatureModel
    )
 

 


def get_school_subscription_record(school_id):
    """
    Return the school's subscription record.

    Args:
        school_id (int): School ID.

    Returns:
        SchoolSubscriptionModel

    Raises:
        ValueError: If the subscription does not exist.
    """

    subscription = db.session.scalar(
        select(SchoolSubscriptionModel).where(
            SchoolSubscriptionModel.school_id == school_id
        )
    )

    if not subscription:
        raise ValueError("Subscription not found.")

    return subscription


 
def calculate_subscription_expiry(duration_days):
    starts_at = datetime.utcnow()
    expires_at = starts_at + timedelta(days=duration_days)

    return starts_at, expires_at

def get_subscription_plan(plan_code):
    """
    Return an active subscription plan by its plan code.

    Args:
        plan_code (str): Stable business identifier
                         (TRIAL, STARTER, GROWTH, PROFESSIONAL)

    Returns:
        SubscriptionPlanModel

    Raises:
        ValueError: If the plan does not exist or is inactive.
    """

    plan = db.session.scalar(
        select(SubscriptionPlanModel).where(
            SubscriptionPlanModel.plan_code == plan_code,
            SubscriptionPlanModel.is_active.is_(True),
        )
    )

    if not plan:
        raise ValueError(f"Subscription plan '{plan_code}' not found.")

    return plan

def get_current_school_usage(school_id):
    """
    Returns the current billing period usage record for a school.

    Returns:
        SchoolUsageModel

    Raises:
        ValueError: If no usage record exists for the current billing period.
    """
    
    current_period = datetime.now(UTC).strftime("%Y-%m")

    usage = db.session.execute(
        db.select(SchoolUsageModel).filter_by(
            school_id=school_id,
            billing_period=current_period,
        )
    ).scalar_one_or_none()

    if usage is None:
        raise ValueError(
            "No active usage record found for the current billing period."
        )

    return usage


def get_school_subscription(school_id):
    """
    Return the active subscription for a school.

    Raises:
        ValueError: If the school has no active subscription.
    """
    subscription = (
        SchoolSubscriptionModel.query
        .options(joinedload(SchoolSubscriptionModel.plan))
        .filter_by(school_id=school_id)
        .first()
    )
    if not subscription:
        raise ValueError("School subscription not found.")
    

    return subscription



def get_school_limits(school_id):
    subscription = get_school_subscription(school_id)

    plan = subscription.plan
    if not subscription.plan:
        raise ValueError("Subscription plan not found.")

    return {
        "plan_id": plan.id,
        "plan_name": plan.name,

        "subscription_status": subscription.status,
        "expires_at": subscription.expires_at,

        "monthly_ai_credits": plan.monthly_ai_credits,

        "max_students": plan.max_students,
        "max_teachers": plan.max_teachers,
        "max_classes": plan.max_classes,
        "max_sections": plan.max_sections,

        "max_pdf_pages": plan.max_pdf_pages,
        "max_images_per_request": plan.max_images_per_request,
        "max_questions_per_generation": plan.max_questions_per_generation,

        "storage_mb": plan.storage_mb,
    }


def get_school_ai_quota(school_id):
    limits = get_school_limits(school_id)
    usage = get_current_school_usage(school_id)

    used = usage.ai_credits_used if usage else 0
    total = (
        limits["monthly_ai_credits"]
        + usage.bonus_ai_credits
    )
    remaining = max(total - used, 0)

    return {
        "total_credits": total,
        "used_credits": used,
        "remaining_credits": remaining,
    }


def initialize_school_subscription(
    school_id,
    plan_code="TRIAL",
):
    """
    Initialize subscription and usage for a newly created school.
    This function should be called before the surrounding transaction
    is committed.
    """

    plan = db.session.execute(
        db.select(SubscriptionPlanModel).filter_by(
            plan_code=plan_code,
            is_active=True,
        )
    ).scalar_one_or_none()

    if plan is None:
        raise ValueError(
            f"Subscription plan '{plan_code}' not found."
        )

    now = datetime.now(UTC)

    subscription = SchoolSubscriptionModel(
        school_id=school_id,
        plan_id=plan.id,
        billing_cycle="MONTHLY",
        status="TRIAL",
        starts_at=now,
        expires_at=now + timedelta(days=plan.trial_days),
    )

    usage = SchoolUsageModel(
        school_id=school_id,
        billing_period=now.strftime("%Y-%m"),
        ai_credits_used=0,
        bonus_ai_credits=0,
        storage_used_mb=0,
    )

    db.session.add(subscription)
    db.session.add(usage)

    return subscription



def consume_ai_credits(school_id, credits_used):
    """
    Deduct AI credits from the school's current billing period usage.

    Args:
        school_id (int): School ID.
        credits_used (int): Number of AI credits to consume.

    Returns:
        SchoolUsageModel: Updated usage record.

    Raises:
        ValueError: If credits_used is less than or equal to zero.
    """

    if credits_used <= 0:
        raise ValueError("Credits used must be greater than zero.")

    usage = get_current_school_usage(school_id)

    usage.ai_credits_used += credits_used

    return usage




def get_ai_feature(feature_code):
    """
    Return an active AI feature by its feature code.

    Args:
        feature_code (str): Unique feature code.

    Returns:
        AIFeatureModel

    Raises:
        ValueError: If the feature is not found or inactive.
    """

    feature = (
        AIFeatureModel.query
        .filter_by(
            feature_code=feature_code,
            is_active=True,
        )
        .first()
    )

    if not feature:
        raise ValueError(
            f"AI feature '{feature_code}' not found."
        )

    return feature