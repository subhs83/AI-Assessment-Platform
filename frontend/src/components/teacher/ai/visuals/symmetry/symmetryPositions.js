import { getSvgDimensions } from "../geometry/geometryHelpers";

function clipLine(a, b, bounds) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let low = -Infinity;
  let high = Infinity;

  for (const [origin, direction, min, max] of [
    [a.x, dx, bounds.left, bounds.right],
    [a.y, dy, bounds.top, bounds.bottom],
  ]) {
    if (Math.abs(direction) < 1e-10) {
      if (origin < min || origin > max) return null;
      continue;
    }

    const t1 = (min - origin) / direction;
    const t2 = (max - origin) / direction;

    low = Math.max(low, Math.min(t1, t2));
    high = Math.min(high, Math.max(t1, t2));
  }

  if (low > high || !Number.isFinite(low) || !Number.isFinite(high)) {
    return null;
  }

  return {
    start: { x: a.x + dx * low, y: a.y + dy * low },
    end: { x: a.x + dx * high, y: a.y + dy * high },
  };
}

export function calculateSymmetryPositions({
  parsed,
  isMobile = false,
}) {
  if (!parsed?.valid) return null;

  const svg = getSvgDimensions(isMobile);
  const { width, height, fontSize, paddingX, paddingY } = svg;
  const shape = parsed.shape;

  const referencePoints =
    shape.type === "polygon"
      ? [...shape.vertices]
      : [
          { x: shape.center.x - shape.rx, y: shape.center.y - shape.ry },
          { x: shape.center.x + shape.rx, y: shape.center.y + shape.ry },
        ];

  // Include supplied candidate-line reference points in the layout.
  for (const line of parsed.lines) {
    referencePoints.push(line.a, line.b);
  }

  referencePoints.push(...parsed.labelledPoints);

  const minX = Math.min(...referencePoints.map((p) => p.x));
  const maxX = Math.max(...referencePoints.map((p) => p.x));
  const minY = Math.min(...referencePoints.map((p) => p.y));
  const maxY = Math.max(...referencePoints.map((p) => p.y));

  const marginX = Math.max(paddingX, fontSize * 3.5);
  const marginY = Math.max(paddingY, fontSize * 3);

  const availableWidth = width - marginX * 2;
  const availableHeight = height - marginY * 2;

  if (availableWidth <= 0 || availableHeight <= 0) return null;

  const scale = Math.min(
    availableWidth / (maxX - minX),
    availableHeight / (maxY - minY)
  );

  if (!Number.isFinite(scale) || scale <= 0) return null;

  const project = (point) => ({
    x: width / 2 + (point.x - (minX + maxX) / 2) * scale,
    y: height / 2 - (point.y - (minY + maxY) / 2) * scale,
  });

  const renderedShape =
    shape.type === "polygon"
      ? {
          type: "polygon",
          vertices: shape.vertices.map(project),
        }
      : {
          type: shape.type,
          center: project(shape.center),
          rx: shape.rx * scale,
          ry: shape.ry * scale,
        };

  const lineBounds = {
    left: marginX - fontSize * 0.3,
    right: width - marginX + fontSize * 0.3,
    top: marginY - fontSize * 0.3,
    bottom: height - marginY + fontSize * 0.3,
  };

  const lines = parsed.lines.map((line) => {
    const clipped = clipLine(project(line.a), project(line.b), lineBounds);
    return clipped ? { id: line.id, label: line.label, ...clipped } : null;
  });

  if (lines.some((line) => !line)) return null;

  const occupied = [];
  const labels = [];

  const overlaps = (a, b) =>
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;

  for (const line of lines) {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;
    const length = Math.hypot(dx, dy);
    const ux = dx / length;
    const uy = dy / length;

    const labelWidth = Math.min(
      width - 8,
      Math.max(fontSize * 2.4, line.label.length * fontSize * 0.75 + 10)
    );
    const labelHeight = fontSize * 2;
    const candidates = [];

    for (const [point, sign] of [[line.end, 1], [line.start, -1]]) {
      // Move the whole label box beyond the line endpoint.
      const offset =
        Math.abs(ux) * labelWidth / 2 +
        Math.abs(uy) * labelHeight / 2 +
        fontSize * 0.4;

      for (const shift of [0, fontSize * 1.3, -fontSize * 1.3]) {
        const x = point.x + sign * ux * offset - uy * shift;
        const y = point.y + sign * uy * offset + ux * shift;

        const box = {
          x: x - labelWidth / 2,
          y: y - labelHeight / 2,
          width: labelWidth,
          height: labelHeight,
        };

        const outside =
          box.x < 2 ||
          box.y < 2 ||
          box.x + box.width > width - 2 ||
          box.y + box.height > height - 2;

        candidates.push({
          x,
          y,
          box,
          score:
            (outside ? 10000 : 0) +
            occupied.filter((other) => overlaps(box, other)).length * 1000 +
            Math.abs(shift),
        });
      }
    }

    candidates.sort((a, b) => a.score - b.score);
    const chosen = candidates[0];

    occupied.push(chosen.box);
    labels.push({
      id: line.id,
      text: line.label,
      x: chosen.x,
      y: chosen.y,
      width: labelWidth,
      height: labelHeight,
    });
  }  
  // Project the rotation centre using the same scale as the shape.
  const rotationCenter = parsed.rotationCenter
    ? {
        ...parsed.rotationCenter,
        ...project(parsed.rotationCenter),
      }
    : null;


    return {
    ...svg,
    figure: parsed.figure,
    shape: renderedShape,
    lines,
    labels,

    // Added for rotational symmetry.
    rotationCenter,
    rotationDeg: parsed.rotationDeg ?? null,

    points: parsed.labelledPoints.map((point) => ({
      ...point,
      ...project(point),
    })),
  };
}