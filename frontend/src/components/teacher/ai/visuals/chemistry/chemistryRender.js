
import { getSvgDimensions } from "../geometry/geometryHelpers";
import {
  renderBond, renderLonePairs, renderAtomLabel, renderChargeLabel, extractLonePairRels, 
  renderIonBrackets, renderWedgeBond, renderDashBond, renderBondAngleArc, renderBondDipole
 } from "./chemistryHelpers";



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


export function renderMolecularGeometry(plane, relationships, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { positions, bondDrawList, lonePairSlots, dipolePairs, labelClearance } = plane;

  const angleRel = relationships?.find((r) => r.type === "marks_bond_angle");

  // All arrows share one length so size never hints at which bond is more polar
  const bondLens = dipolePairs.map((d) =>
    Math.hypot(positions[d.headId].x - positions[d.tailId].x, positions[d.headId].y - positions[d.tailId].y)
  );
  const arrowLen = bondLens.length ? Math.min(0.45 * Math.min(...bondLens), 34) : 0;

  return (
    <g>
      {dipolePairs.length > 0 && (
        <defs>
          <marker id="dipole-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4"
            markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" />
          </marker>
        </defs>
      )}

      {bondDrawList.map((b, i) => {
        const p1 = positions[b.centralId], p2 = positions[b.outerId];
        if (b.style === "wedge") return renderWedgeBond(p1, p2, labelClearance, `bond-${i}`);
        if (b.style === "dash") return renderDashBond(p1, p2, labelClearance, `bond-${i}`);
        return renderBond(b.rel, positions, strokeWidth, `bond-${i}`, labelClearance);
      })}

      {angleRel && (() => {
        const [id1, vertexId, id2] = angleRel.elements;
        const vertex = positions[vertexId], p1 = positions[id1], p2 = positions[id2];
        if (!vertex || !p1 || !p2) return null;
        return renderBondAngleArc(vertex, p1, p2, "angle-arc");
      })()}

      {dipolePairs.map((d, i) =>
        renderBondDipole(positions[d.tailId], positions[d.headId], arrowLen, `dipole-${i}`)
      )}

      {Object.entries(positions).map(([id, p]) => renderAtomLabel(id, p, fontSize))}

      {lonePairSlots.map((s, i) => {
        const perpX = -s.dirY, perpY = s.dirX;
        return (
          <g key={`lp-${i}`}>
            <circle cx={s.x - perpX * 3} cy={s.y - perpY * 3} r={2} fill="#1e293b" />
            <circle cx={s.x + perpX * 3} cy={s.y + perpY * 3} r={2} fill="#1e293b" />
          </g>
        );
      })}

      {/* Never rendered: net dipole, polarity verdict, delta labels, electronegativity
          values, shape names, or bond-angle numbers. They are the answers. */}
    </g>
  );
}