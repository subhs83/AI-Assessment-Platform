from datetime import datetime

from smart_exam_system.extensions import db
from smart_exam_system.models.exam import ExamModel


class AttemptModel(db.Model):
    __tablename__ = "student_attempts"
    id = db.Column(db.Integer, primary_key=True)
    
    exam_id = db.Column(
        db.Integer,
        db.ForeignKey("exams.id"),
        nullable=False
    )

    school_id = db.Column(
        db.Integer,
        db.ForeignKey("schools.id"),
        nullable=False
    )
 

    # IPv4 / IPv6
    ip_address = db.Column(db.String(45))

    start_time = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    end_time = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    score = db.Column(db.Float)
    total_marks = db.Column(db.Float)
    percentage = db.Column(db.Float)

    attempt_number = db.Column(db.Integer)

    # Randomized question order
    question_order = db.Column(db.Text)

    # JSON mapping for randomized options
    option_order = db.Column(db.Text)

    is_submitted = db.Column(
        db.Boolean,
        default=False
    )

    # Violation / Auto-submit tracking
    violation_count = db.Column(
        db.Integer,
        default=0
    )

    violation_log = db.Column(
        db.Text,
        nullable=True
    )

    auto_submitted_reason = db.Column(
        db.String(255),
        nullable=True
    )

    last_violation_time = db.Column(
        db.DateTime,
        nullable=True
    )
    
    student_db_id = db.Column(
    db.Integer,
    db.ForeignKey("students.id"),
    nullable=True
    )
    
    # Relationships
    exam = db.relationship(
        ExamModel,
        backref="attempts"
    )

    __table_args__ = (
        db.Index(
            "idx_exam_submitted_percentage",
            "exam_id",
            "is_submitted",
            "percentage",
        ),
    )
    def to_dict(self):
        return {
            "id": self.id,
            "exam_id": self.exam_id,
            "school_id": self.school_id,

            "student_db_id": self.student_db_id,
            "attempt_number": self.attempt_number,

            "score": self.score,
            "total_marks": self.total_marks,
            "percentage": float(self.percentage or 0),

            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,

            "ip_address": self.ip_address,

            "is_submitted": self.is_submitted,

            "violation_count": self.violation_count,
            "violation_log": self.violation_log,
            "last_violation_time": (
                self.last_violation_time.isoformat()
                if self.last_violation_time else None
            ),

            "auto_submitted_reason": self.auto_submitted_reason,
        }
    # --------------------------
    # Query Helpers
    # --------------------------

    @classmethod
    def get_all_by_student(cls, student_name):
        return cls.query.filter_by(
            student_name=student_name
        ).all()

    @classmethod
    def get_by_id(cls, attempt_id):
        return cls.query.get(attempt_id)

    @classmethod
    def count_by_school(cls, school_id):
        return (
            db.session.query(db.func.count(cls.id))
            .join(ExamModel, cls.exam_id == ExamModel.id)
            .filter(ExamModel.school_id == school_id)
            .scalar()
        )

    @classmethod
    def get_attempt_count(cls, exam_id):
        return (
            db.session.query(db.func.count(cls.id))
            .filter_by(exam_id=exam_id)
            .scalar()
        )