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

    __table_args__ = (
            db.UniqueConstraint(
                "school_id",
                "student_class",
                "roll_number",
                name="uq_student_school_class_roll",
            ),
        )
    def to_dict(self):
        return {
            "student_uid": self.student_uid,
            "student_name": (
                f"{self.first_name} {self.last_name}"
            ).strip(),
            "first_name": self.first_name,
            "last_name": self.last_name,
            "mobile": self.mobile,
            "student_class": self.student_class,
            "roll_number": self.roll_number,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }    