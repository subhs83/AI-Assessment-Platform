
from flask import jsonify, request, session
from datetime import datetime, timedelta
from smart_exam_system.api.student import api_student_bp
from smart_exam_system.extensions import db
from smart_exam_system.models import (
    ExamModel,
    QuestionModel,
    StudentAnswerModel,
    AttemptModel
)
from smart_exam_system.api.services.react_student_service import (
    start_student_attempt,
    resolve_attempt,
    normalize_question_index,
    get_attempt_question_order,
    resolve_attempt,
    get_student_result,
    get_exam_by_quiz_code,
    get_student_identity,
    set_student_identity,
    get_submitted_attempts,
    get_used_attempt_count,
    get_max_attempts,
    get_total_questions,
    get_student_score,    
    is_attempt_expired,
    auto_submit_attempt,    
    finalize_attempt,   
    record_violation,
    start_next_attempt,
    clear_student_identity,
    get_attempt_detailed_report,    
    find_or_create_student

)
import json
import logging
logger = logging.getLogger(__name__)



@api_student_bp.route("/<school_slug>/quiz/<quiz_code>/state", methods=["GET"])
def get_attempt_state_api(school_slug, quiz_code):
    try:
        # 1. Resolve exam by school + quiz
        exam = get_exam_by_quiz_code(quiz_code)

        if not exam or exam.school.slug != school_slug:
            return jsonify({
                "success": False,
                "message": "Invalid quiz or school",
                "data": None,
                "error": "invalid_exam"
            }), 404

        # 2. Get student identity (session/cookie)
        student_id = get_student_identity()
        if student_id:
            session["student_db_id"] = student_id
            session.modified = True   # 🔥 REQUIRED
        # ----------------------------
        # CASE 1: No student yet → REGISTER
        # ----------------------------
        if not student_id:
            return jsonify({
                "success": True,
                "message": "Student not registered",
                "data": {
                    "state": "register",
                    "exam_id": exam.id,
                    "quiz_code": quiz_code,
                    "school_slug": school_slug,
                    "used_attempts": 0,
                    "max_attempts": exam.max_attempts_per_student or 1
                },
                "error": None
            })

        # 3. Get attempts
        attempts = get_submitted_attempts(exam.id, student_id)

        latest_attempt = attempts[0] if attempts else None

        used_attempts = len(attempts)
        max_attempts = get_max_attempts(exam)

        # ----------------------------
        # CASE 2: No attempt yet → QUIZ
        # ----------------------------
        if not latest_attempt:
            return jsonify({
                "success": True,
                "message": "Ready to start quiz",
                "data": {
                    "state": "quiz",
                    "exam_id": exam.id,
                    "quiz_code": quiz_code,
                    "school_slug": school_slug,
                    "used_attempts": used_attempts,
                    "max_attempts": max_attempts,
                    "attempt_id": None
                },
                "error": None
            })

        # ----------------------------
        # CASE 3: Not submitted → CONTINUE QUIZ
        # ----------------------------
        if not latest_attempt.is_submitted:
            return jsonify({
                "success": True,
                "message": "Continue attempt",
                "data": {
                    "state": "quiz",
                    "exam_id": exam.id,
                    "quiz_code": quiz_code,
                    "school_slug": school_slug,
                    "attempt_id": latest_attempt.id,
                    "used_attempts": used_attempts,
                    "max_attempts": max_attempts
                },
                "error": None
            })

        # ----------------------------
        # CASE 4: Submitted → RESULT
        # ----------------------------
        return jsonify({
            "success": True,
            "message": "Show result",
            "data": {
                "state": "result",
                "exam_id": exam.id,
                "quiz_code": quiz_code,
                "school_slug": school_slug,
                "attempt_id": latest_attempt.id,
                "used_attempts": used_attempts,
                "max_attempts": max_attempts
            },
            "error": None
        })

    except Exception as e:
        logger.exception("Failed to process request")
        return jsonify({
            "success": False,
            "message": "Server error",
            "data": None,
            "error": str(e)
        }), 500


