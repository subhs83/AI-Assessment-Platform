from flask import jsonify,request
from flask_login import login_required, current_user
from smart_exam_system.api.teacher import api_teacher_bp
from smart_exam_system.api.utils.decorators import teacher_required,exam_owner_required
from smart_exam_system.models import SchoolModel, ExamModel
from smart_exam_system.api.utils.api_response import api_response
from smart_exam_system.api.services.react_exam_service import ( 
    create_exam, 
    get_teacher_exams, 
    publish_exam, 
    delete_exam,
    extract_exam_form_data
    )
from smart_exam_system.api.services.react_question_service import upload_questions, get_exam_questions
from smart_exam_system.api.services.react_result_service import(
    get_results,
    generate_leaderboard,
    get_student_attempts,
    get_attempt_detailed_report,
)
import logging
logger = logging.getLogger(__name__)


 
@api_teacher_bp.route("/<school_slug>/dashboard", methods=["GET"])
@login_required
@teacher_required
def dashboard(school_slug):

    school = SchoolModel.query.filter_by(slug=school_slug).first()

    if not school:
        return api_response(
            success=False,
            message="School not found",
            status=404
        )

    if current_user.school_id != school.id:
        return api_response(
            success=False,
            message="Invalid school access",
            status=403
        )

    exams = get_teacher_exams(
    teacher_id=current_user.id,
    school_id=school.id
    )

    ai_exams = [
        e for e in exams
        if e.get("status") == "draft"
    ]

    stats = {
        "total_exams": len(exams),
        "total_attempts": sum(e.get("total_attempts", 0) for e in exams),
        "total_questions": sum(e.get("total_questions", 0) for e in exams),
    }

    return api_response(
        success=True,
        message="Dashboard loaded successfully",
        data={
            "school_slug": school.slug,
            "teacher": {
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email
            },
            "stats": stats,
            "exams": exams,
            "ai_exams": ai_exams
        }
    )




@api_teacher_bp.route("/<school_slug>/exams", methods=["POST"])
@login_required
@teacher_required
def create_exam_api(school_slug):

    school = SchoolModel.query.filter_by(slug=school_slug).first()

    if not school:
        return api_response(
            success=False,
            message="School not found",
            status=404
        )

    if current_user.school_id != school.id:
        return api_response(
            success=False,
            message="Unauthorized school access",
            status=403
        )

    data = request.get_json()

    if not data:
        return api_response(
            success=False,
            message="Invalid request payload",
            status=400
        )

    try:
        exam_data = extract_exam_form_data(data)
       
        success, msg = create_exam(
            teacher_id=current_user.id,
            school_id=school.id,
            **exam_data
        )

        if not success:
            return api_response(
                success=False,
                message=msg,
                status=400
            )

        return api_response(
            success=True,
            message=msg,
            data={
                "created": True
            },
            status=201
        )

    except Exception:
        logger.exception("Failed to process request")
        return api_response(
            success=False,
            message="Server error while creating exam",
            data= None,
            status=500
        )





@api_teacher_bp.route("/<school_slug>/exams/<int:exam_id>/questions/upload", methods=["POST"])
@login_required
@teacher_required
@exam_owner_required
def upload_questions_api(school_slug, exam_id):

    file = request.files.get("excel_file")

    if not file:
        return api_response(
            success=False,
            message="Excel file required",
            status=400
        )

    # 🔐 FIX: enforce tenant safety
    school_id = current_user.school_id

    success, msg = upload_questions(
        exam_id=exam_id,
        school_id=school_id,
        excel_file=file
    )

    if not success:
        return api_response(
            success=False,
            message=msg,
            status=400
        )

    return api_response(
        success=True,
        message=msg,
        data={
            "exam_id": exam_id,
            "uploaded": True
        }
    )



@api_teacher_bp.route("/<school_slug>/exams/<int:exam_id>/questions", methods=["GET"])
@login_required
@teacher_required
@exam_owner_required
def review_questions_api(school_slug, exam_id):

    questions = get_exam_questions(
        exam_id=exam_id,
        school_id=current_user.school_id
    )

    return api_response(
    success=True,
    message="Questions fetched successfully",
    data={
        "exam_id": exam_id,
        "questions": [
            {
                "id": q.id,
                "exam_id": q.exam_id,
                "question_text": q.question_text,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "correct_option": q.correct_option,
                "marks": q.marks,
                "negative_marks": q.negative_marks,
                "ai_generated": q.ai_generated,
                "created_at": q.created_at.isoformat() if q.created_at else None
            }
            for q in questions
        ]
    }
)




