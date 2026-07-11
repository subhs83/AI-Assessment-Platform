# smart_exam_system/models/__init__.py

from smart_exam_system.models.user import UserModel
from smart_exam_system.models.school import SchoolModel, SchoolClassModel, SchoolSectionModel   
from smart_exam_system.models.exam import ExamModel, ExamTargetModel
from smart_exam_system.models.question import QuestionModel
from smart_exam_system.models.attempt import AttemptModel
from smart_exam_system.models.result import Result
from smart_exam_system.models.answer import StudentAnswerModel
from smart_exam_system.models.student import StudentModel
from smart_exam_system.models.login_log import LoginLogModel
from smart_exam_system.models.democontact import DemoRequest, ContactMessage
from smart_exam_system.models.additionalattemptgrant import AdditionalAttemptGrant
from smart_exam_system.models.subscription_plan import SubscriptionPlanModel
from smart_exam_system.models.school_subscription import SchoolSubscriptionModel
from smart_exam_system.models.ai_feature_cost import AIFeatureModel
from smart_exam_system.models.school_usage import SchoolUsageModel

from smart_exam_system.models.ai_generation_requests import AIGenerationRequest


__all__ = [
    "UserModel",
    "SchoolModel",
    "SchoolClassModel",
    "SchoolSectionModel",
    "ExamModel",
    "ExamTargetModel",
    "QuestionModel",
    "AttemptModel",
    "Result",
    "StudentAnswerModel",
    "DemoRequest",
    "ContactMessage",
    "StudentModel",
    "LoginLogModel",
    "AIGenerationRequest",
    "AdditionalAttemptGrant",
    "SubscriptionPlanModel",
    "SchoolSubscriptionModel",
    "AIFeatureModel",
    "SchoolUsageModel"
]