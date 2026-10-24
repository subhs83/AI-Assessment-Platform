// ConicSectionVisual.jsx

import { useCallback, useState } from "react";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import { parseConicSection } from "./conicsection/conicSectionParser";
import { calculateConicSectionPositions } from "./conicsection/conicSectionPositions";
import { renderConicSection } from "./conicsection/conicSectionRenderers";

export default function ConicSectionVisual({ visual }) {
  const isMobile = useIsMobile();

  // ADDED: actual dimensions of the rendered annotation labels.
  const [labelMeasurements, setLabelMeasurements] = useState({});

  const handleLabelMeasure = useCallback((id, measurement) => {
    setLabelMeasurements((previous) => {
      const existing = previous[id];

      if (
        existing?.text === measurement.text &&
        existing?.fontSize === measurement.fontSize &&
        existing?.width === measurement.width &&
        existing?.height === measurement.height
      ) {
        return previous;
      }

      return {
        ...previous,
        [id]: measurement,
      };
    });
  }, []);

  if (!visual) return null;

  const parsed = parseConicSection(visual);

  const plane = parsed.valid
    ? calculateConicSectionPositions({
        parsed,
        isMobile,
        labelMeasurements, // ADDED
      })
    : null;

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
        {renderConicSection(plane, handleLabelMeasure)}
      </svg>
    </div>
  );
}