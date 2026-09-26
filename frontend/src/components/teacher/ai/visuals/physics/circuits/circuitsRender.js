import React from 'react';
import { getSvgDimensions } from "../../geometry/geometryHelpers";
import { renderTrimmedEdge, getLoopCorners, JunctionDot, CIRCUIT_COLORS, CircuitBackdrop, renderCornerArcs, renderCornerArc, renderLegSegments, COMPONENT_REACH,
  renderComponent, reachForElement,  renderShortBypass
 } from "./circuitsHelpers";

 import MathText from "../../../../../common/MathText"
 import {computeFitTransform} from "../physicsHelpers"


export function renderCircuitSystem(plane, elements, relationships, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize, width, height } = getSvgDimensions(isMobile);
  const { loopLeft, loopRight, loopTop, loopBottom, orderedIds, positions, contentBounds } = plane;
  const fitTransform = computeFitTransform(contentBounds, isMobile);
  const corners = getLoopCorners(loopLeft, loopTop, loopRight, loopBottom);
  const legGroups = { top: [], right: [], bottom: [], left: [] };
  orderedIds.forEach((id) => {
    const pos = positions[id];
    if (!pos) return;
    if (pos.rotation === 0 && pos.y === loopTop) legGroups.top.push(id);
    else if (pos.rotation === 0 && pos.y === loopBottom) legGroups.bottom.push(id);
    else if (pos.rotation === 90 && pos.x === loopLeft) legGroups.left.push(id);
    else if (pos.rotation === 90 && pos.x === loopRight) legGroups.right.push(id);
  });

  // NEW: tap elements (voltmeter/ammeter placed via measures_voltage /
  // measures_current) are NOT in orderedIds — pull them separately from
  // `positions` by their isTap flag.
  const tapIds = Object.keys(positions).filter((id) => positions[id].isTap);

  return (
    <g transform={fitTransform}>
      <CircuitBackdrop width={width} height={height} patternId="circuit-grid-series" />
      {renderCornerArcs(loopLeft, loopTop, loopRight, loopBottom, strokeWidth)}
      {renderLegSegments({ startPoint: corners.topStart, endPoint: corners.topEnd, axis: "x", ids: legGroups.top, elements, positions, strokeWidth })}
      {renderLegSegments({ startPoint: corners.rightStart, endPoint: corners.rightEnd, axis: "y", ids: legGroups.right, elements, positions, strokeWidth })}
      {renderLegSegments({ startPoint: corners.bottomStart, endPoint: corners.bottomEnd, axis: "x", ids: legGroups.bottom, elements, positions, strokeWidth })}
      {renderLegSegments({ startPoint: corners.leftStart, endPoint: corners.leftEnd, axis: "y", ids: legGroups.left, elements, positions, strokeWidth })}

      {/* NEW: dashed stub wire from each tap's target component out to the tap 
      // renderCircuitSystem — replace the single-line tap rendering with this*/}

    {tapIds.map((id) => {
      const pos = positions[id];
      const el = elements.find((e) => e.id === id);
      const targetPos = positions[pos.tapTarget];
      const targetEl = elements.find((e) => e.id === pos.tapTarget);
      if (!targetPos || !targetEl) return null;

      const rad = (targetPos.rotation * Math.PI) / 180;
      const alongX = Math.cos(rad), alongY = Math.sin(rad);

      const targetReach = COMPONENT_REACH[targetEl.type] || 24;
      const tapReach = COMPONENT_REACH[el.type] || 23;

      // Both ends of the target component's leads
      const targetLeft = { x: targetPos.x - alongX * targetReach, y: targetPos.y - alongY * targetReach };
      const targetRight = { x: targetPos.x + alongX * targetReach, y: targetPos.y + alongY * targetReach };

      // Both ends of the voltmeter's own leads
      const tapLeft = { x: pos.x - alongX * tapReach, y: pos.y - alongY * tapReach };
      const tapRight = { x: pos.x + alongX * tapReach, y: pos.y + alongY * tapReach };

      return (
        <g key={`tap-wire-${id}`}>
          <line x1={targetLeft.x} y1={targetLeft.y} x2={tapLeft.x} y2={tapLeft.y}
            stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} strokeDasharray="3,2" />
          <line x1={targetRight.x} y1={targetRight.y} x2={tapRight.x} y2={tapRight.y}
            stroke={CIRCUIT_COLORS.wire} strokeWidth={strokeWidth} strokeDasharray="3,2" />
        </g>
      );
    })}

      {/* existing: main-loop components */}
      {orderedIds.map((id) => {
        const el = elements.find((e) => e.id === id);
        return el && positions[id] ? renderComponent(el, positions[id], strokeWidth, fontSize) : null;
      })}

      {/* NEW: tap components (voltmeter/ammeter) themselves */}
      {tapIds.map((id) => {
        const el = elements.find((e) => e.id === id);
        return el && positions[id] ? renderComponent(el, positions[id], strokeWidth, fontSize) : null;
      })}

      {relationships
        .filter((r) => r.type === "shorts")
        .map((rel) => {
          const targetId = rel.target;
          const targetPos = positions[targetId];
          const targetEl = elements.find((e) => e.id === targetId);
          return renderShortBypass(null, targetPos, targetEl, strokeWidth);
        })}
    </g>
  );
}


