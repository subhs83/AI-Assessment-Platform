
import { getSvgDimensions } from "../../geometry/geometryHelpers";
import MathText from "../../../../../common/MathText"

////////////////////////////////////////////
//////////// RAY OPTICS  //////////////////
///////////////////////////////////////////

// in renderVector.js — additive, doesn't change existing callers
export function renderVectorToPoint({ x, y, toX, toY, label, color = "#D85A30", dashed = false }, isMobile = false) {
  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const angleDeg = (Math.atan2(y - toY, toX - x) * 180) / Math.PI; // for label-side placement only
  const rad = (angleDeg * Math.PI) / 180;
  const labelOffset = 14;
  const labelX = toX + Math.cos(rad) * labelOffset;
  const labelY = toY - Math.sin(rad) * labelOffset;
  const labelBoxWidth = Math.max(30, (label?.length || 0) * (fontSize * 0.85));
  const labelBoxHeight = fontSize * 1.8;
  const anchorLeft = Math.cos(rad) >= 0;
  const fbX = anchorLeft ? labelX : labelX - labelBoxWidth;
  const fbY = labelY - labelBoxHeight / 2;

  return (
    <g>
       <line x1={x} y1={y} x2={toX} y2={toY} stroke={color} strokeWidth={strokeWidth * 1.3}
          strokeDasharray={dashed ? "6,4" : undefined} vectorEffect="non-scaling-stroke" />
        {renderEndArrow(x, y, toX, toY, color)}
      {label && (
        <foreignObject x={fbX} y={fbY} width={labelBoxWidth} height={labelBoxHeight} overflow="visible">
          <div style={{ display: "flex", alignItems: "center", justifyContent: anchorLeft ? "flex-start" : "flex-end", height: "100%", fontSize: fontSize * (isMobile ? 1 : 1.15), color, fontWeight: 600, whiteSpace: "nowrap" }}>
            <MathText text={label} />
          </div>
        </foreignObject>
      )}
    </g>
  );
}


export function renderLensSymbol(lensX, topY, bottomY, strokeWidth) {
  const midY = (topY + bottomY) / 2;
  const bulge = (bottomY - topY) * 0.12;
  const pathD = `M ${lensX} ${topY} Q ${lensX + bulge} ${midY} ${lensX} ${bottomY} Q ${lensX - bulge} ${midY} ${lensX} ${topY} Z`;

  return (
    <g>
      <path d={pathD} fill="url(#lens-glass-gradient)" stroke="#1F6E8C" strokeWidth={strokeWidth * 1.3} strokeLinejoin="round" />
      <path
        d={`M ${lensX - bulge * 0.3} ${topY + (bottomY - topY) * 0.18}
            Q ${lensX + bulge * 0.15} ${topY + (bottomY - topY) * 0.32} ${lensX - bulge * 0.3} ${topY + (bottomY - topY) * 0.46}`}
        fill="none" stroke="#FFFFFF" strokeWidth={strokeWidth * 0.8} strokeOpacity={0.55} strokeLinecap="round"
      />
    </g>
  );
}

export function renderConcaveMirrorSymbol(mirrorX, topY, bottomY, strokeWidth) {
  const midY = (topY + bottomY) / 2;
  const bulge = (bottomY - topY) * 0.15;
  const archD = `M ${mirrorX} ${topY} Q ${mirrorX + bulge} ${midY} ${mirrorX} ${bottomY}`;

  const hatchCount = 7;
  const hatches = Array.from({ length: hatchCount + 1 }, (_, i) => {
    const t = i / hatchCount;
    const y = topY + t * (bottomY - topY);
    const archX = (1 - t) ** 2 * mirrorX + 2 * (1 - t) * t * (mirrorX + bulge) + t ** 2 * mirrorX;
    return (
      <line key={i} x1={archX} y1={y} x2={archX + bulge * 0.9} y2={y}
        stroke={OPTICS_COLORS.marker} strokeWidth={strokeWidth * 0.9} strokeOpacity={0.5} />
    );
  });

  return (
    <g>
      <path d={archD} fill="none" stroke="url(#mirror-reflective-gradient)" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" />
      {hatches}
    </g>
  );
}


