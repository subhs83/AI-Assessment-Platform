import { getSvgDimensions,} from "../../geometry/geometryHelpers";
import {  
  angleDeg,
  midpoint,
  findByField,
  reachForElement,
  COMPONENT_REACH,
  legFor
} from "./circuitsHelpers"


// --- circuit_series ---
// calculateCircuitPositions — add labelSide flag to any element that's a tap's target

export function calculateCircuitPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);
  const margin = isMobile ? 20 : 15;
  const TAP_CLEARANCE = isMobile ? 20 : 35;

  const wireGroup = relationships.find((r) => r.type === "connected_by_wire" && r.order === "series");
  const orderedIds = wireGroup ? wireGroup.elements : elements.map((e) => e.id);

  const legFor = (p) => (p === "top" ? "top" : p === "right" || p === "far_right" ? "right" : p === "bottom" ? "bottom" : "left");

  const tapRels = relationships.filter((r) => r.type === "measures_voltage" || r.type === "measures_current");
  const shortRels = relationships.filter((r) => r.type === "shorts"); // NEW
  const tapLegs = new Set();
  const tapTargetIds = new Set(); // NEW: track which elements have a tap pointed at them
  tapRels.forEach((rel) => {
    const tapId = rel.elements[0];
    if (orderedIds.includes(tapId)) return;
    const targetEl = elements.find((e) => e.id === rel.target);
    if (targetEl) {
      tapLegs.add(legFor(targetEl.x_position));
      tapTargetIds.add(rel.target); // NEW
    }
  });

  const loopLeft = paddingX + (tapLegs.has("left") ? TAP_CLEARANCE : 0);
  const loopRight = SVG_WIDTH - paddingX - (tapLegs.has("right") ? TAP_CLEARANCE : 20);
  const loopTop = paddingY + margin + (tapLegs.has("top") ? TAP_CLEARANCE : 0);
  const loopBottom = SVG_HEIGHT - paddingY - margin - (tapLegs.has("bottom") ? TAP_CLEARANCE : 0);

  const legCounts = { top: 0, right: 0, bottom: 0, left: 0 };
  orderedIds.forEach((id) => legCounts[legFor(elements.find((e) => e.id === id)?.x_position)]++);

  const legIndex = { top: 0, right: 0, bottom: 0, left: 0 };
  const positions = {};

  orderedIds.forEach((id) => {
    const el = elements.find((e) => e.id === id);
    const leg = legFor(el?.x_position);
    const frac = (++legIndex[leg]) / (legCounts[leg] + 1);
    let x, y, rotation;
    if (leg === "top") { x = loopLeft + frac * (loopRight - loopLeft); y = loopTop; rotation = 0; }
    else if (leg === "bottom") { x = loopLeft + frac * (loopRight - loopLeft); y = loopBottom; rotation = 0; }
    else if (leg === "left") { x = loopLeft; y = loopTop + frac * (loopBottom - loopTop); rotation = 90; }
    else { x = loopRight; y = loopTop + frac * (loopBottom - loopTop); rotation = 90; }

    // NEW: flip label to inner side if this element is a tap's target
    positions[id] = { x, y, rotation, labelSide: tapTargetIds.has(id) ? "inner" : "outer" };
  });

  const TAP_OFFSET = isMobile ? 34 : 28;
  tapRels.forEach((rel) => {
    const tapId = rel.elements[0];
    if (positions[tapId]) return;
    const targetPos = positions[rel.target];
    if (!targetPos) return;
    const rad = (targetPos.rotation * Math.PI) / 180;
    const perpX = -Math.sin(rad) * TAP_OFFSET;
    const perpY = -Math.cos(rad) * TAP_OFFSET;
    positions[tapId] = {
      x: targetPos.x + perpX,
      y: targetPos.y + perpY,
      rotation: targetPos.rotation,
      isTap: true,
      tapTarget: rel.target,
      labelSide: "outer", // meter's own label still goes further outward, past itself
    };
  });

  // NEW: flip label inward for anything a "shorts" relationship targets too
  shortRels.forEach((rel) => {
    if (positions[rel.target]) tapTargetIds.add(rel.target);
  });

   tapTargetIds.forEach((id) => {
    if (positions[id]) positions[id].labelSide = "inner";
  });
  return { loopLeft, loopRight, loopTop, loopBottom, orderedIds, positions };
}

// --- circuit_parallel ---

// circuitParallel.jsx — ladder topology, all existing features preserved

