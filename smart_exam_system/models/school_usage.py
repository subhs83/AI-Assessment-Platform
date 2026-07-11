from smart_exam_system.extensions import db
from sqlalchemy import func


class SchoolUsageModel(db.Model):
    __tablename__ = "school_usage"

    id = db.Column(db.Integer, primary_key=True)

    school_id = db.Column(
        db.Integer,
        db.ForeignKey("schools.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    billing_period = db.Column(
        db.String(20),
        nullable=False,
    )

    ai_credits_used = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    bonus_ai_credits = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    storage_used_mb = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    school = db.relationship(
        "SchoolModel",
        back_populates="usages",
    )