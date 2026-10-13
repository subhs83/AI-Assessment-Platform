const SOLID_RULES = {
  cube: {
    features: [
      "total_surface_area",
      "lateral_surface_area",
      "volume",
    ],
    roles: ["side"],
  },

  cuboid: {
    features: [
      "total_surface_area",
      "lateral_surface_area",
      "volume",
    ],
    roles: ["length", "width", "height"],
  },

  cylinder: {
    features: [
      "total_surface_area",
      "curved_surface_area",
      "volume",
    ],
    roles: ["radius", "diameter", "height"],
  },

  cone: {
    features: [
      "total_surface_area",
      "curved_surface_area",
      "volume",
    ],
    roles: ["radius", "diameter", "height", "slant_height"],
  },
  sphere: {
    features: ["total_surface_area", "curved_surface_area", "volume"],
    roles: ["radius", "diameter"],
    },

    hemisphere: {
        features: ["total_surface_area", "curved_surface_area", "volume"],
        roles: ["radius", "diameter"],
        },

    triangular_prism: {
    features: ["total_surface_area", "lateral_surface_area", "volume"],
    roles: [
        "base_side_a",
        "base_side_b",
        "base_side_c",
        "base_altitude",
        "prism_length",
    ],
  },

  square_pyramid: {
    features: [
        "volume",
        "lateral_surface_area",
        "total_surface_area",
    ],
    roles: ["base_side", "height", "slant_height"],
  },
};

function invalid(message) {
  return {
    valid: false,
    error: message,
    figure: null,
    solid: null,
    dimensions: [],
    dimensionsByRole: {},
    relationships: [],
  };
}

