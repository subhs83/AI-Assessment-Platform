from dataclasses import dataclass, field
from typing import List, Dict, Any


SCHEMA_VERSION = "3.0"


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
    figure_count: int = 0
    table_count: int = 0
    equation_count: int = 0
    graph_count: int = 0
    image_count: int = 0


# ==========================================================
# ASSET POSITION
# ==========================================================

@dataclass
class AssetBounds:
    """
    Bounding box of the asset on the original page image.

    Coordinates are pixels.
    """

    x: int = 0
    y: int = 0
    width: int = 0
    height: int = 0


# ==========================================================
# FIGURE
# ==========================================================

@dataclass
class Figure:
    """
    Educational visual such as:
    geometry diagram, Venn diagram, circuit,
    biology diagram, chemistry structure, etc.

    The original visual is preserved through its
    page bounding box. No SVG elements are generated
    by the AI.
    """

    id: str
    page_number: int

    type: str = ""

    description: str = ""

    crop_path: str = ""

    labels: List[str] = field(default_factory=list)

    bounds: AssetBounds = field(
        default_factory=AssetBounds
    )

    required_for_understanding: bool = False

    question_references: List[str] = field(
        default_factory=list
    )


# ==========================================================
# TABLE
# ==========================================================

@dataclass
class Table:
    """
    Structured table data.

    Frontend renders this as an actual HTML table.
    """

    id: str
    page_number: int

    description: str = ""

    columns: List[str] = field(
        default_factory=list
    )

    rows: List[List[str]] = field(
        default_factory=list
    )

    required_for_understanding: bool = False

    question_references: List[str] = field(
        default_factory=list
    )


# ==========================================================
# EQUATION
# ==========================================================

@dataclass
class Equation:
    """
    Mathematical, physics, or chemistry equation.
    """

    id: str
    page_number: int

    latex: str = ""

    description: str = ""

    type: str = ""

    required_for_understanding: bool = False

    question_references: List[str] = field(
        default_factory=list
    )


# ==========================================================
# GRAPH
# ==========================================================

@dataclass
class Graph:
    """
    Structured graph/chart information.

    Used when the graph data can be represented
    meaningfully as structured data.

    If exact visual appearance matters more than
    the data, the original page crop should be used.
    """

    id: str
    page_number: int

    type: str = ""

    description: str = ""

    crop_path: str = ""

    x_axis_label: str = ""

    y_axis_label: str = ""

    x_categories: List[str] = field(
        default_factory=list
    )

    series: List[Dict[str, Any]] = field(
        default_factory=list
    )

    bounds: AssetBounds = field(
        default_factory=AssetBounds
    )

    required_for_understanding: bool = False

    question_references: List[str] = field(
        default_factory=list
    )


# ==========================================================
# IMAGE
# ==========================================================

@dataclass
class Image:
    """
    Photograph / real-world / educational image.

    Original image is preserved through the page crop.
    """

    id: str
    page_number: int

    description: str = ""

    crop_path: str = ""

    bounds: AssetBounds = field(
        default_factory=AssetBounds
    )

    required_for_understanding: bool = False

    question_references: List[str] = field(
        default_factory=list
    )


# ==========================================================
# PAGE
# ==========================================================

@dataclass
class Page:
    page_number: int

    # Extracted/readable text from the page.
    source_text: str = ""

    heading: str = ""

    width: int = 0
    height: int = 0

    # Asset references belonging to this page.
    figure_ids: List[str] = field(
        default_factory=list
    )

    table_ids: List[str] = field(
        default_factory=list
    )

    equation_ids: List[str] = field(
        default_factory=list
    )

    graph_ids: List[str] = field(
        default_factory=list
    )

    image_ids: List[str] = field(
        default_factory=list
    )


# ==========================================================
# ASSET COLLECTION
# ==========================================================

@dataclass
class Assets:
    figures: List[Figure] = field(
        default_factory=list
    )

    tables: List[Table] = field(
        default_factory=list
    )

    equations: List[Equation] = field(
        default_factory=list
    )

    graphs: List[Graph] = field(
        default_factory=list
    )

    images: List[Image] = field(
        default_factory=list
    )


# ==========================================================
# ANALYSIS REPORT
# ==========================================================

@dataclass
class AnalysisReport:

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