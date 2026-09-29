import json
import re
import logging


logger = logging.getLogger(__name__)

def _repair_json_control_characters(text):
    """
    Repair malformed JSON produced by AI responses.
    Handles:
    1. Raw control characters inside JSON strings.
    2. Invalid JSON escapes commonly used by LaTeX, such as:
       \\text, \\theta, \\frac, \\angle, \\rho, \\tau, \\times, etc.
    Valid JSON escapes are preserved.
    """

    # Common LaTeX commands whose leading backslash can be
    # incorrectly interpreted as a JSON escape.
    latex_commands = {"text","theta","times","tau","frac","beta","neq","nu","rightarrow","rho",
        "angle","circ","pi","sqrt","alpha","gamma","delta","lambda","mu","sigma","phi","varphi",
        "omega","infty","cdot","leq","geq","approx","pm","sin","cos","tan","log","ln", }
    result = []
    inside_string = False
    i = 0

    while i < len(text):
        char = text[i]
        # ---------------------------------------------------------
        # Quote
        # ---------------------------------------------------------
        if char == '"':
            # Count preceding backslashes.
            # An even number means this quote is not escaped.
            slash_count = 0
            j = i - 1

            while j >= 0 and text[j] == "\\":
                slash_count += 1
                j -= 1

            if slash_count % 2 == 0:
                inside_string = not inside_string

            result.append(char)
            i += 1
            continue

        # ---------------------------------------------------------
        # Backslash inside JSON string
        # ---------------------------------------------------------
        if char == "\\" and inside_string:
            # Look ahead to determine what follows the backslash.
            remaining = text[i + 1:]
            # -----------------------------------------------------
            # Check for LaTeX command
            # -----------------------------------------------------
            latex_match = re.match(r"([A-Za-z]+)", remaining)
            if latex_match:
                command = latex_match.group(1)
                if command in latex_commands:
                    # Preserve the backslash for LaTeX.
                    result.append("\\\\")
                    result.append(command)

                    i += 1 + len(command)
                    continue

            # -----------------------------------------------------
            # Valid JSON escape
            # -----------------------------------------------------
            if i + 1 < len(text):
                next_char = text[i + 1]

                if next_char in {'"', "\\", "/", "b", "f", "n", "r", "t", "u",}:
                    result.append("\\")
                    result.append(next_char)

                    i += 2
                    continue

            # -----------------------------------------------------
            # Invalid JSON escape
            # -----------------------------------------------------
            result.append("\\\\")
            i += 1
            continue

        # ---------------------------------------------------------
        # Raw control characters inside JSON strings
        # ---------------------------------------------------------
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

def parse_ai_response(response_text):
    """
    Cleans Gemini response and converts to valid JSON.
    """
    cleaned = ""
    try:
        # Step 1: Extract content from within JSON code fences
        json_blocks = re.findall(r"```json\n(.*?)\n```", response_text, re.DOTALL)
        
        if json_blocks:
            # Grab the last JSON block in case the AI restarted its thought process
            cleaned = json_blocks[-1].strip()
        else:
            # Fallback just in case the AI outputs raw JSON without backticks
            cleaned = response_text.strip()

        # Step 2: Attempt standard JSON parse with fallback repair
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as first_error:
            repaired = _repair_json_control_characters(cleaned)
            try:
                data = json.loads(repaired)
                # print("\n========== JSON REPAIR SUCCESSFUL ==========")
                # print("Gemini returned raw control characters " "inside a JSON string."                )
                # print("============================================\n")
                cleaned = repaired
            except json.JSONDecodeError:
                # Re-raise the original error so the existing
                # diagnostic section below remains useful.
                raise first_error
        # print("JSON TYPE:", type(data))
    
        if not isinstance(data, dict):
            return {
                "success": False,
                "message": "Invalid format: expected JSON object",
            }

        # Extract generated questions.
        questions = data.get("data")
     
        # Validate question list.

        if not isinstance(questions, list):
            return {
                "success": False,
                "message": "Invalid format: expected 'data' list",
            }

        return {
            "success": True,
            "data": questions,
        }

    except json.JSONDecodeError as e:

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

