// symmetry/symmetryParser.js

function invalid(error) {
  return { valid: false, error };
}

export function parseSymmetry(visual) {
  const { figure, elements, relationships } = visual || {};

    const supportedFeatures = {
    line_symmetry: [
      "count_lines",
      "identify_line",
      "check_line",
    ],
    rotational_symmetry: [
      "count_order",
      "smallest_angle",
      "check_rotation",
    ],
  };

  if (
    figure?.type !== "symmetry" ||
    !supportedFeatures[figure?.subtype]?.includes(figure?.feature)
  ) {
    return invalid("Unsupported symmetry construction.");
  }

  const isRotational = figure.subtype === "rotational_symmetry";

  if (!Array.isArray(elements) || !Array.isArray(relationships)) {
    return invalid("Elements and relationships must be arrays.");
  }

  const byId = new Map();

  for (const element of elements) {
    if (
      !element ||
      typeof element.id !== "string" ||
      !element.id.trim() ||
      byId.has(element.id) ||
      !["point", "polygon", "circle", "ellipse", "line"].includes(element.type) ||
      (element.label !== undefined && typeof element.label !== "string")
    ) {
      return invalid("Invalid or duplicate symmetry element.");
    }

    if (
      element.type === "point" &&
      (!Number.isFinite(element.x) || !Number.isFinite(element.y))
    ) {
      return invalid("Points need finite coordinates.");
    }

    byId.set(element.id, element);
  }

  const shapes = elements.filter(
    (e) => ["polygon", "circle", "ellipse"].includes(e.type)
  );

  if (shapes.length !== 1) {
    return invalid("Exactly one target shape is required.");
  }

  const shapeElement = shapes[0];

  const allowedRelationships = new Set([
    "forms_polygon",
    "is_center_of",
    ...(isRotational
      ? ["rotation_center"]
      : ["forms_line", "candidate_axis"]),
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
      return invalid("Invalid symmetry relationship.");
    }
  }

  const polygonLinks = relationships.filter((r) => r.type === "forms_polygon");
  const centerLinks = relationships.filter((r) => r.type === "is_center_of");
  let shape;

  if (shapeElement.type === "polygon") {
    if (
      polygonLinks.length !== 1 ||
      centerLinks.length !== 0 ||
      polygonLinks[0].target !== shapeElement.id
    ) {
      return invalid("Polygon needs one forms_polygon relationship.");
    }

    const vertexIds = polygonLinks[0].elements;

    if (
      vertexIds.length < 3 ||
      new Set(vertexIds).size !== vertexIds.length ||
      vertexIds.some((id) => byId.get(id).type !== "point")
    ) {
      return invalid("Invalid polygon vertices.");
    }

    const vertices = vertexIds.map((id) => ({ ...byId.get(id) }));
    const coordinateKeys = vertices.map((p) => `${p.x}:${p.y}`);

    if (new Set(coordinateKeys).size !== vertices.length) {
      return invalid("Polygon vertices must have distinct positions.");
    }

    const cross = (a, b, c) =>
      (b.x - a.x) * (c.y - a.y) -
      (b.y - a.y) * (c.x - a.x);

    const extent = Math.max(
      Math.max(...vertices.map((p) => p.x)) -
        Math.min(...vertices.map((p) => p.x)),
      Math.max(...vertices.map((p) => p.y)) -
        Math.min(...vertices.map((p) => p.y))
    );

    const epsilon = extent * extent * 1e-10;

    const onSegment = (a, b, p) =>
      Math.abs(cross(a, b, p)) <= epsilon &&
      p.x >= Math.min(a.x, b.x) &&
      p.x <= Math.max(a.x, b.x) &&
      p.y >= Math.min(a.y, b.y) &&
      p.y <= Math.max(a.y, b.y);

    const intersects = (a, b, c, d) => {
      const abC = cross(a, b, c);
      const abD = cross(a, b, d);
      const cdA = cross(c, d, a);
      const cdB = cross(c, d, b);

      const opposite = (x, y) =>
        (x > epsilon && y < -epsilon) ||
        (x < -epsilon && y > epsilon);

      return (
        (opposite(abC, abD) && opposite(cdA, cdB)) ||
        onSegment(a, b, c) ||
        onSegment(a, b, d) ||
        onSegment(c, d, a) ||
        onSegment(c, d, b)
      );
    };

    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      const previous = vertices[(i + n - 1) % n];
      const current = vertices[i];
      const next = vertices[(i + 1) % n];

      // Reject adjacent edges that reverse over one another.
      if (
        Math.abs(cross(previous, current, next)) <= epsilon &&
        (previous.x - current.x) * (next.x - current.x) +
          (previous.y - current.y) * (next.y - current.y) > 0
      ) {
        return invalid("Polygon edges overlap.");
      }

      for (let j = i + 1; j < n; j++) {
        if (j === i + 1 || (i === 0 && j === n - 1)) continue;

        if (
          intersects(
            vertices[i],
            vertices[(i + 1) % n],
            vertices[j],
            vertices[(j + 1) % n]
          )
        ) {
          return invalid("Polygon boundary must not intersect itself.");
        }
      }
    }

    // Translation-independent area calculation.
    const origin = vertices[0];
    let twiceArea = 0;

    for (let i = 1; i < n - 1; i++) {
      twiceArea += cross(origin, vertices[i], vertices[i + 1]);
    }

    if (Math.abs(twiceArea) <= epsilon) {
      return invalid("Polygon must have a positive area.");
    }

    shape = { ...shapeElement, vertices };
  } else {
    if (
      polygonLinks.length !== 0 ||
      centerLinks.length !== 1 ||
      centerLinks[0].target !== shapeElement.id ||
      centerLinks[0].elements.length !== 1
    ) {
      return invalid("Circle or ellipse needs one centre relationship.");
    }

    const center = byId.get(centerLinks[0].elements[0]);

    if (center.type !== "point") {
      return invalid("Shape centre must be a point.");
    }

    const rx =
      shapeElement.type === "circle"
        ? shapeElement.radius
        : shapeElement.radius_x;

    const ry =
      shapeElement.type === "circle"
        ? shapeElement.radius
        : shapeElement.radius_y;

    if (
      !Number.isFinite(rx) ||
      !Number.isFinite(ry) ||
      rx <= 0 ||
      ry <= 0
    ) {
      return invalid("Circle and ellipse radii must be positive.");
    }

    shape = { ...shapeElement, center: { ...center }, rx, ry };
  }


    // Rotational symmetry reuses the validated shape above.
  if (isRotational) {
    if (elements.some((element) => element.type === "line")) {
      return invalid(
        "Rotational symmetry does not use candidate lines."
      );
    }

    const rotationLinks = relationships.filter(
      (relationship) => relationship.type === "rotation_center"
    );

    if (
      rotationLinks.length !== 1 ||
      rotationLinks[0].target !== shapeElement.id ||
      rotationLinks[0].elements.length !== 1
    ) {
      return invalid(
        "Exactly one rotation_center must link a point to the shape."
      );
    }

    const center = byId.get(rotationLinks[0].elements[0]);

    if (
      center?.type !== "point" ||
      typeof center.label !== "string" ||
      !center.label.trim()
    ) {
      return invalid(
        "The rotation centre must be a point with a visible label."
      );
    }

    // Circle/ellipse questions in this contract rotate about
    // their geometric centre. Different IDs at the same position
    // are permitted.
    if (shape.type === "circle" || shape.type === "ellipse") {
      const tolerance = Math.max(shape.rx, shape.ry) * 1e-8;

      if (
        Math.hypot(
          center.x - shape.center.x,
          center.y - shape.center.y
        ) > tolerance
      ) {
        return invalid(
          "The rotation centre must match the circle or ellipse centre."
        );
      }

      // An ellipse with exactly equal radii is also a circle.
      const isCircular = shape.rx === shape.ry;

      if (
        figure.feature === "smallest_angle" &&
        isCircular
      ) {
        return invalid(
          "A circle has no smallest positive rotation angle."
        );
      }
    }

    let rotationDeg = null;

    if (figure.feature === "check_rotation") {
      if (
        !Number.isFinite(figure.rotation_deg) ||
        figure.rotation_deg <= 0 ||
        figure.rotation_deg >= 360
      ) {
        return invalid(
          "check_rotation needs rotation_deg strictly between 0 and 360."
        );
      }

      rotationDeg = figure.rotation_deg;
    } else if (figure.rotation_deg !== undefined) {
      return invalid(
        "Only check_rotation should supply rotation_deg."
      );
    }

    return {
      valid: true,
      error: null,
      figure: { ...figure },
      shape,
      lines: [],
      rotationCenter: {
        ...center,
        label: center.label.trim(),
      },
      rotationDeg,
      labelledPoints: elements
        .filter(
          (element) =>
            element.type === "point" &&
            element.label?.trim()
        )
        .map((point) => ({ ...point })),
    };
  }
  const lineElements = elements.filter((e) => e.type === "line");
  const lineLinks = relationships.filter((r) => r.type === "forms_line");
  const candidateLinks = relationships.filter((r) => r.type === "candidate_axis");

  const linkedLines = new Map();

  for (const link of lineLinks) {
    const line = byId.get(link.target);

    if (
      line.type !== "line" ||
      linkedLines.has(line.id) ||
      link.elements.length !== 2 ||
      link.elements.some((id) => byId.get(id).type !== "point")
    ) {
      return invalid("Invalid candidate-line endpoints.");
    }

    const [a, b] = link.elements.map((id) => byId.get(id));

    if (a.x === b.x && a.y === b.y) {
      return invalid("A line needs two distinct positions.");
    }

    if (typeof line.label !== "string" || !line.label.trim()) {
      return invalid("Candidate lines need visible labels.");
    }

    linkedLines.set(line.id, {
      ...line,
      label: line.label.trim(),
      a: { ...a },
      b: { ...b },
    });
  }

  const candidateIds = [];

  for (const link of candidateLinks) {
    if (
      link.target !== shapeElement.id ||
      link.elements.some((id) => !linkedLines.has(id))
    ) {
      return invalid("Candidate axes must reference lines and the target shape.");
    }

    candidateIds.push(...link.elements);
  }

  if (
    new Set(candidateIds).size !== candidateIds.length ||
    candidateIds.length !== lineElements.length ||
    linkedLines.size !== lineElements.length
  ) {
    return invalid("Every candidate line must be linked exactly once.");
  }

  const lines = candidateIds.map((id) => linkedLines.get(id));

  if (new Set(lines.map((line) => line.label)).size !== lines.length) {
    return invalid("Candidate-line labels must be unique.");
  }

  if (
    (figure.feature === "count_lines" && lines.length !== 0) ||
    (figure.feature === "check_line" && lines.length !== 1) ||
    (figure.feature === "identify_line" && lines.length < 2)
  ) {
    return invalid("Candidate-line count does not match the feature.");
  }

  return {
    valid: true,
    error: null,
    figure: { ...figure },
    shape,
    lines,
    rotationCenter: null,
    rotationDeg: null,
    labelledPoints: elements
      .filter((e) => e.type === "point" && e.label?.trim())
      .map((point) => ({ ...point })),
  };
}