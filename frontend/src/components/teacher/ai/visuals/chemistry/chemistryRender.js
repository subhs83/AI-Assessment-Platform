
import { getSvgDimensions } from "../geometry/geometryHelpers";
import {renderBond, renderLonePairs, renderAtomLabel, renderChargeLabel, extractLonePairRels, renderIonBrackets } from "./chemistryHelpers";

export function renderLewisStructure(plane, relationships, figure, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { positions } = plane;

  const bondRels = relationships.filter((r) => r.type === "forms_bond");
  const lonePairs = extractLonePairRels(relationships);
  const chargeRels = relationships.filter((r) => r.type === "has_charge");

  return (
    <g> 
      {bondRels.map((rel, i) => renderBond(rel, positions, strokeWidth, `bond-${i}`, plane.labelClearance))}
      {Object.entries(positions).map(([id, p]) => renderAtomLabel(id, p, fontSize))}
      {lonePairs.map((lp, i) =>
        renderLonePairs({ elements: [lp.atomId], count: lp.count }, positions, bondRels, `lonepairs-${i}`, plane.labelClearance)
      )}
      {chargeRels.map((rel, i) => renderChargeLabel(rel, positions, fontSize, `charge-${i}`))}
    </g>
  );
}



export function renderMolecular2D(plane, relationships, figure, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { positions } = plane;

  const bondRels = relationships.filter((r) => r.type === "forms_bond");
  const lonePairs = extractLonePairRels(relationships);

  return (
    <g>
      {bondRels.map((rel, i) => renderBond(rel, positions, strokeWidth, `bond-${i}`, plane.labelClearance))}
      {Object.entries(positions).map(([id, p]) => renderAtomLabel(id, p, fontSize))}
      {lonePairs.map((lp, i) =>
        renderLonePairs({ elements: [lp.atomId], count: lp.count }, positions, bondRels, `lonepairs-${i}`, plane.labelClearance)
      )}
      {/* has_formal_charge relationships are intentionally NEVER rendered — leaked answer */}
      {renderIonBrackets(figure?.overall_charge, positions, fontSize)}
    </g>
  );
}


export function renderResonanceStructures(plane, relationships, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { positions, groupIds, groupBounds, SVG_HEIGHT, labelClearance } = plane;

  const bondRels = relationships.filter((r) => r.type === "forms_bond");
  const lonePairs = extractLonePairRels(relationships);
  const resonanceRel = relationships.find((r) => r.type === "resonance_between");

  return (
    <g>
      <defs>
        <marker id="resonance-arrow-left" markerWidth="10" markerHeight="10" refX="2" refY="5" orient="auto">
          <path d="M8,0 L0,5 L8,10 Z" fill="#1e293b" />
        </marker>
        <marker id="resonance-arrow-right" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="#1e293b" />
        </marker>
      </defs>

      {/* Bonds — one full set per structure group, drawn identically
          to a standalone Lewis structure */}
      {bondRels.map((rel, i) => renderBond(rel, positions, strokeWidth, `bond-${i}`, labelClearance))}

      {/* Atom labels */}
      {Object.entries(positions).map(([id, p]) => renderAtomLabel(id, p, fontSize))}

      {/* Lone pairs — normalized across both relationship shapes
          (has_lone_pairs/elements and lone_pairs/on_atom) */}
      {lonePairs.map((lp, i) =>
        renderLonePairs(
          { elements: [lp.atomId], count: lp.count }, positions, bondRels, `lonepairs-${i}`, labelClearance )
      )}

      {/* has_formal_charge relationships are NEVER rendered — the
          question always asks the student to derive this value.
          Ion-charge brackets are ALSO never rendered here — for
          resonance_structures, overall_charge is frequently the
          value being asked for (e.g. "what is the overall formal
          charge"), so it's suppressed unconditionally for this
          feature rather than trying to detect intent per-question. */}

      {/* Resonance arrow(s) between each pair of adjacent structure groups */}
      {resonanceRel &&
        groupIds.slice(0, -1).map((gid, i) => {
          const nextGid = groupIds[i + 1];
          const x1 = groupBounds[gid].centerX + groupBounds[gid].halfWidth;
          const x2 = groupBounds[nextGid].centerX - groupBounds[nextGid].halfWidth;
          const y = SVG_HEIGHT / 2;
          return (
            <line
              key={`resonance-${i}`}
              x1={x1} y1={y} x2={x2} y2={y}
              stroke="#1e293b" strokeWidth={strokeWidth}
              markerStart="url(#resonance-arrow-left)"
              markerEnd="url(#resonance-arrow-right)"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
    </g>
  );
}