from datetime import datetime

from smart_exam_system.extensions import db


class AIGenerationRequest(db.Model):
    __tablename__ = "ai_generation_requests"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    school_id = db.Column(
        db.Integer,
        db.ForeignKey("schools.id"),
        nullable=False,
        index=True
    )

    teacher_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    source_type = db.Column(
        db.String(20),
        nullable=False
    )
    # pdf | image | topic | text

    source_text = db.Column(
        db.Text
    )

    difficulty = db.Column(
        db.String(20),
        default="medium"
    )

    question_count = db.Column(
        db.Integer,
        default=10
    )

    source_summary = db.Column(db.Text, nullable=True)

    generated_questions = db.Column(
        db.JSON
    )

    generation_metadata = db.Column(
        db.JSON
    )

    status = db.Column(
        db.String(20),
        default="completed"
    )
    # pending/completed/failed

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )