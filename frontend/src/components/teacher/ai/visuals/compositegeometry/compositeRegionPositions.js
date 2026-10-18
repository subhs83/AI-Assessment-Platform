import { getSvgDimensions } from "../geometry/geometryHelpers";

export function calculateCompositeRegionPositions({
  parsed,
  isMobile = false,
}) {
  if (!parsed?.valid || !parsed.regionKind) return null;

  const svg = getSvgDimensions(isMobile);
  const { width, height, fontSize, paddingX, paddingY } = svg;

  const grid = parsed.regionKind === "grid";
  // ADDED: larger text only for partitioned rectangles.
    const partitionFontSize = fontSize * 1.15;

  // Grid positions use cell indices; physical cell size is a label.
  const source = grid
    ? parsed.cells.map((cell) => ({
        id: cell.id,
        x: cell.column,
        y: cell.row,
        length: 1,
        width: 1,
      }))
    : parsed.rectangles;

  const minX = Math.min(...source.map((r) => r.x));
  const maxX = Math.max(...source.map((r) => r.x + r.length));
  const minY = Math.min(...source.map((r) => r.y));
  const maxY = Math.max(...source.map((r) => r.y + r.width));

  const marginX = Math.max(paddingX, fontSize * 3.5);
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
  const labels = [];
  const dimensionGuides = [];

  if (grid) {
    // Record each cell edge once. Shared edges are grid lines;
    // edges used once form the region boundary.
    const edgeMap = new Map();

    const addEdge = (x1, y1, x2, y2) => {
      const key = `${x1},${y1}:${x2},${y2}`;
      const existing = edgeMap.get(key);

      if (existing) {
        existing.count += 1;
      } else {
        edgeMap.set(key, {
          start: project(x1, y1),
          end: project(x2, y2),
          count: 1,
        });
      }
    };

    for (const cell of source) {
      const x = cell.x;
      const y = cell.y;

      addEdge(x, y, x + 1, y);
      addEdge(x, y + 1, x + 1, y + 1);
      addEdge(x, y, x, y + 1);
      addEdge(x + 1, y, x + 1, y + 1);
    }

    // Select a cell in the topmost row for the size annotation.
    const firstCell = [...source].sort(
      (a, b) => a.y - b.y || a.x - b.x
    )[0];

    const cell = byId.get(firstCell.id);
    const guideY = cell.y - fontSize * 0.7;

    dimensionGuides.push({
      id: "cell-size",
      start: { x: cell.x, y: guideY },
      end: { x: cell.x + cell.width, y: guideY },
    });

    labels.push({
      id: "cell-size",
      text: `${parsed.figure.cell_size} ${parsed.figure.unit}`,
      x: cell.x + cell.width / 2,
      y: guideY - fontSize * 1.2,
    });

    return {
      ...svg,
      figure: parsed.figure,
      regionKind: "grid",
      rectangles,
      gridEdges: [...edgeMap.values()],
      labels,
      dimensionGuides,
    };
  }

  const outer = byId.get(parsed.outerId);
  const parts = parsed.partIds.map((id) => byId.get(id));

  // Display each part's name and supplied area as separate lines.
  // Never print construction dimensions automatically.
  for (const rectangle of rectangles) {
    const area = parsed.dimensions.find(
      (d) => d.rectangleId === rectangle.id && d.role === "area"
    );

    const isPart = parsed.partIds.includes(rectangle.id);
    const name = isPart ? rectangle.label?.trim() : "";

    if (name) {
      labels.push({
        id: `name-${rectangle.id}`,
        text: name,
        x: rectangle.x + rectangle.width / 2,
        y:
          rectangle.y + rectangle.height / 2 -
          (area ? partitionFontSize * 0.95 : 0)
      });
    }

    if (area) {
      labels.push({
        id: area.id,
        text: area.label,
        x: rectangle.x + rectangle.width / 2,
        y:
          rectangle.y + rectangle.height / 2 +
          (name ? partitionFontSize * 0.95 : 0)
      });
    }
  }

  // Optional supplied lengths/widths: label the actual rectangle span.
  // Candidate scoring avoids placing label boxes over the diagram.
  const occupied = labels.map((label) => ({
    x: label.x - fontSize * 3,
    y: label.y - fontSize,
    width: fontSize * 6,
    height: fontSize * 2,
  }));

  const overlaps = (a, b) =>
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;

  for (const dimension of parsed.dimensions) {
    if (dimension.role === "area") continue;

    const r = byId.get(dimension.rectangleId);
    const horizontal = dimension.role === "length";
    const boxWidth = Math.max(
      fontSize * 3,
      dimension.label.length * fontSize * 0.65
    );
    const boxHeight = fontSize * 2;
    const candidates = [];

    const add = (guide, x, y, distance) => {
      const box = {
        x: x - boxWidth / 2,
        y: y - boxHeight / 2,
        width: boxWidth,
        height: boxHeight,
      };

      const outside =
        box.x < 0 ||
        box.y < 0 ||
        box.x + box.width > width ||
        box.y + box.height > height;

      candidates.push({
        guide,
        x,
        y,
        box,
        score:
          (outside ? 10000 : 0) +
          occupied.filter((other) => overlaps(box, other)).length * 2000 +
          (overlaps(box, outer) ? 1000 : 0) +
          distance,
      });
    };

    for (const multiplier of [1, 2.5]) {
      const gap = fontSize * multiplier;

      if (horizontal) {
        for (const side of ["top", "bottom"]) {
          const edgeY = side === "top" ? outer.y : outer.y + outer.height;
          const sign = side === "top" ? -1 : 1;
          const guideY = edgeY + sign * gap;

          add(
            {
              start: { x: r.x, y: guideY },
              end: { x: r.x + r.width, y: guideY },
            },
            r.x + r.width / 2,
            guideY + sign * fontSize * 1.2,
            Math.abs(guideY - (side === "top" ? r.y : r.y + r.height))
          );
        }
      } else {
        for (const side of ["left", "right"]) {
          const edgeX = side === "left" ? outer.x : outer.x + outer.width;
          const sign = side === "left" ? -1 : 1;
          const guideX = edgeX + sign * gap;

          add(
            {
              start: { x: guideX, y: r.y },
              end: { x: guideX, y: r.y + r.height },
            },
            guideX + sign * (boxWidth / 2 + fontSize * 0.4),
            r.y + r.height / 2,
            Math.abs(guideX - (side === "left" ? r.x : r.x + r.width))
          );
        }
      }
    }

    candidates.sort((a, b) => a.score - b.score);
    const chosen = candidates[0];

    occupied.push(chosen.box);
    labels.push({
      id: dimension.id,
      text: dimension.label,
      x: chosen.x,
      y: chosen.y,
    });
    dimensionGuides.push({
      id: dimension.id,
      ...chosen.guide,
    });
  }

 return {
    ...svg,
    fontSize: partitionFontSize, // ADDED
    figure: parsed.figure,
    regionKind: "partition",
    outer,
    parts,
    labels,
    dimensionGuides,
   };
}