export function calculateParallelCircuitPositions({ elements, relationships, isMobile = false }) {
  const { height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);
  const margin = isMobile ? 20 : 15;

  const loopLeft = paddingX;
  const loopTop = paddingY + margin;
  const loopBottom = SVG_HEIGHT - paddingY - margin;

  const seriesRel = relationships.find((r) => r.order === "series" && r.type === "connected_by_wire");
  const branchRels = relationships.filter((r) => r.order === "parallel_branch");
  const shortRels = relationships.filter((r) => r.type === "shorts");
  const seriesIds = seriesRel ? seriesRel.elements : [];

  // Same Shape A / Shape B support as before, but now grouped into
  // ordered rungGroups (array of arrays) instead of a fixed top/bottom map
  // — supports any number of parallel branches, not just two.
  const branchGroupsMap = {};
  branchRels.forEach((rel) => {
    rel.elements.forEach((id) => {
      const el = elements.find((e) => e.id === id);
      const side = rel.branch || el?.side || "top";
      if (!branchGroupsMap[side]) branchGroupsMap[side] = [];
      branchGroupsMap[side].push(id);
    });
  });
  // preserve top-before-bottom ordering when both keys exist; otherwise
  // whatever order Object.keys gives is fine since it's just visual order
  const sideOrder = Object.keys(branchGroupsMap).sort((a, b) => (a === "top" ? -1 : b === "top" ? 1 : 0));
  const rungGroups = sideOrder.map((side) => branchGroupsMap[side]);

  // NEW (ladder-specific): series-leg elements now split into "left rail"
  // (battery, anything with x_position left/unspecified) vs "top rail"
  // (everything else — R1, ammeter, etc. sitting before the rungs).
  const legFor2 = (p) => (p === "left" || !p ? "left" : "top");
  const legCounts = { top: 0, left: 0 };
  seriesIds.forEach((id) => legCounts[legFor2(elements.find((e) => e.id === id)?.x_position)]++);

  const GAP = isMobile ? 14 : 18;
  const railMargin = isMobile ? 20 : 25;
  const branchSlotWidth = isMobile ? 80 : 120;
  const splitX = loopLeft + (isMobile ? 70 : 90) * Math.max(1, legCounts.top);

  const legIndex = { top: 0, left: 0 };
  const positions = {};

  seriesIds.forEach((id) => {
    const el = elements.find((e) => e.id === id);
    const leg = legFor2(el?.x_position);
    let x, y, rotation;
    if (leg === "left") {
      const frac = (++legIndex.left) / (legCounts.left + 1);
      x = loopLeft; y = loopTop + frac * (loopBottom - loopTop); rotation = 90;
    } else {
      const frac = (++legIndex.top) / (legCounts.top + 1);
      x = loopLeft + frac * (splitX - loopLeft); y = loopTop; rotation = 0;
    }
    positions[id] = { x, y, rotation, labelSide: "outer" };
  });

  // Rungs: each parallel branch is now a VERTICAL bridge between the top
  // rail (node A) and bottom rail (node B) — preserves reachForElement
  // (so `broken` components size correctly) and multi-component branch
  // ordering (switch/open_break nearest the top, same as combination fix).
  const controlPriority = (type) => (type === "switch" || type === "open_break" ? 0 : type === "ammeter" ? 1 : 2);
  const midY = (loopTop + loopBottom) / 2;
  let lastRungCenterX = splitX;

  rungGroups.forEach((rawIds, branchIdx) => {
    const ids = [...rawIds].sort(
      (a, b) => controlPriority(elements.find((e) => e.id === a)?.type) - controlPriority(elements.find((e) => e.id === b)?.type)
    );
    const branchX = splitX + railMargin + branchIdx * branchSlotWidth + branchSlotWidth / 2;
    const reaches = ids.map((id) => reachForElement(elements.find((e) => e.id === id)));
    const totalHeight = reaches.reduce((s, r) => s + r * 2, 0) + GAP * (ids.length - 1);
    let cursor = midY - totalHeight / 2;
    ids.forEach((id, i) => {
      const r = reaches[i];
      positions[id] = { x: branchX, y: cursor + r, rotation: 90, labelSign: -1 };
      cursor += r * 2 + GAP;
    });
    if (branchX >= lastRungCenterX) lastRungCenterX = branchX;
  });

  const loopRight = rungGroups.length ? lastRungCenterX : splitX + 100;

  // Taps — preserved, now with vertical-target handling added (same as
  // combination) since rungs are vertical here too.
  const tapRels = relationships.filter((r) => r.type === "measures_voltage" || r.type === "measures_current");
  const tapTargetIds = new Set();
  const TAP_OFFSET = isMobile ? 34 : 35;
  const TAP_OFFSET_H = isMobile ? 34 : 40;
  tapRels.forEach((rel) => {
    const tapId = rel.elements[0];
    if (positions[tapId]) return;
    const targetPos = positions[rel.target];
    if (!targetPos) return;
    tapTargetIds.add(rel.target);
    const isVert = Math.abs(((targetPos.rotation % 180) + 180) % 180 - 90) < 1;
    if (isVert) {
      positions[tapId] = { x: targetPos.x - TAP_OFFSET_H, y: targetPos.y, rotation: targetPos.rotation, isTap: true, tapTarget: rel.target };
    } else {
      const rad = (targetPos.rotation * Math.PI) / 180;
      const perpX = -Math.sin(rad) * TAP_OFFSET;
      const perpY = -Math.cos(rad) * TAP_OFFSET;
      positions[tapId] = { x: targetPos.x + perpX, y: targetPos.y + perpY, rotation: targetPos.rotation, isTap: true, tapTarget: rel.target, labelSide: "outer" };
    }
  });

  // Preserved: shorts relationship still flips target label inward —
  // still relevant for horizontal (series-leg) short targets.
  shortRels.forEach((rel) => {
    if (positions[rel.target]) tapTargetIds.add(rel.target);
  });
  tapTargetIds.forEach((id) => {
    if (positions[id] && positions[id].rotation !== 90) positions[id].labelSide = "inner";
    // vertical rung targets don't need the inner flip — renderComponent's
    // isVertical branch already places labels clear of taps by design.
  });

  // Fallback: any element that was never assigned a position by a relationship
  // (e.g. an orphaned switch with no series/branch/tap link) still gets placed
  // using its own x_position, so it's visible rather than silently dropped.
  elements.forEach((el) => {
    if (positions[el.id]) return; // already positioned normally
    const leg = legFor(el.x_position);
    if (leg === "top" || leg === "left") {
      // Place it on whichever main-loop rail its x_position implies,
      // slotted in after any existing series elements on that rail.
      const existingOnLeg = seriesIds.filter((id) => positions[id]?.rotation === (leg === "left" ? 90 : 0));
      const idx = existingOnLeg.length;
      if (leg === "left") {
        const frac = (idx + 1) / (idx + 2);
        positions[el.id] = { x: loopLeft, y: loopTop + frac * (loopBottom - loopTop), rotation: 90, labelSide: "outer" };
      } else {
        const frac = (idx + 1) / (idx + 2);
        positions[el.id] = { x: loopLeft + frac * (splitX - loopLeft), y: loopTop, rotation: 0, labelSide: "outer" };
      }
    }
  });

  return { loopLeft, loopRight, loopTop, loopBottom, seriesIds, rungGroups: rungGroups.map((g) => [...g]), positions };
}





