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
  if (atom.x_position === "top" && INVERTED_TRIGONAL_LAYOUT.top) {
    return INVERTED_TRIGONAL_LAYOUT.top;
  }
  if (atom.side && TETRAHEDRAL_LAYOUT[atom.side] && atomCount >= 5) {
    return TETRAHEDRAL_LAYOUT[atom.side];
  }
  if (atom.side && INVERTED_TRIGONAL_LAYOUT[atom.side]) {
    return INVERTED_TRIGONAL_LAYOUT[atom.side];
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
    const offset = (k - (order - 1) / 2) * 4.5;
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


function findBestLonePairAngle(p, bondedTo) {
  if (bondedTo.length === 0) return -Math.PI / 2; // straight up, no bonds at all

  const bondAngles = bondedTo.map((bp) => Math.atan2(bp.y - p.y, bp.x - p.x));
  const angularDistance = (a, b) => {
    let diff = Math.abs(a - b);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    return diff;
  };
  const minClearance = (candidate) => Math.min(...bondAngles.map((a) => angularDistance(candidate, a)));

  // Chemistry convention: draw a lone pair pointing straight up
  // whenever there's reasonably enough room for it, even if some
  // other direction is technically the widest gap — this is why NH3's
  // single lone pair belongs at the top, not off to the side.
  const UP = -Math.PI / 2;
  const MIN_ACCEPTABLE_CLEARANCE = (35 * Math.PI) / 180;
  if (minClearance(UP) >= MIN_ACCEPTABLE_CLEARANCE) return UP;

  // Otherwise fall back to whichever direction has the most true
  // clearance from every bond.
  let bestAngle = UP, bestClearance = -Infinity;
  const CANDIDATES = 48;
  for (let i = 0; i < CANDIDATES; i++) {
    const candidate = (i / CANDIDATES) * 2 * Math.PI;
    const c = minClearance(candidate);
    if (c > bestClearance) { bestClearance = c; bestAngle = candidate; }
  }
  return bestAngle;
}

export function renderLonePairs(rel, positions, bondRels, key, labelClearance) {
  const atomId = rel.elements[0];
  const p = positions[atomId];
  if (!p) return null;

  const bondedTo = bondRels
    .filter((b) => b.elements.includes(atomId))
    .map((b) => positions[b.elements.find((e) => e !== atomId)])
    .filter(Boolean);

  const bestAngle = findBestLonePairAngle(p, bondedTo);
  const dirX = Math.cos(bestAngle), dirY = Math.sin(bestAngle);
  const perpX = -dirY, perpY = dirX;

  const BASE_DISTANCE = labelClearance + 14;
  const PAIR_STACK_GAP = 16; // successive pairs stack FURTHER OUT, not sideways

  const pairGroups = [];
  for (let k = 0; k < rel.count; k++) {
    const dist = BASE_DISTANCE + k * PAIR_STACK_GAP;
    const baseX = p.x + dirX * dist;
    const baseY = p.y + dirY * dist;
    pairGroups.push(
      <g key={`${key}-${k}`}>
        <circle cx={baseX - perpX * 3} cy={baseY - perpY * 3} r={2} fill="#1e293b" />
        <circle cx={baseX + perpX * 3} cy={baseY + perpY * 3} r={2} fill="#1e293b" />
      </g>
    );
  }
  return <g key={key}>{pairGroups}</g>;
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

export function extractLonePairRels(relationships) {
  return relationships
    .filter((r) => r.type === "has_lone_pairs" || r.type === "lone_pairs")
    .map((r) => ({
      atomId: r.elements ? r.elements[0] : r.on_atom,
      count: r.count,
    }));
}

export function renderIonBrackets(overallCharge, positions, fontSize) {
  if (overallCharge === undefined || overallCharge === null) return null;

  const xs = Object.values(positions).map((p) => p.x);
  const ys = Object.values(positions).map((p) => p.y);
  const minX = Math.min(...xs) - 30, maxX = Math.max(...xs) + 30;
  const minY = Math.min(...ys) - 30, maxY = Math.max(...ys) + 30;

  const chargeText = overallCharge > 0 ? `${overallCharge}+` : `${Math.abs(overallCharge)}-`;

  return (
    <g>
      <path d={`M ${minX + 10} ${minY} L ${minX} ${minY} L ${minX} ${maxY} L ${minX + 10} ${maxY}`}
        fill="none" stroke="#1e293b" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      <path d={`M ${maxX - 10} ${minY} L ${maxX} ${minY} L ${maxX} ${maxY} L ${maxX - 10} ${maxY}`}
        fill="none" stroke="#1e293b" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      <foreignObject x={maxX + 2} y={minY - 6} width={30} height={20}>
        <div className="font-bold text-slate-900" style={{ fontSize: fontSize * 1.1 }}>{chargeText}</div>
      </foreignObject>
    </g>
  );
}

export const INVERTED_TRIGONAL_LAYOUT = {
  top: { x: 0, y: -1.5 },
  bottom_left: { x: -1.3, y: 1.1 },
  bottom_right: { x: 1.3, y: 1.1 },
};


// Maps an occupancy "family" (which selects slot COORDINATES) back to
// the electron-geometry NAME a generator would use. tetrahedral_bent
// is a rendering-only variant of tetrahedral, not a different
// electron geometry, so both must compare equal here.
export const ELECTRON_GEOMETRY_OF_FAMILY = {
  linear: "linear",
  trigonal_planar: "trigonal_planar",
  tetrahedral: "tetrahedral",
  tetrahedral_bent: "tetrahedral",
  trigonal_bipyramidal: "trigonal_bipyramidal",
  octahedral: "octahedral",
};
// Slot coordinates in layout units (y down), central atom at (0,0).
export const VSEPR_SLOTS = {
  linear: {
    left: { x: -1.7, y: 0, style: "plain" },
    right: { x: 1.7, y: 0, style: "plain" },
  },
  trigonal_planar: {
    top: { x: 0, y: -1.6, style: "plain" },
    bottom_left: { x: -1.4, y: 0.85, style: "plain" },
    bottom_right: { x: 1.4, y: 0.85, style: "plain" },
  },
  tetrahedral: {
    plane_upper: { x: -0.9, y: -1.3, style: "plain" },
    plane_lower: { x: -0.9, y: 1.3, style: "plain" },
    wedge: { x: 1.5, y: 0.75, style: "wedge" },
    dash: { x: 1.5, y: -0.75, style: "dash" },
  },

  // Dedicated symmetric layout for the 2-bond, 2-lone-pair (bent) case
  // — the generic tetrahedral slots above are asymmetric and only look
  // right for the 4-bond and 3-bond-1-lone-pair cases.
  tetrahedral_bent: {
    bond_left: { x: -1.3, y: 1.1, style: "plain" },
    bond_right: { x: 1.3, y: 1.1, style: "wedge" },
    lp_left: { x: -1.1, y: -1.3, style: "plain" },
    lp_right: { x: 1.1, y: -1.3, style: "plain" },
  },
  trigonal_bipyramidal: {
    axial_top: { x: 0, y: -1.7, style: "plain" },
    axial_bottom: { x: 0, y: 1.7, style: "plain" },
    eq_plain: { x: -1.7, y: 0, style: "plain" },
    eq_wedge: { x: 1.2, y: 0.9, style: "wedge" },
    eq_dash: { x: 1.2, y: -0.9, style: "dash" },
  },
  octahedral: {
    axial_top: { x: 0, y: -1.7, style: "plain" },
    axial_bottom: { x: 0, y: 1.7, style: "plain" },
    eq_left: { x: -1.7, y: 0, style: "plain" },
    eq_right: { x: 1.7, y: 0, style: "plain" },
    eq_wedge: { x: 0.9, y: 1.0, style: "wedge" },
    eq_dash: { x: -0.9, y: -1.0, style: "dash" },
  },
};

// key = "bondCount,lonePairCount" on the central atom
export const VSEPR_OCCUPANCY = {
  "2,0": { name: "linear", family: "linear", bonds: ["left", "right"], lps: [] },
  "3,0": { name: "trigonal_planar", family: "trigonal_planar", bonds: ["top", "bottom_left", "bottom_right"], lps: [] },
  "2,1": { name: "bent", family: "trigonal_planar", bonds: ["bottom_left", "bottom_right"], lps: ["top"] },
  "4,0": { name: "tetrahedral", family: "tetrahedral", bonds: ["plane_upper", "plane_lower", "wedge", "dash"], lps: [] },
  "3,1": { name: "trigonal_pyramidal", family: "tetrahedral", bonds: ["plane_lower", "wedge", "dash"], lps: ["plane_upper"] },
  "2,2": { name: "bent", family: "tetrahedral_bent", bonds: ["bond_left", "bond_right"], lps: ["lp_left", "lp_right"] },
  "5,0": { name: "trigonal_bipyramidal", family: "trigonal_bipyramidal", bonds: ["axial_top", "axial_bottom", "eq_plain", "eq_wedge", "eq_dash"], lps: [] },
  "4,1": { name: "see_saw", family: "trigonal_bipyramidal", bonds: ["axial_top", "axial_bottom", "eq_wedge", "eq_dash"], lps: ["eq_plain"] },
  "3,2": { name: "t_shaped", family: "trigonal_bipyramidal", bonds: ["axial_top", "axial_bottom", "eq_plain"], lps: ["eq_wedge", "eq_dash"] },
  "2,3": { name: "linear", family: "trigonal_bipyramidal", bonds: ["axial_top", "axial_bottom"], lps: ["eq_plain", "eq_wedge", "eq_dash"] },
  "6,0": { name: "octahedral", family: "octahedral", bonds: ["axial_top", "axial_bottom", "eq_left", "eq_right", "eq_wedge", "eq_dash"], lps: [] },
  "5,1": { name: "square_pyramidal", family: "octahedral", bonds: ["axial_top", "eq_left", "eq_right", "eq_wedge", "eq_dash"], lps: ["axial_bottom"] },
  "4,2": { name: "square_planar", family: "octahedral", bonds: ["eq_left", "eq_right", "eq_wedge", "eq_dash"], lps: ["axial_top", "axial_bottom"] },
};

// Normalises "see-saw", "T-shaped", "Square Planar" -> "see_saw", "t_shaped", "square_planar"
const GEOMETRY_NAME_ALIASES = {sawhorse: "see_saw", seesaw: "see_saw",};

export const normalizeGeometryName = (s) => {
  const n = String(s || "").toLowerCase().replace(/[\s-]+/g, "_");
  return GEOMETRY_NAME_ALIASES[n] || n;
};

// Lone pairs can arrive as a relationship (has_lone_pairs / lone_pairs)
// OR as an element (type "lone_pairs"). Collect every variant.
export function extractLonePairsAll(elements, relationships) {
  const fromRels = extractLonePairRels(relationships);
  const fromEls = elements
    .filter((el) => el.type === "lone_pairs" || el.type === "lone_pair")
    .map((el) => ({ atomId: el.on_atom, count: el.count ?? 1 })); // count = number of PAIRS, defaults to 1 pair per element
  return [...fromRels, ...fromEls];
}

// Solid wedge: narrow at the central atom, wide at the outer atom (toward viewer)
export function renderWedgeBond(p1, p2, clearance, key) {
  const full = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const { p1: a, p2: b } = shrinkSegment(p1, p2, Math.min(clearance, full * 0.35));
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len, py = dx / len;
  const W = 5;
  return (
    <polygon key={key}
      points={`${a.x},${a.y} ${b.x + px * W},${b.y + py * W} ${b.x - px * W},${b.y - py * W}`}
      fill="#1e293b" />
  );
}

// Hashed wedge: short lines that widen toward the outer atom (away from viewer)
export function renderDashBond(p1, p2, clearance, key) {
  const full = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const { p1: a, p2: b } = shrinkSegment(p1, p2, Math.min(clearance, full * 0.35));
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len, py = dx / len;
  const N = 6, W = 5;
  const lines = [];
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    const cx = a.x + dx * t, cy = a.y + dy * t;
    const half = 1 + (W - 1) * t;
    lines.push(
      <line key={`${key}-${i}`}
        x1={cx + px * half} y1={cy + py * half}
        x2={cx - px * half} y2={cy - py * half}
        stroke="#1e293b" strokeWidth={2} strokeLinecap="round"
        vectorEffect="non-scaling-stroke" />
    );
  }
  return <g key={key}>{lines}</g>;
}

export function renderBondAngleArc(vertex, p1, p2, key) {
  const RADIUS = 26;
  const a1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
  const a2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);

  // Always find the MINOR angular separation (<=180 degrees) — a bond
  // angle is never reflex — then draw the arc through that gap,
  // regardless of which direction a2-a1 happens to point numerically.
  let delta = a2 - a1;
  while (delta <= -Math.PI) delta += 2 * Math.PI;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  // delta is now in (-pi, pi]; its absolute value IS the minor angle.

  const sweepFlag = delta >= 0 ? 1 : 0;
  const largeArc = 0; // minor angle is always <= 180, so never the "large" SVG arc

  const start = { x: vertex.x + Math.cos(a1) * RADIUS, y: vertex.y + Math.sin(a1) * RADIUS };
  const end = { x: vertex.x + Math.cos(a2) * RADIUS, y: vertex.y + Math.sin(a2) * RADIUS };

  return (
    <path key={key}
      d={`M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} ${sweepFlag} ${end.x} ${end.y}`}
      fill="none" stroke="#170bbc" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
  );
}