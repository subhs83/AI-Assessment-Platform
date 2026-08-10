import json

from smart_exam_system.api.services.ai.ai_service import (
    generate_smart_analysis,
)

from smart_exam_system.api.services.document_analysis.analysis_report_builder import (
    AnalysisReportBuilder,
)

from smart_exam_system.api.services.document_analysis.smart_analysis_parser import (
    populate_builder,
)

def clean_json_response(response: str) -> str:
    response = response.strip()

    if response.startswith("```json"):
        response = response[len("```json"):].strip()
    elif response.startswith("```"):
        response = response[3:].strip()

    if response.endswith("```"):
        response = response[:-3].strip()

    return response


class SmartAnalysisService:

    @staticmethod
    def analyze(file, language):

        builder = AnalysisReportBuilder()

        response = generate_smart_analysis(
            file=file,
            language=language,
        )

        response = clean_json_response(response)
        

        print("\n========== RAW SMART ANALYSIS RESPONSE ==========")
        print(repr(response))
        print("=================================================\n")
        data = json.loads(response)

        populate_builder(builder, data)

        return builder.build()