// graph/functionGraphParser.js

const DIRECT_FEATURES = new Set([
  "identify_function",
  "read_value",
  "amplitude",
  "period",
  "phase_shift",
  "vertical_shift",
]);

const INVERSE_FEATURES = new Set([
  "identify_function",
  "read_value",
  "domain",
  "range",
]);

const FEATURES = new Set([
  ...DIRECT_FEATURES,
  ...INVERSE_FEATURES,
]);

const DIRECT_FUNCTIONS = new Set(["sin", "cos", "tan"]);
const INVERSE_FUNCTIONS = new Set(["asin", "acos", "atan"]);

const FUNCTIONS = new Set([
  ...DIRECT_FUNCTIONS,
  ...INVERSE_FUNCTIONS,
]);

function invalid(error) {
  return {
    valid: false,
    error,
    figure: null,
    axes: null,
    curves: [],
  };
}

export function parseFunctionGraph(visual) {
  const { figure, elements, relationships } = visual || {};

  if (
    figure?.type !== "graph" ||
    figure?.subtype !== "function_graph" ||
    !FEATURES.has(figure.feature)
  ) {
    return invalid("Unsupported function graph.");
  }

  if (figure.angle_unit !== "radians") {
    return invalid("Trigonometric function graphs must use radians.");
  }

  // ------------------------------------------
  // 1. Validate mathematical bounds.
  // ------------------------------------------
  const bounds = figure.bounds;

  if (
    !bounds ||
    !["x_min", "x_max", "y_min", "y_max"].every(
      (key) => Number.isFinite(bounds[key])
    )
  ) {
    return invalid("Graph bounds must contain four finite numbers.");
  }

  const {
    x_min: minX,
    x_max: maxX,
    y_min: minY,
    y_max: maxY,
  } = bounds;

  const rangeX = maxX - minX;
  const rangeY = maxY - minY;

  if (
    !Number.isFinite(rangeX) ||
    !Number.isFinite(rangeY) ||
    rangeX <= 0 ||
    rangeY <= 0
  ) {
    return invalid("Graph bounds must have positive finite ranges.");
  }

  if (
    minX > 0 ||
    maxX < 0 ||
    minY > 0 ||
    maxY < 0
  ) {
    return invalid("Graph bounds must include zero on both axes.");
  }

    // ------------------------------------------
    // 2. Determine the graph family and tick units.
    // ------------------------------------------
    if (
      !Array.isArray(elements) ||
      !Array.isArray(relationships)
    ) {
      return invalid("Elements and relationships must be arrays.");
    }

    const rawCurves = elements.filter(
      (element) => element?.type === "function_curve"
    );

    const hasInverse = rawCurves.some(
      (curve) => INVERSE_FUNCTIONS.has(curve.function)
    );

    const hasDirect = rawCurves.some(
      (curve) => DIRECT_FUNCTIONS.has(curve.function)
    );

    if (hasInverse && hasDirect) {
      return invalid(
        "Do not mix direct and inverse trigonometric curves in this phase."
      );
    }

    const isInverse = hasInverse;

    const allowedFeatures = isInverse
      ? INVERSE_FEATURES
      : DIRECT_FEATURES;

    if (!allowedFeatures.has(figure.feature)) {
      return invalid("This feature is not supported for the selected graph family.");
    }

    const xTickUnit = isInverse ? "number" : "pi";
    const yTickUnit = isInverse ? "pi" : "number";

    const xTickAmount = isInverse
      ? figure.x_tick_step
      : figure.x_tick_pi;

    const yTickAmount = isInverse
      ? figure.y_tick_pi
      : figure.y_tick_step;

    if (
      !Number.isFinite(xTickAmount) ||
      xTickAmount <= 0 ||
      !Number.isFinite(yTickAmount) ||
      yTickAmount <= 0
    ) {
      return invalid(
        isInverse
          ? "Inverse graphs need positive x_tick_step and y_tick_pi."
          : "Direct graphs need positive x_tick_pi and y_tick_step."
      );
    }

    // Prevent conflicting tick specifications.
    if (
      isInverse &&
      (
        figure.x_tick_pi !== undefined ||
        figure.y_tick_step !== undefined
      )
    ) {
      return invalid(
        "Inverse graphs use x_tick_step and y_tick_pi only."
      );
    }

    if (
      !isInverse &&
      (
        figure.x_tick_step !== undefined ||
        figure.y_tick_pi !== undefined
      )
    ) {
      return invalid(
        "Direct graphs use x_tick_pi and y_tick_step only."
      );
    }

    const xTickStep =
      xTickAmount * (xTickUnit === "pi" ? Math.PI : 1);

    const yTickStep =
      yTickAmount * (yTickUnit === "pi" ? Math.PI : 1);

    if (
      !Number.isFinite(xTickStep) ||
      !Number.isFinite(yTickStep) ||
      xTickStep <= 0 ||
      yTickStep <= 0
    ) {
      return invalid("Invalid numeric tick spacing.");
    }

    function safeTickCount(min, max, step) {
      const first = Math.ceil(min / step);
      const last = Math.floor(max / step);

      if (
        !Number.isSafeInteger(first) ||
        !Number.isSafeInteger(last)
      ) {
        return null;
      }

      return Math.max(0, last - first + 1);
    }

    const xTickCount = safeTickCount(minX, maxX, xTickStep);
    const yTickCount = safeTickCount(minY, maxY, yTickStep);

    if (
      xTickCount === null ||
      yTickCount === null ||
      xTickCount > 200 ||
      yTickCount > 200
    ) {
      return invalid("Tick spacing produces too many ticks.");
    }

    if (
      figure.show_grid !== undefined &&
      typeof figure.show_grid !== "boolean"
    ) {
      return invalid("show_grid must be a boolean.");
    }

  // ------------------------------------------
  // 3. Validate and index elements.
  // ------------------------------------------
  if (
    !Array.isArray(elements) ||
    !Array.isArray(relationships)
  ) {
    return invalid("Elements and relationships must be arrays.");
  }

  const byId = new Map();

  for (const element of elements) {
    if (
      !element ||
      typeof element.id !== "string" ||
      !element.id.trim() ||
      byId.has(element.id)
    ) {
      return invalid("Missing or duplicate graph element ID.");
    }

    if (!["axis", "function_curve"].includes(element.type)) {
      return invalid("Unsupported function-graph element.");
    }

    if (
      element.label !== undefined &&
      typeof element.label !== "string"
    ) {
      return invalid("Graph labels must be strings.");
    }

    byId.set(element.id, {
      ...element,
      label: element.label?.trim() || "",
    });
  }

  // ------------------------------------------
  // 4. Resolve exactly one axis per direction.
  // ------------------------------------------
  const axisElements = [...byId.values()].filter(
    (element) => element.type === "axis"
  );

  const horizontalAxes = axisElements.filter(
    (axis) => axis.orientation === "horizontal"
  );

  const verticalAxes = axisElements.filter(
    (axis) => axis.orientation === "vertical"
  );

  if (
    axisElements.length !== 2 ||
    horizontalAxes.length !== 1 ||
    verticalAxes.length !== 1 ||
    axisElements.some((axis) => !axis.label)
  ) {
    return invalid(
      "Provide one labelled horizontal axis and one labelled vertical axis."
    );
  }

  const axes = {
    x: horizontalAxes[0],
    y: verticalAxes[0],
  };

  // ------------------------------------------
  // 5. Validate function parameters.
  // ------------------------------------------
  const curves = [...byId.values()].filter(
    (element) => element.type === "function_curve"
  );

  if (curves.length < 1 || curves.length > 2) {
    return invalid("Provide one or two function curves.");
  }

    if (isInverse && curves.length !== 1) {
    return invalid(
      "Inverse trigonometric graphs use exactly one curve in this phase."
    );
  }

  for (const curve of curves) {
    if (!FUNCTIONS.has(curve.function)) {
      return invalid(
        "Supported functions are sin, cos, tan, asin, acos and atan."
      );
    }

    if (
      !["a", "b", "h", "k"].every(
        (key) => Number.isFinite(curve[key])
      ) ||
      curve.a === 0 ||
      curve.b <= 0
    ) {
      return invalid(
        "Curves need finite a, b, h, k with a nonzero and b positive."
      );
    }

    if (isInverse) {
      // Standard principal branches only for this phase.
      if (
        curve.a !== 1 ||
        curve.b !== 1 ||
        curve.h !== 0 ||
        curve.k !== 0
      ) {
        return invalid(
          "Inverse graphs currently require a=1, b=1, h=0 and k=0."
        );
      }

      if (
        curve.function === "asin" ||
        curve.function === "acos"
      ) {
        if (minX >= -1 || maxX <= 1) {
          return invalid(
            "Bounds must extend beyond both domain endpoints -1 and 1."
          );
        }
      }

      if (curve.function === "acos") {
        if (minY >= 0 || maxY <= Math.PI) {
          return invalid(
            "Arccosine bounds must leave margin below 0 and above pi."
          );
        }
      } else {
        // asin endpoints and atan asymptotes share these y-values.
        if (
          minY >= -Math.PI / 2 ||
          maxY <= Math.PI / 2
        ) {
          return invalid(
            "Bounds must leave margin below -pi/2 and above pi/2."
          );
        }
      }

      if (
        curve.function === "atan" &&
        (minX >= 0 || maxX <= 0)
      ) {
        return invalid(
          "Arctangent bounds must show both sides of the origin."
        );
      }

      // Inverse functions do not use period/amplitude validation.
      continue;
    }

    // Existing direct-trigonometric validation.
    const period =
      (curve.function === "tan" ? Math.PI : 2 * Math.PI) /
      curve.b;

    if (!Number.isFinite(period) || period <= 0) {
      return invalid(
        "The function period is outside the supported numeric range."
      );
    }

    const phaseMin = curve.b * (minX - curve.h);
    const phaseMax = curve.b * (maxX - curve.h);

    if (
      !Number.isFinite(phaseMin) ||
      !Number.isFinite(phaseMax)
    ) {
      return invalid(
        "Function parameters exceed the supported numeric range."
      );
    }

    if (
      figure.feature === "amplitude" &&
      curve.function === "tan"
    ) {
      return invalid("Tangent has no amplitude.");
    }

    if (
      figure.feature === "period" &&
      rangeX < period * (1 - 1e-8)
    ) {
      return invalid(
        "Period questions must display at least one full period of each curve."
      );
    }
  }

  if (
    curves.length === 2 &&
    (
      curves.some((curve) => !curve.label) ||
      curves[0].label === curves[1].label
    )
  ) {
    return invalid("Two curves need distinct visible labels, such as f and g.");
  }

  // ------------------------------------------
  // 6. Link every curve to both declared axes.
  // Grouped plotted_on relationships are allowed.
  // ------------------------------------------
  const linkedAxes = new Map(
    curves.map((curve) => [curve.id, new Set()])
  );

  for (const relationship of relationships) {
    if (
      !relationship ||
      relationship.type !== "plotted_on" ||
      !Array.isArray(relationship.elements) ||
      relationship.elements.length === 0 ||
      ![axes.x.id, axes.y.id].includes(relationship.target)
    ) {
      return invalid("Invalid plotted_on relationship.");
    }

    for (const curveId of relationship.elements) {
      const linked = linkedAxes.get(curveId);

      if (!linked) {
        return invalid("plotted_on must reference function curves.");
      }

      if (linked.has(relationship.target)) {
        return invalid("A curve cannot be linked to the same axis twice.");
      }

      linked.add(relationship.target);
    }
  }

  if (
    curves.some(
      (curve) => linkedAxes.get(curve.id).size !== 2
    )
  ) {
    return invalid("Every curve must be linked to both axes.");
  }

  return {
    valid: true,
    error: null,

    figure: {
      ...figure,
      bounds: { ...bounds },
      show_grid: figure.show_grid ?? false,
    },

    axes,
    curves,
    isInverse,
    xTickUnit,
    yTickUnit,
    xTickAmount,
    yTickAmount,
    xTickStep,
    yTickStep,
  };
}