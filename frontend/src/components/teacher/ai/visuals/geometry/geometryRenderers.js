import {
  getSegmentEndpoints,
  getSvgDimensions
} from "./geometryHelpers";
/*
 * geometryRenderers.js
 *
 * Rendering only.
 * Geometry meaning comes from:
 *
 * parseGeometry
 *      ↓
 * detectGeometryFigure
 *      ↓
 * calculateGeometryPositions
 *      ↓
 * geometryRenderers
 *
 * Do not change the AI data structure here.
 */

/* --------------------------------------------------
 * TEXT NORMALIZATION
 * -------------------------------------------------- */

 


function formatGeometryValue(value, type = "") {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  let text = String(value).trim();

  // --------------------------------------------------
  // Remove LaTeX math delimiters
  // --------------------------------------------------

  text = text.replace(/\$/g, "");

  // --------------------------------------------------
  // Convert LaTeX degree notation
  //
  // $(x + 25)^\circ$
  // $(x + 25)^{\circ}$
  // x^\circ
  // x^{\circ}
  // --------------------------------------------------

  text = text.replace(
    /\^\s*\{\s*\\circ\s*\}/g,
    "°"
  );

  text = text.replace(
    /\^\s*\\circ\b/g,
    "°"
  );

  // --------------------------------------------------
  // Remove remaining LaTeX braces
  // --------------------------------------------------

  text = text.replace(/[{}]/g, "");

  // --------------------------------------------------
  // Common LaTeX cleanup
  // --------------------------------------------------

  text = text.replace(
    /\\text\{([^}]*)\}/g,
    "$1"
  );

  text = text.replace(
    /\\mathrm\{([^}]*)\}/g,
    "$1"
  );

  text = text.replace(
    /\\,/g,
    " "
  );

  text = text.replace(
    /\\ /g,
    " "
  );

  // --------------------------------------------------
  // Remove markdown emphasis
  // --------------------------------------------------

  text = text.replace(/\*\*/g, "");

  // --------------------------------------------------
  // Normalize whitespace
  // --------------------------------------------------

  text = text
    .replace(/\s+/g, " ")
    .trim();

  // --------------------------------------------------
  // Angle values ALWAYS display degrees
  // --------------------------------------------------

  if (
    type === "angle" &&
    text &&
    !text.includes("°")
  ) {
    text += "°";
  }

  return text;
}

/* --------------------------------------------------
 * POINT LABEL LOOKUP
 * -------------------------------------------------- */

export function findPointByLabel(points, label) {
  if (!points || !label) return null;

  const target = String(label).trim();
  const targetUpper = target.toUpperCase();

  // 1. Direct key match (e.g., points["point_a"] or points["A"])
  if (points[target]) return target;

  // 2. Exact match against point id or label
  return (
    Object.keys(points).find((id) => {
      const pt = points[id];
      if (!pt) return false;

      const ptId = String(pt.id || "").trim();
      const ptLabel = String(pt.label || "").trim();

      return (
        ptId === target ||
        ptLabel === target ||
        ptId.toUpperCase() === targetUpper ||
        ptLabel.toUpperCase() === targetUpper
      ) || null;
    }) || null
  );
}

/* --------------------------------------------------
 * SEGMENT
 * -------------------------------------------------- */

export function renderSegment(
  segment,
  index,
  positions,
  endpoints = null,
  isMobile = false
) {
  if (!segment) return null;

  const { strokeWidth } = getSvgDimensions(isMobile);

  // 1. Resolve endpoint IDs (Use provided endpoints OR extract from segment endpoints/elements)
  const firstId =
    endpoints?.firstId ||
    segment.endpoints?.[0] ||
    segment.elements?.[0] ||
    null;

  const secondId =
    endpoints?.secondId ||
    segment.endpoints?.[1] ||
    segment.elements?.[1] ||
    null;

  if (!firstId || !secondId) {
    return null;
  }

  // 2. Fetch point positions
  const p1 = positions?.[firstId];
  const p2 = positions?.[secondId];

  // 3. Strict coordinate safety guard
  if (
    !p1 || !p2 ||
    !Number.isFinite(Number(p1.x)) ||
    !Number.isFinite(Number(p1.y)) ||
    !Number.isFinite(Number(p2.x)) ||
    !Number.isFinite(Number(p2.y))
  ) {
    return null;
  }

  // 4. Render line element
  return (
    <line
      key={segment.id || `segment-${index}`}
      x1={p1.x}
      y1={p1.y}
      x2={p2.x}
      y2={p2.y}
      stroke="blue"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  );
}

/* --------------------------------------------------
 * POINTS
 * -------------------------------------------------- */

