from dataclasses import asdict

from smart_exam_system.api.schemas.analysis_report import (
AnalysisReport,
Page,
Figure,
Table,
Equation,
Graph,
Image,
AssetBounds,
)

class AnalysisReportBuilder:


    def __init__(self):
        self.report = AnalysisReport()

    # =========================================================
    # DOCUMENT
    # =========================================================

    def set_document(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self.report.document, key):
                setattr(self.report.document, key, value)

    # =========================================================
    # SUMMARY
    # =========================================================

    def set_summary(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self.report.summary, key):
                setattr(self.report.summary, key, value)

    # =========================================================
    # PAGES
    # =========================================================

    def add_page(
        self,
        page_number,
        source_text="",
        heading="",
        figure_ids=None,
        table_ids=None,
        equation_ids=None,
        graph_ids=None,
        image_ids=None,
        width=0,
        height=0
    ):
        page = Page(
            page_number=page_number,
            source_text=source_text,
            heading=heading,
            width=width,
            height=height,
            figure_ids=figure_ids or [],
            table_ids=table_ids or [],
            equation_ids=equation_ids or [],
            graph_ids=graph_ids or [],
            image_ids=image_ids or [],
        )

        self.report.pages.append(page)

    # =========================================================
    # FIGURES
    # =========================================================

    def add_figure(
        self,
        id,
        page_number,
        type="",
        description="",
        crop_path="",
        labels=None,
        bounds=None,
        required_for_understanding=False,
        question_references=None,
    ):
        if isinstance(bounds, AssetBounds):
            asset_bounds = bounds
        elif isinstance(bounds, dict):
            asset_bounds = AssetBounds(
                x=bounds.get("x", 0),
                y=bounds.get("y", 0),
                width=bounds.get("width", 0),
                height=bounds.get("height", 0),
            )
        else:
            asset_bounds = AssetBounds()

        figure = Figure(
            id=id,
            page_number=page_number,
            type=type,
            description=description,
            crop_path=crop_path,
            labels=labels or [],
            bounds=asset_bounds,
            required_for_understanding=required_for_understanding,
            question_references=question_references or [],
        )

        self.report.assets.figures.append(figure)

    # =========================================================
    # TABLES
    # =========================================================

    def add_table(
        self,
        id,
        page_number,
        description="",
        columns=None,
        rows=None,
        required_for_understanding=False,
        question_references=None,
    ):
        table = Table(
            id=id,
            page_number=page_number,
            description=description,
            columns=columns or [],
            rows=rows or [],
            required_for_understanding=required_for_understanding,
            question_references=question_references or [],
        )

        self.report.assets.tables.append(table)

    # =========================================================
    # EQUATIONS
    # =========================================================

    def add_equation(
        self,
        id,
        page_number,
        latex="",
        description="",
        type="",
        required_for_understanding=False,
        question_references=None,
    ):
        equation = Equation(
            id=id,
            page_number=page_number,
            latex=latex,
            description=description,
            type=type,
            required_for_understanding=required_for_understanding,
            question_references=question_references or [],
        )

        self.report.assets.equations.append(equation)

    # =========================================================
    # GRAPHS
    # =========================================================

    def add_graph(
        self,
        id,
        page_number,
        type="",
        description="",
        crop_path="",
        x_axis_label="",
        y_axis_label="",
        x_categories=None,
        series=None,
        bounds=None,
        required_for_understanding=False,
        question_references=None,
    ):
        if isinstance(bounds, AssetBounds):
            asset_bounds = bounds
        elif isinstance(bounds, dict):
            asset_bounds = AssetBounds(
                x=bounds.get("x", 0),
                y=bounds.get("y", 0),
                width=bounds.get("width", 0),
                height=bounds.get("height", 0),
            )
        else:
            asset_bounds = AssetBounds()

        graph = Graph(
            id=id,
            page_number=page_number,
            type=type,
            description=description,
            x_axis_label=x_axis_label,
            y_axis_label=y_axis_label,
            x_categories=x_categories or [],
            series=series or [],
            crop_path=crop_path,
            bounds=asset_bounds,
            required_for_understanding=required_for_understanding,
            question_references=question_references or [],
        )

        self.report.assets.graphs.append(graph)

    # =========================================================
    # IMAGES
    # =========================================================

    def add_image(
        self,
        id,
        page_number,
        description="",
        crop_path="",
        bounds=None,
        required_for_understanding=False,
        question_references=None,
    ):
        if isinstance(bounds, AssetBounds):
            asset_bounds = bounds
        elif isinstance(bounds, dict):
            asset_bounds = AssetBounds(
                x=bounds.get("x", 0),
                y=bounds.get("y", 0),
                width=bounds.get("width", 0),
                height=bounds.get("height", 0),
            )
        else:
            asset_bounds = AssetBounds()

        image = Image(
            id=id,
            page_number=page_number,
            description=description,
            crop_path=crop_path,
            bounds=asset_bounds,
            required_for_understanding=required_for_understanding,
            question_references=question_references or [],
        )

        self.report.assets.images.append(image)

    # =========================================================
    # BUILD
    # =========================================================

    def build(self):
        return asdict(self.report)
