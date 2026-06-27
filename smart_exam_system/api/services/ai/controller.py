from smart_exam_system.api.services.ai.extractor import extract_input
from smart_exam_system.api.services.ai.ai_service import generate_from_gemini
from smart_exam_system.api.services.ai.response_parser import parse_ai_response
from smart_exam_system.api.services.ai.ai_summary_service import generate_ai_summary
from smart_exam_system.api.services.ai.content_preparer import (
    prepare_ai_content
)
from smart_exam_system.models import AIGenerationRequest
from smart_exam_system.extensions import db
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

    try:
        ai_response = generate_from_gemini(
            content=content,
            difficulty=difficulty,
            question_count=question_count
        )
    except Exception:
        logger.exception("Failed to generate questions")

        return {
            "success": False,
            "message": "Failed to generate questions."
        }

    parsed = parse_ai_response(ai_response)

    if not parsed.get("success"):
        return parsed

    questions = parsed["data"]

    ai_request = AIGenerationRequest(
        school_id=school_id,
        teacher_id=teacher_id,
        source_type=input_type,
        source_text=content,
        difficulty=difficulty,
        question_count=question_count,
        generated_questions=questions,
        status="completed"
    )

    db.session.add(ai_request)
    db.session.commit()

    return {
        "success": True,
        "request_id": ai_request.id,
        "data": questions
    }