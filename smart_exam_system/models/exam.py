
from smart_exam_system.extensions import db
from smart_exam_system.models.user import UserModel

class ExamModel(db.Model):
    __tablename__ = "exams"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
     # ✅ NEW SCHEDULING FIELDS
    class_name = db.Column(db.String(50), nullable=True)
    
    duration_minutes = db.Column(db.Integer, nullable=False)

    marks_per_question = db.Column(db.Integer, default=1)
    negative_marks = db.Column(db.Float, default=0)

    # ✅ Rename to reflect student_id usage
    max_attempts_per_student = db.Column(db.Integer, default=1)

    status = db.Column(db.String, default="draft")

    teacher_id = db.Column(db.Integer, nullable=False)

    quiz_code = db.Column(db.String(20), unique=True, nullable=True)

    # ✅ NEW SCHEDULING FIELDS
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    published_at = db.Column(db.DateTime, nullable=True)

    # ✅ Explicit foreign key
    school_id = db.Column(db.Integer, db.ForeignKey("schools.id"), nullable=False)

    show_result_review = db.Column(db.Boolean, default=True, nullable=False)
    
    # ✅ Relationship
    school = db.relationship("SchoolModel", backref="exams")

    def __repr__(self):
        return f"<Exam {self.title}>"


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
 
    