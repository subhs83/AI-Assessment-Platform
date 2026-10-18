import { getSvgDimensions } from "./geometryHelpers";

export function calculateSemicircleGeometry(visual, isMobile = false) {
  const fail = (error) => ({ valid: false, error });

  const { figure, elements, relationships } = visual || {};

  if (
    figure?.type !== "circle" ||
    figure?.subtype !== "semicircle" ||
    !["area", "arc_length", "perimeter"].includes(figure.feature)
  ) {
    return fail("Unsupported semicircle.");
  }

  if (!Array.isArray(elements) || !Array.isArray(relationships)) {
    return fail("Missing elements or relationships.");
  }

  const byId = new Map();

  for (const element of elements) {
    if (
      !element ||
      typeof element.id !== "string" ||
      !element.id.trim() ||
      byId.has(element.id) ||
      !["point", "segment", "circle"].includes(element.type) ||
      (element.label !== undefined && typeof element.label !== "string")
    ) {
      return fail("Invalid or duplicate element.");
    }

    byId.set(element.id, element);
  }

  const allowedRelationships = new Set([
    "is_center_of",
    "forms_segment",
    "is_diameter_of",
    "is_radius_of",
    "is_on_circumference",
  ]);

  for (const relationship of relationships) {
    if (
      !relationship ||
      !allowedRelationships.has(relationship.type) ||
      !Array.isArray(relationship.elements) ||
      relationship.elements.length === 0 ||
      !byId.has(relationship.target) ||
      relationship.elements.some((id) => !byId.has(id))
    ) {
      return fail("Invalid semicircle relationship.");
    }
  }

  const circles = elements.filter((e) => e.type === "circle");
  if (circles.length !== 1) return fail("Exactly one circle is required.");

  const circleId = circles[0].id;

  const centers = relationships.filter((r) => r.type === "is_center_of");
  const diameters = relationships.filter((r) => r.type === "is_diameter_of");

  if (
    centers.length !== 1 ||
    diameters.length !== 1 ||
    centers[0].target !== circleId ||
    diameters[0].target !== circleId ||
    centers[0].elements.length !== 1 ||
    diameters[0].elements.length !== 1
  ) {
    return fail("One centre and one diameter are required.");
  }

  const centerId = centers[0].elements[0];
  const diameterId = diameters[0].elements[0];
  const center = byId.get(centerId);
  const diameter = byId.get(diameterId);

  if (center.type !== "point" || diameter.type !== "segment") {
    return fail("Invalid centre or diameter element.");
  }

  const segmentEndpoints = new Map();

  for (const link of relationships.filter((r) => r.type === "forms_segment")) {
    if (
      link.elements.length !== 2 ||
      link.elements[0] === link.elements[1] ||
      byId.get(link.target).type !== "segment" ||
      link.elements.some((id) => byId.get(id).type !== "point") ||
      segmentEndpoints.has(link.target)
    ) {
      return fail("Invalid or duplicate segment endpoints.");
    }

    segmentEndpoints.set(link.target, link.elements);
  }

  const endpoints = segmentEndpoints.get(diameterId);

  if (!endpoints || endpoints.includes(centerId)) {
    return fail("Diameter needs two distinct circumference endpoints.");
  }

  const [leftId, rightId] = endpoints;
  const pointIds = new Set([leftId, centerId, rightId]);

  // This initial semicircle implementation supports the centre
  // and the two diameter endpoints.
  if (
    elements.some((e) => e.type === "point" && !pointIds.has(e.id))
  ) {
    return fail("Additional semicircle points are not supported yet.");
  }

  for (const link of relationships.filter(
    (r) => r.type === "is_on_circumference"
  )) {
    if (
      link.target !== circleId ||
      link.elements.some((id) => !endpoints.includes(id))
    ) {
      return fail("Invalid circumference point.");
    }
  }

  const supportedSegments = new Set([diameterId]);
  const radiusIds = new Set();

  for (const link of relationships.filter((r) => r.type === "is_radius_of")) {
    if (link.target !== circleId || link.elements.length !== 1) {
      return fail("Invalid radius relationship.");
    }

    const id = link.elements[0];
    const pair = segmentEndpoints.get(id);

    if (
      radiusIds.has(id) ||
      !pair ||
      !pair.includes(centerId) ||
      !pair.some((pointId) => endpoints.includes(pointId))
    ) {
      return fail("Radius must connect the centre to a diameter endpoint.");
    }

    radiusIds.add(id);
    supportedSegments.add(id);
  }

  if (
    elements.some(
      (e) => e.type === "segment" && !supportedSegments.has(e.id)
    )
  ) {
    return fail("Unclassified semicircle segment.");
  }

  const measurements = [];

  for (const id of supportedSegments) {
    const segment = byId.get(id);

    // No automatic derived measurements.
    if (segment.value === undefined || segment.value === null) continue;

    if (
      !["string", "number"].includes(typeof segment.value) ||
      (typeof segment.value === "number" &&
        (!Number.isFinite(segment.value) || segment.value <= 0))
    ) {
      return fail("Invalid measurement value.");
    }

    const text = String(segment.value).trim();
    if (!text) continue;

    measurements.push({
      id,
      text,
      endpoints: segmentEndpoints.get(id),
    });
  }

  const svg = getSvgDimensions(isMobile);
  const { width, height, fontSize, paddingX, paddingY } = svg;

  const marginX = Math.max(paddingX, fontSize * 2.5);
  const topSpace = Math.max(paddingY, fontSize * 1.5);

  // Separate point names from measurement guides below the diameter.
  const bottomSpace = Math.max(
    paddingY,
    fontSize * (2.7 + measurements.length * 2.5)
  );

  const radius = Math.min(
    (width - marginX * 2) / 2,
    height - topSpace - bottomSpace
  );

  if (!(radius > 0)) return fail("Insufficient SVG space.");

  const shapeTop =
    topSpace + (height - topSpace - bottomSpace - radius) / 2;

  const cx = width / 2;
  const baselineY = shapeTop + radius;

  const positions = {
    [leftId]: { x: cx - radius, y: baselineY },
    [centerId]: { x: cx, y: baselineY },
    [rightId]: { x: cx + radius, y: baselineY },
  };

  const guides = measurements.map((measurement, index) => {
    const [a, b] = measurement.endpoints.map((id) => positions[id]);
    const guideY = baselineY + fontSize * (2.5 + index * 2.5);

    return {
      id: measurement.id,
      text: measurement.text,
      start: { x: Math.min(a.x, b.x), y: guideY },
      end: { x: Math.max(a.x, b.x), y: guideY },
      labelX: (a.x + b.x) / 2,
      labelY: guideY + fontSize * 1.15,
    };
  });

  const arcPath =
    `M ${cx - radius} ${baselineY} ` +
    `A ${radius} ${radius} 0 0 1 ${cx + radius} ${baselineY}`;

  return {
    ...svg,
    valid: true,
    feature: figure.feature,
    arcPath,
    regionPath: `${arcPath} Z`,
    left: positions[leftId],
    right: positions[rightId],
    points: [leftId, centerId, rightId].map((id) => ({
      id,
      label: byId.get(id).label || "",
      ...positions[id],
    })),
    guides,
  };
}