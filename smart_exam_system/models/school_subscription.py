from smart_exam_system.extensions import db
from sqlalchemy import func
import uuid

class SchoolSubscriptionModel(db.Model):
    __tablename__ = "school_subscriptions"

    id = db.Column(db.Integer, primary_key=True)

    subscription_uid = db.Column(
        db.String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )

    school_id = db.Column(
        db.Integer,
        db.ForeignKey("schools.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    plan_id = db.Column(
        db.Integer,
        db.ForeignKey("subscription_plans.id", ondelete="RESTRICT"),
        nullable=False,
    )

    billing_cycle = db.Column(
        db.String(20),
        nullable=False,
        default="MONTHLY",
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="TRIAL",
    )

    starts_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
    )

    expires_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
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
        back_populates="subscription",
    )

    plan = db.relationship(
        "SubscriptionPlanModel",
    )