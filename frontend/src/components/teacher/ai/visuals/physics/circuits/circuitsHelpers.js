
import MathText from "../../../../../common/MathText"

// mathTextHelpers.js — small utility, used anywhere a label might arrive LaTeX-wrapped

export function normalizeMathLabel(text) {
  if (!text) return text;
  // Strip a single pair of outer $ ... $ delimiters if present — MathText
  // in this codebase expects raw content, not the wrapper itself.
  const trimmed = text.trim();
  if (trimmed.startsWith("$") && trimmed.endsWith("$") && trimmed.length > 1) {
    return trimmed.slice(1, -1);
  }
  return text;
}

// Electric circuit Related Function
//1. Theme
// circuitTheme.js
export const CIRCUIT_COLORS = {
  wire: "#334155",
  junction: "#334155",
  resistor: { body: "#F59E0B", stroke: "#B45309" },
  battery: { plus: "#16A34A", minus: "#DC2626" },
  switchOpen: "#EF4444",
  switchClosed: "#22C55E",
  meter: { fill: "#DBEAFE", stroke: "#2563EB", text: "#1D4ED8" },
  galvanometer: { fill: "#EDE9FE", stroke: "#7C3AED", text: "#6D28D9" },
  bulb: { litFill: "#FEF3C7", unlitFill: "#F1F5F9", stroke: "#D97706",},
  capacitor: "#0891B2", // cyan — visually distinct from resistor(amber)/battery(green-red)/meter(blue)
   inductor: "#7C3AED", // violet — richer and more "elegant" than magenta against the gradient/highlight treatment
  label: "#1E293B",
};

export const COMPONENT_REACH = {
  resistor: 26,
  battery: 22,
  switch: 26,
  ammeter: 23,
  voltmeter: 23,
  galvanometer: 23,
  bulb: 24,
  open_break: 22,
  capacitor: 15,
  inductor: 24,
  wire: 4, // effectively no footprint — it's just a conductive line
};
 
// CircuitSymbols.jsx
// Each symbol is drawn centered at (0,0), lead-to-lead along the x-axis,
// total footprint roughly 36–40px wide so leg spacing math elsewhere
// doesn't need to change. Rotation/translation handled by the caller.

//2. Symbol geometry (no text baked in — pure shapes only)
// CircuitSymbols.jsx

const LEAD = 12;

export function ResistorSymbol({ strokeWidth }) {
  const c = CIRCUIT_COLORS.resistor;
  const bodyHalf = 14;
  const peakH = 7;
  const step = (bodyHalf * 2) / 6;
  let d = `M ${-bodyHalf} 0`;
  for (let i = 0; i < 6; i++) {
    const x = -bodyHalf + step * (i + 1);
    const y = i % 2 === 0 ? -peakH : peakH;
    d += ` L ${x} ${y}`;
  }
  d = d.replace(/L ([\d.-]+) [\d.-]+$/, "L $1 0");
  return (
    <g>
      <line x1={-bodyHalf - LEAD} y1={0} x2={-bodyHalf} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} />
      <path d={d} fill="none" stroke={c.stroke} strokeWidth={strokeWidth * 1.8} strokeLinejoin="round" strokeLinecap="round" />
      <line x1={bodyHalf} y1={0} x2={bodyHalf + LEAD} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} />
    </g>
  );
}

// CircuitSymbols.jsx — add alongside existing symbols

export function CapacitorSymbol({ strokeWidth, charge }) {
  // charge: optional 0–1 fill indicator (e.g. 0 = fully discharged, 1 = fully charged).
  // When provided, the gap between plates gets a subtle tinted fill to hint charge level.
  const color = CIRCUIT_COLORS.capacitor;
  const plateGap = 5;
  const plateHeight = 18;
  return (
    <g>
      <line x1={-plateGap - LEAD} y1={0} x2={-plateGap} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} />
      {typeof charge === "number" && (
        <rect
          x={-plateGap} y={-plateHeight / 2}
          width={plateGap * 2} height={plateHeight}
          fill={color}
          opacity={0.15 + charge * 0.35}
        />
      )}
      <line x1={-plateGap} y1={-plateHeight / 2} x2={-plateGap} y2={plateHeight / 2} stroke={color} strokeWidth={strokeWidth * 1.6} strokeLinecap="round" />
      <line x1={plateGap} y1={-plateHeight / 2} x2={plateGap} y2={plateHeight / 2} stroke={color} strokeWidth={strokeWidth * 1.6} strokeLinecap="round" />
      <line x1={plateGap} y1={0} x2={plateGap + LEAD} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} />
    </g>
  );
}


