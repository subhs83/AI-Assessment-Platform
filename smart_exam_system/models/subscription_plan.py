from smart_exam_system.extensions import db
from sqlalchemy import func
import uuid


class SubscriptionPlanModel(db.Model):
    __tablename__ = "subscription_plans"

    id = db.Column(db.Integer, primary_key=True)

    plan_uid = db.Column(
        db.String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )

    plan_code = db.Column(
        db.String(30),
        unique=True,
        nullable=False,
        index=True,
    )

    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)

    monthly_price = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    yearly_price = db.Column(db.Numeric(10, 2), nullable=False, default=0)

    trial_days = db.Column(db.Integer, nullable=False, default=0)

    monthly_ai_credits = db.Column(db.Integer, nullable=False, default=0)

    max_students = db.Column(db.Integer, nullable=False, default=0)
    max_teachers = db.Column(db.Integer, nullable=False, default=0)
    max_classes = db.Column(db.Integer, nullable=False, default=0)
    max_sections = db.Column(db.Integer, nullable=False, default=0)

    max_pdf_pages = db.Column(db.Integer, nullable=False, default=10)
    max_images_per_request = db.Column(db.Integer, nullable=False, default=10)
    max_questions_per_generation = db.Column(db.Integer, nullable=False, default=50)

    storage_mb = db.Column(db.Integer, nullable=False, default=1024)

    display_order = db.Column(db.Integer, nullable=False, default=0)

    is_active = db.Column(db.Boolean, nullable=False, default=True)

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