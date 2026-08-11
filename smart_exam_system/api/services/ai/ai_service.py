import time
import tempfile
import os

from flask import current_app
from google import genai
from google.genai.errors import ServerError

from smart_exam_system.api.services.ai.prompt_builder import (
    build_question_prompt,
)

import logging

logger = logging.getLogger(__name__)


def generate_from_gemini(
    content=None,
    file=None,
    difficulty="medium",
    blooms_level="mixed",
    question_count=5,
    language="english",
):
    """
    Generate questions directly using Gemini.

    Text input:
        content -> Gemini text generation

    File input:
        file -> original PDF/image uploaded directly to Gemini

    No OCR or page rendering is performed here.
    """

    if not content and file is None:
        raise ValueError(
            "No content or file provided for AI generation."
        )

    client = genai.Client(
        api_key=current_app.config["GEMINI_API_KEY"]
    )

    generation_prompt = build_question_prompt(
        content=content or "",
        language=language,
        difficulty=difficulty,
        blooms_level=blooms_level,
        question_count=question_count,
    )

    uploaded_file = None
    temp_file_path = None

    try:

        # --------------------------------------------------
        # Upload original PDF / image
        # --------------------------------------------------

        if file is not None:

            suffix = ""

            if file.filename:
                suffix = os.path.splitext(
                    file.filename
                )[1]

            temp_file = tempfile.NamedTemporaryFile(
                delete=False,
                suffix=suffix,
            )

            temp_file_path = temp_file.name
            temp_file.close()

            file.save(temp_file_path)

            mime_type = getattr(
                file,
                "mimetype",
                None,
            )

            if not mime_type:

                extension = suffix.lower()

                if extension == ".pdf":
                    mime_type = "application/pdf"

                elif extension in (
                    ".jpg",
                    ".jpeg",
                ):
                    mime_type = "image/jpeg"

                elif extension == ".png":
                    mime_type = "image/png"

                else:
                    raise ValueError(
                        "Unsupported file format."
                    )

            uploaded_file = client.files.upload(
                file=temp_file_path,
                config={
                    "mime_type": mime_type,
                },
            )

        # --------------------------------------------------
        # Gemini Question Generation
        # --------------------------------------------------

        max_retries = 3

        for attempt in range(max_retries):

            try:

                # PDF / Image
                if uploaded_file is not None:

                    response = (
                        client.models.generate_content(
                            model="gemini-2.5-flash",
                            contents=[
                                generation_prompt,
                                uploaded_file,
                            ],
                        )
                    )

                # Topic / Text
                else:

                    response = (
                        client.models.generate_content(
                            model="gemini-2.5-flash",
                            contents=generation_prompt,
                        )
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

        raise

    finally:

        # --------------------------------------------------
        # Delete Gemini uploaded file
        # --------------------------------------------------

        if uploaded_file is not None:

            try:

                client.files.delete(
                    name=uploaded_file.name,
                )

            except Exception:

                current_app.logger.warning(
                    "Failed to delete Gemini uploaded file."
                )

        # --------------------------------------------------
        # Delete temporary original file
        # --------------------------------------------------

        if (
            temp_file_path
            and os.path.exists(temp_file_path)
        ):

            try:
                os.remove(temp_file_path)

            except Exception:

                current_app.logger.warning(
                    "Failed to remove temporary upload file."
                )
