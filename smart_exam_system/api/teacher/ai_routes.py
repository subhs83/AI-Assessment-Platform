
from flask import jsonify,request
from sqlalchemy import or_
from flask_login import login_required, current_user
from smart_exam_system.api.teacher import api_teacher_bp
from smart_exam_system.models import AIGenerationRequest
from smart_exam_system.api.services.ai.extractor import extract_input
from smart_exam_system.api.utils.decorators import  teacher_required
from smart_exam_system.api.services.ai.controller import ( generate_ai_questions_controller)
from smart_exam_system.models import QuestionModel
from smart_exam_system.extensions import db


@api_teacher_bp.route("/<school_slug>/ai/generate", methods=["POST"])
@login_required
@teacher_required
def ai_generate(school_slug):

    data = request.form.to_dict()   # topic, difficulty, question_count
    file = request.files.get("file")  # PDF or image

    school_id = current_user.school_id
    teacher_id = current_user.id

    result = generate_ai_questions_controller(
        data=data,
        file=file,
        school_id=school_id,
        teacher_id=teacher_id
    )

    return jsonify(result)


@api_teacher_bp.route("/<school_slug>/ai/extract", methods=["POST"])
@login_required
@teacher_required
def ai_extract(school_slug):

    file = request.files.get("file")

    if not file:
        return jsonify({
            "success": False,
            "message": "File is required"
        }), 400

    extracted = extract_input({}, file)

    if not extracted.get("success"):
        return jsonify(extracted), 400

    content = extracted["data"]["content"]

    return jsonify({
        "success": True,
        "content": content,
        "source_type": extracted["data"]["type"],
        "character_count": len(content),
        "word_count": len(content.split())
    })


@api_teacher_bp.route("/<school_slug>/ai/request/<int:request_id>", methods=["GET"])
@login_required 
@teacher_required
def get_ai_request(school_slug, request_id):

    ai_request = db.session.get(AIGenerationRequest, request_id)
    # print("SOURCE TYPE:", ai_request.source_type)
    # print("SOURCE TEXT:", ai_request.source_text)

    if not ai_request:
        return jsonify({
            "success": False,
            "message": "AI request not found"
        }), 404

    return jsonify({
        "success": True,
        "request": {
            "id": ai_request.id,
            "topic": ai_request.source_text[:150],
            "source_text": ai_request.source_text,
            "source_type": ai_request.source_type,
            "difficulty": ai_request.difficulty,
            "question_count": ai_request.question_count,
            "questions": ai_request.generated_questions,
            "status": ai_request.status,
            "created_at": ai_request.created_at
        }
    })


@api_teacher_bp.route("/<school_slug>/ai/save-to-exam", methods=["POST"])
@login_required
@teacher_required
def save_ai_to_exam(school_slug):

    data = request.get_json()

    request_id = data.get("request_id")
    exam_id = data.get("exam_id")
    selected_indexes = data.get("questions", [])

    ai_request = db.session.get(AIGenerationRequest, request_id)

    if not ai_request:
        return jsonify({"success": False, "message": "Invalid AI request"}), 404

    selected_questions = [
        ai_request.generated_questions[i]
        for i in selected_indexes
    ]



    for q in selected_questions:
        question = QuestionModel(
            exam_id=exam_id,
            question_text=q["question_text"],
            option_a=q["option_a"],
            option_b=q["option_b"],
            option_c=q["option_c"],
            option_d=q["option_d"],
            correct_option=q["correct_answer"]
        )
        db.session.add(question)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Questions saved to exam"
    })




@api_teacher_bp.route("/<school_slug>/ai/history", methods=["GET"])
@login_required
@teacher_required
def ai_history(school_slug):

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))

    search = request.args.get("search", "")
    status = request.args.get("status")
    difficulty = request.args.get("difficulty")
    source_type = request.args.get("source_type")
    
    query = AIGenerationRequest.query.filter_by(
    school_id=current_user.school_id,
    teacher_id=current_user.id
)
    # 🔍 SEARCH (topic + summary)
    if search:
        query = query.filter(
            or_(
                AIGenerationRequest.source_text.ilike(f"%{search}%"),
            )
        )

    # 🎯 FILTERS
    if status:
        query = query.filter_by(status=status)

    if difficulty:
        query = query.filter_by(difficulty=difficulty)

    if source_type:
        query = query.filter_by(source_type=source_type)

    # 📄 PAGINATION
    total = query.count()

    results = query.order_by(
        AIGenerationRequest.id.desc()
    ).offset((page - 1) * limit).limit(limit).all()
    
    return jsonify({
        "success": True,
        "data": [
            {
                "id": r.id,
                "topic": r.source_text[:150],
                "source_text": r.source_text,
                "source_type": r.source_type,
                "difficulty": r.difficulty,
                "status": r.status,
                "source_type": r.source_type,
                "question_count": r.question_count,
                "created_at": r.created_at
            }

            for r in results
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total
        }
    })