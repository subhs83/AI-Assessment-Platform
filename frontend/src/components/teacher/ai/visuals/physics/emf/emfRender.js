import { getSvgDimensions } from "../../geometry/geometryHelpers";
import {
  FieldLineRay, PointChargeSymbol,FIELD_COLORS, arrowOnQuadraticCurve,
  MAG_COLORS, BarMagnetSymbol
} from "./emfHelpers"
import MathText from "../../../../../common/MathText"


// renderPointChargeField — pass revealSign: false for point_charge questions
// where the field lines (not the symbol color) are meant to be the only clue
export function renderPointChargeField(plane, isMobile = false) {
  if (!plane) return null;
  const { cx, cy, chargeRadius, fieldLineOuterR, angles, charge, label } = plane; // label destructured from plane
  const { strokeWidth } = getSvgDimensions(isMobile);
  const direction = charge >= 0 ? "outward" : "inward";

  return (
    <g transform={`translate(${cx},${cy})`}>
      {angles.map((angle) => (
        <FieldLineRay key={angle} angleDeg={angle} innerR={chargeRadius + 4} outerR={fieldLineOuterR} direction={direction} strokeWidth={strokeWidth} />
      ))}
      <PointChargeSymbol charge={charge} label={label} radius={chargeRadius} revealSign={false} />
    </g>
  );
}

export function renderTwoChargeField(plane, isMobile = false) {
  if (!plane) return null;
  const { a, b, chargeRadius } = plane;
  const { strokeWidth } = getSvgDimensions(isMobile);
  const opposite = a.sign !== b.sign;
  const midX = (a.cx + b.cx) / 2;

  // NEW: unequal magnitude → unequal line counts. The stronger charge's
  // "extra" lines curve outward without reaching the weaker charge —
  // standard textbook convention for showing |Q1| ≠ |Q2|.
  const strongerIsA = a.magRank >= b.magRank;
  const stronger = strongerIsA ? a : b;
  //const weaker = strongerIsA ? b : a;
  const connectedCount = 4; // lines that actually span both charges
  const extraCount = Math.abs(a.magRank - b.magRank) > 0.4 ? 3 : 0; // asymmetric-only lines from the stronger charge

  const curves = [];

  // Connected lines — same as before, always paired between both charges
  for (let i = 0; i < connectedCount; i++) {
    const t = (i + 1) / (connectedCount + 1);
    const yOffset = (t - 0.5) * chargeRadius * 5;
    if (opposite) {
      const posCharge = a.sign > 0 ? a : b;
      const negCharge = a.sign > 0 ? b : a;
      const bow = yOffset * 1.4;
      const startX = posCharge.cx, startY = posCharge.cy + yOffset;
      const ctrlX = midX, ctrlY = posCharge.cy + yOffset + bow;
      const endX = negCharge.cx, endY = negCharge.cy + yOffset;
      curves.push({ d: `M ${startX} ${startY} Q ${ctrlX} ${ctrlY}, ${endX} ${endY}`, arrow: arrowOnQuadraticCurve(startX, startY, ctrlX, ctrlY, endX, endY, 0.5, false) });
    } else {
      const startCharge = i % 2 === 0 ? a : b;
      const dir = i % 2 === 0 ? -1 : 1;
      const startX = startCharge.cx, startY = startCharge.cy + yOffset;
      const ctrlX = startCharge.cx + dir * chargeRadius * 2, ctrlY = startY + yOffset * 1.8;
      const endX = startCharge.cx + dir * chargeRadius * 4, endY = startY;
      curves.push({ d: `M ${startX} ${startY} Q ${ctrlX} ${ctrlY}, ${endX} ${endY}`, arrow: arrowOnQuadraticCurve(startX, startY, ctrlX, ctrlY, endX, endY, 0.6, false) });
    }
  }

  // Extra lines from the stronger charge only — curve away and terminate
  // renderTwoChargeField — corrected extra-line geometry

  for (let i = 0; i < extraCount; i++) {
    // Direction pointing AWAY from the other charge (the side with open space)
    const awayDir = stronger === a ? Math.PI : 0; // a faces left (π), b faces right (0)

    // Symmetric fan: spread evenly around awayDir, e.g. for 3 lines: -30°, 0°, +30°
    const spreadDeg = 60;
    const stepDeg = extraCount > 1 ? spreadDeg / (extraCount - 1) : 0;
    const angleOffsetDeg = -spreadDeg / 2 + i * stepDeg;
    const angle = awayDir + (angleOffsetDeg * Math.PI) / 180;

    const startX = stronger.cx, startY = stronger.cy;
    const lineLength = chargeRadius * 3.5;
    const endX = startX + Math.cos(angle) * lineLength;
    const endY = startY + Math.sin(angle) * lineLength;

    // Gentle outward curve, control point offset perpendicular to the line
    const perpAngle = angle + Math.PI / 2;
    const bowAmount = chargeRadius * 0.8;
    const ctrlX = (startX + endX) / 2 + Math.cos(perpAngle) * bowAmount;
    const ctrlY = (startY + endY) / 2 + Math.sin(perpAngle) * bowAmount;

    curves.push({
      d: `M ${startX} ${startY} Q ${ctrlX} ${ctrlY}, ${endX} ${endY}`,
      arrow: arrowOnQuadraticCurve(startX, startY, ctrlX, ctrlY, endX, endY, 0.65, false),
    });
  }

  return (
    <g>
      {curves.map(({ d, arrow }, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke={FIELD_COLORS.fieldLine} strokeWidth={strokeWidth} />
          <polygon points={`${arrow.point.x},${arrow.point.y} ${arrow.a1.x},${arrow.a1.y} ${arrow.a2.x},${arrow.a2.y}`} fill={FIELD_COLORS.fieldLine} />
        </g>
      ))}
      <g transform={`translate(${a.cx},${a.cy})`}><PointChargeSymbol charge={a.sign} label={a.label} radius={chargeRadius} revealSign={false} /></g>
      <g transform={`translate(${b.cx},${b.cy})`}><PointChargeSymbol charge={b.sign} label={b.label} radius={chargeRadius} revealSign={false} /></g>
    </g>
  );
}



