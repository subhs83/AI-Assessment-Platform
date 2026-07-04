from datetime import datetime
from smart_exam_system.extensions import db


class StudentRegistrationType:
    OPEN = "OPEN"
    VERIFIED = "VERIFIED"


class StudentModel(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)

    # Permanent Student Identity
    student_uid = db.Column(
        db.String(64),
        unique=True,
        index=True,
    )

    # Student Details
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    mobile = db.Column(
        db.String(20),
        index=True,
    )

    # TODO:
    # Future migration:
    # student_class  -> class
    # student_section -> section
    student_class = db.Column(db.String(50))
    roll_number = db.Column(db.String(50))

    # Registration Category
    # VERIFIED -> Official school student
    # OPEN      -> Self-registered through Open Exam
    student_registration_type = db.Column(
        db.String(20),
        nullable=False,
        default=StudentRegistrationType.OPEN,
    )

    school_id = db.Column(
        db.Integer,
        db.ForeignKey("schools.id"),
        nullable=False,
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        db.UniqueConstraint(
            "school_id",
            "student_class",
            "roll_number",
            name="uq_student_school_class_roll",
        ),
    )

    @property
    def is_verified(self):
        return (
            self.student_registration_type
            == StudentRegistrationType.VERIFIED
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
            "student_registration_type": (
                self.student_registration_type
            ),
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }