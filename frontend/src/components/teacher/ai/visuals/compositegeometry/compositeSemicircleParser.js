// compositeSemicircleParser.js

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
  Math.abs(a - b) <= Math.max(1, Math.abs(a), Math.abs(b)) * 1e-8;

export function parseCompositeSemicircle(visual) {
  const { figure, elements, relationships } = visual || {};

  if (
    figure?.type !== "composite_geometry" ||
    figure?.subtype !== "rectangle_semicircle" ||
    !["area", "perimeter"].includes(figure.feature)
  ) {
    return invalid("Unsupported rectangle–semicircle construction.");
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
      !["rectangle", "semicircle", "dimension"].includes(element.type) ||
      (element.label !== undefined && typeof element.label !== "string")
    ) {
      return invalid("Invalid or duplicate element.");
    }

    ids.add(element.id);
  }

  const rectangles = elements.filter((e) => e.type === "rectangle");
  const semicircles = elements.filter((e) => e.type === "semicircle");
  const dimensionElements = elements.filter((e) => e.type === "dimension");

  if (
    rectangles.length !== 1 ||
    semicircles.length < 1 ||
    semicircles.length > 2
  ) {
    return invalid("Use one rectangle and one or two semicircles.");
  }

  const rectangle = { ...rectangles[0], x: 0, y: 0 };

  if (!positive(rectangle.length) || !positive(rectangle.width)) {
    return invalid("Rectangle dimensions must be positive numbers.");
  }

  for (const relationship of relationships) {
    if (
      !relationship ||
      !["attaches_to", "dimension_of"].includes(relationship.type) ||
      !Array.isArray(relationship.elements) ||
      relationship.elements.length === 0
    ) {
      return invalid("Invalid semicircle relationship.");
    }
  }

  const attachments = relationships.filter((r) => r.type === "attaches_to");

  if (attachments.length !== semicircles.length) {
    return invalid("Every semicircle needs one attachment.");
  }

  const semicircleById = new Map(semicircles.map((s) => [s.id, s]));
  const attachedIds = new Set();
  const usedSides = new Set();
  const positionedSemicircles = [];

  for (const attachment of attachments) {
    const id = attachment.elements[0];
    const source = semicircleById.get(id);

    if (
      attachment.elements.length !== 1 ||
      attachment.target !== rectangle.id ||
      !source ||
      attachedIds.has(id) ||
      !["top", "bottom", "left", "right"].includes(attachment.side) ||
      usedSides.has(attachment.side) ||
      !["inside", "outside"].includes(attachment.placement)
    ) {
      return invalid("Invalid or duplicate semicircle attachment.");
    }

    const horizontal = ["top", "bottom"].includes(attachment.side);
    const diameter = horizontal ? rectangle.length : rectangle.width;
    const radius = diameter / 2;
    const depth = horizontal ? rectangle.width : rectangle.length;

    if (attachment.placement === "inside" && radius >= depth) {
      return invalid("The semicircular notch must fit within the rectangle.");
    }

    positionedSemicircles.push({
      ...source,
      side: attachment.side,
      placement: attachment.placement,
      radius,
      diameter,
    });

    attachedIds.add(id);
    usedSides.add(attachment.side);
  }

  if (positionedSemicircles.length === 2) {
    const [a, b] = positionedSemicircles;
    const opposite = {
      top: "bottom",
      bottom: "top",
      left: "right",
      right: "left",
    };

    if (
      a.placement !== "outside" ||
      b.placement !== "outside" ||
      opposite[a.side] !== b.side
    ) {
      return invalid("Two semicircles must be outside on opposite sides.");
    }
  }

  const shapeById = new Map([
    [rectangle.id, rectangle],
    ...positionedSemicircles.map((s) => [s.id, s]),
  ]);

  const dimensionById = new Map(dimensionElements.map((d) => [d.id, d]));
  const linkedIds = new Set();
  const linkedRoles = new Set();
  const units = new Set();
  const dimensions = [];

  for (const link of relationships.filter((r) => r.type === "dimension_of")) {
    const target = shapeById.get(link.target);
    if (!target) return invalid("Invalid dimension target.");

    for (const id of link.elements) {
      const dimension = dimensionById.get(id);
      const allowedRoles =
        target.type === "rectangle"
          ? ["length", "width"]
          : ["radius", "diameter"];

      if (
        !dimension ||
        linkedIds.has(id) ||
        !allowedRoles.includes(dimension.role)
      ) {
        return invalid("Invalid dimension role or reference.");
      }

      const roleKey = `${target.id}:${dimension.role}`;

      if (linkedRoles.has(roleKey)) {
        return invalid("Duplicate dimension role.");
      }

      const expected = target[dimension.role];
      const hasValue = dimension.value !== undefined;

      if (
        hasValue &&
        (!positive(dimension.value) || !same(dimension.value, expected))
      ) {
        return invalid("Displayed dimension disagrees with the geometry.");
      }

      if (
        typeof dimension.label !== "string" ||
        !dimension.label.trim() ||
        (dimension.unit !== undefined && typeof dimension.unit !== "string")
      ) {
        return invalid("Invalid dimension label or unit.");
      }

      const unit = dimension.unit?.trim() || "";
      if (unit) units.add(unit);

      dimensions.push({
        ...dimension,
        unit,
        targetId: target.id,
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
    semicircleConfig: true,
    rectangle,
    semicircles: positionedSemicircles,
    dimensions,
    relationships: relationships.map((r) => ({
      ...r,
      elements: [...r.elements],
    })),
  };
}