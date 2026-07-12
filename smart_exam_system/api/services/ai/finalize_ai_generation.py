from smart_exam_system.models import AIGenerationRequest
from smart_exam_system.extensions import db

from smart_exam_system.api.services.subscription_service import consume_ai_credits


def finalize_ai_generation(
    school_id,
    teacher_id,
    source_type,
    source_text,
    difficulty,
    blooms_level,
    question_count,
    generated_questions,
    document_language,
    credits_used,
    metadata=None,
):
    """
    Persist AI generation request and consume AI credits
    as a single database transaction.
    """

    try:
        request_obj = AIGenerationRequest(
            school_id=school_id,
            teacher_id=teacher_id,
            source_type=source_type,
            source_text=source_text,
            difficulty=difficulty,
            blooms_level=blooms_level,
            question_count=question_count,
            generated_questions=generated_questions,
            document_language=document_language,
            generation_metadata=metadata or {},
            status="completed",
        )

        db.session.add(request_obj)

        consume_ai_credits(
            school_id=school_id,
            credits_used=credits_used,
        )

        db.session.commit()

        return request_obj

    except Exception:
        db.session.rollback()
        raise