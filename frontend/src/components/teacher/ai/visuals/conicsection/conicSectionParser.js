// conicsection/conicSectionParser.js

const FEATURES_BY_SUBTYPE = {
  circle: [
    "identify_conic",
    "identify_equation",
    "find_center",
  ],
  parabola: [
    "identify_conic",
    "identify_equation",
    "find_vertex",
    "find_focus",
    "find_directrix",
    "find_eccentricity",
    "find_latus_rectum", // ADDED
    "find_height",
    "find_width",
  ],
  ellipse: [
    "identify_conic",
    "identify_equation",
    "find_center",
    "find_vertex",
    "find_focus",
    "find_directrix",
    "find_eccentricity",
    "find_axis_length",
    "find_latus_rectum", // ADDED
    "find_height",
    "find_width",
  ],
  hyperbola: [
    "identify_conic",
    "identify_equation",
    "find_center",
    "find_vertex",
    "find_focus",
    "find_directrix",
    "find_eccentricity",
    "find_axis_length",
    "find_asymptote",
    "find_latus_rectum", // ADDED
  ],
};

const POINT_ROLES = new Set([
  "center",
  "vertex",
  "focus",
  "co_vertex",
  "on_curve",
]);

const LINE_ROLES = new Set([
  "directrix",
  "asymptote",
  "axis_of_symmetry",
]);

// ADDED: finite-segment annotation roles.
const SEGMENT_ROLES = new Set([
  "latus_rectum",
  "radius",
  "major_axis",
  "minor_axis",
  "transverse_axis",
  "conjugate_axis",
  "construction",
]);

function invalid(error) {
  return {
    valid: false,
    error,
    figure: null,
    conic: null,
    points: [],
    lines: [],
    segments: [], // ADDED
  };
}

