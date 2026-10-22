// graph/integralRegionPositions.js

import { getSvgDimensions } from "../geometry/geometryHelpers";
import {
  evaluateIntegralCurve,
  getIntegralCurveDomain,
} from "./integralRegionParser";

function overlaps(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function clipSegment(a, b, bounds) {
  let lower = 0;
  let upper = 1;

  for (const [start, end, min, max] of [
    [a.x, b.x, bounds.x_min, bounds.x_max],
    [a.y, b.y, bounds.y_min, bounds.y_max],
  ]) {
    const direction = end - start;

    if (!Number.isFinite(direction)) return null;

    if (direction === 0) {
      if (start < min || start > max) return null;
      continue;
    }

    const t1 = (min - start) / direction;
    const t2 = (max - start) / direction;

    lower = Math.max(lower, Math.min(t1, t2));
    upper = Math.min(upper, Math.max(t1, t2));

    if (lower > upper) return null;
  }

  const interpolate = (t) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });

  return {
    start: interpolate(lower),
    end: interpolate(upper),
  };
}

function pathFromPoints(points, close = false) {
  if (!points.length) return "";

  return (
    points
      .map((point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
      )
      .join(" ") + (close ? " Z" : "")
  );
}

function formatPiMultiple(multiplier) {
  if (Math.abs(multiplier) < 1e-10) {
    return { text: "0", math: "$0$" };
  }

  const sign = multiplier < 0 ? "-" : "";
  const absolute = Math.abs(multiplier);

  for (let denominator = 1; denominator <= 100; denominator++) {
    const numerator = Math.round(absolute * denominator);

    if (
      numerator > 0 &&
      Math.abs(absolute - numerator / denominator) <= 1e-9
    ) {
      const coefficient = numerator === 1 ? "" : String(numerator);

      return {
        // Plain text remains useful for spacing estimates.
        text:
          denominator === 1
            ? `${sign}${coefficient}π`
            : `${sign}${coefficient}π/${denominator}`,
        math:
          denominator === 1
            ? `$${sign}${coefficient}\\pi$`
            : `$${sign}\\frac{${coefficient}\\pi}{${denominator}}$`,
      };
    }
  }

  const coefficient = Number(absolute.toPrecision(10));

  return {
    text: `${sign}${coefficient}π`,
    math: `$${sign}${coefficient}\\pi$`,
  };
}

function makeTicks(
  min,
  max,
  step,
  toPixel,
  horizontal,
  piStep = null
) {
  const first = Math.ceil(min / step - 1e-10);
  const last = Math.floor(max / step + 1e-10);
  const ticks = [];

  for (let index = first; index <= last; index++) {
    const raw = index * step;

    const value =
      Math.abs(raw) < step * 1e-10
        ? 0
        : Number(raw.toPrecision(12));

    const piLabel =
      piStep !== null
        ? formatPiMultiple(index * piStep)
        : null;

    ticks.push({
      value,
      label: piLabel ? piLabel.text : String(value),
      mathLabel: piLabel?.math ?? null,
      ...toPixel(
        horizontal ? value : 0,
        horizontal ? 0 : value
      ),
    });
  }

  return ticks;
}

export function calculateIntegralRegionPositions({
  parsed,
  isMobile = false,
}) {
  if (!parsed?.valid) return null;

    const baseSvg = getSvgDimensions(isMobile);

  // Larger equation labels, axis labels and tick numbers.
  const svg = {
    ...baseSvg,
    fontSize: baseSvg.fontSize * 1.15,
  };
  const {
    width,
    height,
    paddingX,
    paddingY,
    fontSize,
    strokeWidth,
  } = svg;

  const { figure, curves, regions, axes } = parsed;
  const { bounds } = figure;
  const integrateX = figure.integration_variable === "x";

  const marginX = Math.max(paddingX, fontSize * 3.5);
  const marginY = Math.max(paddingY, fontSize * 3);

  const plot = {
    left: marginX,
    right: width - marginX,
    top: marginY,
    bottom: height - marginY,
  };

  if (
    plot.left >= plot.right ||
    plot.top >= plot.bottom
  ) {
    return null;
  }

  // Function graphs may use different scales on the two axes.
  // Tick values, curves and shading all use these same transforms.
    const rangeX = bounds.x_max - bounds.x_min;
  const rangeY = bounds.y_max - bounds.y_min;

  const availableWidth = plot.right - plot.left;
  const availableHeight = plot.bottom - plot.top;

  let scaleX = availableWidth / rangeX;
  let scaleY = availableHeight / rangeY;

  if (parsed.requiresEqualScale) {
    const scale = Math.min(scaleX, scaleY);

    // Centre the plotting rectangle while preserving equal unit lengths.
    const usedWidth = rangeX * scale;
    const usedHeight = rangeY * scale;

    plot.left += (availableWidth - usedWidth) / 2;
    plot.right = plot.left + usedWidth;

    plot.top += (availableHeight - usedHeight) / 2;
    plot.bottom = plot.top + usedHeight;

    scaleX = scale;
    scaleY = scale;
  }

  if (
    !Number.isFinite(scaleX) ||
    !Number.isFinite(scaleY) ||
    scaleX <= 0 ||
    scaleY <= 0
  ) {
    return null;
  }

  const toPixel = (x, y) => ({
    x: plot.left + (x - bounds.x_min) * scaleX,
    y: plot.bottom - (y - bounds.y_min) * scaleY,
  });

  const toRealPoint = (t, value) =>
    integrateX
      ? { x: t, y: value }
      : { x: value, y: t };

  const curveById = new Map(
    curves.map((curve) => [curve.id, curve])
  );

    // Matching branches belong to one circle/ellipse.
  const ellipseColors = new Map();

  const curveColorIndices = curves.map((curve, index) => {
    if (curve.function !== "ellipse_branch") return index;

    const key = JSON.stringify([
      curve.h,
      curve.k,
      curve.rx,
      curve.ry,
    ]);

    if (!ellipseColors.has(key)) {
      ellipseColors.set(key, index);
    }

    return ellipseColors.get(key);
  });

  const independentMin =
    integrateX ? bounds.x_min : bounds.y_min;

  const independentMax =
    integrateX ? bounds.x_max : bounds.y_max;

  const independentPixels =
    integrateX
      ? plot.right - plot.left
      : plot.bottom - plot.top;

    const visibleCycles = Math.max(
    0,
    ...curves
      .filter((curve) =>
        ["sin", "cos"].includes(curve.function)
      )
      .map(
        (curve) =>
          Math.abs(curve.b) *
          (independentMax - independentMin) /
          (2 * Math.PI)
      )
  );

  const sampleCount = Math.min(
    1600,
    Math.max(
      240,
      Math.ceil(independentPixels * 2),
      Math.ceil(visibleCycles * 96)
    )
  );

  // Include region endpoints exactly in curve sampling.
  const sampleValues = [
    ...Array.from(
      { length: sampleCount + 1 },
      (_, index) =>
        independentMin +
        (independentMax - independentMin) *
          (index / sampleCount)
    ),
    ...regions.flatMap((region) => [
      region.lower,
      region.upper,
    ]),
  ];

  const sortedSamples = [...new Set(sampleValues)].sort(
    (a, b) => a - b
  );

  const curvePaths = [];
  const curveSamples = [];
  const labelAnchors = new Map();

    curves.forEach((curve, curveIndex) => {
    const isAxisBoundary =
      curve.function === "polynomial" &&
      curve.coefficients.every(
        (coefficient) => coefficient === 0
      );

    if (isAxisBoundary) return;

    const domain = getIntegralCurveDomain(
      curve,
      figure.integration_variable
    );

    const visibleLower = Math.max(independentMin, domain.lower);
    const visibleUpper = Math.min(independentMax, domain.upper);

    if (visibleLower >= visibleUpper) return;

    let curveSampleValues;

    if (curve.function === "ellipse_branch") {
      const center = integrateX ? curve.h : curve.k;
      const radius = integrateX ? curve.rx : curve.ry;

      // Angular sampling gives smooth ellipse ends near vertical
      // or horizontal tangents, where uniform coordinate steps struggle.
      const clampUnit = (value) =>
        Math.max(-1, Math.min(1, value));

      const angleStart = Math.acos(
        clampUnit((visibleLower - center) / radius)
      );

      const angleEnd = Math.acos(
        clampUnit((visibleUpper - center) / radius)
      );

      curveSampleValues = Array.from(
        { length: sampleCount + 1 },
        (_, index) => {
          const angle =
            angleStart +
            (angleEnd - angleStart) * (index / sampleCount);

          return Math.max(
            visibleLower,
            Math.min(visibleUpper, center + radius * Math.cos(angle))
          );
        }
      );
    } else {
      curveSampleValues = sortedSamples.filter(
        (t) => t >= visibleLower && t <= visibleUpper
      );
    }

    // Include domain endpoints and shading boundaries exactly.
        // Include corners, domain endpoints and shading boundaries exactly.
    const pieceEndpoints =
      curve.function === "piecewise_polynomial"
        ? curve.pieces
            .flatMap((piece) => [piece.lower, piece.upper])
            .filter(
              (t) => t >= visibleLower && t <= visibleUpper
            )
        : [];

    curveSampleValues = [
      ...new Set([
        visibleLower,
        visibleUpper,
        ...curveSampleValues,
        ...pieceEndpoints,
        ...regions
          .filter((region) => region.curveIds.includes(curve.id))
          .flatMap((region) => [region.lower, region.upper])
          .filter((t) => t >= visibleLower && t <= visibleUpper),
      ]),
    ].sort((a, b) => a - b);

    const runs = [];
    let run = [];

    const finishRun = () => {
      if (run.length >= 2) runs.push(run);
      run = [];
    };

        for (let index = 1; index < curveSampleValues.length; index++) {
      const t1 = curveSampleValues[index - 1];
      const t2 = curveSampleValues[index];

      const value1 = evaluateIntegralCurve(
        curve,
        t1,
        figure.integration_variable
      );

      const value2 = evaluateIntegralCurve(
        curve,
        t2,
        figure.integration_variable
      );

      if (
        !Number.isFinite(value1) ||
        !Number.isFinite(value2)
      ) {
        finishRun();
        continue;
      }

      const clipped = clipSegment(
        toRealPoint(t1, value1),
        toRealPoint(t2, value2),
        bounds
      );

      if (!clipped) {
        finishRun();
        continue;
      }

      const start = toPixel(clipped.start.x, clipped.start.y);
      const end = toPixel(clipped.end.x, clipped.end.y);

      if (Math.hypot(end.x - start.x, end.y - start.y) < 1e-8) {
        continue;
      }

      const previous = run[run.length - 1];

      if (
        previous &&
        Math.hypot(previous.x - start.x, previous.y - start.y) > 0.1
      ) {
        finishRun();
      }

      if (!run.length) run.push(start);
      run.push(end);
    }

    finishRun();

    const visiblePoints = runs.flat();
    curveSamples.push(...visiblePoints);

    // Spread possible label anchors across each visible curve.
    const anchors = [];

    for (const points of runs) {
      for (const fraction of [0.2, 0.4, 0.6, 0.8]) {
        anchors.push(
          points[Math.round((points.length - 1) * fraction)]
        );
      }
    }

    labelAnchors.set(curve.id, anchors);

    runs.forEach((points, index) => {
      curvePaths.push({
        id: `${curve.id}-run-${index}`,
        curveId: curve.id,
        colorIndex: curveColorIndices[curveIndex],
        d: pathFromPoints(points),
      });
    });
  });

  const shadedRegions = [];
  const boundaryLines = [];
  const boundaryKeys = new Set();

  for (const region of regions) {
    const lowerCurve = curveById.get(region.lowerCurveId);
    const upperCurve = curveById.get(region.upperCurveId);

    const count = Math.max(
      80,
      Math.ceil(
        sampleCount *
          (region.upper - region.lower) /
          (independentMax - independentMin)
      )
    );

        const lowerPoints = [];
    const upperPoints = [];

    const hasEllipseBoundary =
      lowerCurve.function === "ellipse_branch" ||
      upperCurve.function === "ellipse_branch";

    for (let index = 0; index <= count; index++) {
      const fraction = index / count;

      // Cluster samples near both limits for smooth curved endpoints.
      const progress = hasEllipseBoundary
        ? (1 - Math.cos(Math.PI * fraction)) / 2
        : fraction;

      const t =
        index === 0
          ? region.lower
          : index === count
            ? region.upper
            : region.lower +
              (region.upper - region.lower) * progress;

      const lowerValue = evaluateIntegralCurve(
        lowerCurve,
        t,
        figure.integration_variable
      );

      const upperValue = evaluateIntegralCurve(
        upperCurve,
        t,
        figure.integration_variable
      );

      if (
        !Number.isFinite(lowerValue) ||
        !Number.isFinite(upperValue)
      ) {
        return null;
      }

      const lower = toRealPoint(t, lowerValue);
      const upper = toRealPoint(t, upperValue);

      lowerPoints.push(toPixel(lower.x, lower.y));
      upperPoints.push(toPixel(upper.x, upper.y));
    }

    shadedRegions.push({
      id: region.id,
      d: pathFromPoints(
        [...lowerPoints, ...upperPoints.slice().reverse()],
        true
      ),
    });

    // Only the actual finite edges of the shaded region.
    // No extra construction lines or solved measurements.
    for (const index of [0, count]) {
      const start = lowerPoints[index];
      const end = upperPoints[index];

      if (
        Math.hypot(end.x - start.x, end.y - start.y) <= strokeWidth
      ) {
        continue;
      }

      const key = [
        start.x,
        start.y,
        end.x,
        end.y,
      ].map((value) => value.toFixed(5)).join(":");

      if (boundaryKeys.has(key)) continue;
      boundaryKeys.add(key);

      boundaryLines.push({
        id: `${region.id}-boundary-${index}`,
        start,
        end,
      });
    }
  }

  const origin = toPixel(0, 0);
  const labels = [];
  const occupied = [];

  const axisBoxes = [
    {
      x: plot.left,
      y: origin.y - strokeWidth,
      width: plot.right - plot.left,
      height: fontSize * 1.8,
    },
    {
      x: origin.x - fontSize * 2.2,
      y: plot.top,
      width: fontSize * 2.2 + strokeWidth,
      height: plot.bottom - plot.top,
    },
  ];

  curves.forEach((curve, colorIndex) => {
    if (!curve.label) return;

    const anchors = labelAnchors.get(curve.id) || [];
    if (!anchors.length) return;

    const plain = curve.label
      .replace(/\\(?:text|mathrm)\{([^}]*)\}/g, "$1")
      .replace(/\\[a-zA-Z]+/g, "M")
      .replace(/[$^_{}]/g, "");

    const labelWidth = Math.min(
      width - 8,
      Math.max(fontSize * 3, plain.length * fontSize * 0.7 + 12)
    );

    const labelHeight = fontSize * 1.8;
    const candidates = [];

    // CHANGED: try nearby positions first, then progressively farther ones.
    for (const anchor of anchors) {
      for (const gapMultiplier of [0.45, 0.8, 1.2, 1.7]) {
        const gap = fontSize * gapMultiplier;

        for (const [sx, sy] of [
          [0, -1], [0, 1],
          [1, 0], [-1, 0],
          [1, -1], [-1, -1],
          [1, 1], [-1, 1],
        ]) {
          const x = anchor.x + sx * (labelWidth / 2 + gap);
          const y = anchor.y + sy * (labelHeight / 2 + gap);

          const box = {
            x: x - labelWidth / 2,
            y: y - labelHeight / 2,
            width: labelWidth,
            height: labelHeight,
          };

          if (
            box.x < 2 ||
            box.y < 2 ||
            box.x + box.width > width - 2 ||
            box.y + box.height > height - 2
          ) {
            continue;
          }

          const clearance = fontSize * 0.45;

          const paddedBox = {
            x: box.x - clearance,
            y: box.y - clearance,
            width: box.width + clearance * 2,
            height: box.height + clearance * 2,
          };

          const curveHits = curveSamples.filter((point) =>
            point.x >= paddedBox.x &&
            point.x <= paddedBox.x + paddedBox.width &&
            point.y >= paddedBox.y &&
            point.y <= paddedBox.y + paddedBox.height
          ).length;

          const labelHits = occupied.filter((other) =>
            overlaps(paddedBox, other)
          ).length;

          const axisHits = axisBoxes.filter((other) =>
            overlaps(paddedBox, other)
          ).length;

          candidates.push({
            x,
            y,
            box,
            align: sx > 0 ? "start" : sx < 0 ? "end" : "middle",
            labelHits,
            axisHits,
            curveHits,
            hasCollision: labelHits > 0 || axisHits > 0 || curveHits > 0,
            distance: Math.hypot(x - anchor.x, y - anchor.y),
          });
        }
      }
    }

    // CHANGED: any clear candidate wins over an overlapping candidate.
    // Among clear candidates, keep the label near its curve.
    candidates.sort(
      (a, b) =>
        Number(a.hasCollision) - Number(b.hasCollision) ||
        a.labelHits - b.labelHits ||
        a.axisHits - b.axisHits ||
        a.curveHits - b.curveHits ||
        a.distance - b.distance
    );

    const chosen = candidates[0];
    if (!chosen) return;

    occupied.push(chosen.box);

    labels.push({
      id: `label-${curve.id}`,
      text: curve.label,
      colorIndex: curveColorIndices[colorIndex],
      x: chosen.x,
      y: chosen.y,
      width: labelWidth,
      height: labelHeight,
      align: chosen.align,
      avoidCurve: true, // ADDED: only equation labels need this adjustment
    });
  });

  return {
    ...svg,
    figure,
    plot,
    origin,
    scaleX,
    scaleY,
    toPixel,
    curvePaths,
    shadedRegions,
    boundaryLines,
    labels,
    curveSamples, // ADDED
    xAxisLabel: axes.find(
      (axis) => axis.orientation === "horizontal"
    ).label,
    yAxisLabel: axes.find(
      (axis) => axis.orientation === "vertical"
    ).label,
    xTicks: makeTicks(
      bounds.x_min,
      bounds.x_max,
      figure.x_tick_step,
      toPixel,
      true,
      figure.x_tick_pi ?? null
    ),
    yTicks: makeTicks(
      bounds.y_min,
      bounds.y_max,
      figure.y_tick_step,
      toPixel,
      false,
      figure.y_tick_pi ?? null
    ),
  };
}