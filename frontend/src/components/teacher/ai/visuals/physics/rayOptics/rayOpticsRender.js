import { getSvgDimensions } from "../../geometry/geometryHelpers";
import { 
    renderVectorToPoint, renderLensSymbol, renderDimensionLine, OPTICS_COLORS,
    renderMathLabel,renderConcaveMirrorSymbol,renderVerticalDimensionLine,
    renderDirectionAngleArc, angleOfVector,mediumFill, renderMidRayArrow,
    renderConcaveLensSymbol, interpretRayPath, buildStubRayPaths, lineAtX, intersectLines,
    interpretMirrorRayPath, renderConvexMirrorSymbol, convexMirrorCurve, intersectWithSurface
    } from "./rayOpticsHelpers";


export function renderConvexLensSystem(plane, elements, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize, width } = getSvgDimensions(isMobile);
  const { lensX, axisY, positions, isVirtual, isAtF, showImage } = plane;
  const { lens, object, image } = positions;
  const extend = isMobile ? 35 : 55;

  const objectTip = { x: object.x, y: object.tipY };
  const ray1Entry = { x: lensX, y: object.tipY };
  const centerPoint = { x: lensX, y: axisY };

  const extendPoint = (from, awayFrom, len) => {
    const dx = from.x - awayFrom.x, dy = from.y - awayFrom.y;
    const mag = Math.hypot(dx, dy) || 1;
    return { x: from.x + (dx / mag) * len, y: from.y + (dy / mag) * len };
  };

  let rayPaths;

  if (!showImage) {
    // Only ray 1 (crosses lens at OBJECT height) and the center ray (crosses at
    // axis height) are safe to show — neither depends on knowing the image
    // position. Ray 3 is dropped entirely, not just truncated: its lens-crossing
    // point is defined BY the image height, so even a stub of it would leak.
    rayPaths = buildStubRayPaths(objectTip, [ray1Entry, centerPoint]);
  } else if (isAtF) {
    const dirX = centerPoint.x - object.x;
    const dirY = centerPoint.y - objectTip.y;
    const farPoint = (from) => {
      const t = (width - from.x) / dirX;
      return { x: width, y: from.y + dirY * t };
    };
    rayPaths = [
      [{ points: [objectTip, ray1Entry, farPoint(ray1Entry)] }],
      [{ points: [objectTip, centerPoint, farPoint(centerPoint)] }],
    ];
  } else {
    const imageTip = { x: image.x, y: image.tipY };
    const ray3Entry = { x: lensX, y: image.tipY };
    rayPaths = [
      isVirtual
        ? [{ points: [objectTip, ray1Entry] }, { points: [ray1Entry, imageTip], dashed: true }, { points: [ray1Entry, extendPoint(ray1Entry, imageTip, extend)] }]
        : [{ points: [objectTip, ray1Entry, imageTip] }],
      isVirtual
        ? [{ points: [objectTip, centerPoint] }, { points: [centerPoint, extendPoint(centerPoint, objectTip, extend)] }, { points: [objectTip, imageTip], dashed: true }]
        : [{ points: [objectTip, centerPoint, imageTip] }],
      isVirtual
        ? [{ points: [objectTip, ray3Entry] }, { points: [ray3Entry, extendPoint(ray3Entry, imageTip, extend)] }, { points: [ray3Entry, imageTip], dashed: true }]
        : [{ points: [objectTip, ray3Entry, imageTip] }],
    ];
  }

  return (
    <g>
      <line x1={0} y1={axisY} x2={width} y2={axisY} stroke={OPTICS_COLORS.axis} strokeDasharray="4,3" strokeWidth={strokeWidth} />
      {renderLensSymbol(lensX, lens.topY, lens.bottomY, strokeWidth)}

      {Object.entries(positions)
        .filter(([id]) => !["lens", "object", "image"].includes(id))
        .map(([id, pos]) => (
          <g key={id}>
            <circle cx={pos.x} cy={pos.y} r={7} fill={OPTICS_COLORS.marker} fillOpacity={0.15} />
            <circle cx={pos.x} cy={pos.y} r={3} fill={OPTICS_COLORS.marker} />
            {renderMathLabel(pos.x, pos.y + 15, pos.label, fontSize, OPTICS_COLORS.marker)}
          </g>
        ))}

      {renderVectorToPoint({ x: object.x, y: object.baseY, toX: object.x, toY: object.tipY, color: OPTICS_COLORS.object })}
      {renderDimensionLine(object.x, lensX, axisY + 30, object.distanceLabel, strokeWidth, fontSize)}

      {showImage && !isAtF && renderVectorToPoint({ x: image.x, y: image.baseY, toX: image.x, toY: image.tipY, color: OPTICS_COLORS.image, dashed: isVirtual })}

      {rayPaths.flat().map((seg, i) => (
        <polyline key={i} points={seg.points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={OPTICS_COLORS.ray}
          strokeWidth={strokeWidth} strokeDasharray={seg.dashed ? "5,4" : undefined} markerEnd={seg.dashed ? undefined : "url(#ray-arrow)"} />
      ))}
    </g>
  );
}



