import time
import tempfile
import os
from flask import current_app
from google import genai
from google.genai.errors import ServerError

from smart_exam_system.api.services.ai.prompt_builder import (
    build_analysis_prompt,
    build_question_prompt,
    build_smart_analysis_prompt,
)

import logging

logger = logging.getLogger(__name__)


def generate_from_gemini(
    content,
    difficulty,
    blooms_level,
    question_count,
    language,
):

    client = genai.Client(
        api_key=current_app.config["GEMINI_API_KEY"]
    )

    # -----------------------------
    # Step 1: Concept Analysis
    # -----------------------------

    analysis_prompt = build_analysis_prompt(
        content=content,
        language=language,
    )

    analysis_response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=analysis_prompt,
    )

    analysis = analysis_response.text[:5000]

    # -----------------------------
    # Step 2: Question Generation
    # -----------------------------

    generation_prompt = build_question_prompt(
        content=content,
        analysis=analysis,
        language=language,
        difficulty=difficulty,
        blooms_level=blooms_level,
        question_count=question_count,
    )

    try:

        max_retries = 3

        for attempt in range(max_retries):

            try:

                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=generation_prompt,
                )

                return response.text

            except ServerError:

                if attempt == max_retries - 1:
                    raise

                wait_time = 2 ** attempt

                current_app.logger.warning(
                    f"Gemini temporarily unavailable. "
                    f"Retry {attempt + 1}/{max_retries} "
                    f"in {wait_time}s..."
                )

                time.sleep(wait_time)

    except Exception:

        current_app.logger.exception(
            "Gemini generation failed"
        )

        raise Exception(
            "AI service is temporarily unavailable. "
            "Please try again in a moment."
        )


# Used this for generating structured document analysis using Gemini. 
# Returns raw Gemini response text.

def generate_smart_analysis(
    file,
    language,
):
    """
    Generate structured document analysis using Gemini.

    Returns:
        Raw JSON string returned by Gemini.
    """

    client = genai.Client(
        api_key=current_app.config["GEMINI_API_KEY"]
    )

    prompt = build_smart_analysis_prompt(
        language=language,
    )

    uploaded_file = None
    temp_path = None

    try:

        # Reset stream position
        file.stream.seek(0)

        # Create temporary file
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=os.path.splitext(file.filename)[1],
        ) as temp:

            file.save(temp.name)
            temp_path = temp.name


        # Upload file to Gemini
        uploaded_file = client.files.upload(
            file=temp_path,
            config={
                "mime_type": file.mimetype,
            },
        )


        max_retries = 3

        for attempt in range(max_retries):

            try:

                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=[
                        prompt,
                        uploaded_file,
                    ],
                )

                return response.text


            except ServerError:

                if attempt == max_retries - 1:
                    raise

                wait_time = 2 ** attempt

                current_app.logger.warning(
                    f"Gemini Smart Analysis unavailable. "
                    f"Retry {attempt + 1}/{max_retries} "
                    f"in {wait_time}s..."
                )

                time.sleep(wait_time)


    except Exception:

        current_app.logger.exception(
            "Smart Analysis failed"
        )

        raise Exception(
            "AI service is temporarily unavailable."
        )


    finally:

        # Remove local temporary file
        if temp_path and os.path.exists(temp_path):

            try:

                os.remove(temp_path)

            except Exception:

                logger.warning(
                    "Failed to remove temporary file."
                )


        # Remove Gemini uploaded file
        if uploaded_file:

            try:

                client.files.delete(
                    name=uploaded_file.name,
                )

            except Exception:

                logger.warning(
                    "Failed to delete uploaded Gemini file."
                )