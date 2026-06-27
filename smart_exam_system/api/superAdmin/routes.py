from flask import jsonify,request,Response
from smart_exam_system.extensions import db
from smart_exam_system.api.superAdmin import api_superadmin_bp
from flask_login import login_required, current_user
from smart_exam_system.api.utils.decorators import super_admin_required
from smart_exam_system.api.utils.security import (
    generate_temp_password,
    hash_password,
    verify_password
)
from smart_exam_system.api.services.react_school_service import (
    generate_unique_school_slug,
    edit_school_service,
)
from smart_exam_system.api.services.super_admin_service import (
    build_super_admin_dashboard,
    create_school_service,
    get_login_stats
)
from smart_exam_system.models import (
    SchoolModel,
    UserModel,
    StudentModel,
    ExamModel,
    AttemptModel,
    DemoRequest,
    ContactMessage,
    LoginLogModel,
    DemoRequest, 
    ContactMessage,
    AIGenerationRequest
)
import secrets,string
from sqlalchemy import func, distinct,case
from datetime import datetime, timedelta





@api_superadmin_bp.route("/dashboard", methods=["GET"])
@login_required
@super_admin_required
def get_dashboard():

    total_schools = SchoolModel.query.count()

    active_schools = (SchoolModel.query.filter_by(is_active=True).count())

    total_teachers = (UserModel.query.filter_by(role="teacher").count())

    total_students = StudentModel.query.count()

    total_exams = ExamModel.query.count()

    total_attempts = AttemptModel.query.count()

    total_demo_requests = DemoRequest.query.count()

    total_contact_messages = ContactMessage.query.count()

    recent_schools = (SchoolModel.query.order_by(SchoolModel.created_at.desc()).limit(5).all())

    recent_schools_data = [
        {
            "id": school.id,
            "name": school.name,
            "slug": school.slug,
            "created_at":
                school.created_at.isoformat()
                if school.created_at else None
        }
        for school in recent_schools
    ]

    recent_demo_requests = (DemoRequest.query.order_by(DemoRequest.created_at.desc()).limit(5).all())

    recent_demo_requests_data = [
        {
            "id": item.id,
            "name": item.name,
            "school_name": item.school_name,
            "created_at":
                item.created_at.isoformat()
                if item.created_at else None
        }
        for item in recent_demo_requests
    ]

    recent_contact_messages = (
        ContactMessage.query
        .order_by(ContactMessage.created_at.desc())
        .limit(5)
        .all()
    )

    recent_contact_messages_data = [
        {
            "id": item.id,
            "name": item.name,
            "email": item.email,
            "created_at":
                item.created_at.isoformat()
                if item.created_at else None
        }
        for item in recent_contact_messages
    ]

    return jsonify({
        "success": True,
        "data": {
            "total_schools": total_schools,
            "active_schools": active_schools,
            "total_teachers": total_teachers,
            "total_students": total_students,
            "total_exams": total_exams,
            "total_attempts": total_attempts,
            "total_demo_requests": total_demo_requests,
            "total_contact_messages": total_contact_messages,
            "recent_schools": recent_schools_data,
            "recent_demo_requests": recent_demo_requests_data,
            "recent_contact_messages": recent_contact_messages_data
        }
    })




@api_superadmin_bp.route("/schools", methods=["GET"])
@login_required
@super_admin_required
def get_schools():

    schools = SchoolModel.query.order_by(SchoolModel.id.desc()).all()

    return jsonify({
        "success": True,
        "data": [
            {
                "id": s.id,
                "name": s.name,
                "slug": s.slug,
                "email": s.email,
                "phone": s.phone,
                "is_active": s.is_active,
                "created_at": s.created_at,
                "expiry_date": (
                    s.expiry_date.strftime("%Y-%m-%d")
                    if s.expiry_date
                    else None
                )
            }
            for s in schools
        ]
    })