export function parseSolidGeometry(visual) {
  if (!visual || typeof visual !== "object") {
    return invalid("Missing solid geometry payload.");
  }

  const { figure, elements, relationships } = visual;
  const rules = SOLID_RULES[figure?.subtype];

  if (
    figure?.type !== "solid_geometry" ||
    !rules ||
    !rules.features.includes(figure.feature)
  ) {
    return invalid("Unsupported solid or feature.");
  }

  if (
    !Array.isArray(elements) ||
    !Array.isArray(relationships)
  ) {
    return invalid("Elements and relationships must be arrays.");
  }

  // Open faces apply only to cuboids and cylinders.
  const openFaces = figure.open_faces ?? [];

  if (
    !Array.isArray(openFaces) ||
    openFaces.some(
      (face) => face !== "top" && face !== "bottom"
    ) ||
    new Set(openFaces).size !== openFaces.length
  ) {
    return invalid("Invalid open_faces.");
  }

  if (
    openFaces.length > 0 &&
    !["cuboid", "cylinder"].includes(figure.subtype)
  ) {
    return invalid("Open faces are unsupported for this solid.");
  }

  const elementsById = new Map();

  for (const element of elements) {
    if (
      !element ||
      typeof element.id !== "string" ||
      !element.id.trim() ||
      elementsById.has(element.id)
    ) {
      return invalid("Missing or duplicate element ID.");
    }

    if (
      element.type !== "solid" &&
      element.type !== "dimension"
    ) {
      return invalid("Unsupported solid element type.");
    }

    if (
      element.label !== undefined &&
      typeof element.label !== "string"
    ) {
      return invalid("Element labels must be strings.");
    }

    elementsById.set(element.id, element);
  }

  const solids = elements.filter(
    (element) => element.type === "solid"
  );

  const dimensions = elements.filter(
    (element) => element.type === "dimension"
  );

  if (solids.length !== 1) {
    return invalid("Exactly one solid is required.");
  }

  if (dimensions.length === 0) {
    return invalid("At least one dimension is required.");
  }

  const solid = solids[0];
  const linkedDimensionIds = new Set();

  for (const relationship of relationships) {
    if (
      relationship?.type !== "dimension_of" ||
      relationship.target !== solid.id ||
      !Array.isArray(relationship.elements) ||
      relationship.elements.length === 0
    ) {
      return invalid("Invalid dimension_of relationship.");
    }

    for (const id of relationship.elements) {
      const dimension = elementsById.get(id);

      if (
        dimension?.type !== "dimension" ||
        linkedDimensionIds.has(id)
      ) {
        return invalid("Invalid or duplicate dimension reference.");
      }

      linkedDimensionIds.add(id);
    }
  }

  if (
    dimensions.some(
      (dimension) => !linkedDimensionIds.has(dimension.id)
    )
  ) {
    return invalid("Every dimension must be linked to the solid.");
  }

  const dimensionsByRole = {};
  const normalizedDimensions = [];

  for (const dimension of dimensions) {
    if (!rules.roles.includes(dimension.role)) {
      return invalid("Unsupported dimension role for this solid.");
    }

    if (dimensionsByRole[dimension.role]) {
      return invalid("Duplicate dimension role.");
    }

    const hasValue = dimension.value !== undefined;

    if (
      hasValue &&
      (!Number.isFinite(dimension.value) || dimension.value <= 0)
    ) {
      return invalid("Given dimensions must be positive numbers.");
    }

    if (
      dimension.unit !== undefined &&
      typeof dimension.unit !== "string"
    ) {
      return invalid("Dimension units must be strings.");
    }

    const unit = dimension.unit?.trim() || "";
    const suppliedLabel = dimension.label?.trim() || "";

    if (!hasValue && !suppliedLabel) {
      return invalid("An unknown dimension needs a display label.");
    }

    const normalized = {
      ...dimension,
      unit,
      label:
        suppliedLabel ||
        `$${dimension.value}$${unit ? ` ${unit}` : ""}`,
      isUnknown: !hasValue,
    };

    dimensionsByRole[dimension.role] = normalized;
    normalizedDimensions.push(normalized);
  }

  // This phase expects all supplied measurements in one unit.
  // It does not convert values between units.
  const suppliedUnits = new Set(
    normalizedDimensions
      .filter((dimension) => !dimension.isUnknown)
      .map((dimension) => dimension.unit)
      .filter(Boolean)
  );

  if (suppliedUnits.size > 1) {
    return invalid("Use the same unit for all given dimensions.");
  }

  const known = (role) => {
    const dimension = dimensionsByRole[role];

    return dimension && !dimension.isUnknown
      ? dimension.value
      : null;
  };

  const hasKnown = (role) => known(role) !== null;

  if (figure.subtype === "cube") {
    if (!hasKnown("side")) {
      return invalid("Cube area and volume require a given side.");
    }
  }

  if (figure.subtype === "cuboid") {
    if (
      !["length", "width", "height"].every(hasKnown)
    ) {
      return invalid("Cuboid requires length, width, and height.");
    }
  }

    if (
        ["cylinder", "cone", "sphere", "hemisphere"].includes(
            figure.subtype
        )
    ) {
    // Prefer one radial measurement, preventing redundant labels.
    if (
      dimensionsByRole.radius &&
      dimensionsByRole.diameter
    ) {
      return invalid("Provide radius or diameter, not both.");
    }

    if (!hasKnown("radius") && !hasKnown("diameter")) {
      return invalid("A given radius or diameter is required.");
    }
  }

  if (figure.subtype === "cylinder") {
    if (!hasKnown("height")) {
      return invalid("Cylinder requires a given height.");
    }
  }

  if (figure.subtype === "cone") {
    const radius = hasKnown("radius")
      ? known("radius")
      : known("diameter") / 2;

    const height = known("height");
    const slantHeight = known("slant_height");

    if (
      slantHeight !== null &&
      slantHeight <= radius
    ) {
      return invalid("Cone slant height must exceed its radius.");
    }

    if (
      height !== null &&
      slantHeight !== null
    ) {
      const expectedSlant = Math.hypot(radius, height);
      const tolerance =
        Math.max(expectedSlant, slantHeight) * 1e-6;

      if (
        Math.abs(slantHeight - expectedSlant) > tolerance
      ) {
        return invalid("Cone dimensions are inconsistent.");
      }
    }

    // With radius and either height, the other can be derived
    // for construction without adding a displayed dimension.
    if (height === null && slantHeight === null) {
      return invalid(
        "Cone requires a given height or slant height."
      );
    }
  }

   if (figure.subtype === "triangular_prism") {
    if (!hasKnown("base_side_a") || !hasKnown("prism_length")) {
        return invalid("Prism requires a base side and prism length.");
    }

    const a = known("base_side_a");
    const b = known("base_side_b");
    const c = known("base_side_c");
    const altitude = known("base_altitude");

    const hasBothSides = b !== null && c !== null;

    if ((b === null) !== (c === null)) {
        return invalid("Supply both remaining base sides or neither.");
    }

    if (
        figure.feature !== "volume" &&
        !hasBothSides
    ) {
        return invalid("Prism surface area requires all three base sides.");
    }

    if (
        figure.feature === "volume" &&
        altitude === null &&
        !hasBothSides
    ) {
        return invalid("Prism volume requires a base altitude or all base sides.");
    }

    if (hasBothSides) {
        if (a + b <= c || a + c <= b || b + c <= a) {
        return invalid("Base sides do not form a triangle.");
        }

        // b joins the left base vertex to the apex;
        // c joins the right base vertex to the apex.
        const apexX = (a * a + b * b - c * c) / (2 * a);
        const expectedAltitude = Math.sqrt(
        Math.max(0, b * b - apexX * apexX)
        );

        if (
        altitude !== null &&
        Math.abs(altitude - expectedAltitude) >
            Math.max(altitude, expectedAltitude) * 1e-6
        ) {
        return invalid("Prism base sides and altitude are inconsistent.");
        }
      }
    }

    if (figure.subtype === "square_pyramid") {
        const side = known("base_side");
        const height = known("height");
        const slantHeight = known("slant_height");

        if (side === null) {
            return invalid("Square pyramid requires a given base side.");
        }

        if (height === null && slantHeight === null) {
            return invalid("Square pyramid requires height or face slant height.");
        }

        if (slantHeight !== null && slantHeight <= side / 2) {
            return invalid("Face slant height must exceed half the base side.");
        }

        if (height !== null && slantHeight !== null) {
            const expectedSlant = Math.hypot(height, side / 2);

            if (
            Math.abs(slantHeight - expectedSlant) >
            Math.max(expectedSlant, slantHeight) * 1e-6
            ) {
            return invalid("Square pyramid dimensions are inconsistent.");
            }
        }
        }

  return {
    valid: true,
    error: null,
    figure: {
      ...figure,
      open_faces: [...openFaces],
    },
    solid: {
      ...solid,
      label: solid.label || "",
    },
    dimensions: normalizedDimensions,
    dimensionsByRole,
    relationships: relationships.map((relationship) => ({
      ...relationship,
      elements: [...relationship.elements],
    })),
  };
}