import json
import re
import logging
logger = logging.getLogger(__name__)


def parse_ai_response(response_text):
    """
    Cleans Gemini response and converts to valid JSON
    """

    try:
        # Step 1: Remove markdown ```json blocks if present
        cleaned = re.sub(r"```json|```", "", response_text).strip()

        # Step 2: Parse JSON
        data = json.loads(cleaned)

        # Step 3: Basic validation
        if not isinstance(data, list):
            return {
                "success": False,
                "message": "Invalid format: expected list"
            }

        return {
            "success": True,
            "data": data
        }

    except json.JSONDecodeError:
        return {
            "success": False,
            "message": "Invalid JSON from AI",
            "raw": response_text
        }

    except Exception:
        logger.exception("Failed to generate")

        return {
            "success": False,
            "message": "Failed to generate."
        }