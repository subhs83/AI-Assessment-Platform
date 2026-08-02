 
from smart_exam_system.extensions import db
from smart_exam_system.models import (
    ExamModel,  
    QuestionModel,
    AttemptModel,
    StudentAnswerModel,
    StudentModel
)

from smart_exam_system.api.services.display_option_mapper import (
    build_display_options,
     original_to_display,
)

from smart_exam_system.api.services.exam_service import get_exam_by_uid
import json
from openpyxl import Workbook
from datetime import datetime, timezone

# ---------------------------------
# Get attempts Detailed Report
# ---------------------------------

def get_attempt_detailed_report(attempt_id, school_id):

    # ---------------------------------
    # FETCH ATTEMPT (SECURE SCOPE)
    # ---------------------------------
    attempt = AttemptModel.query.filter_by(
        id=attempt_id,
        school_id=school_id
    ).first()

    if not attempt:
        return None

     # NOW we safely know exam + school context
    exam = attempt.exam  # relationship assumed OR use join if needed
    school_id = exam.school_id

    # ---------------------------------
    # FETCH STUDENT (SOURCE OF TRUTH)
    # ---------------------------------
    student = StudentModel.query.filter_by(
        id=attempt.student_db_id,
        school_id=school_id
    ).first()

    if not student:
        return None

    # ---------------------------------
    # QUESTION ORDER
    # ---------------------------------
    question_order = json.loads(attempt.question_order or "[]")

    report = []

    for q_id in question_order:
        question = db.session.get(QuestionModel, q_id)

        if not question:
            continue

        answer = StudentAnswerModel.query.filter_by(
            attempt_id=attempt_id,
            question_id=q_id
        ).first()

        option_order_map = json.loads(attempt.option_order or "{}")

        order = option_order_map.get(
            str(question.id),
            ["A", "B", "C", "D"],
)

        raw_options = {
            "A": question.option_a,
            "B": question.option_b,
            "C": question.option_c,
            "D": question.option_d,
        }

        options = build_display_options(
            raw_options,
            order,
        )

        selected = (
            original_to_display(
                answer.selected_option,
                order,
            )
            if answer
            else None
        )

        correct = original_to_display(
            question.correct_option,
            order,
        )

        selected_text = (
            options.get(selected)
            if selected
            else None
        )

        if selected is None:
            remark = "Not Attempted"
            is_correct = False
            selected_text = "Not Attempted"

        elif selected == correct:
            remark = "Correct"
            is_correct = True
            selected_text = options.get(selected)

        else:
            remark = "Incorrect"
            is_correct = False
            selected_text = options.get(selected)

        report.append({
            "question_id": question.id,
            "question_text": question.question_text,

            "selected_option": selected or "NA",
            "selected_text": selected_text,

            "options": options,
            "correct_option": correct, 
            "is_correct": is_correct,
            "remark": remark,
            "explanation": question.explanation,

        })

    # ---------------------------------
    # FINAL RESPONSE (CLEAN + SAFE)
    # ---------------------------------
    return {
        "attempt_id": attempt.id,

        "student_name": f"{student.first_name} {student.last_name}",
        "class_section": student.class_section,
        "roll_number": student.roll_number,

        "score": attempt.score,
        "total_marks": attempt.total_marks,
        "percentage": attempt.percentage,
        "total_questions": len(report),
        "questions": report
    }
# ---------------------------------
# Get all attempts for an exam
# ---------------------------------
def get_results(exam_uid, school_id):

    # ---------------------------------
    # SECURITY: validate exam belongs to school
    # ---------------------------------
    exam = ExamModel.query.filter_by(
        exam_uid=exam_uid,
        school_id=school_id
    ).first()

    if not exam:
        return []

    # ---------------------------------
    # FETCH ATTEMPTS
    # ---------------------------------
    attempts = AttemptModel.query.filter(
        AttemptModel.exam_id == exam.id,
        AttemptModel.is_submitted == True
    ).all()

    grouped = {}

    for a in attempts:

        student_id = a.student_db_id

        # 🔥 FETCH STUDENT FROM SOURCE OF TRUTH
        student = db.session.get(StudentModel, student_id)

        if not student:
            continue  # skip orphan attempt safely

        percentage = float(a.percentage or 0)

        if student_id not in grouped:
            grouped[student_id] = {
                "best": a,
                "student": student,
                "attempts_count": 1
            }
        else:
            data = grouped[student_id]
            data["attempts_count"] += 1

            existing_best = data["best"]
            existing_percentage = float(existing_best.percentage or 0)

            if percentage > existing_percentage:
                data["best"] = a

    # ---------------------------------
    # BUILD RESPONSE
    # ---------------------------------
    results = []

    for data in grouped.values():

        a = data["best"]
        s = data["student"]

        results.append({
            "id": a.id,

            # ✔ FROM STUDENT MODEL (SOURCE OF TRUTH)
            "student_id": s.id,
            "student_name": f"{s.first_name} {s.last_name}",
            "first_name": s.first_name,
            "last_name": s.last_name,
            "roll_number": s.roll_number,
            "class_section": getattr(s, "class_section", None),

            # ✔ ATTEMPT DATA
            "score": a.score,
            "total_marks": a.total_marks,
            "percentage": float(a.percentage or 0),

            # ✔ META
            "attempts_count": data["attempts_count"],
            "start_time": a.start_time,
            "end_time": a.end_time,
            "violation_count": a.violation_count,
            "auto_submitted_reason": a.auto_submitted_reason
        })
        # print("results:", results)

    return results

 