@api_superadmin_bp.route("/schools/<int:school_id>/toggle", methods=["PATCH"])
@login_required
@super_admin_required
def toggle_school(school_id):

    school = db.session.get(SchoolModel, school_id)

    school.is_active = not school.is_active

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "School status updated",
        "data": {
            "id": school.id,
            "is_active": school.is_active
        }
    })


# =========================
# CREATE SCHOOL
# =========================
@api_superadmin_bp.route("/schools", methods=["POST"])
@login_required
@super_admin_required
def create_school():

    result = create_school_service(
        request.form,
        request.files
    )

    if result.get("error"):
        return jsonify(result), 400

    return jsonify(result), 201


# =========================
# Add GET School Detail
# =========================

@api_superadmin_bp.route("/schools/<int:school_id>", methods=["GET"])
@login_required
@super_admin_required
def get_school(school_id):

    school = db.session.get(SchoolModel, school_id)

    return jsonify({
        "success": True,
        "school": {
            "id": school.id,
            "name": school.name,
            "address": school.address,
            "phone": school.phone,
            "email": school.email,
            "logo": school.logo,
            "slug": school.slug
        }
    })

@api_superadmin_bp.route("/schools/<int:school_id>", methods=["PUT"])
@login_required
@super_admin_required
def update_school(school_id):

    result = edit_school_service(
        school_id,
        request.form,
        request.files
    )

    if result.get("error"):
        return jsonify(result), 400

    return jsonify(result)


@api_superadmin_bp.route( "/schools/<int:school_id>/admins",  methods=["GET"])
@login_required
@super_admin_required
def get_school_admins(school_id):

    school = db.session.get(SchoolModel, school_id)
    admins = (
        UserModel.query
        .filter_by(
            role="school_admin",
            school_id=school_id
        )
        .order_by(UserModel.id.asc())
        .all()
    )

    return jsonify({
        "success": True,
        "school": {
            "id": school.id,
            "name": school.name
        },
        "admins": [
            {
                "id": admin.id,
                "name": admin.name,
                "email": admin.email,
                "phone": admin.phone,
                "is_active": admin.is_active,
                "force_password_change": admin.force_password_change
            }
            for admin in admins
        ]
    })


@api_superadmin_bp.route( "/schools/<int:school_id>/admins", methods=["POST"])
@login_required
@super_admin_required
def create_school_admin(school_id):

    school = db.session.get(SchoolModel, school_id)

    name = request.json.get("name", "").strip()
    email = request.json.get("email", "").strip()
    phone = request.json.get("phone", "").strip()

    if not name or not email:
        return jsonify({
            "error": "Name and email are required."
        }), 400

    if UserModel.query.filter_by(email=email).first():
        return jsonify({
            "error": "Email already exists."
        }), 400

    temp_password = ''.join(
        secrets.choice(string.ascii_letters + string.digits)
        for _ in range(8)
    )

    new_admin = UserModel(
        name=name,
        email=email,
        phone=phone,
        password=hash_password(temp_password),
        role="school_admin",
        school_id=school_id,
        is_active=True,
        force_password_change=True
    )

    db.session.add(new_admin)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "School admin created successfully.",
        "temp_password": temp_password
    })



@api_superadmin_bp.route(  "/admins/<int:user_id>/toggle",  methods=["PATCH"])
@login_required
@super_admin_required
def toggle_school_admin_api(user_id):

    admin = db.session.get(UserModel, user_id)

    if admin.role != "school_admin":
        return jsonify({
            "error": "Invalid user."
        }), 404

    admin.is_active = not admin.is_active

    db.session.commit()

    return jsonify({
        "success": True,
        "message": (
            "School admin activated."
            if admin.is_active
            else "School admin deactivated."
        )
    })


