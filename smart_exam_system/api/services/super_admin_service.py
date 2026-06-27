from sqlalchemy import func
from smart_exam_system.extensions import db
from smart_exam_system.models.user import UserModel
from smart_exam_system.models.school import SchoolModel
from smart_exam_system.models.exam import ExamModel
from smart_exam_system.models.attempt import AttemptModel
from smart_exam_system.models.login_log import LoginLogModel
from smart_exam_system.models.democontact import DemoRequest, ContactMessage
from smart_exam_system.api.services.react_school_service import generate_unique_school_slug
import os
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename




def create_school_service(data, files):

    name = data.get("name", "").strip()
    address = data.get("address", "").strip()
    phone = data.get("phone", "").strip()
    email = data.get("email", "").strip()
    duration_days = data.get("duration_days")

    # duplicate check
    existing_school = SchoolModel.query.filter(
        (SchoolModel.email == email) | (SchoolModel.name == name)
    ).first()

    if existing_school:
        return {"error": "School already exists with same name or email."}

    if not name:
        return {"error": "School name is required."}

    # slug

    slug = generate_unique_school_slug(name)

    # expiry
    expiry_date = None
    if duration_days:
        expiry_date = datetime.utcnow() + timedelta(days=int(duration_days))

    # logo upload
    logo_file = files.get("logo")
    logo_filename = None

    if logo_file and logo_file.filename:
        logo_filename = secure_filename(logo_file.filename)
        logo_path = os.path.join("static/uploads/schools", logo_filename)
        logo_file.save(logo_path)

    # create school
    new_school = SchoolModel(
        name=name,
        slug=slug,
        address=address,
        phone=phone,
        email=email,
        expiry_date=expiry_date,
        logo=logo_filename
    )

    db.session.add(new_school)

    # demo conversion
    demo_id = data.get("demo_id")
    if demo_id:
        demo = db.session.get(DemoRequest, demo_id)
        if demo:
            demo.status = "converted"

    db.session.commit()

    return {"success": True}



def build_super_admin_dashboard():

    total_schools = SchoolModel.query.count()
    total_exams = ExamModel.query.count()
    total_teachers = UserModel.query.filter_by(role="teacher").count()

    total_demo_requests = DemoRequest.query.count()
    total_contact_messages = ContactMessage.query.count()

    student_subquery = db.session.query(
        AttemptModel.school_id,
        AttemptModel.roll_number
    ).filter(
        AttemptModel.roll_number.isnot(None),
        AttemptModel.roll_number != ""
    ).distinct().subquery()

    total_students = db.session.query(
        func.count()
    ).select_from(student_subquery).scalar()

    total_attempts = db.session.query(func.count(AttemptModel.id)).scalar()

    return {
        "total_schools": total_schools,
        "total_exams": total_exams,
        "total_teachers": total_teachers,
        "total_students": total_students,
        "total_attempts": total_attempts,
        "total_demo_requests": total_demo_requests,
        "total_contact_messages": total_contact_messages
    }



def get_login_stats():
    total = LoginLogModel.query.count()

    success = LoginLogModel.query.filter_by(
        success=True
    ).count()

    failed = LoginLogModel.query.filter_by(
        success=False
    ).count()

    return {
        "total": total,
        "success": success,
        "failed": failed
    }