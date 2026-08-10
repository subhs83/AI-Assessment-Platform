from smart_exam_system.api.services.document_analysis.text_analysis_service import (
    TextAnalysisService,
)

from smart_exam_system.api.services.document_analysis.smart_analysis_service import (
    SmartAnalysisService,
)

from smart_exam_system.api.services.ai.extractor import (
    extract_input,
)


class AnalysisService:
    """
    Entry point for all document analysis.

    Controllers should only call this service.
    """

    @staticmethod
    def analyze(
        mode,
        **kwargs,
    ):

        if mode == "text":

            extracted = extract_input(
                kwargs.get("data", {}),
                kwargs.get("file"),
            )

            if not extracted.get("success"):
                raise Exception(
                    extracted.get(
                        "message",
                        "Text extraction failed",
                    )
                )

            extracted_data = extracted["data"]

            return TextAnalysisService.analyze(
                pages=extracted_data["pages"],
                document_type=extracted_data["type"],
                language=extracted_data["language"],
            )


        if mode == "smart":

            return SmartAnalysisService.analyze(
                file=kwargs.get("file"),
                language=kwargs.get("language"),
            )


        raise ValueError(
            f"Unsupported analysis mode: {mode}"
        )