export function renderPoints(
  points,
  positions,
  relationships = [],
  segments = [], 
  circles = [],
  angles = [],
  isMobile = false
) {
  if (!points || typeof points !== "object") return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);

  // 1. DYNAMICALLY RESOLVE CIRCLE CENTER (Point O or explicitly named center)
  // FIXED: Removed 'label === "C"' so vertex C in triangles is not treated as a circle center
  const circle = circles?.[0] || null;
  const centerOfRel = relationships.find((r) => r.type === "is_center_of");

  const centerId =
    (circle?.center && points[circle.center] ? circle.center : null) ||
    (centerOfRel?.elements?.[0] && points[centerOfRel.elements[0]] ? centerOfRel.elements[0] : null) ||
    Object.keys(points).find((pointId) => {
      const label = String(points[pointId]?.label || "").trim().toUpperCase();
      return label === "O" || label === "CENTER";
    }) ||
    Object.keys(points).find((pointId) => {
      const lowerId = pointId.toLowerCase();
      return lowerId === "point_o" || lowerId.includes("center");
    });

  const centerPosition =
    (centerId && positions?.[centerId]) ||
    circle?.__renderCenter ||
    null;

  // 2. CALCULATE GEOMETRY CENTER (For Quadrant Positioning)
  const validPositions = Object.values(positions || {}).filter(
    (p) => p && Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y))
  );

  const avgX =
    validPositions.reduce((sum, p) => sum + p.x, 0) / (validPositions.length || 1);
  const avgY =
    validPositions.reduce((sum, p) => sum + p.y, 0) / (validPositions.length || 1);
    console.log("[renderPoints] centerId resolved to:", centerId, "| point_i position:", positions?.["point_i"]);
  return Object.keys(points).map((id) => {
    const point = points[id];
    const position = positions?.[id];

    // Coordinate safety check
    if (!position || !Number.isFinite(Number(position.x)) || !Number.isFinite(Number(position.y))) {
      return null;
    }

    // Skip synthetic line-extension points entirely — they exist only
    // to give the line-drawing code a far-off endpoint to draw toward,
    // and should never render a dot or label of their own.
    if (point.__synthetic) {
      return null;
    }

    /*
     * ------------------------------------------
     * POINT ON SEGMENT DETECTION
     * ------------------------------------------
     */
    const isPointOnSegment = relationships.some(
      (r) =>
        (r.type === "midpoint_of" || r.type === "lies_on") &&
        r.elements?.includes(id) &&
        r.elements?.some((elementId) =>
          String(elementId).startsWith("segment_")
        )
    );

    /*
     * ------------------------------------------
     * CIRCLE ENDPOINT DETECTION
     * ------------------------------------------
     */
    let isCircleEndpoint = false;

    if (circles.length > 0 && id !== centerId) {
      // Radius endpoint check
      const isRadiusEndpoint = segments.some((segment) => {
        const endpoints = getSegmentEndpoints
          ? getSegmentEndpoints(segment, points)
          : {
              firstId: segment.endpoints?.[0] || segment.elements?.[0],
              secondId: segment.endpoints?.[1] || segment.elements?.[1],
            };

        if (!endpoints) return false;

        const normalizedLabel = String(segment.label || "")
          .replace(/[\\$\\_\\{\\}]/g, "")
          .trim()
          .toLowerCase();

        const isRadiusLabel = normalizedLabel === "r" || normalizedLabel === "radius";
        const connectsToCenter = endpoints.firstId === centerId || endpoints.secondId === centerId;

        if (!connectsToCenter) return false;

        const otherId = endpoints.firstId === centerId ? endpoints.secondId : endpoints.firstId;
        return isRadiusLabel && otherId === id;
      });

      // Tangent / Secant or Boundary Point check
      const isBoundaryPoint = relationships.some((r) => {
        if (r.type === "tangent_to" || r.type === "tangent_at_point") return r.at_point === id;
        if (r.type === "secant_to" || r.type === "intersects") return r.at_points?.includes(id);
        return false;
      });

      isCircleEndpoint = isRadiusEndpoint || isBoundaryPoint;
    }

     /*
        * ------------------------------------------
        * MULTI-LINE CONVERGENCE AVOIDANCE
        * ------------------------------------------
        * Find every segment touching this point, compute the direction each
        * one radiates outward in, and place the label in the middle of the
        * widest angular gap between them — i.e. the most open empty space
        * around the point. Generalizes the angle-marker case (E) to any
        * point where multiple lines meet (O, T, K), without needing a
        * declared angle relationship at all.
        */
        const isIntersectionPoint = relationships.some((r) => r.type === "intersect_at" && r.target === id);
        const connectedDirections = [];
        segments.forEach((seg) => {
          const endpoints = getSegmentEndpoints(seg, points);
          if (!endpoints) return;
          const a = positions?.[endpoints.firstId];
          const b = positions?.[endpoints.secondId];
          if (!a || !b) return;

          if (endpoints.firstId === id || endpoints.secondId === id) {
            const otherId = endpoints.firstId === id ? endpoints.secondId : endpoints.firstId;
            const other = positions?.[otherId];
            if (other) {
              connectedDirections.push(Math.atan2(other.y - position.y, other.x - position.x));
            }
          } else if (isIntersectionPoint) {
            const dx = b.x - a.x, dy = b.y - a.y;
            const lenSq = dx * dx + dy * dy;
            if (lenSq < 1e-6) return;
            const t = ((position.x - a.x) * dx + (position.y - a.y) * dy) / lenSq;
            if (t < 0.02 || t > 0.98) return;
            const projX = a.x + t * dx, projY = a.y + t * dy;
            const dist = Math.hypot(position.x - projX, position.y - projY);
            if (dist > 3) return;

            const angleToA = Math.atan2(a.y - position.y, a.x - position.x);
            const angleToB = Math.atan2(b.y - position.y, b.x - position.x);
            connectedDirections.push(angleToA, angleToB);
          }
        });

        let convergenceOffset = null;

        const hasAngleHere = angles.some((a) => {
          if (Array.isArray(a.elements) && a.elements.length >= 3) {
            return points[id]?.label === a.elements[1];
          }
          return false;
        });

        // ============================================================
        // ⬇️ CHANGED: when an angle marker exists at this point (E, K),
        // force the label straight below, so it reads clearly as a
        // separate point label rather than blending with the angle
        // marker. Otherwise (O, T — no angle marker), keep the existing
        // automatic widest-gap logic, since it's already working there.
        // ============================================================
        if (hasAngleHere && isIntersectionPoint) {
          const BELOW_OFFSET = 16;
          convergenceOffset = {
            x: position.x + BELOW_OFFSET/2,  // slight left shift to avoid overlapping the angle marker
            y: position.y + BELOW_OFFSET,
          };
        } else if (connectedDirections.length >= 2) {
          const sorted = [...connectedDirections].sort((a, b) => a - b);
          let widestGap = -Infinity;
          let widestGapMid = 0;

          for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];
            const next = i === sorted.length - 1 ? sorted[0] + 2 * Math.PI : sorted[i + 1];
            const gap = next - current;
            if (gap > widestGap) {
              widestGap = gap;
              widestGapMid = current + gap / 2;
            }
          }
          const CONVERGENCE_OFFSET = 18;
          convergenceOffset = {
            x: position.x + Math.cos(widestGapMid) * CONVERGENCE_OFFSET,
            y: position.y + Math.sin(widestGapMid) * CONVERGENCE_OFFSET,
          };
        }
        // ⬆️ END CHANGE ⬆️
    let labelX = position.x;
    let labelY = position.y;
    let labelAnchor = "middle";
    let baseline = "middle";

    if (convergenceOffset) {
      labelX = convergenceOffset.x;
      labelY = convergenceOffset.y;
      labelAnchor = "middle";
      baseline = "middle";
    } else if (isCircleEndpoint && centerPosition) {
      // RADIAL POSITIONING FOR CIRCLE BOUNDARY POINTS
      const dx = position.x - centerPosition.x;
      const dy = position.y - centerPosition.y;
      const length = Math.hypot(dx, dy);

      const outwardOffset = 8;

      if (length > 0) {
        const unitX = dx / length;
        const unitY = dy / length;

        labelX = position.x + unitX * outwardOffset;
        labelY = position.y + unitY * outwardOffset;

        if (Math.abs(unitX) > 0.5) {
          labelAnchor = unitX > 0 ? "start" : "end";
        } else {
          labelAnchor = "middle";
        }

        if (Math.abs(unitY) > 0.5) {
          baseline = unitY > 0 ? "hanging" : "auto";
        }
      }
    } else if (id === centerId && circles.length > 0) {
      // For a large circle, a small offset from the center dot still
      // lands INSIDE the circle, near boundary points (S, T, etc.) —
      // crowded and easy to misread as belonging to a different point.
      // Push the label OUTSIDE the circle instead, using its radius,
      // into clearly open space below the circle.
      const circleForLabel = circles.find((c) => c.id === circle?.id) || circle;
      const radius =
        Number(circleForLabel?.__renderRadius) ||
        Math.hypot(position.x - avgX, position.y - avgY) ||
        0;

      labelX = position.x + radius*0.15;
      labelY = position.y + radius*0.10;
      labelAnchor = "middle";
      baseline = "hanging";
    }  else {
      // QUADRANT POSITIONING FOR POLYGON / NON-CIRCLE VERTICES
      const isLeft = position.x <= avgX;
      const isTop = position.y <= avgY;
      const offset = 6;

      if (isTop) {
        // TOP HALF: Position slightly above
        labelY = position.y - offset;
        baseline = "auto";
        labelX = isLeft ? position.x - offset : position.x + offset;
        labelAnchor = isLeft ? "end" : "start";
      } else {
        // BOTTOM HALF: Position slightly below
        labelY = position.y + offset;
        baseline = "hanging";
        labelX = isLeft ? position.x - offset : position.x + offset;
        labelAnchor = isLeft ? "end" : "start";
      }

      // Special adjustment if point lies strictly on a segment
      if (isPointOnSegment) {
        labelY = position.y + 10;
        labelAnchor = "middle";
        baseline = "hanging";
      }
    }

    return (
      <g key={point.id || `point-${id}`}>
        <circle cx={position.x} cy={position.y} r="3.5" fill="currentColor" />

        {point.label && (
          <text
            x={labelX}
            y={labelY}
            textAnchor={labelAnchor}
            dominantBaseline={baseline}
            fontSize={fontSize}
            strokeWidth={strokeWidth}
            className="fill-slate-800 font-bold select-none"
          >
            {point.label}
          </text>
        )}
      </g>
    );
  });
}
/* --------------------------------------------------
 * SEGMENT LABEL / VALUE
 * -------------------------------------------------- */

