//import { getSvgDimensions } from "../geometry/geometryHelpers";

// --------------------------------------------------
// FIXED POSITION-ROLE LAYOUTS
// Shared across any chemistry subtype that places atoms/groups via a
// closed vocabulary of role strings instead of raw coordinates —
// guarantees chemically correct geometry regardless of what the
// generator's numbers might otherwise get wrong.
// --------------------------------------------------
export const LINEAR_LAYOUT = {
  left: { x: -1.5, y: 0 },
  center: { x: 0, y: 0 },
  right: { x: 1.5, y: 0 },
};

export const TRIGONAL_LAYOUT = {
  top_left: { x: -1.3, y: -1.1 },
  top_right: { x: 1.3, y: -1.1 },
  bottom_center: { x: 0, y: 1.5 },
};

export const TETRAHEDRAL_LAYOUT = {
  top_left: { x: -1.3, y: -1.3 },
  top_right: { x: 1.3, y: -1.3 },
  bottom_left: { x: -1.3, y: 1.3 },
  bottom_right: { x: 1.3, y: 1.3 },
};

export function resolveAtomOffset(atom, atomCount) {
  if (atom.x_position === "center" || (!atom.x_position && !atom.side)) {
    return { x: 0, y: 0 };
  }
  if (atom.x_position && LINEAR_LAYOUT[atom.x_position]) {
    return LINEAR_LAYOUT[atom.x_position];
  }
  if (atom.side && TETRAHEDRAL_LAYOUT[atom.side] && atomCount >= 5) {
    return TETRAHEDRAL_LAYOUT[atom.side];
  }
  if (atom.side && TRIGONAL_LAYOUT[atom.side]) {
    return TRIGONAL_LAYOUT[atom.side];
  }
  return { x: 0, y: 0 };
}

// --------------------------------------------------
// BOND RENDERING — shared by lewis_structure and (later) molecular_2d
// --------------------------------------------------
export const BOND_ORDER = { single: 1, double: 2, triple: 3 };


export function shrinkSegment(p1, p2, amount) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  return {
    p1: { x: p1.x + ux * amount, y: p1.y + uy * amount },
    p2: { x: p2.x - ux * amount, y: p2.y - uy * amount },
  };
}

export function renderBond(rel, positions, strokeWidth, key, labelClearance) {
  const [id1, id2] = rel.elements;
  const p1 = positions[id1], p2 = positions[id2];
  if (!p1 || !p2) return null;

  const order = BOND_ORDER[rel.bond_type] || 1;
  const fullDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const safeClearance = Math.min(labelClearance, fullDist * 0.35); // never eat more than 35% from each end
  const { p1: sp1, p2: sp2 } = shrinkSegment(p1, p2, safeClearance);

  const dx = sp2.x - sp1.x, dy = sp2.y - sp1.y;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = -dy / len, perpY = dx / len;

  const lines = [];
  for (let k = 0; k < order; k++) {
    const offset = (k - (order - 1) / 2) * 5;
    lines.push(
      <line key={`${key}-${k}`}
        x1={sp1.x + perpX * offset} y1={sp1.y + perpY * offset}
        x2={sp2.x + perpX * offset} y2={sp2.y + perpY * offset}
        stroke="#1e293b" strokeWidth={strokeWidth * 1.6} strokeLinecap="round"
        vectorEffect="non-scaling-stroke" />
    );
  }
  return <g key={key}>{lines}</g>;
}
// --------------------------------------------------
// LONE PAIRS — shared by lewis_structure and (later) molecular_2d
// --------------------------------------------------
export function renderLonePairs(rel, positions, bondRels, key, labelClearance) {
  const atomId = rel.elements[0];
  const p = positions[atomId];
  if (!p) return null;

  const bondedTo = bondRels
    .filter((b) => b.elements.includes(atomId))
    .map((b) => positions[b.elements.find((e) => e !== atomId)])
    .filter(Boolean);

  let dirX = 0, dirY = -1;
  if (bondedTo.length > 0) {
    const avgDx = bondedTo.reduce((s, bp) => s + (bp.x - p.x), 0) / bondedTo.length;
    const avgDy = bondedTo.reduce((s, bp) => s + (bp.y - p.y), 0) / bondedTo.length;
    const len = Math.hypot(avgDx, avgDy) || 1;
    dirX = -avgDx / len;
    dirY = -avgDy / len;
  }

  const DISTANCE_FROM_ATOM = labelClearance + 14; // clear the label, plus a visible gap
  const perpX = -dirY, perpY = dirX;
  const pairDots = [];
  for (let k = 0; k < rel.count; k++) {
    const spread = (k - (rel.count - 1) / 2) * 14;
    const baseX = p.x + dirX * DISTANCE_FROM_ATOM + perpX * spread;
    const baseY = p.y + dirY * DISTANCE_FROM_ATOM + perpY * spread;
    pairDots.push(
      <g key={`${key}-${k}`}>
        <circle cx={baseX - perpX * 3} cy={baseY - perpY * 3} r={2} fill="#1e293b" />
        <circle cx={baseX + perpX * 3} cy={baseY + perpY * 3} r={2} fill="#1e293b" />
      </g>
    );
  }
  return <g key={key}>{pairDots}</g>;
}
// --------------------------------------------------
// ATOM LABEL — shared by every chemistry subtype
// --------------------------------------------------
export function renderAtomLabel(id, p, fontSize) {
  return (
    <foreignObject key={id} x={p.x - 16} y={p.y - 16} width={32} height={32}>
      <div className="flex items-center justify-center font-bold text-slate-900"
        style={{ fontSize: fontSize * 1.9 }}>
        {p.label}
      </div>
    </foreignObject>
  );
}

// --------------------------------------------------
// CHARGE LABEL — shared by anything with an overall ionic charge
// --------------------------------------------------
export function renderChargeLabel(rel, positions, fontSize, key) {
  const lastAtomId = rel.elements[rel.elements.length - 1];
  const p = positions[lastAtomId];
  if (!p) return null;
  const chargeText = rel.charge > 0 ? `${rel.charge}+` : `${Math.abs(rel.charge)}-`;
  return (
    <foreignObject key={key} x={p.x + 16} y={p.y - 24} width={30} height={20}>
      <div className="font-bold text-slate-900" style={{ fontSize: fontSize * 1.1 }}>
        {chargeText}
      </div>
    </foreignObject>
  );
}