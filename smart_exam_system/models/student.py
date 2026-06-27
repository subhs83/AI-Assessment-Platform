from datetime import datetime
from smart_exam_system.extensions import db


class StudentModel(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)

    # identity (important)
    student_uid = db.Column(db.String(64), unique=True, index=True)

    # student details
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    mobile = db.Column(db.String(20), index=True)
    student_class = db.Column(db.String(50))
    roll_number = db.Column(db.String(50))

    school_id = db.Column(db.Integer, db.ForeignKey("schools.id"))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)