
from enum import Enum

from smart_exam_system.extensions import db
from smart_exam_system.models.user import UserModel
from datetime import datetime
from sqlalchemy.orm import backref
import uuid

class ReviewMode(str, Enum): 
    NO_REVIEW = "no_review" 
    QUESTIONS_ONLY = "questions_only" 
    FULL_REVIEW = "full_review"

class ExamModel(db.Model):
    __tablename__ = "exams"

    id = db.Column(db.Integer, primary_key=True)

    exam_uid = db.Column(
    db.String(36),
    unique=True,
    nullable=False,
    default=lambda: str(uuid.uuid4()),
    index=True,
)
    title = db.Column(db.String, nullable=False)
    
    duration_minutes = db.Column(db.Integer, nullable=False)

    marks_per_question = db.Column(db.Integer, default=1)
    negative_marks = db.Column(db.Float, default=0)

    # ✅ Rename to reflect student_id usage
    max_attempts_per_student = db.Column(db.Integer, default=1)

    status = db.Column(db.String, default="draft")

    teacher_id = db.Column(db.Integer, nullable=False)

    quiz_code = db.Column(db.String(20), unique=True, nullable=True)

     # ✅ NEW Exam Mode

    registration_mode = db.Column( db.String(20), nullable=False,  default="open")

    # ✅ NEW SCHEDULING FIELDS
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    published_at = db.Column(db.DateTime, nullable=True)

    # ✅ Explicit foreign key
    school_id = db.Column(db.Integer, db.ForeignKey("schools.id"), nullable=False)

    review_mode = db.Column(
        db.String(20),
        nullable=False,
        default=ReviewMode.QUESTIONS_ONLY.value,

    )
    
    # ✅ Relationship
    school = db.relationship("SchoolModel", backref="exams")

    def __repr__(self):
        return f"<Exam {self.title}>"
    
    @property
    def class_names(self):
        return sorted({
            target.school_class.name
            for target in self.targets
        })

    @property
    def section_names(self):
        return sorted({
            target.school_section.name
            for target in self.targets
            if target.school_section
        })

    @property
    def class_sections(self):
        return [
            (
                f"{target.school_class.name} {target.school_section.name}"
                if target.school_section
                else target.school_class.name
            )
            for target in self.targets
        ]

    @property
    def class_name(self):
        return ", ".join(self.class_names)

    @property
    def section_name(self):
        return ", ".join(self.section_names)

    @property
    def class_section(self):
        return ", ".join(self.class_sections)





class ExamTargetModel(db.Model):
    __tablename__ = "exam_targets"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    exam_id = db.Column(
        db.Integer,
        db.ForeignKey("exams.id"),
        nullable=False,
        index=True,
    )

    school_class_id = db.Column(
        db.Integer,
        db.ForeignKey("school_classes.id"),
        nullable=False,
        index=True,
    )

    school_section_id = db.Column(
        db.Integer,
        db.ForeignKey("school_sections.id"),
        nullable=True,
        index=True,
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    exam = db.relationship(
        "ExamModel",
        backref=backref(
            "targets",
            cascade="all, delete-orphan",
            lazy="select",
        ),
    )

    school_class = db.relationship(
        "SchoolClassModel"
    )

    school_section = db.relationship(
        "SchoolSectionModel"
    )
 

    __table_args__ = (
        db.UniqueConstraint(
            "exam_id",
            "school_class_id",
            "school_section_id",
            name="uq_exam_target",
        ),
    )

    


# ================= NEW SYSTEM =================
    @classmethod
    def count_by_school(cls,school_id):
        return ExamModel.query.filter_by(
            school_id=school_id
        ).count()
# ================= NEW SYSTEM =================
    @classmethod
    def get_exams_by_teacher(cls,teacher_id):
        return ExamModel.query.filter_by(
            teacher_id=teacher_id
        ).all()

# ================= NEW SYSTEM =================

    @classmethod
    def get_teacher_id_by_exam(cls,exam_id):
        exam = ExamModel.query.filter_by(id=exam_id).first()
        return exam.teacher_id if exam else None

    @classmethod
    def get_exams_by_school(cls,school_id):
        return ExamModel.query.filter_by(school_id=school_id).all()
 # ================= NEW SYSTEM =================
    @classmethod
    def get_exam_info(cls,exam_id):
        # Fetch exam object
        exam = ExamModel.query.filter_by(id=exam_id).first()
        if not exam:
            return None, None  # safe if exam doesn't exist

        # Fetch teacher object
        teacher = UserModel.query.filter_by(id=exam.teacher_id).first()
        teacher_name = teacher.name if teacher else None

        # Return in same order as old function
        return exam.title, teacher_name
 # ================= New SYSTEM =================       
 
    