@api_student_bp.route(
    "/reset-student",
    methods=["POST"]
)
def reset_student():
    response = jsonify({
        "success": True
    })

    clear_student_identity(response)

    return response



@api_student_bp.route("/<school_slug>/quiz/<quiz_code>/start", methods=["POST"])
def start_attempt(school_slug, quiz_code):

    try:
        data = request.get_json()

        # ==================================================
        # 1. Resolve exam
        # ==================================================
        exam = get_exam_by_quiz_code(quiz_code)

        if not exam or exam.school.slug != school_slug:
            return jsonify({
                "success": False,
                "message": "Invalid quiz or school",
                "error": "invalid_exam"
            }), 404

        # ==================================================
        # 2. Validate payload
        # ==================================================
        if not data:
            return jsonify({
                "success": False,
                "message": "Request body missing",
                "error": "missing_body"
            }), 400

        mobile = data.get("mobile")
        roll_number = data.get("roll_number")
        student_class = data.get("student_class")

        if not mobile:
            return jsonify({
                "success": False,
                "message": "Mobile number is required",
                "error": "missing_mobile"
            }), 400

        # ==================================================
        # 3. CALL SERVICE (NO STUDENT LOGIC HERE)
        # ==================================================
        result = start_student_attempt(
            exam_id=exam.id,
            school_id=exam.school_id,
            form_data=data,
            ip_address=request.remote_addr
        )

        # ==================================================
        # 4. HANDLE RESPONSE TYPES
        # ==================================================

        if isinstance(result, tuple):
            result_data, status_code = result
            return jsonify(result_data), status_code

        response = jsonify({
        "success": True,
        "status": "redirect_result",
        "attempt_id": result.get("attempt_id"),
        "student_db_id": result.get("student_db_id"),
    })

    set_student_identity(result.get("student_db_id"), response)

    return response, 200

        response = jsonify({
        "success": True,
        "status": "started",
        "data": {
            "attempt_id": result.get("attempt_id"),
            "student_db_id": result.get("student_db_id"),
        }
    })

    set_student_identity(result.get("student_db_id"), response)

    return response, 201

    except Exception:
        logger.exception("Failed to process request")
        return jsonify({
            "success": False,
            "state": "error",
            "message": "Server Error",

        }), 500

