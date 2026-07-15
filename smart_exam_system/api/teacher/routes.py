from flask import jsonify,request,send_file
from flask_login import login_required, current_user
from smart_exam_system.api.teacher import api_teacher_bp
from smart_exam_system.api.utils.decorators import teacher_required,exam_owner_required
from smart_exam_system.models import SchoolModel, ExamModel
from smart_exam_system.api.utils.api_response import api_response
from smart_exam_system.api.services.additional_attempt_service import (
    grant_additional_attempt,
    get_additional_attempt_grants
)
from smart_exam_system.api.services.exam_service import ( 
    create_exam, 
    update_exam,
    get_teacher_exams, 
    get_exam_by_uid,
    publish_exam, 
    delete_exam,
    extract_exam_form_data,
    get_question_template,
    get_teacher_exam_detail
    
    )
from smart_exam_system.api.services.question_service import upload_questions, get_exam_questions
from smart_exam_system.api.services.result_service import(
    get_results,
    generate_leaderboard,
    get_student_attempts,
    get_attempt_detailed_report,
)

from smart_exam_system.api.services.subscription_management_service import get_school_subscription_summary

from smart_exam_system.api.services.subscription_service import (
    get_active_ai_features,

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
        exam
        for exam in exams
        if exam.get("status") == "draft"
    ]

    published_exams = [
        exam
        for exam in exams
        if exam.get("is_published")
    ]

    stats = {
        "total_exams": len(exams),
        "total_attempts": sum(
            e.get("total_attempts", 0)
            for e in exams
        ),
        "draft_exams": len(ai_exams),
    }

    subscription = get_school_subscription_summary( school.id )
    ai_features = get_active_ai_features()

    return api_response(
        success=True,
        message="Dashboard loaded successfully",
        data={
            "school_slug": school.slug,

            "teacher": {
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email,
            },

            "stats": stats,

            "exams": published_exams,

            "ai_exams": ai_exams,

            "subscription": {
                "plan": subscription["plan"]["name"],
                "status": subscription["subscription"]["status"],
                "total_ai_credits": subscription["usage"]["total_ai_credits"],
                "used_ai_credits": subscription["usage"]["used_ai_credits"],
                "remaining_ai_credits": subscription["usage"]["remaining_ai_credits"],
                "expires_at": subscription["subscription"]["expires_at"],
            },

            "ai_features": ai_features,
        },
    )


