import { parseGeometry } from "./geometry/geometryParser";
import { calculateGeometryPositions } from "./geometry/geometryPositions";
import { calculateCoordinateGeometryPositions } from "./geometry/coordinateGeometryPositions";

import { getSegmentEndpoints, getSvgDimensions } from "./geometry/geometryHelpers";
import { useIsMobile } from "../../../../hooks/useIsMobile"

import {
  renderSegment,
  renderPoints,
  renderAngles,
  renderCircles,
  renderCollinear,
  renderArcs,
  renderSegmentAnnotations,
  renderCoordinateGrid,   // ⬅️ new import
} from "./geometry/geometryRenderers";

export default function GeometryVisual({ visual }) {
  const isMobile = useIsMobile();
  

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
    arcs,
  } = parsed;

  /*
   * --------------------------------------------------
   * DETECT FIGURE
   * --------------------------------------------------
   */
  const figure = visual?.figure || parsed?.figure || { type: "generic" };

  /*
   * --------------------------------------------------
   * CALCULATE POSITIONS
   * --------------------------------------------------
   * Branch based on figure.type: coordinate geometry uses a completely
   * different calculation model (real coordinates -> scaled plane ->
   * pixel positions), so it gets its own calculator, returning both
   * positions AND the plane config the grid renderer needs. Every
   * other figure type keeps using the existing schematic calculator,
   * which only ever returns positions.
   * --------------------------------------------------
   */
  const isCoordinateGeometry = figure?.type === "coordinate_geometry";

  let positions;
  let plane = null;

  if (isCoordinateGeometry) {
    const result = calculateCoordinateGeometryPositions({
      ...parsed,
      figure,
      isMobile,
      isCoordinateGeometry
    });
    positions = result.positions;
    plane = result.plane;
  } else {
    positions = calculateGeometryPositions({
      ...parsed,
      figure,
      isMobile,
      isCoordinateGeometry
    });
  }

  const { width, height } = getSvgDimensions(isMobile, isCoordinateGeometry);
  if (!visual) return null;

  /*
   * --------------------------------------------------
   * DEBUG
   * --------------------------------------------------
   */
  const DEBUG_GEOMETRY = true;

  if (DEBUG_GEOMETRY) {
    console.log("========== GEOMETRY DEBUG ==========");
    console.log("figure:", figure);
    console.log("isCoordinateGeometry:", isCoordinateGeometry);
    console.log("points:", Object.keys(points));
    console.log("segments:", segments.map((segment) => segment.id));
    console.log("angles:", angles);
    console.log("labels:", labels);
    console.log("relationships:", relationships);
    console.log("positions:", positions);
    console.log("plane:", plane);
    console.log("RAW CIRCLES:", circles);
    console.log("====================================");
  }

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */
  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      {DEBUG_GEOMETRY && (
        <div className="mb-2 rounded bg-slate-900 p-2 text-xs text-white">
          Figure: {figure?.type || "generic"}, {figure?.subtype}, {figure?.feature}
        </div>
      )}

      <div className="flex justify-center w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full max-w-xl text-slate-800 dark:text-slate-100 overflow-visible"
          role="img"
          aria-label="Geometry figure"
        >
          {/* ------------------------------------------
              COORDINATE GRID (only for coordinate_geometry figures)
             ------------------------------------------ */}
          {plane && renderCoordinateGrid(plane, isMobile)}

          {/* ------------------------------------------
              CIRCLES
            ------------------------------------------ */}
          {renderCircles(circles, points, positions, isMobile)}

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
              Render Arcs
             ------------------------------------------ */}
          {renderArcs(arcs, points, positions, relationships, angles, figure, isMobile)}

          {/* ------------------------------------------
              ANGLES
             ------------------------------------------ */}
          {renderAngles(angles, points, positions, relationships, isMobile)}

          {/* ------------------------------------------
              POINTS
             ------------------------------------------ */}
          {renderPoints(points, positions, relationships, segments, circles, angles, isMobile)}
        </svg>
      </div>
    </div>
  );
}