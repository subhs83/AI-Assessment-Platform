
import { getSvgDimensions } from "../../geometry/geometryHelpers";
// calculatePointChargePositions.js

// calculatePointChargePositions — add label to the returned plane object
export function calculatePointChargePositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const cx = SVG_WIDTH / 2;
  const cy = SVG_HEIGHT / 2;
  const chargeRadius = isMobile ? 18 : 20;
  const fieldLineOuterR = Math.min(SVG_WIDTH, SVG_HEIGHT) * 0.42;
  const lineCount = 8;

  const chargeEl = elements.find((el) => el.type === "charge");
  const charge = chargeEl?.charge_type === "negative" ? -1 : 1;
  const label = chargeEl?.label || "Q"; // NEW

  const angles = Array.from({ length: lineCount }, (_, i) => (360 / lineCount) * i);

  return { cx, cy, chargeRadius, fieldLineOuterR, angles, charge, label }; // label added here
}

// electricFieldTwoCharge.js

export function calculateTwoChargePositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const cy = SVG_HEIGHT / 2;
  const separation = isMobile ? 140 : 200;
  const cxA = SVG_WIDTH / 2 - separation / 2;
  const cxB = SVG_WIDTH / 2 + separation / 2;

  const chargeEls = elements.filter((el) => el.type === "charge" || el.type === "point_charge"); // accept both naming variants
  const a = chargeEls[0];
  const b = chargeEls[1];

  const magRank = (m) => (m === "stronger" ? 2 : m === "weaker" ? 1 : 1.5); // default mid-rank if unspecified

  return {
    a: { ...a, cx: cxA, cy, sign: a?.charge_type === "negative" ? -1 : 1, magRank: magRank(a?.relative_magnitude) },
    b: { ...b, cx: cxB, cy, sign: b?.charge_type === "negative" ? -1 : 1, magRank: magRank(b?.relative_magnitude) },
    chargeRadius: isMobile ? 14 : 16,
  };
}
// electricFieldPlates.js

export function calculatePlatePositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);
  const plateTopY = paddingY + 20;
  const plateBottomY = SVG_HEIGHT - paddingY - 20;
  const plateLeft = paddingX + 20;
  const plateRight = SVG_WIDTH - paddingX - 20;

  const posEl = elements.find((el) => el.charge_type === "positive");
  //const negEl = elements.find((el) => el.charge_type === "negative");
  const posOnTop = posEl?.side !== "bottom";

  return { plateTopY, plateBottomY, plateLeft, plateRight, posOnTop };
}



export function calculateFieldAtPointPositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const chargeEl = elements.find((el) => el.type === "point_charge");
  const pointEl = elements.find((el) => el.type === "point");
  const vectorEl = elements.find((el) => el.type === "vector");
  const segmentEl = elements.find((el) => el.type === "segment");

  const cy = SVG_HEIGHT / 2;
  const chargeX = SVG_WIDTH * 0.22;
  const pointX = SVG_WIDTH * 0.62;
  const chargeRadius = isMobile ? 14 : 16;

  return {
    charge: { x: chargeX, y: cy, sign: chargeEl?.charge_type === "negative" ? -1 : 1, label: chargeEl?.label, radius: chargeRadius },
    point: { x: pointX, y: cy, label: pointEl?.label || "P" },
    vectorAngle: vectorEl?.angle ?? 0,
    vectorLength: { small: 30, medium: 45, large: 60 }[vectorEl?.length] || 45,
    vectorLabel: vectorEl?.label || "E",
    segmentLabel: segmentEl?.label,
  };
}


export function calculateAxisPositionsChargeLayout({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const axisEl = elements.find((el) => el.type === "axis");
  const chargeEls = elements.filter((el) => el.type === "point_charge");

  // Start from the payload's stated range (or a sane default if missing),
  // then WIDEN it if any actual charge falls outside — never trust the
  // stated min/max as an upper bound on what must be drawn.
  let min = axisEl?.min ?? -2;
  let max = axisEl?.max ?? 5;

  const chargePositions = chargeEls.map((el) => el.x_position ?? 0);
  if (chargePositions.length) {
    const dataMin = Math.min(...chargePositions);
    const dataMax = Math.max(...chargePositions);
    // Pad by 1 unit beyond the outermost charge so it's never drawn flush
    // against the axis's own end/arrowhead.
    min = Math.min(min, dataMin - 1);
    max = Math.max(max, dataMax + 1);
  }

  // Guard against a degenerate range (min === max, e.g. a single charge
  // with no stated axis bounds at all) which would divide by zero in toScreenX.
  if (max - min < 1) { min -= 2; max += 2; }

  const axisY = SVG_HEIGHT / 2;
  const paddingX = isMobile ? 30 : 40;
  const axisLeft = paddingX;
  const axisRight = SVG_WIDTH - paddingX;

  const toScreenX = (val) => axisLeft + ((val - min) / (max - min)) * (axisRight - axisLeft);

  const charges = chargeEls.map((el) => ({
    x: toScreenX(el.x_position ?? 0),
    y: axisY,
    sign: el.charge_type === "negative" ? -1 : 1,
    label: el.label,
  }));

  return { axisLeft, axisRight, axisY, toScreenX, min, max, charges, chargeRadius: isMobile ? 13 : 15 };
}


// calculateBarMagnetPositions.js

export function calculateBarMagnetPositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);
  const magnetEl = elements.find((el) => el.type === "bar_magnet");
  const horizontal = magnetEl?.pole_orientation !== "vertical";

  const cx = SVG_WIDTH / 2;
  const cy = SVG_HEIGHT / 2;
  const magnetWidth = isMobile ? 80 : 100;
  const magnetHeight = isMobile ? 20 : 24;

  const availableHalfHeight = cy - paddingY - magnetHeight / 2;
  const availableHalfWidth = SVG_WIDTH / 2 - paddingX;
  const loopCount = 3;

  return { cx, cy, magnetWidth, magnetHeight, horizontal, loopCount, availableHalfHeight, availableHalfWidth };
}