export function renderConcaveLensSymbol(lensX, topY, bottomY, strokeWidth) {
  const midY = (topY + bottomY) / 2;
  const halfWidth = (bottomY - topY) * 0.12;
  const pinchWidth = halfWidth * 0.25;
  const capCurve = halfWidth * 0.15; // small outward bow on the top/bottom edges — no straight lines anywhere

  const pathD = `
    M ${lensX - halfWidth} ${topY}
    Q ${lensX - pinchWidth} ${midY} ${lensX - halfWidth} ${bottomY}
    Q ${lensX} ${bottomY + capCurve} ${lensX + halfWidth} ${bottomY}
    Q ${lensX + pinchWidth} ${midY} ${lensX + halfWidth} ${topY}
    Q ${lensX} ${topY - capCurve} ${lensX - halfWidth} ${topY}
    Z
  `;

  return (
    <path d={pathD} fill="url(#lens-glass-gradient)" fillOpacity={0.5} stroke="#1F6E8C" strokeWidth={strokeWidth * 1.3} strokeLinejoin="round" />
  );
}


export function renderDimensionLine(x1, x2, y, label, strokeWidth, fontSize) {
  const [xa, xb] = x1 < x2 ? [x1, x2] : [x2, x1];
  return (
    <g>
      <line x1={xa} y1={y - 10} x2={xa} y2={y + 4} stroke={OPTICS_COLORS.axis} strokeWidth={strokeWidth * 0.6} strokeOpacity={0.6} />
      <line x1={xb} y1={y - 10} x2={xb} y2={y + 4} stroke={OPTICS_COLORS.axis} strokeWidth={strokeWidth * 0.6} strokeOpacity={0.6} />
      <line x1={xa} y1={y} x2={xb} y2={y} stroke={OPTICS_COLORS.axis} strokeWidth={strokeWidth * 0.8}
        markerStart="url(#dim-arrow-start)" markerEnd="url(#dim-arrow-end)" />
      {renderMathLabel((xa + xb) / 2, y + 18, label, fontSize, OPTICS_COLORS.axis)}
    </g>
  );
}

export function renderVerticalDimensionLine(x, y1, y2, label, strokeWidth, fontSize) {
  const [ya, yb] = y1 < y2 ? [y1, y2] : [y2, y1];
  return (
    <g>
      <line x1={x - 10} y1={ya} x2={x + 4} y2={ya} stroke={OPTICS_COLORS.axis} strokeWidth={strokeWidth * 0.6} strokeOpacity={0.6} />
      <line x1={x - 10} y1={yb} x2={x + 4} y2={yb} stroke={OPTICS_COLORS.axis} strokeWidth={strokeWidth * 0.6} strokeOpacity={0.6} />
      <line x1={x} y1={ya} x2={x} y2={yb} stroke={OPTICS_COLORS.axis} strokeWidth={strokeWidth * 0.8}
        markerStart="url(#dim-arrow-start)" markerEnd="url(#dim-arrow-end)" />
      {renderMathLabel(x + 20, (ya + yb) / 2, label, fontSize, OPTICS_COLORS.axis)}
    </g>
  );
}

// add near renderDimensionLine / OPTICS_COLORS — shared across the optics family
export function renderMathLabel(x, y, text, fontSize, color = "#1E293B") {
  const boxWidth = Math.max(30, (text?.length || 0) * (fontSize * 0.85));
  const boxHeight = fontSize * 1.8;
  return (
    <foreignObject x={x - boxWidth / 2} y={y - boxHeight / 2} width={boxWidth} height={boxHeight} overflow="visible">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize, color, fontWeight: 600, whiteSpace: "nowrap" }}>
        <MathText text={text} />
      </div>
    </foreignObject>
  );
}


