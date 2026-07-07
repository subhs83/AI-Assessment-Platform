from PIL import Image, ImageEnhance, ImageFilter
import pytesseract

from smart_exam_system.config import Config


def extract_image_text(file):
    image = Image.open(file)

    image = image.convert("L")

    image = ImageEnhance.Contrast(image).enhance(2.0)

    image = image.filter(ImageFilter.SHARPEN)

    image = image.point(
        lambda x: 255 if x > 140 else 0,
        mode="1",
    )

    text = pytesseract.image_to_string(
        image,
        lang=Config.OCR_LANGUAGES,
    )

    return text