# ---------------------------------
# Get leaderboard for an exam
# ---------------------------------
 



def generate_leaderboard(exam_uid, school_id):

    # ---------------------------------
    # SECURITY: validate exam belongs to school
    # ---------------------------------
    exam = ExamModel.query.filter_by(
        exam_uid=exam_uid,
        school_id=school_id
    ).first()

    if not exam:
        return []

    # ---------------------------------
    # FETCH STUDENTS (SOURCE OF TRUTH)
    # ---------------------------------
    students_map = {
        s.id: s
        for s in StudentModel.query.filter_by(school_id=school_id).all()
    }

    # ---------------------------------
    # FETCH VALID ATTEMPTS
    # ---------------------------------
    attempts = AttemptModel.query.filter(
        AttemptModel.exam_id == exam.id,
        AttemptModel.is_submitted == True,
        AttemptModel.score.isnot(None),
        AttemptModel.total_marks.isnot(None),
        AttemptModel.percentage.isnot(None)
    ).all()

    # ---------------------------------
    # PICK BEST ATTEMPT PER STUDENT
    # ---------------------------------
    grouped = {}
    attempt_counts = {}
    for a in attempts:

        key = a.student_db_id  # ✅ correct identity key
        # Count attempts
        attempt_counts[key] = attempt_counts.get(key, 0) + 1
        percentage = float(a.percentage or 0)

        if key not in grouped:
            grouped[key] = a
        else:
            existing = grouped[key]
            existing_percentage = float(existing.percentage or 0)

            if percentage > existing_percentage:
                grouped[key] = a

            elif percentage == existing_percentage:
                if a.end_time and existing.end_time:
                    if a.end_time < existing.end_time:
                        grouped[key] = a

    # ---------------------------------
    # SORT LEADERBOARD
    # ---------------------------------
    students = list(grouped.values())

    students.sort(
        key=lambda x: (
            -float(x.percentage or 0),
            x.end_time or datetime.utcnow()
        )
    )

    # ---------------------------------
    # BUILD RESPONSE
    # ---------------------------------
    leaderboard = []
    rank = 1

    for a in students:

        student = students_map.get(a.student_db_id)

        start_time = a.start_time or datetime.utcnow()
        end_time = a.end_time or datetime.utcnow()

        leaderboard.append({
            "rank": rank,
            "student_db_id": a.student_db_id,

            # ✅ StudentModel (truth source)
            "first_name": student.first_name if student else "Unknown",
            "last_name": student.last_name if student else "",
            "class_section": student.class_section if student else "-",
            "roll_number": student.roll_number if student else "-",
            "mobile": student.mobile if student else "-",

            # Attempt data
            "attempts_count": attempt_counts.get(a.student_db_id, 0),
            "score": a.score,
            "total_marks": a.total_marks,
            "percentage": float(a.percentage or 0),

            "time_taken": str(end_time - start_time)
        })

        rank += 1

    return leaderboard
# ---------------------------------
# Export Results to Excel
# ---------------------------------
def export_results_to_excel(exam_id, file_path):
    attempts = AttemptModel.query.filter_by(exam_id=exam_id).order_by(
        AttemptModel.score.desc()
    ).all()
    if not attempts:
        return False, "No attempts found."

    wb = Workbook()
    ws = wb.active
    ws.title = "Results"

    ws.append([
        "Student ID",
        "First Name",
        "Last Name",
        "Class",
        "Roll Number",
        "Score",
        "Total Marks",
        "Percentage",
        "Start Time",
        "End Time",
        "Violation Count"
    ])

    for row in attempts:
        ws.append([
            row.student_id,
            row.first_name,
            row.last_name,
            row.class_section,
            row.roll_number,
            row.score,
            row.total_marks,
            row.percentage,
            row.start_time,
            row.end_time,
            row.violation_count
        ])

    wb.save(file_path)
    return True, f"Results exported to {file_path}"


