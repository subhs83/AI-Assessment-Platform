import { getSvgDimensions } from "../geometry/geometryHelpers";

// Perpendicular projection onto an infinite mirror line.
function projectOntoMirror(point, mirror) {
  const dx = mirror.b.x - mirror.a.x;
  const dy = mirror.b.y - mirror.a.y;
  const length = Math.hypot(dx, dy);

  if (!Number.isFinite(length) || length === 0) return null;

  const ux = dx / length;
  const uy = dy / length;

  const distance =
    (point.x - mirror.a.x) * ux +
    (point.y - mirror.a.y) * uy;

  return {
    x: mirror.a.x + distance * ux,
    y: mirror.a.y + distance * uy,
  };
}

// Clip an infinite line to the visible Cartesian bounds.
function clipMirror(mirror, bounds) {
  const dx = mirror.b.x - mirror.a.x;
  const dy = mirror.b.y - mirror.a.y;
  const length = Math.hypot(dx, dy);

  if (!Number.isFinite(length) || length === 0) return null;

  const direction = {
    x: dx / length,
    y: dy / length,
  };

  let low = -Infinity;
  let high = Infinity;

  for (const [axis, min, max] of [
    ["x", bounds.x_min, bounds.x_max],
    ["y", bounds.y_min, bounds.y_max],
  ]) {
    const origin = mirror.a[axis];
    const delta = direction[axis];

    if (Math.abs(delta) < 1e-12) {
      if (origin < min || origin > max) return null;
      continue;
    }

    const first = (min - origin) / delta;
    const second = (max - origin) / delta;

    low = Math.max(low, Math.min(first, second));
    high = Math.min(high, Math.max(first, second));

    if (low > high) return null;
  }

  if (!Number.isFinite(low) || !Number.isFinite(high)) {
    return null;
  }

  return {
    start: {
      x: mirror.a.x + low * direction.x,
      y: mirror.a.y + low * direction.y,
    },
    end: {
      x: mirror.a.x + high * direction.x,
      y: mirror.a.y + high * direction.y,
    },
  };
}

function niceStep(required) {
  const power = 10 ** Math.floor(Math.log10(required));
  const fraction = required / power;

  const multiplier =
    fraction <= 1 ? 1 :
    fraction <= 2 ? 2 :
    fraction <= 5 ? 5 : 10;

  return multiplier * power;
}

function makeTicks(min, max, step) {
  const first = Math.ceil(min / step - 1e-9);
  const last = Math.floor(max / step + 1e-9);
  const count = last - first + 1;

  if (count <= 0 || count > 200) return [];

  return Array.from({ length: count }, (_, index) => {
    const value = (first + index) * step;
    return Number(value.toPrecision(12));
  });
}

function getShapePoints(shape) {
  return shape.type === "polygon"
    ? shape.vertices
    : [shape];
}

function inferBounds(parsed) {
  const shapePoints = [
    ...getShapePoints(parsed.original),
    ...parsed.candidates.flatMap(getShapePoints),
  ];

  const extentPoints = [...shapePoints];

  // Include the relevant mirror location and space on both sides.
  // These extra points affect framing only; they are never rendered.
  for (const point of shapePoints) {
    const foot = projectOntoMirror(point, parsed.mirror);
    if (!foot) return null;

    extentPoints.push(foot);

    // Candidate questions already contain the images to display.
    // Reserve empty reflection space only for point-based questions.
    if (parsed.figure.feature !== "identify_image") {
    extentPoints.push({
        x: 2 * foot.x - point.x,
        y: 2 * foot.y - point.y,
    });
    }
  }

  if (parsed.showGrid) {
    extentPoints.push({ x: 0, y: 0 });
  }

  if (
    extentPoints.some(
      (point) =>
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y)
    )
  ) {
    return null;
  }

  let minX = Math.min(...extentPoints.map((point) => point.x));
  let maxX = Math.max(...extentPoints.map((point) => point.x));
  let minY = Math.min(...extentPoints.map((point) => point.y));
  let maxY = Math.max(...extentPoints.map((point) => point.y));

  // Give horizontal/vertical point arrangements enough visible depth.
  const span = Math.max(maxX - minX, maxY - minY, 1);

  if (maxX - minX < span * 0.35) {
    const center = (minX + maxX) / 2;
    minX = center - span * 0.175;
    maxX = center + span * 0.175;
  }

  if (maxY - minY < span * 0.35) {
    const center = (minY + maxY) / 2;
    minY = center - span * 0.175;
    maxY = center + span * 0.175;
  }

  const gapX = (maxX - minX) * 0.15;
  const gapY = (maxY - minY) * 0.15;

  return {
    x_min: minX - gapX,
    x_max: maxX + gapX,
    y_min: minY - gapY,
    y_max: maxY + gapY,
  };
}

