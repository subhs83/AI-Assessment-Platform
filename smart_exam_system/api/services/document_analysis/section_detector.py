import re


SECTION_PATTERNS = [
    ("example", r"^example\s*\d*"),
    ("exercise", r"^exercise"),
    ("activity", r"^activity"),
    ("project", r"^project"),
    ("note", r"^note"),
    ("definition", r"^definition"),
    ("summary", r"^summary"),
    ("objective", r"^objective"),
]


def detect_sections(text):
    """
    Detect educational sections from page text.

    Returns:
    [
        {
            "type": "example",
            "title": "Example 4"
        },
        ...
    ]
    """

    sections = []

    if not text:
        return sections

    for line in text.splitlines():

        line = line.strip()

        if not line:
            continue

        lower = line.lower()

        for section_type, pattern in SECTION_PATTERNS:

            if re.match(pattern, lower):

                sections.append({
                    "type": section_type,
                    "title": line,
                })

                break

    return sections