from dataclasses import asdict

from smart_exam_system.api.schemas.analysis_report import (
    AnalysisReport,
    Page,
    Figure,
    Table,
    Equation,
    Graph,
    GraphSeries,
    Image,
)


class AnalysisReportBuilder:

    def __init__(self):
        self.report = AnalysisReport()

    # ---------------------------------------------------------
    # Document
    # ---------------------------------------------------------

    def set_document(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self.report.document, key):
                setattr(self.report.document, key, value)

    # ---------------------------------------------------------
    # Summary
    # ---------------------------------------------------------

    def set_summary(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self.report.summary, key):
                setattr(self.report.summary, key, value)

    # ---------------------------------------------------------
    # Pages
    # ---------------------------------------------------------

    def add_page(
        self,
        page_number,
        source_text="",
        heading="",
        # summary="",
        figure_ids=None,
        table_ids=None,
        equation_ids=None,
        graph_ids=None,
        image_ids=None,
    ):
        page = Page(
            page_number=page_number,
            source_text=source_text,
            heading=heading,
            # summary=summary,
            figure_ids=figure_ids or [],
            table_ids=table_ids or [],
            equation_ids=equation_ids or [],
            graph_ids=graph_ids or [],
            image_ids=image_ids or [],
        )

        self.report.pages.append(page)

    # ---------------------------------------------------------
    # Figures
    # ---------------------------------------------------------

    def add_figure(
        self,
        id,
        page_number,
        type="",
        description="",
        labels=None,
        # relationships=None,
        elements=None,
        # educational_purpose="",
        question_references=None,
        required_for_understanding=False,
    ):
        figure = Figure(
            id=id,
            page_number=page_number,
            type=type,
            description=description,
            labels=labels or [],
            # relationships=relationships or [],
            elements=elements or [],
            # educational_purpose=educational_purpose,
            question_references=question_references or [],
            required_for_understanding=required_for_understanding,
        )

        self.report.assets.figures.append(figure)

    # ---------------------------------------------------------
    # Tables
    # ---------------------------------------------------------

    def add_table(
        self,
        id,
        page_number,
        description="",
        columns=None,
        rows=None,
        # educational_purpose="",
        question_references=None,
        required_for_understanding=False,
    ):
        table = Table(
            id=id,
            page_number=page_number,
            description=description,
            columns=columns or [],
            rows=rows or [],
            # educational_purpose=educational_purpose,
            question_references=question_references or [],
            required_for_understanding=required_for_understanding,
        )

        self.report.assets.tables.append(table)

    # ---------------------------------------------------------
    # Equations
    # ---------------------------------------------------------

    def add_equation(
        self,
        id,
        page_number,
        latex="",
        description="",
        type="",
        question_references=None,
    ):
        equation = Equation(
            id=id,
            page_number=page_number,
            latex=latex,
            description=description,
            type=type,
            question_references=question_references or [],
        )

        self.report.assets.equations.append(equation)

    # ---------------------------------------------------------
    # Graphs
    # ---------------------------------------------------------

    def add_graph(
        self,
        id,
        page_number,
        type="",
        description="",
        x_axis_label="",
        y_axis_label="",
        x_categories=None,
        series=None,
        legend=None,
        x_scale="",
        y_scale="",
        x_values=None,
        # educational_purpose="",
        question_references=None,
        required_for_understanding=False,
    ):
        graph_series = []

        for item in series or []:

            if isinstance(item, GraphSeries):
                graph_series.append(item)

            elif isinstance(item, dict):
                graph_series.append(
                    GraphSeries(
                        name=item.get("name", ""),
                        values=item.get("values", []),
                        x_values=item.get("x_values", []),
                    )
                )

        graph = Graph(
            id=id,
            page_number=page_number,
            type=type,
            description=description,
            x_axis_label=x_axis_label,
            y_axis_label=y_axis_label,
            x_categories=x_categories or [],
            series=graph_series,
            legend=legend or [],
            x_scale=x_scale,
            y_scale=y_scale,
            # educational_purpose=educational_purpose,
            question_references=question_references or [],
            required_for_understanding=required_for_understanding,
        )

        self.report.assets.graphs.append(graph)

    # ---------------------------------------------------------
    # Images
    # ---------------------------------------------------------

    def add_image(
        self,
        id,
        page_number,
        description="",
        subjects=None,
        # educational_purpose="",
        question_references=None,
        required_for_understanding=False,
    ):
        image = Image(
            id=id,
            page_number=page_number,
            description=description,
            subjects=subjects or [],
            # educational_purpose=educational_purpose,
            question_references=question_references or [],
            required_for_understanding=required_for_understanding,
        )

        self.report.assets.images.append(image)

    # ---------------------------------------------------------
    # Build
    # ---------------------------------------------------------

    def build(self):
        return asdict(self.report)