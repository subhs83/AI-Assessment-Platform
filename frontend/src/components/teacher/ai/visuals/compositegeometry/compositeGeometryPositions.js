import { getSvgDimensions } from "../geometry/geometryHelpers";
import { calculateCompositePathPositions } from "./compositePathPositions";
import { calculateCompositeRegionPositions } from "./compositeRegionPositions";
import { calculateCompositeSemicirclePositions } from "./compositeSemicirclePositions";


function overlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Split rectangle edges at every rectangle boundary.
// Shared edges cancel, leaving only the composite's boundary.
function buildBoundary(rectangles, fillCells = []) {
  const xs = [...new Set(
    rectangles.flatMap((r) => [r.x, r.x + r.length])
  )].sort((a, b) => a - b);

  const ys = [...new Set(
    rectangles.flatMap((r) => [r.y, r.y + r.width])
  )].sort((a, b) => a - b);

  const cells = Array.from(
    { length: xs.length - 1 },
    (_, i) =>
      Array.from({ length: ys.length - 1 }, (_, j) => {
        const x = (xs[i] + xs[i + 1]) / 2;
        const y = (ys[j] + ys[j + 1]) / 2;

                const contains = (r) =>
          x > r.x &&
          x < r.x + r.length &&
          y > r.y &&
          y < r.y + r.width;

        // ADDED: outer region minus cutouts.
        return (
          rectangles.some((r) => !r.isCutout && contains(r)) &&
          !rectangles.some((r) => r.isCutout && contains(r))
        );
      })
  );

  const filled = (i, j) => cells[i]?.[j] === true;
  const edges = [];

  const add = (x1, y1, x2, y2) => {
    edges.push({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
    });
  };

  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      if (!filled(i, j)) continue;

      const left = xs[i];
      const right = xs[i + 1];
      const top = ys[j];
      const bottom = ys[j + 1];

      // ADDED: cells contain only the remaining solid region.
      fillCells.push({
        x: left,
        y: top,
        length: right - left,
        width: bottom - top,
      });
      if (!filled(i, j - 1)) add(left, top, right, top);
      if (!filled(i, j + 1)) add(left, bottom, right, bottom);
      if (!filled(i - 1, j)) add(left, top, left, bottom);
      if (!filled(i + 1, j)) add(right, top, right, bottom);
    }
  }

  return edges;
}

