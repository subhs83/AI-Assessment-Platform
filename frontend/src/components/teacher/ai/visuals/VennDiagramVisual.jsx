import { calculateVennPositions } from "./venn/vennPositions";
import {renderVennDiagram, renderVennLegend } from "./venn/vennRender";

import { getSvgDimensions } from "./geometry/geometryHelpers";
import { useIsMobile } from "../../../../hooks/useIsMobile";

export default function VennDiagramVisual({ visual }) {
  const isMobile = useIsMobile();
  const { width, height } = getSvgDimensions(isMobile);

  if (!visual) return null;

  const figure = visual?.figure || {};
  const sets = visual?.sets || [];
  const regions = visual?.regions || [];

  const plane = calculateVennPositions({ sets, regions, figure, isMobile });
  const content = renderVennDiagram(plane, isMobile);

  if (!content) return null;

  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      {visual?.title && (
        <div className="mb-3 text-sm font-semibold text-slate-700">{visual.title}</div>
      )}
      {renderVennLegend(sets, isMobile)}
      <div className="flex justify-center w-full overflow-x-auto">
        
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-xl" role="img" aria-label="Venn diagram">
          {content}
        </svg>
      </div>
    </div>
  );
}