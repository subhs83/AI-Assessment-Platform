
import uuid
from smart_exam_system.extensions import db

class AdditionalAttemptGrant(db.Model):
    __tablename__ = "additional_attempt_grants"

    id = db.Column(db.Integer, primary_key=True)

    grant_uid = db.Column(
        db.String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid.uuid4())
    )

    school_id = db.Column(
        db.Integer,
        db.ForeignKey("schools.id"),
        nullable=False,
    )

    exam_id = db.Column(
        db.Integer,
        db.ForeignKey("exams.id"),
        nullable=False,
    )

    student_db_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id"),
        nullable=False,
    )

    teacher_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    granted_attempts = db.Column(
        db.Integer,
        nullable=False,
        default=1,
    )

    reason = db.Column(
        db.Text,
        nullable=False,
    )

    school_id = db.Column(
        db.Integer,
        db.ForeignKey("schools.id"),
        nullable=False,
        index=True,
    )

    exam_id = db.Column(
        db.Integer,
        db.ForeignKey("exams.id"),
        nullable=False,
        index=True,
    )

    student_db_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id"),
        nullable=False,
        index=True,
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
    )

    exam = db.relationship(
        "ExamModel",
        backref="additional_attempt_grants"
    )

    student = db.relationship(
        "StudentModel",
        backref="additional_attempt_grants"
    )

    teacher = db.relationship(
        "UserModel",
        backref="additional_attempt_grants",
    )

    school = db.relationship(
        "SchoolModel",
        backref="additional_attempt_grants"
    )

    __table_args__ = (
        db.CheckConstraint(
            "granted_attempts > 0",
            name="ck_granted_attempts_positive",
        ),
    )