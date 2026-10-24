// conicsection/conicSectionPositions.js

import {
  getSvgDimensions,
  computeCoordinatePlane,
} from "../geometry/geometryHelpers";

// Clip a segment or infinite line to the visible coordinate bounds.
function clipLine(a, b, bounds, infinite = false) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  let low = infinite ? -Infinity : 0;
  let high = infinite ? Infinity : 1;

  for (const [origin, direction, min, max] of [
    [a.x, dx, bounds.x_min, bounds.x_max],
    [a.y, dy, bounds.y_min, bounds.y_max],
  ]) {
    if (direction === 0) {
      if (origin < min || origin > max) return null;
      continue;
    }

    const t1 = (min - origin) / direction;
    const t2 = (max - origin) / direction;

    low = Math.max(low, Math.min(t1, t2));
    high = Math.min(high, Math.max(t1, t2));

    if (low > high) return null;
  }

  if (!Number.isFinite(low) || !Number.isFinite(high)) return null;

  return {
    start: { x: a.x + low * dx, y: a.y + low * dy },
    end: { x: a.x + high * dx, y: a.y + high * dy },
  };
}

function sampleInterval(start, end, count, evaluate) {
  return Array.from({ length: count + 1 }, (_, index) => {
    const t = start + ((end - start) * index) / count;
    return evaluate(t);
  });
}

function makeTicks(min, max, step, project, horizontal) {
  if (!Number.isFinite(step) || step <= 0) return [];

  const first = Math.ceil(min / step - 1e-9);
  const last = Math.floor(max / step + 1e-9);

  if (
    !Number.isSafeInteger(first) ||
    !Number.isSafeInteger(last) ||
    last - first > 200
  ) {
    return [];
  }

  const ticks = [];

  for (let index = first; index <= last; index++) {
    const value = index === 0 ? 0 : Number((index * step).toPrecision(10));
    const point = horizontal ? project(value, 0) : project(0, value);

    ticks.push({
      value,
      label: String(value),
      ...point,
    });
  }

  return ticks;
}

