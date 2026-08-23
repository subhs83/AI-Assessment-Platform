# api/services/ai/content_preparer.py

import re

import json


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





# def prepare_analysis_content(report):
#     """
#     Convert structured document analysis into an AI-friendly prompt.

#     The output is designed for LLMs (Gemini, GPT, Claude, etc.)
#     while remaining human-readable and token-efficient.
#     """

#     if not report:
#         return ""

#     lines = []

#     # ==========================================================
#     # DOCUMENT
#     # ==========================================================

#     document = report.get("document", {})

#     lines.append("DOCUMENT INFORMATION")
#     lines.append("=" * 50)

#     lines.append(
#         f"Document Type: {document.get('document_type', '')}"
#     )
#     lines.append(
#         f"Language: {document.get('language', '')}"
#     )
#     lines.append(
#         f"Pages: {document.get('page_count', 0)}"
#     )

#     if document.get("title"):
#         lines.append(
#             f"Title: {document['title']}"
#         )

#     if document.get("subject"):
#         lines.append(
#             f"Subject: {document['subject']}"
#         )

#     if document.get("class_name"):
#         lines.append(
#             f"Class: {document['class_name']}"
#         )

#     lines.append("")

#     # ==========================================================
#     # PAGES
#     # ==========================================================

#     assets = report.get("assets", {})

#     for page in report.get("pages", []):

#         lines.append("=" * 50)
#         lines.append(
#             f"PAGE {page['page_number']}"
#         )
#         lines.append("=" * 50)

#         if page.get("heading"):
#             lines.append(
#                 f"Heading: {page['heading']}"
#             )
#             lines.append("")

#         if page.get("source_text"):
#             lines.append("TEXT")
#             lines.append(page["source_text"].strip())
#             lines.append("")

#         # -------------------------
#         # Figures
#         # -------------------------

#         for figure_id in page.get("figure_ids", []):

#             figure = next(
#                 (
#                     f for f in assets.get("figures", [])
#                     if f.get("id") == figure_id
#                 ),
#                 None,
#             )

#             if not figure:
#                 continue

#             lines.append("FIGURE")

#             lines.append(
#                 f"Type: {figure.get('type', '')}"
#             )

#             lines.append(
#                 f"Description: {figure.get('description', '')}"
#             )

#             labels = figure.get("labels", [])

#             if labels:
#                 lines.append(
#                     "Labels: " +
#                     ", ".join(labels)
#                 )

#             lines.append("")

#         # -------------------------
#         # Tables
#         # -------------------------

#         for table_id in page.get("table_ids", []):

#             table = next(
#                 (
#                     t for t in assets.get("tables", [])
#                     if t.get("id") == table_id
#                 ),
#                 None,
#             )

#             if not table:
#                 continue

#             lines.append("TABLE")

#             if table.get("title"):
#                 lines.append(
#                     f"Title: {table['title']}"
#                 )

#             if table.get("content"):
#                 lines.append(
#                     table["content"]
#                 )

#             lines.append("")

#         # -------------------------
#         # Equations
#         # -------------------------

#         for equation_id in page.get("equation_ids", []):

#             equation = next(
#                 (
#                     e for e in assets.get("equations", [])
#                     if e.get("id") == equation_id
#                 ),
#                 None,
#             )

#             if not equation:
#                 continue

#             lines.append("EQUATION")

#             lines.append(
#                 equation.get("latex", "")
#             )

#             lines.append("")

#     return "\n".join(lines)