export function renderConcaveMirrorSystem(plane, elements, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize, width } = getSvgDimensions(isMobile);
  const { mirrorX, axisY, positions, isVirtual, isAtF, showImage } = plane;
  const { mirror, object, F, C, image } = positions;
  const extend = isMobile ? 35 : 55;

  const objectTip = { x: object.x, y: object.tipY };
  const ray1MirrorPoint = { x: mirrorX, y: object.tipY };

  const extendPoint = (from, awayFrom, len) => {
    const dx = from.x - awayFrom.x, dy = from.y - awayFrom.y;
    const mag = Math.hypot(dx, dy) || 1;
    return { x: from.x + (dx / mag) * len, y: from.y + (dy / mag) * len };
  };

  let rayPaths;

  if (!showImage) {
    // Unlike lens's ray3, all three mirror-crossing points here are already
    // computed from object + F/C only (never from image) — safe to show all 3
    // incident rays; only the reflected continuation toward the image is cut.
    const ray2MirrorPoint = C ? lineAtX(objectTip, { x: C.x, y: C.y }, mirrorX) : null;
    const ray3MirrorPoint = F ? lineAtX(objectTip, { x: F.x, y: F.y }, mirrorX) : null;
    rayPaths = buildStubRayPaths(objectTip, [ray1MirrorPoint, ray2MirrorPoint, ray3MirrorPoint]);
  } else if (isAtF) {
    const ray2MirrorPoint = lineAtX(objectTip, { x: mirrorX - plane.cPlotDist * plane.scale, y: axisY }, mirrorX);
    rayPaths = [
      [{ points: [objectTip, ray1MirrorPoint, extendPoint(ray1MirrorPoint, objectTip, extend)] }],
      [{ points: [objectTip, ray2MirrorPoint, extendPoint(ray2MirrorPoint, objectTip, extend)] }],
    ];
  } else {
    const imageTip = { x: image.x, y: image.tipY };
    const ray2MirrorPoint = C ? lineAtX(objectTip, { x: C.x, y: C.y }, mirrorX) : null;
    const ray3MirrorPoint = F ? lineAtX(objectTip, { x: F.x, y: F.y }, mirrorX) : null;

    rayPaths = [
      isVirtual
        ? [
            { points: [objectTip, ray1MirrorPoint] },
            { points: [ray1MirrorPoint, F ? extendPoint(F, ray1MirrorPoint, extend) : extendPoint(objectTip, ray1MirrorPoint, extend)] },
            { points: [ray1MirrorPoint, imageTip], dashed: true },
          ]
        : [{ points: [objectTip, ray1MirrorPoint, imageTip] }],
      ray2MirrorPoint
        ? [{ points: [objectTip, ray2MirrorPoint] }, { points: [ray2MirrorPoint, imageTip], dashed: isVirtual }]
        : [],
      ray3MirrorPoint
        ? isVirtual
          ? [
              { points: [objectTip, ray3MirrorPoint] },
              { points: [ray3MirrorPoint, extendPoint(ray3MirrorPoint, objectTip, extend)] },
              { points: [ray3MirrorPoint, imageTip], dashed: true },
            ]
          : [{ points: [objectTip, ray3MirrorPoint, imageTip] }]
        : [],
    ];
  }

  return (
    <g>
      <line x1={0} y1={axisY} x2={width} y2={axisY} stroke={OPTICS_COLORS.axis} strokeDasharray="4,3" strokeWidth={strokeWidth} />
      {renderConcaveMirrorSymbol(mirrorX, mirror.topY, mirror.bottomY, strokeWidth)}

      {[F, C].filter(Boolean).map((pos, i) => (
        <g key={i}>
          <circle cx={pos.x} cy={pos.y} r={7} fill={OPTICS_COLORS.marker} fillOpacity={0.15} />
          <circle cx={pos.x} cy={pos.y} r={3} fill={OPTICS_COLORS.marker} />
          {renderMathLabel(pos.x, pos.y + 20, pos.label, fontSize, OPTICS_COLORS.marker)}
        </g>
      ))}

      {renderVectorToPoint({ x: object.x, y: object.baseY, toX: object.x, toY: object.tipY, color: OPTICS_COLORS.object })}
      {renderDimensionLine(object.x, mirrorX, axisY + 30, object.distanceLabel, strokeWidth, fontSize)}

      {showImage && !isAtF && renderVectorToPoint({ x: image.x, y: image.baseY, toX: image.x, toY: image.tipY, color: OPTICS_COLORS.image, dashed: isVirtual })}

      {rayPaths.flat().map((seg, i) => (
        <polyline key={i} points={seg.points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={OPTICS_COLORS.ray}
          strokeWidth={strokeWidth} strokeDasharray={seg.dashed ? "5,4" : undefined} markerEnd={seg.dashed ? undefined : "url(#ray-arrow)"} />
      ))}
    </g>
  );
}