// new helper — converts a vector to the same angle convention pointAt() expects
export function angleOfVector(dx, dy) {
  return (Math.atan2(dx, dy) * 180) / Math.PI;
}

// New — angle-arc for direction-based (not point-based) angles.
// thetaFrom/thetaTo are in degrees, measured from the same convention as the
// ray's own angle field (0° = straight down along the normal, per this payload).
// renderDirectionAngleArc — only the sweep/label math changes, arc-drawing logic is the same
// REPLACE renderDirectionAngleArc entirely with this version:
export function renderDirectionAngleArc(vertex, thetaFromDeg, thetaToDeg, radius, color, label, fontSize) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const pointAt = (deg, r) => ({
    x: vertex.x + Math.sin(toRad(deg)) * r,
    y: vertex.y + Math.cos(toRad(deg)) * r,
  });

  let diff = thetaToDeg - thetaFromDeg;
  diff = ((diff + 180) % 360 + 360) % 360 - 180;

  const STEPS = 16;
  const points = Array.from({ length: STEPS + 1 }, (_, i) => pointAt(thetaFromDeg + (diff * i) / STEPS, radius));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const labelPoint = pointAt(thetaFromDeg + diff / 2, radius + 18);

  return (
    <g>
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {label && renderMathLabel(labelPoint.x, labelPoint.y, label, fontSize, color)}
    </g>
  );
}

export const OPTICS_COLORS = {
  axis: "#222222",
  ray: "#e8870a",
  object: "#141bec",
  image: "#38a809",
  marker: "#230254a5",
};


const KNOWN_MEDIA = [
  { match: /air/i, color: "#EAF4FB", opacity: 0.15 },
  { match: /water/i, color: "#BEE3F8", opacity: 0.35 },
  { match: /glass/i, color: "#CFE8DE", opacity: 0.5 },
  { match: /diamond/i, color: "#D8E8FF", opacity: 0.65 },
  { match: /oil/i, color: "#F5E6C8", opacity: 0.4 },
];

export function mediumFill(label, index) {
  const known = KNOWN_MEDIA.find((k) => k.match.test(label));
  if (known) return known;
  // Fallback for unnamed/unrecognized media: density-driven, not positional —
  // n≈1.0 barely tinted, higher n visibly denser-looking, monotonic with index.
  const t = Math.min(Math.max((index - 1.0) / 1.4, 0), 1); // 1.0..2.4 range
  return { color: "#8FC7DE", opacity: 0.12 + t * 0.5 };
}

export function renderOpticsDefs() {
  return (
    <defs>
      <linearGradient id="lens-glass-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#EAF6FB" stopOpacity="0.85" />
        <stop offset="45%" stopColor="#BFE3F0" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#8FC7DE" stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id="mirror-reflective-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8B8FC7" />
        <stop offset="50%" stopColor="#3D4380" />
        <stop offset="100%" stopColor="#8B8FC7" />
      </linearGradient>

      <linearGradient id="medium-highlight-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
        <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <marker id="dim-arrow-end" markerWidth="8" markerHeight="8" refX="8" refY="4" markerUnits="userSpaceOnUse" orient="auto">
        <path d="M0,0 L8,4 L0,8" fill="none" stroke={OPTICS_COLORS.axis} strokeWidth="1.2" />
      </marker>
      <marker id="dim-arrow-start" markerWidth="8" markerHeight="8" refX="0" refY="4" markerUnits="userSpaceOnUse" orient="auto">
        <path d="M8,0 L0,4 L8,8" fill="none" stroke={OPTICS_COLORS.axis} strokeWidth="1.2" />
      </marker>
      <marker id="ray-arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" markerUnits="userSpaceOnUse" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="context-stroke" />
      </marker>
    </defs>
  );
}

