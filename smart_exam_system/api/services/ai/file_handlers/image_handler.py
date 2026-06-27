import pytesseract
from PIL import Image

def extract_image_text(file):
    image = Image.open(file)
    text = pytesseract.image_to_string(image)
    return text