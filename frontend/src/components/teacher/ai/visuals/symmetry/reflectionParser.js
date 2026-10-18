import { parseSymmetry } from "./symmetryParser";

function invalid(error) {
  return {
    valid: false,
    error,
    figure: null,
    original: null,
    mirror: null,
    candidates: [],
    labelledPoints: [],
  };
}

export function parseReflection(visual) {
  const { figure, elements, relationships } = visual || {};

  const features = [
    "identify_image",
    "find_reflected_point",
    "distance_from_mirror",
  ];

  if (
    figure?.type !== "symmetry" ||
    figure?.subtype !== "reflection" ||
    !features.includes(figure.feature)
  ) {
    return invalid("Unsupported reflection figure.");
  }

  if (
    !Array.isArray(elements) ||
    !Array.isArray(relationships)
  ) {
    return invalid("Elements and relationships must be arrays.");
  }

  // ------------------------------------------
  // Elements
  // ------------------------------------------
  const byId = new Map();

  for (const element of elements) {
    if (
      !element ||
      typeof element.id !== "string" ||
      !element.id.trim() ||
      byId.has(element.id)
    ) {
      return invalid("Missing or duplicate element ID.");
    }

    if (!["point", "polygon", "line"].includes(element.type)) {
      return invalid("Unsupported reflection element.");
    }

    if (
      element.label !== undefined &&
      typeof element.label !== "string"
    ) {
      return invalid("Element labels must be strings.");
    }

    if (
      element.type === "point" &&
      (
        !Number.isFinite(element.x) ||
        !Number.isFinite(element.y)
      )
    ) {
      return invalid("Point coordinates must be finite numbers.");
    }

    byId.set(element.id, {
      ...element,
      label: element.label?.trim() || "",
    });
  }

  // ------------------------------------------
  // Relationships
  // ------------------------------------------
  const allowedRelationships = new Set([
    "forms_polygon",
    "forms_line",
    "mirror_axis",
    "candidate_image",
  ]);

  for (const relationship of relationships) {
    if (
      !relationship ||
      !allowedRelationships.has(relationship.type) ||
      !Array.isArray(relationship.elements) ||
      relationship.elements.length === 0 ||
      new Set(relationship.elements).size !==
        relationship.elements.length ||
      !relationship.elements.every((id) => byId.has(id)) ||
      !byId.has(relationship.target)
    ) {
      return invalid("Invalid reflection relationship.");
    }
  }

  const polygonLinks = relationships.filter(
    (r) => r.type === "forms_polygon"
  );

  const lineLinks = relationships.filter(
    (r) => r.type === "forms_line"
  );

  const mirrorLinks = relationships.filter(
    (r) => r.type === "mirror_axis"
  );

  const candidateLinks = relationships.filter(
    (r) => r.type === "candidate_image"
  );

  // ------------------------------------------
  // Exactly one mirror line
  // ------------------------------------------
  const lineElements = [...byId.values()].filter(
    (element) => element.type === "line"
  );

  if (
    lineElements.length !== 1 ||
    lineLinks.length !== 1 ||
    mirrorLinks.length !== 1
  ) {
    return invalid("Reflection requires exactly one mirror line.");
  }

  const lineElement = lineElements[0];
  const lineLink = lineLinks[0];
  const mirrorLink = mirrorLinks[0];

  if (
    lineLink.target !== lineElement.id ||
    lineLink.elements.length !== 2 ||
    mirrorLink.elements.length !== 1 ||
    mirrorLink.elements[0] !== lineElement.id ||
    !lineElement.label
  ) {
    return invalid("Invalid mirror line definition.");
  }

  const a = byId.get(lineLink.elements[0]);
  const b = byId.get(lineLink.elements[1]);

  if (
    a.type !== "point" ||
    b.type !== "point" ||
    (a.x === b.x && a.y === b.y)
  ) {
    return invalid("The mirror needs two distinct points.");
  }

  const mirror = {
    ...lineElement,
    a: { ...a },
    b: { ...b },
  };

  // ------------------------------------------
  // Polygon validation
  // Reuse the tested line-symmetry parser.
  // ------------------------------------------
  const polygonElements = [...byId.values()].filter(
    (element) => element.type === "polygon"
  );

  const polygons = new Map();

  if (polygonLinks.length !== polygonElements.length) {
    return invalid("Every polygon needs one forms_polygon relationship.");
  }

  for (const polygon of polygonElements) {
    const links = polygonLinks.filter(
      (relationship) => relationship.target === polygon.id
    );

    if (links.length !== 1) {
      return invalid("Each polygon must have exactly one boundary.");
    }

    const link = links[0];
    const vertices = link.elements.map((id) => byId.get(id));

    if (vertices.some((point) => point.type !== "point")) {
      return invalid("Polygon boundaries must reference points.");
    }

    const checked = parseSymmetry({
      figure: {
        type: "symmetry",
        subtype: "line_symmetry",
        feature: "count_lines",
      },
      elements: [
        { ...polygon },
        ...vertices.map((point) => ({ ...point })),
      ],
      relationships: [
        {
          type: "forms_polygon",
          elements: [...link.elements],
          target: polygon.id,
        },
      ],
    });

    if (!checked.valid) {
      return invalid(
        `Invalid polygon ${polygon.id}: ${checked.error}`
      );
    }

    polygons.set(polygon.id, {
      ...polygon,
      vertices: vertices.map((point) => ({ ...point })),
    });
  }

  // ------------------------------------------
  // Original and candidate images
  // ------------------------------------------
  const originalElement = byId.get(mirrorLink.target);

  let original;
  let candidates = [];

  if (figure.feature === "identify_image") {
  if (
    originalElement.type !== "polygon" ||
    !originalElement.label ||
    candidateLinks.length === 0
  ) {
    return invalid(
      "Identify-image questions need a labelled original and candidate_image."
    );
  }

  // Accept one grouped relationship or several separate relationships.
  if (
    candidateLinks.some(
      (link) => link.target !== originalElement.id
    )
  ) {
    return invalid(
      "All candidate images must reference the original polygon."
    );
  }

  const candidateIds = candidateLinks.flatMap(
    (link) => link.elements
  );

  if (
    candidateIds.length !== 4 ||
    new Set(candidateIds).size !== 4 ||
    candidateIds.includes(originalElement.id)
  ) {
    return invalid(
      "Identify-image questions need four distinct candidate references."
    );
  }

  candidates = candidateIds.map((id) => polygons.get(id));

  if (
    candidates.some((candidate) => !candidate?.label) ||
    new Set(candidates.map((candidate) => candidate.label)).size !== 4 ||
    polygonElements.length !== 5
  ) {
    return invalid(
      "Use one original and four candidates with distinct visible labels."
    );
  }

  original = polygons.get(originalElement.id);
} else {
    if (
      originalElement.type !== "point" ||
      polygonElements.length !== 0 ||
      candidateLinks.length !== 0
    ) {
      return invalid(
        "This reflection feature requires one original point and no candidate images."
      );
    }

    original = { ...originalElement };
  }

  // Reject unused points rather than accidentally drawing answer points.
  const usedPointIds = new Set([
    ...lineLink.elements,
    ...polygonLinks.flatMap((link) => link.elements),
  ]);

  if (original.type === "point") {
    usedPointIds.add(original.id);
  }

  const points = [...byId.values()].filter(
    (element) => element.type === "point"
  );

  if (points.some((point) => !usedPointIds.has(point.id))) {
    return invalid("The visual contains an unreferenced point.");
  }

  // ------------------------------------------
  // Grid settings
  // ------------------------------------------
  if (
    figure.show_grid !== undefined &&
    typeof figure.show_grid !== "boolean"
  ) {
    return invalid("show_grid must be a boolean.");
  }

  if (
    figure.feature === "find_reflected_point" &&
    figure.show_grid !== true
  ) {
    return invalid("Reflected-coordinate questions require a grid.");
  }

  let bounds = null;

  if (figure.bounds !== undefined) {
    const value = figure.bounds;

    if (
      !value ||
      ![
        value.x_min,
        value.x_max,
        value.y_min,
        value.y_max,
      ].every(Number.isFinite) ||
      value.x_min >= value.x_max ||
      value.y_min >= value.y_max
    ) {
      return invalid("Invalid coordinate bounds.");
    }

    bounds = {
      x_min: value.x_min,
      x_max: value.x_max,
      y_min: value.y_min,
      y_max: value.y_max,
    };

    // Mirror definition points may lie outside the visible grid:
    // they define an infinite line, not its visible endpoints.
    const visiblePoints =
      original.type === "point"
        ? [original]
        : [
            ...original.vertices,
            ...candidates.flatMap((candidate) => candidate.vertices),
          ];

    if (
      visiblePoints.some(
        (point) =>
          point.x < bounds.x_min ||
          point.x > bounds.x_max ||
          point.y < bounds.y_min ||
          point.y > bounds.y_max
      )
    ) {
      return invalid("Coordinate bounds exclude part of the figure.");
    }
  }

  return {
    valid: true,
    error: null,
    figure: { ...figure },
    original,
    mirror,
    candidates,
    showGrid: figure.show_grid === true,
    bounds,
    labelledPoints: points
      .filter((point) => point.label)
      .map((point) => ({ ...point })),
  };
}