export function renderSegmentAnnotations(
  segments,
  points,
  positions,
  getSegmentEndpoints,
  relationships = [],
  isMobile = false
) {
  if (!Array.isArray(segments) || segments.length === 0) {
    return null;
  }

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);

  // ---- PASS 1: compute each segment's naive label position (existing logic, unchanged) ----
  const labelData = segments.map((segment, index) => {
    const endpoints = getSegmentEndpoints
      ? getSegmentEndpoints(segment, points)
      : { firstId: segment.endpoints?.[0] || segment.elements?.[0], secondId: segment.endpoints?.[1] || segment.elements?.[1] };

    if (!endpoints?.firstId || !endpoints?.secondId) return null;

    const p1 = positions?.[endpoints.firstId];
    const p2 = positions?.[endpoints.secondId];
    if (!p1 || !p2 || !Number.isFinite(Number(p1.x)) || !Number.isFinite(Number(p1.y)) || !Number.isFinite(Number(p2.x)) || !Number.isFinite(Number(p2.y))) return null;

    const rawText = segment.text || segment.value_expression || (segment.value !== undefined && segment.value !== null ? String(segment.value) : "") || (segment.is_target ? "?" : "");
    const text = typeof formatGeometryValue === "function" ? formatGeometryValue(rawText, "segment") : rawText;
    if (!text) return null;

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const topPt = p1.y <= p2.y ? p1 : p2;
    const botPt = p1.y <= p2.y ? p2 : p1;
    const dx = botPt.x - topPt.x, dy = botPt.y - topPt.y;
    const length = Math.hypot(dx, dy);

    // RULE 2: Perpendicular-distance segment — place opposite the side
// where the associated right-triangle's third point sits.
const rightTriangleRel = relationships.find(
  (r) => r.type === "forms_right_triangle" && r.elements?.includes(endpoints.firstId) && r.elements?.includes(endpoints.secondId)
);

if (rightTriangleRel) {
  const thirdPointId = rightTriangleRel.elements.find(
    (pid) => pid !== endpoints.firstId && pid !== endpoints.secondId
  );
  const thirdPoint = thirdPointId ? positions?.[thirdPointId] : null;

  if (thirdPoint && length > 0) {
    const ux = dx / length, uy = dy / length;
    let nx = -uy, ny = ux; // perpendicular to OM

    // Which side is the third point on, relative to line OM?
    const toThirdX = thirdPoint.x - midX, toThirdY = thirdPoint.y - midY;
    const sideDot = nx * toThirdX + ny * toThirdY;

    // Flip so the label goes AWAY from the third point's side.
    if (sideDot > 0) { nx = -nx; ny = -ny; }

    const PERP_LABEL_OFFSET = 10;
    return {
      segment,
      index,
      text,
      labelX: midX + nx * PERP_LABEL_OFFSET,
      labelY: midY + ny * PERP_LABEL_OFFSET,
      midX,
      midY,
    };
  }
}

// Inside the labelData.map() pass, after computing p1/p2/midX/midY:

// RULE 1: Chord-specific placement — below the chord if the chord sits
// below the circle's center, above it if the chord sits above center.
const chordRel = relationships.find(
  (r) =>
    r.type === "forms_chord" &&
    r.target === segment.id
);

if (chordRel) {
  const centerOfRel = relationships.find((r) => r.type === "is_center_of");
  const centerId = centerOfRel?.elements?.[0];
  const centerPos = centerId ? positions?.[centerId] : null;

  if (centerPos) {
    const CHORD_LABEL_OFFSET = 25;
    const chordIsBelowCenter = midY > centerPos.y;
    return {
      segment,
      index,
      text,
      labelX: midX,
      labelY: chordIsBelowCenter ? midY + CHORD_LABEL_OFFSET : midY - CHORD_LABEL_OFFSET,
      midX,
      midY,
    };
  }
}

    const COINCIDENCE_THRESHOLD = 15;
    let nearbyPointId = null;
    for (const pid of Object.keys(positions || {})) {
      const p = positions[pid];
      if (!p) continue;
      if (Math.hypot(p.x - midX, p.y - midY) < COINCIDENCE_THRESHOLD) { nearbyPointId = pid; break; }
    }

    let alongOffsetX = 0, alongOffsetY = 0;
    if (nearbyPointId && length > 0) {
      const ux = dx / length, uy = dy / length;
      const distToTop = Math.hypot(topPt.x - midX, topPt.y - midY);
      const distToBot = Math.hypot(botPt.x - midX, botPt.y - midY);
      const ALONG_OFFSET = 18;
      if (distToTop > distToBot) { alongOffsetX = -ux * ALONG_OFFSET; alongOffsetY = -uy * ALONG_OFFSET; }
      else { alongOffsetX = ux * ALONG_OFFSET; alongOffsetY = uy * ALONG_OFFSET; }
    }

    let labelX = midX + alongOffsetX;
    let labelY = midY + 12 + alongOffsetY;

    if (length > 0) {
      const ux = dx / length, uy = dy / length;
      let nx = -uy, ny = ux;
      if (dx < 0 && nx > 0) { nx = -nx; ny = -ny; }
      else if (dx > 0 && nx < 0) { nx = -nx; ny = -ny; }
      else if (Math.abs(dx) < 0.001 && ny < 0) { nx = -nx; ny = -ny; }
      const offsetDistance = 12;
      labelX = midX + nx * offsetDistance + alongOffsetX;
      labelY = midY + ny * offsetDistance + alongOffsetY;
    }

    return { segment, index, text, labelX, labelY, midX, midY };
  });

  // ---- PASS 2: detect labels too close to EACH OTHER, push apart ----
  const MIN_LABEL_DISTANCE = 20;
  for (let i = 0; i < labelData.length; i++) {
    if (!labelData[i]) continue;
    for (let j = i + 1; j < labelData.length; j++) {
      if (!labelData[j]) continue;
      const a = labelData[i], b = labelData[j];
      const dist = Math.hypot(a.labelX - b.labelX, a.labelY - b.labelY);
      if (dist < MIN_LABEL_DISTANCE && dist > 0) {
        const pushX = ((a.labelX - b.labelX) / dist) * (MIN_LABEL_DISTANCE - dist) / 2;
        const pushY = ((a.labelY - b.labelY) / dist) * (MIN_LABEL_DISTANCE - dist) / 2;
        a.labelX += pushX; a.labelY += pushY;
        b.labelX -= pushX; b.labelY -= pushY;
      }
    }
  }

  // ---- RENDER ----
  return labelData.map((data) => {
    if (!data) return null;
    const { segment, index, text, labelX, labelY, midX } = data;
    let textAnchor = "middle";
    if (labelX < midX - 2) textAnchor = "end";
    else if (labelX > midX + 2) textAnchor = "start";

    return (
      <text
        key={segment.id || `segment-label-${index}`}
        x={labelX}
        y={labelY}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize={fontSize}
        strokeWidth={strokeWidth}
        className="fill-slate-700 font-bold select-none"
      >
        {text}
      </text>
    );
  });
}
/* --------------------------------------------------
 * ANGLE GEOMETRY HELPERS
 * -------------------------------------------------- */

