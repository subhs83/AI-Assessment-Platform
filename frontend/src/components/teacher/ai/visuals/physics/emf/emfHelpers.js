import MathText from "../../../../../common/MathText"

// electricFieldSymbols.jsx

export const FIELD_COLORS = {
  positiveCharge: { fill: "#DC2626", stroke: "#991B1B" },
  negativeCharge: { fill: "#2563EB", stroke: "#1E40AF" },
  fieldLine: "#475569",
};

// PointChargeSymbol — add a reveal flag, default true (safe for two_point_charges/plates which need it visible)
// PointChargeSymbol — apply normalizeMathLabel wherever a label reaches MathText

export function PointChargeSymbol({ charge, label, radius = 16, revealSign = true }) {
  const isPositive = charge >= 0;
  const c = revealSign
    ? (isPositive ? FIELD_COLORS.positiveCharge : FIELD_COLORS.negativeCharge)
    : { fill: "#64748B", stroke: "#334155" };

  const displayLabel = normalizeMathLabel(label) || "Q"; // FIX: strip $...$ before rendering

  return (
    <g>
      <circle cx={0} cy={0} r={radius} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
      {revealSign ? (
        <>
          <line x1={-radius * 0.45} y1={0} x2={radius * 0.45} y2={0} stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
          {isPositive && <line x1={0} y1={-radius * 0.45} x2={0} y2={radius * 0.45} stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />}
        </>
      ) : (
        <foreignObject x={-radius * 0.9} y={-11} width={radius * 1.8} height={22} style={{ overflow: "visible" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", fontSize: radius * 0.9, fontWeight: 700, color: "#FFFFFF" }}>
            <MathText text={displayLabel} />
          </div>
        </foreignObject>
      )}
    </g>
  );
}

// A single radiating field line with an arrowhead, at a given angle (degrees),
// from the charge's edge (innerR) out to a fixed length (outerR).
// direction: "outward" (positive charge) or "inward" (negative charge)
export function FieldLineRay({ angleDeg, innerR, outerR, direction, strokeWidth = 2 }) {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const start = { x: cos * innerR, y: sin * innerR };
  const end = { x: cos * outerR, y: sin * outerR };

  // Arrowhead sits at 65% along the line for outward, 35% for inward —
  // matches the textbook convention of drawing the arrow mid-line, not at the very tip.
  const arrowT = direction === "outward" ? 0.62 : 0.38;
  const arrowPoint = { x: start.x + (end.x - start.x) * arrowT, y: start.y + (end.y - start.y) * arrowT };
  const arrowDir = direction === "outward" ? rad : rad + Math.PI;
  const arrowSize = 10;
  const a1 = { x: arrowPoint.x - Math.cos(arrowDir - 0.4) * arrowSize, y: arrowPoint.y - Math.sin(arrowDir - 0.4) * arrowSize };
  const a2 = { x: arrowPoint.x - Math.cos(arrowDir + 0.4) * arrowSize, y: arrowPoint.y - Math.sin(arrowDir + 0.4) * arrowSize };

  return (
    <g>
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={FIELD_COLORS.fieldLine} strokeWidth={strokeWidth} />
      <polygon points={`${arrowPoint.x},${arrowPoint.y} ${a1.x},${a1.y} ${a2.x},${a2.y}`} fill={FIELD_COLORS.fieldLine} />
    </g>
  );
}


export function arrowOnQuadraticCurve(startX, startY, ctrlX, ctrlY, endX, endY, t, reverse = false) {
  // Point on the curve at parameter t
  const mt = 1 - t;
  const x = mt * mt * startX + 2 * mt * t * ctrlX + t * t * endX;
  const y = mt * mt * startY + 2 * mt * t * ctrlY + t * t * endY;

  // Tangent direction at t (derivative of the quadratic bezier)
  const dx = 2 * mt * (ctrlX - startX) + 2 * t * (endX - ctrlX);
  const dy = 2 * mt * (ctrlY - startY) + 2 * t * (endY - ctrlY);
  let angle = Math.atan2(dy, dx);
  if (reverse) angle += Math.PI;

  const arrowSize = 10;
  const a1 = { x: x - Math.cos(angle - 0.4) * arrowSize, y: y - Math.sin(angle - 0.4) * arrowSize };
  const a2 = { x: x - Math.cos(angle + 0.4) * arrowSize, y: y - Math.sin(angle + 0.4) * arrowSize };
  return { point: { x, y }, a1, a2 };
}


export function detectPointChargeVariant(elements) {
  const hasPoint = elements.some((el) => el.type === "point");
  const hasVector = elements.some((el) => el.type === "vector");
  if (hasPoint || hasVector) return "field_at_point"; // Q2-style: calculation at a specific location
  return "field_lines"; // Q1-style: qualitative radiating pattern
}

export function detectTwoChargeVariant(elements) {
  const hasAxis = elements.some((el) => el.type === "axis");
  if (hasAxis) return "axis_positions"; // Q3-style: coordinate/number-line placement
  return "field_lines"; // original attraction/repulsion curve pattern
}

// Detection for field_lines_between_charges — now checks BOTH possible shapes
export function detectFieldLinesBetweenVariant(elements) {
  const hasPlates = elements.some((el) => el.type === "plate");
  if (hasPlates) return "plates";
  return "charge_pair"; // two point_charge elements — reuse/extend two-charge logic
}

// mathTextHelpers.js — small utility, used anywhere a label might arrive LaTeX-wrapped

export function normalizeMathLabel(text) {
  if (!text) return text;
  // Strip a single pair of outer $ ... $ delimiters if present — MathText
  // in this codebase expects raw content, not the wrapper itself.
  const trimmed = text.trim();
  if (trimmed.startsWith("$") && trimmed.endsWith("$") && trimmed.length > 1) {
    return trimmed.slice(1, -1);
  }
  return text;
}


// magneticFieldSymbols.jsx

export const MAG_COLORS = {
  north: { fill: "#DC2626", stroke: "#991B1B" },
  south: { fill: "#2563EB", stroke: "#1E40AF" },
  fieldLine: "#475569",
};

export function BarMagnetSymbol({ cx, cy, width, height, horizontal = true, counterRotate = 0 }) {
  const w = horizontal ? width : height;
  const h = horizontal ? height : width;
  const halfW = w / 2;

  return (
    <g transform={`translate(${cx},${cy}) rotate(${horizontal ? 0 : 90})`}>
      <rect x={-halfW} y={-h / 2} width={halfW} height={h} fill={MAG_COLORS.north.fill} stroke={MAG_COLORS.north.stroke} strokeWidth={2} />
      <rect x={0} y={-h / 2} width={halfW} height={h} fill={MAG_COLORS.south.fill} stroke={MAG_COLORS.south.stroke} strokeWidth={2} />
      <g transform={`translate(${-halfW / 2},0) rotate(${counterRotate})`}>
        <text x={0} y={0} dominantBaseline="central" fontSize={h * 0.5} fontWeight={800} fill="#FFFFFF" textAnchor="middle">N</text>
      </g>
      <g transform={`translate(${halfW / 2},0) rotate(${counterRotate})`}>
        <text x={0} y={0} dominantBaseline="central" fontSize={h * 0.5} fontWeight={800} fill="#FFFFFF" textAnchor="middle">S</text>
      </g>
    </g>
  );
}


// Approximate midpoint + tangent for a cubic bezier path string "M x y C c1x c1y, c2x c2y, ex ey"
export function arrowOnCubicMidpoint(d) {
  const nums = d.match(/-?\d+\.?\d*/g)?.map(Number);
  if (!nums || nums.length < 8) return null;
  const [sx, sy, c1x, c1y, c2x, c2y, ex, ey] = nums;
  const t = 0.5;
  const mt = 1 - t;
  const x = mt ** 3 * sx + 3 * mt ** 2 * t * c1x + 3 * mt * t ** 2 * c2x + t ** 3 * ex;
  const y = mt ** 3 * sy + 3 * mt ** 2 * t * c1y + 3 * mt * t ** 2 * c2y + t ** 3 * ey;
  const dx = 3 * mt ** 2 * (c1x - sx) + 6 * mt * t * (c2x - c1x) + 3 * t ** 2 * (ex - c2x);
  const dy = 3 * mt ** 2 * (c1y - sy) + 6 * mt * t * (c2y - c1y) + 3 * t ** 2 * (ey - c2y);
  const angle = Math.atan2(dy, dx);
  const size = 7;
  return {
    point: { x, y },
    a1: { x: x - Math.cos(angle - 0.4) * size, y: y - Math.sin(angle - 0.4) * size },
    a2: { x: x - Math.cos(angle + 0.4) * size, y: y - Math.sin(angle + 0.4) * size },
  };
}

// fieldIndicator.jsx — reusable dots/×'s background pattern

export function FieldIntoPageIndicator({ width, height, direction = "into", rows = 3, cols = 5 }) {
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5) * (width / cols) - width / 2;
      const y = (r + 0.5) * (height / rows) - height / 2;
      cells.push({ x, y });
    }
  }
  return (
    <g opacity={0.55}>
      {cells.map(({ x, y }, i) => (
        <g key={i}>
          {direction === "out" ? (
            <>
              <circle cx={x} cy={y} r={6} fill="none" stroke="#94A3B8" strokeWidth={1.5} />
              <circle cx={x} cy={y} r={1.8} fill="#94A3B8" />
            </>
          ) : (
            <>
              <line x1={x - 5} y1={y - 5} x2={x + 5} y2={y + 5} stroke="#94A3B8" strokeWidth={1.5} />
              <line x1={x - 5} y1={y + 5} x2={x + 5} y2={y - 5} stroke="#94A3B8" strokeWidth={1.5} />
            </>
          )}
        </g>
      ))}
    </g>
  );
}

export function getFieldDirection(elements) {
  const fieldEl = elements.find((el) => typeof el.type === "string" && el.type.startsWith("field_"));
  return `${fieldEl?.type ?? ""} ${fieldEl?.direction ?? ""}`.includes("out") ? "out" : "into";
}


// magneticFieldSymbols.jsx

export function CurrentArrow({ wireTop, wireBottom, direction }) {
  const vecs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const [dx, dy] = vecs[direction] || vecs.up;
  // up/left arrows sit at the wire's start point, down/right at its end point
  const tip = direction === "up" || direction === "left" ? wireTop : wireBottom;
  const px = -dy, py = dx; // perpendicular, for the arrowhead's base width
  const pts = [
    [tip.x + dx * 10, tip.y + dy * 10],
    [tip.x - dx * 4 + px * 6, tip.y - dy * 4 + py * 6],
    [tip.x - dx * 4 - px * 6, tip.y - dy * 4 - py * 6],
  ].map((p) => p.join(",")).join(" ");
  return <polygon points={pts} fill="#1E293B" />;
}