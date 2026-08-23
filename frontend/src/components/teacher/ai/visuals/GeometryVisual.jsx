import React from "react";

import { parseGeometry } from "./geometry/geometryParser";
import { detectGeometryFigure } from "./geometry/geometryDetector";
import { calculateGeometryPositions } from "./geometry/geometryPositions";

import { getSegmentEndpoints } from "./geometry/geometryHelpers";

import {
  renderSegment,
  renderPoints,
  renderAngles,
  renderCircles,
  renderCollinear,
  renderSegmentAnnotations,
} from "./geometry/geometryRenderers";

export default function GeometryVisual({ visual }) {
  if (!visual) return null;

  /*
   * --------------------------------------------------
   * PARSE
   * --------------------------------------------------
   */

  const parsed = parseGeometry(visual);

  const {
    points,
    segments,
    angles,
    labels,
    circles,
    relationships,
  } = parsed;

  /*
   * --------------------------------------------------
   * DETECT FIGURE
   * --------------------------------------------------
   */

  const figure = detectGeometryFigure(parsed);

  /*
   * --------------------------------------------------
   * CALCULATE POSITIONS
   * --------------------------------------------------
   */

  const positions = calculateGeometryPositions({
    ...parsed,
    figure,
  });

  /*
   * --------------------------------------------------
   * DEBUG
   * --------------------------------------------------
   */

  const DEBUG_GEOMETRY = false;

  if (DEBUG_GEOMETRY) {
    console.log(
      "========== GEOMETRY DEBUG =========="
    );

    console.log("figure:", figure);

    console.log(
      "points:",
      Object.keys(points)
    );

    console.log(
      "segments:",
      segments.map((segment) => segment.id)
    );

    console.log("angles:", angles);
    console.log("labels:", labels);
    console.log("relationships:", relationships);
    console.log("positions:", positions);
    console.log("RAW CIRCLES:", circles);

    console.log(
      "===================================="
    );
  }

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">

      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Figure
      </div>

      {DEBUG_GEOMETRY && (
        <div className="mb-2 rounded bg-slate-900 p-2 text-xs text-white">
          Figure: {figure?.type || "generic"}
        </div>
      )}

      <div className="flex justify-center">

        <svg
          viewBox="0 0 520 160"
          className="h-auto w-full max-w-xl text-slate-700"
          role="img"
          aria-label="Geometry figure"
        >
          
          {/* ------------------------------------------
              CIRCLES
            ------------------------------------------ */}
            

          {renderCircles(
            circles,
            points,
            positions
          )}

          {/* ------------------------------------------
              SEGMENTS / LINES / RAYS
             ------------------------------------------ */}

          {segments.map((segment, index) =>
            renderSegment(
              segment,
              index,
              positions,
              getSegmentEndpoints(
                segment,
                points
              )
            )
          )}


          {/* ------------------------------------------
                COLLINEAR RELATIONSHIPS
              ------------------------------------------ */}
            {renderCollinear(relationships, positions)}


          {/* ------------------------------------------
              SEGMENT LABELS / LENGTH ANNOTATIONS
             ------------------------------------------ */}

          {renderSegmentAnnotations(
            segments,
            points,
            positions,
            getSegmentEndpoints,
             relationships,
            )}

          {/* ------------------------------------------
              ANGLES
             ------------------------------------------ */}

          {renderAngles(
            angles,
            points,
            positions,
            figure
            )}

       

          {/* ------------------------------------------
              POINTS
             ------------------------------------------ */}

          {renderPoints(
            points,
            positions,
            relationships,
            segments,
            circles
          )}

        </svg>

      </div>
    </div>
  );
}