export function calculateReflectionPositions({
  parsed,
  isMobile = false,
}) {
  if (!parsed?.valid) return null;

  const dimensions = getSvgDimensions(isMobile);
  const { width, height, fontSize, paddingX, paddingY } = dimensions;

  const bounds = parsed.bounds || inferBounds(parsed);
  if (!bounds) return null;

  const rangeX = bounds.x_max - bounds.x_min;
  const rangeY = bounds.y_max - bounds.y_min;

  const marginX = Math.max(paddingX, fontSize * 3);
  const marginY = Math.max(paddingY, fontSize * 2.5);

  const availableWidth = width - marginX * 2;
  const availableHeight = height - marginY * 2;

  if (
    availableWidth <= 0 ||
    availableHeight <= 0 ||
    !Number.isFinite(rangeX) ||
    !Number.isFinite(rangeY) ||
    rangeX <= 0 ||
    rangeY <= 0
  ) {
    return null;
  }

  const scale = Math.min(
    availableWidth / rangeX,
    availableHeight / rangeY
  );

  if (!Number.isFinite(scale) || scale <= 0) return null;

  const plotWidth = rangeX * scale;
  const plotHeight = rangeY * scale;

  const left = (width - plotWidth) / 2;
  const top = (height - plotHeight) / 2;

  const toPixel = (point) => ({
    x: left + (point.x - bounds.x_min) * scale,
    y: top + (bounds.y_max - point.y) * scale,
  });

  const plot = {
    left,
    top,
    right: left + plotWidth,
    bottom: top + plotHeight,
    width: plotWidth,
    height: plotHeight,
  };

  const clippedMirror = clipMirror(parsed.mirror, bounds);
  if (!clippedMirror) return null;

  const mirror = {
    id: parsed.mirror.id,
    label: parsed.mirror.label,
    start: toPixel(clippedMirror.start),
    end: toPixel(clippedMirror.end),
  };

  const transformShape = (shape) => {
    if (shape.type === "polygon") {
      return {
        ...shape,
        vertices: shape.vertices.map((point) => ({
          ...point,
          ...toPixel(point),
        })),
      };
    }

    return {
      ...shape,
      ...toPixel(shape),
    };
  };

  const original = transformShape(parsed.original);

  // ------------------------------------------
  // Coordinate grid
  // ------------------------------------------
  let grid = null;

  if (parsed.showGrid) {
    const step = niceStep(
      Math.max(fontSize * 2.8, 28) / scale
    );

    if (!Number.isFinite(step) || step <= 0) return null;
    // Prefer unit grid lines. For very large ranges, use a wider interval.
    const minorStep = Math.max( 1, niceStep(Math.max(rangeX, rangeY) / 100));

    grid = {
      step,
      xTicks: makeTicks(bounds.x_min, bounds.x_max, step).map(
        (value) => ({
          value,
          x: toPixel({ x: value, y: 0 }).x,
        })
      ),
      yTicks: makeTicks(bounds.y_min, bounds.y_max, step).map(
        (value) => ({
          value,
          y: toPixel({ x: 0, y: value }).y,
        })
      ),
      // Null means this axis lies outside the supplied bounds.
      xAxisY:
        bounds.y_min <= 0 && bounds.y_max >= 0
          ? toPixel({ x: 0, y: 0 }).y
          : null,
      yAxisX:
        bounds.x_min <= 0 && bounds.x_max >= 0
          ? toPixel({ x: 0, y: 0 }).x
          : null,

    minorXTicks: makeTicks(
        bounds.x_min,
        bounds.x_max,
        minorStep
        ).map((value) => ({
        value,
        x: toPixel({ x: value, y: 0 }).x,
        })),

        minorYTicks: makeTicks(
        bounds.y_min,
        bounds.y_max,
        minorStep
        ).map((value) => ({
        value,
        y: toPixel({ x: 0, y: value }).y,
        })),
    };
  }

  // Only explicitly labelled points become visible annotations.
  const labelledPoints = parsed.labelledPoints.map((point) => ({
    ...point,
    ...toPixel(point),
  }));

  const makePanel = (candidate = null) => {
    const pointIds = new Set([
      ...getShapePoints(parsed.original).map((point) => point.id),
      ...(candidate
        ? candidate.vertices.map((point) => point.id)
        : []),
      parsed.mirror.a.id,
      parsed.mirror.b.id,
    ]);

    return {
      id: candidate?.id || parsed.original.id,
      label: candidate?.label || "",
      original,
      candidate: candidate ? transformShape(candidate) : null,
      mirror,
      labelledPoints: labelledPoints.filter(
        (point) =>
          pointIds.has(point.id) &&
          point.x >= plot.left &&
          point.x <= plot.right &&
          point.y >= plot.top &&
          point.y <= plot.bottom
      ),
    };
  };

  return {
    ...dimensions,
    figure: { ...parsed.figure },
    bounds: { ...bounds },
    scale,
    plot,
    grid,
    panels:
      parsed.figure.feature === "identify_image"
        ? parsed.candidates.map(makePanel)
        : [makePanel()],
  };
}