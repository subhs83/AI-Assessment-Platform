// compositePathParser.js

function invalid(error) {
  return {
    valid: false,
    error,
    figure: null,
    rectangles: [],
    dimensions: [],
    relationships: [],
  };
}

const positive = (value) =>
  Number.isFinite(value) && value > 0;

const same = (a, b) =>
  Number.isFinite(a) &&
  Number.isFinite(b) &&
  Math.abs(a - b) <= Math.max(1, Math.abs(a), Math.abs(b)) * 1e-8;

export function parseCompositePaths(visual) {
  const { figure, elements, relationships } = visual || {};
  const boundary = figure?.subtype === "boundary_path";

  if (
    figure?.type !== "composite_geometry" ||
    !["crossing_paths", "boundary_path"].includes(figure?.subtype) ||
    !["area", "remaining_area", "perimeter"].includes(figure?.feature)
  ) {
    return invalid("Unsupported path construction.");
  }

  if (!Array.isArray(elements) || !Array.isArray(relationships)) {
    return invalid("Elements and relationships must be arrays.");
  }

  const ids = new Set();

  for (const element of elements) {
    if (
      !element ||
      typeof element.id !== "string" ||
      !element.id.trim() ||
      ids.has(element.id) ||
      !["rectangle", "dimension"].includes(element.type) ||
      (element.label !== undefined && typeof element.label !== "string")
    ) {
      return invalid("Invalid or duplicate path element.");
    }

    ids.add(element.id);
  }

  const rectangles = elements
    .filter((element) => element.type === "rectangle")
    .map((rectangle) => ({ ...rectangle }));

  const dimensionElements = elements.filter(
    (element) => element.type === "dimension"
  );

  const byId = new Map(rectangles.map((r) => [r.id, r]));
  const constructionType = boundary ? "surrounds" : "crosses_inside";

  for (const relationship of relationships) {
    if (
      !relationship ||
      ![constructionType, "dimension_of"].includes(relationship.type) ||
      !Array.isArray(relationship.elements) ||
      relationship.elements.length === 0
    ) {
      return invalid("Invalid path relationship.");
    }
  }

  const constructions = relationships.filter(
    (relationship) => relationship.type === constructionType
  );

  if (constructions.length !== 1) {
    return invalid("Exactly one path construction is required.");
  }

  const construction = constructions[0];
  const park = byId.get(construction.target);

  if (!park || !positive(park.length) || !positive(park.width)) {
    return invalid("Park dimensions must be positive numbers.");
  }

  park.x = 0;
  park.y = 0;
  park.regionRole = "park";

  let pathConfig;

  if (boundary) {
    const derived = byId.get(construction.elements[0]);
    const pathWidth = construction.path_width;
    const placement = construction.placement;

    if (
      rectangles.length !== 2 ||
      construction.elements.length !== 1 ||
      !derived ||
      derived.id === park.id ||
      !["inside", "outside"].includes(placement) ||
      !positive(pathWidth)
    ) {
      return invalid("Invalid boundary-path construction.");
    }

    const inside = placement === "inside";
    const change = (inside ? -2 : 2) * pathWidth;
    const length = park.length + change;
    const width = park.width + change;

    if (!positive(length) || !positive(width)) {
      return invalid("The inside path must leave a positive lawn area.");
    }

    // Optional supplied dimensions must agree with the relationship.
    if (
      (derived.length !== undefined && !same(derived.length, length)) ||
      (derived.width !== undefined && !same(derived.width, width))
    ) {
      return invalid("Derived boundary dimensions disagree with path width.");
    }

    Object.assign(derived, {
      length,
      width,
      x: inside ? pathWidth : -pathWidth,
      y: inside ? pathWidth : -pathWidth,
      regionRole: inside ? "lawn" : "outer_boundary",
    });

    pathConfig = {
      kind: "boundary_path",
      placement,
      pathWidth,
      parkId: park.id,
      derivedId: derived.id,
      outerId: inside ? park.id : derived.id,
      innerId: inside ? derived.id : park.id,
    };
  } else {
    const [horizontalId, verticalId] = construction.elements;
    const horizontal = byId.get(horizontalId);
    const vertical = byId.get(verticalId);

    if (
      rectangles.length !== 3 ||
      construction.elements.length !== 2 ||
      construction.placement !== "center" ||
      !horizontal ||
      !vertical ||
      new Set([park.id, horizontalId, verticalId]).size !== 3 ||
      !same(horizontal.length, park.length) ||
      !positive(horizontal.width) ||
      horizontal.width >= park.width ||
      !same(vertical.width, park.width) ||
      !positive(vertical.length) ||
      vertical.length >= park.length
    ) {
      return invalid("Crossing strips must span and fit inside the park.");
    }

    Object.assign(horizontal, {
      x: 0,
      y: (park.width - horizontal.width) / 2,
      regionRole: "horizontal_path",
    });

    Object.assign(vertical, {
      x: (park.length - vertical.length) / 2,
      y: 0,
      regionRole: "vertical_path",
    });

    pathConfig = {
      kind: "crossing_paths",
      parkId: park.id,
      horizontalId,
      verticalId,
    };
  }

  const normalizedRelationships = relationships.map((relationship) => ({
    ...relationship,
    elements: [...relationship.elements],
  }));

  const dimensionById = new Map(
    dimensionElements.map((dimension) => [dimension.id, dimension])
  );

  const links = normalizedRelationships.filter(
    (relationship) => relationship.type === "dimension_of"
  );

  // Compatibility for the existing generated boundary-path payloads.
  // Only one unlinked path-width dimension can be resolved safely.
  if (boundary) {
    const linkedIds = new Set(links.flatMap((link) => link.elements));
    const unlinkedWidths = dimensionElements.filter(
      (dimension) =>
        dimension.role === "path_width" &&
        !linkedIds.has(dimension.id)
    );

    if (unlinkedWidths.length > 1) {
      return invalid("Multiple unlinked path-width dimensions.");
    }

    if (unlinkedWidths.length === 1) {
      const link = {
        type: "dimension_of",
        elements: [unlinkedWidths[0].id],
        target: pathConfig.derivedId,
      };

      links.push(link);
      normalizedRelationships.push(link);
    }
  }

  const dimensions = [];
  const linkedIds = new Set();
  const linkedRoles = new Set();
  const units = new Set();

  for (const link of links) {
    const rectangle = byId.get(link.target);

    if (!rectangle) {
      return invalid("Dimension target is not a rectangle.");
    }

    for (const id of link.elements) {
      const dimension = dimensionById.get(id);

      if (!dimension || linkedIds.has(id)) {
        return invalid("Invalid or duplicate dimension reference.");
      }

      const role = dimension.role;
      const roleKey = `${rectangle.id}:${role}`;

      if (
        linkedRoles.has(roleKey) ||
        !["length", "width", "area", "path_width"].includes(role)
      ) {
        return invalid("Invalid or duplicate dimension role.");
      }

      if (
        role === "path_width" &&
        (!boundary || rectangle.id !== pathConfig.derivedId)
      ) {
        return invalid("Path width must target the derived boundary.");
      }

      const expected =
        role === "length"
          ? rectangle.length
          : role === "width"
            ? rectangle.width
            : role === "area"
              ? rectangle.length * rectangle.width
              : pathConfig.pathWidth;

      const hasValue = dimension.value !== undefined;

      if (
        hasValue &&
        (!positive(dimension.value) || !same(dimension.value, expected))
      ) {
        return invalid("Displayed dimension disagrees with path geometry.");
      }

      if (
        typeof dimension.label !== "string" ||
        !dimension.label.trim() ||
        (dimension.unit !== undefined && typeof dimension.unit !== "string")
      ) {
        return invalid("Dimensions need valid labels and units.");
      }

      const unit = dimension.unit?.trim() || "";

      if (role !== "area" && unit) units.add(unit);

      dimensions.push({
        ...dimension,
        unit,
        rectangleId: rectangle.id,
        isUnknown: !hasValue,
      });

      linkedIds.add(id);
      linkedRoles.add(roleKey);
    }
  }

  if (linkedIds.size !== dimensionElements.length) {
    return invalid("Every dimension must be linked to a rectangle.");
  }

  if (units.size > 1) {
    return invalid("Use one common length unit.");
  }

  return {
    valid: true,
    error: null,
    figure: { ...figure },
    rectangles,
    dimensions,
    relationships: normalizedRelationships,
    pathConfig,
  };
}