/*
 * Normalize an angle to:
 *
 * -π ... +π
 */
export function normalizeAngle(angle) {
  const num = Number(angle);
  if (!Number.isFinite(num)) return 0; // Guard against NaN / Infinity

  // Wrap angle into [-π, π] mathematically without while loops
  return Math.atan2(Math.sin(num), Math.cos(num));
}

/*
 * Create an SVG arc path between two
 * rays sharing the same vertex.
 */
export function createAngleArcPath({ vertex, first, second, radius = 20 }) {
  if (
    !vertex || !first || !second ||
    !Number.isFinite(Number(vertex.x)) || !Number.isFinite(Number(vertex.y)) ||
    !Number.isFinite(Number(first.x)) || !Number.isFinite(Number(first.y)) ||
    !Number.isFinite(Number(second.x)) || !Number.isFinite(Number(second.y))
  ) {
    return { path: "", firstAngle: 0, secondAngle: 0, delta: 0 };
  }

  const firstAngle = Math.atan2(first.y - vertex.y, first.x - vertex.x);
  const secondAngle = Math.atan2(second.y - vertex.y, second.x - vertex.x);

  let rawDelta = secondAngle - firstAngle;

  let sweepDelta = rawDelta;
  while (sweepDelta < 0) sweepDelta += 2 * Math.PI;
  while (sweepDelta >= 2 * Math.PI) sweepDelta -= 2 * Math.PI;

  const delta = normalizeAngle(rawDelta);

  const startX = vertex.x + Math.cos(firstAngle) * radius;
  const startY = vertex.y + Math.sin(firstAngle) * radius;
  const endX = vertex.x + Math.cos(secondAngle) * radius;
  const endY = vertex.y + Math.sin(secondAngle) * radius;

  // ALWAYS draw the MINOR arc (<= 180deg) — a triangle's interior angle
  // is never reflex, so the arc should never be the "long way around."
  // Previously sweepFlag was hardcoded to 1 (clockwise), which combined
  // with largeArcFlag=1 whenever sweepDelta > 180deg drew the REFLEX
  // arc instead — the exact bug causing arcs to render outside the
  // triangle. Whether the minor arc is clockwise or counterclockwise
  // depends only on point label order in the JSON (Y-X-Z vs Z-X-Y),
  // which is arbitrary — so pick the sweep direction that stays minor,
  // rather than assuming a fixed direction.
  const largeArcFlag = 0;
  const sweepFlag = sweepDelta <= Math.PI ? 1 : 0;

  const midAngle =
    sweepDelta <= Math.PI
      ? firstAngle + sweepDelta / 2
      : firstAngle - (2 * Math.PI - sweepDelta) / 2;

  return {
    path: `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`,
    firstAngle,
    secondAngle,
    delta,
    midAngle,
  };
}
/* --------------------------------------------------
 * ANGLE LABEL POSITION
 * -------------------------------------------------- */

