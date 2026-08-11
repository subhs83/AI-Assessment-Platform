import io

from PIL import Image
from pdf2image import convert_from_bytes

from smart_exam_system.config import Config


def render_document_pages(file):
    """
    Render an uploaded PDF/image into page images.

    PDF:
        Renders every PDF page to an image.

    Image:
        Uses the uploaded image as-is.

    Returns:
        list[dict]:
        [
            {
                "page_number": 1,
                "image": PIL.Image.Image,
            },
            ...
        ]
    """

    file.stream.seek(0)
    file_bytes = file.read()

    if not file_bytes:
        raise ValueError("Uploaded document is empty.")

    mime_type = getattr(file, "mimetype", "") or ""
    filename = getattr(file, "filename", "") or ""

    # ------------------------------------------------------
    # PDF
    # ------------------------------------------------------

    if mime_type == "application/pdf" or filename.lower().endswith(".pdf"):

        kwargs = {
            "dpi": Config.PDF_RENDER_DPI,
        }

        if Config.POPPLER_PATH:
            kwargs["poppler_path"] = Config.POPPLER_PATH

        rendered_pages = convert_from_bytes(
            file_bytes,
            **kwargs,
        )

        return [
            {
                "page_number": page_number,
                "image": image.convert("RGB"),
            }
            for page_number, image in enumerate(
                rendered_pages,
                start=1,
            )
        ]

    # ------------------------------------------------------
    # IMAGE
    # ------------------------------------------------------

    try:
        image = Image.open(io.BytesIO(file_bytes))

        # Force loading before the underlying BytesIO disappears.
        image.load()

        return [
            {
                "page_number": 1,
                "image": image.convert("RGB"),
            }
        ]

    except Exception as exc:
        raise ValueError(
            "Unsupported or invalid document image."
        ) from exc