@api_student_bp.route("/<school_slug>/attempt/<int:attempt_id>/question/<int:q_index>", methods=["GET"])
def get_question(school_slug, attempt_id, q_index):
    try:
        # 1. Get attempt
        attempt = resolve_attempt(attempt_id)

        if not attempt:
            return jsonify({
                "success": False,
                "message": "Attempt not found",
                "data": None,
                "error": "invalid_attempt"
            }), 404


        # NEW: already submitted check
        if attempt.is_submitted:
            return jsonify({
                "success": False,
                "message": "Exam already submitted",
                "data": {
                    "submitted": True,
                    "attempt_id": attempt.id
                },
                "error": "already_submitted"
            }), 403


        # NEW: expiry check
        if is_attempt_expired(attempt):

            auto_submit_attempt(
                attempt,
                "time_expired"
            )

            return jsonify({
                "success": False,
                "message": "Exam time expired",
                "data": {
                    "expired": True,
                    "attempt_id": attempt.id
                },
                "error": "time_expired"
            }), 403

        # 2. Get question order
        question_data = get_attempt_question_order(attempt)
        question_order = question_data["question_order"]
        total_questions = question_data["total_questions"]

        # 3. Validate index
        q_index = normalize_question_index(q_index, total_questions)
        if q_index is None:
            return jsonify({
                "success": False,
                "message": "Invalid question index",
                "data": None,
                "error": "invalid_index"
            }), 400

        # 4. Get question ID
        question_id = question_order[q_index]
        question = db.session.get(QuestionModel, question_id)

        if not question:
            return jsonify({
                "success": False,
                "message": "Question not found",
                "data": None,
                "error": "not_found"
            }), 404

        # 5. Get saved answer
        answer = StudentAnswerModel.query.filter_by(
            attempt_id=attempt_id,
            question_id=question_id
        ).first()

        selected_option = answer.selected_option if answer else None
        

        deadline = (
            attempt.start_time +
            timedelta(
                minutes=attempt.exam.duration_minutes
            )
        )

        remaining_seconds = max(
            0,
            int(
                (deadline - datetime.utcnow())
                .total_seconds()
            )
        )
        # 6. Build response

        option_order_map = json.loads(attempt.option_order or "{}")

        order = option_order_map.get(
            str(question.id),
            ["A", "B", "C", "D"]
        )

        raw_options = {
            "A": question.option_a,
            "B": question.option_b,
            "C": question.option_c,
            "D": question.option_d
        }

        priority_keywords = [
            "none of the above",
            "all of the above",
            "none of these",
            "all of these",
        ]

        def is_special_option(text):
            if not text:
                return False
            return any(k in text.lower() for k in priority_keywords)

        normal_keys = []
        special_keys = []

        for k in order:
            val = raw_options.get(k)

            if is_special_option(val):
                special_keys.append(k)
            else:
                normal_keys.append(k)

        final_order = normal_keys + special_keys

        options = {k: raw_options[k] for k in final_order}
        return jsonify({
            "success": True,
            "message": "Question fetched successfully",
            "data": {
                "attempt_id": attempt.id,
                "question_id": question.id,
                "q_index": q_index,
                "total_questions": total_questions,
                "question_text": question.question_text,
                "options": options,
                "selected_option": selected_option,
                "remaining_seconds": remaining_seconds,
                # ⭐ NEW
                "violation_count": attempt.violation_count or 0
            },
            "error": None
        })

    except Exception:
        logger.exception("Failed to process request")
        return jsonify({
            "success": False,
            "message": "Server error",
            "data": None,
        }), 500
    

@api_student_bp.route("/<school_slug>/attempt/<int:attempt_id>/answer", methods=["POST"])
def save_answer(school_slug, attempt_id):
    try:
        data = request.get_json()

        question_id = data.get("question_id")
        selected_option = data.get("selected_option")

        # -------------------------
        # 1. Validate attempt
        # -------------------------
        attempt = resolve_attempt(attempt_id)
        if not attempt:
            return jsonify({
                "success": False,
                "message": "Attempt not found",
                "data": None,
                "error": "invalid_attempt"
            }), 404
        
        if attempt.is_submitted:
            return {
                "submitted": True
            }, 403

        if is_attempt_expired(attempt):

            auto_submit_attempt(
                attempt,
                "time_expired"
            )

            return {
                "expired": True
            }, 403
        # Block if submitted
        if attempt.is_submitted:
            return jsonify({
                "success": False,
                "message": "Exam already submitted",
                "data": None,
                "error": "locked"
            }), 403

        # -------------------------
        # 2. Validate question
        # -------------------------
        question = db.session.get(QuestionModel, question_id)
        if not question:
            return jsonify({
                "success": False,
                "message": "Question not found",
                "data": None,
                "error": "invalid_question"
            }), 404

        # -------------------------
        # 3. Check existing answer
        # -------------------------
        answer = StudentAnswerModel.query.filter_by(
            attempt_id=attempt_id,
            question_id=question_id
        ).first()

        # -------------------------
        # Determine correctness
        # -------------------------
        is_correct = (
            selected_option == question.correct_option
        )

        # -------------------------
        # Update OR Insert
        # -------------------------
        if answer:
            answer.selected_option = selected_option
            answer.is_correct = is_correct
        else:
            answer = StudentAnswerModel(
                attempt_id=attempt_id,
                question_id=question_id,
                selected_option=selected_option,
                is_correct=is_correct
            )
            db.session.add(answer)

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Answer saved successfully",
            "data": {
                "attempt_id": attempt_id,
                "question_id": question_id,
                "selected_option": selected_option
            },
            "error": None
        })

    except Exception:
        logger.exception("Failed to process request")
        return jsonify({
            "success": False,
            "message": "Server error",
            "data": None,
        }), 500
    
