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

    school_class_id = db.Column(
        db.Integer,
        db.ForeignKey("school_classes.id"),
        nullable=True,
        index=True,
    )

    school_section_id = db.Column(
        db.Integer,
        db.ForeignKey("school_sections.id"),
        nullable=True,
        index=True,
    )

    school_class = db.relationship(
        "SchoolClassModel",
        foreign_keys=[school_class_id],
    )

    school_section = db.relationship(
        "SchoolSectionModel",
        foreign_keys=[school_section_id],
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        db.UniqueConstraint(
            "school_id",
            "school_class_id",
            "school_section_id",
            "roll_number",
            name="uq_student_school_class_section_roll",
        ),
    )

    @property
    def is_verified(self):
        return (
            self.student_registration_type
            == StudentRegistrationType.VERIFIED
        )

    @property
    def full_name(self):
        return (
            f"{self.first_name} {self.last_name}"
        ).strip()


    @property
    def class_name(self):
        return (
            self.school_class.name
            if self.school_class
            else None
        )

    @property
    def section_name(self):
        return (
            self.school_section.name
            if self.school_section
            else None
        )

    @property
    def class_section(self):
        parts = []

        if self.class_name:
            parts.append(self.class_name)

        if self.section_name:
            parts.append(self.section_name)

        return " ".join(parts) if parts else None


    def to_dict(self):
        return {
            "student_uid": self.student_uid,
            "student_name": self.full_name,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "mobile": self.mobile,
            "class_name": self.class_name,
            "section_name": self.section_name,
            "class_section": self.class_section,
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