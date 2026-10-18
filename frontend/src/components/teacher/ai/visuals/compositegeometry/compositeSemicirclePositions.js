import { getSvgDimensions } from "../geometry/geometryHelpers";

export function calculateCompositeSemicirclePositions({
  parsed,
  isMobile = false,
}) {
  if (!parsed?.valid || !parsed.semicircleConfig) return null;

  const svg = getSvgDimensions(isMobile);
  const { width, height, fontSize, paddingX, paddingY } = svg;

  const rectangle = parsed.rectangle;
  const L = rectangle.length;
  const H = rectangle.width;
  const bySide = new Map(parsed.semicircles.map((s) => [s.side, s]));

  let minX = 0;
  let minY = 0;
  let maxX = L;
  let maxY = H;

  for (const semicircle of parsed.semicircles) {
    if (semicircle.placement !== "outside") continue;

    if (semicircle.side === "left") minX -= semicircle.radius;
    if (semicircle.side === "right") maxX += semicircle.radius;
    if (semicircle.side === "top") minY -= semicircle.radius;
    if (semicircle.side === "bottom") maxY += semicircle.radius;
  }

  // Reserve additional lanes when several dimensions share an axis.
  const horizontalCount = parsed.dimensions.filter((d) => {
    if (d.role === "length") return true;
    if (d.role !== "diameter") return false;
    const s = parsed.semicircles.find((s) => s.id === d.targetId);
    return ["top", "bottom"].includes(s.side);
  }).length;

  const verticalCount = parsed.dimensions.filter((d) => {
    if (d.role === "width") return true;
    if (d.role !== "diameter") return false;
    const s = parsed.semicircles.find((s) => s.id === d.targetId);
    return ["left", "right"].includes(s.side);
  }).length;

  const extraHorizontal = Math.max(0, Math.ceil(horizontalCount / 2) - 1);
  const extraVertical = Math.max(0, Math.ceil(verticalCount / 2) - 1);

  const marginX = Math.max(
    paddingX,
    fontSize * (4.5 + extraVertical * 2.8)
  );

  const marginY = Math.max(
    paddingY,
    fontSize * (3 + extraHorizontal * 2.8)
  );

  const availableWidth = width - marginX * 2;
  const availableHeight = height - marginY * 2;

  if (availableWidth <= 0 || availableHeight <= 0) return null;

  const scale = Math.min(
    availableWidth / (maxX - minX),
    availableHeight / (maxY - minY)
  );

  const project = (x, y) => ({
    x: width / 2 + (x - (minX + maxX) / 2) * scale,
    y: height / 2 + (y - (minY + maxY) / 2) * scale,
  });

  const corners = [
    project(0, 0),
    project(L, 0),
    project(L, H),
    project(0, H),
  ];

  const sides = ["top", "right", "bottom", "left"];
  const path = [`M ${corners[0].x} ${corners[0].y}`];

  // Clockwise traversal: outside uses sweep 1, inside uses sweep 0.
  sides.forEach((side, index) => {
    const end = corners[(index + 1) % 4];
    const semicircle = bySide.get(side);

    if (semicircle) {
      const radius = semicircle.radius * scale;
      const sweep = semicircle.placement === "outside" ? 1 : 0;

      path.push(
        `A ${radius} ${radius} 0 0 ${sweep} ${end.x} ${end.y}`
      );
    } else {
      path.push(`L ${end.x} ${end.y}`);
    }
  });

  path.push("Z");

  const boundsStart = project(minX, minY);
  const boundsEnd = project(maxX, maxY);
  const labels = [];
  const dimensionGuides = [];
  const radiusLines = [];

  const lanes = { top: 0, bottom: 0, left: 0, right: 0 };
  const laneGap = fontSize * 2.8;
  const gap = fontSize * 0.8;

  // Prefer an intact straight edge, then an unused side.
  const chooseSide = (options) =>
    [...options].sort((a, b) => {
      const score = (side) =>
        lanes[side] * 10 + (bySide.has(side) ? 2 : 0);
      return score(a) - score(b);
    })[0];

  const horizontalDimension = (dimension) => {
    const side = chooseSide(["top", "bottom"]);
    const sign = side === "top" ? -1 : 1;
    const edgeY = side === "top" ? boundsStart.y : boundsEnd.y;
    const guideY = edgeY + sign * (gap + lanes[side]++ * laneGap);

    dimensionGuides.push({
      id: dimension.id,
      start: { x: corners[0].x, y: guideY },
      end: { x: corners[1].x, y: guideY },
    });

    labels.push({
      id: dimension.id,
      text: dimension.label,
      x: (corners[0].x + corners[1].x) / 2,
      y: guideY + sign * fontSize * 1.2,
    });
  };

  const verticalDimension = (dimension) => {
    const side = chooseSide(["left", "right"]);
    const sign = side === "left" ? -1 : 1;
    const edgeX = side === "left" ? boundsStart.x : boundsEnd.x;
    const guideX = edgeX + sign * (gap + lanes[side]++ * laneGap);

    dimensionGuides.push({
      id: dimension.id,
      start: { x: guideX, y: corners[0].y },
      end: { x: guideX, y: corners[3].y },
    });

    labels.push({
      id: dimension.id,
      text: dimension.label,
      x: guideX + sign * fontSize * 2,
      y: (corners[0].y + corners[3].y) / 2,
    });
  };

  for (const dimension of parsed.dimensions) {
    if (dimension.role === "length") {
      horizontalDimension(dimension);
      continue;
    }

    if (dimension.role === "width") {
      verticalDimension(dimension);
      continue;
    }

    const semicircle = parsed.semicircles.find(
      (s) => s.id === dimension.targetId
    );

    const horizontalDiameter = ["top", "bottom"].includes(semicircle.side);

    if (dimension.role === "diameter") {
        // Outside semicircle: mark its actual attachment diameter.
        if (semicircle.placement === "outside") {
            let start;
            let end;
            let labelX;
            let labelY;

            if (horizontalDiameter) {
            const edgeY = semicircle.side === "top" ? 0 : H;

            start = project(0, edgeY);
            end = project(L, edgeY);

            labelX = (start.x + end.x) / 2;
            labelY =
                start.y +
                (semicircle.side === "top" ? 1 : -1) * fontSize * 1.4;
            } else {
            const edgeX = semicircle.side === "left" ? 0 : L;

            start = project(edgeX, 0);
            end = project(edgeX, H);

            // Place the text toward the rectangular section.
            labelX =
                start.x +
                (semicircle.side === "left" ? 1 : -1) * fontSize * 2.5;
            labelY = (start.y + end.y) / 2;
            }

            dimensionGuides.push({
            id: dimension.id,
            start,
            end,
            });

            labels.push({
            id: dimension.id,
            text: dimension.label,
            x: labelX,
            y: labelY,
            });
        } else {
            // Preserve the external measurement for an inward cutout.
            if (horizontalDiameter) horizontalDimension(dimension);
            else verticalDimension(dimension);
        }

        continue;
        }

    // A supplied radius is measured from the diameter midpoint
    // to the midpoint of the curved arc.
    const centers = {
      top: [L / 2, 0],
      right: [L, H / 2],
      bottom: [L / 2, H],
      left: [0, H / 2],
    };

    const normals = {
      top: [0, -1],
      right: [1, 0],
      bottom: [0, 1],
      left: [-1, 0],
    };

    const [cx, cy] = centers[semicircle.side];
    const [nx, ny] = normals[semicircle.side];
    const sign = semicircle.placement === "outside" ? 1 : -1;

    const start = project(cx, cy);
    const end = project(
      cx + nx * semicircle.radius * sign,
      cy + ny * semicircle.radius * sign
    );

    radiusLines.push({ id: dimension.id, start, end });

    labels.push({
      id: dimension.id,
      text: dimension.label,
      x: (start.x + end.x) / 2 + (horizontalDiameter ? fontSize * 2 : 0),
      y: (start.y + end.y) / 2 - (horizontalDiameter ? 0 : fontSize * 1.2),
    });
  }

  return {
    ...svg,
    figure: parsed.figure,
    semicircleConfig: true,
    outlinePath: path.join(" "),
    labels,
    dimensionGuides,
    radiusLines,
  };
}