// renderParallelCircuitSystem — ladder topology, shorts + multi-component branch linking preserved

export function renderParallelCircuitSystem(plane, elements, relationships, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize, width, height } = getSvgDimensions(isMobile);
  const { loopLeft, loopRight, loopTop, loopBottom, seriesIds, rungGroups, positions, contentBounds } = plane;
  const fitTransform = computeFitTransform(contentBounds, isMobile);
  const wireColor = CIRCUIT_COLORS.wire;

  const corners = getLoopCorners(loopLeft, loopTop, loopRight, loopBottom);
  const legGroups = { top: [], left: [] };
  seriesIds.forEach((id) => {
    const pos = positions[id];
    if (!pos) return;
    if (pos.rotation === 0) legGroups.top.push(id);
    else legGroups.left.push(id);
  });

  const tapIds = Object.keys(positions).filter((id) => positions[id].isTap);
  const allPositionedIds = Object.keys(positions);
  // add any fallback-positioned (non-seriesIds, non-rung, non-tap) top/left element into legGroups too

  Object.keys(positions).forEach((id) => {
    if (seriesIds.includes(id) || rungGroups.flat().includes(id) || tapIds.includes(id)) return; // already accounted for (adjust names per file: orderedIds/subRels for combination)
    const pos = positions[id];
    if (pos.rotation === 0) legGroups.top.push(id);
    else if (pos.rotation === 90) legGroups.left.push(id);
  });

  return (
    <g transform={fitTransform}>
      <CircuitBackdrop width={width} height={height} patternId="circuit-grid-parallel" />
      {renderCornerArc("topLeft", loopLeft, loopTop, loopRight, loopBottom, strokeWidth)}
      {renderCornerArc("bottomLeft", loopLeft, loopTop, loopRight, loopBottom, strokeWidth)}

      {renderLegSegments({ startPoint: corners.topStart, endPoint: { x: loopRight, y: loopTop }, axis: "x", ids: legGroups.top, elements, positions, strokeWidth })}
      <line x1={corners.bottomEnd.x} y1={loopBottom} x2={loopRight} y2={loopBottom} stroke={wireColor} strokeWidth={strokeWidth} />
      {renderLegSegments({ startPoint: corners.leftStart, endPoint: corners.leftEnd, axis: "y", ids: legGroups.left, elements, positions, strokeWidth })}

      {/* Each rung: vertical wire bridging top rail to bottom rail,
          trimmed around its own component(s) — preserves multi-component
          branch support (e.g. switch + resistor on one rung). */}
      {rungGroups.map((ids, bi) => {
        const branchX = positions[ids[0]]?.x;
        if (branchX == null) return null;
        return (
          <React.Fragment key={`rung-${bi}`}>
            {renderLegSegments({ startPoint: { x: branchX, y: loopTop }, endPoint: { x: branchX, y: loopBottom }, axis: "y", ids, elements, positions, strokeWidth })}
            <JunctionDot x={branchX} y={loopTop} />
            <JunctionDot x={branchX} y={loopBottom} />
          </React.Fragment>
        );
      })}

      {/* Tap dashed stubs — preserved, both horizontal and vertical target cases */}
      {tapIds.map((id) => {
        const pos = positions[id];
        const targetPos = positions[pos.tapTarget];
        const targetEl = elements.find((e) => e.id === pos.tapTarget);
        const el = elements.find((e) => e.id === id);
        if (!targetPos || !targetEl || !el) return null;
        const reachOf = (i) => reachForElement(elements.find((e) => e.id === i));
        const rad = (targetPos.rotation * Math.PI) / 180;
        const alongX = Math.cos(rad), alongY = Math.sin(rad);
        const tR = reachOf(pos.tapTarget), pR = reachOf(id);
        const tA = { x: targetPos.x - alongX * tR, y: targetPos.y - alongY * tR };
        const tB = { x: targetPos.x + alongX * tR, y: targetPos.y + alongY * tR };
        const pA = { x: pos.x - alongX * pR, y: pos.y - alongY * pR };
        const pB = { x: pos.x + alongX * pR, y: pos.y + alongY * pR };
        return (
          <g key={`tap-wire-${id}`}>
            <line x1={tA.x} y1={tA.y} x2={pA.x} y2={pA.y} stroke={wireColor} strokeWidth={strokeWidth} strokeDasharray="3,2" />
            <line x1={tB.x} y1={tB.y} x2={pB.x} y2={pB.y} stroke={wireColor} strokeWidth={strokeWidth} strokeDasharray="3,2" />
          </g>
        );
      })}

      {allPositionedIds.map((id) => {
        const el = elements.find((e) => e.id === id);
        return el && positions[id] ? renderComponent(el, positions[id], strokeWidth, fontSize) : null;
      })}

      

      {/* Preserved: short-circuit bypass rendering, unchanged */}
      {relationships
        .filter((r) => r.type === "shorts")
        .map((rel) => {
          const targetPos = positions[rel.target];
          const targetEl = elements.find((e) => e.id === rel.target);
          return renderShortBypass(null, targetPos, targetEl, strokeWidth);
        })}
    </g>
  );
}


