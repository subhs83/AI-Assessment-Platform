import pytesseract
from PIL import Image

from smart_exam_system.config import Config
from smart_exam_system.api.utils.ocr.preprocess import preprocess_image


def extract_text_from_image(image, language):
    """
    OCR from a PIL Image.
    """

    image.thumbnail(Config.OCR_IMAGE_MAX_SIZE)

    image = preprocess_image(image)
    ocr_lang = Config.OCR_LANGUAGE_MAP.get(
        language,
        Config.OCR_LANGUAGE_MAP[Config.DEFAULT_OCR_LANGUAGE],
    )
    # print("Tesseract lang:", ocr_lang)
    return pytesseract.image_to_string(
    image,
    lang = ocr_lang,
    config="--oem 3 --psm 6",
)


def extract_image_text(file, language):


    """
    OCR from uploaded image file.
    """

    image = Image.open(file)

    return extract_text_from_image(image, language)