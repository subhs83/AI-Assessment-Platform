# smart_exam_system/models/__init__.py

from smart_exam_system.models.user import UserModel
from smart_exam_system.models.school import SchoolModel
from smart_exam_system.models.exam import ExamModel
from smart_exam_system.models.question import QuestionModel
from smart_exam_system.models.attempt import AttemptModel
from smart_exam_system.models.result import Result
from smart_exam_system.models.answer import StudentAnswerModel
from smart_exam_system.models.student import StudentModel
from smart_exam_system.models.login_log import LoginLogModel
from smart_exam_system.models.democontact import DemoRequest, ContactMessage

from smart_exam_system.models.ai_generation_requests import AIGenerationRequest


__all__ = [
    "UserModel",
    "SchoolModel",
    "ExamModel",
    "QuestionModel",
    "AttemptModel",
    "Result",
    "StudentAnswerModel",
    "DemoRequest",
    "ContactMessage",
    "StudentModel",
    "LoginLogModel",
    "AIGenerationRequest"
]