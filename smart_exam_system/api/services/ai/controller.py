
from smart_exam_system.api.services.ai.ai_service import (
    generate_from_gemini,
)
from smart_exam_system.api.services.ai.response_parser import (
    parse_ai_response,
)
from smart_exam_system.api.services.ai.finalize_ai_generation import (
    finalize_ai_generation,
)
from smart_exam_system.api.services.ai_credit_service import (
    process_ai_credit,
)

from smart_exam_system.config import Config

import logging

logger = logging.getLogger(__name__)


def generate_ai_questions_controller(
    data,
    file,
    school_id,
    teacher_id,
):
    """
    Generate AI questions directly from a topic or uploaded file.

    Flow:

        Topic
          ↓
        Gemini
          ↓
        Question JSON
          ↓
        Parse
          ↓
        Finalize

    or:

        PDF/Image
          ↓
        Gemini
          ↓
        Question JSON
          ↓
        Parse
          ↓
        Finalize
    """

    topic = (
        data.get("topic") or ""
    ).strip()

    # ---------------------------------------------------------
    # Determine input type
    # ---------------------------------------------------------

    if topic:

        input_type = "topic"

        content = topic

    elif file:

        filename = (
            file.filename or ""
        ).lower()

        if filename.endswith(".pdf"):

            input_type = "pdf"

        elif filename.endswith(
            (".png", ".jpg", ".jpeg")
        ):

            input_type = "image"

        else:

            return {
                "success": False,
                "message": "Invalid input format.",
            }

        content = None

    else:

        return {
            "success": False,
            "message": "Please enter a topic or upload a file.",
        }

    # ---------------------------------------------------------
    # Generation settings
    # ---------------------------------------------------------

    difficulty = data.get(
        "difficulty",
        "medium",
    )

    blooms_level = data.get(
        "blooms_level",
        "mixed",
    )

    question_count = data.get(
        "question_count",
        5,
    )

    language = data.get(
        "language",
        Config.DEFAULT_OCR_LANGUAGE,
    )

    # ---------------------------------------------------------
    # Process AI credit
    # ---------------------------------------------------------

    try:

        credits_required = process_ai_credit(
            school_id=school_id,
            input_type=input_type,
        )

    except ValueError as e:

        return {
            "success": False,
            "message": str(e),
        }

    # ---------------------------------------------------------
    # Gemini question generation
    # ---------------------------------------------------------

    try:

        ai_response = generate_from_gemini(
            content=content,
            file=file,
            difficulty=difficulty,
            blooms_level=blooms_level,
            question_count=question_count,
            language=language,
        )

    except Exception:

        logger.exception(
            "Failed to generate questions"
        )

        return {
            "success": False,
            "message": "Failed to generate questions.",
        }

    # ---------------------------------------------------------
    # Parse Gemini response
    # ---------------------------------------------------------

    parsed = parse_ai_response(
        ai_response
    )

    if not parsed.get("success"):

        return parsed

    questions = parsed["data"]

    # ---------------------------------------------------------
    # Finalize generation
    # ---------------------------------------------------------

    ai_request = finalize_ai_generation(
        school_id=school_id,
        teacher_id=teacher_id,
        source_type=input_type,
        source_text=content or "",
        analysis_report=None,
        difficulty=difficulty,
        blooms_level=blooms_level,
        question_count=question_count,
        generated_questions=questions,
        document_language=language,
        credits_used=credits_required,
    )

    # ---------------------------------------------------------
    # Response
    # ---------------------------------------------------------

    return {
        "success": True,
        "request_id": ai_request.id,
        "data": questions,
    }
