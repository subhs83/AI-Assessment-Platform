import pdfplumber
from pdf2image import convert_from_bytes
import io
from smart_exam_system.config import Config
from smart_exam_system.api.utils.ocr.image_ocr import extract_text_from_image
from smart_exam_system.api.utils.ocr.text_validator import is_valid_pdf_text


def extract_pdf_text( file, language,):

    """
    Extract text from PDF.

    Strategy:
    1. Try native PDF text extraction.
    2. If page has little/no text, OCR the page image.
    """

    pdf_bytes = file.read()

    text = ""

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:

        for page in pdf.pages:

            page_text = page.extract_text() or ""

            if is_valid_pdf_text(page_text):
                print(f"Page {page.page_number}: Native PDF text extracted.")
                text += page_text + "\n\n"

            else:
                print(f"Page {page.page_number}: OCR fallback.")

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

                text += (
                    extract_text_from_image(
                        image,
                        language=language,
                    )
                    + "\n\n"
                )

    return text