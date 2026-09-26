import { getSvgDimensions } from "../geometry/geometryHelpers";
import { resolveAtomOffset,} from "./chemistryHelpers";

export function calculateLewisStructurePositions({
  elements, relationships, isMobile = false,
  overrideCenterX, overrideCenterY, scaleOverride,
}) {
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