@api_student_bp.route("/<school_slug>/attempt/<int:attempt_id>/result", methods=["GET"])
def get_result(school_slug, attempt_id):
    try:
        show_review = request.args.get("review", "false").lower() == "true"

        result = get_student_result(attempt_id)

        if not result:
            return jsonify({
                "success": False,
                "message": "Attempt not found",
                "data": None,
                "error": "invalid_attempt"
            }), 404

        review_data = None

        if (
            show_review
            and result.get("review_enabled")
        ):
            review_data = get_attempt_detailed_report(attempt_id)

        return jsonify({
            "success": True,
            "message": "Result fetched successfully",
            "data": {
                "student_name": result["student_name"],

                "score": result["score"],
                "total_marks": result["total_marks"],
                "percentage": round(result["percentage"], 2),

                "total_questions": result["total_questions"],
                "correct": result["correct_answers"],
                "wrong": result["wrong_answers"],
                "not_attempted": result["not_attempted"],
                "attempted": result["attempted"],

                "rank": result["rank"],
                "percentile": result["percentile"],
                "total_participants": result["total_participants"],

                "exam_title": result["exam"].title,
                "auto_submitted_reason": result["auto_submitted_reason"],

                "attempt_number": result["attempt_number"],
                "max_attempts": result["max_attempts"],
                "can_take_next_attempt": result["can_take_next_attempt"],

                "quiz_code": result["quiz_code"],

                # NEW
                "review_enabled": result["review_enabled"],

                # REVIEW DATA
                "review": review_data
            },
            "error": None
        })

    except Exception:
        logger.exception("Failed to process request")
        return jsonify({
            "success": False,
            "message": "Server error",
            "data": None,
        }), 500

        
@api_student_bp.route(
    "/<school_slug>/attempt/<int:attempt_id>/submit",
    methods=["POST"]
)
def submit_attempt(school_slug, attempt_id):
    try:
        attempt = resolve_attempt(attempt_id)

        if not attempt:
            return jsonify({
                "success": False,
                "message": "Attempt not found",
                "data": None,
                "error": "invalid_attempt"
            }), 404

        if attempt.is_submitted:
            return jsonify({
                "success": False,
                "message": "Attempt already submitted",
                "data": None,
                "error": "already_submitted"
            }), 400

        # NEW: expiry check
        if is_attempt_expired(attempt):

            auto_submit_attempt(
                attempt,
                "time_expired"
            )

            return jsonify({
                "success": True,
                "message": "Exam time expired",
                "data": {
                    "attempt_id": attempt.id,
                    "status": "submitted"
                },
                "error": None
            })


        # Manual submit
        attempt = finalize_attempt(
            attempt,
            submit_reason="manual"
        )

        return jsonify({
            "success": True,
            "message": "Exam submitted successfully",
            "data": {
                "attempt_id": attempt.id,
                "score": attempt.score,
                "percentage": attempt.percentage,
                "status": "submitted"
            },
            "error": None
        })

    except Exception:
        logger.exception("Failed to process request")
        return jsonify({
            "success": False,
            "message": "Server error",
            "data": None,
        }), 500
    

