import { parseGeometry } from "./geometry/geometryParser";
import { detectGeometryFigure } from "./geometry/geometryDetector";
import { calculateGeometryPositions } from "./geometry/geometryPositions";

import { getSegmentEndpoints, getSvgDimensions } from "./geometry/geometryHelpers";
import { useIsMobile } from "../../../../hooks/useIsMobile"

import {
  renderSegment,
  renderPoints,
  renderAngles,
  renderCircles,
  renderCollinear,
  renderSegmentAnnotations,
} from "./geometry/geometryRenderers";

export default function GeometryVisual({ visual }) {
const isMobile = useIsMobile();
// 1. Dynamic Canvas Bounds
  // Mobile uses a squarer, padded box (360x280). Desktop uses the wide layout (520x160).
 const { width, height } = getSvgDimensions(isMobile);
  // 2. Dynamic Stroke & Text Weights
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
    isMobile
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
    <div className="my-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      {/* <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Figure
      </div> */}

      {DEBUG_GEOMETRY && (
        <div className="mb-2 rounded bg-slate-900 p-2 text-xs text-white">
          Figure: {figure?.type || "generic"}
        </div>
      )}

     <div className="flex justify-center w-full overflow-x-auto">

        <svg
          viewBox={`0 0 ${width} ${height}`}
          /* Added min-h-[200px] to prevent mobile vertical squishing and crisp rendering */
          className="h-auto w-full max-w-xl text-slate-800 dark:text-slate-100 overflow-visible"
          role="img"
          aria-label="Geometry figure"
        >
          
          {/* ------------------------------------------
              CIRCLES
            ------------------------------------------ */}
            

          {renderCircles(
            circles,
            points,
            positions,
            isMobile,

          )}

          {/* ------------------------------------------
              SEGMENTS / LINES / RAYS
             ------------------------------------------ */}

          {segments.map((segment, index) =>
            renderSegment(
              segment,
              index,
              positions,
              getSegmentEndpoints(segment, points),
              isMobile

            )
          )}


          {/* ------------------------------------------
                COLLINEAR RELATIONSHIPS
              ------------------------------------------ */}
            {renderCollinear(relationships, positions, isMobile)}


          {/* ------------------------------------------
              SEGMENT LABELS / LENGTH ANNOTATIONS
             ------------------------------------------ */}

          {renderSegmentAnnotations(
            segments,
            points,
            positions,
            getSegmentEndpoints,
             relationships,
             isMobile
            )}

          {/* ------------------------------------------
              ANGLES
             ------------------------------------------ */}

          {renderAngles(
            angles,
            points,
            positions,
            figure,
            isMobile
            )}

       

          {/* ------------------------------------------
              POINTS
             ------------------------------------------ */}

          {renderPoints(
            points,
            positions,
            relationships,
            segments,
            circles,
            isMobile
          )}

        </svg>

      </div>
    </div>
  );
}
