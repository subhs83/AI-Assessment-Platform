// graph/integralRegionParser.js

function invalid(error) {
  return {
    valid: false,
    error,
    figure: null,
    axes: [],
    curves: [],
    regions: [],
  };
}

// Coefficients are ordered: constant, linear, quadratic, cubic.
export function evaluatePolynomial(coefficients, t) {
  let result = 0;

  for (let i = coefficients.length - 1; i >= 0; i--) {
    result = result * t + coefficients[i];
  }

  return result;
}

// Find real polynomial roots within a finite interval.
// Derivative roots divide the interval into monotonic sections;
// each sign-changing section contains one root.
function polynomialRootsInInterval(coefficients, lower, upper) {
  const coefficientsCopy = [...coefficients];

  while (
    coefficientsCopy.length > 1 &&
    coefficientsCopy[coefficientsCopy.length - 1] === 0
  ) {
    coefficientsCopy.pop();
  }

  if (coefficientsCopy.some((value) => !Number.isFinite(value))) {
    return null;
  }

  const magnitude = Math.max(...coefficientsCopy.map(Math.abs));

  if (magnitude === 0 || coefficientsCopy.length === 1) {
    return [];
  }

  // Normalization reduces overflow during differentiation.
  const normalized = coefficientsCopy.map(
    (value) => value / magnitude
  );

  const degree = normalized.length - 1;

  if (degree === 1) {
    const root = -normalized[0] / normalized[1];

    return Number.isFinite(root) && root >= lower && root <= upper
      ? [root]
      : [];
  }

  const derivative = normalized
    .slice(1)
    .map((value, index) => value * (index + 1));

  const criticalPoints = polynomialRootsInInterval(
    derivative,
    lower,
    upper
  );

  if (!criticalPoints) return null;

  const cuts = [
    lower,
    ...criticalPoints.filter(
      (value) => value > lower && value < upper
    ),
    upper,
  ].sort((a, b) => a - b);

  const values = cuts.map((t) =>
    evaluatePolynomial(normalized, t)
  );

  if (values.some((value) => !Number.isFinite(value))) {
    return null;
  }

  const roots = [];

  // Include repeated roots occurring at critical points.
  for (let index = 0; index < cuts.length; index++) {
    const t = cuts[index];

    const evaluationScale = evaluatePolynomial(
      normalized.map(Math.abs),
      Math.abs(t)
    );

    if (!Number.isFinite(evaluationScale)) return null;

    const tolerance =
      Number.EPSILON * 64 * Math.max(1, evaluationScale);

    if (Math.abs(values[index]) <= tolerance) {
      roots.push(t);
    }
  }

  for (let index = 1; index < cuts.length; index++) {
    let left = cuts[index - 1];
    let right = cuts[index];
    let leftValue = values[index - 1];
    const rightValue = values[index];

    if (
      leftValue === 0 ||
      rightValue === 0 ||
      (leftValue > 0) === (rightValue > 0)
    ) {
      continue;
    }

    for (let iteration = 0; iteration < 100; iteration++) {
      const middle = left + (right - left) / 2;

      if (middle === left || middle === right) break;

      const middleValue = evaluatePolynomial(normalized, middle);

      if (!Number.isFinite(middleValue)) return null;

      if (middleValue === 0) {
        left = middle;
        right = middle;
        break;
      }

      if ((middleValue > 0) === (leftValue > 0)) {
        left = middle;
        leftValue = middleValue;
      } else {
        right = middle;
      }
    }

    roots.push(left + (right - left) / 2);
  }

  return [...new Set(roots)].sort((a, b) => a - b);
}

function stationaryPoints(coefficients, lower, upper) {
  const magnitude = Math.max(...coefficients.map(Math.abs));

  if (magnitude === 0 || coefficients.length === 1) {
    return [];
  }

  const derivative = coefficients
    .slice(1)
    .map(
      (value, index) =>
        (value / magnitude) * (index + 1)
    );

  const roots = polynomialRootsInInterval(
    derivative,
    lower,
    upper
  );

  return roots?.filter(
    (value) => value > lower && value < upper
  ) ?? null;
}

