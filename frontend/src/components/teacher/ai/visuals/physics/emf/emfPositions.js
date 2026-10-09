
import { getSvgDimensions } from "../../geometry/geometryHelpers";
import {getFieldDirection} from "./emfHelpers"
 
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
  const magnetWidth = isMobile ? 90 : 110;
  const magnetHeight = isMobile ? 22 : 26;

  const availableHalfWidth = SVG_WIDTH / 2 - paddingX;
  const availableHalfHeight = cy - paddingY;
  const loopCount = 3;

  const pointEls = elements.filter((el) => el.type === "point");
  const poleClearance = isMobile ? 16 : 22;

  const screenLongHalf = magnetWidth / 2;
  const screenShortHalf = magnetHeight / 2;
  const xClearanceScale = (horizontal ? screenLongHalf : screenShortHalf) + poleClearance;
  const yClearanceScale = (horizontal ? screenShortHalf : screenLongHalf) + poleClearance;

  const points = pointEls.map((p) => {
    const rawX = p.x_position ?? 0;
    const rawY = p.y_position ?? 0;
    // Each point's own raw screen offset, using the pole-clearance scale —
    // NOT divided down by how far away some other point happens to be.
    let px = cx + rawX * xClearanceScale;
    let py = cy - rawY * yClearanceScale;
    // Clamp only THIS point to the canvas, independently, if it runs past
    // the edge — this never touches any other point's placement.
    px = Math.max(paddingX + 10, Math.min(SVG_WIDTH - paddingX - 10, px));
    py = Math.max(paddingY + 10, Math.min(SVG_HEIGHT - paddingY - 10, py));
    return { id: p.id, label: p.label, x: px, y: py };
  });

  return { cx, cy, magnetWidth, magnetHeight, horizontal, loopCount, availableHalfWidth, availableHalfHeight, points };
}

export function calculateCurrentWirePositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX } = getSvgDimensions(isMobile);
  const wireEl = elements.find((el) => el.type === "current_wire");
  const pointEl = elements.find((el) => el.type === "point");
  const segmentEl = elements.find((el) => el.type === "segment");

  const horizontal = wireEl?.orientation === "horizontal";
  const dirRaw = wireEl?.current_direction;
  
  const cx = SVG_WIDTH * 0.38;
  const cy = SVG_HEIGHT / 2;
  const wireHalfLength = Math.min(SVG_HEIGHT, SVG_WIDTH) * 0.32;

  // Scale the point's data-space x_position into pixels — bounded so it
  // never runs past the canvas regardless of the given value.
  const rawX = pointEl?.x_position ?? 1;
  const rawY = pointEl?.y_position ?? 0;
  const availableSideX = rawX < 0 ? cx - paddingX : SVG_WIDTH - paddingX - cx;
  const availableSideY = cy - 20;
  const scale = Math.min(
    availableSideX / Math.max(Math.abs(rawX), 1),
    rawY !== 0 ? availableSideY / Math.abs(rawY) : Infinity,
    90
  );
  const pointX = cx + rawX * scale;
  const pointY = cy - rawY * scale; // SVG y points down, so "above" needs a minus

  const currentDirection = horizontal ? (dirRaw === "left" ? "left" : "right") : (dirRaw === "down" ? "down" : "up");

  return {
    cx, cy, wireHalfLength, horizontal,
    currentLabel: wireEl?.label,
    point: pointEl ? { x: pointX, y: pointY, label: pointEl.label || "P" } : null,
    segmentLabel: segmentEl?.label, currentDirection,
  };
}

export function calculateCurrentLoopPositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const loopEl = elements.find((el) => el.type === "current_loop");
  const centerEl = elements.find((el) => el.type === "point");

  return {
    cx: SVG_WIDTH / 2,
    cy: SVG_HEIGHT / 2,
    radius: Math.min(SVG_WIDTH, SVG_HEIGHT) * 0.28,
    currentDirection: loopEl?.current_direction || "clockwise",
    loopLabel: loopEl?.label,
    centerLabel: centerEl?.label || "Center",
  };
}

export function calculateSolenoidPositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const el = elements.find((e) => e.type === "solenoid");
  const horizontal = el?.orientation !== "vertical";
  const turns = Math.min(Math.max(el?.turns || 6, 3), 10);

  const cx = SVG_WIDTH / 2;
  const cy = SVG_HEIGHT / 2;
  const coilLength = Math.min(SVG_WIDTH, SVG_HEIGHT) * (isMobile ? 0.75 : 0.8);
  const coilRadius = Math.min(SVG_WIDTH, SVG_HEIGHT) * 0.25;

  return { cx, cy, coilLength, coilRadius, turns, horizontal };
}

export function calculateMovingChargePositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const chargeEl = elements.find((el) => el.type === "moving_charge");
  const vectorEl = elements.find((el) => el.type === "vector");
  const fieldDirection= getFieldDirection(elements)

  return {
    fieldWidth: SVG_WIDTH,
    fieldHeight: SVG_HEIGHT,
    cx: SVG_WIDTH / 2,
    cy: SVG_HEIGHT / 2,
    chargeSign: chargeEl?.charge_type === "negative" ? -1 : 1,
    chargeLabel: chargeEl?.label,
    vectorAngle: vectorEl?.angle ?? 0,
    vectorLength: { small: 30, medium: 60, large: 75 }[vectorEl?.length] || 60,
    vectorLabel: vectorEl?.label,
    fieldDirection,
  };
}

export function calculateWireForcePositions({ elements, isMobile = false }) {
  const base = calculateCurrentWirePositions({ elements, isMobile }); // reuse existing wire-position logic
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const fieldDirection= getFieldDirection(elements)
  return { ...base, fieldWidth: SVG_WIDTH, fieldHeight: SVG_HEIGHT, fieldDirection, };
}