export function parseConicSection(visual) {
  const { figure, elements, relationships } = visual || {};
  const subtype = figure?.subtype;

  if (
    figure?.type !== "conic_section" ||
    !Object.prototype.hasOwnProperty.call(FEATURES_BY_SUBTYPE, subtype) ||
    !FEATURES_BY_SUBTYPE[subtype].includes(figure.feature)
  ) {
    return invalid("Unsupported conic subtype or feature.");
  }

  if (!Array.isArray(elements) || !Array.isArray(relationships)) {
    return invalid("Elements and relationships must be arrays.");
  }

  // -------------------------------------------------------
  // Figure settings
  // -------------------------------------------------------

  const bounds = figure.bounds;

  if (
    !bounds ||
    !["x_min", "x_max", "y_min", "y_max"].every(
      (key) => Number.isFinite(bounds[key])
    ) ||
    bounds.x_min >= bounds.x_max ||
    bounds.y_min >= bounds.y_max ||
    bounds.x_min > 0 ||
    bounds.x_max < 0 ||
    bounds.y_min > 0 ||
    bounds.y_max < 0
  ) {
    return invalid("Conic bounds must have positive spans and include the origin.");
  }

  const spanX = bounds.x_max - bounds.x_min;
  const spanY = bounds.y_max - bounds.y_min;

  if (!Number.isFinite(spanX) || !Number.isFinite(spanY)) {
    return invalid("Conic bounds are too large.");
  }

  if (
    figure.tick_step !== undefined &&
    (!Number.isFinite(figure.tick_step) || figure.tick_step <= 0)
  ) {
    return invalid("tick_step must be a positive number.");
  }

  if (figure.tick_step !== undefined) {
    for (const [min, max] of [
      [bounds.x_min, bounds.x_max],
      [bounds.y_min, bounds.y_max],
    ]) {
      const first = Math.ceil(min / figure.tick_step);
      const last = Math.floor(max / figure.tick_step);

      if (
        !Number.isSafeInteger(first) ||
        !Number.isSafeInteger(last) ||
        last - first + 1 > 200
      ) {
        return invalid("Tick spacing produces too many axis ticks.");
      }
    }
  }

  if (
    figure.show_grid !== undefined &&
    typeof figure.show_grid !== "boolean"
  ) {
    return invalid("show_grid must be a boolean.");
  }

  // -------------------------------------------------------
  // Elements
  // -------------------------------------------------------

  const byId = new Map();

  for (const element of elements) {
    if (
      !element ||
      typeof element.id !== "string" ||
      !element.id.trim() ||
      byId.has(element.id) ||
      !["conic", "point", "line", "segment"].includes(element.type) ||
      (element.label !== undefined && typeof element.label !== "string")
    ) {
      return invalid("Invalid or duplicate conic element.");
    }

    if (
      element.type === "point" &&
      (!Number.isFinite(element.x) || !Number.isFinite(element.y))
    ) {
      return invalid("Points need finite coordinates.");
    }

    byId.set(element.id, {
      ...element,
      label: element.label?.trim() || "",
    });
  }

  const conicElements = [...byId.values()].filter(
    (element) => element.type === "conic"
  );

  if (conicElements.length !== 1) {
    return invalid("Exactly one conic element is required.");
  }

  const conic = { ...conicElements[0], subtype };

  if (!Number.isFinite(conic.h) || !Number.isFinite(conic.k)) {
    return invalid("The conic needs finite h and k values.");
  }

  if (subtype === "circle") {
    if (!Number.isFinite(conic.r) || conic.r <= 0) {
      return invalid("Circle radius must be positive.");
    }
  } else {
    if (!["horizontal", "vertical"].includes(conic.orientation)) {
      return invalid("Conic orientation must be horizontal or vertical.");
    }

    if (subtype === "parabola") {
      if (!Number.isFinite(conic.p) || conic.p === 0) {
        return invalid("Parabola p must be finite and nonzero.");
      }
    } else {
      if (
        !Number.isFinite(conic.a) ||
        !Number.isFinite(conic.b) ||
        conic.a <= 0 ||
        conic.b <= 0
      ) {
        return invalid("Conic a and b must be positive.");
      }

      if (subtype === "ellipse" && conic.a <= conic.b) {
        return invalid("An ellipse needs a > b; use circle for equal radii.");
      }
    }
  }

  // Tolerance accommodates rounded coordinates from generated JSON.
  const size =
    subtype === "circle"
      ? conic.r
      : subtype === "parabola"
        ? Math.abs(conic.p)
        : Math.max(conic.a, conic.b);

  const tolerance = Math.max(
    size * 1e-4,
    Number.EPSILON * Math.max(1, Math.abs(conic.h), Math.abs(conic.k)) * 32
  );

  const near = (a, b) => Math.abs(a - b) <= tolerance;

  const horizontal = conic.orientation === "horizontal";

  // u follows the opening / major / transverse axis.
  // v follows the perpendicular axis.
  const local = (point) => {
    const x = point.x - conic.h;
    const y = point.y - conic.k;

    return horizontal ? { u: x, v: y } : { u: y, v: x };
  };

  const c =
    subtype === "ellipse"
      ? conic.a * Math.sqrt(1 - (conic.b / conic.a) ** 2)
      : subtype === "hyperbola"
        ? Math.hypot(conic.a, conic.b)
        : null;

  if (c !== null && (!Number.isFinite(c) || c <= 0)) {
    return invalid("Conic parameters produce invalid focal geometry.");
  }

  const insideBounds = (point) =>
    point.x >= bounds.x_min - tolerance &&
    point.x <= bounds.x_max + tolerance &&
    point.y >= bounds.y_min - tolerance &&
    point.y <= bounds.y_max + tolerance;

  const fromLocal = (u, v) =>
    horizontal
      ? { x: conic.h + u, y: conic.k + v }
      : { x: conic.h + v, y: conic.k + u };

  // Optional finite portion of a conic.
  // Existing payloads without curve_interval keep their current behaviour.
  let restrictedPoints = null;

  if (conic.curve_interval !== undefined) {
    const interval = conic.curve_interval;

    if (
      !interval ||
      typeof interval !== "object" ||
      Array.isArray(interval) ||
      !["x", "y"].includes(interval.axis) ||
      !Number.isFinite(interval.lower) ||
      !Number.isFinite(interval.upper) ||
      interval.lower >= interval.upper ||
      !Number.isFinite(interval.upper - interval.lower)
    ) {
      return invalid("Invalid conic curve_interval.");
    }

    if (subtype === "hyperbola") {
      return invalid("Hyperbola curve restrictions are unsupported.");
    }

    const { axis } = interval;
    let { lower, upper } = interval;
    let pointAt;
    let turningCoordinate;

    if (subtype === "parabola") {
      const expectedAxis = horizontal ? "y" : "x";

      if (
        axis !== expectedAxis ||
        interval.branch !== undefined
      ) {
        return invalid(
          "Parabola interval must use its input axis without branch."
        );
      }

      turningCoordinate = horizontal ? conic.k : conic.h;

      pointAt = (value) => {
        const v = value - turningCoordinate;
        const u = (v / conic.p) * (v / 4);
        return fromLocal(u, v);
      };

      conic.curve_interval = { axis, lower, upper };
    } else {
      // World-axis radii: branch names do not depend on orientation.
      const rx =
        subtype === "circle"
          ? conic.r
          : horizontal ? conic.a : conic.b;

      const ry =
        subtype === "circle"
          ? conic.r
          : horizontal ? conic.b : conic.a;

      const allowedBranches =
        axis === "x" ? ["upper", "lower"] : ["left", "right"];

      if (!allowedBranches.includes(interval.branch)) {
        return invalid("Curve branch does not match the interval axis.");
      }

      const center = axis === "x" ? conic.h : conic.k;
      const radius = axis === "x" ? rx : ry;
      const minimum = center - radius;
      const maximum = center + radius;

      if (
        !Number.isFinite(minimum) ||
        !Number.isFinite(maximum) ||
        lower < minimum - tolerance ||
        upper > maximum + tolerance
      ) {
        return invalid("Curve interval exceeds the circle or ellipse.");
      }

      // Accommodate rounded endpoints without taking sqrt of a negative.
      lower = Math.max(minimum, lower);
      upper = Math.min(maximum, upper);

      if (lower >= upper) {
        return invalid("Curve interval must have positive length.");
      }

      const sign =
        ["upper", "right"].includes(interval.branch) ? 1 : -1;

      turningCoordinate = center;

      pointAt = (value) => {
        const ratio = (value - center) / radius;
        const factor = Math.sqrt(Math.max(0, 1 - ratio * ratio));

        return axis === "x"
          ? { x: value, y: conic.k + sign * ry * factor }
          : { x: conic.h + sign * rx * factor, y: value };
      };

      conic.curve_interval = {
        axis,
        lower,
        upper,
        branch: interval.branch,
      };
    }

    // Endpoints plus any interior turning point cover all extrema
    // of these supported finite branches.
    const coordinates = [lower, upper];

    if (
      turningCoordinate > lower &&
      turningCoordinate < upper
    ) {
      coordinates.push(turningCoordinate);
    }

    restrictedPoints = coordinates.map(pointAt);

    if (
      restrictedPoints.some(
        (point) =>
          !Number.isFinite(point.x) ||
          !Number.isFinite(point.y) ||
          !insideBounds(point)
      )
    ) {
      return invalid("Bounds exclude part of the restricted curve.");
    }
  }

  // Ensure the essential curve is visible.
  // Restricted curves need only their selected portion inside bounds.
  let requiredPoints;

  if (restrictedPoints) {
    requiredPoints = restrictedPoints;
  } else if (subtype === "circle") {
    requiredPoints = [
      { x: conic.h - conic.r, y: conic.k },
      { x: conic.h + conic.r, y: conic.k },
      { x: conic.h, y: conic.k - conic.r },
      { x: conic.h, y: conic.k + conic.r },
    ];
  } else if (subtype === "ellipse") {
    requiredPoints = [
      fromLocal(-conic.a, 0),
      fromLocal(conic.a, 0),
      fromLocal(0, -conic.b),
      fromLocal(0, conic.b),
    ];
  } else if (subtype === "hyperbola") {
    requiredPoints = [
      fromLocal(-conic.a, 0),
      fromLocal(conic.a, 0),
    ];
  } else {
    requiredPoints = [{ x: conic.h, y: conic.k }];
  }

  if (
    requiredPoints.some(
      (point) =>
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y) ||
        !insideBounds(point)
    )
  ) {
    return invalid("Bounds exclude the conic's centre, vertex, or extrema.");
  }

  // -------------------------------------------------------
  // Relationships
  // -------------------------------------------------------

  for (const relationship of relationships) {
    if (
      !relationship ||
      ![
        "marks_point",
        "forms_line",
        "marks_line",
        "forms_segment",
        "marks_segment",
      ].includes(relationship.type) ||
      !Array.isArray(relationship.elements) ||
      relationship.elements.length === 0 ||
      new Set(relationship.elements).size !== relationship.elements.length ||
      !byId.has(relationship.target) ||
      relationship.elements.some((id) => !byId.has(id))
    ) {
      return invalid("Invalid conic relationship references.");
    }
  }

  // -------------------------------------------------------
  // Point annotations
  // -------------------------------------------------------

  const matchesPointRole = (point, role) => {
    const x = point.x - conic.h;
    const y = point.y - conic.k;
    const { u, v } = local(point);

    if (role === "center") {
      return subtype !== "parabola" && near(x, 0) && near(y, 0);
    }

    if (role === "vertex") {
      if (subtype === "parabola") return near(u, 0) && near(v, 0);

      return (
        ["ellipse", "hyperbola"].includes(subtype) &&
        near(Math.abs(u), conic.a) &&
        near(v, 0)
      );
    }

    if (role === "focus") {
      if (subtype === "parabola") {
        return near(u, conic.p) && near(v, 0);
      }

      return (
        ["ellipse", "hyperbola"].includes(subtype) &&
        near(Math.abs(u), c) &&
        near(v, 0)
      );
    }

    if (role === "co_vertex") {
      // Ellipse: minor-axis endpoints.
      // Hyperbola: conjugate-axis endpoints, not points on the curve.
      return (
        ["ellipse", "hyperbola"].includes(subtype) &&
        near(u, 0) &&
        near(Math.abs(v), conic.b)
      );
    }

    if (subtype === "circle") {
      return near(Math.hypot(x, y), conic.r);
    }

    if (subtype === "parabola") {
      const expectedU = (v / (4 * conic.p)) * v;
      return Number.isFinite(expectedU) && near(u, expectedU);
    }

    if (subtype === "ellipse") {
      return Math.abs(Math.hypot(u / conic.a, v / conic.b) - 1) <= 1e-4;
    }

    const expectedU = conic.a * Math.hypot(1, v / conic.b);
    return Number.isFinite(expectedU) && near(Math.abs(u), expectedU);
  };

  const points = [];
  const markedPointIds = new Set();

  for (const link of relationships.filter((r) => r.type === "marks_point")) {
    if (link.target !== conic.id || !POINT_ROLES.has(link.role)) {
      return invalid("Invalid conic point annotation.");
    }

    for (const id of link.elements) {
      const point = byId.get(id);

      if (
        point.type !== "point" ||
        markedPointIds.has(id) ||
        !matchesPointRole(point, link.role)
      ) {
        return invalid("Point annotation disagrees with the conic.");
      }

      if (!insideBounds(point)) {
        return invalid("Bounds exclude a marked point.");
      }

      markedPointIds.add(id);
      points.push({ ...point, role: link.role });
    }
  }

  // -------------------------------------------------------
  // Lines: first resolve endpoints, then annotation roles
  // -------------------------------------------------------

  const definedLines = new Map();
  const linePointIds = new Set();

  for (const link of relationships.filter((r) => r.type === "forms_line")) {
    const line = byId.get(link.target);

    if (
      line.type !== "line" ||
      definedLines.has(line.id) ||
      link.elements.length !== 2 ||
      link.elements.some((id) => byId.get(id).type !== "point")
    ) {
      return invalid("A conic line needs two point references.");
    }

    const [a, b] = link.elements.map((id) => byId.get(id));
    const length = Math.hypot(b.x - a.x, b.y - a.y);

    if (!Number.isFinite(length) || length <= tolerance) {
      return invalid("Line endpoints must have distinct positions.");
    }

    definedLines.set(line.id, {
      ...line,
      a: { ...a },
      b: { ...b },
    });

    link.elements.forEach((id) => linePointIds.add(id));
  }

  const matchesLineRole = (line, role) => {
    const a = local(line.a);
    const b = local(line.b);

    if (role === "directrix") {
      if (subtype === "circle") return false;

      if (subtype === "parabola") {
        return near(a.u, -conic.p) && near(b.u, -conic.p);
      }

      const distance = conic.a * (conic.a / c);

      return (
        Number.isFinite(distance) &&
        [-distance, distance].some(
          (value) => near(a.u, value) && near(b.u, value)
        )
      );
    }

    if (role === "asymptote") {
      if (subtype !== "hyperbola") return false;

      // Normalised line equation avoids slope division.
      const normalLength = Math.hypot(conic.a, conic.b);
      const nu = conic.b / normalLength;
      const nv = conic.a / normalLength;

      return [-1, 1].some(
        (sign) =>
          Math.abs(nu * a.u - sign * nv * a.v) <= tolerance &&
          Math.abs(nu * b.u - sign * nv * b.v) <= tolerance
      );
    }

    if (subtype === "circle") {
      const dx = line.b.x - line.a.x;
      const dy = line.b.y - line.a.y;
      const length = Math.hypot(dx, dy);

      const distance = Math.abs(
        (conic.h - line.a.x) * (dy / length) -
        (conic.k - line.a.y) * (dx / length)
      );

      return distance <= tolerance;
    }

    if (subtype === "parabola") {
      return near(a.v, 0) && near(b.v, 0);
    }

    return (
      (near(a.v, 0) && near(b.v, 0)) ||
      (near(a.u, 0) && near(b.u, 0))
    );
  };

  const lines = [];
  const markedLineIds = new Set();

  for (const link of relationships.filter((r) => r.type === "marks_line")) {
    if (link.target !== conic.id || !LINE_ROLES.has(link.role)) {
      return invalid("Invalid conic line annotation.");
    }

    for (const id of link.elements) {
      const line = definedLines.get(id);

      if (
        !line ||
        markedLineIds.has(id) ||
        !matchesLineRole(line, link.role)
      ) {
        return invalid("Line annotation disagrees with the conic.");
      }

      markedLineIds.add(id);
      lines.push({ ...line, role: link.role });
    }
  }

  // Every supplied line must be defined and linked.
  const lineElements = [...byId.values()].filter(
    (element) => element.type === "line"
  );

  if (
    definedLines.size !== lineElements.length ||
    markedLineIds.size !== lineElements.length
  ) {
    return invalid("Every line needs forms_line and marks_line relationships.");
  }

    // -------------------------------------------------------
  // ADDED: finite segments and their mathematical roles
  // -------------------------------------------------------

  const definedSegments = new Map();
  const segmentPointIds = new Set();

  for (const link of relationships.filter(
    (r) => r.type === "forms_segment"
  )) {
    const segment = byId.get(link.target);

    if (
      segment.type !== "segment" ||
      definedSegments.has(segment.id) ||
      link.elements.length !== 2 ||
      link.elements.some((id) => byId.get(id).type !== "point")
    ) {
      return invalid("A conic segment needs two point references.");
    }

    const [a, b] = link.elements.map((id) => byId.get(id));
    const length = Math.hypot(b.x - a.x, b.y - a.y);

    if (!Number.isFinite(length) || length <= tolerance) {
      return invalid("Segment endpoints must have distinct positions.");
    }

    // A finite segment must be fully visible.
    if (!insideBounds(a) || !insideBounds(b)) {
      return invalid("Bounds exclude a segment endpoint.");
    }

    definedSegments.set(segment.id, {
      ...segment,
      a: { ...a },
      b: { ...b },
    });

    link.elements.forEach((id) => segmentPointIds.add(id));
  }

  // Endpoint order does not affect a segment's meaning.
  const samePoint = (a, b) =>
    near(a.x, b.x) && near(a.y, b.y);

  const matchesEndpoints = (segment, first, second) =>
    [first, second].every(
      (point) => Number.isFinite(point.x) && Number.isFinite(point.y)
    ) &&
    (
      (samePoint(segment.a, first) && samePoint(segment.b, second)) ||
      (samePoint(segment.a, second) && samePoint(segment.b, first))
    );

  const matchesSegmentRole = (segment, role) => {
    // General construction segments need valid, visible endpoints,
    // but their endpoints need not both lie on the curve.
    if (role === "construction") return true;

    if (role === "radius") {
      if (subtype !== "circle") return false;

      return (
        (
          matchesPointRole(segment.a, "center") &&
          matchesPointRole(segment.b, "on_curve")
        ) ||
        (
          matchesPointRole(segment.b, "center") &&
          matchesPointRole(segment.a, "on_curve")
        )
      );
    }

    if (role === "major_axis" || role === "minor_axis") {
      if (subtype !== "ellipse") return false;

      return role === "major_axis"
        ? matchesEndpoints(
            segment,
            fromLocal(-conic.a, 0),
            fromLocal(conic.a, 0)
          )
        : matchesEndpoints(
            segment,
            fromLocal(0, -conic.b),
            fromLocal(0, conic.b)
          );
    }

    if (
      role === "transverse_axis" ||
      role === "conjugate_axis"
    ) {
      if (subtype !== "hyperbola") return false;

      return role === "transverse_axis"
        ? matchesEndpoints(
            segment,
            fromLocal(-conic.a, 0),
            fromLocal(conic.a, 0)
          )
        : matchesEndpoints(
            segment,
            fromLocal(0, -conic.b),
            fromLocal(0, conic.b)
          );
    }

    if (role === "latus_rectum") {
      if (subtype === "circle") return false;

      if (subtype === "parabola") {
        const halfLength = 2 * Math.abs(conic.p);

        return matchesEndpoints(
          segment,
          fromLocal(conic.p, -halfLength),
          fromLocal(conic.p, halfLength)
        );
      }

      // Ellipse or hyperbola: either focus may be selected.
      const halfLength = conic.b * (conic.b / conic.a);

      if (!Number.isFinite(halfLength) || halfLength <= 0) {
        return false;
      }

      return [-1, 1].some((sign) =>
        matchesEndpoints(
          segment,
          fromLocal(sign * c, -halfLength),
          fromLocal(sign * c, halfLength)
        )
      );
    }

    return false;
  };

  const segments = [];
  const markedSegmentIds = new Set();

  for (const link of relationships.filter(
    (r) => r.type === "marks_segment"
  )) {
    if (
      link.target !== conic.id ||
      !SEGMENT_ROLES.has(link.role)
    ) {
      return invalid("Invalid conic segment annotation.");
    }

    for (const id of link.elements) {
      const segment = definedSegments.get(id);

      if (
        !segment ||
        markedSegmentIds.has(id) ||
        !matchesSegmentRole(segment, link.role)
      ) {
        return invalid("Segment annotation disagrees with the conic.");
      }

      markedSegmentIds.add(id);
      segments.push({ ...segment, role: link.role });
    }
  }

  const segmentElements = [...byId.values()].filter(
    (element) => element.type === "segment"
  );

  if (
    definedSegments.size !== segmentElements.length ||
    markedSegmentIds.size !== segmentElements.length
  ) {
    return invalid(
      "Every segment needs forms_segment and marks_segment relationships."
    );
  }

    // Definition-only points remain hidden unless explicitly marked.
    const unlinkedPoint = [...byId.values()].some(
      (element) =>
        element.type === "point" &&
        !markedPointIds.has(element.id) &&
        !linePointIds.has(element.id) &&
        !segmentPointIds.has(element.id)
    );

    if (unlinkedPoint) {
      return invalid(
        "Every point must annotate the conic or define a line or segment."
      );
    }

  return {
    valid: true,
    error: null,
    figure: {
      ...figure,
      bounds: { ...bounds },
      show_grid: figure.show_grid ?? false,
    },
    conic,
    points,
    lines,
    segments, // ADDED
  };
}