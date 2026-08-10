from smart_exam_system.models import AIGenerationRequest
from smart_exam_system.extensions import db

from smart_exam_system.api.services.subscription_service import consume_ai_credits


def finalize_ai_generation(
    school_id,
    teacher_id,
    source_type,
    source_text,
    analysis_report=None,
    difficulty=None,
    blooms_level=None,
    question_count=None,
    generated_questions=None,
    document_language=None,
    credits_used=0,
    metadata=None,
):
    """
    Persist AI generation request and consume AI credits
    as a single database transaction.
    """

    try:
        # print("\n========== STEP 3 ==========")
        # print(type(analysis_report))
        # print("analysis_report is None:", analysis_report is None)
        request_obj = AIGenerationRequest(
            school_id=school_id,
            teacher_id=teacher_id,
            source_type=source_type,
            source_text=source_text,
            analysis_report=analysis_report,
            difficulty=difficulty,
            blooms_level=blooms_level,
            question_count=question_count,
            generated_questions=generated_questions,
            document_language=document_language,
            generation_metadata=metadata or {},
            status="completed",
        )
        # print("\n========== STEP 4 ==========")
        # print(type(request_obj.analysis_report))
        # print(request_obj.analysis_report is None)
        db.session.add(request_obj)

        consume_ai_credits(
            school_id=school_id,
            credits_used=credits_used,
        )

        db.session.commit()
        # print("\n========== STEP 5 ==========")
        # print("Saved ID:", request_obj.id)
        # print("Stored analysis:", request_obj.analysis_report is None)

        return request_obj

    except Exception:
        db.session.rollback()
        raise