export function renderPlateField(plane, isMobile = false) {
  if (!plane) return null;
  const { plateTopY, plateBottomY, plateLeft, plateRight, posOnTop } = plane;
  const { strokeWidth } = getSvgDimensions(isMobile);
  const lineCount = 7;

  const topColor = posOnTop ? FIELD_COLORS.positiveCharge.stroke : FIELD_COLORS.negativeCharge.stroke;
  const bottomColor = posOnTop ? FIELD_COLORS.negativeCharge.stroke : FIELD_COLORS.positiveCharge.stroke;

  return (
    <g>
      <line x1={plateLeft} y1={plateTopY} x2={plateRight} y2={plateTopY} stroke={topColor} strokeWidth={4} />
      <line x1={plateLeft} y1={plateBottomY} x2={plateRight} y2={plateBottomY} stroke={bottomColor} strokeWidth={4} />
      <text x={plateLeft - 15} y={plateTopY + 5} fontSize={16} fontWeight={700} fill={topColor} textAnchor="end">{posOnTop ? "+" : "−"}</text>
      <text x={plateLeft - 15} y={plateBottomY + 5} fontSize={16} fontWeight={700} fill={bottomColor} textAnchor="end">{posOnTop ? "−" : "+"}</text>

      {Array.from({ length: lineCount }, (_, i) => {
        const x = plateLeft + ((i + 1) / (lineCount + 1)) * (plateRight - plateLeft);
        const y1 = posOnTop ? plateTopY + 8 : plateBottomY - 8;
        const y2 = posOnTop ? plateBottomY - 14 : plateTopY + 14;
        const arrowDir = posOnTop ? 1 : -1;
        return (
          <g key={i}>
            <line x1={x} y1={y1} x2={x} y2={y2} stroke={FIELD_COLORS.fieldLine} strokeWidth={strokeWidth} />
            <polygon
              points={`${x},${y2 + arrowDir * 8} ${x - 5},${y2} ${x + 5},${y2}`}
              fill={FIELD_COLORS.fieldLine}
            />
          </g>
        );
      })}
    </g>
  );
}


export function renderFieldAtPoint(plane, isMobile = false) {
  if (!plane) return null;
  const { charge, point, vectorAngle, vectorLength, vectorLabel, segmentLabel } = plane;
  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);

  const rad = (vectorAngle * Math.PI) / 180;
  const vecEndX = point.x + Math.cos(rad) * vectorLength;
  const vecEndY = point.y - Math.sin(rad) * vectorLength;

  return (
    <g>
      <line x1={charge.x} y1={charge.y} x2={point.x} y2={point.y} stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4,3" />
      {segmentLabel && (
        // FIX: was a plain <text> element — now uses foreignObject + MathText,
        // same pattern as every circuit label, so LaTeX actually renders.
        <foreignObject x={(charge.x + point.x) / 2 - 60} y={charge.y - 30} width={120} height={22} style={{ overflow: "visible" }}>
          <div style={{ display: "flex", justifyContent: "center", fontSize: fontSize*(isMobile ? 1.1:1.4), fontWeight: 800, color: "#0d0d0e" }}>
            <MathText text={segmentLabel} />
          </div>
        </foreignObject>
      )}

      <g transform={`translate(${charge.x},${charge.y})`}>
        <PointChargeSymbol charge={charge.sign} label={charge.label} radius={charge.radius} revealSign={true} />
      </g>

      <circle cx={point.x} cy={point.y} r={3} fill="#1E293B" />
      {/* FIX: point label was already plain text but "P" isn't LaTeX, so
          leaving it as-is is fine — only math-bearing labels need MathText */}
      <text x={point.x} y={point.y + 22} fontSize={fontSize*(isMobile ? 1:1.2)} textAnchor="middle" fontWeight={700} fill="#1E293B">{point.label}</text>

      <line x1={point.x} y1={point.y} x2={vecEndX} y2={vecEndY} stroke={FIELD_COLORS.fieldLine} strokeWidth={strokeWidth * 1.3} />
      <polygon
        points={`${vecEndX},${vecEndY} ${vecEndX - 8 * Math.cos(rad - 0.4)},${vecEndY + 8 * Math.sin(rad - 0.4)} ${vecEndX - 8 * Math.cos(rad + 0.4)},${vecEndY + 8 * Math.sin(rad + 0.4)}`}
        fill={FIELD_COLORS.fieldLine}
      />
      {/* FIX: vector label ($E$) also needs MathText */}
      <foreignObject x={vecEndX + 6} y={vecEndY - 16} width={40} height={22} style={{ overflow: "visible" }}>
        <div style={{ fontSize: fontSize*(isMobile ? 1:1.2), fontWeight: 700, color: FIELD_COLORS.fieldLine }}>
          <MathText text={vectorLabel} />
        </div>
      </foreignObject>
    </g>
  );
}


