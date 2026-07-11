import os
from werkzeug.utils import secure_filename
from smart_exam_system.extensions import db
from sqlalchemy import select,func
 
from smart_exam_system.models import (
        ExamModel,  
        SchoolSubscriptionModel,
        SubscriptionPlanModel,
        SchoolUsageModel,
        StudentModel,
        UserModel,
        AttemptModel,
        SchoolModel
)
from smart_exam_system.api.services.exam_service import get_school_analytics
from datetime import datetime
from smart_exam_system.api.utils.helpers import generate_slug
from smart_exam_system.api.services.subscription_service import (
    get_school_limits,
)



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





def get_school_list_summary():
    """
    Return a summary of all schools for the Super Admin school list.
    """

    # -----------------------------
    # Schools
    # -----------------------------
    schools = db.session.scalars(
        select(SchoolModel).order_by(
            SchoolModel.id.desc()
        )
    ).all()

    # -----------------------------
    # Subscriptions
    # -----------------------------
    subscriptions = db.session.scalars(
        select(SchoolSubscriptionModel)
    ).all()

    subscription_map = {
        subscription.school_id: subscription
        for subscription in subscriptions
    }

    # -----------------------------
    # Plans
    # -----------------------------
    plans = db.session.scalars(
        select(SubscriptionPlanModel)
    ).all()

    plan_map = {
        plan.id: plan
        for plan in plans
    }

    # -----------------------------
    # Usage
    # -----------------------------
    usages = db.session.scalars(
        select(SchoolUsageModel)
    ).all()

    usage_map = {
        usage.school_id: usage
        for usage in usages
    }

    # -----------------------------
    # Student Counts
    # -----------------------------
    student_counts = db.session.execute(
        select(
            StudentModel.school_id,
            func.count(StudentModel.id),
        ).group_by(
            StudentModel.school_id
        )
    ).all()

    student_count_map = {
        school_id: count
        for school_id, count in student_counts
    }

    # -----------------------------
    # Teacher Counts
    # -----------------------------
    teacher_counts = db.session.execute(
        select(
            UserModel.school_id,
            func.count(UserModel.id),
        )
        .where(UserModel.role == "teacher")
        .group_by(UserModel.school_id)
    ).all()

    teacher_count_map = {
        school_id: count
        for school_id, count in teacher_counts
    }

    # -----------------------------
    # Build Response
    # -----------------------------
    results = []

    for school in schools:

        subscription = subscription_map.get(school.id)

        plan = (
            plan_map.get(subscription.plan_id)
            if subscription
            else None
        )

        usage = usage_map.get(school.id)

        students = student_count_map.get(school.id, 0)
        teachers = teacher_count_map.get(school.id, 0)

        if plan:
            total_ai_credits = plan.monthly_ai_credits
        else:
            total_ai_credits = 0

        used_ai_credits = (
            usage.ai_credits_used
            if usage
            else 0
        )

        bonus_ai_credits = (
            usage.bonus_ai_credits
            if usage
            else 0
        )

        remaining_ai_credits = max(
            total_ai_credits + bonus_ai_credits - used_ai_credits,
            0,
        )

        results.append(
            {
                "id": school.id,
                "name": school.name,
                "slug": school.slug,
                "email": school.email,
                "phone": school.phone,
                "is_active": school.is_active,

                "plan": plan.name if plan else None,
                "plan_code": plan.plan_code if plan else None,

                "subscription_status": (
                    subscription.status
                    if subscription
                    else None
                ),

                "billing_cycle": (
                    subscription.billing_cycle
                    if subscription
                    else None
                ),

                "expires_at": (
                    subscription.expires_at.isoformat()
                    if subscription and subscription.expires_at
                    else None
                ),

                "students": students,
                "teachers": teachers,

                "total_ai_credits": total_ai_credits,
                "bonus_ai_credits": bonus_ai_credits,
                "used_ai_credits": used_ai_credits,
                "remaining_ai_credits": remaining_ai_credits,
            }
        )

    return results