// helper — reusable for any ray in refraction/TIR/lens/mirror
export function renderMidRayArrow(from, to, color, strokeWidth) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const angleDeg = angleOfVector(to.y - from.y, to.x - from.x);
  return (
    <g transform={`translate(${midX}, ${midY}) rotate(${angleDeg})`}>
      <path d="M-5,-4 L5,0 L-5,4 Z" fill={color} />
    </g>
  );
}

function renderEndArrow(x, y, toX, toY, color) {
  const angleDeg = (Math.atan2(toY - y, toX - x) * 180) / Math.PI;
  return (
    <g transform={`translate(${toX}, ${toY}) rotate(${angleDeg})`}>
      <path d="M-7,-5 L5,0 L-7,5 Z" fill={color} />
    </g>
  );
}
// Generic interpreter for explicit ray "path" arrays — used ONLY for MCQ-style
// "identify the correct ray" questions where the payload may deliberately
// describe a physically WRONG construction as a distractor option.
function resolveNamedPoint(name, positions) {
  if (name === "object_tip") return { x: positions.object.x, y: positions.object.tipY };
  return positions[name] ? { x: positions[name].x, y: positions[name].y } : null;
}

export function interpretRayPath(rayEl, positions, lensX, axisY, extend) {
  let currentPoint = resolveNamedPoint(rayEl.start, positions) || { x: positions.object.x, y: positions.object.tipY };
  const segments = [];

  rayEl.path.forEach((step) => {
    if (step.type === "parallel_to_axis") {
      const next = currentPoint.x < lensX ? { x: lensX, y: currentPoint.y } : { x: currentPoint.x + extend, y: currentPoint.y };
      segments.push({ from: currentPoint, to: next });
      currentPoint = next;
    } else if (step.type === "towards_focal_point") {
      const target = resolveNamedPoint(step.to_point, positions);
      const t = (lensX - currentPoint.x) / (target.x - currentPoint.x);
      const next = { x: lensX, y: currentPoint.y + t * (target.y - currentPoint.y) };
      segments.push({ from: currentPoint, to: next });
      currentPoint = next;
    } else if (step.type === "through_optical_center") {
      const center = { x: lensX, y: axisY };
      const dx = center.x - currentPoint.x, dy = center.y - currentPoint.y;
      const mag = Math.hypot(dx, dy) || 1;
      const far = { x: center.x + (dx / mag) * extend, y: center.y + (dy / mag) * extend };
      segments.push({ from: currentPoint, to: center }, { from: center, to: far });
      currentPoint = far;
    } else if (step.type === "diverges_from_focal_point") {
      const fPoint = resolveNamedPoint(step.from_point, positions);
      segments.push({ from: currentPoint, to: fPoint, dashed: true }); // backward projection — this is the "apparent source"
      const dx = currentPoint.x - fPoint.x, dy = currentPoint.y - fPoint.y;
      const mag = Math.hypot(dx, dy) || 1;
      const far = { x: currentPoint.x + (dx / mag) * extend, y: currentPoint.y + (dy / mag) * extend };
      segments.push({ from: currentPoint, to: far });
      currentPoint = far;
    }
  });

  return segments;
}

// shared helper — extract whether the image should be rendered, from any
// subtype's "forms_image_of" relationship. Defaults true if missing entirely
// (payload didn't set it), false only when explicitly set false.
export function getShowImage(relationships) {
  const rel = relationships.find((r) => r.type === "forms_image_of");
  return rel?.show_image !== false;
}

// shared helper — when showImage is false, every subtype still needs to draw
// SOMETHING (the incident rays leaving the object), just truncated at the
// lens/mirror surface instead of continuing on to the image. Takes the
// object's tip and whatever "first surface" points that subtype's rays reach
// (already computed by each calculate* function), returns the standard
// [{ points: [...] }] segment shape every render*System already expects —
// so no render function needs a different data shape for this case.
export function buildStubRayPaths(objectTip, surfacePoints) {
  return surfacePoints.filter(Boolean).map((p) => [{ points: [objectTip, p] }]);
}