export function calculateBridgeCircuitPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);
  const usableW = SVG_WIDTH - 2 * paddingX;
  const usableH = SVG_HEIGHT - 2 * paddingY;

  const cx = SVG_WIDTH / 2;
  const cy = paddingY + usableH * 0.35;
  const halfW = usableW * 0.35;
  const halfH = usableH * 0.28;

  const N = { x: cx, y: cy - halfH };
  const S = { x: cx, y: cy + halfH };
  const W = { x: cx - halfW, y: cy };
  const E = { x: cx + halfW, y: cy };

  const outerBottomY = S.y + usableH * 0.30;
  const outerLeftTop = { x: W.x, y: W.y };
  const outerLeftBottom = { x: W.x, y: outerBottomY };
  const outerRightBottom = { x: E.x, y: outerBottomY };
  const outerRightTop = { x: E.x, y: E.y };

  const leftBranch = relationships.find((r) => r.type === "connected_by_wire" && r.branch === "left");
  const rightBranch = relationships.find((r) => r.type === "connected_by_wire" && r.branch === "right");
  const outerRel = relationships.find((r) => r.type === "connected_by_wire" && !r.branch);
  const bridgeRel = relationships.find((r) => r.type === "bridges");

  const isResistorLike = (id) => {
    const t = elements.find((e) => e.id === id)?.type;
    return t !== "battery" && t !== "switch";
  };

  const leftEls = (leftBranch?.elements || []).filter(isResistorLike);
  const rightEls = (rightBranch?.elements || []).filter(isResistorLike);

  const leftTopId = findByField(leftEls, elements, "x_position", "top");
  const leftBottomId = findByField(leftEls, elements, "x_position", "bottom");
  const rightTopId = findByField(rightEls, elements, "x_position", "top");
  const rightBottomId = findByField(rightEls, elements, "x_position", "bottom");
  const galvId = bridgeRel?.elements?.[0];

  const positions = {};
  if (leftTopId) positions[leftTopId] = { ...midpoint(W, N), rotation: angleDeg(W, N) };
  if (rightTopId) positions[rightTopId] = { ...midpoint(N, E), rotation: angleDeg(N, E) };
  if (leftBottomId) positions[leftBottomId] = { ...midpoint(W, S), rotation: angleDeg(W, S) };
  if (rightBottomId) positions[rightBottomId] = { ...midpoint(S, E), rotation: angleDeg(S, E) };
  if (galvId) positions[galvId] = { ...midpoint(N, S), rotation: 90 };

  const outerIds = outerRel
    ? outerRel.elements
    : [leftBranch, rightBranch].flatMap((r) => r?.elements || []).filter((id) => elements.find((e) => e.id === id)?.type === "battery");
  const uniqueOuterIds = [...new Set(outerIds)];
  const battId = uniqueOuterIds.find((id) => elements.find((e) => e.id === id)?.type === "battery");
  const switchId = uniqueOuterIds.find((id) => elements.find((e) => e.id === id)?.type === "switch");

  if (battId) positions[battId] = { ...midpoint(outerLeftTop, outerLeftBottom), rotation: 90 };
  if (switchId) positions[switchId] = { ...midpoint(outerLeftBottom, outerRightBottom), rotation: 0 };

  return {
    N, S, W, E,
    outerLeftTop, outerLeftBottom, outerRightBottom, outerRightTop,
    leftTopId, rightTopId, leftBottomId, rightBottomId, galvId, battId, switchId,
    positions,
  };
}


