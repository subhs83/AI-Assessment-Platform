# from smart_exam_system.config import Config


# def extract_input(data, file=None):
#     """
#     Extract raw document content.

#     Supports:
#         1. Topic
#         2. PDF
#         3. Image

#     Returns:
#         {
#             "success": True,
#             "data": {
#                 "type": "...",
#                 "pages": [...],
#                 "language": "...",
#                 "filename": "...",
#             }
#         }
#     """

#     selected_language = data.get(
#         "language",
#         Config.DEFAULT_OCR_LANGUAGE,
#     )

#     # ---------------------------------------------------------
#     # Topic
#     # ---------------------------------------------------------

#     if data.get("topic"):
#         return {
#             "success": True,
#             "data": {
#                 "type": "topic",
#                 "pages": [
#                     data["topic"].strip()
#                 ],
#                 "language": selected_language,
#                 "filename": "",
#             },
#         }

#     # ---------------------------------------------------------
#     # PDF
#     # ---------------------------------------------------------

#     if file and file.filename.lower().endswith(".pdf"):

#         from smart_exam_system.api.utils.ocr.pdf_ocr import (
#             extract_pdf_text,
#         )

#         pages = extract_pdf_text(
#             file,
#             language=selected_language,
#             return_pages=True,
#         )

#         return {
#             "success": True,
#             "data": {
#                 "type": "pdf",
#                 "pages": pages,
#                 "language": selected_language,
#                 "filename": file.filename,
#             },
#         }

#     # ---------------------------------------------------------
#     # Image
#     # ---------------------------------------------------------

#     if file and file.filename.lower().endswith(
#         (".png", ".jpg", ".jpeg")
#     ):

#         from smart_exam_system.api.utils.ocr.image_ocr import (
#             extract_image_text,
#         )

#         text = extract_image_text(
#             file,
#             language=selected_language,
#         )

#         return {
#             "success": True,
#             "data": {
#                 "type": "image",
#                 "pages": [text],
#                 "language": selected_language,
#                 "filename": file.filename,
#             },
#         }

#     return {
#         "success": False,
#         "message": "Invalid input format",
#     }