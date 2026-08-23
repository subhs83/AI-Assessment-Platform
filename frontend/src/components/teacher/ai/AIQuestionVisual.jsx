import GeometryVisual from "./visuals/GeometryVisual";
import GraphVisual from "./visuals/GraphVisual";

export default function AIQuestionVisual({
  visualType,
  visual,
}) {
  if (!visual || !visualType) {
    return null;
  }

  switch (visualType) {
    case "geometry":
      return <GeometryVisual visual={visual} />;

    case "graph":
      return <GraphVisual visual={visual} />;
      

    default:
      return null;
  }
}