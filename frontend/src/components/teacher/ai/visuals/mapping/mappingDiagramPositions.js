// mapping/mappingDiagramPositions.js

import { getSvgDimensions } from "../geometry/geometryHelpers";

export function calculateMappingDiagramPositions({
  parsed,
  isMobile = false,
}) {
  if (!parsed?.valid) return null;

  const svg = getSvgDimensions(isMobile);
  const {
    width,
    height,
    paddingX,
    paddingY,
    fontSize,
  } = svg;

  if (
    ![width, height, paddingX, paddingY, fontSize].every(
      Number.isFinite
    ) ||
    width <= 0 ||
    height <= 0 ||
    fontSize <= 0
  ) {
    return null;
  }

  // ------------------------------------------
  // 1. Reserve space for set titles and labels.
  // ------------------------------------------
  const marginX = Math.max(paddingX, fontSize);
  const marginY = Math.max(paddingY, fontSize);

  const titleHeight = fontSize * 2;
  const titleGap = fontSize * 0.5;

  const bodyTop = marginY + titleHeight + titleGap;
  const bodyBottom = height - marginY;

  const availableWidth = width - marginX * 2;
  const bodyHeight = bodyBottom - bodyTop;

  if (
    availableWidth <= 0 ||
    bodyHeight <= fontSize * 3
  ) {
    return null;
  }

  // Set enclosures take 27% each; the middle holds the arrows.
  const setWidth = availableWidth * 0.27;
  const setRadiusX = setWidth / 2;
  const setRadiusY = bodyHeight / 2;
  const centerY = bodyTop + setRadiusY;

  const leftX = marginX + setRadiusX;
  const rightX = width - marginX - setRadiusX;

  const memberLabelHeight = fontSize * 1.8;
  const pointRadius = Math.max(2, fontSize * 0.14);
  const labelGap = fontSize * 0.35;

  // Keep members near the middle of each oval, away from its tips.
  const memberHalfSpan = setRadiusY * 0.6;

  // ------------------------------------------
  // 2. Position members and their labels.
  // ------------------------------------------
  function positionSet(set, side, centerX) {
    const count = set.members.length;

    const rows = set.members.map((member, index) => {
      const y =
        count === 1
          ? centerY
          : centerY -
            memberHalfSpan +
            (2 * memberHalfSpan * index) / (count - 1);

      // All arrows attach to dots on the inward side of each set.
      const x =
        centerX +
        (side === "source" ? 1 : -1) * setRadiusX * 0.4;

      // Available horizontal radius of the oval at this row.
      const relativeY = (y - centerY) / setRadiusY;

      const rowRadius =
        setRadiusX *
        Math.sqrt(Math.max(0, 1 - relativeY * relativeY));

      const innerPadding = fontSize * 0.25;

      const labelLeft =
        side === "source"
          ? centerX - rowRadius + innerPadding
          : x + pointRadius + labelGap;

      const labelRight =
        side === "source"
          ? x - pointRadius - labelGap
          : centerX + rowRadius - innerPadding;

      return {
        ...member,
        x,
        y,
        pointRadius,

        // Renderer uses these as a MathText foreignObject box.
        labelBox: {
          x: labelLeft,
          y: y - memberLabelHeight / 2,
          width: Math.max(0, labelRight - labelLeft),
          height: memberLabelHeight,
          align: side === "source" ? "right" : "left",
        },
      };
    });

    return {
      id: set.id,
      label: set.label,
      side,
      cx: centerX,
      cy: centerY,
      rx: setRadiusX,
      ry: setRadiusY,

      titleBox: {
        x: centerX - setWidth / 2,
        y: marginY,
        width: setWidth,
        height: titleHeight,
      },

      members: rows,
    };
  }

  const sourceSet = positionSet(
    parsed.sourceSet,
    "source",
    leftX
  );

  const targetSet = positionSet(
    parsed.targetSet,
    "target",
    rightX
  );

  const allMembers = [
    ...sourceSet.members,
    ...targetSet.members,
  ];

  if (
    allMembers.some(
      (member) => member.labelBox.width <= 0
    )
  ) {
    return null;
  }

  const sourceById = new Map(
    sourceSet.members.map((member) => [member.id, member])
  );

  const targetById = new Map(
    targetSet.members.map((member) => [member.id, member])
  );

  // ------------------------------------------
  // 3. Group arrows to distribute their ports.
  // ------------------------------------------
  const outgoing = new Map(
    sourceSet.members.map((member) => [member.id, []])
  );

  const incoming = new Map(
    targetSet.members.map((member) => [member.id, []])
  );

  for (const arrow of parsed.arrows) {
    if (
      !sourceById.has(arrow.sourceId) ||
      !targetById.has(arrow.targetId)
    ) {
      return null;
    }

    outgoing.get(arrow.sourceId).push(arrow);
    incoming.get(arrow.targetId).push(arrow);
  }

  // Sort by the other endpoint's vertical position, keeping
  // each fan of arrows in a predictable order.
  for (const group of outgoing.values()) {
    group.sort(
      (a, b) =>
        targetById.get(a.targetId).y -
        targetById.get(b.targetId).y
    );
  }

  for (const group of incoming.values()) {
    group.sort(
      (a, b) =>
        sourceById.get(a.sourceId).y -
        sourceById.get(b.sourceId).y
    );
  }

  function portAngle(group, arrowId) {
    if (group.length <= 1) return 0;

    const index = group.findIndex(
      (arrow) => arrow.id === arrowId
    );

    // Spread connections over an inward-facing 90-degree arc.
    return (
      -Math.PI / 4 +
      (index / (group.length - 1)) * (Math.PI / 2)
    );
  }

  // ------------------------------------------
  // 4. Build smooth left-to-right arrow paths.
  // ------------------------------------------
  const portRadius = pointRadius + fontSize * 0.15;

  const arrows = parsed.arrows.map((arrow) => {
    const source = sourceById.get(arrow.sourceId);
    const target = targetById.get(arrow.targetId);

    const sourceAngle = portAngle(
      outgoing.get(source.id),
      arrow.id
    );

    const targetAngle = portAngle(
      incoming.get(target.id),
      arrow.id
    );

    const start = {
      x: source.x + Math.cos(sourceAngle) * portRadius,
      y: source.y + Math.sin(sourceAngle) * portRadius,
    };

    const end = {
      x: target.x - Math.cos(targetAngle) * portRadius,
      y: target.y + Math.sin(targetAngle) * portRadius,
    };

    const controlOffset = (end.x - start.x) * 0.38;

    return {
      ...arrow,
      start,
      end,
      path: [
        `M ${start.x} ${start.y}`,
        `C ${start.x + controlOffset} ${start.y}`,
        `${end.x - controlOffset} ${end.y}`,
        `${end.x} ${end.y}`,
      ].join(" "),
    };
  });

  return {
    ...svg,
    figure: { ...parsed.figure },
    sourceSet,
    targetSet,
    arrows,
  };
}