export function renderRefractionSystem(plane, elements, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize, width, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const { axisX, interfaceYs, orderedMedia, segments, isSlab, incidentAngle, thickness } = plane;
 
  const bandYs = [0, ...interfaceYs, SVG_HEIGHT];

  // <-- INSERT these 3 lines (new — nothing here before):
  const incidentSeg = segments[0];
  const vertex = incidentSeg.to;
  const towardSource = { dx: incidentSeg.from.x - vertex.x, dy: incidentSeg.from.y - vertex.y };
  // --> END INSERT

  return (
    <g>
    {orderedMedia.map((m, i) => {
      const { color, opacity } = mediumFill(m.label, m.index);
      const bandY = bandYs[i];
      const bandHeight = bandYs[i + 1] - bandYs[i];
      // Density-driven strength (0 for air-like n≈1.0, stronger as n rises) —
      // independent of whether the label matched a known substance, since
      // glossiness should track real density, not just naming.
      // bump the highlight math to be visible even on already-pale bands
      const highlightStrength = Math.min(Math.max((m.index - 1.0) / 1.4, 0), 1) * 0.6 + 0.2; // floor + steeper

      return (
        <g key={m.id}>
          <rect x={0} y={bandY} width={width} height={bandHeight} fill={color} fillOpacity={opacity} />
          {highlightStrength > 0.05 && (
            <rect x={0} y={bandY} width={width} height={Math.min(bandHeight * 0.35, 40)}
              fill="url(#medium-highlight-gradient)" opacity={highlightStrength} />
          )}
        </g>
      );
    })}

      {interfaceYs.map((y, i) => (
        <line key={`iface-${i}`} x1={0} y1={y} x2={width} y2={y} stroke={OPTICS_COLORS.marker} strokeWidth={strokeWidth} />
      ))}

      {interfaceYs.map((y, i) => (
        <line key={`normal-${i}`} x1={axisX} y1={y - 60} x2={axisX} y2={y + 60}
          stroke={OPTICS_COLORS.axis} strokeDasharray="4,3" strokeWidth={strokeWidth * 0.8} />
      ))}

      {orderedMedia.map((m, i) => renderMathLabel(60, (bandYs[i] + bandYs[i + 1]) / 2, m.label, fontSize, OPTICS_COLORS.marker))}

    {segments.map((seg, i) => (
      <g key={i}>
        <line x1={seg.from.x} y1={seg.from.y} x2={seg.to.x} y2={seg.to.y}
          stroke={OPTICS_COLORS.ray} strokeWidth={strokeWidth} />
        {renderMidRayArrow(seg.from, seg.to, OPTICS_COLORS.ray, strokeWidth)}
      </g>
    ))}


  
      {/* <-- REPLACE the deleted line above WITH this: */}
      {renderDirectionAngleArc(
        vertex,
        angleOfVector(0, -1),
        angleOfVector(towardSource.dx, towardSource.dy),
        40, OPTICS_COLORS.object, `${incidentAngle}°`, fontSize
      )}

      {isSlab && renderVerticalDimensionLine(axisX + 160, interfaceYs[0], interfaceYs[1], String(thickness), strokeWidth, fontSize)}
    </g>
  );
}

