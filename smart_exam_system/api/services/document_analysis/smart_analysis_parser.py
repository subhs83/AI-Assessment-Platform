from smart_exam_system.api.services.document_analysis.analysis_report_builder import (
    AnalysisReportBuilder,
)


def populate_builder(builder: AnalysisReportBuilder, data: dict):
    """
    Populate AnalysisReportBuilder from Gemini Smart Analysis JSON.
    """

    # ==========================================================
    # DOCUMENT
    # ==========================================================

    document = data.get("document", {})

    builder.set_document(
        analysis_mode=document.get("analysis_mode", "smart"),
        document_type=document.get("document_type", ""),
        title=document.get("title", ""),
        subject=document.get("subject", ""),
        class_name=document.get("class_name", ""),
        language=document.get("language", ""),
        page_count=document.get("page_count", 0),
    )

    # ==========================================================
    # SUMMARY
    # ==========================================================

    summary = data.get("summary", {})

    builder.set_summary(
        topic_count=summary.get("topic_count", 0),
        figure_count=summary.get("figure_count", 0),
        table_count=summary.get("table_count", 0),
        equation_count=summary.get("equation_count", 0),
        graph_count=summary.get("graph_count", 0),
        image_count=summary.get("image_count", 0),
    )

    # ==========================================================
    # PAGES
    # ==========================================================

    for page in data.get("pages", []):

        builder.add_page(
            page_number=page.get("page_number", 0),
            source_text=page.get("source_text", ""),
            heading=page.get("heading", ""),
            # summary=page.get("summary", ""),
            figure_ids=page.get("figure_ids", []),
            table_ids=page.get("table_ids", []),
            equation_ids=page.get("equation_ids", []),
            graph_ids=page.get("graph_ids", []),
            image_ids=page.get("image_ids", []),
        )

    # ==========================================================
    # FIGURES
    # ==========================================================

    for figure in data.get("assets", {}).get("figures", []):

        builder.add_figure(
            id=figure.get("id", ""),
            page_number=figure.get("page_number", 0),
            type=figure.get("type", ""),
            description=figure.get("description", ""),
            labels=figure.get("labels", []),
            # relationships=figure.get("relationships", []),
            elements=figure.get("elements", []),
            question_references=figure.get("question_references", []),
            # educational_purpose=figure.get("educational_purpose", ""),
            required_for_understanding=figure.get(
                "required_for_understanding",
                False,
            ),
        )

    # ==========================================================
    # TABLES
    # ==========================================================

    for table in data.get("assets", {}).get("tables", []):

        builder.add_table(
            id=table.get("id", ""),
            page_number=table.get("page_number", 0),
            description=table.get("description", ""),
            columns=table.get("columns", []),
            rows=table.get("rows", []),
            # educational_purpose=table.get(
            #     "educational_purpose",
            #     "",
            # ),
            question_references=table.get("question_references", []),
            required_for_understanding=table.get(
                "required_for_understanding",
                False,
            ),
        )

    # ==========================================================
    # EQUATIONS
    # ==========================================================

    for equation in data.get("assets", {}).get("equations", []):

        builder.add_equation(
            id=equation.get("id", ""),
            page_number=equation.get("page_number", 0),
            latex=equation.get("latex", ""),
            description=equation.get("description", ""),
            type=equation.get("type", ""),
            question_references=equation.get("question_references", []),
        )

    # ==========================================================
    # GRAPHS
    # ==========================================================

    for graph in data.get("assets", {}).get("graphs", []):

        builder.add_graph(
            id=graph.get("id", ""),
            page_number=graph.get("page_number", 0),
            type=graph.get("type", ""),
            description=graph.get("description", ""),
            x_axis_label=graph.get("x_axis_label", ""),
            y_axis_label=graph.get("y_axis_label", ""),
            x_categories=graph.get("x_categories", []),
            series=graph.get("series", []),
            legend=graph.get("legend", []),
            x_scale=graph.get("x_scale", ""),
            y_scale=graph.get("y_scale", ""),
            # educational_purpose=graph.get(
            #     "educational_purpose",
            #     "",
            # ),
            question_references=graph.get("question_references", []),
            required_for_understanding=graph.get(
                "required_for_understanding",
                False,
            ),
        )

    # ==========================================================
    # IMAGES
    # ==========================================================

    for image in data.get("assets", {}).get("images", []):

        builder.add_image(
            id=image.get("id", ""),
            page_number=image.get("page_number", 0),
            description=image.get("description", ""),
            subjects=image.get("subjects", []),
            # educational_purpose=image.get(
            #     "educational_purpose",
            #     "",
            # ),
            question_references=image.get("question_references", []),
            required_for_understanding=image.get(
                "required_for_understanding",
                False,
            ),
        )