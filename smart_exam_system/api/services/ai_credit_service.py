from smart_exam_system.api.services.subscription_service import (
    get_ai_feature,
    get_school_ai_quota,
)

FEATURE_MAP = {
    "topic": "TOPIC_QUESTION",
    "manual": "TEXT_QUESTION",
    "pdf": "PDF_QUESTION",
    "image": "IMAGE_QUESTION",
}


def process_ai_credit(school_id, input_type):
    """
    Validate whether the school has enough AI credits for the requested feature.

    Args:
        school_id (int): School ID.
        input_type (str): topic, manual, pdf or image.

    Returns:
        int: Credits required for this request.

    Raises:
        ValueError: If the feature is unsupported or credits are insufficient.
    """

    feature_code = FEATURE_MAP.get(input_type)

    if not feature_code:
        raise ValueError(f"Unsupported AI feature: {input_type}")

    feature = get_ai_feature(feature_code)

    quota = get_school_ai_quota(school_id)

    if quota["remaining_credits"] < feature.credits_required:
        raise ValueError(
            "Your school has insufficient AI credits. Please upgrade your subscription or purchase additional credits."
        )

    return feature.credits_required