import { useIsMobile } from "../../../../hooks/useIsMobile";
import { parseCompositeGeometry } from "./compositegeometry/compositeGeometryParser";
import { calculateCompositeGeometryPositions } from "./compositegeometry/compositeGeometryPositions";
import { renderJoinedRectangles } from "./compositegeometry/compositeGeometryRenderers";

export default function CompositeGeometryVisual({ visual }) {
  const isMobile = useIsMobile();

  if (!visual) return null;

  const parsed = parseCompositeGeometry(visual);

  const plane = parsed.valid
    ? calculateCompositeGeometryPositions({ parsed, isMobile })
    : null;

  if (!plane) {
    return (
      <div
        role="status"
        className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
      >
        This composite figure could not be displayed. Please review
        its dimensions and connections.
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
        aria-label={
          {
            joined_rectangles: "Composite figure formed from joined rectangles",
            rectangular_cutouts: "Composite figure with rectangular cutouts",
            crossing_paths: "Rectangular park with two crossing paths",
            boundary_path: "Rectangular park with a uniform boundary path",
            partitioned_rectangle: "Rectangle divided into labelled parts",
            unit_square_region: "Shape formed from equal squares",
            rectangle_semicircle: "Rectangle combined with semicircular additions or a cutout",
          }[parsed.figure.subtype] || "Composite geometry figure"
        }
      >
        {renderJoinedRectangles(plane)}
      </svg>
    </div>
  );
}