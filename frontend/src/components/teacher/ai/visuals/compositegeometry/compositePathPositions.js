import { getSvgDimensions } from "../geometry/geometryHelpers";

export function calculateCompositePathPositions({
  parsed,
  isMobile = false,
}) {
  if (!parsed?.valid || !parsed.pathConfig) return null;

  const svg = getSvgDimensions(isMobile);
  const { width, height, fontSize, paddingX, paddingY } = svg;
  const config = parsed.pathConfig;
  const source = parsed.rectangles;

  const minX = Math.min(...source.map((r) => r.x));
  const minY = Math.min(...source.map((r) => r.y));
  const maxX = Math.max(...source.map((r) => r.x + r.length));
  const maxY = Math.max(...source.map((r) => r.y + r.width));

  // Reserve room for labels on all four sides.
  const marginX = Math.max(paddingX, fontSize * 4.5);
  const marginY = Math.max(paddingY, fontSize * 3);

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

  const rectangles = source.map((rectangle) => ({
    ...rectangle,
    ...project(rectangle.x, rectangle.y),
    width: rectangle.length * scale,
    height: rectangle.width * scale,
  }));

  const byId = new Map(rectangles.map((r) => [r.id, r]));
  const park = byId.get(config.parkId);

  const outer =
    config.kind === "boundary_path"
      ? byId.get(config.outerId)
      : park;

  const inner =
    config.kind === "boundary_path"
      ? byId.get(config.innerId)
      : null;

  const horizontal = byId.get(config.horizontalId);
  const vertical = byId.get(config.verticalId);

  if (
    !park ||
    !outer ||
    (config.kind === "boundary_path" && !inner) ||
    (config.kind === "crossing_paths" && (!horizontal || !vertical))
  ) {
    return null;
  }

  const labels = [];
  const dimensionGuides = [];

  const left = outer.x;
  const right = outer.x + outer.width;
  const top = outer.y;
  const bottom = outer.y + outer.height;

  const gap = fontSize * 0.9;
  const labelGap = fontSize * 1.2;

  // Additional dimensions on the same side use separate lanes.
  const lanes = { top: 0, bottom: 0, left: 0, right: 0 };
  const laneGap = fontSize * 2.8;

  const addHorizontal = (dimension, rectangle, side) => {
    const lane = lanes[side]++;
    const guideY =
      side === "top"
        ? top - gap - lane * laneGap
        : bottom + gap + lane * laneGap;

    dimensionGuides.push({
      id: dimension.id,
      start: { x: rectangle.x, y: guideY },
      end: { x: rectangle.x + rectangle.width, y: guideY },
    });

    labels.push({
      id: dimension.id,
      text: dimension.label,
      x: rectangle.x + rectangle.width / 2,
      y: guideY + (side === "top" ? -labelGap : labelGap),
    });
  };

  const addVertical = (dimension, rectangle, side) => {
    const lane = lanes[side]++;
    const guideX =
      side === "left"
        ? left - gap - lane * laneGap
        : right + gap + lane * laneGap;

    dimensionGuides.push({
      id: dimension.id,
      start: { x: guideX, y: rectangle.y },
      end: { x: guideX, y: rectangle.y + rectangle.height },
    });

    labels.push({
      id: dimension.id,
      text: dimension.label,
      x: guideX + (side === "left" ? -fontSize * 2 : fontSize * 2),
      y: rectangle.y + rectangle.height / 2,
    });
  };

  // Given park dimensions first, so they get the nearest lanes.
  const dimensions = [...parsed.dimensions].sort(
    (a, b) =>
      Number(b.rectangleId === park.id) -
      Number(a.rectangleId === park.id)
  );

  for (const dimension of dimensions) {
    const rectangle = byId.get(dimension.rectangleId);
    if (!rectangle) continue;

    if (dimension.role === "path_width") {
        // Measure directly across the right-hand path strip.
        const innerRight = inner.x + inner.width;
        const outerRight = outer.x + outer.width;
        const guideY = inner.y + inner.height / 2;

        dimensionGuides.push({
            id: dimension.id,
            start: { x: innerRight, y: guideY },
            end: { x: outerRight, y: guideY },
        });

        // Keep the text in the lawn, beside the measured strip.
        labels.push({
            id: dimension.id,
            text: dimension.label,
            x: innerRight - fontSize * 2.5,
            y: guideY,
        });

        continue;
        }
    
    // For an outside path, the given park dimensions describe
    // the INNER garden. Place their guides beside its inner edges.
    if (
    config.kind === "boundary_path" &&
    config.placement === "outside" &&
    rectangle.id === park.id
    ) {
    if (dimension.role === "length") {
        const guideY = park.y + gap;

        dimensionGuides.push({
        id: dimension.id,
        start: { x: park.x, y: guideY },
        end: { x: park.x + park.width, y: guideY },
        });

        labels.push({
        id: dimension.id,
        text: dimension.label,
        x: park.x + park.width / 2,
        y: guideY + labelGap,
        });

        continue;
    }

    if (dimension.role === "width") {
        const guideX = park.x + gap;

        dimensionGuides.push({
        id: dimension.id,
        start: { x: guideX, y: park.y },
        end: { x: guideX, y: park.y + park.height },
        });

        labels.push({
        id: dimension.id,
        text: dimension.label,
        x: guideX + fontSize * 2,
        y: park.y + park.height / 2,
        });

        continue;
    }
    }
    if (dimension.role === "length") {
      // Park length above; vertical-strip width below.
      addHorizontal(
        dimension,
        rectangle,
        rectangle.id === park.id ? "top" : "bottom"
      );
      continue;
    }

    if (dimension.role === "width") {
      // Park width left; horizontal-strip width right.
      addVertical(
        dimension,
        rectangle,
        rectangle.id === park.id ? "left" : "right"
      );
      continue;
    }

    if (dimension.role === "area") {
      labels.push({
        id: dimension.id,
        text: dimension.label,
        x: rectangle.x + rectangle.width / 2,
        y: rectangle.y + rectangle.height / 2,
      });
    }
  }

  return {
    ...svg,
    figure: parsed.figure,
    pathConfig: config,
    rectangles,
    park,
    outer,
    inner,
    horizontal,
    vertical,
    labels,
    dimensionGuides,
  };
}