// circuitCombination.jsx

// circuitCombination.jsx — corrected

export function calculateCombinationCircuitPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);
  const margin = isMobile ? 20 : 15;
  const loopLeft = paddingX;
  const loopTop = paddingY + margin;
  const loopBottom = SVG_HEIGHT - paddingY - margin;

  const mainRel = relationships.find((r) => r.type === "connected_by_wire" && r.order === "series");
  const orderedIds = (mainRel ? mainRel.elements : []).filter((id) => elements.find((e) => e.id === id)?.type !== "node");
  const nodeId = mainRel?.elements.find((id) => elements.find((e) => e.id === id)?.type === "node");
  const rawSubRels = relationships.filter((r) => r.order === "parallel_sub_branch" && r.anchorId === nodeId);

  // Group into rungs by side — handles both shapes: one relationship per
// side (rel.side set), or one relationship with per-element `side` fields
// (this RC payload's shape).
const rungMap = {};
rawSubRels.forEach((rel) => {
  const bySide = {};
  rel.elements.forEach((id) => {
    const el = elements.find((e) => e.id === id);
    const side = rel.side || el?.side || "top";
    if (!bySide[side]) bySide[side] = [];
    bySide[side].push(id);
  });
  Object.entries(bySide).forEach(([side, ids]) => {
    if (!rungMap[side]) rungMap[side] = [];
    rungMap[side].push(...ids);
  });
});

