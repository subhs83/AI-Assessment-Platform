import json
import logging
import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ValidationError

logger = logging.getLogger(__name__)


# ============================================================================
# 1. INTERNAL PYDANTIC SCHEMAS FOR VALIDATION
# ============================================================================

class VisualElement(BaseModel):
    id: Optional[str] = None
    type: Optional[str] = None
    label: Optional[str] = None
    value: Optional[Any] = None


class VisualRelationship(BaseModel):
    type: Optional[str] = None
    element_id: Optional[str] = None
    elements: Optional[List[str]] = None
    target: Optional[str] = None
    value: Optional[Any] = None


class QuestionVisual(BaseModel):
    elements: List[VisualElement] = Field(default_factory=list)
    relationships: List[VisualRelationship] = Field(default_factory=list)


class GeneratedQuestion(BaseModel):
    question_text: str = ""
    option_a: Optional[str] = ""
    option_b: Optional[str] = ""
    option_c: Optional[str] = ""
    option_d: Optional[str] = ""
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = ""
    explanation: Optional[str] = ""
    visual: Optional[QuestionVisual] = None
    visual_required: Optional[bool] = False
    visual_type: Optional[str] = None


class GeneratedQuestionsWrapper(BaseModel):
    data: List[GeneratedQuestion]


# ============================================================================
# 2. CONTROL CHARACTER REPAIR HELPER
# ============================================================================

def _repair_json_control_characters(text: str) -> str:
    """
    Repair common malformed JSON produced by AI responses.

    Handles:
    1. Raw control characters inside JSON strings.
    2. Invalid JSON escape sequences, especially LaTeX commands
       such as \\angle, \\theta, \\frac, \\text, \\circ, etc.
    """
    result = []
    inside_string = False
    escaped = False

    valid_escapes = {'"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'}

    i = 0
    while i < len(text):
        char = text[i]

        if escaped:
            if inside_string:
                if char in valid_escapes:
                    result.append(char)
                else:
                    result.append("\\")
                    result.append(char)
                escaped = False
                i += 1
                continue

            result.append(char)
            escaped = False
            i += 1
            continue

        if char == "\\":
            result.append(char)
            escaped = True
            i += 1
            continue

        if char == '"':
            result.append(char)
            inside_string = not inside_string
            i += 1
            continue

        if inside_string:
            if char == "\n":
                result.append("\\n")
                i += 1
                continue
            if char == "\r":
                result.append("\\r")
                i += 1
                continue
            if char == "\t":
                result.append("\\t")
                i += 1
                continue
            if ord(char) < 32:
                result.append(f"\\u{ord(char):04x}")
                i += 1
                continue

        result.append(char)
        i += 1

    return "".join(result)


# ============================================================================
# 3. MAIN PARSER FUNCTION
# ============================================================================

def parse_ai_response(response_text: str) -> Dict[str, Any]:
    """
    Cleans Gemini response, repairs raw control characters/LaTeX escapes,
    validates the structure using Pydantic, and returns a dictionary payload.
    """
    cleaned = ""

    try:
        # Step 1: Strip code fences
        cleaned = re.sub(r"```json|```", "", response_text).strip()

        # Step 2: Attempt standard JSON parse with fallback repair
        try:
            raw_json = json.loads(cleaned)
        except json.JSONDecodeError as first_error:
            logger.warning(f"First JSON parse failed: {first_error}. Attempting repair...")
            repaired = _repair_json_control_characters(cleaned)
            try:
                raw_json = json.loads(repaired)
                cleaned = repaired
            except json.JSONDecodeError:
                raise first_error

        # Ensure top-level structure is wrapped in dict
        if isinstance(raw_json, list):
            raw_json = {"data": raw_json}
        elif not isinstance(raw_json, dict):
            return {
                "success": False,
                "message": "Invalid format: expected JSON object or array",
            }

        # Step 3: Validate through Pydantic
        validated_data = GeneratedQuestionsWrapper.model_validate(raw_json)

        # Step 4: Normalize structure for output
        questions_list = []
        for q in validated_data.data:
            q_dict = q.model_dump()

            # Normalize option array if AI outputs list instead of option_a/b/c/d
            if q_dict.get("options") and len(q_dict["options"]) >= 4:
                opts = q_dict["options"]
                q_dict["option_a"] = q_dict.get("option_a") or opts[0]
                q_dict["option_b"] = q_dict.get("option_b") or opts[1]
                q_dict["option_c"] = q_dict.get("option_c") or opts[2]
                q_dict["option_d"] = q_dict.get("option_d") or opts[3]

            questions_list.append(q_dict)

        return {
            "success": True,
            "data": questions_list,
        }

    except ValidationError as schema_error:
        logger.error(f"Schema validation error: {schema_error}")
        return {
            "success": False,
            "message": "AI generated JSON, but missing required structure.",
            "raw": response_text,
        }

    except json.JSONDecodeError as e:
        logger.error(f"JSON Parse Error at pos {e.pos}: {e.msg}")
        return {
            "success": False,
            "message": "Invalid JSON from AI",
            "raw": response_text,
        }

    except Exception as e:
        logger.exception("Unexpected error while parsing AI response")
        return {
            "success": False,
            "message": "Failed to parse AI response",
            "raw": response_text,
        }