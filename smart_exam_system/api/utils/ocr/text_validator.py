import re


def is_valid_pdf_text(text):
    """
    Determine whether text extracted by pdfplumber is usable.
    """

    if not text:
        return False

    text = text.strip()

    if len(text) < 30:
        return False

    total = len(text)

    # English letters
    english = len(re.findall(r"[A-Za-z]", text))

    # Devanagari (Hindi, Sanskrit, Marathi, Nepali)
    devanagari = len(re.findall(r"[\u0900-\u097F]", text))

    # Digits
    digits = len(re.findall(r"\d", text))

    valid_chars = english + devanagari + digits

    ratio = valid_chars / total

    return ratio >= 0.60