def get_student_attempts(
    school_id,
    exam_uid,
    student_db_id,
):
    exam = get_exam_by_uid(
        school_id=school_id,
        exam_uid=exam_uid,
    )

    if not exam:
        return []

    student = StudentModel.query.filter_by(
        id=student_db_id,
        school_id=school_id,
    ).first()

    if not student:
        return []

    attempts = (
        AttemptModel.query.filter(
            AttemptModel.exam_id == exam.id,
            AttemptModel.student_db_id == student_db_id,
        )
        .order_by(
            AttemptModel.attempt_number.asc()
        )
        .all()
    )

    enriched = []

    for a in attempts:
        enriched.append({
            "id": a.id,
            "exam_uid": exam.exam_uid,
            "attempt_number": a.attempt_number,

            "score": a.score,
            "total_marks": a.total_marks,
            "percentage": a.percentage,

            "start_time": a.start_time,
            "end_time": a.end_time,

            "violation_count": a.violation_count,
            "auto_submitted_reason": a.auto_submitted_reason,

            "student": {
                "id": student.id,
                "name": f"{student.first_name} {student.last_name}",
                "first_name": student.first_name,
                "last_name": student.last_name,
                "class": student.class_section,
                "roll": student.roll_number,
                "mobile": student.mobile,
            },
        })

    return enriched


# def get_attempt_detailed_report(attempt_id, school_id):

#     # ---------------------------------
#     # SECURITY: validate attempt belongs to school via exam
#     # ---------------------------------
#     attempt = db.session.query(AttemptModel).join(ExamModel).filter(
#         AttemptModel.id == attempt_id,
#         ExamModel.school_id == school_id
#     ).first()

#     if not attempt:
#         return None

#     # ---------------------------------
#     # STUDENT (SOURCE OF TRUTH + SAFE)
#     # ---------------------------------
#     student = StudentModel.query.filter_by(
#         id=attempt.student_db_id,
#         school_id=school_id
#     ).first()

#     student_name = (
#         f"{student.first_name} {student.last_name}"
#         if student else "Unknown Student"
#     )

#     # ---------------------------------
#     # QUESTION ORDER SAFE LOAD
#     # ---------------------------------
#     question_order = json.loads(attempt.question_order or "[]")

#     report = []

#     for q_id in question_order:

#         question = db.session.get(QuestionModel, q_id)


#         if not question:
#             continue  # avoid crash if question deleted

#         answer = StudentAnswerModel.query.filter_by(
#             attempt_id=attempt_id,
#             question_id=q_id
#         ).first()

#         selected = answer.selected_option if answer else None
#         correct = question.correct_option

#         option_map = {
#             "A": question.option_a,
#             "B": question.option_b,
#             "C": question.option_c,
#             "D": question.option_d
#         }

#         selected_text = option_map.get(selected) if selected else None

#         if selected is None:
#             remark = "Not Attempted"
#             is_correct = False

#         elif selected == correct:
#             remark = "Correct"
#             is_correct = True

#         else:
#             remark = "Incorrect"
#             is_correct = False

#         report.append({
#             "question_id": question.id,
#             "question_text": question.question_text,

#             "selected_option": selected if selected else "NA",
#             "selected_text": selected_text if selected else "Not Attempted",
#             "correct_text": option_map.get(correct),   # ✅ FIX ADDED
#             "options": option_map,

#             "is_correct": is_correct,
#             "remark": remark
#         })

#     return {
#         "student_name": student_name,
#         "score": attempt.score,
#         "total_marks": attempt.total_marks,
#         "total_questions": len(report),
#         "percentage": attempt.percentage,
#         "questions": report
#     }


def build_student_summary(attempts):
    first_attempt = attempts[0]
    return {
        "student_id": first_attempt.student_id,
        "name": f"{first_attempt.first_name} {first_attempt.last_name}",
        "class": first_attempt.class_section,
        "roll": first_attempt.roll_number
    }

def get_best_attempt_id(attempts):

    best_attempt_id = None
    best_percentage = -1

    for attempt in attempts:

        if (
            attempt.percentage is not None
            and attempt.percentage > best_percentage
        ):
            best_percentage = attempt.percentage
            best_attempt_id = attempt.id

    return best_attempt_id