export function calculateCompositeGeometryPositions({
  parsed,
  isMobile = false,
}) {
  if (!parsed?.valid) return null;

  // ADDED: path figures have their own layout.
  if (parsed.semicircleConfig) {
    return calculateCompositeSemicirclePositions({ parsed, isMobile });
  }
  if (parsed.pathConfig) {
    return calculateCompositePathPositions({ parsed, isMobile });
  }
  if (parsed.regionKind) {
  return calculateCompositeRegionPositions({ parsed, isMobile });
}

  const dimensions = getSvgDimensions(isMobile);
  const {
    width,
    height,
    paddingX,
    paddingY,
    fontSize,
  } = dimensions;

  const source = parsed.rectangles;
  const minX = Math.min(...source.map((r) => r.x));
  const maxX = Math.max(...source.map((r) => r.x + r.length));
  const minY = Math.min(...source.map((r) => r.y));
  const maxY = Math.max(...source.map((r) => r.y + r.width));

  // Space for dimensions around the figure.
  const marginX = Math.max(paddingX, fontSize * 3);
  const marginY = Math.max(paddingY, fontSize * 3);

  const availableWidth = width - marginX * 2;
  const availableHeight = height - marginY * 2;

  if (availableWidth <= 0 || availableHeight <= 0) return null;

  const scale = Math.min(
    availableWidth / (maxX - minX),
    availableHeight / (maxY - minY)
  );

  const project = (point) => ({
    x: width / 2 + (point.x - (minX + maxX) / 2) * scale,
    y: height / 2 + (point.y - (minY + maxY) / 2) * scale,
  });

  const rectangles = source.map((rectangle) => {
    const origin = project(rectangle);

    return {
      ...rectangle,
      x: origin.x,
      y: origin.y,
      width: rectangle.length * scale,
      height: rectangle.width * scale,
    };
  });

    // ADDED: use the same occupied region for filling and outlining.
  const isCutoutFigure =
    parsed.figure.subtype === "rectangular_cutouts";

  const sourceFillCells = [];
  const sourceBoundary = buildBoundary(source, sourceFillCells);
  // ADDED: visible edges used to choose meaningful label positions.
const visibleBoundary = sourceBoundary.map((edge) => ({
  start: project(edge.start),
  end: project(edge.end),
}));

  const fillRects = sourceFillCells.map((cell, index) => {
    const origin = project(cell);

    return {
      id: `fill-${index}`,
      x: origin.x,
      y: origin.y,
      width: cell.length * scale,
      height: cell.width * scale,
    };
  });

  // Cutout space is empty, so it must not count as a shape collision.
  const collisionRectangles = isCutoutFigure
    ? fillRects
    : rectangles;

  const byId = new Map(rectangles.map((r) => [r.id, r]));
  const labels = [];
  const occupied = [];
  const dimensionGuides = [];

  const orderedDimensions = [...parsed.dimensions].sort((a, b) => {
      const priority = (dimension) => {
        const rectangle = byId.get(dimension.rectangleId);

        if (dimension.role === "length") {
          return 100000 + rectangle.width;
        }

        if (dimension.role === "width") {
          return 10000 + rectangle.height;
        }

        return 0;
      };

      return priority(b) - priority(a);
    });

    orderedDimensions.forEach((dimension) => {
    const rectangle = byId.get(dimension.rectangleId);
    if (!rectangle) return;

    const text = dimension.label;
    if (!isCutoutFigure && dimension.role === "length") {
      const epsilon = 0.5;

      const edgeTouchesAnotherRectangle = (edgeY, side) =>
        rectangles.some((other) => {
          if (other.id === rectangle.id) return false;

          const adjacentY =
            side === "top"
              ? other.y + other.height
              : other.y;

          const sharedWidth =
            Math.min(
              rectangle.x + rectangle.width,
              other.x + other.width
            ) - Math.max(rectangle.x, other.x);

          return (
            Math.abs(adjacentY - edgeY) < epsilon &&
            sharedWidth > epsilon
          );
        });

      const topBlocked = edgeTouchesAnotherRectangle(
        rectangle.y,
        "top"
      );

      const bottomBlocked = edgeTouchesAnotherRectangle(
        rectangle.y + rectangle.height,
        "bottom"
      );

      // Only enclosed horizontal dimensions go inside.
      if (topBlocked && bottomBlocked) {
        const midX = rectangle.x + rectangle.width / 2;
        const midY = rectangle.y + rectangle.height / 2;

        const textY = midY - fontSize * 0.5;
        const guideY = midY + fontSize * 0.7;

        labels.push({
          id: dimension.id,
          text,
          x: midX,
          y: textY,
        });



       dimensionGuides.push({
          id: dimension.id,
          start: {
            x: rectangle.x,
            y: guideY,
          },
          end: {
            x: rectangle.x + rectangle.width,
            y: guideY,
          },
        });

        occupied.push({
          x: rectangle.x,
          y: textY - fontSize,
          width: rectangle.width,
          height: fontSize * 2,
        });

        return;
      }
    }

    // Initial bounds for placement. Renderer measures actual text.
    const plain = text
      .replace(/\\(?:text|mathrm)\{([^}]*)\}/g, "$1")
      .replace(/\\[a-zA-Z]+/g, "M")
      .replace(/[$_{}^]/g, "");

    const boxWidth = Math.min(
      width - 8,
      Math.max(fontSize * 3, plain.length * fontSize * 0.7 + 8)
    );

    const boxHeight = fontSize * 2;
    const candidates = [];

    const addCandidate = (x, y, start, end, horizontal) => {
      const box = {
        x: x - boxWidth / 2,
        y: y - boxHeight / 2,
        width: boxWidth,
        height: boxHeight,
      };

      const outside =
        box.x < 4 ||
        box.y < 4 ||
        box.x + box.width > width - 4 ||
        box.y + box.height > height - 4;

      const shapeCollisions = collisionRectangles.filter(
        (r) => overlap(box, r)
      ).length;

      const labelCollisions = occupied.filter(
        (other) => overlap(box, other)
      ).length;

      let guideCollisions = 0;

      if (start && end) {
      const guideOffset = fontSize * 0.65;

      if (horizontal) {
          const guideY =
          y < start.y ? y + guideOffset : y - guideOffset;

          guideCollisions = collisionRectangles.filter((r) =>
          guideY > r.y + 0.5 &&
          guideY < r.y + r.height - 0.5 &&
          Math.min(end.x, r.x + r.width) -
              Math.max(start.x, r.x) > 0.5
          ).length;
      } else {
          const guideX =
          x < start.x
              ? x + boxWidth / 2 + guideOffset * 0.4
              : x - boxWidth / 2 - guideOffset * 0.4;

          guideCollisions = collisionRectangles.filter((r) =>
          guideX > r.x + 0.5 &&
          guideX < r.x + r.width - 0.5 &&
          Math.min(end.y, r.y + r.height) -
              Math.max(start.y, r.y) > 0.5
          ).length;
      }
      }

      const guideOffset = fontSize * 0.65;

  let extensionDistance = 0;

  if (start && end) {
    if (horizontal) {
      const guideY =
        y < start.y ? y + guideOffset : y - guideOffset;

      extensionDistance = Math.abs(guideY - start.y);
    } else {
      const guideX =
        x < start.x
          ? x + boxWidth / 2 + guideOffset * 0.4
          : x - boxWidth / 2 - guideOffset * 0.4;

      extensionDistance = Math.abs(guideX - start.x);
    }
  }

  // ADDED: prefer measurement edges present on the actual outline.
let missingEdgePenalty = 0;
let guideConflictPenalty = 0;

if (start && end) {
  const epsilon = 0.75;

  const low = horizontal
    ? Math.min(start.x, end.x)
    : Math.min(start.y, end.y);

  const high = horizontal
    ? Math.max(start.x, end.x)
    : Math.max(start.y, end.y);

  const edgeCoordinate = horizontal ? start.y : start.x;
  const span = high - low;

  const coveredLength = visibleBoundary.reduce((sum, edge) => {
    const matchingDirection = horizontal
      ? Math.abs(edge.start.y - edge.end.y) < epsilon
      : Math.abs(edge.start.x - edge.end.x) < epsilon;

    const coordinate = horizontal ? edge.start.y : edge.start.x;

    if (
      !matchingDirection ||
      Math.abs(coordinate - edgeCoordinate) > epsilon
    ) {
      return sum;
    }

    const edgeLow = horizontal
      ? Math.min(edge.start.x, edge.end.x)
      : Math.min(edge.start.y, edge.end.y);

    const edgeHigh = horizontal
      ? Math.max(edge.start.x, edge.end.x)
      : Math.max(edge.start.y, edge.end.y);

    return sum + Math.max(
      0,
      Math.min(high, edgeHigh) - Math.max(low, edgeLow)
    );
  }, 0);

  if (span > epsilon) {
    missingEdgePenalty =
      300 * (1 - Math.min(1, coveredLength / span));
  }

  // Match the same guide position used when rendering.
  const guideOffset = fontSize * 0.65;

  const guideCoordinate = horizontal
    ? (
        y < start.y
          ? y + guideOffset
          : y - guideOffset
      )
    : (
        x < start.x
          ? x + boxWidth / 2 + guideOffset * 0.4
          : x - boxWidth / 2 - guideOffset * 0.4
      );

  for (const guide of dimensionGuides) {
    const otherHorizontal =
      Math.abs(guide.start.y - guide.end.y) < epsilon;

    if (horizontal !== otherHorizontal) continue;

    const otherCoordinate = horizontal
      ? guide.start.y
      : guide.start.x;

    const otherLow = horizontal
      ? Math.min(guide.start.x, guide.end.x)
      : Math.min(guide.start.y, guide.end.y);

    const otherHigh = horizontal
      ? Math.max(guide.start.x, guide.end.x)
      : Math.max(guide.start.y, guide.end.y);

    const sharedSpan =
      Math.min(high, otherHigh) - Math.max(low, otherLow);

    if (
      sharedSpan > epsilon &&
      Math.abs(guideCoordinate - otherCoordinate) < fontSize * 2
    ) {
      guideConflictPenalty += 600;
    }
  }
}
      
      candidates.push({
        x,
        y,
        box,
        start,
        end,
        horizontal,
        score:
          (outside ? 10000 : 0) +
          labelCollisions * 2000 +
          guideCollisions * 1000 +
          shapeCollisions * 1000 +
          missingEdgePenalty +
          guideConflictPenalty +
          extensionDistance / fontSize,
      });
    };

    if (dimension.role === "area") {
      addCandidate(
        rectangle.x + rectangle.width / 2,
        rectangle.y + rectangle.height / 2
      );
    } else {
      for (const multiplier of [1.5, 3, 4.5]) {
        const gap = fontSize * multiplier;

        if (dimension.role === "length") {
          const midX = rectangle.x + rectangle.width / 2;

          addCandidate(
            midX,
            rectangle.y - gap,
            { x: rectangle.x, y: rectangle.y },
            { x: rectangle.x + rectangle.width, y: rectangle.y },
            true
          );

          addCandidate(
            midX,
            rectangle.y + rectangle.height + gap,
            { x: rectangle.x, y: rectangle.y + rectangle.height },
            {
              x: rectangle.x + rectangle.width,
              y: rectangle.y + rectangle.height,
            },
            true
          );
        } else {
          const midY = rectangle.y + rectangle.height / 2;

          addCandidate(
            rectangle.x - gap - boxWidth / 2,
            midY,
            { x: rectangle.x, y: rectangle.y },
            { x: rectangle.x, y: rectangle.y + rectangle.height },
            false
          );

          addCandidate(
            rectangle.x + rectangle.width + gap + boxWidth / 2,
            midY,
            { x: rectangle.x + rectangle.width, y: rectangle.y },
            {
              x: rectangle.x + rectangle.width,
              y: rectangle.y + rectangle.height,
            },
            false
          );
        }
      }
    }

    if (dimension.role === "length") {
        const figureTop = Math.min(...rectangles.map((r) => r.y));
        const figureBottom = Math.max(
            ...rectangles.map((r) => r.y + r.height)
        );

        const midX = rectangle.x + rectangle.width / 2;

        for (const multiplier of [1, 1.8, 2.6]) {
            const gap = fontSize * multiplier;

            addCandidate(
            midX,
            figureTop - gap,
            { x: rectangle.x, y: rectangle.y },
            { x: rectangle.x + rectangle.width, y: rectangle.y },
            true
            );

            addCandidate(
            midX,
            figureBottom + gap,
            { x: rectangle.x, y: rectangle.y + rectangle.height },
            {
                x: rectangle.x + rectangle.width,
                y: rectangle.y + rectangle.height,
            },
            true
            );
        }
        }
    
      if (dimension.role === "width") {
        const figureLeft = Math.min(...rectangles.map((r) => r.x));
        const figureRight = Math.max(
          ...rectangles.map((r) => r.x + r.width)
        );

        const top = rectangle.y;
        const bottom = rectangle.y + rectangle.height;
        const midY = (top + bottom) / 2;

        for (const multiplier of [1.5, 3, 4.5]) {
          const gap = fontSize * multiplier;

          addCandidate(
            figureLeft - gap - boxWidth / 2,
            midY,
            { x: rectangle.x, y: top },
            { x: rectangle.x, y: bottom },
            false
          );

          addCandidate(
            figureRight + gap + boxWidth / 2,
            midY,
            { x: rectangle.x + rectangle.width, y: top },
            { x: rectangle.x + rectangle.width, y: bottom },
            false
          );
        }
      }

    // ADDED: a cutout's dimensions can sit in its empty space,
// beside the actual inner boundary.
if (rectangle.isCutout) {
  const left = rectangle.x;
  const right = left + rectangle.width;
  const top = rectangle.y;
  const bottom = top + rectangle.height;

  if (dimension.role === "length") {
    const midX = (left + right) / 2;

    for (const multiplier of [1.5, 2.5]) {
      const gap = fontSize * multiplier;

      // Keep the label box inside the opening.
      if (rectangle.height < gap + boxHeight / 2) continue;
      if (rectangle.width < boxWidth) continue;

      addCandidate(
        midX,
        top + gap,
        { x: left, y: top },
        { x: right, y: top },
        true
      );

      addCandidate(
        midX,
        bottom - gap,
        { x: left, y: bottom },
        { x: right, y: bottom },
        true
      );
    }
  }

  if (dimension.role === "width") {
    const midY = (top + bottom) / 2;

    for (const multiplier of [0.8, 1.5]) {
      const gap = fontSize * multiplier;

      if (rectangle.width < gap + boxWidth) continue;
      if (rectangle.height < boxHeight) continue;

      addCandidate(
        left + gap + boxWidth / 2,
        midY,
        { x: left, y: top },
        { x: left, y: bottom },
        false
      );

      addCandidate(
        right - gap - boxWidth / 2,
        midY,
        { x: right, y: top },
        { x: right, y: bottom },
        false
      );
    }
  }
}
    candidates.sort((a, b) => a.score - b.score);
let chosen = candidates[0];

// ADDED: prefer the strip immediately above an enclosed cutout
// for its horizontal dimension, when the label fits safely.
if (rectangle.isCutout && dimension.role === "length") {
  const outer = rectangles.find((r) => !r.isCutout);
  const clearance = fontSize * 0.35;

  const fullyEnclosed =
    outer &&
    rectangle.x > outer.x &&
    rectangle.y > outer.y &&
    rectangle.x + rectangle.width < outer.x + outer.width &&
    rectangle.y + rectangle.height < outer.y + outer.height;

  if (fullyEnclosed) {
    const aboveCutout = candidates
      .filter((candidate) => {
        if (
          !candidate.horizontal ||
          !candidate.start ||
          Math.abs(candidate.start.y - rectangle.y) > 0.5 ||
          candidate.y >= rectangle.y
        ) {
          return false;
        }

        const box = candidate.box;

        return (
          // Entire label fits within the upper strip.
          box.x >= outer.x + clearance &&
          box.x + box.width <= outer.x + outer.width - clearance &&
          box.y >= outer.y + clearance &&
          box.y + box.height <= rectangle.y - clearance &&

          // Also stays inside the SVG.
          box.x >= 4 &&
          box.y >= 4 &&
          box.x + box.width <= width - 4 &&
          box.y + box.height <= height - 4 &&

          // Avoid previously placed labels.
          !occupied.some((other) => overlap(box, other)) &&

          // Avoid other cutouts in the same strip.
          !rectangles.some(
            (other) =>
              other.isCutout &&
              other.id !== rectangle.id &&
              overlap(box, other)
          ) &&

          // Avoid existing measurement bars around the label.
          !dimensionGuides.some((guide) =>
            overlap(box, {
              x: Math.min(guide.start.x, guide.end.x) - clearance,
              y: Math.min(guide.start.y, guide.end.y) - clearance,
              width:
                Math.abs(guide.end.x - guide.start.x) + clearance * 2,
              height:
                Math.abs(guide.end.y - guide.start.y) + clearance * 2,
            })
          )
        );
      })
      // Choose the position closest to the cutout's top edge.
      .sort((a, b) => b.y - a.y)[0];

    if (aboveCutout) chosen = aboveCutout;
  }
}

if (!chosen) return;

    occupied.push(chosen.box);

    labels.push({
      id: dimension.id,
      text,
      x: chosen.x,
      y: chosen.y,
    });

    if (chosen.start && chosen.end) {
      const guideOffset = fontSize * 0.65;

      const guideStart = chosen.horizontal
        ? {
            x: chosen.start.x,
            y:
              chosen.y < chosen.start.y
                ? chosen.y + guideOffset
                : chosen.y - guideOffset,
          }
        : {
            x:
              chosen.x < chosen.start.x
                ? chosen.x + boxWidth / 2 + guideOffset * 0.4
                : chosen.x - boxWidth / 2 - guideOffset * 0.4,
            y: chosen.start.y,
          };

      const guideEnd = chosen.horizontal
        ? { x: chosen.end.x, y: guideStart.y }
        : { x: guideStart.x, y: chosen.end.y };

      dimensionGuides.push({
        id: dimension.id,
        start: guideStart,
        end: guideEnd,
        extensionStart: chosen.start,
        extensionEnd: chosen.end,
      });
    }
  });

    return {
    ...dimensions,
    figure: parsed.figure,
    rectangles,
    fillRects,
    labels,
    dimensionGuides,
    boundary: sourceBoundary.map((edge) => ({
      start: project(edge.start),
      end: project(edge.end),
    })),
  };
}