function overlaps(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function calculateConicSectionPositions({
  parsed,
  isMobile = false,
  labelMeasurements = {}, // ADDED
}) {
  if (!parsed?.valid) return null;

  const svg = getSvgDimensions(isMobile);
  const { width, height, paddingX, paddingY, fontSize } = svg;
  const { figure, conic } = parsed;
  const bounds = figure.bounds;

  const marginX = Math.max(paddingX, fontSize * 3.5);
  const marginY = Math.max(paddingY, fontSize * 3);

  if (width <= marginX * 2 || height <= marginY * 2) return null;

  const coordinatePlane = computeCoordinatePlane(
    bounds,
    [],
    width,
    height,
    marginX,
    marginY,
    { tickStep: figure.tick_step }
  );

  if (
    !coordinatePlane ||
    !Number.isFinite(coordinatePlane.scale) ||
    coordinatePlane.scale <= 0
  ) {
    return null;
  }

  const { toPixel, scale } = coordinatePlane;
  const project = (point) => toPixel(point.x, point.y);

  const topLeft = toPixel(bounds.x_min, bounds.y_max);
  const bottomRight = toPixel(bounds.x_max, bounds.y_min);

  const plot = {
    left: topLeft.x,
    right: bottomRight.x,
    top: topLeft.y,
    bottom: bottomRight.y,
  };

  const horizontal = conic.orientation === "horizontal";

  const fromLocal = (u, v) =>
    horizontal
      ? { x: conic.h + u, y: conic.k + v }
      : { x: conic.h + v, y: conic.k + u };

  const uMin = horizontal
    ? bounds.x_min - conic.h
    : bounds.y_min - conic.k;

  const uMax = horizontal
    ? bounds.x_max - conic.h
    : bounds.y_max - conic.k;

  const vMin = horizontal
    ? bounds.y_min - conic.k
    : bounds.x_min - conic.h;

  const vMax = horizontal
    ? bounds.y_max - conic.k
    : bounds.x_max - conic.h;

  const sampleCount = Math.min(
    1600,
    Math.max(240, Math.ceil(Math.max(width, height) * 1.5))
  );

  const branches = [];
  let ellipse = null;
  const interval = conic.curve_interval;

  // -------------------------------------------------------
  // Finite curves: arches and selected conic portions.
  // Use the existing path renderer without closing the curve.
  // -------------------------------------------------------

  if (interval) {
    const { axis, lower, upper, branch } = interval;

    let start;
    let end;
    let evaluate;

    if (conic.subtype === "parabola") {
      const inputCenter = horizontal ? conic.k : conic.h;

      start = lower - inputCenter;
      end = upper - inputCenter;

      evaluate = (v) =>
        fromLocal((v / conic.p) * (v / 4), v);
    } else if (
      conic.subtype === "circle" ||
      conic.subtype === "ellipse"
    ) {
      const circle = conic.subtype === "circle";

      const rx = circle
        ? conic.r
        : horizontal ? conic.a : conic.b;

      const ry = circle
        ? conic.r
        : horizontal ? conic.b : conic.a;

      const inputCenter = axis === "x" ? conic.h : conic.k;
      const inputRadius = axis === "x" ? rx : ry;

      const sign = ["upper", "right"].includes(branch) ? 1 : -1;

      const clampUnit = (value) =>
        Math.max(-1, Math.min(1, value));

      // Angular sampling keeps rounded endpoints smooth,
      // including where the curve has a vertical tangent.
      start = Math.asin(
        clampUnit((lower - inputCenter) / inputRadius)
      );

      end = Math.asin(
        clampUnit((upper - inputCenter) / inputRadius)
      );

      evaluate = (t) => {
        const along = Math.sin(t);
        const across = Math.max(0, Math.cos(t));

        return axis === "x"
          ? {
              x: conic.h + rx * along,
              y: conic.k + sign * ry * across,
            }
          : {
              x: conic.h + sign * rx * across,
              y: conic.k + ry * along,
            };
      };
    } else {
      return null;
    }

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end <= start
    ) {
      return null;
    }

    // Include the vertex or branch extremum exactly when present.
    const cuts =
      start < 0 && end > 0
        ? [start, 0, end]
        : [start, end];

    const samples = [];

    for (let i = 0; i < cuts.length - 1; i++) {
      const sampledPoints = sampleInterval(
        cuts[i],
        cuts[i + 1],
        Math.ceil(sampleCount / (cuts.length - 1)),
        evaluate
      );

      samples.push(
        ...(i === 0 ? sampledPoints : sampledPoints.slice(1))
      );
    }

    branches.push(samples);
  }

  // -------------------------------------------------------
  // Full circle / ellipse: retain exact SVG ellipse geometry.
  // -------------------------------------------------------

  else if (conic.subtype === "circle" || conic.subtype === "ellipse") {
    const circle = conic.subtype === "circle";

    const rx = circle
      ? conic.r
      : horizontal
        ? conic.a
        : conic.b;

    const ry = circle
      ? conic.r
      : horizontal
        ? conic.b
        : conic.a;

    ellipse = {
      center: toPixel(conic.h, conic.k),
      rx: rx * scale,
      ry: ry * scale,
    };
  }

  // -------------------------------------------------------
  // Parabola: v² = 4pu
  // Split at the vertex to retain both arms accurately.
  // -------------------------------------------------------

  else if (conic.subtype === "parabola") {
    const cuts = [vMin, vMax];

    if (vMin < 0 && vMax > 0) cuts.push(0);

    // Include exact intersections with both u boundaries.
    for (const u of [uMin, uMax]) {
      const squaredV = 4 * conic.p * u;

      if (Number.isFinite(squaredV) && squaredV >= 0) {
        const root = Math.sqrt(squaredV);

        for (const v of [-root, root]) {
          if (v > vMin && v < vMax) cuts.push(v);
        }
      }
    }

    const sorted = [...new Set(cuts)].sort((a, b) => a - b);
    const samples = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const points = sampleInterval(
        sorted[i],
        sorted[i + 1],
        Math.max(40, Math.ceil(sampleCount / (sorted.length - 1))),
        (v) => fromLocal((v / (4 * conic.p)) * v, v)
      );

      samples.push(...(i === 0 ? points : points.slice(1)));
    }

    branches.push(samples);
  }

  // -------------------------------------------------------
  // Hyperbola: u = ±a cosh(t), v = b sinh(t)
  // Each sign creates an independent branch.
  // -------------------------------------------------------

  else if (conic.subtype === "hyperbola") {
    for (const sign of [-1, 1]) {
      const availableU = sign > 0 ? uMax : -uMin;

      if (availableU < conic.a) continue;

      const ratio = availableU / conic.a;
      const tLimit = Math.acosh(ratio);

      const start = Math.max(
        -tLimit,
        Math.asinh(vMin / conic.b)
      );

      const end = Math.min(
        tLimit,
        Math.asinh(vMax / conic.b)
      );

      if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        end <= start
      ) {
        continue;
      }

      // Include t=0 so the vertex is represented exactly.
      const cuts = start < 0 && end > 0
        ? [start, 0, end]
        : [start, end];

      const samples = [];

      for (let i = 0; i < cuts.length - 1; i++) {
        const points = sampleInterval(
          cuts[i],
          cuts[i + 1],
          Math.ceil(sampleCount / (cuts.length - 1)),
          (t) =>
            fromLocal(
              sign * conic.a * Math.cosh(t),
              conic.b * Math.sinh(t)
            )
        );

        samples.push(...(i === 0 ? points : points.slice(1)));
      }

      branches.push(samples);
    }
  }

  // -------------------------------------------------------
  // Clip sampled curves without joining separated portions
  // -------------------------------------------------------

  const curveRuns = [];

  for (const branch of branches) {
    let run = [];

    const finishRun = () => {
      if (run.length >= 2) curveRuns.push(run);
      run = [];
    };

    for (let i = 1; i < branch.length; i++) {
      const a = branch[i - 1];
      const b = branch[i];

      if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) {
        finishRun();
        continue;
      }

      const clipped = clipLine(a, b, bounds);

      if (!clipped) {
        finishRun();
        continue;
      }

      const start = project(clipped.start);
      const end = project(clipped.end);

      if (Math.hypot(end.x - start.x, end.y - start.y) < 1e-6) {
        continue;
      }

      const previous = run[run.length - 1];

      if (
        previous &&
        Math.hypot(previous.x - start.x, previous.y - start.y) > 0.1
      ) {
        finishRun();
      }

      if (run.length === 0) run.push(start);
      run.push(end);
    }

    finishRun();
  }

  if (!ellipse && curveRuns.length === 0) return null;

  const paths = curveRuns.map((run, index) => ({
    id: `${conic.id}-branch-${index}`,
    d: run
      .map(
        (point, pointIndex) =>
          `${pointIndex === 0 ? "M" : "L"} ${point.x} ${point.y}`
      )
      .join(" "),
  }));

  // Continuation arrows only where an open curve reaches the frame.
  const continuationArrows = [];

  const atBoundary = (point) =>
    Math.min(
      Math.abs(point.x - plot.left),
      Math.abs(point.x - plot.right),
      Math.abs(point.y - plot.top),
      Math.abs(point.y - plot.bottom)
    ) <= 0.75;

  for (let index = 0; index < curveRuns.length; index++) {
    const run = curveRuns[index];

    for (const [tip, neighbour, suffix] of [
      [run[0], run[1], "start"],
      [run[run.length - 1], run[run.length - 2], "end"],
    ]) {
      // Restricted curves end at their supplied limits.
      if (interval || !atBoundary(tip)) continue;

      const dx = tip.x - neighbour.x;
      const dy = tip.y - neighbour.y;
      const length = Math.hypot(dx, dy);

      if (length <= 1e-6) continue;

      continuationArrows.push({
        id: `${conic.id}-${index}-${suffix}`,
        tip,
        ux: dx / length,
        uy: dy / length,
      });
    }
  }

  // -------------------------------------------------------
  // Explicit annotations only
  // -------------------------------------------------------

  const points = parsed.points.map((point) => ({
    ...point,
    ...project(point),
  }));

  const lines = [];

  for (const line of parsed.lines) {
    const clipped = clipLine(line.a, line.b, bounds, true);

    if (!clipped) return null;

    lines.push({
      id: line.id,
      label: line.label,
      role: line.role,
      start: project(clipped.start),
      end: project(clipped.end),
    });
  }

    // ADDED: finite segments retain their actual endpoints.
    const segments = (parsed.segments || []).map((segment) => ({
      id: segment.id,
      label: segment.label,
      role: segment.role,
      start: project(segment.a),
      end: project(segment.b),
    }));
  // -------------------------------------------------------
  // Labels: prefer nearby clear space
  // -------------------------------------------------------

  const labels = [];
  const occupied = [];
  const curveSamples = curveRuns.flat();

  if (ellipse) {
    curveSamples.push(
      ...sampleInterval(0, Math.PI * 2, 240, (t) => ({
        x: ellipse.center.x + ellipse.rx * Math.cos(t),
        y: ellipse.center.y + ellipse.ry * Math.sin(t),
      }))
    );
  }

  const origin = toPixel(0, 0);

  function addLabel(
    id,
    text,
    anchors,
    preferredDirection = null,
    gapMultipliers = [0.7, 1.15, 1.7, 2.3]
  ) {
  if (!text) return;

  const plain = text
    .replace(/\\(?:text|mathrm)\{([^}]*)\}/g, "$1")
    .replace(/\\[a-zA-Z]+/g, "M")
    .replace(/[$^_{}]/g, "");

  const measurement = labelMeasurements[id];

  // Reuse a measurement only when its text and font still match.
  const hasMeasurement =
    measurement?.text === text &&
    measurement?.fontSize === fontSize &&
    Number.isFinite(measurement.width) &&
    Number.isFinite(measurement.height) &&
    measurement.width > 0 &&
    measurement.height > 0;

  const labelWidth = hasMeasurement
    ? measurement.width
    : Math.min(
        width - 8,
        Math.max(fontSize * 1.5, plain.length * fontSize * 0.72 + 10)
      );

  const labelHeight = hasMeasurement
    ? measurement.height
    : fontSize * 1.9;
  const candidates = [];

  // Reserve both the axis line and its normal tick-label space.
  const axisBoxes = [
    {
      x: origin.x - fontSize * 1.9,
      y: plot.top - fontSize * 1.8,
      width: fontSize * 2.45,
      height: plot.bottom - plot.top + fontSize * 2,
    },
    {
      x: plot.left,
      y: origin.y - fontSize * 0.35,
      width: plot.right - plot.left + fontSize * 1.8,
      height: fontSize * 1.9,
    },
  ];

  for (const anchor of anchors) {
    // Try close positions first, then slightly larger offsets.
    for (const gapMultiplier of gapMultipliers) {
      const gap = fontSize * gapMultiplier;

      for (const [sx, sy] of [
        [1, 0], [-1, 0],
        [1, -1], [-1, -1],
        [1, 1], [-1, 1],
        [0, -1], [0, 1],
      ]) {
        const x = anchor.x + sx * (labelWidth / 2 + gap);
        // Use consistent clearance for every direction.
        const y = anchor.y + sy * (labelHeight / 2 + gap);

        const box = {
          x: x - labelWidth / 2,
          y: y - labelHeight / 2,
          width: labelWidth,
          height: labelHeight,
        };

        // Do not clamp a candidate back onto a point or axis.
        if (
          box.x < 2 ||
          box.y < 2 ||
          box.x + box.width > width - 2 ||
          box.y + box.height > height - 2
        ) {
          continue;
        }

        // Small clearance around the actual label rectangle.
        const padded = {
          x: box.x - strokeClearance(),
          y: box.y - strokeClearance(),
          width: box.width + strokeClearance() * 2,
          height: box.height + strokeClearance() * 2,
        };

        const contains = (point) =>
          point.x >= padded.x &&
          point.x <= padded.x + padded.width &&
          point.y >= padded.y &&
          point.y <= padded.y + padded.height;

        const labelHits = occupied.filter(
          (other) => overlaps(padded, other)
        ).length;

        const pointHits = points.filter(contains).length;
        // An annotation attached to the origin should avoid the actual
        // Point labels avoid axis strokes, but may occupy tick-number space.
        // The renderer hides tick numbers covered by annotations.
        const isPointAnchor = points.some((point) =>
          Math.abs(anchor.x - point.x) < 0.5 &&
          Math.abs(anchor.y - point.y) < 0.5
        );

        const axisClearance = Math.max(
          svg.strokeWidth,
          fontSize * 0.15
        );

        const activeAxisBoxes = isPointAnchor
          ? [
              {
                x: origin.x - axisClearance,
                y: plot.top,
                width: axisClearance * 2,
                height: plot.bottom - plot.top,
              },
              {
                x: plot.left,
                y: origin.y - axisClearance,
                width: plot.right - plot.left,
                height: axisClearance * 2,
              },
            ]
          : axisBoxes;

        const axisHits = activeAxisBoxes.filter(
          (axisBox) => overlaps(padded, axisBox)
        ).length;

        const curveHit = curveSamples.some(contains);

        const lineHit = lines.some((line) =>
          clipLine(line.start, line.end, {
            x_min: padded.x,
            x_max: padded.x + padded.width,
            y_min: padded.y,
            y_max: padded.y + padded.height,
          })
        );

        // ADDED: check only the finite segment, not its extended line.
        const segmentHit = segments.some((segment) =>
          clipLine(
            segment.start,
            segment.end,
            {
              x_min: padded.x,
              x_max: padded.x + padded.width,
              y_min: padded.y,
              y_max: padded.y + padded.height,
            },
            false
          )
        );

        // Distance to the nearest edge of the label, not its centre.
        const distance = Math.hypot(
          Math.max(box.x - anchor.x, 0, anchor.x - box.x - box.width),
          Math.max(box.y - anchor.y, 0, anchor.y - box.y - box.height)
        );

        candidates.push({
          x,
          y,
          box,
          directionPenalty:
            preferredDirection &&
            (sx !== preferredDirection[0] || sy !== preferredDirection[1])
              ? 1
              : 0,
          align: sx > 0 ? "start" : sx < 0 ? "end" : "middle",
          labelHits,
          pointHits,
          geometryHits: axisHits + Number(curveHit) + Number(Boolean(lineHit)),
          distance,
          segmentHits: Number(segmentHit),
        });
      }
    }
  }

  function strokeClearance() {
    return Math.max(2, svg.strokeWidth);
  }

  // Collision-free candidates always beat overlapping candidates.
  // CHANGED: avoid collisions before applying direction preferences.
  candidates.sort((a, b) =>
    a.labelHits - b.labelHits ||
    a.pointHits - b.pointHits ||
    a.segmentHits - b.segmentHits ||
    a.geometryHits - b.geometryHits ||
    a.directionPenalty - b.directionPenalty ||
    a.distance - b.distance
  );

  const chosen = candidates[0];
  if (!chosen) return;

  occupied.push(chosen.box);

  labels.push({
    id,
    text,
    x: chosen.x,
    y: chosen.y,
    width: labelWidth,
    height: labelHeight,
    align: chosen.align,
  });
}

  const conicCenterPixel = toPixel(conic.h, conic.k);

    // Place conjugate-endpoint labels first.
    // CHANGED: place vertex/focus labels before the centre label,
    // so the centre cannot occupy their nearby space.
    const pointLabelPriority = (point) => {
      if (point.role === "co_vertex") return 0;
      if (point.role === "vertex") return 1;
      if (point.role === "focus") return 2;
      if (point.role === "center") return 4;
      return 3;
    };

    const labelPoints = [...points].sort(
      (a, b) => pointLabelPriority(a) - pointLabelPriority(b)
    );

  for (const point of labelPoints) {
    let preferredDirection = null;

    if (
      conic.subtype === "hyperbola" &&
      conic.orientation === "vertical" &&
      point.role === "vertex"
    ) {
      // SVG y increases downward.
      const isUpperVertex = point.y < conicCenterPixel.y;

      preferredDirection = isUpperVertex
        ? [1, 1]   // Upper vertex: below-right.
        : [1, -1]; // Lower vertex: above-right.
    }

    // ADDED: keep hyperbola conjugate-endpoint labels beside their dots,
    // on the side away from the y-axis.
    if (
      conic.subtype === "hyperbola" &&
      point.role === "co_vertex"
    ) {
      preferredDirection =
        point.x <= origin.x ? [-1, 0] : [1, 0];
    }

        // Centre label directly above its own dot.
    if (
      conic.subtype === "hyperbola" &&
      point.role === "center"
    ) {
      preferredDirection = [0, -1];
    }

    // ADDED: put vertical-hyperbola focus labels away from the vertex.
    if (
      conic.subtype === "hyperbola" &&
      conic.orientation === "vertical" &&
      point.role === "focus"
    ) {
      const isUpperFocus = point.y < conicCenterPixel.y;

      preferredDirection = isUpperFocus
        ? [1, -1]  // Upper focus: above-right.
        : [1, 1];  // Lower focus: below-right.
    }

    const isHyperbolaCenter =
      conic.subtype === "hyperbola" &&
      point.role === "center";

     addLabel(
      `label-${point.id}`,
      point.label,
      [point],
      preferredDirection,
      isHyperbolaCenter
        ? [0.3, 0.45, 0.7]
        : [0.35, 0.5, 0.7, 1.15]
    );
  }

  for (const line of lines) {
    addLabel(`label-${line.id}`, line.label, [
      line.end,
      line.start,
    ]);
  }
    // ADDED: place optional segment labels near the segment's interior.
  for (const segment of segments) {
    const anchors = [0.5, 0.25, 0.75].map((fraction) => ({
      x:
        segment.start.x +
        (segment.end.x - segment.start.x) * fraction,
      y:
        segment.start.y +
        (segment.end.y - segment.start.y) * fraction,
    }));

    addLabel(
      `label-${segment.id}`,
      segment.label,
      anchors
    );
  }

  return {
    ...svg,
    figure,
    conic,
    plot,
    scale,
    toPixel,
    origin,
    ellipse,
    paths,
    continuationArrows,
    points,
    lines,
    segments, // ADDED
    labels,
    curveSamples, 
    xTicks: makeTicks(
      bounds.x_min,
      bounds.x_max,
      coordinatePlane.tickX,
      toPixel,
      true
    ),
    yTicks: makeTicks(
      bounds.y_min,
      bounds.y_max,
      coordinatePlane.tickY,
      toPixel,
      false
    ),
  };
}