@api_superadmin_bp.route( "/admins/<int:user_id>/reset-password", methods=["POST"])
@login_required
@super_admin_required
def reset_school_admin_password_api(user_id):

    admin = db.session.get(UserModel, user_id)

    if admin.role != "school_admin":
        return jsonify({
            "error": "Invalid user."
        }), 404

    new_password = generate_temp_password()

    admin.password = hash_password(new_password)
    admin.force_password_change = True

    db.session.commit()

    admin = db.session.get(UserModel, admin.id)
    # print("admin.id: ",admin.id)
    # print("admin.email: ",admin.email)
    # print("TEMP PASSWORD:", new_password)
    # print("STORED HASH:", admin.password)
    # print("SELF VERIFY:",  verify_password(new_password, admin.password) )


    return jsonify({
        "success": True,
        "message": "Password reset successful.",
        "temp_password": new_password
    })


# =========================
# DEMO REQUESTS
# =========================
@api_superadmin_bp.route("/demo-requests")
@login_required
@super_admin_required
def get_demo_requests():

    demos = DemoRequest.query.order_by(  DemoRequest.id.desc()).all()

    return jsonify({
        "success": True,
        "demo_requests": [
            {
                "id": d.id,
                "name": d.name,
                "phone": d.phone,
                "email": d.email,
                "school_name": d.school_name,
                "size": d.size,
                "status": d.status,
                "created_at": (
                    d.created_at.strftime("%Y-%m-%d")
                    if d.created_at else ""
                )
            }
            for d in demos
        ]
    })



# =========================
# UPDATE DEMO STATUS
# =========================
@api_superadmin_bp.route("/demo-requests/<int:demo_id>/status", methods=["PATCH"])
@login_required
@super_admin_required
def update_demo_status(demo_id):

    demo = db.session.get(DemoRequest, demo_id)

    data = request.get_json()

    status = data.get("status")

    allowed_statuses = [
        "new",
        "contacted",
        "closed"
    ]

    if status not in allowed_statuses:

        return jsonify({
            "success": False,
            "error": "Invalid status."
        }), 400

    demo.status = status

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Demo status updated successfully."
    })



# =========================
# DELETE DEMO
# =========================
@api_superadmin_bp.route("/demo-requests/<int:demo_id>", methods=["DELETE"])
@login_required
@super_admin_required
def delete_demo(demo_id):

    demo = db.session.get(DemoRequest, demo_id)

    db.session.delete(demo)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Demo request deleted successfully."
    })


# =========================
# CONTACT MESSAGES
# =========================
@api_superadmin_bp.route("/contact-messages")
@login_required
@super_admin_required
def get_contact_messages():

    messages = ContactMessage.query.order_by(
        ContactMessage.id.desc()
    ).all()

    return jsonify({
        "success": True,
        "contact_messages": [
            {
                "id": msg.id,
                "name": msg.name,
                "phone": msg.phone,
                "email": msg.email,
                "message": msg.message,
                "status": msg.status,
                "created_at": (
                    msg.created_at.strftime("%Y-%m-%d")
                    if msg.created_at else ""
                )
            }
            for msg in messages
        ]
    })


# =========================
# UPDATE CONTACT STATUS
# =========================
@api_superadmin_bp.route("/contact-messages/<int:message_id>/status",  methods=["PATCH"])
@login_required
@super_admin_required
def update_contact_status(message_id):

    msg = db.session.get(ContactMessage, message_id)

    data = request.get_json()

    status = data.get("status")

    allowed_statuses = [
        "new",
        "contacted",
        "closed"
    ]

    if status not in allowed_statuses:

        return jsonify({
            "success": False,
            "error": "Invalid status."
        }), 400

    msg.status = status

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Contact status updated successfully."
    })


# =========================
# DELETE CONTACT
# =========================
@api_superadmin_bp.route( "/contact-messages/<int:message_id>",   methods=["DELETE"])
@login_required
@super_admin_required
def delete_contact_message(message_id):

    msg = db.session.get(ContactMessage, message_id)

    db.session.delete(msg)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Contact message deleted successfully."
    })


