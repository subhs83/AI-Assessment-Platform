// coordinateGeometryPositions.js
//
// Parallel to geometryPositions.js, but for a fundamentally different
// model: coordinates are GIVEN in real units (not chosen schematically),
// so this module computes a scaled Cartesian plane from the actual data,
// then transforms every point through that plane into pixel positions.
// Everything downstream (renderPoints, renderSegments, renderAngles)
// consumes the resulting `positions` exactly like every other shape
// family — it only ever needs pixel coordinates, never real ones.

import { 
    getSvgDimensions,
    computeCoordinatePlane,
    parseCoordinate
 } from "./geometryHelpers";


/*
 * ------------------------------------------
 * MAIN ENTRY POINT
 * ------------------------------------------
 * Mirrors calculateGeometryPositions' signature/shape as closely as
 * possible, but returns { positions, plane } instead of just positions,
 * since the render layer needs the plane config to draw the grid.
 */
export function calculateCoordinateGeometryPositions({
  points,
  segments,
  angles,
  circles = [], // ADDED
  relationships,
  figure,
  isMobile = false,
}) {
  const {
  width: SVG_WIDTH,
  height: SVG_HEIGHT,
  paddingX,
  paddingY,
  fontSize,
} = getSvgDimensions(isMobile);

// Reserve space for tick numbers and axis labels.
const planePaddingX = Math.max(paddingX, fontSize * 3);
const planePaddingY = Math.max(paddingY, fontSize * 2.5);
  const positions = {};

  // --------------------------------------------------
  // 1. Extract every point's real (x, y) coordinate — now reading
  // directly from the element's own x/y fields (the actual format
  // this prompt version produces), falling back to the old
  // value/label-string parsing for backward compatibility with any
  // differently-shaped JSON.
  // --------------------------------------------------
  const realCoords = {};
  Object.keys(points).forEach((pid) => {
    const pt = points[pid];
    if (Number.isFinite(pt.x) && Number.isFinite(pt.y)) {
      realCoords[pid] = { x: pt.x, y: pt.y };
    } else {
      const coord = parseCoordinate(pt.value) || parseCoordinate(pt.label);
      if (coord) realCoords[pid] = coord;
    }
  });

  const dataPoints = Object.values(realCoords);

  if (dataPoints.length === 0) {
    console.warn("[COORDINATE GEOMETRY] No parseable (x, y) coordinates found in points:", points);
    return { positions, plane: null };
  }

  // --------------------------------------------------
  // 2. Compute the plane — prefer explicit figure.bounds when given
  // (more reliable than inferring from points, especially when there's
  // only one point, like Q3), falling back to inferring from the data
  // points themselves when bounds aren't provided.
  // --------------------------------------------------
     const isUnitCircle =
    figure?.type === "coordinate_geometry" &&
    figure?.subtype === "unit_circle";

  // Include the full unit circle and space around its boundary.
  // Other coordinate-geometry figures retain their existing bounds.
  const planeBounds = isUnitCircle
    ? {
        x_min: -1.35,
        x_max: 1.35,
        y_min: -1.35,
        y_max: 1.35,
      }
    : figure?.bounds;

  const plane = computeCoordinatePlane(
    planeBounds,
    dataPoints,
    SVG_WIDTH,
    SVG_HEIGHT,
    planePaddingX,
    planePaddingY,
    {
      tickStep: isUnitCircle ? 1 : figure?.tick_step,
    }
  );
  // --------------------------------------------------
  // 3. Convert every real coordinate into a pixel position.
  // --------------------------------------------------
  Object.keys(realCoords).forEach((pid) => {
    const { x, y } = realCoords[pid];
    positions[pid] = { ...plane.toPixel(x, y), labelAnchor: "auto" };
  });

  // --------------------------------------------------
  // 4 & 5. Generic forms_segment / forms_angle wiring — unchanged.
  // --------------------------------------------------
  relationships
    .filter((r) => r.type === "forms_segment" || r.type === "connected_to")
    .forEach((rel) => {
      const [ptA, ptB] = rel.elements || [];
      const segId =
        rel.target || `segment_${(ptA || "").replace("point_", "")}${(ptB || "").replace("point_", "")}`;
      if (!ptA || !ptB) return;
      if (!positions[ptA] || !positions[ptB]) return;

      let segObj = segments.find((s) => s.id === segId);
      if (segObj) { segObj.start = ptA; segObj.end = ptB; segObj.type = "segment"; }
      else segments.push({ id: segId, type: "segment", start: ptA, end: ptB });
    });

  relationships
    .filter((r) => r.type === "forms_angle")
    .forEach((rel) => {
      const [firstId, vertexId, secondId] = rel.elements || [];
      const angleId = rel.target;
      if (!firstId || !vertexId || !secondId || !angleId) return;
      const firstLabel = points[firstId]?.label;
      const vertexLabel = points[vertexId]?.label;
      const secondLabel = points[secondId]?.label;
      if (!firstLabel || !vertexLabel || !secondLabel) return;
      let angleObj = angles.find((a) => a.id === angleId);
      if (angleObj) angleObj.elements = [firstLabel, vertexLabel, secondLabel];
      else angles.push({ id: angleId, type: "angle", elements: [firstLabel, vertexLabel, secondLabel] });
    });

    // Handle full lines — declared either via `passes_through` (line ->
    // [pointA, pointB]) or `forms_line` (elements: [pointA, pointB] ->
    // line). Both describe the same thing: extend the line to the full
    // visible plane bounds, not just the segment between the two points.
    const lineRels = [
    ...relationships
        .filter((r) => r.type === "passes_through" && r.elements?.[0]?.startsWith("line_"))
        .map((r) => ({ lineId: r.elements[0], p1Id: r.target?.[0], p2Id: r.target?.[1] })),
    ...relationships
        .filter((r) => r.type === "forms_line")
        .map((r) => ({ lineId: r.target, p1Id: r.elements?.[0], p2Id: r.elements?.[1] })),
    ];

    lineRels.forEach(({ lineId, p1Id, p2Id }) => {
    if (!lineId || !p1Id || !p2Id) return;
    if (!positions[p1Id] || !positions[p2Id]) return;

    const p1 = positions[p1Id];
    const p2 = positions[p2Id];

    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-6) return;
    const ux = dx / len, uy = dy / len;

    const planeMinPx = plane.toPixel(plane.minX, plane.minY);
    const planeMaxPx = plane.toPixel(plane.maxX, plane.maxY);
    const pxLeft = Math.min(planeMinPx.x, planeMaxPx.x);
    const pxRight = Math.max(planeMinPx.x, planeMaxPx.x);
    const pxTop = Math.min(planeMinPx.y, planeMaxPx.y);
    const pxBottom = Math.max(planeMinPx.y, planeMaxPx.y);

    const maxTInBounds = (p, dirX, dirY) => {
        let tMax = Infinity;
        if (dirX > 1e-9) tMax = Math.min(tMax, (pxRight - p.x) / dirX);
        else if (dirX < -1e-9) tMax = Math.min(tMax, (pxLeft - p.x) / dirX);
        if (dirY > 1e-9) tMax = Math.min(tMax, (pxBottom - p.y) / dirY);
        else if (dirY < -1e-9) tMax = Math.min(tMax, (pxTop - p.y) / dirY);
        return Math.max(tMax, 0);
    };

    const tForward = maxTInBounds(p2, ux, uy);
    const tBackward = maxTInBounds(p1, -ux, -uy);

    const extStartId = `${lineId}_ext_start`;
    const extEndId = `${lineId}_ext_end`;

    positions[extStartId] = { x: p1.x - ux * tBackward, y: p1.y - uy * tBackward, labelAnchor: "auto" };
    positions[extEndId] = { x: p2.x + ux * tForward, y: p2.y + uy * tForward, labelAnchor: "auto" };

    let segObj = segments.find((s) => s.id === lineId);
    if (segObj) { segObj.start = extStartId; segObj.end = extEndId; segObj.type = "segment"; }
    else segments.push({ id: lineId, type: "segment", start: extStartId, end: extEndId });

    if (!points[extStartId]) points[extStartId] = { id: extStartId, type: "point", label: "", __synthetic: true };
    if (!points[extEndId]) points[extEndId] = { id: extEndId, type: "point", label: "", __synthetic: true };
    });

      if (isUnitCircle) {
    const failUnitCircle = (message) => {
      console.warn("[UNIT CIRCLE]", message);
      return {
        positions: {},
        plane: null,
        error: message,
      };
    };

    const angleDeg = figure.angle_deg;

    if (
      !Number.isFinite(angleDeg) ||
      angleDeg <= -360 ||
      angleDeg >= 360 ||
      angleDeg === 0
    ) {
      return failUnitCircle("Invalid signed construction angle.");
    }

    if (circles.length !== 1) {
      return failUnitCircle("Exactly one unit circle is required.");
    }

    const circle = circles[0];

    if (circle.radius !== 1) {
      return failUnitCircle("The unit-circle radius must be 1.");
    }

    const centerLinks = relationships.filter(
      (r) =>
        r.type === "is_center_of" &&
        r.target === circle.id
    );

    if (
      centerLinks.length !== 1 ||
      centerLinks[0].elements?.length !== 1
    ) {
      return failUnitCircle("Missing or ambiguous circle centre.");
    }

    const centerId = centerLinks[0].elements[0];
    const center = realCoords[centerId];

    if (
      !center ||
      Math.hypot(center.x, center.y) > 1e-6
    ) {
      return failUnitCircle("The unit circle must be centred at the origin.");
    }

    const rotationLinks = relationships.filter(
      (r) => r.type === "marks_rotation"
    );

    if (
      rotationLinks.length !== 1 ||
      rotationLinks[0].elements?.length !== 1
    ) {
      return failUnitCircle("Exactly one marks_rotation link is required.");
    }

    const rotationLink = rotationLinks[0];
    const angle = angles.find(
      (item) => item.id === rotationLink.elements[0]
    );

    const radius = segments.find(
      (item) => item.id === rotationLink.target
    );

    if (
      !angle ||
      !radius ||
      radius.start !== centerId ||
      !realCoords[radius.end]
    ) {
      return failUnitCircle(
        "The rotation must reference an angle and a radius from the centre."
      );
    }

    const linkedAsRadius = relationships.some(
      (r) =>
        r.type === "is_radius_of" &&
        r.target === circle.id &&
        r.elements?.includes(radius.id)
    );

    if (!linkedAsRadius) {
      return failUnitCircle("The terminal segment must be linked as a radius.");
    }

    const terminalId = radius.end;
    const terminal = realCoords[terminalId];
    const radians = (angleDeg * Math.PI) / 180;

    // Allow rounding of generated coordinates to six decimal places.
    if (
      Math.hypot(
        terminal.x - Math.cos(radians),
        terminal.y - Math.sin(radians)
      ) > 2e-6
    ) {
      return failUnitCircle(
        "The terminal point disagrees with the construction angle."
      );
    }

      const hasGivenAngle =
      angle.value !== undefined && angle.value !== null;

    if (
      hasGivenAngle &&
      (
        !Number.isFinite(angle.value) ||
        Math.abs(angle.value - angleDeg) > 1e-6
      )
    ) {
      return failUnitCircle(
        "The given angle value must match the signed construction angle."
      );
    }

    if (typeof angle.label !== "string" || !angle.label.trim()) {
      return failUnitCircle("The angle needs a given or symbolic label.");
    }

    const centerPx = plane.toPixel(0, 0);
    const unitPx = plane.toPixel(1, 0);
    const radiusPx = Math.hypot(
      unitPx.x - centerPx.x,
      unitPx.y - centerPx.y
    );

    // Reuse the existing circle renderer's explicit pixel geometry.
    circle.center = centerId;
    circle.__renderCenter = centerPx;
    circle.__renderRadius = radiusPx;

    // Dedicated metadata for the upcoming signed rotation renderer.
    plane.unitCircle = {
      centerId,
      terminalId,
      center: centerPx,
      terminal: positions[terminalId],
      radius: radiusPx,
      angleDeg,
      angleId: angle.id,

      // Use the supplied label only; never expose a hidden angle value.
      angleLabel: angle.label,
    };
  }

  return { positions, plane };

  return { positions, plane };
}