@api_teacher_bp.route("/<school_slug>/exams/<int:exam_id>/publish", methods=["POST"])
@login_required
@teacher_required
def publish_exam_api(school_slug, exam_id):

    success, result = publish_exam(
        exam_id=exam_id,
        school_id=current_user.school_id,
        teacher_id=current_user.id
    )

    if not success:
        return api_response(
            success=False,
            message=result,
            status=400
        )

    return api_response(
        success=True,
        message="Exam published successfully",
        data={
            "exam_id": exam_id,
            "quiz_code": result
        }
    )




@api_teacher_bp.route("/<school_slug>/exams/<int:exam_id>/results", methods=["GET"])
@login_required
@teacher_required
@exam_owner_required
def results_api(school_slug, exam_id):

    results = get_results( exam_id=exam_id, school_id=current_user.school_id )
    exam = ExamModel.query.filter_by(id=exam_id).first()
    exam_title =exam.title

    return api_response(
        success=True,
        message="Results fetched successfully",
        data={
            "exam_id": exam_id,
            "exam_title": exam_title,
            "results": results
        }
    )




@api_teacher_bp.route("/<school_slug>/exams/<int:exam_id>/leaderboard", methods=["GET"])
@login_required
@teacher_required
@exam_owner_required
def leaderboard_api(school_slug, exam_id):

    leaderboard = generate_leaderboard(
        exam_id=exam_id,
        school_id=current_user.school_id
    )
    exam = ExamModel.query.filter_by(id=exam_id).first()
    exam_title =exam.title
    return api_response(
        success=True,
        message="Leaderboard fetched successfully",
        data={
            "exam_id": exam_id,
            "exam_title": exam_title,
            "leaderboard": leaderboard
        }
    )




@api_teacher_bp.route("/<school_slug>/exams/<int:exam_id>", methods=["DELETE"])
@login_required
@teacher_required
@exam_owner_required
def delete_exam_api(school_slug, exam_id):

    success, msg = delete_exam(exam_id=exam_id)

    if not success:
        return api_response(
            success=False,
            message=msg,
            status=400
        )

    return api_response(
        success=True,
        message=msg,
        data={
            "exam_id": exam_id,
            "deleted": True
        }
    )





@api_teacher_bp.route("/<school_slug>/exams/<int:exam_id>/students/<student_db_id>/attempts", methods=["GET"])
@login_required
@teacher_required
def attempts_api(school_slug, exam_id, student_db_id):

    attempts = get_student_attempts(
        exam_id=exam_id,
        student_db_id=student_db_id,
        school_id=current_user.school_id
    )

    # ---------------------------------
    # BEST ATTEMPT (DICT SAFE)
    # ---------------------------------
    best = None
    if attempts:
        best = max(
            attempts,
            key=lambda a: float(a.get("percentage") or 0)
        )

    best_id = best.get("id") if best else None

    # ---------------------------------
    # RESPONSE
    # ---------------------------------
    return api_response(
        success=True,
        message="Attempts fetched successfully",
        data={
            "exam_id": exam_id,
            "student_db_id": student_db_id,
            "best_attempt_id": best_id,

            "attempts": [
                {
                    **a,
                    "is_best": a.get("id") == best_id
                }
                for a in attempts
            ]
        }
    )




@api_teacher_bp.route("/<school_slug>/attempts/<int:attempt_id>", methods=["GET"])
@login_required
@teacher_required
def attempt_detail_api(school_slug, attempt_id):

    report = get_attempt_detailed_report(
        attempt_id=attempt_id,
        school_id=current_user.school_id
    )

    if not report:
        return api_response(
            success=False,
            message="Attempt not found",
            status=404
        )

    return api_response(
        success=True,
        message="Attempt report fetched successfully",
        data={
            "attempt_id": attempt_id,
            "report": report
        }
    )




@api_teacher_bp.route("/<school_slug>/teacher/manage-questions", methods=["GET"])
@login_required
@teacher_required
def manage_questions_overview_api(school_slug):

    exams = get_teacher_exams(current_user.id, current_user.school_id)

    return api_response(
        success=True,
        message="Manage questions data loaded",
        data={
            "exams": exams
        }
    )





