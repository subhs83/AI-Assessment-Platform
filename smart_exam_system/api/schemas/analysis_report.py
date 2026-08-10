from dataclasses import dataclass, field
from typing import List, Dict, Any


SCHEMA_VERSION = "2.0"


# ==========================================================
# DOCUMENT
# ==========================================================

@dataclass
class DocumentInfo:
    analysis_mode: str = ""
    document_type: str = ""
    title: str = ""
    subject: str = ""
    class_name: str = ""
    language: str = ""
    page_count: int = 0


# ==========================================================
# SUMMARY
# ==========================================================

@dataclass
class Summary:
    topic_count: int = 0
    figure_count: int = 0
    table_count: int = 0
    equation_count: int = 0
    graph_count: int = 0
    image_count: int = 0


# ==========================================================
# FIGURE
# ==========================================================

@dataclass
class Figure:
    """
    Educational visual element such as:
    geometry diagram, science diagram, Venn diagram,
    flowchart, map, labelled illustration, pattern, etc.
    """

    id: str
    page_number: int

    # Type of visual figure.
    type: str = ""

    # What is visually represented.
    description: str = ""

    # Important visible labels.
    labels: List[str] = field(default_factory=list)

    # Important visible relationships or properties.
    # relationships: List[str] = field(default_factory=list)

    # Essential structured visual elements used
    # by the frontend for generic SVG rendering.
    elements: List[Dict[str, Any]] = field(default_factory=list)

    # True when the figure is required to understand
    # a question, concept, or instruction.
    required_for_understanding: bool = False

    question_references: List[str] = field(default_factory=list)

# ==========================================================
# TABLE
# ==========================================================

@dataclass
class Table:
    """
    Structured information presented in rows and columns.
    """

    id: str
    page_number: int

    description: str = ""

    columns: List[str] = field(default_factory=list)

    # Actual table data.
    # Each row should contain values corresponding
    # to the columns.
    rows: List[List[str]] = field(default_factory=list)

    # educational_purpose: str = ""

    required_for_understanding: bool = False

    question_references: List[str] = field(default_factory=list)


# ==========================================================
# EQUATION
# ==========================================================

@dataclass
class Equation:
    """
    Mathematical, scientific, physics, or chemical equation.
    """

    id: str
    page_number: int

    # Complete mathematical structure in LaTeX.
    latex: str = ""

    # Human-readable description of what the equation represents.
    description: str = ""

    # Optional classification.
    # Examples:
    # mathematical_expression
    # algebraic_equation
    # geometry_expression
    # physics_equation
    # chemical_equation
    # other
    type: str = ""

    question_references: List[str] = field(default_factory=list)


# ==========================================================
# GRAPH
# ==========================================================

@dataclass
class GraphSeries:
    """
    One plotted series in a graph.
    """

    name: str = ""

    # Values should correspond to x_categories
    # whenever categorical x-axis data is available.
    values: List[Any] = field(default_factory=list)

    x_values: List[Any] = field(default_factory=list)


@dataclass
class Graph:
    """
    Structured representation of a graph or chart.
    """

    id: str
    page_number: int

    # Examples:
    # bar_graph
    # line_graph
    # pie_chart
    # coordinate_graph
    # histogram
    # scatter_plot
    # other
    type: str = ""

    description: str = ""

    x_axis_label: str = ""
    y_axis_label: str = ""

    # Category labels on the X axis.
    x_categories: List[str] = field(default_factory=list)

    # Plotted data series.
    series: List[GraphSeries] = field(default_factory=list)

    # Visible legend entries.
    legend: List[str] = field(default_factory=list)

    # Visible scale information.
    x_scale: str = ""
    y_scale: str = ""

    # educational_purpose: str = ""

    required_for_understanding: bool = False

    question_references: List[str] = field(default_factory=list)


# ==========================================================
# IMAGE
# ==========================================================

@dataclass
class Image:
    """
    Educational photograph or real-world image.
    """

    id: str
    page_number: int

    # What the image visibly contains.
    description: str = ""

    # Important visible subjects, objects, or labels.
    subjects: List[str] = field(default_factory=list)

    # educational_purpose: str = ""

    required_for_understanding: bool = False

    question_references: List[str] = field(default_factory=list)


# ==========================================================
# PAGE
# ==========================================================

@dataclass
class Page:
    page_number: int

    # ======================================================
    # ORIGINAL PAGE CONTENT
    # ======================================================
    #
    # For Text Analysis:
    #   raw OCR text.
    #
    # For Smart Analysis:
    #   structured/readable page content extracted from
    #   the document while preserving educational meaning.
    #
    source_text: str = ""

    # ======================================================
    # PAGE UNDERSTANDING
    # ======================================================

    heading: str = ""

    # summary: str = ""

    # ======================================================
    # ASSET REFERENCES
    # ======================================================

    figure_ids: List[str] = field(default_factory=list)

    table_ids: List[str] = field(default_factory=list)

    equation_ids: List[str] = field(default_factory=list)

    graph_ids: List[str] = field(default_factory=list)

    image_ids: List[str] = field(default_factory=list)


# ==========================================================
# ASSET COLLECTION
# ==========================================================

@dataclass
class Assets:
    figures: List[Figure] = field(default_factory=list)

    tables: List[Table] = field(default_factory=list)

    equations: List[Equation] = field(default_factory=list)

    graphs: List[Graph] = field(default_factory=list)

    images: List[Image] = field(default_factory=list)


# ==========================================================
# ANALYSIS REPORT
# ==========================================================

@dataclass
class AnalysisReport:
    """
    Final document analysis contract.

    This schema is independent of the analysis method.
    Both Text Analysis and Smart Analysis produce the same
    report structure.
    """

    schema_version: str = SCHEMA_VERSION

    document: DocumentInfo = field(
        default_factory=DocumentInfo
    )

    summary: Summary = field(
        default_factory=Summary
    )

    pages: List[Page] = field(
        default_factory=list
    )

    assets: Assets = field(
        default_factory=Assets
    )

    generation: Dict[str, Any] = field(
        default_factory=dict
    )