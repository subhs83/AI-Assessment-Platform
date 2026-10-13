import { useIsMobile } from "../../../../hooks/useIsMobile";
import { parseSolidGeometry } from "./solidgeometry/solidGeometryParser";
import { calculateSolidGeometryPositions } from "./solidgeometry/solidGeometryPositions";
import {   
    renderCube,
    renderCuboid,
    renderCylinder,
    renderCone,
    renderSphere,
    renderHemisphere,
    renderTriangularPrism,
    renderSquarePyramid,
    } from "./solidgeometry/solidGeometryRenderers";

export default function SolidGeometryVisual({ visual }) {
  const isMobile = useIsMobile();

  if (!visual) return null;

  const parsed = parseSolidGeometry(visual);

  const plane = parsed.valid
    ? calculateSolidGeometryPositions({ parsed, isMobile })
    : null;


    console.log("[SOLID DEBUG]", {
        figure: visual?.figure,
        valid: parsed.valid,
        parserError: parsed.error,
        dimensions: parsed.dimensionsByRole,
        plane,
        });
  if (!plane) {
    return (
      <div
        role="status"
        className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
      >
        This solid figure could not be displayed. Please review its
        dimension data.
      </div>
    );
  }

  const renderers = {
    cube: renderCube,
    cuboid: renderCuboid,
    cylinder: renderCylinder,
    cone: renderCone,
    sphere: renderSphere,
    hemisphere: renderHemisphere,
    triangular_prism: renderTriangularPrism,
    square_pyramid: renderSquarePyramid,
    };

const renderSolid = renderers[parsed.figure.subtype];

  return (
    <div className="my-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${plane.width} ${plane.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto block h-auto w-full max-w-xl"
        role="img"
        aria-label={`${parsed.figure.subtype} with given dimensions`}
      >
        {renderSolid(plane)}
      </svg>
    </div>
  );
}