# =========================
# EXTEND SCHOOL VALIDITY
# =========================
@api_superadmin_bp.route("/schools/<int:school_id>/extend",  methods=["POST"])
@login_required
@super_admin_required
def extend_school(school_id):

    school = db.session.get(SchoolModel, school_id)

    data = request.get_json() or {}

    days = data.get("days")
    expiry_date = data.get("expiry_date")

    # =========================
    # CASE 1: Calendar (absolute date)
    # =========================
    if expiry_date:

        try:
            school.expiry_date = datetime.strptime(
                expiry_date,
                "%Y-%m-%d"
            )
        except ValueError:
            return jsonify({
                "success": False,
                "error": "Invalid date format (YYYY-MM-DD)."
            }), 400

    # =========================
    # CASE 2: +30 / +90 (relative)
    # =========================
    elif days is not None:

        days = int(days)

        if days <= 0:
            return jsonify({
                "success": False,
                "error": "Invalid duration."
            }), 400

        base_date = school.expiry_date or datetime.utcnow()
        school.expiry_date = base_date + timedelta(days=days)

    else:
        return jsonify({
            "success": False,
            "error": "Either days or expiry_date required."
        }), 400

    school.is_active = True
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "School validity updated successfully."
    })


# =========================
# RESET SCHOOL VALIDITY
# =========================
@api_superadmin_bp.route("/schools/<int:school_id>/reset-validity", methods=["POST"])
@login_required
@super_admin_required
def reset_school_validity(school_id):

    school = db.session.get(SchoolModel, school_id)

    school.expiry_date = None
    school.is_active = True

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "School validity reset successfully."
    })


# =========================
# DELETE SCHOOL
# =========================
@api_superadmin_bp.route("/schools/<int:school_id>",  methods=["DELETE"])
@login_required
@super_admin_required
def delete_school(school_id):

    school = db.session.get(SchoolModel, school_id)

    admin_exists = UserModel.query.filter_by(
        school_id=school.id,
        role="school_admin"
    ).first()

    if admin_exists:

        return jsonify({
            "success": False,
            "error": "Cannot delete school with existing admin."
        }), 400

    db.session.delete(school)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "School deleted successfully."
    })

# =========================
# LOGIN LOGS
# =========================
@api_superadmin_bp.route("/login-logs")
@login_required
@super_admin_required
def get_login_logs():

    logs = (
        LoginLogModel.query
        .order_by(LoginLogModel.timestamp.desc())
        .limit(100)
        .all()
    )

    stats = get_login_stats()

    return jsonify({
        "success": True,
        "stats": stats,
        "logs": [
            {
                "id": log.id,
                "email": log.email,
                "ip_address": log.ip_address,
                "success": log.success,
                "timestamp": (
                    log.timestamp.strftime(
                        "%Y-%m-%d %H:%M"
                    )
                    if log.timestamp
                    else ""
                )
            }
            for log in logs
        ]
    })


# =========================
# PLATFORM STATS
# =========================
@api_superadmin_bp.route("/platform-stats")
@login_required
@super_admin_required
def get_platform_stats():

    return jsonify({
        "success": True,
        "total_schools": SchoolModel.query.count(),
        "total_exams": ExamModel.query.count(),
        "total_teachers": UserModel.query.filter_by(
            role="teacher"
        ).count(),
        "total_attempts": AttemptModel.query.count()
    })


# =========================
# SYSTEM HEALTH
# =========================
@api_superadmin_bp.route("/system-health")
@login_required
@super_admin_required
def get_system_health():

    return jsonify({
        "success": True,
        "current_time": datetime.utcnow().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),
        "environment": "Production",
        "database": "PostgreSQL"
    })



# =========================
# AI Releated API
# =========================

