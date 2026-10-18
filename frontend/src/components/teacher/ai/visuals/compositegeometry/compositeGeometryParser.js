// ADDED
import { parseCompositePaths } from "./compositePathParser";
import { parseCompositeRegion } from "./compositeRegionParser";
import { parseCompositeSemicircle } from "./compositeSemicircleParser";

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

// ADDED: place rectangular cutouts inside one outer rectangle.
function placeRectangularCutouts(rectangles, relationships) {
  const byId = new Map(rectangles.map((r) => [r.id, r]));
  const insideLinks = relationships.filter((r) => r.type === "inside");
  const subtractionLinks = relationships.filter(
    (r) => r.type === "subtracts_from"
  );

  const placements = {
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

  const outerIds = new Set(subtractionLinks.map((r) => r.target));

  if (outerIds.size !== 1) {
    return { error: "Cutouts must belong to one outer rectangle." };
  }

  const outer = byId.get([...outerIds][0]);

  if (!outer) {
    return { error: "Missing outer rectangle." };
  }

  const cutoutIds = new Set();

  for (const link of subtractionLinks) {
    if (
      !Array.isArray(link.elements) ||
      link.elements.length !== 1
    ) {
      return { error: "Each subtraction must identify one cutout." };
    }

    const id = link.elements[0];

    if (!byId.has(id) || id === outer.id || cutoutIds.has(id)) {
      return { error: "Invalid or duplicate cutout." };
    }

    cutoutIds.add(id);
  }

  if (
    cutoutIds.size !== rectangles.length - 1 ||
    insideLinks.length !== cutoutIds.size
  ) {
    return { error: "Every cutout needs inside and subtracts_from links." };
  }

  const positioned = [
    { ...outer, x: 0, y: 0, isCutout: false },
  ];

  const placedIds = new Set();

  for (const link of insideLinks) {
    if (
      !Array.isArray(link.elements) ||
      link.elements.length !== 1 ||
      link.target !== outer.id
    ) {
      return { error: "Invalid cutout placement link." };
    }

    const id = link.elements[0];
    const factors = Object.hasOwn(placements, link.placement)
      ? placements[link.placement]
      : null;

    if (!cutoutIds.has(id) || placedIds.has(id) || !factors) {
      return { error: "Invalid or duplicate cutout placement." };
    }

    const cutout = byId.get(id);

    if (
      cutout.length > outer.length ||
      cutout.width > outer.width
    ) {
      return { error: "Cutout must fit inside its outer rectangle." };
    }

    positioned.push({
      ...cutout,
      x: (outer.length - cutout.length) * factors[0],
      y: (outer.width - cutout.width) * factors[1],
      isCutout: true,
    });

    placedIds.add(id);
  }

  const cutouts = positioned.filter((r) => r.isCutout);

  for (let i = 0; i < cutouts.length; i++) {
    for (let j = i + 1; j < cutouts.length; j++) {
      const a = cutouts[i];
      const b = cutouts[j];

      const overlapX =
        Math.min(a.x + a.length, b.x + b.length) -
        Math.max(a.x, b.x);

      const overlapY =
        Math.min(a.y + a.width, b.y + b.width) -
        Math.max(a.y, b.y);

      if (overlapX > 0 && overlapY > 0) {
        return { error: "Cutout interiors must not overlap." };
      }
    }
  }

  const remainingArea =
    outer.length * outer.width -
    cutouts.reduce((sum, r) => sum + r.length * r.width, 0);

  if (remainingArea <= 0) {
    return { error: "Cutouts must leave a positive remaining area." };
  }

  return { rectangles: positioned };
}

export function parseCompositeGeometry(visual) {
  const { figure, elements, relationships } = visual || {};
  // ADDED: dedicated path validation and construction.
  if (["crossing_paths", "boundary_path"].includes(figure?.subtype)) {
    return parseCompositePaths(visual);
  }
  if (["partitioned_rectangle", "unit_square_region"].includes(figure?.subtype)) {
    return parseCompositeRegion(visual);
  }
  if (figure?.subtype === "rectangle_semicircle") {
    return parseCompositeSemicircle(visual);
  }

    // CHANGED: accept joined rectangles and rectangular cutouts.
  const isCutoutFigure = figure?.subtype === "rectangular_cutouts";

  const allowedFeatures = isCutoutFigure
    ? ["area", "remaining_area", "perimeter"]
    : ["area", "perimeter"];

  if (
    figure?.type !== "composite_geometry" ||
    !["joined_rectangles", "rectangular_cutouts"].includes(
      figure?.subtype
    ) ||
    !allowedFeatures.includes(figure.feature)
  ) {
    return invalid("Unsupported composite construction.");
  }

  if (
    !Array.isArray(elements) ||
    !Array.isArray(relationships)
  ) {
    return invalid("Elements and relationships must be arrays.");
  }

  const ids = new Set();

  for (const element of elements) {
    if (
      !element ||
      typeof element.id !== "string" ||
      !element.id.trim() ||
      ids.has(element.id)
    ) {
      return invalid("Missing or duplicate element ID.");
    }

    ids.add(element.id);

    if (!["rectangle", "dimension"].includes(element.type)) {
      return invalid("Unsupported composite element.");
    }

    if (
      element.label !== undefined &&
      typeof element.label !== "string"
    ) {
      return invalid("Labels must be strings.");
    }
  }

  const rectangles = elements
    .filter((element) => element.type === "rectangle")
    .map((rectangle) => ({
      ...rectangle,
      label: rectangle.label || "",
    }));

  const dimensionElements = elements.filter(
    (element) => element.type === "dimension"
  );

  if (rectangles.length < 2) {
    return invalid("At least two rectangles are required.");
  }

  for (const rectangle of rectangles) {
    if (
      !Number.isFinite(rectangle.length) ||
      !Number.isFinite(rectangle.width) ||
      rectangle.length <= 0 ||
      rectangle.width <= 0
    ) {
      return invalid("Rectangle dimensions must be positive numbers.");
    }
  }

  const byId = new Map(
    rectangles.map((rectangle) => [rectangle.id, rectangle])
  );

  const dimensionById = new Map(
    dimensionElements.map((dimension) => [dimension.id, dimension])
  );

  const joins = [];
  const dimensionLinks = [];

  // CHANGED: validate relationships for the selected construction.
  for (const relationship of relationships) {
    if (relationship?.type === "dimension_of") {
      dimensionLinks.push(relationship);
    } else if (
      !isCutoutFigure &&
      relationship?.type === "joins_edge"
    ) {
      joins.push(relationship);
    } else if (
      isCutoutFigure &&
      ["inside", "subtracts_from"].includes(relationship?.type)
    ) {
      // Validated by placeRectangularCutouts.
    } else {
      return invalid("Unsupported composite relationship.");
    }
  }

    // ADDED: separate construction branches.
  let positionedRectangles;

  if (isCutoutFigure) {
    const result = placeRectangularCutouts(
      rectangles,
      relationships
    );

    if (result.error) return invalid(result.error);

    positionedRectangles = result.rectangles;
  } else {
  const childIds = new Set();

  for (const join of joins) {
    if (
      !Array.isArray(join.elements) ||
      join.elements.length !== 1
    ) {
      return invalid("Each join must place one rectangle.");
    }

    const childId = join.elements[0];

    if (
      !byId.has(childId) ||
      !byId.has(join.target) ||
      childId === join.target ||
      childIds.has(childId) ||
      !["top", "bottom", "left", "right"].includes(join.side) ||
      !["start", "center", "end"].includes(join.alignment) ||
      !Number.isFinite(join.offset ?? 0)
    ) {
      return invalid("Invalid or duplicate rectangle join.");
    }
    const parent = byId.get(join.target);
    const child = byId.get(childId);
    const horizontalSide = ["top", "bottom"].includes(join.side);

    const parentDepth = horizontalSide
      ? parent.width
      : parent.length;

    const childDepth = horizontalSide
      ? child.width
      : child.length;

    const overlapDepth = join.overlap_depth ?? 0;

    if (
      !Number.isFinite(overlapDepth) ||
      overlapDepth < 0 ||
      overlapDepth > Math.min(parentDepth, childDepth)
    ) {
      return invalid("Invalid rectangle overlap depth.");
    }
    childIds.add(childId);
  }

  const roots = rectangles.filter(
    (rectangle) => !childIds.has(rectangle.id)
  );

  if (
    roots.length !== 1 ||
    joins.length !== rectangles.length - 1
  ) {
    return invalid("The rectangles must form one connected join tree.");
  }

  // Find the anchor from relationships rather than element order.
  const placed = new Map([
    [
      roots[0].id,
      { ...roots[0], x: 0, y: 0 },
    ],
  ]);

  const tolerance =
    Math.max(
      ...rectangles.flatMap((rectangle) => [
        rectangle.length,
        rectangle.width,
      ])
    ) * 1e-8;

  const pending = [...joins];

  while (pending.length > 0) {
    let progressed = false;

    for (let i = pending.length - 1; i >= 0; i--) {
      const join = pending[i];
      const parent = placed.get(join.target);

      if (!parent) continue;

      const child = byId.get(join.elements[0]);
      const horizontalSide =
        join.side === "top" || join.side === "bottom";

      const parentExtent = horizontalSide
        ? parent.length
        : parent.width;

      const childExtent = horizontalSide
        ? child.length
        : child.width;

      const alignmentOffset =
        join.alignment === "start"
          ? 0
          : join.alignment === "center"
            ? (parentExtent - childExtent) / 2
            : parentExtent - childExtent;

      const offset = alignmentOffset + (join.offset ?? 0);

      const sharedLength = Math.max(
        0,
        Math.min(parentExtent, offset + childExtent) -
          Math.max(0, offset)
      );

      if (sharedLength <= tolerance) {
        return invalid("Joined rectangles must share a positive edge length.");
      }

      let x = parent.x;
      let y = parent.y;

      const overlapDepth = join.overlap_depth ?? 0;

      if (horizontalSide) {
        x += offset;
        y +=
          join.side === "top"
            ? -child.width + overlapDepth
            : parent.width - overlapDepth;
      } else {
        y += offset;
        x +=
          join.side === "left"
            ? -child.length + overlapDepth
            : parent.length - overlapDepth;
      }

      placed.set(child.id, { ...child, x, y });
      pending.splice(i, 1);
      progressed = true;
    }

    if (!progressed) {
      return invalid("Circular or unresolved rectangle joins.");
    }
  }

    positionedRectangles = rectangles.map(
    (rectangle) => placed.get(rectangle.id)
  );

  // Reject overlaps, including those between non-parent neighbours.
  for (let i = 0; i < positionedRectangles.length; i++) {
    for (let j = i + 1; j < positionedRectangles.length; j++) {
      const a = positionedRectangles[i];
      const b = positionedRectangles[j];

      const overlapX =
        Math.min(a.x + a.length, b.x + b.length) -
        Math.max(a.x, b.x);

      const overlapY =
        Math.min(a.y + a.width, b.y + b.width) -
        Math.max(a.y, b.y);

      if (overlapX > tolerance && overlapY > tolerance) {
        const explicitlyAllowed = joins.some(
          (join) =>
            (join.overlap_depth ?? 0) > 0 &&
            (
              (join.elements[0] === a.id && join.target === b.id) ||
              (join.elements[0] === b.id && join.target === a.id)
            )
        );

        if (!explicitlyAllowed) {
          return invalid("Rectangle overlap requires an explicit overlap depth.");
        }
      }
    }
  }
}
  const linkedDimensionIds = new Set();
  const linkedRoles = new Set();
  const dimensions = [];
  const units = new Set();

  for (const link of dimensionLinks) {
    const rectangle = byId.get(link.target);

    if (
      !rectangle ||
      !Array.isArray(link.elements) ||
      link.elements.length === 0
    ) {
      return invalid("Invalid dimension target.");
    }

    for (const id of link.elements) {
      const dimension = dimensionById.get(id);

      if (
        !dimension ||
        linkedDimensionIds.has(id) ||
        !["length", "width", "area"].includes(dimension.role)
      ) {
        return invalid("Invalid or duplicate dimension reference.");
      }

      const roleKey = `${rectangle.id}:${dimension.role}`;

      if (linkedRoles.has(roleKey)) {
        return invalid("Duplicate dimension role on a rectangle.");
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
        (
          !Number.isFinite(dimension.value) ||
          dimension.value <= 0 ||
          Math.abs(dimension.value - expected) >
            Math.max(expected, dimension.value) * 1e-8
        )
      ) {
        return invalid("Displayed dimension disagrees with its rectangle.");
      }

      if (
        typeof dimension.label !== "string" ||
        !dimension.label.trim() ||
        (
          dimension.unit !== undefined &&
          typeof dimension.unit !== "string"
        )
      ) {
        return invalid("Dimensions need valid labels and units.");
      }

      const unit = dimension.unit?.trim() || "";

      if (dimension.role !== "area" && unit) {
        units.add(unit);
      }

      dimensions.push({
        ...dimension,
        unit,
        rectangleId: rectangle.id,
        isUnknown: !hasValue,
      });

      linkedDimensionIds.add(id);
      linkedRoles.add(roleKey);
    }
  }

  if (linkedDimensionIds.size !== dimensionElements.length) {
    return invalid("Every dimension must be linked to a rectangle.");
  }

  if (units.size > 1) {
    return invalid("Use one common length unit.");
  }

  return {
    valid: true,
    error: null,
    figure: { ...figure },
    rectangles: positionedRectangles,
    dimensions,
    relationships: relationships.map((relationship) => ({
      ...relationship,
      elements: [...relationship.elements],
    })),
  };
}