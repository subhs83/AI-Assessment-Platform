import io
import time

import pdfplumber
from pdf2image import convert_from_bytes

from smart_exam_system.config import Config
from smart_exam_system.api.utils.ocr.image_ocr import (
    extract_text_from_image,
)
from smart_exam_system.api.utils.ocr.text_validator import (
    is_valid_pdf_text,
)


def extract_pdf_text(
    file,
    language,
    return_pages=False,
):
    """
    Extract text from PDF.

    Strategy:
    1. Try native PDF text extraction.
    2. If page has little/no text, OCR the page image.

    Args:
        return_pages (bool):
            False -> returns single string (backward compatible)
            True  -> returns list of page texts
    """

    pdf_bytes = file.read()

    pages = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:

        for page in pdf.pages:
            start = time.perf_counter()

            page_text = page.extract_text() or ""

            if is_valid_pdf_text(page_text):
                 
                page_content = page_text

            else:
                kwargs = {
                    "first_page": page.page_number,
                    "last_page": page.page_number,
                    "dpi": Config.PDF_RENDER_DPI,
                }

                if Config.POPPLER_PATH:
                    kwargs["poppler_path"] = Config.POPPLER_PATH

                image = convert_from_bytes(
                    pdf_bytes,
                    **kwargs,
                )[0]

                page_content = extract_text_from_image(
                    image,
                    language=language,
                )

                 

            pages.append(page_content.strip())

    if return_pages:
        return pages

    return "\n\n".join(pages)