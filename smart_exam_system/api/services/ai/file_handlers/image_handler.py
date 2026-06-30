import pytesseract
from PIL import Image

def extract_image_text(file):
    image = Image.open(file)

    # Convert to RGB if needed
    image = image.convert("RGB")

    # Limit very large images
    image.thumbnail((2000, 2000))

    text = pytesseract.image_to_string(image)

    return text