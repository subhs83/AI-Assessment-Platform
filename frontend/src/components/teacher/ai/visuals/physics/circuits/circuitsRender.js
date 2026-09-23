import React from 'react';
import { getSvgDimensions } from "../../geometry/geometryHelpers";
import { renderTrimmedEdge, getLoopCorners, JunctionDot, CIRCUIT_COLORS, CircuitBackdrop, renderCornerArcs, renderCornerArc, renderLegSegments, COMPONENT_REACH,
  renderComponent, reachForElement,  renderShortBypass,
 } from "./circuitsHelpers";
 



export function renderCircuitSystem(plane, elements, relationships, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize, width, height } = getSvgDimensions(isMobile);
  const { loopLeft, loopRight, loopTop, loopBottom, orderedIds, positions } = plane;

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
    <g>
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
  const { loopLeft, loopRight, loopTop, loopBottom, seriesIds, rungGroups, positions } = plane;
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
    <g>
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
    positions,
  } = plane;
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
    <g>
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
  const { loopLeft, loopRight, loopTop, loopBottom, orderedIds, subRels, positions } = plane;
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
    <g>
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


