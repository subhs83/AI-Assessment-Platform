import os
import pandas as pd
from smart_exam_system.models.attempt import AttemptModel
from smart_exam_system.models.exam import ExamModel

from smart_exam_system.models.user import UserModel  # teacher info
from flask import abort



def build_exam_context(exam_id):
    teacher_id = ExamModel.get_teacher_id_by_exam(exam_id)

    if not teacher_id:
        abort(404)

    exam_title, teacher_name = ExamModel.get_exam_info(exam_id)

    return {
        "teacher_id": teacher_id,
        "exam_title": exam_title,
        "teacher_name": teacher_name,
    }



def generate_school_report(school_id):
    """Generate a professional school-level report grouped by teacher and exam"""
    # join attempts with exams and teachers
    attempts = (
        AttemptModel.query
        .join(ExamModel, AttemptModel.exam_id == ExamModel.id)
        .join(UserModel, ExamModel.teacher_id == UserModel.id)
        .filter(ExamModel.school_id == school_id, AttemptModel.is_submitted == True)
        .add_columns(
            UserModel.name.label("Teacher_Name"),
            ExamModel.title.label("Exam_Title"),
            AttemptModel.first_name,
            AttemptModel.last_name,
            AttemptModel.student_class,
            AttemptModel.roll_number,
            AttemptModel.mobile,
            AttemptModel.score,
            AttemptModel.total_marks,
            AttemptModel.percentage,
            AttemptModel.attempt_number,
            AttemptModel.start_time,
            AttemptModel.end_time
        )
        .order_by(UserModel.name, ExamModel.title, AttemptModel.roll_number)
        .all()
    )

    # convert to list of dicts
    data = []
    for a in attempts:
        data.append({
            "Teacher": a.Teacher_Name,
            "Exam": a.Exam_Title,
            "First Name": a.first_name,
            "Last Name": a.last_name,
            "Class": a.student_class,
            "Roll Number": a.roll_number,
            "Mobile": a.mobile,
            "Score": a.score,
            "Total Marks": a.total_marks,
            "Total Questions": (
            int(a.total_marks / ExamModel.marks_per_question)
            if a.total_marks and ExamModel.marks_per_question
            else 0
        ),
            "Percentage": a.percentage,
            "Attempt No": a.attempt_number,
            "Start Time": a.start_time,
            "End Time": a.end_time,
        })

    df = pd.DataFrame(data)

    # Create folder if it doesn't exist
    os.makedirs("reports", exist_ok=True)
    file_path = f"reports/school_{school_id}_report.xlsx"

    # Write to Excel with grouping by teacher and exam
    with pd.ExcelWriter(file_path, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False, sheet_name="School Report")
        workbook = writer.book
        worksheet = writer.sheets["School Report"]

        # Optional: Format header
        header_format = workbook.add_format({'bold': True, 'bg_color': '#DCE6F1', 'border': 1})
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)

        # Optional: Auto-adjust column widths
        for i, col in enumerate(df.columns):
            column_len = max(df[col].astype(str).map(len).max() if not df.empty else 0,len(col)) + 2
            worksheet.set_column(i, i, column_len)

    return file_path



def generate_exam_report(exam_id):
    """Generate a professional report for a single exam"""
    # fetch all attempts for the exam
    attempts = AttemptModel.query.AttemptModel.query.filter(
    AttemptModel.exam_id == exam_id,
    AttemptModel.is_submitted == True
).order_by(AttemptModel.roll_number).all()

    data = []
    for a in attempts:
        data.append({
            "First Name": a.first_name,
            "Last Name": a.last_name,
            "Class": a.student_class,
            "Roll Number": a.roll_number,
            "Mobile": a.mobile,
            "Score": a.score,
            "Total Marks": a.total_marks,
            "Total Questions": (
            int(a.total_marks / ExamModel.marks_per_question)
            if a.total_marks and ExamModel.marks_per_question
            else 0
        ),
            "Percentage": a.percentage,
            "Attempt No": a.attempt_number,
            "Start Time": a.start_time,
            "End Time": a.end_time,
        })

    df = pd.DataFrame(data)

    # ensure reports folder exists
    os.makedirs("reports", exist_ok=True)
    file_path = f"reports/exam_{exam_id}_report.xlsx"

    # write to Excel with formatting
    with pd.ExcelWriter(file_path, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False, sheet_name="Exam Report")
        workbook = writer.book
        worksheet = writer.sheets["Exam Report"]

        # format header
        header_format = workbook.add_format({'bold': True, 'bg_color': '#DCE6F1', 'border': 1})
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)

        # auto-adjust column widths
        for i, col in enumerate(df.columns):
            column_len = max(df[col].astype(str).map(len).max() if not df.empty else 0,len(col)) + 2
            worksheet.set_column(i, i, column_len)

    return file_path