export function renderBridgeCircuitSystem(plane, elements, relationships, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize, width, height } = getSvgDimensions(isMobile);
  const {
    N, S, W, E,
    outerLeftTop, outerLeftBottom, outerRightBottom, outerRightTop,
    leftTopId, rightTopId, leftBottomId, rightBottomId, galvId, battId, switchId,
    positions, contentBounds
  } = plane;
  const fitTransform = computeFitTransform(contentBounds, isMobile);
  const wireColor = "#334155";

  const renderOuterLeft = () =>
    battId
      ? renderTrimmedEdge(outerLeftTop, outerLeftBottom, battId, elements, strokeWidth)
      : <line x1={outerLeftTop.x} y1={outerLeftTop.y} x2={outerLeftBottom.x} y2={outerLeftBottom.y} stroke={wireColor} strokeWidth={strokeWidth} />;

  const renderOuterBottom = () =>
    switchId
      ? renderTrimmedEdge(outerLeftBottom, outerRightBottom, switchId, elements, strokeWidth)
      : <line x1={outerLeftBottom.x} y1={outerLeftBottom.y} x2={outerRightBottom.x} y2={outerRightBottom.y} stroke={wireColor} strokeWidth={strokeWidth} />;

  return (
    <g transform={fitTransform}>
      <CircuitBackdrop width={width} height={height} patternId="circuit-grid-bridge" />

      {leftTopId && renderTrimmedEdge(W, N, leftTopId, elements, strokeWidth)}
      {rightTopId && renderTrimmedEdge(N, E, rightTopId, elements, strokeWidth)}
      {leftBottomId && renderTrimmedEdge(W, S, leftBottomId, elements, strokeWidth)}
      {rightBottomId && renderTrimmedEdge(S, E, rightBottomId, elements, strokeWidth)}
      {galvId && renderTrimmedEdge(N, S, galvId, elements, strokeWidth)}

      {renderOuterLeft()}
      {renderOuterBottom()}
      <line x1={outerRightBottom.x} y1={outerRightBottom.y} x2={outerRightTop.x} y2={outerRightTop.y} stroke={wireColor} strokeWidth={strokeWidth} />

      <JunctionDot x={N.x} y={N.y} />
      <JunctionDot x={S.x} y={S.y} />
      <JunctionDot x={W.x} y={W.y} />
      <JunctionDot x={E.x} y={E.y} />

      {[leftTopId, rightTopId, leftBottomId, rightBottomId, galvId, battId, switchId].map((id) => {
        const el = elements.find((e) => e.id === id);
        return el && positions[id] ? renderComponent(el, positions[id], strokeWidth, fontSize) : null;
      })}

      {relationships
        .filter((r) => r.type === "shorts")
        .map((rel) => {
          const targetId = rel.target;
          const targetPos = positions[targetId];
          const targetEl = elements.find((e) => e.id === targetId);
          return renderShortBypass(null, targetPos, targetEl, strokeWidth);
        })}
    </g>
  );
}

