import json
import re
import logging


logger = logging.getLogger(__name__)

def _repair_json_control_characters(text):

    """
    Repair common malformed JSON produced by AI responses.

    Handles:

    1. Raw control characters inside JSON strings.

    2. Invalid JSON escape sequences, especially LaTeX commands
       such as \\angle, \\theta, \\frac, \\text, \\circ, etc.

    Valid JSON escapes are preserved unchanged.

    """



    result = []

    inside_string = False

    escaped = False



    # Valid JSON escape characters after a backslash.

    valid_escapes = {'"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'}



    i = 0



    while i < len(text):

        char = text[i]

        # ---------------------------------------------------------

        # Previous character was an escape backslash.

        # ---------------------------------------------------------

        if escaped:

            if inside_string:

                if char in valid_escapes:

                    # Valid JSON escape:

                    # \n, \t, \\, \", \uXXXX, etc.

                    result.append(char)

                else:

                    # Invalid JSON escape.

                    #

                    # Example:

                    #   \angle

                    #   \theta

                    #   \frac

                    #   \text

                    #

                    # We already appended the original backslash.

                    # Add another backslash so JSON sees:

                    #

                    #   \\angle

                    #

                    result.append("\\")

                    result.append(char)



                escaped = False

                i += 1

                continue



            # Outside a JSON string, preserve as-is.

            result.append(char)

            escaped = False

            i += 1

            continue



        # ---------------------------------------------------------

        # Backslash

        # ---------------------------------------------------------

        if char == "\\":

            result.append(char)

            escaped = True

            i += 1

            continue



        # ---------------------------------------------------------

        # Quote

        # ---------------------------------------------------------

        if char == '"':

            result.append(char)

            inside_string = not inside_string

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



            # Other ASCII control characters.

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


            # print("\n========== FIRST JSON PARSE FAILED ==========")

            # print("ERROR:", first_error)

            # print("Attempting safe control-character repair...")

            # print("==============================================")



            # -----------------------------------------------------

            # Second attempt: repair raw control characters

            # inside JSON strings.

            # -----------------------------------------------------

            repaired = _repair_json_control_characters(cleaned)



            try:

                data = json.loads(repaired)



                print("\n========== JSON REPAIR SUCCESSFUL ==========")

                print(

                    "Gemini returned raw control characters "

                    "inside a JSON string."

                )

                print("============================================\n")



                cleaned = repaired



            except json.JSONDecodeError:

                # Re-raise the original error so the existing

                # diagnostic section below remains useful.

                raise first_error



        print("JSON TYPE:", type(data))



        # Gemini now returns:

        #

        # {

        #     "data": [...]

        # }

        #

        # So first validate the wrapper object.

        if not isinstance(data, dict):

            return {

                "success": False,

                "message": "Invalid format: expected JSON object",

            }



        # Extract generated questions.

        questions = data.get("data")



        print(

            "QUESTION COUNT:",

            len(questions) if isinstance(questions, list) else "NOT LIST",

        )



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

        # print("\n========== JSON ERROR ==========")

        # print("ERROR:", e)

        # print("POSITION:", e.pos)

        # print("LINE:", e.lineno)

        # print("COLUMN:", e.colno)



        start = max(0, e.pos - 200)

        end = min(len(cleaned), e.pos + 200)



        # print("\n========== ERROR CONTEXT ==========")

        # print(cleaned[start:end])

        # print("====================================")



        # print("\n========== ERROR CHARACTER ==========")

        # if e.pos < len(cleaned):

        #     print("Character:", repr(cleaned[e.pos]))

        #     print("ASCII:", ord(cleaned[e.pos]))

        # print("======================================")



        # print("========== END JSON ERROR ==========\n")



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