export function calculateAngleLabelPosition({
  vertex,
  first,
  second,
  offset = 28,
}) {
  if (
    !vertex || !first || !second ||
    !Number.isFinite(Number(vertex.x)) || !Number.isFinite(Number(vertex.y)) ||
    !Number.isFinite(Number(first.x)) || !Number.isFinite(Number(first.y)) ||
    !Number.isFinite(Number(second.x)) || !Number.isFinite(Number(second.y))
  ) {
    return null;
  }

  const angle1 = Math.atan2(first.y - vertex.y, first.x - vertex.x);
  const angle2 = Math.atan2(second.y - vertex.y, second.x - vertex.x);

  let sweepDelta = angle2 - angle1;
  while (sweepDelta < 0) sweepDelta += 2 * Math.PI;
  while (sweepDelta >= 2 * Math.PI) sweepDelta -= 2 * Math.PI;

  // Always bisect the SHORTER of the two possible arcs between the rays —
  // the interior angle is never the reflex (>180°) side. If the raw sweep
  // from angle1->angle2 is reflex, flip to walk the other direction instead.
  let startAngle = angle1;
  if (sweepDelta > Math.PI) {
    sweepDelta = 2 * Math.PI - sweepDelta;
    startAngle = angle2;
  }
  let bisectorAngle = startAngle + sweepDelta / 2;

  if (Math.abs(sweepDelta - Math.PI) < 1e-5) {
    bisectorAngle = startAngle + Math.PI / 2;
  }

  return {
    x: vertex.x + Math.cos(bisectorAngle) * offset,
    y: vertex.y + Math.sin(bisectorAngle) * offset,
  };
}
/* --------------------------------------------------
 * ANGLES
 *
 * Renders:
 *
 * 1. actual SVG angle arc
 * 2. angle value
 *
 * Example:
 *
 *       P
 *      / \
 *     /   \
 *    Q--R--S
 *
 * angle_prs
 *
 * P - R - S
 *
 * R = vertex
 * -------------------------------------------------- */

