from smart_exam_system.extensions import db
from sqlalchemy import func


class AIFeatureModel(db.Model):
    __tablename__ = "ai_features"

    id = db.Column(db.Integer, primary_key=True)

    feature_code = db.Column(
        db.String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    feature_name = db.Column(
        db.String(100),
        nullable=False,
    )

    credits_required = db.Column(
        db.Integer,
        nullable=False,
    )

    is_active = db.Column(
        db.Boolean,
        nullable=False,
        default=True,
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