
from smart_exam_system.api.services.document_analysis.analysis_report_builder import (
    AnalysisReportBuilder,
)


class TextAnalysisService:
    """
    Converts extracted text into the standard Analysis Report.
    This service performs NO OCR.
    """

    @staticmethod
    def analyze(
        pages,
        document_type,
        language,
        title="",
        subject="",
        class_name="",
    ):
        """
        Args:
            pages (list[str]):
                List of extracted page texts.

            document_type (str):
                topic | pdf | image | manual

            language (str):
                Document language.

        Returns:
            dict:
                Standard Analysis Report
        """

        builder = AnalysisReportBuilder()

        builder.set_document(
            analysis_mode="text",
            document_type=document_type,
            title=title,
            subject=subject,
            class_name=class_name,
            language=language,
            page_count=len(pages),
        )

        for page_number, text in enumerate(pages, start=1):

            builder.add_page(
                page_number=page_number,
                source_text=text.strip(),
            )

        return builder.build()