export function renderAngles(
  angles,
  points,
  positions,
  relationships = [],   // ⬅️ add this param
  isMobile = false
) {
  if (!Array.isArray(angles) || angles.length === 0) {
    return null;
  }

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);

  return angles.map((angle, index) => {
    if (!angle) return null;

    // 1. RESOLVE ANGLE POINTS DYNAMICALLY
    // Priority: Explicit angle properties -> elements array -> Regex fallback
    let firstId = null;
    let vertexId = null;
    let secondId = null;

    if (angle.vertex && angle.arms?.length >= 2) {
      vertexId = findPointByLabel(points, angle.vertex);
      firstId = findPointByLabel(points, angle.arms[0]);
      secondId = findPointByLabel(points, angle.arms[1]);
    } else if (Array.isArray(angle.elements) && angle.elements.length >= 3) {
      firstId = findPointByLabel(points, angle.elements[0]);
      vertexId = findPointByLabel(points, angle.elements[1]);
      secondId = findPointByLabel(points, angle.elements[2]);
    } else {
      const match = String(angle.id || "").match(/^angle_([a-z0-9_]+)$/i);
      if (match) {
        const chars = match[1].split("");
        if (chars.length === 3) {
          firstId = findPointByLabel(points, chars[0]);
          vertexId = findPointByLabel(points, chars[1]);
          secondId = findPointByLabel(points, chars[2]);
        }
      }
    }

    if (!firstId || !vertexId || !secondId) return null;

    const vertex = positions?.[vertexId];
    const first = positions?.[firstId];
    const second = positions?.[secondId];

    if (
      !vertex || !first || !second ||
      !Number.isFinite(Number(vertex.x)) || !Number.isFinite(Number(vertex.y)) ||
      !Number.isFinite(Number(first.x)) || !Number.isFinite(Number(first.y)) ||
      !Number.isFinite(Number(second.x)) || !Number.isFinite(Number(second.y))
    ) {
      return null;
    }

    // 2. DETECT RIGHT ANGLES (90°)
    const isRightAngle =
      angle.is_right_angle ||
      angle.value === 90 ||
      String(angle.value).includes("90");

    // 3. GENERATE ARC PATH / RIGHT-ANGLE PATH
    let pathD = "";
    let labelPosition = null;

    if (isRightAngle) {
      // Calculate 90-degree square corner marker
      const len1 = Math.hypot(first.x - vertex.x, first.y - vertex.y);
      const len2 = Math.hypot(second.x - vertex.x, second.y - vertex.y);

      if (len1 > 0 && len2 > 0) {
        const size = 12;
        const u1x = ((first.x - vertex.x) / len1) * size;
        const u1y = ((first.y - vertex.y) / len1) * size;
        const u2x = ((second.x - vertex.x) / len2) * size;
        const u2y = ((second.y - vertex.y) / len2) * size;

        const p1x = vertex.x + u1x;
        const p1y = vertex.y + u1y;
        const cornerX = vertex.x + u1x + u2x;
        const cornerY = vertex.y + u1y + u2y;
        const p2x = vertex.x + u2x;
        const p2y = vertex.y + u2y;

        pathD = `M ${p1x} ${p1y} L ${cornerX} ${cornerY} L ${p2x} ${p2y}`;
      }
    } else {
      // Calculate standard arc
      const arc = createAngleArcPath({ vertex, first, second, radius: 20 });
      pathD = arc.path;
    }
    
    // Label Position
    labelPosition = calculateAngleLabelPosition({
      vertex,
      first,
      second,
      offset: isRightAngle ? 30 : 35,
    });

    // For right angles specifically, the vertex point's own label is
    // forced below it (see renderPoints). If the angle's natural bisector
    // direction also points downward/nearby, flip to the opposite side
    // of the vertex so the two labels don't compete for the same space.
    const isIntersectionVertex = relationships.some(
      (r) => r.type === "intersect_at" && r.target === vertexId
    );
    if (isRightAngle && labelPosition) {
      const dx = labelPosition.x - vertex.x;
      const dy = labelPosition.y - vertex.y;
      if (isIntersectionVertex && dy > 0) {
        // Bisector points downward — same direction as the point's own
        // forced-below label. Flip to point upward instead.
        labelPosition = { x: vertex.x - dx, y: vertex.y - dy };
      }
    }

    // 4. VALUE FORMATTING & SUPPRESSION
    // Suppress value if show_value is false OR explicitly requested on angle object
    const shouldSuppressValue = angle.show_value === false;

    let value = "";
    if (!shouldSuppressValue) {
      const rawValue =
        angle.text ||
        angle.value_expression ||
        (angle.value !== undefined && angle.value !== null ? String(angle.value) : "");

      value = formatGeometryValue ? formatGeometryValue(rawValue, "angle") : rawValue;
    }

    return (
      <g key={angle.id || `angle-${index}`}>
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="stroke-slate-800 dark:stroke-slate-100"
          />
        )}
        {value && labelPosition && (
          <text
            x={labelPosition.x}
            y={labelPosition.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            strokeWidth={strokeWidth}
            className="fill-slate-700 font-bold"
          >
            {value}
          </text>
        )}
      </g>
    );
  });
}




