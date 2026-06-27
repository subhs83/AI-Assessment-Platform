from smart_exam_system.extensions import db
from datetime import datetime


class LoginLogModel(db.Model):

    __tablename__ = "login_logs"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, nullable=True)
    email = db.Column(db.String(120))

    success = db.Column(db.Boolean, default=False)

    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(255))

    timestamp = db.Column(db.DateTime, default=datetime.utcnow)