@api_student_bp.route(
    "/<school_slug>/attempt/<int:attempt_id>/violation",
    methods=["POST"]
)
def report_violation(school_slug, attempt_id):
    try:

        attempt = resolve_attempt(attempt_id)

        if not attempt:
            return jsonify({
                "success": False,
                "message": "Attempt not found",
                "data": None,
                "error": "invalid_attempt"
            }), 404

        if attempt.is_submitted:
            return jsonify({
                "success": False,
                "message": "Exam already submitted",
                "data": {
                    "submitted": True,
                    "attempt_id": attempt.id
                },
                "error": "already_submitted"
            }), 403
        
        data = request.get_json(silent=True)

        if data is None:

            raw_data = request.get_data(as_text=True)

            try:
                data = json.loads(raw_data)
            except Exception:
                data = {}

        reason = data.get(
            "reason",
            "unknown_violation"
        )

       
 
        result = record_violation(
            attempt.id,
            reason
        )
     
        if not result:
            return jsonify({
                "success": False,
                "message": "Failed to record violation",
                "data": None,
                "error": "record_failed"
            }), 500

        return jsonify({
            "success": True,
            "message": "Violation recorded",
            "data": {
                "attempt_id": attempt.id,
                "violation_count": result["violation_count"],
                "auto_submitted": result["auto_submitted"]
            },
            "error": None
        })

    except Exception:
        logger.exception("Failed to process request")
        return jsonify({
            "success": False,
            "message": "Server error",
            "data": None,
        }), 500



@api_student_bp.route(
    "/<school_slug>/attempt/<int:attempt_id>/palette",
    methods=["GET"]
)
def get_palette_state(school_slug, attempt_id):
    try:
        attempt = resolve_attempt(attempt_id)

        if not attempt:
            return jsonify({
                "success": False,
                "error": "invalid_attempt",
                "message": "Attempt not found"
            }), 404

        # Get question order
        question_order = json.loads(attempt.question_order or "[]")

        # Get all answers
        answers = StudentAnswerModel.query.filter_by(
            attempt_id=attempt_id
        ).all()

        answer_map = {
            a.question_id: a.selected_option
            for a in answers
        }

        palette = []

        for idx, q_id in enumerate(question_order):
            selected = answer_map.get(q_id)

            if selected:
                status = "answered"
            else:
                status = "not_answered"

            palette.append({
                "index": idx,
                "question_id": q_id,
                "status": status
            })

        return jsonify({
            "success": True,
            "data": {
                "attempt_id": attempt.id,
                "palette": palette,
                "total": len(palette)
            }
        })

    except Exception:
        logger.exception("Failed to process request")
        return jsonify({
            "success": False,
            "message": "Server error"
        }), 500
    

@api_student_bp.route(
    "/<school_slug>/attempt/<int:attempt_id>/next",
    methods=["POST"]
)
def create_next_attempt(
    school_slug,
    attempt_id
):
    try:

        result = start_next_attempt(
            attempt_id
        )

        if isinstance(result, tuple):
            result_data, status_code = result
            return jsonify(
                result_data
            ), status_code

        return jsonify({
            "success": True,
            "data": {
                "attempt_id": result["attempt_id"]
            }
        }), 201

    except Exception:
        logger.exception("Failed to process request")
        return jsonify({
            "success": False,
            "message": "Server error",
        }), 500


@api_student_bp.route("/<school_slug>/quiz/<quiz_code>/attempts", methods=["GET"])
def get_attempts(school_slug, quiz_code):

    exam = get_exam_by_quiz_code(quiz_code)

    if not exam:
        return jsonify({
            "success": False,
            "message": "Exam not found"
        }), 404

    # ==================================================
    # 🔥 STEP 1: USE DB AS SOURCE OF TRUTH
    # ==================================================

    # Get latest attempt FIRST (safe fallback)
    latest_attempt = AttemptModel.query.filter_by(
        exam_id=exam.id
    ).order_by(AttemptModel.id.desc()).first()

    if not latest_attempt:
        return jsonify({
            "success": True,
            "data": []
        })

    student_id = latest_attempt.student_db_id

    if not student_id:
        return jsonify({
            "success": True,
            "data": []
        })

    # ==================================================
    # STEP 2: FETCH ONLY THIS STUDENT'S ATTEMPTS
    # ==================================================
    attempts = AttemptModel.query.filter(
        AttemptModel.exam_id == exam.id,
        AttemptModel.student_db_id == student_id
    ).order_by(AttemptModel.attempt_number.asc()).all()

    return jsonify({
        "success": True,
        "data": [
            {
                "attempt_id": a.id,
                "attempt_number": a.attempt_number
            }
            for a in attempts
        ]
    })