export function renderCircles(
  circles,
  points,
  positions,
  isMobile = false
) {
  if (!Array.isArray(circles) || circles.length === 0) {
    return null;
  }

  const { 
    width: SVG_WIDTH, 
    height: SVG_HEIGHT, 
    paddingX, 
    paddingY, 
    strokeWidth 
  } = getSvgDimensions(isMobile);

  const safeRadius = Math.min( SVG_WIDTH / 2 - paddingX, SVG_HEIGHT / 2 - paddingY) * 0.85;
  return circles.map((circle, index) => {
    /*
     * 1. SPECIALIZED CENTER (Highest Priority)
     * Set by geometryPositions.js for specialized layout calculations.
     */
    const specializedCenter = circle.__renderCenter;

    /*
     * 2. DYNAMIC NORMAL CENTER DETECTOR (Fallback)
     * Finds center point by checking:
     *  a) Explicit circle.center ID in JSON
     *  b) Point labeled "O", "C", or "CENTER"
     *  c) Point ID named "point_o" or containing "center"
     */
    const centerPointId =
      (circle?.center && points?.[circle.center] ? circle.center : null) ||
      Object.keys(points || {}).find((id) => {
        const label = String(points[id]?.label || "").trim().toUpperCase();
        return label === "O" || label === "C" || label === "CENTER";
      }) ||
      Object.keys(points || {}).find((id) => {
        const lowerId = id.toLowerCase();
        return lowerId === "point_o" || lowerId.includes("center");
      });

    const normalCenter = centerPointId && positions?.[centerPointId] 
      ? positions[centerPointId] 
      : null;

    /*
     * 3. SELECT FINAL CENTER COORDINATES
     */
    const center = specializedCenter || normalCenter;

    // Guard check: skip rendering if coordinates are missing or NaN
    if (
      !center ||
      !Number.isFinite(Number(center.x)) ||
      !Number.isFinite(Number(center.y))
    ) {
      return null;
    }

    /*
     * 4. RADIUS EVALUATION
     */
    const calculatedRadius = Number(circle.__renderRadius);
    const renderRadius =
      Number.isFinite(calculatedRadius) && calculatedRadius > 0
        ? calculatedRadius
        : safeRadius;

    /*
     * 5. DRAW SVG CIRCLE
     */
    return (
      <circle
        key={circle.id || `circle-${index}`}
        cx={center.x}
        cy={center.y}
        r={renderRadius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    );
  });
}


export function renderArcs(
  arcsData,
  points,
  positions,
  relationships = [],
  angles = [],
  figure = null,   // NEW param
  isMobile = false,

) {
  if (!Array.isArray(arcsData) || arcsData.length === 0) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);

   return (relationships.filter((r) => r.type === "subtends_arc")).map((subtendsRel, index) => {
    // NOTE: iterate relationships directly now, not arcsData — since
    // feature:"segment" synthesizes the relationship but never adds a
    // matching element to arcsData. arcsData is still used below for
    // label lookup only, when a real arc element does exist (sector).
    const angleId = subtendsRel.elements?.[0];
    if (!angleId) return null;

    const formsAngleRel = relationships.find(
      (r) => r.type === "forms_angle" && r.target === angleId
    );
    if (!formsAngleRel) return null;

    const [firstId, vertexId, secondId] = formsAngleRel.elements || [];
    const vertex = positions?.[vertexId];
    const first = positions?.[firstId];
    const second = positions?.[secondId];

    if (!vertex || !first || !second || !Number.isFinite(vertex.x) || !Number.isFinite(first.x) || !Number.isFinite(second.x)) {
      return null;
    }

    const radius = Math.hypot(first.x - vertex.x, first.y - vertex.y);
    if (!Number.isFinite(radius) || radius <= 0) return null;

    const firstAngle = Math.atan2(first.y - vertex.y, first.x - vertex.x);
    const secondAngle = Math.atan2(second.y - vertex.y, second.x - vertex.x);

    let sweepDelta = secondAngle - firstAngle;
    while (sweepDelta < 0) sweepDelta += 2 * Math.PI;
    while (sweepDelta >= 2 * Math.PI) sweepDelta -= 2 * Math.PI;
    const delta1IsMinor = sweepDelta <= Math.PI;

    const arcEl = arcsData.find((a) => a.id === subtendsRel.target);
    const idLower = String(subtendsRel.target || "").toLowerCase();
    const labelLower = String(arcEl?.label || "").toLowerCase();
    const wantsMajor = idLower.includes("major") || labelLower.includes("major");

    let sweepFlag, largeArcFlag;
    if (wantsMajor) {
      largeArcFlag = 1;
      sweepFlag = delta1IsMinor ? 0 : 1;
    } else {
      largeArcFlag = 0;
      sweepFlag = delta1IsMinor ? 1 : 0;
    }

    const arcPathD = `M ${first.x} ${first.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${second.x} ${second.y}`;

    // KEY DIFFERENCE: segment fill = chord-to-arc region only (no
    // radii as boundary). Sector fill = full wedge through the vertex.
    const isSegmentFeature = figure?.type === "circle" && figure?.feature === "segment";
    const wedgePathD = isSegmentFeature
      ? `M ${first.x} ${first.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${second.x} ${second.y} Z`
      : `M ${vertex.x} ${vertex.y} L ${first.x} ${first.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${second.x} ${second.y} Z`;

    const extent = sweepFlag === 1 ? (delta1IsMinor ? sweepDelta : 2 * Math.PI - sweepDelta)
                                    : (delta1IsMinor ? 2 * Math.PI - sweepDelta : sweepDelta);
    const midAngle = sweepFlag === 1 ? firstAngle + extent / 2 : firstAngle - extent / 2;
    const labelOffset = 22;
    const labelX = vertex.x + Math.cos(midAngle) * (radius + labelOffset);
    const labelY = vertex.y + Math.sin(midAngle) * (radius + labelOffset);

    const showLabel = arcEl && arcEl.show_label !== false && (arcEl.label || arcEl.text);

    return (
      <g key={subtendsRel.target || `arc-${index}`}>
        <path d={wedgePathD} fill="currentColor" className="fill-indigo-100/60 dark:fill-indigo-500/10" stroke="none" />
        <path
          d={arcPathD}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth * 1.6}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-indigo-600 dark:stroke-indigo-300"
        />
        {showLabel && (
          <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} className="fill-slate-600 font-semibold">
            {arcEl.label || arcEl.text}
          </text>
        )}
      </g>
    );
  });
}


