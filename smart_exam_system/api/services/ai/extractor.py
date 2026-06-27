def extract_input(data, file=None):
    """
    Supports:
    1. topic (text)
    2. pdf upload
    3. image upload
    """

    # CASE 1: Topic-based
    if data.get("topic"):
        return {
            "success": True,
            "data": {
                "type": "topic",
                "content": data["topic"]
            }
        }

    # CASE 2: PDF
    if file and file.filename.endswith(".pdf"):
        from .file_handlers.pdf_handler import extract_pdf_text

        text = extract_pdf_text(file)

        return {
            "success": True,
            "data": {
                "type": "pdf",
                "content": text
            }
        }

    # CASE 3: Image
    if file and file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        from .file_handlers.image_handler import extract_image_text

        text = extract_image_text(file)

        return {
            "success": True,
            "data": {
                "type": "image",
                "content": text
            }
        }

    return {
        "success": False,
        "message": "Invalid input format"
    }