export function renderAxisPositionsCharges(plane, isMobile = false) {
  if (!plane) return null;
  const { axisLeft, axisRight, axisY, toScreenX, min, max, charges, chargeRadius } = plane;
  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);

  // Tick marks at every integer along the axis
  const ticks = [];
  for (let v = Math.ceil(min); v <= Math.floor(max); v++) ticks.push(v);

  return (
    <g>
      <line x1={axisLeft} y1={axisY} x2={axisRight} y2={axisY} stroke="#334155" strokeWidth={strokeWidth} />
      <polygon points={`${axisRight},${axisY} ${axisRight - 8},${axisY - 5} ${axisRight - 8},${axisY + 5}`} fill="#334155" />

      {ticks.map((v) => {
        const x = toScreenX(v);
        return (
          <g key={v}>
            <line x1={x} y1={axisY - 5} x2={x} y2={axisY + 5} stroke="#334155" strokeWidth={1.5} />
            <text x={x} y={axisY + 22} fontSize={fontSize * 1.3} textAnchor="middle" fill="#64748B">{v}</text>
          </g>
        );
      })}

      {/* Charges shown WITH sign — given data (Q1=+2nC, Q2=-4nC), the
          question is about a FIELD-ZERO LOCATION, not about inferring sign,
          so there's no leakage risk in showing it plainly. */}
      {charges.map((c, i) => (
        <g key={i} transform={`translate(${c.x},${c.y - 24})`}>
          <PointChargeSymbol charge={c.sign} label={c.label} radius={chargeRadius} revealSign={true} />
          <line x1={0} y1={chargeRadius} x2={0} y2={24 - 2} stroke="#94A3B8" strokeWidth={1} strokeDasharray="2,2" />
        </g>
      ))}
    </g>
  );
}


export function renderBarMagnetField(plane, isMobile = false) {
  if (!plane) return null;
  const { cx, cy, magnetWidth, magnetHeight, horizontal, loopCount, availableHalfHeight, availableHalfWidth } = plane;
  const { strokeWidth } = getSvgDimensions(isMobile);

  const halfW = magnetWidth / 2;
  const halfH = magnetHeight / 2;
  const externalLoops = [];

  for (let i = 0; i < loopCount; i++) {
    const t = loopCount > 1 ? i / (loopCount - 1) : 0; // 0 = smallest/innermost loop, 1 = largest/outermost

    // FIX: footpoint now moves ALONG the pole face as loops get bigger —
    // innermost loop starts near the pole's outer edge (small arc hugging
    // the magnet), outermost loop starts near the pole's corner (big
    // sweeping arc). This is what prevents loops from crossing each other.
    const footY = halfH * (0.35 + 0.25 * t);
    const footX_N = -halfW;
    const footX_S = halfW;

    const verticalReach = halfH * 1.4 + t * (availableHalfHeight - halfH * 1.4);
    const horizontalReach = Math.min(halfW + verticalReach * 0.75, availableHalfWidth * 0.9);

    // Top loop (footY negative side)
    externalLoops.push({
      d: `M ${footX_N} ${-footY} C ${-horizontalReach} ${-verticalReach}, ${horizontalReach} ${-verticalReach}, ${footX_S} ${-footY}`,
    });
    // Bottom loop (mirror)
    externalLoops.push({
      d: `M ${footX_N} ${footY} C ${-horizontalReach} ${verticalReach}, ${horizontalReach} ${verticalReach}, ${footX_S} ${footY}`,
    });
  }

  const renderLoop = (d, key) => (
    <path key={key} d={d} fill="none" stroke={MAG_COLORS.fieldLine} strokeWidth={strokeWidth} />
  );

  return (
    <g transform={`translate(${cx},${cy}) rotate(${horizontal ? 0 : 90})`}>
      {externalLoops.map((loop, i) => renderLoop(loop.d, `ext-${i}`))}
      <BarMagnetSymbol cx={0} cy={0} width={magnetWidth} height={magnetHeight} horizontal={true} />
    </g>
  );
}