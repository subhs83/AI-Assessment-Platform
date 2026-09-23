import { getSvgDimensions } from "../geometry/geometryHelpers";
import MathText from "../../../../common/MathText"
/*
 * ------------------------------------------
 * SHARED VECTOR (ARROW) RENDERER
 * ------------------------------------------
 * The one building block every physics diagram type reuses: draws an
 * arrow from (x, y) at a given angle (degrees, standard math
 * convention: 0=right, 90=up, 180=left, 270=down) and qualitative
 * length, with a label placed just beyond the arrowhead.
 */

const LENGTH_PX = {
  short: 24,
  medium: 30,
  long: 50,
};




export function computeVectorEndpoint(x, y, angleDeg, length = "medium") {
  const px = LENGTH_PX[length] || LENGTH_PX.medium;
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: x + Math.cos(rad) * px,
    y: y - Math.sin(rad) * px,
  };
}



export function renderVector({ x, y, angleDeg, length = "medium", label, color = "#D85A30", dashed = false }, isMobile = false) {
  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const end = computeVectorEndpoint(x, y, angleDeg, length);

  const rad = (angleDeg * Math.PI) / 180;
  const labelOffset = 14;
  const labelX = end.x + Math.cos(rad) * labelOffset;
  const labelY = end.y - Math.sin(rad) * labelOffset;

  // Rough label box sizing so the foreignObject has room for the
  // rendered math without clipping — generous since KaTeX output
  // width is hard to predict exactly from the raw string length.
  const labelBoxWidth = Math.max(30, (label?.length || 0) * (fontSize * 0.85));
  const labelBoxHeight = fontSize * 1.8;
  const anchorLeft = Math.cos(rad) >= 0;

  // foreignObject's x/y is its TOP-LEFT corner, so offset depending on
  // which side the text should visually anchor toward, mirroring the
  // previous textAnchor="start"/"end" behavior.
  const fbX = anchorLeft ? labelX : labelX - labelBoxWidth;
  const fbY = labelY - labelBoxHeight / 2;

  return (
    <g>
      <line
        x1={x} y1={y} x2={end.x} y2={end.y}
        stroke={color}
        strokeWidth={strokeWidth * 1.3}
        strokeDasharray={dashed ? "6,4" : undefined}
        vectorEffect="non-scaling-stroke"
        markerEnd="url(#physics-arrow)"
      />

      {label && (
        <foreignObject x={fbX} y={fbY} width={labelBoxWidth} height={labelBoxHeight} overflow="visible">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: anchorLeft ? "flex-start" : "flex-end",
              height: "100%",
              fontSize: fontSize * (isMobile ? 1 : 1.15),
              color,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            <MathText text={label} />
          </div>
        </foreignObject>
      )}
    </g>
  );
}

export function renderArrowMarkerDefs() {
  return (
    <defs>
      <marker id="physics-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" markerUnits="userSpaceOnUse" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="context-stroke" />
      </marker>
    </defs>
  );
}