// renderCombinationCircuitSystem — composed almost entirely from existing pieces

export function renderCombinationCircuitSystem(plane, elements, relationships, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize, width, height } = getSvgDimensions(isMobile);
  const { loopLeft, loopRight, loopTop, loopBottom, orderedIds, subRels, positions, contentBounds } = plane;
  const fitTransform = computeFitTransform(contentBounds, isMobile);
  const wireColor = CIRCUIT_COLORS.wire;
  const corners = getLoopCorners(loopLeft, loopTop, loopRight, loopBottom);
  const legGroups = { top: [], left: [] };
  orderedIds.forEach((id) => {
    const pos = positions[id];
    if (!pos) return;
    if (pos.rotation === 0) legGroups.top.push(id);
    else if (pos.rotation === 90 && pos.x === loopLeft) legGroups.left.push(id);
  });

  const tapIds = Object.keys(positions).filter((id) => positions[id].isTap);

  

  return (
    <g transform={fitTransform}>
      <CircuitBackdrop width={width} height={height} patternId="circuit-grid-combination" />

      {/* FIX: only the LEFT corners exist — this is a ladder network, not
          a closed rectangle. There is no wire on the outer right edge for
          topRight/bottomRight to curve into. */}
      {renderCornerArc("topLeft", loopLeft, loopTop, loopRight, loopBottom, strokeWidth)}
      {renderCornerArc("bottomLeft", loopLeft, loopTop, loopRight, loopBottom, strokeWidth)}

      {/* FIX: top and bottom rails now end FLAT at loopRight (straight to
          the last rung's own edge), not curving toward corners.topEnd /
          corners.bottomStart, which assumed a rectangle that doesn't exist here. */}
      {renderLegSegments({ startPoint: corners.topStart, endPoint: { x: loopRight, y: loopTop }, axis: "x", ids: legGroups.top, elements, positions, strokeWidth })}
      <line x1={corners.bottomEnd.x} y1={loopBottom} x2={loopRight} y2={loopBottom} stroke={wireColor} strokeWidth={strokeWidth} />
      {renderLegSegments({ startPoint: corners.leftStart, endPoint: corners.leftEnd, axis: "y", ids: legGroups.left, elements, positions, strokeWidth })}

      {subRels.map((rel, bi) => {
        const branchX = positions[rel.elements[0]]?.x;
        console.log(`Rung ${bi} (${rel.elements[0]}) drawn at branchX:`, branchX);
        if (branchX == null) return null;
        return (
          <React.Fragment key={`rung-${bi}`}>
            {renderLegSegments({ startPoint: { x: branchX, y: loopTop }, endPoint: { x: branchX, y: loopBottom }, axis: "y", ids: rel.elements, elements, positions, strokeWidth })}
            <JunctionDot x={branchX} y={loopTop} />
            <JunctionDot x={branchX} y={loopBottom} />
          </React.Fragment>
        );
      })}

      {/* tap dashed-stub rendering unchanged from previous version */}
      {tapIds.map((id) => {
        const pos = positions[id];
        const targetPos = positions[pos.tapTarget];
        const targetEl = elements.find((e) => e.id === pos.tapTarget);
        const el = elements.find((e) => e.id === id);
        if (!targetPos || !targetEl || !el) return null;
        const reachOf = (i) => COMPONENT_REACH[elements.find((e) => e.id === i)?.type] || 24;
        const rad = (targetPos.rotation * Math.PI) / 180;
        const alongX = Math.cos(rad), alongY = Math.sin(rad);
        const tReach = reachOf(pos.tapTarget), tapReach = reachOf(id);
        const tA = { x: targetPos.x - alongX * tReach, y: targetPos.y - alongY * tReach };
        const tB = { x: targetPos.x + alongX * tReach, y: targetPos.y + alongY * tReach };
        const pA = { x: pos.x - alongX * tapReach, y: pos.y - alongY * tapReach };
        const pB = { x: pos.x + alongX * tapReach, y: pos.y + alongY * tapReach };
        return (
          <g key={`tap-${id}`}>
            <line x1={tA.x} y1={tA.y} x2={pA.x} y2={pA.y} stroke={wireColor} strokeWidth={strokeWidth} strokeDasharray="3,2" />
            <line x1={tB.x} y1={tB.y} x2={pB.x} y2={pB.y} stroke={wireColor} strokeWidth={strokeWidth} strokeDasharray="3,2" />
          </g>
        );
      })}

      {Object.keys(positions).map((id) => {
        const el = elements.find((e) => e.id === id);
        return el && positions[id] ? renderComponent(el, positions[id], strokeWidth, fontSize) : null;
      })}
    </g>
  );
}


