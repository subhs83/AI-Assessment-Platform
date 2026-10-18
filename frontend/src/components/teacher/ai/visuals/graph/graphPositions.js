import { getSvgDimensions } from "../geometry/geometryHelpers"; // reuse only the pure dimension utility

function niceTickIntervalForScale(scale, minPixelSpacing = 35) {
  const minRealSpacing = minPixelSpacing / scale;
  const magnitude = Math.pow(10, Math.floor(Math.log10(minRealSpacing)));
  const normalized = minRealSpacing / magnitude;
  let nice;
  if (normalized <= 1) nice = 1;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 5) nice = 5;
  else nice = 10;
  return nice * magnitude;
}

export function calculateNumberLinePositions({ elements, figure, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX } = getSvgDimensions(isMobile);

  const { min, max } = figure?.bounds || { min: -5, max: 5 };
  const availW = SVG_WIDTH - paddingX * 2;
  const scale = availW / (max - min);
  const tick = niceTickIntervalForScale(scale);

  const CENTER_Y = SVG_HEIGHT / 2;

  const toPixelX = (x) => paddingX + (x - min) * scale;

  const positions = {};
  (elements || []).forEach((el) => {
    if (el.type === "point" && Number.isFinite(el.x)) {
      positions[el.id] = { x: toPixelX(el.x), y: CENTER_Y, labelAnchor: "auto" };
    }
  });

  return { positions, toPixelX, centerY: CENTER_Y, min, max, tick, lineY: CENTER_Y };
}



export function calculateBarGraphPositions({ categories, figure, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const maxValue = Math.max(...categories.map((c) => c.value), 0);
  // Add ~15% headroom so the tallest bar doesn't touch the very top.
  const yMax = maxValue * 1.15;

  const chartLeft = paddingX + 30; // extra room for y-axis labels
  const chartRight = SVG_WIDTH - paddingX;
  const chartTop = paddingY + 10;
  const chartBottom = SVG_HEIGHT - paddingY - 20; // room for x-axis category labels

  const chartWidth = chartRight - chartLeft;
  const chartHeight = chartBottom - chartTop;

  const n = categories.length;
  const slotWidth = chartWidth / n;
  const barWidth = slotWidth * 0.6; // 60% bar, 40% gap between bars

  const tick = niceTickIntervalForScale(chartHeight / yMax, 30);

  const bars = categories.map((cat, i) => {
    const barHeight = (cat.value / yMax) * chartHeight;
    const x = chartLeft + i * slotWidth + (slotWidth - barWidth) / 2;
    const y = chartBottom - barHeight;
    return { ...cat, x, y, width: barWidth, height: barHeight };
  });

  return {
    bars,
    chartLeft,
    chartRight,
    chartTop,
    chartBottom,
    yMax,
    tick,
    title: figure?.title,
  };
}



export function calculateLineGraphPositions({ series, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const allValues = series.flatMap((s) => s.data.map((d) => d.value));
  const maxValue = Math.max(...allValues, 0);
  const minValue = Math.min(...allValues, 0);
  const yMax = maxValue * 1.15;
  const yMin = minValue < 0 ? minValue * 1.15 : 0;

  // Reserve a label margin on BOTH sides now — chartLeft/chartRight are
  // the actual axis boundary positions guide lines stop at; labels sit
  // just outside them, in this reserved space.
  const LABEL_MARGIN = isMobile ? 34 : 46;
  const chartLeft = paddingX + LABEL_MARGIN;
  const chartRight = SVG_WIDTH - paddingX - LABEL_MARGIN;
  const chartTop = paddingY + 10;
  const chartBottom = SVG_HEIGHT - paddingY-10;

  const chartWidth = chartRight - chartLeft;
  const chartHeight = chartBottom - chartTop;

  const categories = series[0]?.data.map((d) => d.label) || [];
  const n = categories.length;
  const slotWidth = n > 1 ? chartWidth / (n - 1) : chartWidth;

  const tick = niceTickIntervalForScale(chartHeight / (yMax - yMin), 30);
  const valueToY = (v) => chartBottom - ((v - yMin) / (yMax - yMin)) * chartHeight;

  const plottedSeries = series.map((s) => ({
    label: s.label,
    points: s.data.map((d, i) => ({
      x: chartLeft + i * slotWidth,
      y: valueToY(d.value),
      value: d.value,
      categoryLabel: d.label,
    })),
  }));

  return {
    plottedSeries,
    categories,
    chartLeft,
    chartRight,
    chartTop,
    chartBottom,
    yMax,
    yMin,
    tick,
    slotWidth,
  };
}

// --------------------------------------------------
// TRIGONOMETRIC FUNCTION GRAPHS
// --------------------------------------------------

function formatGraphNumber(value) {
  const cleaned = Math.abs(value) < 1e-10 ? 0 : value;
  return Number(cleaned.toPrecision(8)).toString();
}

function formatPiTick(multiplier) {
  if (Math.abs(multiplier) < 1e-10) return "$0$";

  const sign = multiplier < 0 ? "-" : "";
  const magnitude = Math.abs(multiplier);

  // Recognize common rational multiples of pi.
  for (let denominator = 1; denominator <= 64; denominator++) {
    const numerator = Math.round(magnitude * denominator);

    if (
      numerator > 0 &&
      Math.abs(magnitude - numerator / denominator) < 1e-8
    ) {
      const top = numerator === 1 ? "\\pi" : `${numerator}\\pi`;

      return denominator === 1
        ? `$${sign}${top}$`
        : `$${sign}\\frac{${top}}{${denominator}}$`;
    }
  }

  return `$${formatGraphNumber(multiplier)}\\pi$`;
}

function buildFunctionTicks(min, max, step, makeLabel) {
  // Tolerance accommodates decimal approximations of pi bounds.
  const tolerance = step * 1e-8;
  const first = Math.ceil((min - tolerance) / step);
  const last = Math.floor((max + tolerance) / step);

  if (
    !Number.isSafeInteger(first) ||
    !Number.isSafeInteger(last) ||
    last - first + 1 > 202
  ) {
    return [];
  }

  const ticks = [];

  for (let index = first; index <= last; index++) {
    const value = index === 0 ? 0 : index * step;

    ticks.push({
      index,
      value,
      label: makeLabel(value, index),
    });
  }

  return ticks;
}

// Clip a sampled line segment to the plot rectangle.
// Unlike clamping y-values, this does not create false
// horizontal lines along the top or bottom boundary.
function clipFunctionSegment(a, b, box) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  let startT = 0;
  let endT = 1;

  const tests = [
    [-dx, a.x - box.left],
    [dx, box.right - a.x],
    [-dy, a.y - box.top],
    [dy, box.bottom - a.y],
  ];

  for (const [p, q] of tests) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }

    const t = q / p;

    if (p < 0) startT = Math.max(startT, t);
    else endT = Math.min(endT, t);

    if (startT > endT) return null;
  }

  return {
    start: {
      x: a.x + startT * dx,
      y: a.y + startT * dy,
    },
    end: {
      x: a.x + endT * dx,
      y: a.y + endT * dy,
    },
  };
}