@api_superadmin_bp.route("/ai/dashboard", methods=["GET"])
@login_required
@super_admin_required
def ai_dashboard():

    now = datetime.utcnow()

    today_start = datetime(now.year, now.month, now.day)
    week_start = now - timedelta(days=7)
    month_start = now - timedelta(days=30)

    total_requests = db.session.query(
        func.count(AIGenerationRequest.id)
    ).scalar() or 0

    completed_requests = db.session.query(
        func.count(AIGenerationRequest.id)
    ).filter(
        AIGenerationRequest.status == "completed"
    ).scalar() or 0

    failed_requests = db.session.query(
        func.count(AIGenerationRequest.id)
    ).filter(
        AIGenerationRequest.status == "failed"
    ).scalar() or 0

    total_questions = db.session.query(
        func.sum(AIGenerationRequest.question_count)
    ).scalar() or 0

    today_requests = db.session.query(
        func.count(AIGenerationRequest.id)
    ).filter(
        AIGenerationRequest.created_at >= today_start
    ).scalar() or 0

    week_requests = db.session.query(
        func.count(AIGenerationRequest.id)
    ).filter(
        AIGenerationRequest.created_at >= week_start
    ).scalar() or 0

    month_requests = db.session.query(
        func.count(AIGenerationRequest.id)
    ).filter(
        AIGenerationRequest.created_at >= month_start
    ).scalar() or 0

    today_questions = db.session.query(
        func.sum(AIGenerationRequest.question_count)
    ).filter(
        AIGenerationRequest.created_at >= today_start
    ).scalar() or 0

    week_questions = db.session.query(
        func.sum(AIGenerationRequest.question_count)
    ).filter(
        AIGenerationRequest.created_at >= week_start
    ).scalar() or 0

    month_questions = db.session.query(
        func.sum(AIGenerationRequest.question_count)
    ).filter(
        AIGenerationRequest.created_at >= month_start
    ).scalar() or 0

    avg_questions_per_request = round(
        total_questions / total_requests,
        2
    ) if total_requests else 0

    success_rate = round(
        completed_requests * 100 / total_requests,
        2
    ) if total_requests else 0

    return jsonify({
        "total_requests": total_requests,
        "completed_requests": completed_requests,
        "failed_requests": failed_requests,
        "success_rate": success_rate,

        "total_questions": total_questions,
        "avg_questions_per_request": avg_questions_per_request,

        "today_requests": today_requests,
        "week_requests": week_requests,
        "month_requests": month_requests,

        "today_questions": today_questions,
        "week_questions": week_questions,
        "month_questions": month_questions
    })


@api_superadmin_bp.route("/ai/source-stats", methods=["GET"])
@login_required
@super_admin_required
def ai_source_stats():

    rows = (
        db.session.query(
            AIGenerationRequest.source_type,
            func.count(AIGenerationRequest.id)
        )
        .group_by(
            AIGenerationRequest.source_type
        )
        .all()
    )

    stats = {
        "pdf": 0,
        "image": 0,
        "topic": 0,
        "text": 0
    }

    for source_type, count in rows:
        stats[source_type] = count

    return jsonify(stats)


@api_superadmin_bp.route("/ai/trends", methods=["GET"])
@login_required
@super_admin_required
def ai_trends():

    start_date = datetime.utcnow() - timedelta(days=29)

    rows = (
        db.session.query(
            func.date(AIGenerationRequest.created_at),
            func.count(AIGenerationRequest.id),
            func.coalesce(
                func.sum(AIGenerationRequest.question_count),
                0
            )
        )
        .filter(
            AIGenerationRequest.created_at >= start_date
        )
        .group_by(
            func.date(AIGenerationRequest.created_at)
        )
        .order_by(
            func.date(AIGenerationRequest.created_at)
        )
        .all()
    )

    trends = []

    for date, requests, questions in rows:
        trends.append({
            "date": str(date),
            "requests": requests,
            "questions": questions
        })

    return jsonify(trends)


