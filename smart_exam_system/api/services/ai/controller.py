from smart_exam_system.api.services.ai.extractor import extract_input
from smart_exam_system.api.services.ai.ai_service import generate_from_gemini
from smart_exam_system.api.services.ai.response_parser import parse_ai_response
from smart_exam_system.api.services.ai.content_preparer import prepare_ai_content
from smart_exam_system.api.services.ai.finalize_ai_generation import finalize_ai_generation

from smart_exam_system.api.services.ai_credit_service import process_ai_credit

from smart_exam_system.config import Config

import logging

logger = logging.getLogger(__name__)


def generate_ai_questions_controller(data, file, school_id, teacher_id):

    manual_content = data.get("content")

    if manual_content:

        content = prepare_ai_content(manual_content)
        input_type = data.get("source_type", "manual")

    else:

        extracted = extract_input(data, file)

        if not extracted.get("success"):
            return extracted

        content = prepare_ai_content(
            extracted["data"]["content"]
        )

        input_type = extracted["data"]["type"]

    difficulty = data.get("difficulty", "medium")
    question_count = data.get("question_count", 5)
    language = data.get(
        "language",
        Config.DEFAULT_OCR_LANGUAGE,
    )

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

    try:
        ai_response = generate_from_gemini(
            content=content,
            difficulty=difficulty,
            question_count=question_count,
            language=language,
        )
    except Exception:
        logger.exception("Failed to generate questions")

        return {
            "success": False,
            "message": "Failed to generate questions.",
        }

    parsed = parse_ai_response(ai_response)

    if not parsed.get("success"):
        return parsed

    questions = parsed["data"]

    ai_request = finalize_ai_generation(
        school_id=school_id,
        teacher_id=teacher_id,
        source_type=input_type,
        source_text=content,
        difficulty=difficulty,
        question_count=question_count,
        generated_questions=questions,
        document_language=language,
        credits_used=credits_required,
    )

    return {
        "success": True,
        "request_id": ai_request.id,
        "data": questions,
    }