export function InductorSymbol({ strokeWidth, energized }) {
  const color = energized ? "#8927e4" : "#b98cf1"; // energized: vivid violet glow; unenergized: flat neutral gray — unmistakable at a glance
  const gradId = `inductor-gradient-${Math.random().toString(36).slice(2, 8)}`;
  const glowId = `inductor-glow-${Math.random().toString(36).slice(2, 8)}`;
  const loopCount = 4;
  const loopRadius = 6;
  const loopSpacing = loopRadius * 2;
  const totalWidth = loopCount * loopSpacing;

  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
        {energized && (
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <line x1={-totalWidth / 2 - LEAD} y1={0} x2={-totalWidth / 2} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} />

      <g filter={energized ? `url(#${glowId})` : undefined}>
        {Array.from({ length: loopCount }).map((_, i) => {
          const cx = -totalWidth / 2 + loopRadius + i * loopSpacing;
          return <path key={`loop-${i}`} d={`M ${cx - loopRadius} 0 A ${loopRadius} ${loopRadius} 0 1 1 ${cx + loopRadius} 0`} fill="none" stroke={`url(#${gradId})`} strokeWidth={strokeWidth * 1.7} strokeLinecap="round" />;
        })}
      </g>

      {energized && Array.from({ length: loopCount }).map((_, i) => {
        const cx = -totalWidth / 2 + loopRadius + i * loopSpacing;
        return (
          <path
            key={`hl-${i}`}
            d={`M ${cx - loopRadius * 0.6} ${-loopRadius * 0.55} A ${loopRadius * 0.7} ${loopRadius * 0.7} 0 0 1 ${cx + loopRadius * 0.6} ${-loopRadius * 0.55}`}
            fill="none" stroke="#FFFFFF" strokeWidth={strokeWidth * 0.5} strokeLinecap="round" opacity="0.5"
          />
        );
      })}

      <line x1={totalWidth / 2} y1={0} x2={totalWidth / 2 + LEAD} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} />
    </g>
  );
}
// CircuitSymbols.jsx — add alongside ResistorSymbol, BatterySymbol, etc.

export function BulbSymbol({ strokeWidth, isLit = true }) {
  const c = CIRCUIT_COLORS.bulb;
  const glassColor = isLit ? c.litFill : c.unlitFill;
  const glowId = `bulb-glow-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <g>
      {/* leads */}
      <line x1={-24} y1={0} x2={-11} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} />
      <line x1={11} y1={0} x2={24} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} />

      {isLit && (
        <defs>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      {isLit && <circle cx={0} cy={-2} r={22} fill={`url(#${glowId})`} />}

      {/* glass envelope (teardrop bulb shape) */}
      <path
        d="M -11 4
           C -11 -9, -6 -14, 0 -14
           C 6 -14, 11 -9, 11 4
           C 11 9, 7 11, 4 11
           L -4 11
           C -7 11, -11 9, -11 4
           Z"
        fill={glassColor}
        stroke={c.stroke}
        strokeWidth={strokeWidth}
      />

      {/* filament (small W-shape inside, visible through glass) */}
      <path
        d="M -5 3 L -2 -3 L 0 1 L 2 -3 L 5 3"
        fill="none"
        stroke={isLit ? "#B45309" : "#94A3B8"}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* screw base */}
      <rect x={-5} y={11} width={10} height={3} fill={c.stroke} />
      <rect x={-4.5} y={14} width={9} height={2} fill={c.stroke} opacity={0.7} />
      <rect x={-4.5} y={16.5} width={9} height={2} fill={c.stroke} opacity={0.7} />
    </g>
  );
}

// Plates only — no +/- text. Signs are drawn separately in absolute
// coordinates by renderComponent() so they never rotate.
export function BatterySymbol({ strokeWidth }) {
  const c = CIRCUIT_COLORS.battery;
  return (
    <g>
      <line x1={-22} y1={0} x2={-4} y2={0} stroke={c.plus} strokeWidth={strokeWidth} />
      <line x1={-4} y1={-11} x2={-4} y2={11} stroke={c.plus} strokeWidth={strokeWidth * 1.4} strokeLinecap="round" />
      <line x1={3} y1={-6} x2={3} y2={6} stroke={c.minus} strokeWidth={strokeWidth * 3} strokeLinecap="round" />
      <line x1={3} y1={0} x2={22} y2={0} stroke={c.minus} strokeWidth={strokeWidth} />
    </g>
  );
}

