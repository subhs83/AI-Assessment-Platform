
import { getSvgDimensions } from "../geometry/geometryHelpers";
import {renderBond, renderLonePairs, renderAtomLabel, renderChargeLabel } from "./chemistryHelpers";

export function renderLewisStructure(plane, relationships, figure, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { positions } = plane;

  const bondRels = relationships.filter((r) => r.type === "forms_bond");
  const lonePairRels = relationships.filter((r) => r.type === "has_lone_pairs");
  const chargeRels = relationships.filter((r) => r.type === "has_charge");

  return (
    <g> 
      {bondRels.map((rel, i) => renderBond(rel, positions, strokeWidth, `bond-${i}`,plane.labelClearance))}
      {Object.entries(positions).map(([id, p]) => renderAtomLabel(id, p, fontSize))}
      {lonePairRels.map((rel, i) => renderLonePairs(rel, positions, bondRels, `lonepairs-${i}`, plane.labelClearance))}
      {chargeRels.map((rel, i) => renderChargeLabel(rel, positions, fontSize, `charge-${i}`))}
    </g>
  );
}