import { calculatePieChartPositions, renderPieChart, renderPieChartLegend } from "./chart/chartPositions";
import { getSvgDimensions } from "./geometry/geometryHelpers";
import { useIsMobile } from "../../../../hooks/useIsMobile";

export default function ChartVisual({ visual }) {
  const isMobile = useIsMobile();
  const { width, height } = getSvgDimensions(isMobile);

  if (!visual) return null;

  const figure = visual?.figure || {};
  const elements = visual?.elements || [];

  let content = null;
  let plane = null;

  if (figure.subtype === "pie" || figure.subtype === "donut") {
    plane = calculatePieChartPositions({ elements, isMobile });
    content = renderPieChart(plane, figure.subtype === "donut", isMobile);
  }

  if (!content) return null;

  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      {/* {visual?.title && (
        <div className="mb-3 text-sm font-semibold text-slate-700">{visual.title}</div>
      )} */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-4 w-full overflow-x-auto">
        <div className="flex justify-center w-full sm:w-auto sm:flex-1 sm:max-w-lg">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Chart figure">
            {content}
          </svg>
        </div>

        {plane && (
          <div className="w-full sm:w-auto sm:flex-shrink-0">
            {renderPieChartLegend(plane.slices, isMobile)}
          </div>
        )}
      </div>
    </div>
  );
}