export function renderTIRSystem(plane, elements, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize, width, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const { axisX, interfaceY, orderedMedia, incidentFrom, incidentTo, reflectedTo, refractedTo, isAtCritical,isAboveCritical, angleLabel } = plane;
  const bandYs = [0, interfaceY, SVG_HEIGHT];
  const vertex = incidentTo;
  const towardSource = { dx: incidentFrom.x - vertex.x, dy: incidentFrom.y - vertex.y };

  return (
    <g>
      {orderedMedia.map((m, i) => {
        const { color, opacity } = mediumFill(m.label, m.index);
        const bandY = bandYs[i], bandHeight = bandYs[i + 1] - bandYs[i];
        const highlightStrength = Math.min(Math.max((m.index - 1.0) / 1.4, 0), 1) * 0.6 + 0.2;
        return (
          <g key={m.id}>
            <rect x={0} y={bandY} width={width} height={bandHeight} fill={color} fillOpacity={opacity} />
            <rect x={0} y={bandY} width={width} height={Math.min(bandHeight * 0.35, 40)} fill="url(#medium-highlight-gradient)" opacity={highlightStrength} />
          </g>
        );
      })}

      <line x1={0} y1={interfaceY} x2={width} y2={interfaceY} stroke={OPTICS_COLORS.marker} strokeWidth={strokeWidth} />
      <line x1={axisX} y1={interfaceY - 60} x2={axisX} y2={interfaceY + 60} stroke={OPTICS_COLORS.axis} strokeDasharray="4,3" strokeWidth={strokeWidth * 0.8} />
      {orderedMedia.map((m, i) => renderMathLabel(60, (bandYs[i] + bandYs[i + 1]) / 2, m.label, fontSize, OPTICS_COLORS.marker))}

      <line x1={incidentFrom.x} y1={incidentFrom.y} x2={incidentTo.x} y2={incidentTo.y}
        stroke={OPTICS_COLORS.ray} strokeWidth={strokeWidth} />
      {renderMidRayArrow(incidentFrom, incidentTo, OPTICS_COLORS.ray, strokeWidth)}

      {/* Below critical: drawn fainter + dashed to suggest partial (weaker) reflection — a design choice, not payload-specified; flagged below. */}
      <line x1={vertex.x} y1={vertex.y} x2={reflectedTo.x} y2={reflectedTo.y}
        stroke={OPTICS_COLORS.ray}
        strokeWidth={(isAboveCritical || isAtCritical) ? strokeWidth : strokeWidth * 0.7}
        strokeOpacity={(isAboveCritical || isAtCritical) ? 1 : 0.6} />
      {renderMidRayArrow(vertex, reflectedTo, OPTICS_COLORS.ray, strokeWidth)}

      {refractedTo && (
        <>
          <line x1={vertex.x} y1={vertex.y} x2={refractedTo.x} y2={refractedTo.y} stroke={OPTICS_COLORS.image} strokeWidth={strokeWidth} />
          {renderMidRayArrow(vertex, refractedTo, OPTICS_COLORS.image, strokeWidth)}
        </>
      )}

      {angleLabel && renderDirectionAngleArc(vertex, angleOfVector(0, 1), angleOfVector(towardSource.dx, towardSource.dy), 40, OPTICS_COLORS.object, angleLabel, fontSize)}
    </g>
  );
}