@api_superadmin_bp.route("/ai/schools", methods=["GET"])
@login_required
@super_admin_required
def ai_school_usage():

    rows = (
        db.session.query(
            SchoolModel.id,
            SchoolModel.name,
            func.count(AIGenerationRequest.id),
            func.coalesce(
                func.sum(AIGenerationRequest.question_count),
                0
            ),
            func.count(
                distinct(AIGenerationRequest.teacher_id)
            ),
            func.max(AIGenerationRequest.created_at)
        )
        .join(
            AIGenerationRequest,
            SchoolModel.id == AIGenerationRequest.school_id
        )
        .group_by(
            SchoolModel.id,
            SchoolModel.name
        )
        .order_by(
            func.count(AIGenerationRequest.id).desc()
        )
        .all()
    )

    data = []

    for school_id, school_name, requests, questions, teachers, last_activity in rows:

        data.append({
            "school_id": school_id,
            "school_name": school_name,
            "requests": requests,
            "questions": questions,
            "teachers_used": teachers,
            "last_activity": (
                last_activity.isoformat()
                if last_activity
                else None
            )
        })

    return jsonify(data)



@api_superadmin_bp.route("/ai/teachers", methods=["GET"])
@login_required
@super_admin_required
def ai_teacher_usage():

    rows = (
        db.session.query(
            UserModel.id,
            UserModel.name,
            SchoolModel.name,

            func.count(AIGenerationRequest.id),

            func.coalesce(
                func.sum(
                    AIGenerationRequest.question_count
                ),
                0
            ),

            func.sum(
                case(
                    (
                        AIGenerationRequest.status == "completed",
                        1
                    ),
                    else_=0
                )
            ),

            func.max(
                AIGenerationRequest.created_at
            )
        )

        .join(
            AIGenerationRequest,
            UserModel.id == AIGenerationRequest.teacher_id
        )

        .join(
            SchoolModel,
            SchoolModel.id == AIGenerationRequest.school_id
        )

        .group_by(
            UserModel.id,
            UserModel.name,
            SchoolModel.name
        )

        .order_by(
            func.count(
                AIGenerationRequest.id
            ).desc()
        )

        .all()
    )

    data = []

    for (
        teacher_id,
        teacher_name,
        school_name,
        requests,
        questions,
        completed,
        last_activity
    ) in rows:

        success_rate = round(
            completed * 100 / requests,
            2
        ) if requests else 0

        data.append({
            "teacher_id": teacher_id,
            "teacher_name": teacher_name,
            "school_name": school_name,
            "requests": requests,
            "questions": questions,
            "success_rate": success_rate,
            "last_activity":
                last_activity.isoformat()
                if last_activity else None
        })

    return jsonify(data)



@api_superadmin_bp.route("/ai/recent", methods=["GET"])
@login_required
@super_admin_required
def recent_ai_activity():

    rows = (
        db.session.query(
            AIGenerationRequest.id,
            UserModel.name,
            SchoolModel.name,
            AIGenerationRequest.source_type,
            AIGenerationRequest.question_count,
            AIGenerationRequest.status,
            AIGenerationRequest.created_at
        )

        .join(
            UserModel,
            UserModel.id == AIGenerationRequest.teacher_id
        )

        .join(
            SchoolModel,
            SchoolModel.id == AIGenerationRequest.school_id
        )

        .order_by(
            AIGenerationRequest.created_at.desc()
        )

        .limit(50)

        .all()
    )

    data = []

    for (
        request_id,
        teacher_name,
        school_name,
        source_type,
        question_count,
        status,
        created_at
    ) in rows:

        data.append({
            "request_id": request_id,
            "teacher_name": teacher_name,
            "school_name": school_name,
            "source_type": source_type,
            "question_count": question_count,
            "status": status,
            "created_at": created_at.isoformat()
        })

    return jsonify(data)