const controlPriority = (type) => (type === "switch" || type === "open_break" ? 0 : type === "ammeter" ? 1 : 2);
const sideOrder = Object.keys(rungMap).sort((a, b) => (a === "top" ? -1 : b === "top" ? 1 : 0));
const subRels = sideOrder.map((side) => ({
  side,
  elements: [...rungMap[side]].sort(
    (a, b) => controlPriority(elements.find((e) => e.id === a)?.type) - controlPriority(elements.find((e) => e.id === b)?.type)
  ),
}));

  const GAP = isMobile ? 14 : 18;
  const railMargin = isMobile ? 20 : 25;
  const branchSlotWidth = isMobile ? 80 : 120;
  const legCounts = { top: 0, left: 0 };
  orderedIds.forEach((id) => {
    const leg = legFor(elements.find((e) => e.id === id)?.x_position);
    legCounts[leg === "left" ? "left" : "top"]++;
  });

  // This is ONLY used to lay out the top/left series legs before we know
  // the real content width. It is NEVER used as the final loopRight.
  const seriesLegPlanningWidth = SVG_WIDTH - paddingX;
  const branchesTotalWidth = subRels.length * branchSlotWidth;
  const splitX = seriesLegPlanningWidth - railMargin - branchesTotalWidth;

  const legIndex = { top: 0, left: 0 };
  const positions = {};

  orderedIds.forEach((id) => {
    const el = elements.find((e) => e.id === id);
    const leg = legFor(el?.x_position) === "left" ? "left" : "top";
    let x, y, rotation;
    if (leg === "left") {
      const frac = (++legIndex.left) / (legCounts.left + 1);
      x = loopLeft; y = loopTop + frac * (loopBottom - loopTop); rotation = 90;
    } else {
      const frac = (++legIndex.top) / (legCounts.top + 1);
      x = loopLeft + frac * (splitX - loopLeft); y = loopTop; rotation = 0;
    }
    positions[id] = { x, y, rotation, labelSide: "outer" };
  });

  const midY = (loopTop + loopBottom) / 2;
  let lastRungCenterX = splitX;
 // let lastRungReach = 0;

  subRels.forEach((rel, branchIdx) => {
    const branchX = splitX + railMargin + branchIdx * branchSlotWidth + branchSlotWidth / 2;
    const reaches = rel.elements.map((id) => COMPONENT_REACH[elements.find((e) => e.id === id)?.type] || 24);
    const totalHeight = reaches.reduce((s, r) => s + r * 2, 0) + GAP * (rel.elements.length - 1);
    let cursor = midY - totalHeight / 2;
    rel.elements.forEach((id, i) => {
      const r = reaches[i];
      positions[id] = { x: branchX, y: cursor + r, rotation: 90, labelSign: -1 };
      cursor += r * 2 + GAP;
    });
    if (branchX >= lastRungCenterX) {
      lastRungCenterX = branchX;
      //lastRungReach = Math.max(...reaches);
    }
  });

  // THE ONLY DEFINITION OF loopRight IN THIS FILE. It equals the last
  // rung's center plus its own physical half-width plus a small margin —
  // nothing about label width factors in here at all.
  const loopRight = subRels.length ? lastRungCenterX : seriesLegPlanningWidth;
  const tapRels = relationships.filter((r) => r.type === "measures_voltage" || r.type === "measures_current");
  const tapTargetIds = new Set();
  const TAP_OFFSET = isMobile ? 34 : 28;
  const TAP_OFFSET_H = isMobile ? 34 : 40;

  tapRels.forEach((rel) => {
    const tapId = rel.elements[0];
    if (positions[tapId]) return;
    const targetPos = positions[rel.target];
    if (!targetPos) return;
    tapTargetIds.add(rel.target);
    const targetIsVertical = Math.abs(((targetPos.rotation % 180) + 180) % 180 - 90) < 1;

    if (targetIsVertical) {
      positions[tapId] = {
        x: targetPos.x - TAP_OFFSET_H,
        y: targetPos.y,
        rotation: targetPos.rotation,
        isTap: true,
        tapTarget: rel.target,
      };
    } else {
      const rad = (targetPos.rotation * Math.PI) / 180;
      const perpX = -Math.sin(rad) * TAP_OFFSET;
      const perpY = -Math.cos(rad) * TAP_OFFSET;
      positions[tapId] = { x: targetPos.x + perpX, y: targetPos.y + perpY, rotation: targetPos.rotation, isTap: true, tapTarget: rel.target };
    }
  });
  tapTargetIds.forEach((id) => { if (positions[id]) positions[id].labelDistance = 24; });

  elements.forEach((el) => {
  if (positions[el.id]) return;
  const leg = legFor(el.x_position);
  if (leg === "top" || leg === "left") {
    const existingOnLeg = orderedIds.filter((id) => positions[id]?.rotation === (leg === "left" ? 90 : 0));
    const idx = existingOnLeg.length;
    if (leg === "left") {
      const frac = (idx + 1) / (idx + 2);
      positions[el.id] = { x: loopLeft, y: loopTop + frac * (loopBottom - loopTop), rotation: 90, labelSide: "outer" };
    } else {
      const frac = (idx + 1) / (idx + 2);
      positions[el.id] = { x: loopLeft + frac * (splitX - loopLeft), y: loopTop, rotation: 0, labelSide: "outer" };
    }
  }
});

return { loopLeft, loopRight, loopTop, loopBottom, orderedIds, subRels, positions };
}




