from pdf2image import convert_from_path
from smart_exam_system.config import Config

images = convert_from_path(
    "Hindi_language_ch3.pdf",
    poppler_path=Config.POPPLER_PATH,
)

print(f"Pages converted: {len(images)}")