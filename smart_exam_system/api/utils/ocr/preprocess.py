from PIL import Image, ImageEnhance, ImageFilter
from smart_exam_system.config import Config

def preprocess_image(image):
    """
    Improve image quality before OCR.
    """

    # Upscale image for better OCR
    # image = image.resize(
    #         (
    #             image.width * Config.OCR_SCALE_FACTOR,
    #             image.height * Config.OCR_SCALE_FACTOR,
    #         ),
    #         Image.Resampling.LANCZOS,
    # )

    # Convert to grayscale
    image = image.convert("L")

    # Increase contrast
    image = ImageEnhance.Contrast(image).enhance(Config.OCR_CONTRAST)


    # Sharpen text
    image = image.filter(ImageFilter.SHARPEN)

    # Convert to black & white
    # image = image.point(
    #     lambda x: 255 if x > Config.OCR_THRESHOLD else 0,
    #     mode="1",
    # )

    return image