function rangeOnInterval(coefficients, lower, upper) {
  const stationary = stationaryPoints(
    coefficients,
    lower,
    upper
  );

  if (!stationary) return null;

  const samples = [lower, upper, ...stationary];

  const values = samples.map((t) =>
    evaluatePolynomial(coefficients, t)
  );

  if (values.some((value) => !Number.isFinite(value))) {
    return null;
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function findPolynomialPiece(curve, lower, upper = lower) {
  return curve.pieces.find(
    (piece) =>
      lower >= piece.lower &&
      upper <= piece.upper
  );
}
// Shared evaluator for polynomial and ellipse boundaries.
// Returns NaN outside an ellipse branch's real domain.
export function evaluateIntegralCurve(curve, t, variable = "x") {
  if (curve.function === "polynomial") {
    return evaluatePolynomial(curve.coefficients, t);
  }

    if (curve.function === "piecewise_polynomial") {
    const piece = findPolynomialPiece(curve, t);

    return piece
      ? evaluatePolynomial(piece.coefficients, t)
      : NaN;
  }
    if (curve.function === "sin" || curve.function === "cos") {
    const angle = curve.b * (t - curve.h);

    return (
      curve.a *
        (curve.function === "sin"
          ? Math.sin(angle)
          : Math.cos(angle)) +
      curve.k
    );
  }
  if (curve.function !== "ellipse_branch") return NaN;

  const center = variable === "x" ? curve.h : curve.k;
  const radius = variable === "x" ? curve.rx : curve.ry;
  const outputCenter = variable === "x" ? curve.k : curve.h;
  const outputRadius = variable === "x" ? curve.ry : curve.rx;

  const normalized = (t - center) / radius;

  // Allow only tiny floating-point error at the endpoints.
  if (Math.abs(normalized) > 1 + 1e-12) return NaN;

  const root = Math.sqrt(
    Math.max(0, (1 - normalized) * (1 + normalized))
  );

  return (
    outputCenter +
    (curve.branch === "positive" ? 1 : -1) *
      outputRadius *
      root
  );
}

export function getIntegralCurveDomain(curve, variable = "x") {
  if (["polynomial", "sin", "cos"].includes(curve.function)) {
    return { lower: -Infinity, upper: Infinity };
  }

  if (curve.function === "piecewise_polynomial") {
    return {
      lower: curve.pieces[0].lower,
      upper: curve.pieces[curve.pieces.length - 1].upper,
    };
  }

  const center = variable === "x" ? curve.h : curve.k;
  const radius = variable === "x" ? curve.rx : curve.ry;

  return {
    lower: center - radius,
    upper: center + radius,
  };
}

function trigCriticalPoints(curve, lower, upper) {
  const phase1 = curve.b * (lower - curve.h);
  const phase2 = curve.b * (upper - curve.h);

  const phaseMin = Math.min(phase1, phase2);
  const phaseMax = Math.max(phase1, phase2);

  // sin has extrema at pi/2 + n*pi; cos at n*pi.
  const offset = curve.function === "sin" ? Math.PI / 2 : 0;

  const first = Math.ceil((phaseMin - offset) / Math.PI);
  const last = Math.floor((phaseMax - offset) / Math.PI);

  const points = [];

  for (let index = first; index <= last; index++) {
    const t = curve.h + (offset + index * Math.PI) / curve.b;

    if (t > lower && t < upper) {
      points.push(t);
    }
  }

  return points;
}

function integralCurveRange(curve, lower, upper, variable) {
  if (curve.function === "polynomial") {
    return rangeOnInterval(curve.coefficients, lower, upper);
  }
    if (curve.function === "sin" || curve.function === "cos") {
    const samples = [
      lower,
      upper,
      ...trigCriticalPoints(curve, lower, upper),
    ];

    const values = samples.map((t) =>
      evaluateIntegralCurve(curve, t, variable)
    );

    if (values.some((value) => !Number.isFinite(value))) {
      return null;
    }

    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }
  const center = variable === "x" ? curve.h : curve.k;
  const samples = [lower, upper];

  // An ellipse branch has its only interior extremum at its centre.
  if (center > lower && center < upper) {
    samples.push(center);
  }

  const values = samples.map((t) =>
    evaluateIntegralCurve(curve, t, variable)
  );

  if (values.some((value) => !Number.isFinite(value))) {
    return null;
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

// Establish ordering using interval ranges, not only sampled points.
// If ordering cannot be established within the work limit, reject it
// rather than silently accepting a potentially crossing region.
function establishCurveOrder(
  first,
  second,
  lower,
  upper,
  variable,
  tolerance
) {
  let strongestDifference = 0;

    const probePoints = Array.from(
    { length: 17 },
    (_, index) => lower + (upper - lower) * (index / 16)
  );

  for (const curve of [first, second]) {
    if (curve.function === "sin" || curve.function === "cos") {
      probePoints.push(
        ...trigCriticalPoints(curve, lower, upper)
      );
    }
  }

  for (const t of probePoints) {
    const difference =
      evaluateIntegralCurve(first, t, variable) -
      evaluateIntegralCurve(second, t, variable);

    if (!Number.isFinite(difference)) {
      return { error: "Invalid boundary value within the region." };
    }

    if (Math.abs(difference) > Math.abs(strongestDifference)) {
      strongestDifference = difference;
    }
  }

  if (Math.abs(strongestDifference) <= tolerance) {
    return {
      error: "The region has no distinguishable positive area at this scale.",
    };
  }

  const firstIsHigher = strongestDifference > 0;
  const higher = firstIsHigher ? first : second;
  const lowerCurve = firstIsHigher ? second : first;

  const pending = [{ lower, upper, depth: 0 }];
  let visited = 0;

  while (pending.length) {
    if (++visited > 20000) {
      return {
        error: "Could not establish boundary ordering; simplify or split the region.",
      };
    }

    const interval = pending.pop();

    const highRange = integralCurveRange(
      higher, interval.lower, interval.upper, variable
    );

    const lowRange = integralCurveRange(
      lowerCurve, interval.lower, interval.upper, variable
    );

    if (!highRange || !lowRange) {
      return { error: "Boundary calculations exceed the numeric range." };
    }

    // All values in this interval have the required ordering.
    if (highRange.min - lowRange.max >= -tolerance) {
      continue;
    }

    const midpoint =
      interval.lower + (interval.upper - interval.lower) / 2;

    for (const t of [interval.lower, midpoint, interval.upper]) {
      const difference =
        evaluateIntegralCurve(higher, t, variable) -
        evaluateIntegralCurve(lowerCurve, t, variable);

      if (!Number.isFinite(difference)) {
        return { error: "Invalid boundary value within the region." };
      }

      if (difference < -tolerance) {
        return {
          error: "Boundary curves cross inside a region; split at their intersections.",
        };
      }
    }

    if (
      interval.depth >= 40 ||
      midpoint === interval.lower ||
      midpoint === interval.upper
    ) {
      return {
        error: "Could not establish boundary ordering; simplify or split the region.",
      };
    }

    pending.push(
      {
        lower: midpoint,
        upper: interval.upper,
        depth: interval.depth + 1,
      },
      {
        lower: interval.lower,
        upper: midpoint,
        depth: interval.depth + 1,
      }
    );
  }

  return { firstIsHigher };
}

export function parseIntegralRegion(visual) {
  const { figure, elements, relationships } = visual || {};

  if (
    figure?.type !== "graph" ||
    figure?.subtype !== "integral_region" ||
    !["find_area", "identify_integral", "find_limits"].includes(
      figure.feature
    )
  ) {
    return invalid("Unsupported integral-region construction.");
  }

  if (!["x", "y"].includes(figure.integration_variable)) {
    return invalid("Integration variable must be x or y.");
  }

  const bounds = figure.bounds;

  if (
    !bounds ||
    !["x_min", "x_max", "y_min", "y_max"].every(
      (key) => Number.isFinite(bounds[key])
    ) ||
    bounds.x_min >= bounds.x_max ||
    bounds.y_min >= bounds.y_max ||
    !Number.isFinite(bounds.x_max - bounds.x_min) ||
    !Number.isFinite(bounds.y_max - bounds.y_min)
  ) {
    return invalid("Graph bounds need finite positive ranges.");
  }

  if (
    bounds.x_min > 0 ||
    bounds.x_max < 0 ||
    bounds.y_min > 0 ||
    bounds.y_max < 0
  ) {
    return invalid("Graph bounds must include the origin.");
  }

  if (
    figure.show_grid !== undefined &&
    typeof figure.show_grid !== "boolean"
  ) {
    return invalid("show_grid must be a boolean.");
  }

    const tickSteps = {};

  for (const [axis, min, max] of [
    ["x", bounds.x_min, bounds.x_max],
    ["y", bounds.y_min, bounds.y_max],
  ]) {
    const stepKey = `${axis}_tick_step`;
    const piKey = `${axis}_tick_pi`;

    const hasStep = figure[stepKey] !== undefined;
    const hasPi = figure[piKey] !== undefined;

    if (hasStep === hasPi) {
      return invalid(
        `Specify exactly one of ${stepKey} or ${piKey}.`
      );
    }

    const supplied = hasPi ? figure[piKey] : figure[stepKey];

    if (!Number.isFinite(supplied) || supplied <= 0) {
      return invalid("Axis tick spacing must be positive and finite.");
    }

    const step = hasPi ? supplied * Math.PI : supplied;

    if (!Number.isFinite(step) || step <= 0) {
      return invalid("Axis tick spacing exceeds the numeric range.");
    }

    const first = Math.ceil(min / step);
    const last = Math.floor(max / step);

    if (
      !Number.isSafeInteger(first) ||
      !Number.isSafeInteger(last) ||
      last - first + 1 > 200
    ) {
      return invalid("Tick spacing produces too many axis ticks.");
    }

    tickSteps[stepKey] = step;
  }

  if (!Array.isArray(elements) || !Array.isArray(relationships)) {
    return invalid("Elements and relationships must be arrays.");
  }

  const byId = new Map();
  const axes = [];
  const curves = [];
  const regionElements = [];

  for (const element of elements) {
    if (
      !element ||
      typeof element.id !== "string" ||
      !element.id.trim() ||
      byId.has(element.id) ||
      !["axis", "curve", "region"].includes(element.type) ||
      (
        element.label !== undefined &&
        typeof element.label !== "string"
      )
    ) {
      return invalid("Invalid or duplicate integral-region element.");
    }

    const normalized = {
      ...element,
      label: element.label?.trim() || "",
    };

    if (element.type === "axis") {
      if (
        !["horizontal", "vertical"].includes(element.orientation) ||
        !normalized.label
      ) {
        return invalid("Axes need an orientation and visible label.");
      }

      axes.push(normalized);
    }

    if (element.type === "curve") {
      if (element.function === "polynomial") {
        if (
          !Array.isArray(element.coefficients) ||
          element.coefficients.length < 1 ||
          element.coefficients.length > 5 ||
          element.coefficients.some(
            (value) => !Number.isFinite(value)
          )
        ) {
          return invalid(
            "Polynomial curves need one to five finite coefficients."
          );
        }

        normalized.coefficients = [...element.coefficients];
        } 
        
        else if (element.function === "piecewise_polynomial") {
        if (
          !Array.isArray(element.pieces) ||
          element.pieces.length < 2
        ) {
          return invalid(
            "A piecewise polynomial needs at least two pieces."
          );
        }

        const pieces = [];

        for (const piece of element.pieces) {
          if (
            !piece ||
            !Number.isFinite(piece.lower) ||
            !Number.isFinite(piece.upper) ||
            piece.lower >= piece.upper ||
            !Number.isFinite(piece.upper - piece.lower) ||
            !Array.isArray(piece.coefficients) ||
            piece.coefficients.length < 1 ||
            piece.coefficients.length > 5 ||
            piece.coefficients.some(
              (value) => !Number.isFinite(value)
            )
          ) {
            return invalid(
              "Each piece needs finite increasing limits and one to five finite coefficients."
            );
          }

          const range = rangeOnInterval(
            piece.coefficients,
            piece.lower,
            piece.upper
          );

          if (!range) {
            return invalid(
              "Piecewise polynomial values exceed the numeric range."
            );
          }

          const previous = pieces[pieces.length - 1];

          if (previous) {
            if (previous.upper !== piece.lower) {
              return invalid(
                "Polynomial pieces must be ordered and adjacent without gaps or overlaps."
              );
            }

            const previousValue = evaluatePolynomial(
              previous.coefficients,
              piece.lower
            );

            const currentValue = evaluatePolynomial(
              piece.coefficients,
              piece.lower
            );

            const continuityTolerance =
              1e-9 *
              Math.max(
                1,
                Math.abs(previousValue),
                Math.abs(currentValue)
              );

            if (
              Math.abs(previousValue - currentValue) >
              continuityTolerance
            ) {
              return invalid(
                "Polynomial pieces must meet continuously at shared endpoints."
              );
            }
          }

          pieces.push({
            lower: piece.lower,
            upper: piece.upper,
            coefficients: [...piece.coefficients],
          });
        }

        if (
          !Number.isFinite(
            pieces[pieces.length - 1].upper - pieces[0].lower
          )
        ) {
          return invalid("Piecewise curve domain exceeds the numeric range.");
        }

        normalized.pieces = pieces;
        } 
        
        else if (
        element.function === "sin" ||
        element.function === "cos"
      ) {
        if (
          !["a", "b", "h", "k"].every(
            (key) => Number.isFinite(element[key])
          ) ||
          element.a === 0 ||
          element.b === 0 ||
          !Number.isFinite(element.k - Math.abs(element.a)) ||
          !Number.isFinite(element.k + Math.abs(element.a))
        ) {
          return invalid(
            "Trigonometric curves need finite a, b, h, k with nonzero a and b."
          );
        }

        const inputMin =
          figure.integration_variable === "x"
            ? bounds.x_min
            : bounds.y_min;

        const inputMax =
          figure.integration_variable === "x"
            ? bounds.x_max
            : bounds.y_max;

        const phase1 = element.b * (inputMin - element.h);
        const phase2 = element.b * (inputMax - element.h);
        const phaseSpan = Math.abs(phase2 - phase1);

        if (
          !Number.isFinite(phase1) ||
          !Number.isFinite(phase2) ||
          !Number.isFinite(phaseSpan) ||
          Math.max(Math.abs(phase1), Math.abs(phase2)) > 1e6
        ) {
          return invalid(
            "Trigonometric arguments exceed the supported numeric range."
          );
        }

        // Avoid densely oscillating diagrams that become unreadable.
        if (phaseSpan > 16 * Math.PI + 1e-9) {
          return invalid(
            "Show at most eight trigonometric cycles within the graph bounds."
          );
        } 
    }
      else if (element.function === "ellipse_branch") {
        if (
          !["h", "k", "rx", "ry"].every(
            (key) => Number.isFinite(element[key])
          ) ||
          element.rx <= 0 ||
          element.ry <= 0 ||
          !["positive", "negative"].includes(element.branch)
        ) {
          return invalid(
            "Ellipse branches need finite centres, positive radii and a valid branch."
          );
        }
        

        // Reject unrepresentable extrema, including radii too small
        // to distinguish from the centre at this numeric scale.
        if (
          ![
            element.h - element.rx,
            element.h + element.rx,
            element.k - element.ry,
            element.k + element.ry,
          ].every(Number.isFinite) ||
          !(element.h - element.rx < element.h) ||
          !(element.h + element.rx > element.h) ||
          !(element.k - element.ry < element.k) ||
          !(element.k + element.ry > element.k)
        ) {
          return invalid("Ellipse dimensions exceed the usable numeric range.");
        }
      } else {
        return invalid("Unsupported integral boundary function.");
      }

      curves.push(normalized);
    }

    if (element.type === "region") {
      if (
        !Number.isFinite(element.lower) ||
        !Number.isFinite(element.upper) ||
        element.lower >= element.upper ||
        !Number.isFinite(element.upper - element.lower)
      ) {
        return invalid("Regions need finite increasing limits.");
      }

      regionElements.push(normalized);
    }

    byId.set(element.id, normalized);
  }

  if (
    axes.length !== 2 ||
    axes.filter((axis) => axis.orientation === "horizontal").length !== 1 ||
    axes.filter((axis) => axis.orientation === "vertical").length !== 1
  ) {
    return invalid("Exactly one horizontal and one vertical axis are required.");
  }

  if (curves.length < 2 || regionElements.length === 0) {
    return invalid("At least two curves and one shaded region are required.");
  }

  const boundaryLinks = new Map();
  const plottedLinks = new Set();

  for (const relationship of relationships) {
    if (
      !relationship ||
      !["bounded_by", "plotted_on"].includes(relationship.type) ||
      !Array.isArray(relationship.elements) ||
      relationship.elements.length === 0 ||
      new Set(relationship.elements).size !== relationship.elements.length ||
      !byId.has(relationship.target) ||
      relationship.elements.some(
        (id) => byId.get(id)?.type !== "curve"
      )
    ) {
      return invalid("Invalid integral-region relationship.");
    }

    const target = byId.get(relationship.target);

    if (relationship.type === "bounded_by") {
      if (
        target.type !== "region" ||
        relationship.elements.length !== 2 ||
        boundaryLinks.has(target.id)
      ) {
        return invalid("Each region needs one link to exactly two curves.");
      }

      boundaryLinks.set(target.id, [...relationship.elements]);
    } else {
      if (target.type !== "axis") {
        return invalid("plotted_on must target an axis.");
      }

      for (const curveId of relationship.elements) {
        const key = JSON.stringify([curveId, target.id]);

        if (plottedLinks.has(key)) {
          return invalid("Duplicate curve-to-axis relationship.");
        }

        plottedLinks.add(key);
      }
    }
  }

  for (const curve of curves) {
    for (const axis of axes) {
      if (!plottedLinks.has(JSON.stringify([curve.id, axis.id]))) {
        return invalid("Every curve must be linked to both axes.");
      }
    }
  }

  const integrateX = figure.integration_variable === "x";

  const independentMin = integrateX ? bounds.x_min : bounds.y_min;
  const independentMax = integrateX ? bounds.x_max : bounds.y_max;
  const dependentMin = integrateX ? bounds.y_min : bounds.x_min;
  const dependentMax = integrateX ? bounds.y_max : bounds.x_max;

  const tolerance = Math.max(
    (dependentMax - dependentMin) * 1e-9,
    Number.EPSILON *
      Math.max(1, Math.abs(dependentMin), Math.abs(dependentMax)) *
      32
  );

  const regions = [];
  const usedCurves = new Set();

  for (const region of regionElements) {
    const curveIds = boundaryLinks.get(region.id);

    if (!curveIds) {
      return invalid("Every region needs a bounded_by relationship.");
    }

    if (
      region.lower < independentMin ||
      region.upper > independentMax
    ) {
      return invalid("Region limits extend outside the graph bounds.");
    }

        const boundaryCurves = [];

    for (const id of curveIds) {
      const curve = byId.get(id);

      if (curve.function !== "piecewise_polynomial") {
        boundaryCurves.push(curve);
        continue;
      }

      const piece = findPolynomialPiece(
        curve,
        region.lower,
        region.upper
      );

      if (!piece) {
        return invalid(
          "Split shaded regions at piece boundaries; each interval must fit within one polynomial piece."
        );
      }

      // Validate this region using its actual polynomial piece.
      // The original curve remains piecewise in the returned payload.
      boundaryCurves.push({
        id: curve.id,
        function: "polynomial",
        coefficients: piece.coefficients,
      });
    }

    const [first, second] = boundaryCurves;

    const variable = figure.integration_variable;

    for (const curve of [first, second]) {
      const domain = getIntegralCurveDomain(curve, variable);

      if (
        region.lower < domain.lower ||
        region.upper > domain.upper
      ) {
        return invalid(
          "Region limits extend outside a boundary curve's real domain."
        );
      }

      const range = integralCurveRange(
        curve,
        region.lower,
        region.upper,
        variable
      );

      if (
        !range ||
        range.min < dependentMin - tolerance ||
        range.max > dependentMax + tolerance
      ) {
        return invalid("Bounds must contain the complete shaded region.");
      }
    }

    let firstIsHigher;

    if (
      first.function === "polynomial" &&
      second.function === "polynomial"
    ) {
      // Preserve the existing polynomial validation.
      const difference = Array.from(
        {
          length: Math.max(
            first.coefficients.length,
            second.coefficients.length
          ),
        },
        (_, index) =>
          (first.coefficients[index] || 0) -
          (second.coefficients[index] || 0)
      );

      const differenceRange = rangeOnInterval(
        difference,
        region.lower,
        region.upper
      );

      if (!differenceRange) {
        return invalid("Boundary calculations exceed the numeric range.");
      }

      if (
        differenceRange.min < -tolerance &&
        differenceRange.max > tolerance
      ) {
        return invalid(
          "Boundary curves cross inside a region; split at their intersections."
        );
      }

      if (
        Math.max(
          Math.abs(differenceRange.min),
          Math.abs(differenceRange.max)
        ) <= tolerance
      ) {
        return invalid("A shaded region must have positive area.");
      }

      firstIsHigher = differenceRange.max > tolerance;
    } else {
      const ordering = establishCurveOrder(
        first,
        second,
        region.lower,
        region.upper,
        variable,
        tolerance
      );

      if (ordering.error) {
        return invalid(ordering.error);
      }

      firstIsHigher = ordering.firstIsHigher;
    }

    regions.push({
      ...region,
      curveIds,
      lowerCurveId: firstIsHigher ? second.id : first.id,
      upperCurveId: firstIsHigher ? first.id : second.id,
    });

    curveIds.forEach((id) => usedCurves.add(id));
  }

  // This phase supports components split along the integration variable.
  // Adjacent intervals may share an endpoint, but cannot overlap.
  const orderedRegions = [...regions].sort(
    (a, b) => a.lower - b.lower
  );

  for (let index = 1; index < orderedRegions.length; index++) {
    if (orderedRegions[index].lower < orderedRegions[index - 1].upper) {
      return invalid(
        "Region intervals must have disjoint interiors in this phase."
      );
    }
  }

  if (usedCurves.size !== curves.length) {
    return invalid("Every supplied curve must bound a shaded region.");
  }

  return {
    valid: true,
    error: null,
    figure: {
      ...figure,
      ...tickSteps,
      bounds: { ...bounds },
      show_grid: figure.show_grid ?? false,
    },
    axes,
    curves,
    regions: orderedRegions,
    requiresEqualScale: curves.some(
      (curve) => curve.function === "ellipse_branch"
    ),
  };
}