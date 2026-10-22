// ConicSectionVisual.jsx

import { useIsMobile } from "../../../../hooks/useIsMobile";
import { parseConicSection } from "./conicsection/conicSectionParser";
import { calculateConicSectionPositions } from "./conicsection/conicSectionPositions";
import { renderConicSection } from "./conicsection/conicSectionRenderers";

export default function ConicSectionVisual({ visual }) {
  const isMobile = useIsMobile();

  if (!visual) return null;

  const parsed = parseConicSection(visual);

  const plane = parsed.valid
    ? calculateConicSectionPositions({ parsed, isMobile })
    : null;

  const DEBUG_CONIC = false;

  if (DEBUG_CONIC) {
    console.log("[CONIC DEBUG]", {
      figure: visual.figure,
      valid: parsed.valid,
      error: parsed.error,
      conic: parsed.conic,
      plane,
    });
  }

  if (!plane) {
    return (
      <div
        role="status"
        className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
      >
        This conic figure could not be displayed. Please review
        its parameters, bounds, and annotations.
      </div>
    );
  }

  return (
    <div className="my-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${plane.width} ${plane.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto block h-auto w-full max-w-xl"
        role="img"
        aria-label="Conic curve on Cartesian axes"
      >
        {renderConicSection(plane)}
      </svg>
    </div>
  );
}