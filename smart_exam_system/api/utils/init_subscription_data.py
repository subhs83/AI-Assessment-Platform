from smart_exam_system.extensions import db
from smart_exam_system.models import (
    SubscriptionPlanModel,
    AIFeatureModel,
)


DEFAULT_PLANS = [
    {
        
        "plan_code": "TRIAL",
        "name": "Trial",
        "description": "Free trial plan",
        "monthly_price": 0,
        "yearly_price": 0,
        "trial_days": 14,
        "monthly_ai_credits": 300,
        "max_students": 100,
        "max_teachers": 5,
        "max_classes": 5,
        "max_sections": 10,
        "max_pdf_pages": 5,
        "max_images_per_request": 5,
        "max_questions_per_generation": 20,
        "storage_mb": 1024,
        "display_order": 1,
        "is_active": True,
    },
    {
        "plan_code": "STARTER",
        "name": "Starter",
        "description": "Starter subscription",
        "monthly_price": 2499,
        "yearly_price": 25000,
        "trial_days": 0,
        "monthly_ai_credits": 2500,
        "max_students": 500,
        "max_teachers": 15,
        "max_classes": 20,
        "max_sections": 50,
        "max_pdf_pages": 10,
        "max_images_per_request": 10,
        "max_questions_per_generation": 50,
        "storage_mb": 5120,
        "display_order": 2,
        "is_active": True,
    },
    {
        "plan_code": "GROWTH",
        "name": "Growth",
        "description": "Growth subscription",
        "monthly_price": 4999,
        "yearly_price": 50000,
        "trial_days": 0,
        "monthly_ai_credits": 7500,
        "max_students": 1000,
        "max_teachers": 50,
        "max_classes": 50,
        "max_sections": 200,
        "max_pdf_pages": 10,
        "max_images_per_request": 10,
        "max_questions_per_generation": 50,
        "storage_mb": 10240,
        "display_order": 3,
        "is_active": True,
    },
    {
        "plan_code": "PROFESSIONAL",
        "name": "Professional",
        "description": "Professional subscription",
        "monthly_price": 9999,
        "yearly_price": 99999,
        "trial_days": 0,
        "monthly_ai_credits": 20000,
        "max_students": 999999,
        "max_teachers": 999999,
        "max_classes": 999999,
        "max_sections": 999999,
        "max_pdf_pages": 10,
        "max_images_per_request": 10,
        "max_questions_per_generation": 50,
        "storage_mb": 51200,
        "display_order": 4,
        "is_active": True,
    },
]


def create_default_subscription_plans():
    for plan_data in DEFAULT_PLANS:

        plan = SubscriptionPlanModel.query.filter_by(
            plan_code=plan_data["plan_code"]
        ).first()

        if plan:
            for key, value in plan_data.items():
                setattr(plan, key, value)
        else:
            db.session.add(
                SubscriptionPlanModel(**plan_data)
            )

    db.session.commit()



DEFAULT_AI_FEATURES = [
    {
        "feature_code": "TOPIC_QUESTION",
        "feature_name": "Generate Questions from Topic",
        "credits_required": 10,
        "is_active": True,
    },
    {
        "feature_code": "TEXT_QUESTION",
        "feature_name": "Generate Questions from Text",
        "credits_required": 10,
        "is_active": True,
    },
    {
        "feature_code": "PDF_QUESTION",
        "feature_name": "Generate Questions from PDF",
        "credits_required": 15,
        "is_active": True,
    },
    {
        "feature_code": "IMAGE_QUESTION",
        "feature_name": "Generate Questions from Image",
        "credits_required": 15,
        "is_active": True,
    },
]





def create_default_ai_features():
    for feature_data in DEFAULT_AI_FEATURES:

        feature = AIFeatureModel.query.filter_by(
            feature_code=feature_data["feature_code"]
        ).first()

        if feature:
            for key, value in feature_data.items():
                setattr(feature, key, value)
        else:
            db.session.add(
                AIFeatureModel(**feature_data)
            )

    db.session.commit()