export function renderConcaveLensSystem(plane, elements, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { lensX, axisY, positions, rayEls, useExplicitRays, nearFocalPoint, extend, showImage } = plane;
  const { lens, object, image } = positions;
  const objectTip = { x: object.x, y: object.tipY };
  const imageTip = { x: image.x, y: image.tipY };
  const centerPoint = { x: lensX, y: axisY };

  let rayGroups;
  if (useExplicitRays) {
    // MCQ ray-identification questions — never gated by showImage, since the
    // question is about ray-path correctness, not image location.
    rayGroups = rayEls.map((rayEl) => interpretRayPath(rayEl, positions, lensX, axisY, extend));
  } else {
    const ray1LensPoint = { x: lensX, y: object.tipY };
    const dx1 = ray1LensPoint.x - nearFocalPoint.x, dy1 = ray1LensPoint.y - nearFocalPoint.y;
    const mag1 = Math.hypot(dx1, dy1) || 1;
    const ray1Far = { x: ray1LensPoint.x + (dx1 / mag1) * extend, y: ray1LensPoint.y + (dy1 / mag1) * extend };

    const dx2 = centerPoint.x - objectTip.x, dy2 = centerPoint.y - objectTip.y;
    const mag2 = Math.hypot(dx2, dy2) || 1;
    const ray2Far = { x: centerPoint.x + (dx2 / mag2) * extend, y: centerPoint.y + (dy2 / mag2) * extend };

    rayGroups = [
      showImage
        ? [{ from: objectTip, to: ray1LensPoint }, { from: ray1LensPoint, to: ray1Far }, { from: ray1LensPoint, to: imageTip, dashed: true }]
        : [{ from: objectTip, to: ray1LensPoint }, { from: ray1LensPoint, to: ray1Far }], // dashed image-convergence segment dropped only
      // Ray 2 never referenced imageTip in the first place — already leak-safe, unchanged either way.
      [{ from: objectTip, to: centerPoint }, { from: centerPoint, to: ray2Far }],
    ];
  }

  return (
    <g>
      <line x1={0} y1={axisY} x2={2000} y2={axisY} stroke={OPTICS_COLORS.axis} strokeDasharray="4,3" strokeWidth={strokeWidth} />
      {renderConcaveLensSymbol(lensX, lens.topY, lens.bottomY, strokeWidth)}

      {Object.entries(positions).filter(([id]) => !["lens", "object", "image"].includes(id)).map(([id, pos]) => (
        <g key={id}>
          <circle cx={pos.x} cy={pos.y} r={7} fill={OPTICS_COLORS.marker} fillOpacity={0.15} />
          <circle cx={pos.x} cy={pos.y} r={3} fill={OPTICS_COLORS.marker} />
          {renderMathLabel(pos.x, pos.y + 20, pos.label, fontSize, OPTICS_COLORS.marker)}
        </g>
      ))}

      {renderVectorToPoint({ x: object.x, y: object.baseY, toX: object.x, toY: object.tipY, color: OPTICS_COLORS.object })}
      {renderDimensionLine(object.x, lensX, axisY + 30, object.distanceLabel, strokeWidth, fontSize)}
      {(useExplicitRays || showImage) && renderVectorToPoint({ x: image.x, y: image.baseY, toX: image.x, toY: image.tipY, color: OPTICS_COLORS.image, dashed: true })}

      {rayGroups.flat().map((seg, i) => (
        <g key={i}>
          <line x1={seg.from.x} y1={seg.from.y} x2={seg.to.x} y2={seg.to.y} stroke={OPTICS_COLORS.ray} strokeWidth={strokeWidth} strokeDasharray={seg.dashed ? "5,4" : undefined} />
          {!seg.dashed && renderMidRayArrow(seg.from, seg.to, OPTICS_COLORS.ray, strokeWidth)}
        </g>
      ))}
    </g>
  );
}

