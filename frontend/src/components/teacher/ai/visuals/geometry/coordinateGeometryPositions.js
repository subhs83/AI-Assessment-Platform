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
  relationships,
  figure,
  isMobile = false,
  isCoordinateGeometry
}) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile, isCoordinateGeometry);
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
   const plane = computeCoordinatePlane(figure?.bounds, dataPoints, SVG_WIDTH, SVG_HEIGHT, paddingX, paddingY);
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

  return { positions, plane };
}

