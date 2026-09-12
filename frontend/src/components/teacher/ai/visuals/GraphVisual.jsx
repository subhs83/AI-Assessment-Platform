import { calculateNumberLinePositions, calculateBarGraphPositions, calculateLineGraphPositions } from "./graph/graphPositions";
import { renderNumberLine, renderBarGraph, renderLineGraph } from "./graph/graphRerenders";
import { getSvgDimensions } from "./geometry/geometryHelpers";
import { useIsMobile } from "../../../../hooks/useIsMobile";

export default function GraphVisual({ visual }) {
  const isMobile = useIsMobile();
  const { width, height } = getSvgDimensions(isMobile);

  if (!visual) return null;

  const figure = visual?.figure || { type: "generic" };
  const elements = visual?.elements || [];

  let plane = null;
  let positions = {};
  let content = null;

  if (figure.subtype === "number_line") {
    const result = calculateNumberLinePositions({ elements, figure, isMobile });
    positions = result.positions;
    plane = result;
    content = renderNumberLine(elements, positions, plane, isMobile);
  }

  else if (figure.subtype === "bar_graph") {
    const categories = visual?.categories || [];
    plane = calculateBarGraphPositions({ categories, figure: visual, isMobile });
    content = renderBarGraph(
      plane,
      visual?.title,
      visual?.x_axis_label,
      visual?.y_axis_label,
      isMobile
    );
  }

  // ⬇️ ADD THIS NEW BRANCH ⬇️
  else if (figure.subtype === "line_graph") {
    const series = visual?.series || [];
    plane = calculateLineGraphPositions({ series, isMobile });
    content = renderLineGraph(
      plane,
      visual?.x_axis_label,
      visual?.y_axis_label,
      isMobile
    );
  }
  // ⬆️ END NEW BRANCH ⬆️

  const DEBUG_GRAPH = true;

  if (DEBUG_GRAPH) {
    console.log("========== GRAPH DEBUG ==========");
    console.log("figure:", figure);
    console.log("elements:", elements);
    console.log("positions:", positions);
    console.log("plane:", plane);
    console.log("==================================");
  }

  if (!content) {
    return null;
  }

  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      {DEBUG_GRAPH && (
        <div className="mb-2 rounded bg-slate-900 p-2 text-xs text-white">
          Graph: {figure?.type || "generic"}, {figure?.subtype}
        </div>
      )}

      <div className="flex justify-center w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full max-w-xl text-slate-800 dark:text-slate-100 overflow-visible"
          role="img"
          aria-label="Graph figure"
        >
          {content}
        </svg>
      </div>
    </div>
  );
}