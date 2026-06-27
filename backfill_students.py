from smart_exam_system import create_app
from smart_exam_system.extensions import db
from smart_exam_system.models import AttemptModel, StudentModel

app = create_app()

with app.app_context():

    attempts = AttemptModel.query.all()

    created = 0
    linked = 0

    for a in attempts:

        if not a.mobile:
            continue

        student = StudentModel.query.filter_by(
            mobile=a.mobile,
            school_id=a.school_id
        ).first()

        # create student if not exists
        if not student:
            student = StudentModel(
                first_name=a.first_name,
                last_name=a.last_name,
                mobile=a.mobile,
                student_class=a.student_class,
                roll_number=a.roll_number,
                school_id=a.school_id
            )
            db.session.add(student)
            db.session.flush()
            created += 1

        # link attempt → student
        if not a.student_db_id:
            a.student_db_id = student.id
            linked += 1

    db.session.commit()