export function SwitchSymbol({ strokeWidth, state = "open" }) {
  const gap = 14;
  const color = state === "closed" ? CIRCUIT_COLORS.switchClosed : CIRCUIT_COLORS.switchOpen;
  return (
    <g>
      <line x1={-gap - LEAD} y1={0} x2={-gap} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} />
      <circle cx={-gap} cy={0} r={2.5} fill={color} />
      <line
        x1={-gap} y1={0}
        x2={state === "closed" ? gap : gap - 5}
        y2={state === "closed" ? 0 : -10}
        stroke={color} strokeWidth={strokeWidth * 1.4} strokeLinecap="round"
      />
      <circle cx={gap} cy={0} r={2.5} fill={color} />
      <line x1={gap} y1={0} x2={gap + LEAD} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth*1.2} />
    </g>
  );
}

// The A/V/G letter sits exactly at local (0,0) — rotation doesn't move its
// position, only its orientation, so we counter-rotate just the <text> to
// keep it upright without needing any position correction.
export function MeterSymbol({ strokeWidth, symbol = "A", variant = "meter", rotation = 0 }) {
  const c = CIRCUIT_COLORS[variant];
  const r = 11;
  return (
    <g>
      <line x1={-r - LEAD} y1={0} x2={-r} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} />
      <circle cx={0} cy={0} r={r} fill={c.fill} stroke={c.stroke} strokeWidth={strokeWidth * 1.3} />
      <g transform={`rotate(${-rotation})`}>
        <text textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={700} fill={c.text} fontFamily="serif">
          {symbol}
        </text>
      </g>
      <line x1={r} y1={0} x2={r + LEAD} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth*1.2} />
    </g>
  );
}

// CircuitSymbols.jsx — add alongside existing symbols

export function OpenBreakSymbol({ strokeWidth }) {
  const color = CIRCUIT_COLORS.switchOpen; // reuse existing red — same "open/fault" language as an open switch
  const gap = 9;
  return (
    <g>
      <line x1={-gap - LEAD} y1={0} x2={-gap} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} />
      <line x1={gap} y1={0} x2={gap + LEAD} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} />
      <circle cx={-gap} cy={0} r={2.5} fill={color} />
      <circle cx={gap} cy={0} r={2.5} fill={color} />
      {/* red X marks the fault, distinguishing it from a user-controlled open switch */}
      <line x1={-4} y1={-4} x2={4} y2={4} stroke={color} strokeWidth={strokeWidth * 1.3} strokeLinecap="round" />
      <line x1={-4} y1={4} x2={4} y2={-4} stroke={color} strokeWidth={strokeWidth * 1.3} strokeLinecap="round" />
    </g>
  );
}

// renderComponent.jsx — new export, used by all three render...System files