@api_teacher_bp.route("/<school_slug>/exams", methods=["GET"],)
@login_required
@teacher_required
def teacher_exam_list_api(school_slug):

    result = get_teacher_exams(
        school_id=current_user.school_id,
        teacher_id=current_user.id,
    )

    return api_response(
        success=True,
        message="Exam list fetched successfully.",
        data=result,
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



@api_teacher_bp.route("/<school_slug>/exams/<exam_uid>", methods=["GET"],)
@login_required
@teacher_required
def get_exam_detail_api( school_slug,  exam_uid,):

    if current_user.school_id is None:
        return api_response(
            success=False,
            message="Invalid school access.",
            status=403,
        )


    exam = get_teacher_exam_detail(
        school_id=current_user.school_id,
        exam_uid=exam_uid,
    )


    if not exam:
        return api_response(
            success=False,
            message="Exam not found.",
            status=404,
        )


    return api_response(
        success=True,
        message="Exam fetched successfully.",
        data=exam,
    )



@api_teacher_bp.route( "/<school_slug>/exams/<exam_uid>",  methods=["PUT"],)
@login_required
@teacher_required
def update_exam_api(school_slug, exam_uid):

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

        success, msg = update_exam(
            school_id=current_user.school_id,
            exam_uid=exam_uid,
            **exam_data,
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



@api_teacher_bp.route("/<school_slug>/questions/template", methods=["GET"])
@login_required
@teacher_required
def download_question_template_api(school_slug):

    school = SchoolModel.query.filter_by(
        slug=school_slug
    ).first()

    if not school:
        return api_response(
            success=False,
            message="School not found",
            status=404
        )

    if school.id != current_user.school_id:
        return api_response(
            success=False,
            message="Unauthorized school access",
            status=403
        )

    file_path = get_question_template()

    return send_file(
        file_path,
        as_attachment=True,
        download_name="sample_question_template.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@api_teacher_bp.route("/<school_slug>/exams/<exam_uid>/questions/upload", methods=["POST"])
@login_required
@teacher_required
@exam_owner_required
def upload_questions_api(school_slug, exam_uid):

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
        exam_uid=exam_uid,
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
            "exam_uid": exam_uid,
            "uploaded": True
        }
    )



@api_teacher_bp.route("/<school_slug>/exams/<exam_uid>/questions", methods=["GET"])
@login_required
@teacher_required
@exam_owner_required
def review_questions_api(school_slug, exam_uid):

    questions = get_exam_questions(
        exam_uid=exam_uid,
        school_id=current_user.school_id
    )

    return api_response(
    success=True,
    message="Questions fetched successfully",
    data={
        "exam_uid": exam_uid,
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




@api_teacher_bp.route("/<school_slug>/exams/<exam_uid>/publish", methods=["POST"])
@login_required
@teacher_required
def publish_exam_api(school_slug, exam_uid):

    success, result = publish_exam(
        exam_uid=exam_uid,
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
            "exam_uid": exam_uid,
            "quiz_code": result
        }
    )




@api_teacher_bp.route(
    "/<school_slug>/exams/<exam_uid>/results",
    methods=["GET"],
)
@login_required
@teacher_required
@exam_owner_required
def results_api(
    school_slug,
    exam_uid,
):
    exam = get_exam_by_uid(
        school_id=current_user.school_id,
        exam_uid=exam_uid,
    )

    results = get_results(
        school_id=current_user.school_id,
        exam_uid=exam_uid,
    )

    return api_response(
        success=True,
        message="Results fetched successfully",
        data={
            "exam_uid": exam.exam_uid,
            "exam_title": exam.title,
            "results": results,
        },
    )




@api_teacher_bp.route("/<school_slug>/exams/<exam_uid>/leaderboard", methods=["GET"])
@login_required
@teacher_required
@exam_owner_required
def leaderboard_api(school_slug, exam_uid):

    exam = get_exam_by_uid(
        school_id=current_user.school_id,
        exam_uid=exam_uid,
    )

    leaderboard = generate_leaderboard(
        exam_uid=exam_uid,
        school_id=current_user.school_id
    )

    return api_response(
        success=True,
        message="Leaderboard fetched successfully",
        data={
            "exam_uid": exam.exam_uid,
            "exam_title": exam.title,
            "leaderboard": leaderboard
        }
    )




@api_teacher_bp.route("/<school_slug>/exams/<exam_uid>", methods=["DELETE"])
@login_required
@teacher_required
@exam_owner_required
def delete_exam_api(school_slug, exam_uid):

    success, msg = delete_exam(
        school_id=current_user.school_id,
        exam_uid=exam_uid,
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
            "exam_id": exam_uid,
            "deleted": True
        }
    )





@api_teacher_bp.route(
    "/<school_slug>/exams/<exam_uid>/students/<student_db_id>/attempts",
    methods=["GET"],
)
@login_required
@teacher_required
@exam_owner_required
def attempts_api(
    school_slug,
    exam_uid,
    student_db_id,
):
    attempts = get_student_attempts(
        school_id=current_user.school_id,
        exam_uid=exam_uid,
        student_db_id=student_db_id,
    )

    best = None

    if attempts:
        best = max(
            attempts,
            key=lambda a: float(a.get("percentage") or 0),
        )

    best_id = best.get("id") if best else None

    return api_response(
        success=True,
        message="Attempts fetched successfully",
        data={
            "exam_uid": exam_uid,
            "student_db_id": student_db_id,
            "best_attempt_id": best_id,
            "attempts": [
                {
                    **attempt,
                    "is_best": attempt.get("id") == best_id,
                }
                for attempt in attempts
            ],
        },
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



@api_teacher_bp.route(
    "/<school_slug>/exams/<exam_uid>/students/<student_db_id>/grant-attempt",
    methods=["POST"],
)
@login_required
@teacher_required
@exam_owner_required
def grant_attempt_api(
    school_slug,
    exam_uid,
    student_db_id,
):
    data = request.get_json() or {}

    result, status = grant_additional_attempt(
        school_id=current_user.school_id,
        exam_uid=exam_uid,
        student_db_id=student_db_id,
        teacher_id=current_user.id,
        granted_attempts=data.get("granted_attempts", 1),
        reason=data.get("reason", "").strip(),
    )

    return api_response(
        **result,
        status=status,
    )



@api_teacher_bp.route(
    "/<school_slug>/exams/<exam_uid>/students/<student_db_id>/grant-attempts",
    methods=["GET"],
)
@login_required
@teacher_required
def grant_attempt_history_api(
    school_slug,
    exam_uid,
    student_db_id,
):
    
    result, status = get_additional_attempt_grants(
        school_id=current_user.school_id,
        exam_uid=exam_uid,
        student_db_id=student_db_id,
    )

    return api_response(
        **result,
        status=status,
    )



