import pdfplumber

from smart_exam_system.api.services.subscription_service import (
    get_school_limits,
)
from smart_exam_system.api.services.ai.extractor import extract_input


def extract_ai_input(
    school_id,
    data,
    file=None,
):
    """
    Validate uploaded AI input and extract its content.
    """

    if (
        file
        and file.filename.lower().endswith(".pdf")
    ):
        limits = get_school_limits(school_id)

        with pdfplumber.open(file) as pdf:

            if len(pdf.pages) > limits["max_pdf_pages"]:
                return {
                    "success": False,
                    "message": (
                        f"Your current plan allows a maximum of "
                        f"{limits['max_pdf_pages']} PDF pages per upload."
                    ),
                }

        file.seek(0)

    return extract_input(
        data=data,
        file=file,
    )