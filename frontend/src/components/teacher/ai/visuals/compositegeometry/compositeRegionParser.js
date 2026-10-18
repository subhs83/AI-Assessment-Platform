// compositeRegionParser.js

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

const close = (a, b) =>
  Math.abs(a - b) <= Math.max(1, Math.abs(a), Math.abs(b)) * 1e-8;

export function parseCompositeRegion(visual) {
  const { figure, elements, relationships } = visual || {};
  const grid = figure?.subtype === "unit_square_region";

  if (
    figure?.type !== "composite_geometry" ||
    !["partitioned_rectangle", "unit_square_region"].includes(
      figure?.subtype
    ) ||
    !(grid
      ? ["area", "perimeter"]
      : ["area", "missing_area", "perimeter", "missing_length"]
    ).includes(figure?.feature)
  ) {
    return invalid("Unsupported region construction.");
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
      (element.label !== undefined && typeof element.label !== "string")
    ) {
      return invalid("Invalid or duplicate element ID or label.");
    }

    ids.add(element.id);
  }

  // --------------------------------------------------
  // UNIT-SQUARE REGION
  // --------------------------------------------------
  if (grid) {
    if (
      !positive(figure.cell_size) ||
      typeof figure.unit !== "string" ||
      !figure.unit.trim() ||
      elements.length === 0 ||
      relationships.length !== 0
    ) {
      return invalid("Grid needs cells, cell size, unit, and no relationships.");
    }

    const cells = [];
    const locations = new Set();

    for (const element of elements) {
      if (
        element.type !== "unit_cell" ||
        !Number.isSafeInteger(element.row) ||
        !Number.isSafeInteger(element.column) ||
        element.row < 0 ||
        element.column < 0
      ) {
        return invalid("Invalid unit-cell position.");
      }

      const key = `${element.row}:${element.column}`;

      if (locations.has(key)) {
        return invalid("Duplicate grid-cell position.");
      }

      locations.add(key);
      cells.push({ ...element });
    }

    // Check edge connectivity; corner contact alone is insufficient.
    const visited = new Set();
    const queue = [[cells[0].row, cells[0].column]];
    visited.add(`${cells[0].row}:${cells[0].column}`);

    for (let i = 0; i < queue.length; i++) {
      const [row, column] = queue[i];

      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const next = [row + dr, column + dc];
        const key = `${next[0]}:${next[1]}`;

        if (locations.has(key) && !visited.has(key)) {
          visited.add(key);
          queue.push(next);
        }
      }
    }

    if (visited.size !== cells.length) {
      return invalid("Grid cells must form one edge-connected region.");
    }

    return {
      valid: true,
      error: null,
      figure: { ...figure },
      regionKind: "grid",
      cells,
      rectangles: [],
      dimensions: [],
      relationships: [],
    };
  }

  // --------------------------------------------------
  // PARTITIONED RECTANGLE
  // --------------------------------------------------
  if (
    elements.some(
      (element) => !["rectangle", "dimension"].includes(element.type)
    )
  ) {
    return invalid("Unsupported partition element.");
  }

  const rectangles = elements
    .filter((element) => element.type === "rectangle")
    .map((rectangle) => ({ ...rectangle }));

  if (
    rectangles.length < 3 ||
    rectangles.some(
      (r) => !positive(r.length) || !positive(r.width)
    )
  ) {
    return invalid("Partitions need an outer rectangle and valid parts.");
  }

  const byId = new Map(rectangles.map((r) => [r.id, r]));

  for (const relationship of relationships) {
    if (
      !relationship ||
      !["inside", "joins_edge", "partitions", "dimension_of"].includes(
        relationship.type
      ) ||
      !Array.isArray(relationship.elements) ||
      relationship.elements.length === 0
    ) {
      return invalid("Invalid partition relationship.");
    }
  }

  const declarations = relationships.filter((r) => r.type === "partitions");
  const anchors = relationships.filter((r) => r.type === "inside");
  const joins = relationships.filter((r) => r.type === "joins_edge");

  if (declarations.length !== 1 || anchors.length !== 1) {
    return invalid("Use one partitions relationship and one inside anchor.");
  }

  const declaration = declarations[0];
  const outer = byId.get(declaration.target);
  const partIds = new Set(declaration.elements);

  if (
    !outer ||
    partIds.size !== declaration.elements.length ||
    partIds.size !== rectangles.length - 1 ||
    partIds.has(outer.id) ||
    [...partIds].some((id) => !byId.has(id))
  ) {
    return invalid("Partitions must identify every inner rectangle once.");
  }

  const placementFactors = {
    top_left: [0, 0],
    top_center: [0.5, 0],
    top_right: [1, 0],
    left_center: [0, 0.5],
    center: [0.5, 0.5],
    right_center: [1, 0.5],
    bottom_left: [0, 1],
    bottom_center: [0.5, 1],
    bottom_right: [1, 1],
  };

  const anchor = anchors[0];
  const anchorId = anchor.elements[0];
  const factors = Object.prototype.hasOwnProperty.call(
    placementFactors,
    anchor.placement
  )
    ? placementFactors[anchor.placement]
    : null;

  if (
    anchor.elements.length !== 1 ||
    anchor.target !== outer.id ||
    !partIds.has(anchorId) ||
    !factors ||
    joins.length !== partIds.size - 1
  ) {
    return invalid("Invalid partition anchor or join count.");
  }

  outer.x = 0;
  outer.y = 0;

  const first = byId.get(anchorId);
  first.x = (outer.length - first.length) * factors[0];
  first.y = (outer.width - first.width) * factors[1];

  const positioned = new Set([anchorId]);
  const children = new Set([anchorId]);

  for (const join of joins) {
    const childId = join.elements[0];

    if (
      join.elements.length !== 1 ||
      !partIds.has(childId) ||
      !partIds.has(join.target) ||
      childId === join.target ||
      children.has(childId) ||
      !["top", "bottom", "left", "right"].includes(join.side) ||
      !["start", "center", "end"].includes(join.alignment) ||
      !Number.isFinite(join.offset ?? 0) ||
      (join.overlap_depth ?? 0) !== 0
    ) {
      return invalid("Invalid partition join; parts cannot overlap.");
    }

    children.add(childId);
  }

  const pending = [...joins];

  while (pending.length) {
    let progressed = false;

    for (let i = pending.length - 1; i >= 0; i--) {
      const join = pending[i];
      if (!positioned.has(join.target)) continue;

      const parent = byId.get(join.target);
      const child = byId.get(join.elements[0]);
      const horizontal = ["top", "bottom"].includes(join.side);

      const parentExtent = horizontal ? parent.length : parent.width;
      const childExtent = horizontal ? child.length : child.width;

      const alignment =
        join.alignment === "start"
          ? 0
          : join.alignment === "center"
            ? (parentExtent - childExtent) / 2
            : parentExtent - childExtent;

      const offset = alignment + (join.offset ?? 0);

      const contact =
        Math.min(parentExtent, offset + childExtent) -
        Math.max(0, offset);

      if (contact <= 0) {
        return invalid("Joined partitions must share an edge.");
      }

      child.x = parent.x;
      child.y = parent.y;

      if (horizontal) {
        child.x += offset;
        child.y += join.side === "top" ? -child.width : parent.width;
      } else {
        child.y += offset;
        child.x += join.side === "left" ? -child.length : parent.length;
      }

      positioned.add(child.id);
      pending.splice(i, 1);
      progressed = true;
    }

    if (!progressed) {
      return invalid("Circular or unresolved partition joins.");
    }
  }

  const parts = [...partIds].map((id) => byId.get(id));
  const tolerance = Math.max(outer.length, outer.width) * 1e-8;

  for (const part of parts) {
    if (
      part.x < -tolerance ||
      part.y < -tolerance ||
      part.x + part.length > outer.length + tolerance ||
      part.y + part.width > outer.width + tolerance
    ) {
      return invalid("Partition lies outside the outer rectangle.");
    }
  }

  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      const a = parts[i];
      const b = parts[j];

      const dx =
        Math.min(a.x + a.length, b.x + b.length) - Math.max(a.x, b.x);
      const dy =
        Math.min(a.y + a.width, b.y + b.width) - Math.max(a.y, b.y);

      if (dx > tolerance && dy > tolerance) {
        return invalid("Partition interiors overlap.");
      }
    }
  }

  const totalArea = parts.reduce(
    (sum, part) => sum + part.length * part.width,
    0
  );

  if (!close(totalArea, outer.length * outer.width)) {
    return invalid("Partitions must fill the outer rectangle without gaps.");
  }

  const dimensionElements = elements.filter((e) => e.type === "dimension");
  const dimensionById = new Map(dimensionElements.map((d) => [d.id, d]));
  const linkedIds = new Set();
  const linkedRoles = new Set();
  const units = new Set();
  const dimensions = [];

  for (const link of relationships.filter((r) => r.type === "dimension_of")) {
    const rectangle = byId.get(link.target);
    if (!rectangle) return invalid("Invalid dimension target.");

    for (const id of link.elements) {
      const dimension = dimensionById.get(id);

      if (
        !dimension ||
        linkedIds.has(id) ||
        !["length", "width", "area"].includes(dimension.role)
      ) {
        return invalid("Invalid or duplicate dimension reference.");
      }

      const roleKey = `${rectangle.id}:${dimension.role}`;
      if (linkedRoles.has(roleKey)) {
        return invalid("Duplicate dimension role.");
      }

      const expected =
        dimension.role === "length"
          ? rectangle.length
          : dimension.role === "width"
            ? rectangle.width
            : rectangle.length * rectangle.width;

      const hasValue = dimension.value !== undefined;

      if (
        hasValue &&
        (!positive(dimension.value) || !close(dimension.value, expected))
      ) {
        return invalid("Displayed dimension disagrees with its partition.");
      }

      if (
        typeof dimension.label !== "string" ||
        !dimension.label.trim() ||
        (dimension.unit !== undefined && typeof dimension.unit !== "string")
      ) {
        return invalid("Invalid dimension label or unit.");
      }

      const unit = dimension.unit?.trim() || "";
      if (dimension.role !== "area" && unit) units.add(unit);

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
    return invalid("Every dimension must be linked.");
  }

  if (units.size > 1) {
    return invalid("Use one common length unit.");
  }

  return {
    valid: true,
    error: null,
    figure: { ...figure },
    regionKind: "partition",
    outerId: outer.id,
    partIds: [...partIds],
    rectangles,
    dimensions,
    relationships: relationships.map((r) => ({
      ...r,
      elements: [...r.elements],
    })),
  };
}