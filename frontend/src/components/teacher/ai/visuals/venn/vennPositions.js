import { getSvgDimensions } from "../geometry/geometryHelpers";

/*
 * ------------------------------------------
 * CIRCLE LAYOUT PER SUBTYPE
 * ------------------------------------------
 * Each subtype has a fixed, hardcoded circle arrangement — the same
 * "fixed schematic + given data" pattern used throughout the geometry
 * work. The layout alone determines subtype; `regions` just supplies
 * which numbers go where within that fixed layout.
 */
function computeCircleLayout(subtype, setCount, centerX, centerY, radius, isMobile) {
  if (subtype === "2_set") {
    const offset = radius * 0.55;
    return [
      { id: "set_a", cx: centerX - offset, cy: centerY, r: radius },
      { id: "set_b", cx: centerX + offset, cy: centerY, r: radius },
    ];
  }

  if (subtype === "disjoint") {
    const gap = radius * 0.3;
    return [
      { id: "set_a", cx: centerX - radius - gap / 2, cy: centerY, r: radius },
      { id: "set_b", cx: centerX + radius + gap / 2, cy: centerY, r: radius },
    ];
  }

  if (subtype === "subset") {
    // Set B fully inside set A — same center, smaller radius, offset
    // slightly upward so both labels have room without overlapping.
    return [
      { id: "set_a", cx: centerX, cy: centerY, r: radius },
      { id: "set_b", cx: centerX, cy: centerY + radius * 0.15, r: radius * 0.5 },
    ];
  }

  if (subtype === "3_set") {
    const offset = radius * 0.55;
    const topY = centerY - radius * 0.5;
    const bottomY = centerY + radius * 0.35;
    return [
      { id: "set_a", cx: centerX - offset, cy: bottomY, r: radius },
      { id: "set_b", cx: centerX + offset, cy: bottomY, r: radius },
      { id: "set_c", cx: centerX, cy: topY, r: radius },
    ];
  }

  return [];
}

/*
 * ------------------------------------------
 * FIXED REGION LABEL POSITIONS
 * ------------------------------------------
 * For each subtype, a fixed lookup from "which sets a region belongs
 * to" (as a sorted, joined key) to a schematic (dx, dy) OFFSET from
 * centerX/centerY where that region's number should be placed. This
 * is deliberately hand-placed per subtype rather than computed
 * generically, since region centroids for overlapping circles are
 * genuinely different per layout and this stays simple + reliable.
 */
function getRegionOffsets(subtype, radius, setIds) {
  // setIds: the actual array of set ids in the order given by the JSON,
  // e.g. ["set_chess", "set_checkers"] or ["set_spanish", "set_french", "set_german"].
  // Build offsets keyed by POSITION (setIds[0], setIds[1], ...) rather
  // than hardcoded literal names, since real questions use arbitrary,
  // semantic ids that will never match a fixed "set_a"/"set_b" key.

  const [id0, id1, id2] = setIds;

  if (subtype === "2_set") {
    const offset = radius * 0.55;
    return {
      [id0]: { dx: -offset * 1.15, dy: 0 },
      [id1]: { dx: offset * 1.15, dy: 0 },
      [[id0, id1].sort().join(",")]: { dx: 0, dy: 0 },
      "": { dx: 0, dy: -radius * 1.2 },
    };
  }

  if (subtype === "disjoint") {
    const gap = radius * 0.3;
    return {
      [id0]: { dx: -(radius + gap / 2), dy: 0 },
      [id1]: { dx: radius + gap / 2, dy: 0 },
    };
  }

  if (subtype === "subset") {
    // NOTE: subset's inner/outer mapping depends on which set is
    // actually the SMALLER one — see Bug 3 below.
    return {
      [id1]: { dx: 0, dy: radius * 0.15 },
      [id0]: { dx: 0, dy: -radius * 0.65 },
    };
  }

  if (subtype === "3_set") {
    const offset = radius * 0.55;
    const topY = -radius * 0.5;
    const bottomY = radius * 0.35;
    return {
      [id0]: { dx: -offset * 1.4, dy: bottomY + radius * 0.25 },
      [id1]: { dx: offset * 1.4, dy: bottomY + radius * 0.25 },
      [id2]: { dx: 0, dy: topY - radius * 0.35 },
      [[id0, id1].sort().join(",")]: { dx: 0, dy: bottomY + radius * 0.42 },
      [[id0, id2].sort().join(",")]: { dx: -offset * 0.85, dy: (topY + bottomY) / 2 - radius * 0.2 },
      [[id1, id2].sort().join(",")]: { dx: offset * 0.85, dy: (topY + bottomY) / 2 - radius * 0.2 },
      [[id0, id1, id2].sort().join(",")]: { dx: 0, dy: (topY + bottomY) / 2 + radius * 0.15 },
      "": { dx: 0, dy: radius * 1.5 },
    };
  }

  return {};
}

export function calculateVennPositions({ sets, regions, figure, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const centerX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;

  const subtype = figure?.subtype || "2_set";
  const maxRadius = Math.min(SVG_WIDTH - paddingX * 2, SVG_HEIGHT - paddingY * 2) / 2;
  const radius = maxRadius * (subtype === "3_set" ? 0.55 : subtype === "disjoint" ? 0.6 : 0.7);

  const circles = computeCircleLayout(subtype, sets.length, centerX, centerY, radius, isMobile);
  const regionOffsets = getRegionOffsets(subtype, radius, sets.map((s) => s.id));

  const setLabelById = {};
  sets.forEach((s) => { setLabelById[s.id] = s.label; });

  const positionedRegions = (regions || []).map((region) => {
    const key = [...(region.in || [])].sort().join(",");
    const offset = regionOffsets[key] || { dx: 0, dy: 0 };
    return {
      ...region,
      x: centerX + offset.dx,
      y: centerY + offset.dy,
    };
  });

  return { circles, positionedRegions, setLabelById, centerX, centerY, radius, subtype, SVG_WIDTH, SVG_HEIGHT };
}