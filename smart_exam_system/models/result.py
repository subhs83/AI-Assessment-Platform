from smart_exam_system.extensions import db  # or wherever your SQLAlchemy instance is
 
class Result(db.Model):
    __tablename__ = "results"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    exam_id = db.Column(db.Integer, db.ForeignKey("exams.id"))
    score = db.Column(db.Float)
    mobile = db.Column(db.String(20))  # if you need distinct count in dashboard
    created_at = db.Column(db.DateTime, server_default=db.func.now())