export function renderJunctionCurrents(plane, isMobile = false) {
  if (!plane) return null;
  const { cx, cy, nodeLabel, vectors } = plane;
  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);

  return (
    <g transform={`translate(${cx},${cy})`}>
      {vectors.map((v) => {
        const rad = (v.angle * Math.PI) / 180;
        // Incoming: line runs from far point INTO the node (arrowhead at 0,0).
        // Outgoing: line runs from node OUT to the far point (arrowhead at far end).
        const farX = Math.cos(rad) * v.length;
        const farY = -Math.sin(rad) * v.length;
        const tipX = v.isIncoming ? 0 : farX;
        const tipY = v.isIncoming ? 0 : farY;
        const tailX = v.isIncoming ? farX : 0;
        const tailY = v.isIncoming ? farY : 0;
        const arrowAngle = Math.atan2(tipY - tailY, tipX - tailX);
        const arrowSize = 12;
        const a1 = { x: tipX - Math.cos(arrowAngle - 0.4) * arrowSize, y: tipY - Math.sin(arrowAngle - 0.4) * arrowSize };
        const a2 = { x: tipX - Math.cos(arrowAngle + 0.4) * arrowSize, y: tipY - Math.sin(arrowAngle + 0.4) * arrowSize };

        const labelX = farX * 1.18;
        const labelY = farY * 1.18;

        return (
          <g key={v.id}>
            <line x1={tailX} y1={tailY} x2={tipX} y2={tipY} stroke="#1E293B" strokeWidth={strokeWidth * 1.3} />
            <polygon points={`${tipX},${tipY} ${a1.x},${a1.y} ${a2.x},${a2.y}`} fill="#1E293B" />
            {v.label && (
              <foreignObject x={labelX - 45} y={labelY - 11} width={90} height={22} style={{ overflow: "visible" }}>
                <div style={{ display: "flex", justifyContent: "center", fontSize, fontWeight: 600, color: "#1E293B" }}>
                  <MathText text={(v.label)} />
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}
      <circle cx={0} cy={0} r={4} fill="#475569" />
      {nodeLabel && (
        <text x={0} y={-14} fontSize={fontSize} fontWeight={700} textAnchor="middle" fill="#475569">{nodeLabel}</text>
      )}
    </g>
  );
}


export function renderTwoSourceCombinationSystem(plane, elements, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize, width, height } = getSvgDimensions(isMobile);
  const { loopLeft, loopRight, loopTop, loopBottom, midX, sharedComponents, positions, contentBounds } = plane;
  const wireColor = CIRCUIT_COLORS.wire;
  const fitTransform = computeFitTransform(contentBounds, isMobile);
  const corners = getLoopCorners(loopLeft, loopTop, loopRight, loopBottom); // NEW — was missing entirely

  const allTopIds = Object.keys(positions).filter((id) => positions[id].rotation === 0);
  const leftTopIds = allTopIds.filter((id) => positions[id].x < midX);
  const rightTopIds = allTopIds.filter((id) => positions[id].x >= midX);

  return (
    <g transform={fitTransform}>
      <CircuitBackdrop width={width} height={height} patternId="circuit-grid-twosource" />
      {renderCornerArcs(loopLeft, loopTop, loopRight, loopBottom, strokeWidth)}

      {/* FIX: top-left segment now starts at corners.topStart (the arc's
          actual endpoint), not a hardcoded loopLeft+10 guess */}
      {renderLegSegments({ startPoint: corners.topStart, endPoint: { x: midX, y: loopTop }, axis: "x", ids: leftTopIds, elements, positions, strokeWidth })}
      {/* FIX: same correction on the right side, using corners.topEnd */}
      {renderLegSegments({ startPoint: { x: midX, y: loopTop }, endPoint: corners.topEnd, axis: "x", ids: rightTopIds, elements, positions, strokeWidth })}

      {/* FIX: bottom rail now spans corners.bottomEnd -> corners.bottomStart
          (their actual left/right order), not hardcoded ±10 offsets */}
      <line x1={corners.bottomEnd.x} y1={loopBottom} x2={corners.bottomStart.x} y2={loopBottom} stroke={wireColor} strokeWidth={strokeWidth} />

      {/* FIX: left/right vertical rails now use corners.leftStart/leftEnd
          and corners.rightStart/rightEnd instead of the raw loopTop/loopBottom */}
      {renderLegSegments({ startPoint: corners.leftStart, endPoint: corners.leftEnd, axis: "y", ids: [plane.leftBattery].filter(Boolean), elements, positions, strokeWidth })}
      {renderLegSegments({ startPoint: corners.rightStart, endPoint: corners.rightEnd, axis: "y", ids: [plane.rightBattery].filter(Boolean), elements, positions, strokeWidth })}

      {renderLegSegments({ startPoint: { x: midX, y: loopTop }, endPoint: { x: midX, y: loopBottom }, axis: "y", ids: sharedComponents, elements, positions, strokeWidth })}

      <JunctionDot x={midX} y={loopTop} />
      <JunctionDot x={midX} y={loopBottom} />

      {Object.keys(positions).map((id) => {
        const el = elements.find((e) => e.id === id);
        return el && positions[id] ? renderComponent(el, positions[id], strokeWidth, fontSize) : null;
      })}
    </g>
  );
}

export function renderMeterBridge(plane, isMobile = false) {
  if (!plane) return null;
  const { wireLeft, wireRight, wireY, stripY, midX, nullX, rLabel, sLabel, galvLabel, batteryLabel, nullPointLabel, contentBounds } = plane;
  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const fitTransform = computeFitTransform(contentBounds, isMobile);
  const wireColor = CIRCUIT_COLORS.wire;

  const rReach = COMPONENT_REACH.resistor;
  const rCenterX = wireLeft + (wireRight - wireLeft) * 0.28;
  const sCenterX = wireLeft + (wireRight - wireLeft) * 0.72;
  const jockeyTipY = wireY - 4; 

  return (
    <g transform={fitTransform}>
      {/* Top metal strip: two horizontal segments, gaps for R and S, bent
          down at both ends to meet the wire's endpoints (A and C) */}
      <line x1={wireLeft} y1={stripY} x2={rCenterX - rReach} y2={stripY} stroke={wireColor} strokeWidth={strokeWidth} />
      <line x1={rCenterX + rReach} y1={stripY} x2={midX - 8} y2={stripY} stroke={wireColor} strokeWidth={strokeWidth} />
      <line x1={midX + 8} y1={stripY} x2={sCenterX - rReach} y2={stripY} stroke={wireColor} strokeWidth={strokeWidth} />
      <line x1={sCenterX + rReach} y1={stripY} x2={wireRight} y2={stripY} stroke={wireColor} strokeWidth={strokeWidth} />
      <line x1={wireLeft} y1={stripY} x2={wireLeft} y2={wireY} stroke={wireColor} strokeWidth={strokeWidth} />
      <line x1={wireRight} y1={stripY} x2={wireRight} y2={wireY} stroke={wireColor} strokeWidth={strokeWidth} />

      {/* R and S sitting in the two gaps */}
      {renderComponent({ id: "r", type: "resistor", label: rLabel }, { x: rCenterX, y: stripY, rotation: 0, labelSide: "outer" }, strokeWidth, fontSize)}
      {renderComponent({ id: "s", type: "resistor", label: sLabel }, { x: sCenterX, y: stripY, rotation: 0, labelSide: "outer" }, strokeWidth, fontSize)}

      {/* Midpoint node dot, between the two gaps */}
      <JunctionDot x={midX} y={stripY} />

      {/* The 1m measuring wire — drawn as a distinct, thicker/colored line
          with tick marks like a ruler, per the reference description */}
      <line x1={wireLeft} y1={wireY} x2={wireRight} y2={wireY} stroke="#B45309" strokeWidth={strokeWidth * 1.4} />
      {Array.from({ length: 11 }, (_, i) => {
        const x = wireLeft + (i / 10) * (wireRight - wireLeft);
        return <line key={i} x1={x} y1={wireY - 5} x2={x} y2={wireY + 5} stroke="#78716C" strokeWidth={1} />;
      })}

      <text x={wireLeft + 8} y={wireY + 24} fontSize={fontSize * 1.15} textAnchor="middle" fill="#57534E">A</text>
      <text x={wireRight-8} y={wireY + 24} fontSize={fontSize * 1.15} textAnchor="middle" fill="#57534E">C</text>

      {/* Jockey / null point marker on the wire */}
      <circle cx={nullX} cy={wireY} r={4} fill="#DC2626" stroke="#991B1B" strokeWidth={1.5} />
      <line x1={nullX} y1={wireY} x2={nullX} y2={wireY - (stripY - wireY) * 0.35} stroke="#DC2626" strokeWidth={1.5} strokeDasharray="3,2" />
      {nullPointLabel && (
        <foreignObject x={nullX - 35} y={wireY + 28} width={70} height={20} style={{ overflow: "visible" }}>
          <div style={{ display: "flex", justifyContent: "center", fontSize: fontSize * 0.9, fontWeight: 600, color: "#DC2626" }}>
            <MathText text={(nullPointLabel)} />
          </div>
        </foreignObject>
      )}

      {/* Galvanometer: from the R/S midpoint node down to the jockey/null point */}
      <line x1={midX} y1={stripY} x2={nullX} y2={jockeyTipY} stroke={wireColor} strokeWidth={strokeWidth} />
      {(() => {
        const galvX = (midX + nullX) / 2;
        const galvY = (stripY + jockeyTipY) / 2;
        return renderComponent(
          { id: "g", type: "galvanometer", label: galvLabel },
          { x: galvX, y: galvY, rotation: (Math.atan2(jockeyTipY - stripY, nullX - midX) * 180) / Math.PI, labelSide: "outer" },
          strokeWidth, fontSize
        );
      })()}

      {/* Battery + closing wire beneath the measuring wire, A to C */}
      <line x1={wireLeft} y1={wireY} x2={wireLeft} y2={wireY + 30} stroke={wireColor} strokeWidth={strokeWidth} />
      <line x1={wireRight} y1={wireY} x2={wireRight} y2={wireY + 30} stroke={wireColor} strokeWidth={strokeWidth} />
      {renderComponent({ id: "batt", type: "battery", label: batteryLabel }, { x: midX, y: wireY + 30, rotation: 0, labelSide: "outer" }, strokeWidth, fontSize)}
      <line x1={wireLeft} y1={wireY + 30} x2={midX - COMPONENT_REACH.battery} y2={wireY + 30} stroke={wireColor} strokeWidth={strokeWidth} />
      <line x1={midX + COMPONENT_REACH.battery} y1={wireY + 30} x2={wireRight} y2={wireY + 30} stroke={wireColor} strokeWidth={strokeWidth} />
    </g>
  );
}