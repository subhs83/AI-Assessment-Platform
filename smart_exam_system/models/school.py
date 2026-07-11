from smart_exam_system.extensions import db
from datetime import datetime

# =========================
# School Model
# =========================
class SchoolModel(db.Model):
    __tablename__ = "schools"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(255), nullable=False)

    slug = db.Column(db.String(255), unique=True, nullable=True)

    address = db.Column(db.String(255))
    phone = db.Column(db.String(50))
    email = db.Column(db.String(255))
    logo = db.Column(db.String(255), nullable=True)

    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    expiry_date = db.Column(db.DateTime, nullable=True)

    admins = db.relationship("UserModel", backref="school", lazy="dynamic")

    attempts = db.relationship("AttemptModel", backref="school")
    
    subscription = db.relationship(
        "SchoolSubscriptionModel",
        back_populates="school",
        uselist=False,
        cascade="all, delete-orphan",
    )

    usages = db.relationship(
        "SchoolUsageModel",
        back_populates="school",
        cascade="all, delete-orphan",
    )
    
    @classmethod
    def get(cls,school_id):
        school = db.session.get(SchoolModel, school_id)
        if school:
            # Return a dictionary similar to what raw SQL returned
            return {"id": school.id, "name": school.name}
        return None
    

 
class SchoolClassModel(db.Model):
    __tablename__ = "school_classes"

    id = db.Column(db.Integer, primary_key=True)

    school_id = db.Column(
        db.Integer,
        db.ForeignKey("schools.id"),
        nullable=False,
    )

    name = db.Column(
        db.String(50),
        nullable=False,
    )

    display_order = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    is_active = db.Column(
        db.Boolean,
        nullable=False,
        default=True,
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
    )

    school = db.relationship(
        "SchoolModel",
        backref="school_classes",
    )

    __table_args__ = (
        db.UniqueConstraint(
            "school_id",
            "name",
            name="uq_school_class_name",
        ),
    )

    def __repr__(self):
        return (
            f"<SchoolClass {self.name}>"
        )
    


class SchoolSectionModel(db.Model):
    __tablename__ = "school_sections"

    id = db.Column(db.Integer, primary_key=True)

    school_id = db.Column(
        db.Integer,
        db.ForeignKey("schools.id"),
        nullable=False,
        index=True
    )

    school_class_id = db.Column(
        db.Integer,
        db.ForeignKey("school_classes.id"),
        nullable=False,
        index=True
    )

    name = db.Column(db.String(50), nullable=False)

    display_order = db.Column(db.Integer, default=0)

    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint(
            "school_class_id",
            "name",
            name="uq_school_section_name"
        ),
    )