export function renderCoordinateGrid(plane, isMobile = false) {
  if (!plane) return null;

  const { minX, maxX, minY, maxY, tickX, tickY, toPixel } = plane;
  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);

  const xTicks = [];
  for (let x = Math.ceil(minX / tickX) * tickX; x <= maxX; x += tickX) {
    xTicks.push(Math.round(x * 1e6) / 1e6); // avoid float drift like 2.9999999
  }
  const yTicks = [];
  for (let y = Math.ceil(minY / tickY) * tickY; y <= maxY; y += tickY) {
    yTicks.push(Math.round(y * 1e6) / 1e6);
  }

  const origin = toPixel(0, 0);
  const xAxisStart = toPixel(minX, 0);
  const xAxisEnd = toPixel(maxX, 0);
  const yAxisStart = toPixel(0, minY);
  const yAxisEnd = toPixel(0, maxY);

  const TICK_LENGTH = 5;

  return (
    <g className="coordinate-grid">
      {/* Light gridlines */}
      {xTicks.map((x) => {
        const top = toPixel(x, maxY);
        const bottom = toPixel(x, minY);
        return (
          <line
            key={`grid-v-${x}`}
            x1={top.x} y1={top.y} x2={bottom.x} y2={bottom.y}
            stroke="currentColor"
            strokeWidth={strokeWidth * 0.75}
            className="text-slate-200 dark:text-slate-700"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
      {yTicks.map((y) => {
        const left = toPixel(minX, y);
        const right = toPixel(maxX, y);
        return (
          <line
            key={`grid-h-${y}`}
            x1={left.x} y1={left.y} x2={right.x} y2={right.y}
            stroke="currentColor"
            strokeWidth={strokeWidth * 0.4}
            className="text-slate-200 dark:text-slate-700"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      {/* Axes */}
      <line
        x1={xAxisStart.x} y1={xAxisStart.y} x2={xAxisEnd.x} y2={xAxisEnd.y}
        stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-800 dark:text-slate-100"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={yAxisStart.x} y1={yAxisStart.y} x2={yAxisEnd.x} y2={yAxisEnd.y}
        stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-800 dark:text-slate-100"
        vectorEffect="non-scaling-stroke"
      />

      {/* Tick marks + number labels on x-axis */}
      {xTicks.map((x) => {
        if (x === 0) return null; // skip origin label, drawn separately
        const p = toPixel(x, 0);
        return (
          <g key={`xtick-${x}`}>
            <line
              x1={p.x} y1={p.y - TICK_LENGTH} x2={p.x} y2={p.y + TICK_LENGTH}
              stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-800 dark:text-slate-100"
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={p.x} y={p.y + TICK_LENGTH + (isMobile ? 20: 10)}
              textAnchor="middle" fontSize={fontSize * (isMobile ? 0.95: 0.80)}
              className="fill-slate-600 select-none"
            >
              {x}
            </text>
          </g>
        );
      })}

      {/* Tick marks + number labels on y-axis */}
      {yTicks.map((y) => {
        if (y === 0) return null;
        const p = toPixel(0, y);
        return (
          <g key={`ytick-${y}`}>
            <line
              x1={p.x - TICK_LENGTH} y1={p.y} x2={p.x + TICK_LENGTH} y2={p.y}
              stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-800 dark:text-slate-100"
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={p.x - TICK_LENGTH - (isMobile ? 12: 6)} y={p.y}
              textAnchor="end" dominantBaseline="middle" fontSize={fontSize * (isMobile ? 0.95: 0.80)}
              className="fill-slate-600 select-none"
            >
              {y}
            </text>
          </g>
        );
      })}

      {/* Origin label */}
      <text
        x={origin.x -4} y={origin.y + (isMobile ? 20: 10)}
        textAnchor="end" fontSize={fontSize}
        className="fill-slate-800 select-none"
      >
        O
      </text>

      {/* Axis end arrows/labels */}
      <text x={xAxisEnd.x + (isMobile ? 12: 8)} y={xAxisEnd.y} dominantBaseline="middle" fontSize={fontSize} className="fill-slate-800 font-semibold">x</text>
      <text x={yAxisEnd.x} y={yAxisEnd.y - (isMobile ? 12: 8)} textAnchor="middle" fontSize={fontSize} className="fill-slate-800 font-semibold">y</text>
    </g>
  );
}

export function renderCollinear(
  relationships,
  positions,
  isMobile = false
) {
  if (!Array.isArray(relationships) || relationships.length === 0) {
    return null;
  }

  const { strokeWidth } = getSvgDimensions(isMobile);

  return relationships
    .filter((rel) => rel && rel.type === "collinear")
    .map((rel, idx) => {
      // 1. Resolve point IDs (fallback sequence)
      const pointIds =
        rel.__renderPolyline ||
        rel.points ||
        rel.elements ||
        [];

      if (!Array.isArray(pointIds) || pointIds.length < 2) {
        return null;
      }

      // 2. Map IDs to valid coordinates with finite numeric guards
      const pts = pointIds
        .map((id) => positions?.[id])
        .filter(
          (p) =>
            p &&
            Number.isFinite(Number(p.x)) &&
            Number.isFinite(Number(p.y))
        );

      if (pts.length >= 2) {
        const pointsAttr = pts.map((p) => `${p.x},${p.y}`).join(" ");

        return (
          <polyline
            key={rel.id || `collinear-${idx}`}
            points={pointsAttr}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray="4 4"
            fill="none"
            vectorEffect="non-scaling-stroke"
            className="stroke-slate-500 dark:stroke-slate-400"
          />
        );
      }

      return null;
    });
}