function sampledFunctionPath(points, box) {
  const commands = [];
  let previousEnd = null;

  for (let index = 1; index < points.length; index++) {
    const a = points[index - 1];
    const b = points[index];

    if (
      !a ||
      !b ||
      ![a.x, a.y, b.x, b.y].every(Number.isFinite)
    ) {
      previousEnd = null;
      continue;
    }

    const clipped = clipFunctionSegment(a, b, box);

    if (!clipped) {
      previousEnd = null;
      continue;
    }

    const { start, end } = clipped;

    if (
      !previousEnd ||
      Math.hypot(
        start.x - previousEnd.x,
        start.y - previousEnd.y
      ) > 1e-5
    ) {
      commands.push(`M ${start.x} ${start.y}`);
    }

    commands.push(`L ${end.x} ${end.y}`);
    previousEnd = end;
  }

  return commands.join(" ");
}

export function calculateFunctionGraphPositions({
  parsed,
  isMobile = false,
}) {
  if (!parsed?.valid) return null;

  const svg = getSvgDimensions(isMobile);
  const { width, height, paddingX, paddingY, fontSize } = svg;

  const {
    x_min: minX,
    x_max: maxX,
    y_min: minY,
    y_max: maxY,
  } = parsed.figure.bounds;

  const showLegend = parsed.curves.some((curve) => curve.label);

  // Reserve room for fractions, axis titles and any curve legend.
  const chartLeft = Math.max(paddingX, fontSize * 3.5);
  const chartRight = width - Math.max(paddingX, fontSize * 2);
  const chartTop =
    Math.max(paddingY, fontSize * 2) +
    (showLegend ? fontSize * 2 : 0);

  const chartBottom =
  height - Math.max(paddingY, fontSize * 4);
  const chartWidth = chartRight - chartLeft;
  const chartHeight = chartBottom - chartTop;

  if (
    ![chartWidth, chartHeight].every(Number.isFinite) ||
    chartWidth <= 0 ||
    chartHeight <= 0
  ) {
    return null;
  }

  // Function plots can use different x/y scales.
  // Unlike a unit circle, equal physical scales are not required.
  const scaleX = chartWidth / (maxX - minX);
  const scaleY = chartHeight / (maxY - minY);

  const toPixel = (x, y) => ({
    x: chartLeft + (x - minX) * scaleX,
    y: chartBottom - (y - minY) * scaleY,
  });

  const box = {
    left: chartLeft,
    right: chartRight,
    top: chartTop,
    bottom: chartBottom,
  };

    const xTicks = buildFunctionTicks(
    minX,
    maxX,
    parsed.xTickStep,
    (value, index) =>
      parsed.xTickUnit === "pi"
        ? formatPiTick(index * parsed.xTickAmount)
        : `$${formatGraphNumber(value)}$`
  ).map((tick) => ({
    ...tick,
    x: toPixel(tick.value, 0).x,
  }));

  const yTicks = buildFunctionTicks(
    minY,
    maxY,
    parsed.yTickStep,
    (value, index) =>
      parsed.yTickUnit === "pi"
        ? formatPiTick(index * parsed.yTickAmount)
        : `$${formatGraphNumber(value)}$`
  ).map((tick) => ({
    ...tick,
    y: toPixel(0, tick.value).y,
  }));

  const plottedCurves = [];
  const asymptotes = []; // Existing vertical tangent asymptotes.

  // Added for inverse-function graphs.
  const horizontalAsymptotes = [];
  const endpointMarkers = [];
  const continuationArrows = [];
  const colors = ["#2563eb", "#c026d3"];

  for (let curveIndex = 0; curveIndex < parsed.curves.length; curveIndex++) {
    const curve = parsed.curves[curveIndex];
    const { a, b, h, k } = curve;
        if (parsed.isInverse) {
      const color = colors[curveIndex % colors.length];
      const points = [];

      if (
        curve.function === "asin" ||
        curve.function === "acos"
      ) {
        // Sample by output angle rather than evenly spaced x.
        // This gives smoother curves near their vertical tangents.
        const isAsin = curve.function === "asin";

        const angleStart = isAsin ? -Math.PI / 2 : 0;
        const angleEnd = isAsin ? Math.PI / 2 : Math.PI;

        const samples = Math.min(
          4000,
          Math.max(
            300,
            Math.ceil(Math.max(chartWidth, chartHeight) * 2)
          )
        );

        for (let i = 0; i <= samples; i++) {
          const y =
            angleStart +
            (angleEnd - angleStart) * i / samples;

          const x = isAsin ? Math.sin(y) : Math.cos(y);

          points.push(toPixel(x, y));
        }

        // Mathematical endpoints, not viewport cutoffs.
        const endpoints = isAsin
          ? [
              { x: -1, y: -Math.PI / 2 },
              { x: 1, y: Math.PI / 2 },
            ]
          : [
              { x: -1, y: Math.PI },
              { x: 1, y: 0 },
            ];

        endpoints.forEach((point, index) => {
          endpointMarkers.push({
            id: `${curve.id}-endpoint-${index}`,
            curveId: curve.id,
            ...toPixel(point.x, point.y),
            color,
            closed: true,
          });
        });
      } else if (curve.function === "atan") {
        const samples = Math.min(
          4000,
          Math.max(300, Math.ceil(chartWidth * 2))
        );

        // Combine uniform x sampling with uniform angle sampling.
        // This preserves detail near zero and across the whole window.
        const xValues = [];
        const angleStart = Math.atan(minX);
        const angleEnd = Math.atan(maxX);

        for (let i = 0; i <= samples; i++) {
          const fraction = i / samples;

          xValues.push(minX + (maxX - minX) * fraction);

          const angle =
            angleStart + (angleEnd - angleStart) * fraction;

          xValues.push(
            Math.max(minX, Math.min(maxX, Math.tan(angle)))
          );
        }

        xValues.push(minX, 0, maxX);
        xValues.sort((first, second) => first - second);

        let previousX = null;

        for (const x of xValues) {
          if (x === previousX) continue;
          previousX = x;

          points.push(toPixel(x, Math.atan(x)));
        }

        for (const [index, y] of [
          -Math.PI / 2,
          Math.PI / 2,
        ].entries()) {
          horizontalAsymptotes.push({
            id: `${curve.id}-horizontal-${index}`,
            curveId: curve.id,
            value: y,
            label: formatPiTick(y / Math.PI),
            y: toPixel(0, y).y,
          });
        }

        // Arrow tips sit at the viewport boundaries.
        // They indicate that the curve continues beyond the window.
        for (const [side, x, outwardSign] of [
          ["left", minX, -1],
          ["right", maxX, 1],
        ]) {
          const tip = toPixel(x, Math.atan(x));

          // dy/dx = 1 / (1 + x²), converted to SVG direction.
          const slope = 1 / (1 + x * x);
          const dx = scaleX * outwardSign;
          const dy = -scaleY * slope * outwardSign;
          const length = Math.hypot(dx, dy);

          continuationArrows.push({
            id: `${curve.id}-continuation-${side}`,
            curveId: curve.id,
            tip,
            direction: {
              x: dx / length,
              y: dy / length,
            },
            color,
          });
        }
      } else {
        return null;
      }

      const path = sampledFunctionPath(points, box);

      if (!path) return null;

        plottedCurves.push({
        id: curve.id,
        label: curve.label,
        function: curve.function,
        color,
        paths: [path],
      });

      // Skip the direct-function period and tangent-branch code.
      continue;
    }

    const period =
      (curve.function === "tan" ? Math.PI : 2 * Math.PI) / b;

    const visiblePeriods = (maxX - minX) / period;

    // Avoid plotting an unreadably dense or excessively large curve.
    if (
      !Number.isFinite(visiblePeriods) ||
      visiblePeriods > 40
    ) {
      return null;
    }

    const paths = [];

    if (curve.function === "tan") {
      const phaseMin = b * (minX - h);
      const phaseMax = b * (maxX - h);

      // Branch n occupies:
      // -pi/2 + n*pi < b*(x-h) < pi/2 + n*pi.
      const firstBranch = Math.floor(
        (phaseMin + Math.PI / 2) / Math.PI
      );
      const lastBranch = Math.floor(
        (phaseMax + Math.PI / 2) / Math.PI
      );

      if (
        !Number.isSafeInteger(firstBranch) ||
        !Number.isSafeInteger(lastBranch) ||
        lastBranch - firstBranch > 42
      ) {
        return null;
      }

      // Solve y-window intersections analytically. This avoids
      // sampling at poles or evaluating enormous tangent values.
      const phaseAtMinY = Math.atan((minY - k) / a);
      const phaseAtMaxY = Math.atan((maxY - k) / a);

      const lowPhase = Math.min(phaseAtMinY, phaseAtMaxY);
      const highPhase = Math.max(phaseAtMinY, phaseAtMaxY);

      for (let n = firstBranch; n <= lastBranch; n++) {
        const startX = Math.max(
          minX,
          h + (lowPhase + n * Math.PI) / b
        );

        const endX = Math.min(
          maxX,
          h + (highPhase + n * Math.PI) / b
        );

        if (endX > startX) {
          const samples = Math.min(
            1200,
            Math.max(80, Math.ceil((endX - startX) * scaleX * 2))
          );

          const points = [];

          for (let i = 0; i <= samples; i++) {
            const x = startX + (endX - startX) * i / samples;

            // Use the local branch phase for numerical stability.
            const phase = b * (x - h) - n * Math.PI;
            const y = a * Math.tan(phase) + k;

            points.push(toPixel(x, y));
          }

          const path = sampledFunctionPath(points, box);
          if (path) paths.push(path);
        }

        const poleX = h + (Math.PI / 2 + n * Math.PI) / b;

        if (poleX > minX && poleX < maxX) {
          asymptotes.push({
            id: `${curve.id}-pole-${n}`,
            curveId: curve.id,
            value: poleX,
            x: toPixel(poleX, 0).x,
          });
        }
      }
    } else {
      const evaluate =
        curve.function === "sin" ? Math.sin : Math.cos;

      const samples = Math.min(
        8000,
        Math.max(
          240,
          Math.ceil(chartWidth * 2),
          Math.ceil(visiblePeriods * 160)
        )
      );

      const points = [];

      for (let i = 0; i <= samples; i++) {
        const x = minX + (maxX - minX) * i / samples;
        const y = a * evaluate(b * (x - h)) + k;

        points.push(Number.isFinite(y) ? toPixel(x, y) : null);
      }

      const path = sampledFunctionPath(points, box);
      if (path) paths.push(path);
    }

    if (paths.length === 0) {
      // Avoid silently displaying a blank or missing curve.
      return null;
    }

    plottedCurves.push({
      id: curve.id,
      label: curve.label,
      color: colors[curveIndex % colors.length],
      paths,
    });
  }

  return {
    ...svg,
    figure: parsed.figure,
    axes: parsed.axes,

    chartLeft,
    chartRight,
    chartTop,
    chartBottom,
    chartWidth,
    chartHeight,

    minX,
    maxX,
    minY,
    maxY,
    scaleX,
    scaleY,
    toPixel,
    origin: toPixel(0, 0),

    xTicks,
    yTicks,
    plottedCurves,
    asymptotes,
    horizontalAsymptotes,
    endpointMarkers,
    continuationArrows,
    isInverse: parsed.isInverse,
    showLegend,
  };
}