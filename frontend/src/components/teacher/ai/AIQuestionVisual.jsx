import GeometryVisual from "./visuals/GeometryVisual";
import GraphVisual from "./visuals/GraphVisual";
import DataTableVisual from "./visuals/DataTableVisual"; // to be built
import ChartVisual from "./visuals/ChartVisual"; // to be built
import VennDiagramVisual from "./visuals/VennDiagramVisual"; // to be built

export default function AIQuestionVisual({
  visualType,
  visual,
}) {
  if (!visual || !visualType) {
    return null;
  }

  switch (visualType) {
    case "geometry":
    case "coordinate_geometry":
      return <GeometryVisual visual={visual} />;

    case "graph":
      return <GraphVisual visual={visual} />;

    case "data_table":
      return <DataTableVisual visual={visual} />;

    case "chart":
      return <ChartVisual visual={visual} />;

    case "venn_diagram":
      return <VennDiagramVisual visual={visual} />;

    default:
      return null;
  }
}