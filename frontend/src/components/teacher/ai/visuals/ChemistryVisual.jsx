
import { getSvgDimensions } from "./geometry/geometryHelpers";
import { useIsMobile } from "../../../../hooks/useIsMobile";

import {calculateLewisStructurePositions,} from "./chemistry/chemistyPositions"
import {renderLewisStructure,} from "./chemistry/chemistryRender"

export default function ChemistryVisual({ visual }) {
  const isMobile = useIsMobile();
  const { width, height } = getSvgDimensions(isMobile);

  if (!visual) return null;

  const figure = visual?.figure || {};
  const elements = visual?.elements || [];
  const relationships = visual?.relationships || [];

  let plane = null;
  let content = null;

    if (figure.subtype === "lewis_structure") {
        plane = calculateLewisStructurePositions({ elements, relationships, isMobile });
        content = renderLewisStructure(plane, relationships, figure, isMobile);
    }
 

  if (!content) return null;

  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      {visual?.title && (
        <div className="mb-3 text-sm font-semibold text-slate-700">{visual.title}</div>
      )}
      <div className="flex justify-center w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-xl" role="img" aria-label="Chemistry figure">
          {content}
        </svg>
      </div>
    </div>
  );
}