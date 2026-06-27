from datetime import datetime
from smart_exam_system.extensions import db


class DemoRequest(db.Model):
    __tablename__ = "demo_requests"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    phone = db.Column(db.String(20))  # ✅ ADD THIS
    email = db.Column(db.String(120))
    school_name = db.Column(db.String(150))
    message = db.Column(db.Text)
    size = db.Column(db.String(20))   # ✅ ADD THIS
    status = db.Column(db.String(20), default="new")  # new, contacted, closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ContactMessage(db.Model):
    __tablename__ = "contact_messages"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    phone = db.Column(db.String(20))  # ✅ ADD THIS
    email = db.Column(db.String(120))
    message = db.Column(db.Text)

    status = db.Column(db.String(20), default="new")  # new, contacted, closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)