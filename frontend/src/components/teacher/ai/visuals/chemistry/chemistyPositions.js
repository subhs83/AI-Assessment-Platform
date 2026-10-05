import { getSvgDimensions } from "../geometry/geometryHelpers";
import {
  VSEPR_SLOTS, VSEPR_OCCUPANCY, normalizeGeometryName, extractLonePairsAll, resolveAtomOffset,
  ELECTRON_GEOMETRY_OF_FAMILY,
} from "./chemistryHelpers";

export function calculateLewisStructurePositions({ elements, relationships, isMobile = false, overrideCenterX, overrideCenterY, scaleOverride,}) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, fontSize } = getSvgDimensions(isMobile);
  const centerX = overrideCenterX ?? SVG_WIDTH / 2;
  const centerY = overrideCenterY ?? SVG_HEIGHT / 2;
  const SCALE = scaleOverride ?? (isMobile ? 40 : 50);

  const atomEls = elements.filter((el) => el.type === "atom");
  const positions = {};
  atomEls.forEach((atom) => {
    const offset = resolveAtomOffset(atom, atomEls.length);
    positions[atom.id] = {
      x: centerX + offset.x * SCALE,
      y: centerY + offset.y * SCALE,
      label: atom.label,
    };
  });

  const labelClearance = fontSize * 1.9 * 0.62;

  return { positions, atomEls, centerX, centerY, SCALE, labelClearance };
}


export function calculateMolecular2DPositions({ elements, isMobile = false }) {
  return calculateLewisStructurePositions({ elements, isMobile }); // identical layout logic, tetrahedral included
}

export function calculateResonancePositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const groupIds = [...new Set(elements.map((el) => el.structure_group))].sort();
  const groupWidth = SVG_WIDTH / groupIds.length;
  const RESONANCE_SCALE = isMobile ? 28 : 34; // smaller than single-structure SCALE, since each group has less room

  const allPositions = {};
  const groupBounds = {};

  groupIds.forEach((gid, idx) => {
    const groupElements = elements.filter((el) => el.structure_group === gid);
    const localCenterX = groupWidth * idx + groupWidth / 2;
    const { positions, labelClearance } = calculateLewisStructurePositions({
      elements: groupElements,
      isMobile,
      overrideCenterX: localCenterX,
      overrideCenterY: SVG_HEIGHT / 2,
      scaleOverride: RESONANCE_SCALE,
    });
    Object.assign(allPositions, positions);
    groupBounds[gid] = { centerX: localCenterX, halfWidth: groupWidth / 2 - 20 };
    if (idx === 0) groupBounds.labelClearance = labelClearance;
  });

  return { positions: allPositions, groupIds, groupBounds, SVG_WIDTH, SVG_HEIGHT, labelClearance: groupBounds.labelClearance };
}

export function calculateVseprPositions({ elements, relationships, figure, isMobile = false }) {
  const { width, height, fontSize } = getSvgDimensions(isMobile);
  const centerX = width / 2, centerY = height / 2;
  const SCALE = isMobile ? 34 : 40;
  const labelClearance = fontSize * 1.9 * 0.62;

  const atomEls = elements.filter((el) => el.type === "atom");
  const labelOf = (id) => {
    const a = atomEls.find((el) => el.id === id);
    return a?.label ?? a?.element ?? ""; // generator used "element" here
  };

  // Central atom = the atom that appears in the most bonds
  const bondRels = relationships.filter((r) => r.type === "forms_bond");
  const counts = {};
  bondRels.forEach((r) => r.elements.forEach((id) => { counts[id] = (counts[id] || 0) + 1; }));
  const centralId = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  if (!centralId) return null;

  const centralBonds = bondRels.filter((r) => r.elements.includes(centralId));
  const lpCount = extractLonePairsAll(elements, relationships)
    .filter((lp) => lp.atomId === centralId)
    .reduce((s, lp) => s + lp.count, 0);

  const occ = VSEPR_OCCUPANCY[`${centralBonds.length},${lpCount}`];
  if (!occ) {
    console.warn("[VSEPR] no template for", { bonds: centralBonds.length, lpCount });
    return null;
  }

  const statedElectron = normalizeGeometryName(figure?.electron_geometry);
  const expectedElectron = ELECTRON_GEOMETRY_OF_FAMILY[occ.family] || occ.family;
  if (statedElectron && statedElectron !== expectedElectron) {
    console.warn("[VSEPR] electron_geometry says", statedElectron, "but counts imply", expectedElectron);
  }

  const stated = relationships.find((r) => r.type === "has_vsepr_geometry")?.geometry;
  if (stated && normalizeGeometryName(stated) !== occ.name) {
    console.warn("[VSEPR] generator says", stated, "but counts imply", occ.name);
  }

  const slots = VSEPR_SLOTS[occ.family];
  const positions = {
    [centralId]: { x: centerX, y: centerY, label: labelOf(centralId) },
  };

  const bondDrawList = centralBonds.map((rel, i) => {
    const outerId = rel.elements.find((e) => e !== centralId);
    const slot = slots[occ.bonds[i]];
    positions[outerId] = {
      x: centerX + slot.x * SCALE,
      y: centerY + slot.y * SCALE,
      label: labelOf(outerId),
    };
    return { rel, centralId, outerId, style: slot.style };
  });

  const lonePairSlots = occ.lps.map((name) => {
    const s = slots[name];
    const len = Math.hypot(s.x, s.y) || 1;
    const dirX = s.x / len, dirY = s.y / len;
    const dist = Math.max(labelClearance + 14, len * SCALE * 0.55);
    return { x: centerX + dirX * dist, y: centerY + dirY * dist, dirX, dirY };
  });

  return { positions, bondDrawList, lonePairSlots, labelClearance };
}