from smart_exam_system.extensions import db

class QuestionModel(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey("exams.id"), nullable=False)

    question_text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.Text, nullable=False)
    option_b = db.Column(db.Text, nullable=False)
    option_c = db.Column(db.Text, nullable=False)
    option_d = db.Column(db.Text, nullable=False)

    correct_option = db.Column(db.String(1), nullable=False)

    marks = db.Column(db.Integer, default=1)
    negative_marks = db.Column(db.Float, default=0)

    ai_generated = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime)
     