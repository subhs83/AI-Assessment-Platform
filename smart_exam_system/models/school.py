from smart_exam_system.extensions import db
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

    @classmethod
    def get(cls,school_id):
        school = db.session.get(SchoolModel, school_id)
        if school:
            # Return a dictionary similar to what raw SQL returned
            return {"id": school.id, "name": school.name}
        return None
    

 