from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional


# ==========================================================
# QUESTION VISUAL
# ==========================================================

@dataclass
class QuestionVisual:
    """
    Visual representation required for understanding
    or answering the question.

    None means the question does not require a visual.
    """

    type: str = ""

    data: Dict[str, Any] = field(
        default_factory=dict
    )


# ==========================================================
# GENERATED QUESTION
# ==========================================================

@dataclass
class GeneratedQuestion:
    """
    Generated multiple-choice question.
    """

    question_text: str = ""

    option_a: str = ""
    option_b: str = ""
    option_c: str = ""
    option_d: str = ""

    correct_answer: str = ""

    explanation: str = ""

    # Required only when the question cannot be
    # properly understood or answered without it.
    visual: Optional[QuestionVisual] = None


# ==========================================================
# GENERATED QUESTIONS
# ==========================================================

GeneratedQuestions = List[GeneratedQuestion]