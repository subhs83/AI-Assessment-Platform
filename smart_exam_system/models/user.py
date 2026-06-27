from flask_login import UserMixin
from smart_exam_system.extensions import db
from smart_exam_system.api.utils.security import hash_password, verify_password

# =========================
# User Model (SQLAlchemy)
# =========================
class UserModel(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    school_id = db.Column(db.Integer, db.ForeignKey("schools.id"))
    is_active = db.Column(db.Boolean, default=True)
    force_password_change = db.Column(db.Boolean, default=True)
    failed_login_attempts = db.Column(db.Integer, default=0, nullable=False)
    is_locked = db.Column(db.Boolean, default=False)
    locked_until = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "school_id": self.school_id,
            "school_slug": self.school.slug if self.school else None,
            "force_password_change": self.force_password_change,
            "is_active": self.is_active
        }

    # --- Static DB fetch ---
    @classmethod
    def get(user_id):
        
        return db.session.get(UserModel, user_id)

    # --- Teacher lifecycle actions (school-aware) ---
    @classmethod
    def activate_teacher(teacher_id, school_id):
        teacher = UserModel.query.filter_by(
            id=teacher_id, role="teacher", school_id=school_id
        ).first()
        if teacher:
            teacher.is_active = True
            db.session.commit()
            return True
        return False

    @classmethod
    def deactivate_teacher(teacher_id, school_id):
        teacher = UserModel.query.filter_by(
            id=teacher_id, role="teacher", school_id=school_id
        ).first()
        if teacher:
            teacher.is_active = False
            db.session.commit()
            return True
        return False

    @classmethod
    def reset_teacher_password(cls,teacher_id, school_id, new_password="default123"):
        teacher = UserModel.query.filter_by(
            id=teacher_id, role="teacher", school_id=school_id
        ).first()
        if teacher:
            teacher.password = hash_password(new_password)
            # force teacher to change password after login
            teacher.force_password_change = True
            db.session.commit()
            return True
        return False

    @classmethod
    def count_teachers_by_school(cls,school_id):
        return UserModel.query.filter_by(role="teacher", school_id=school_id).count()

    @classmethod
    def get_teachers_by_school(cls,school_id):
        return UserModel.query.filter_by(role="teacher", school_id=school_id).all()

    @classmethod
    def toggle_teacher_status(cls,teacher_id, school_id):
        teacher = UserModel.query.filter_by(
            id=teacher_id, role="teacher", school_id=school_id
        ).first()
        if teacher:
            teacher.is_active = not teacher.is_active
            db.session.commit()
            return True
        return False

    @classmethod
    def add_teacher(cls,name, email, password, school_id):
        existing = UserModel.query.filter_by(email=email).first()
        if existing:
            return None

        teacher = UserModel(
            name=name,
            email=email,
            password=hash_password(password),
            role="teacher",
            school_id=school_id,
            is_active=True
        )
        db.session.add(teacher)
        db.session.commit()
        return teacher
