# api/services/ai/content_preparer.py

import re

def prepare_ai_content(text):
    """
    Clean extracted text before AI generation.

    Goals:
    - Preserve educational content structure
    - Preserve formulas, decimals, numbering
    - Remove excessive whitespace
    - Keep paragraphs intact
    - Prevent huge AI payloads
    """

    if not text:
        return ""

    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove trailing spaces on lines
    text = "\n".join(
        line.strip()
        for line in text.splitlines()
    )

    # Collapse excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Collapse repeated spaces/tabs
    text = re.sub(r"[ \t]+", " ", text)

    return text.strip()[:10000]