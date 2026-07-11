from smart_exam_system.constants.ai_features import AIFeature
from smart_exam_system.api.services.subscription_service import (
    validate_ai_credit_usage,
)


def process_ai_credit(school_id, input_type):
    """
    Validate AI credit availability for the requested feature.

    Args:
        school_id (int): School ID.
        input_type (str): topic, manual, pdf or image.

    Returns:
        int: Credits required for the request.

    Raises:
        ValueError: If the feature is unsupported or the request
        is not permitted.
    """

    feature = {
        "topic": AIFeature.TOPIC_QUESTION,
        "manual": AIFeature.TEXT_QUESTION,
        "pdf": AIFeature.PDF_QUESTION,
        "image": AIFeature.IMAGE_QUESTION,
    }.get(input_type)

    if feature is None:
        raise ValueError(
            f"Unsupported AI feature: {input_type}"
        )

    validation = validate_ai_credit_usage(
        school_id=school_id,
        feature_code=feature.value,
    )

    return validation["feature"].credits_required