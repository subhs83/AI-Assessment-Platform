import os
from werkzeug.utils import secure_filename
from smart_exam_system.extensions import db
from smart_exam_system.models import (
ExamModel,  
UserModel,
AttemptModel,
SchoolModel
)
from smart_exam_system.api.services.react_exam_service import get_school_analytics
from datetime import datetime
from smart_exam_system.api.utils.helpers import generate_slug



def edit_school_service(school_id, data, files):

    school = db.session.get(SchoolModel, school_id)

    if not school:
        return {"error": "School not found."}

    name = data.get("name", "").strip()
    address = data.get("address", "").strip()
    phone = data.get("phone", "").strip()
    email = data.get("email", "").strip()

    if not name:
        return {"error": "School name is required."}

    # update fields
    school.name = name
    school.address = address
    school.phone = phone
    school.email = email

    # regenerate slug
    school.slug = generate_unique_school_slug(
        name,
        school.id
    )

    # logo handling
    logo_file = files.get("logo")

    if logo_file and logo_file.filename:

        upload_folder = "static/uploads/schools"

        # delete old logo
        if school.logo:

            old_path = os.path.join(
                upload_folder,
                school.logo
            )

            if os.path.exists(old_path):
                os.remove(old_path)

        filename = secure_filename(
            logo_file.filename
        )

        logo_path = os.path.join(
            upload_folder,
            filename
        )

        logo_file.save(logo_path)

        school.logo = filename

    db.session.commit()

    return {
        "success": True,
        "message": "School updated successfully"
    }



def generate_unique_school_slug(name, school_id=None):

    slug = generate_slug(name)

    existing_slug = SchoolModel.query.filter(
        SchoolModel.slug == slug
    )

    if school_id:
        existing_slug = existing_slug.filter(
            SchoolModel.id != school_id
        )

    existing_slug = existing_slug.first()

    if existing_slug:

        if school_id:
            slug = f"{slug}-{school_id}"
        else:
            slug = f"{slug}-{int(datetime.utcnow().timestamp())}"

    return slug

    

def get_school_or_404(school_slug):

    return SchoolModel.query.filter_by(
        slug=school_slug
    ).first_or_404()



def build_school_dashboard_data(school_id):
    return {
        "total_teachers": get_school_analytics(school_id),
        "total_exams": get_school_analytics(school_id),
        "total_attempts": get_school_analytics(school_id),
        "school_average": get_school_analytics(school_id),
        "top_teachers": get_school_analytics(school_id),
        "top_exams": get_school_analytics(school_id),
    }




def build_teacher_exam_list(teacher_id):

    exams = ExamModel.get_exams_by_teacher(teacher_id)

    exam_list = []

    for exam in exams:
        exam_list.append({
            "id": exam.id,
            "title": exam.title,
            "student_attempts": AttemptModel.get_attempt_count(exam.id)
        })

    return exam_list