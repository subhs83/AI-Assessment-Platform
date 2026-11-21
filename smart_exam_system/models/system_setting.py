from smart_exam_system.extensions import db
from sqlalchemy import func


class SystemSettingModel(db.Model):
    __tablename__ = "system_settings"

    key = db.Column(
        db.String(100),
        primary_key=True,
    )

    value = db.Column(
        db.String(255),
        nullable=False,
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