export function renderShortBypass(shortEl, targetPos, targetEl, strokeWidth) {
  if (!targetPos || !targetEl) return null;
  const rad = (targetPos.rotation * Math.PI) / 180;
  const alongX = Math.cos(rad), alongY = Math.sin(rad);
  const perpX = -Math.sin(rad) * 14; // tight bow, closer than the voltmeter's 28px tap offset
  const perpY = -Math.cos(rad) * 14;
  const reach = reachForElement(targetEl);

  const leadA = { x: targetPos.x - alongX * reach, y: targetPos.y - alongY * reach };
  const leadB = { x: targetPos.x + alongX * reach, y: targetPos.y + alongY * reach };
  const bowA = { x: leadA.x + perpX, y: leadA.y + perpY };
  const bowB = { x: leadB.x + perpX, y: leadB.y + perpY };

  return (
    <path
      d={`M ${leadA.x} ${leadA.y} L ${bowA.x} ${bowA.y} L ${bowB.x} ${bowB.y} L ${leadB.x} ${leadB.y}`}
      fill="none"
      stroke={CIRCUIT_COLORS.wire}
      strokeWidth={strokeWidth*1.15}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export function symbolAlreadyShowsLabel(el) {
  return ["ammeter", "voltmeter", "galvanometer"].includes(el.type);
}

//3. Wireframe helpers (backdrop, junctions, corners, trimmed edges)
// circuitWireframe.jsx

const CORNER_R = 10;

export function CircuitBackdrop({ width, height, patternId }) {
  return (
    <>
      <defs>
        <pattern id={patternId} width={20} height={20} patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="1" />
        </pattern>
        <radialGradient id={`${patternId}-vignette`} cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#EEF2F7" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={width} height={height} fill={`url(#${patternId}-vignette)`} />
      <rect x={0} y={0} width={width} height={height} fill={`url(#${patternId})`} />
    </>
  );
}


export function JunctionDot({ x, y, radius = 3 }) {
  return <circle cx={x} cy={y} r={radius} fill={CIRCUIT_COLORS.junction} />;
}

export function getLoopCorners(l, t, r, b) {
  return {
    topStart: { x: l + CORNER_R, y: t }, topEnd: { x: r - CORNER_R, y: t },
    rightStart: { x: r, y: t + CORNER_R }, rightEnd: { x: r, y: b - CORNER_R },
    bottomStart: { x: r - CORNER_R, y: b }, bottomEnd: { x: l + CORNER_R, y: b },
    leftStart: { x: l, y: b - CORNER_R }, leftEnd: { x: l, y: t + CORNER_R },
  };
}

export function renderCornerArc(corner, l, t, r, b, strokeWidth) {
  const color = CIRCUIT_COLORS.wire;
  if (corner === "topLeft")
    return <path d={`M ${l} ${t + CORNER_R} A ${CORNER_R} ${CORNER_R} 0 0 1 ${l + CORNER_R} ${t}`} fill="none" stroke={color} strokeWidth={strokeWidth} />;
  if (corner === "topRight")
    return <path d={`M ${r - CORNER_R} ${t} A ${CORNER_R} ${CORNER_R} 0 0 1 ${r} ${t + CORNER_R}`} fill="none" stroke={color} strokeWidth={strokeWidth} />;
  if (corner === "bottomRight")
    return <path d={`M ${r} ${b - CORNER_R} A ${CORNER_R} ${CORNER_R} 0 0 1 ${r - CORNER_R} ${b}`} fill="none" stroke={color} strokeWidth={strokeWidth} />;
  if (corner === "bottomLeft")
    return <path d={`M ${l + CORNER_R} ${b} A ${CORNER_R} ${CORNER_R} 0 0 1 ${l} ${b - CORNER_R}`} fill="none" stroke={color} strokeWidth={strokeWidth} />;
  return null;
}

// existing renderCornerArcs (series/parallel/bridge) stays as-is, calling all four
export function renderCornerArcs(l, t, r, b, strokeWidth) {
  return (
    <>
      {renderCornerArc("topLeft", l, t, r, b, strokeWidth)}
      {renderCornerArc("topRight", l, t, r, b, strokeWidth)}
      {renderCornerArc("bottomRight", l, t, r, b, strokeWidth)}
      {renderCornerArc("bottomLeft", l, t, r, b, strokeWidth)}
    </>
  );
}

// Straight leg between two points, split into wire segments that stop
// exactly at each component's real footprint (COMPONENT_REACH) — no
// hidden line is ever drawn underneath a symbol.
export function renderLegSegments({ startPoint, endPoint, axis, ids, elements, positions, strokeWidth }) {
  const color = CIRCUIT_COLORS.wire;
  const start = startPoint[axis];
  const end = endPoint[axis];
  const fixed = axis === "x" ? startPoint.y : startPoint.x;

  const sorted = [...ids].sort((a, b) => {
    const pa = positions[a][axis], pb = positions[b][axis];
    return start < end ? pa - pb : pb - pa;
  });

  const segments = [];
  let cursor = start;
  sorted.forEach((id) => {
    const el = elements.find((e) => e.id === id);
    const reach = reachForElement(el); // was: COMPONENT_REACH[el?.type] || 24
    const center = positions[id][axis];
    const lo = center - reach, hi = center + reach;
    if (start < end) { segments.push([cursor, lo]); cursor = hi; }
    else { segments.push([cursor, hi]); cursor = lo; }
  });
  segments.push([cursor, end]);

  return segments.map(([from, to], i) => {
    if (Math.abs(to - from) < 0.5) return null;
    const p1 = axis === "x" ? { x: from, y: fixed } : { x: fixed, y: from };
    const p2 = axis === "x" ? { x: to, y: fixed } : { x: fixed, y: to };
    return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />;
  });
}

// Straight edge at ANY angle (used by the bridge diamond), trimmed around
// one component sitting at its midpoint.
export function renderTrimmedEdge(a, b, id, elements, strokeWidth) {
  const color = CIRCUIT_COLORS.wire;
  const el = elements.find((e) => e.id === id);
  if (!el) return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={strokeWidth} />;
  const reach = reachForElement(el); // was: COMPONENT_REACH[el.type] || 24
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const p1 = { x: mid.x - ux * reach, y: mid.y - uy * reach };
  const p2 = { x: mid.x + ux * reach, y: mid.y + uy * reach };
  return (
    <>
      <line x1={a.x} y1={a.y} x2={p1.x} y2={p1.y} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1={p2.x} y1={p2.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </>
  );
}


//4. Shared component renderer (the fix for rotation + duplicate label)
// renderComponent.jsx


function perpOffset(rotationDeg, distance) {
  const rad = (rotationDeg * Math.PI) / 180;
  return { dx: -Math.sin(rad) * distance, dy: -Math.cos(rad) * distance };
}

// Single source of truth for drawing ANY circuit component (used by
// series, parallel, and bridge renderers alike). Symbol geometry rotates
// with the wire; +/- signs and value labels are always computed in
// absolute coordinates and drawn unrotated, so nothing ever reads sideways.
export function renderComponent(el, pos, strokeWidth, fontSize, isMobile) {
  const { x, y, rotation, labelSide = "outer", labelSign, labelDistance = 22 } = pos;
  const isBattery = el.type === "battery";
  const showBreak = el.broken === true;
  const sideMultiplier = labelSign !== undefined ? labelSign : (labelSide === "inner" ? -1 : 1);

  return (
    <g key={el.id}>
      <g transform={`translate(${x},${y}) rotate(${rotation})`}>
        {showBreak ? (
          <OpenBreakSymbol strokeWidth={strokeWidth} />
        ) : (
          <>
            {el.type === "resistor" && <ResistorSymbol strokeWidth={strokeWidth} />}
            {el.type === "battery" && <BatterySymbol strokeWidth={strokeWidth} />}
            {el.type === "inductor" && <InductorSymbol strokeWidth={strokeWidth} energized={el.is_energized} />}
            {el.type === "switch" && <SwitchSymbol strokeWidth={strokeWidth} state={el.state} />}
            {el.type === "bulb" && <BulbSymbol strokeWidth={strokeWidth} isLit={el.isLit !== false} />}
            {el.type === "ammeter" && <MeterSymbol strokeWidth={strokeWidth} symbol="A" variant="meter" rotation={rotation} />}
            {el.type === "voltmeter" && <MeterSymbol strokeWidth={strokeWidth} symbol="V" variant="meter" rotation={rotation} />}
            {el.type === "galvanometer" && <MeterSymbol strokeWidth={strokeWidth} symbol="G" variant="galvanometer" rotation={rotation} />}
            {el.type === "wire" && (<line x1={-COMPONENT_REACH.wire - LEAD} y1={0} x2={COMPONENT_REACH.wire + LEAD} y2={0} stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} />)}
            {el.type === "open_break" && <OpenBreakSymbol strokeWidth={strokeWidth} />}
            {el.type === "capacitor" && <CapacitorSymbol strokeWidth={strokeWidth} charge={el.is_charged ? 1 : undefined} />}
          </>
        )}
      </g>

      {isBattery && (() => {
        const rad = (rotation * Math.PI) / 180;
        const alongX = Math.cos(rad), alongY = Math.sin(rad);
        const perp = perpOffset(rotation, -20);
        const plus = { x: x - alongX * 4 + perp.dx, y: y - alongY * 4 + perp.dy };
        const minus = { x: x + alongX * 3 + perp.dx, y: y + alongY * 3 + perp.dy };
        const c = CIRCUIT_COLORS.battery;
        return (
          <>
            <text x={plus.x} y={plus.y} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize *1.5} fontWeight={700} fill={c.plus}>+</text>
            <text x={minus.x} y={minus.y} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize *1.5} fontWeight={700} fill={c.minus}>−</text>
          </>
        );
      })()}

        {el.label && !symbolAlreadyShowsLabel(el) && (() => {
        const normalizedRot = ((rotation % 180) + 180) % 180;
        const isVertical = Math.abs(normalizedRot - 90) < 1;
        const isHorizontal = Math.abs(normalizedRot - 0) < 1 || Math.abs(normalizedRot - 180) < 1;
        const isDiagonal = !isVertical && !isHorizontal; // NEW — bridge arms fall here

        if (isVertical) {
          const clearance = labelDistance
          const boxWidth = 95;

          if (el.type === "battery") {
            const boxX = x - clearance - boxWidth;
            return (
              <foreignObject x={boxX} y={y - 8} width={boxWidth} height={22} style={{ overflow: "visible" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", fontSize:fontSize*1.15, fontWeight: 600, color: CIRCUIT_COLORS.label }}>
                  <MathText text={el.label} />
                </div>
              </foreignObject>
            );
          }

          if (el.type === "switch") {
            const boxX = x - clearance - boxWidth;
            return (
              <foreignObject x={boxX+50} y={y - 8} width={boxWidth} height={22} style={{ overflow: "visible" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", fontSize:fontSize*1.3, fontWeight: 600, color: CIRCUIT_COLORS.label }}>
                  <MathText text={el.label} />
                </div>
              </foreignObject>
            );
          }
          // NEW: rotate 90° so the label reads parallel to the vertical wire,
          // anchored at the same right-side clearance point as before.
          const boxX = x + clearance;
          return (
            <g transform={`translate(${boxX},${y}) rotate(90)`}>
              <foreignObject x={-boxWidth / 2 *0.45} y={-11} width={boxWidth} height={22} style={{ overflow: "visible" }}>
                <div style={{ display: "flex", justifyContent: "flex-start", fontSize: fontSize*1.15, fontWeight: 600, color: CIRCUIT_COLORS.label }}>
                  <MathText text={el.label} />
                </div>
              </foreignObject>
            </g>
          );
        }

        // NEW: diagonal case (bridge arms) — label tilts to follow the
        // wire's own angle instead of staying horizontal, so it takes up
        // far less perpendicular clearance — this is what fixes mobile
        // overlap on the diamond's four arms.
        if (isDiagonal) {
          const { dx, dy } = perpOffset(rotation, labelDistance);
          const labelX = x + dx * sideMultiplier;
          const labelY = y + dy * sideMultiplier;

          // Clamp to -90..90 so the text never renders upside-down —
          // flip by 180° whenever the raw rotation would tip past vertical.
          let displayAngle = rotation % 180;
          if (displayAngle > 90) displayAngle -= 180;
          if (displayAngle < -90) displayAngle += 180;

          return (
            <g transform={`translate(${labelX},${labelY}) rotate(${displayAngle})`}>
              <foreignObject x={isMobile ? -50: -40} y={isMobile? -15: -10} width={100} height={22} style={{ overflow: "visible" }}>
                <div style={{ display: "flex", justifyContent: "center", fontSize, fontWeight: 600, color: CIRCUIT_COLORS.label }}>
                  <MathText text={el.label} />
                </div>
              </foreignObject>
            </g>
          );
        }

        // unchanged — horizontal-leg case (rotation 0/180)
        const { dx, dy } = perpOffset(rotation, labelDistance);
        return (
          <foreignObject x={x + dx * sideMultiplier - 40} y={y + dy * sideMultiplier - 12} width={80} height={22} style={{ overflow: "visible" }}>
            <div style={{ display: "flex", justifyContent: "center", fontSize:fontSize*1.15, fontWeight: 600, color: CIRCUIT_COLORS.label }}>
              <MathText text={el.label} />
            </div>
          </foreignObject>
        );
      })()}
    </g>
  );
}

// circuitWireframe.jsx — shared, fixes bug 3 everywhere this helper is used
export function legFor(p) {
  if (!p) return "left";
  if (p.startsWith("top")) return "top";
  if (p.startsWith("bottom")) return "bottom";
  if (p.startsWith("right") || p === "far_right") return "right";
  return "left";
}

// circuitTheme.js — add this helper, keep COMPONENT_REACH as-is

export function reachForElement(el) {
  if (!el) return 24;
  if (el.broken) return COMPONENT_REACH.open_break; // broken component visually becomes an open_break symbol
  return COMPONENT_REACH[el.type] || 24;
}


export function angleDeg(from, to) {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}
export function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
export function findByField(branchEls, elements, field, value) {
  return branchEls.find((id) => elements.find((e) => e.id === id)?.[field] === value);
}