export function renderConvexMirrorSystem(plane, elements, isMobile = false) {
  if (!plane) return null;
  const { strokeWidth, fontSize, width } = getSvgDimensions(isMobile);
  const { mirrorX, axisY, positions, showImage, useExplicitRays, rayConstructionRays, frontFPoint, extend } = plane;
  const { mirror, object, image, F_right, C_right } = positions;
  const objectTip = { x: object.x, y: object.tipY };
  let imageTipDrawn = { x: image.x, y: image.tipY };
  const EXPLICIT_RAY_COLORS = ["#e8870a", "#c0392b", "#2980b9"]; // extend if a payload ever has more than 3 rays
  let rayGroups, rayLabels;

  if (useExplicitRays) {
    rayGroups = rayConstructionRays.map((rayDef) => interpretMirrorRayPath(rayDef, objectTip, mirrorX, axisY, positions, frontFPoint, extend));
    // Spread labels out (different t per ray, alternating vertical offset) since
    // renderConvexMirrorSystem — replace the rayLabels construction inside useExplicitRays:
    // THIS is where "Ray A" / "Ray B" / "Ray C" labels get computed:
    // renderConvexMirrorSystem — rayLabels construction, replace the whole map body:
      rayLabels = rayConstructionRays.map((rayDef, i) => {
        const segs = rayGroups[i];
        if (!segs || segs.length === 0) return null;
        const targetSeg = segs[segs.length - 1];
        const labelText = elements.find((e) => e.id === rayDef.id)?.label || rayDef.id;

        const t = 0.85; // near the tip, away from where rays commonly cross mid-segment
        const baseX = targetSeg.from.x + (targetSeg.to.x - targetSeg.from.x) * t;
        const baseY = targetSeg.from.y + (targetSeg.to.y - targetSeg.from.y) * t;

        const dx = targetSeg.to.x - targetSeg.from.x, dy = targetSeg.to.y - targetSeg.from.y;
        const mag = Math.hypot(dx, dy) || 1;
        let perpX = -dy / mag, perpY = dx / mag;
        if (perpY > 0) { perpX = -perpX; perpY = -perpY; } // always push upward, never downward

        const vertOffset = 20;
        const horizOffset = 20 * (i - (rayConstructionRays.length - 1) / 2); // spreads labels apart HORIZONTALLY, independent of ray slope

        return {
          x: baseX + perpX * vertOffset + horizOffset,
          y: baseY + perpY * vertOffset,
          text: labelText,
          color: EXPLICIT_RAY_COLORS[i % EXPLICIT_RAY_COLORS.length],
        };
      });
  } else {
      rayLabels = [];
      const { surfaceX } = convexMirrorCurve(mirrorX, mirror.topY, mirror.bottomY);
      const ray1MirrorPoint = { x: surfaceX(object.tipY), y: object.tipY };
      const ray2MirrorPoint = C_right
        ? intersectWithSurface(objectTip, C_right, surfaceX, mirrorX)
        : { x: surfaceX(axisY), y: axisY };

      if (showImage && F_right && C_right) {
        const hit = intersectLines(ray1MirrorPoint, F_right, ray2MirrorPoint, C_right);
        if (hit) imageTipDrawn = hit;
      }

      rayGroups = [
        [{ from: objectTip, to: ray1MirrorPoint }, { from: ray1MirrorPoint, to: F_right, dashed: true }],
        showImage
          ? [{ from: objectTip, to: ray2MirrorPoint, reversedArrow: true }, { from: ray2MirrorPoint, to: C_right, dashed: true }]
          : [{ from: objectTip, to: ray2MirrorPoint, reversedArrow: true }],
      ];
    }
  const polePoint = { x: mirrorX, y: axisY };

  return (
    <g>
      <line x1={0} y1={axisY} x2={width} y2={axisY} stroke={OPTICS_COLORS.axis} strokeDasharray="4,3" strokeWidth={strokeWidth} />
      {renderConvexMirrorSymbol(mirrorX, mirror.topY, mirror.bottomY, strokeWidth)}

      {/* Pole (P) — the mirror/axis intersection point, always present physically
          but never in the payload, so rendered unconditionally like the axis itself. */}
      <circle cx={polePoint.x} cy={polePoint.y} r={7} fill={OPTICS_COLORS.marker} fillOpacity={0.15} />
      <circle cx={polePoint.x} cy={polePoint.y} r={3} fill={OPTICS_COLORS.marker} />
      {renderMathLabel(polePoint.x, polePoint.y + 20, "P", fontSize, OPTICS_COLORS.marker)}

      {[F_right, C_right].filter(Boolean).map((pos, i) => (
        <g key={i}>
          <circle cx={pos.x} cy={pos.y} r={7} fill={OPTICS_COLORS.marker} fillOpacity={0.15} />
          <circle cx={pos.x} cy={pos.y} r={3} fill={OPTICS_COLORS.marker} />
          {renderMathLabel(pos.x, pos.y + 20, pos.label, fontSize, OPTICS_COLORS.marker)}
        </g>
      ))}

      { renderVectorToPoint({ x: object.x, y: object.baseY, toX: object.x, toY: object.tipY, color: OPTICS_COLORS.object })}
      {renderDimensionLine(object.x, mirrorX, axisY + 30, object.distanceLabel, strokeWidth, fontSize)}
      {showImage && renderVectorToPoint({ x: imageTipDrawn.x, y: image.baseY, toX: imageTipDrawn.x, toY: imageTipDrawn.y, color: OPTICS_COLORS.image, dashed: true })}

      {rayGroups.map((group, rayIndex) => group.map((seg, i) => {
        const color = useExplicitRays ? EXPLICIT_RAY_COLORS[rayIndex % EXPLICIT_RAY_COLORS.length] : OPTICS_COLORS.ray;
        return (
          <g key={`${rayIndex}-${i}`}>
            <line x1={seg.from.x} y1={seg.from.y} x2={seg.to.x} y2={seg.to.y} stroke={color} strokeWidth={strokeWidth} strokeDasharray={seg.dashed ? "5,4" : undefined} />
            {seg.reversedArrow
              ? renderMidRayArrow(seg.to, seg.from, color, strokeWidth)
              : !seg.dashed && renderMidRayArrow(seg.from, seg.to, color, strokeWidth)}
          </g>
        );
      }))}

      {rayLabels.filter(Boolean).map((l, i) => (
        <g key={`label-${i}`}>{renderMathLabel(l.x, l.y, l.text, fontSize, l.color)}</g>
      ))}
    </g>
  );
}