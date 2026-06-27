from smart_exam_system.models import (
    AIGenerationRequest
)
from smart_exam_system.extensions import db


def create_ai_request(
    school_id,
    teacher_id,
    source_type,
    source_text,
    difficulty,
    question_count,
    generated_questions,
    metadata=None,
):
    request_obj = AIGenerationRequest(
        school_id=school_id,
        teacher_id=teacher_id,
        source_type=source_type,
        source_text=source_text,
        difficulty=difficulty,
        question_count=question_count,
        generated_questions=generated_questions,
        generation_metadata=metadata or {},
        status="completed",
    )

    db.session.add(request_obj)
    db.session.commit()

    return request_obj