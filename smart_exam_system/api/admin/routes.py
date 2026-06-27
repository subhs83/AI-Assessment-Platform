from flask import jsonify,request,Response
from flask_login import login_required, current_user
from smart_exam_system.api.admin import api_admin_bp
from smart_exam_system.api.utils.decorators import school_admin_required
from smart_exam_system.models import UserModel,SchoolModel,ExamModel
from smart_exam_system.api.services.react_school_service import build_school_dashboard_data,build_teacher_exam_list
from smart_exam_system.api.services.react_exam_service import (
    get_teacher_performance_by_school,
    get_exam_performance_by_school,
    get_school_analytics
    
)
from smart_exam_system.api.services.react_result_service import generate_leaderboard
import csv
from io import StringIO


@api_admin_bp.route("/<school_slug>/dashboard")
@login_required
@school_admin_required
def dashboard_api(school_slug):

    data = get_school_analytics(current_user.school_id )

    return jsonify({
        "success": True,
        "data": data
    })

@api_admin_bp.route("/<school_slug>/teachers")
@login_required
@school_admin_required
def get_teachers_api(school_slug):

    teachers = UserModel.get_teachers_by_school(
        current_user.school_id
    )

    return jsonify({
        "success": True,
        "data": [
            teacher.to_dict()
            for teacher in teachers
        ]
    })



@api_admin_bp.route("/<school_slug>/teachers", methods=["POST"])
@login_required
@school_admin_required
def add_teacher_api(school_slug):

    data = request.get_json()

    teacher = UserModel.add_teacher(
        name=data["name"],
        email=data["email"],
        password=data["password"],
        school_id=current_user.school_id
    )

    if not teacher:
        return jsonify({
            "success": False,
            "message": "Email already exists."
        }), 400

    return jsonify({
        "success": True,
        "message": "Teacher added successfully."
    })



@api_admin_bp.route("/<school_slug>/teachers/<int:teacher_id>/toggle",    methods=["PATCH"])
@login_required
@school_admin_required
def toggle_teacher_api(school_slug, teacher_id):

    success = UserModel.toggle_teacher_status(
        teacher_id,
        current_user.school_id
    )

    if not success:
        return jsonify({
            "success": False,
            "message": "Teacher not found"
        }), 404

    return jsonify({
        "success": True,
        "message": "Teacher status updated."
    })



@api_admin_bp.route( "/<school_slug>/teachers/<int:teacher_id>/reset-password",  methods=["POST"])
@login_required
@school_admin_required
def reset_teacher_password_api(school_slug,teacher_id):

    success = UserModel.reset_teacher_password( teacher_id,  current_user.school_id )

    if not success:
        return jsonify({
            "success": False,
            "message": "Teacher not found"
        }), 404

    return jsonify({
        "success": True,
        "message": "Password reset successfully.",
        "temp_password": "default123"
    })


@api_admin_bp.route("/<school_slug>/performance/teachers")
@login_required
@school_admin_required
def teacher_performance_api(school_slug):

    data = get_teacher_performance_by_school(
        current_user.school_id
    )

    return jsonify({
        "success": True,
        "data": data
    })



@api_admin_bp.route( "/<school_slug>/performance/exams")
@login_required
@school_admin_required
def get_exam_performance_api(school_slug):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first_or_404()

    data = get_exam_performance_by_school(
        school.id
    )

    return jsonify(data)


@api_admin_bp.route("/<school_slug>/reports/analytics")
@login_required
@school_admin_required
def get_school_analytics_api(school_slug):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first_or_404()

    return jsonify(
        get_school_analytics(school.id)
    )

@api_admin_bp.route("/<school_slug>/report/download/teachers")
@login_required
@school_admin_required
def download_teacher_report(school_slug):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first_or_404()

    data = get_teacher_performance_by_school(
        school.id
    )

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Teacher",
        "Email",
        "Exam Count",
        "Attempt Count",
        "Average Percentage"
    ])

    for row in data:
        writer.writerow([
            row["teacher_name"],
            row["email"],
            row["exam_count"],
            row["attempt_count"],
            row["avg_percentage"]
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=teacher_performance.csv"
        }
    )

@api_admin_bp.route("/<school_slug>/report/download/exams")
@login_required
@school_admin_required
def download_exam_report(school_slug):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first_or_404()

    data = get_exam_performance_by_school(
        school.id
    )

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Exam",
        "Teacher",
        "Attempts",
        "Average Percentage"
    ])

    for row in data:
        writer.writerow([
            row["exam_title"],
            row["teacher_name"],
            row["attempt_count"],
            row["avg_percentage"]
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=exam_performance.csv"
        }
    )

@api_admin_bp.route("/<school_slug>/report/download/summary")
@login_required
@school_admin_required
def download_summary_report(school_slug):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first_or_404()

    data = get_school_analytics(
        school.id
    )

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow(["Metric", "Value"])

    writer.writerow([
        "Total Teachers",
        data["total_teachers"]
    ])

    writer.writerow([
        "Total Exams",
        data["total_exams"]
    ])

    writer.writerow([
        "Total Attempts",
        data["total_attempts"]
    ])

    writer.writerow([
        "School Average %",
        data["school_average"]
    ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=school_summary.csv"
        }
    )



@api_admin_bp.route("/<school_slug>/exams/<int:exam_id>/leaderboard")
@login_required
@school_admin_required
def get_exam_leaderboard_admin_api(school_slug, exam_id):
 
    leaderboard = generate_leaderboard( exam_id=exam_id, school_id=current_user.school_id )
    exam = ExamModel.query.filter_by(id=exam_id).first()
    exam_title =exam.title
    return jsonify({

        "data": {
            "exam_id": exam_id,
            "exam_title": exam_title,
            "leaderboard": leaderboard
        }
    })