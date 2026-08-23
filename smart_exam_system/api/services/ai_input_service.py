# import pdfplumber

# from smart_exam_system.api.services.subscription_service import (
#     get_school_limits,
# )
# from smart_exam_system.api.services.ai.extractor import extract_input
# from smart_exam_system.api.services.document_analysis.analysis_service import (
#     AnalysisService,
# )
# from smart_exam_system.api.services.document_analysis.text_analysis_service import (
#     TextAnalysisService,
# )


# def extract_ai_input(
#     school_id,
#     data,
#     file=None,
# ):
#     """
#     Validate uploaded AI input and convert it into
#     a standard Analysis Report.
#     """

#     if (
#         file
#         and file.filename.lower().endswith(".pdf")
#     ):
#         limits = get_school_limits(school_id)

#         with pdfplumber.open(file) as pdf:

#             if len(pdf.pages) > limits["max_pdf_pages"]:
#                 return {
#                     "success": False,
#                     "message": (
#                         f"Your current plan allows a maximum of "
#                         f"{limits['max_pdf_pages']} PDF pages per upload."
#                     ),
#                 }

#         file.seek(0)

#     extracted = extract_input(
#         data=data,
#         file=file,
#     )

#     if not extracted.get("success"):
#         return extracted

#     analysis_mode = data.get(
#         "analysis_mode",
#         "text",
#     )

#     report = AnalysisService.analyze(
#         mode=analysis_mode,
#         pages=extracted["data"]["pages"],
#         document_type=extracted["data"]["type"],
#         language=extracted["data"]["language"],
#     )

#     return {
#         "success": True,
#         "data": report,
#     }