import { getSvgDimensions } from "../geometry/geometryHelpers";
import { resolveAtomOffset,} from "./chemistryHelpers";

export function calculateLewisStructurePositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, fontSize } = getSvgDimensions(isMobile);
  const centerX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;
  const SCALE = isMobile ? 40 : 55;

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

  // Clearance radius scales WITH the atom label's own font size, so
  const labelClearance = fontSize * 1.9 * 0.62; // half the label's rendered box, roughly

  return { positions, atomEls, centerX, centerY, SCALE, labelClearance };
}
