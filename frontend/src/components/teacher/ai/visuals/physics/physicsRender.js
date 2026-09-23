import { getSvgDimensions } from "../geometry/geometryHelpers";
import { renderVector, renderArrowMarkerDefs, computeVectorEndpoint} from "./physicsHelpers";
import MathText from "../../../../common/MathText"

export function renderFreeBodyDiagram(plane, isMobile = false) {
  if (!plane) return null;

  const { centerX, centerY, objectEl, vectorEls } = plane;
   const { fontSize } = getSvgDimensions(isMobile);

  // Size the box to fit its label text, with padding — rather than a
  // fixed size that can be smaller than the label itself.
  const labelText = objectEl?.label || "";
  const estimatedTextWidth = labelText.length * 8 + 24; // rough char-width estimate + padding
  const objectSize = Math.max(50, estimatedTextWidth);
  const objectHeight = 50;

  return (
    <g>
      {renderArrowMarkerDefs()}

      {objectEl && (
        <g>
          <rect
            x={centerX - objectSize / 2}
            y={centerY - objectHeight / 2}
            width={objectSize}
            height={objectHeight}
            fill="#E6F1FB"
            stroke="#185fa5"
            strokeWidth="2"
            rx="4"
          />
          {objectEl.label && (
            <text x={centerX} y={centerY} textAnchor="middle" dominantBaseline="middle"
              fontSize={fontSize * (isMobile? 1 :1.15) }className="fill-slate-800 font-semibold select-none">
              {objectEl.label}
            </text>
          )}
        </g>
      )}

      {vectorEls.map((v) => {
        const rad = (v.angle * Math.PI) / 180;
        // Start from whichever edge (horizontal or vertical) the arrow
        // actually exits through, using the box's real half-width/height
        // rather than a single shared radius — avoids the arrow visually
        // clipping through a corner or starting inside the label text.
        const halfW = objectSize / 2;
        const halfH = objectHeight / 2;
        const startX = centerX + Math.cos(rad) * halfW;
        const startY = centerY - Math.sin(rad) * halfH;

        return renderVector(
          { x: startX, y: startY, angleDeg: v.angle, length: v.length, label: v.label,  dashed: v.dashed},
          isMobile
        );
      })}
    </g>
  );
}


export function renderInclinedPlane(plane, elements, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { rampPoints, objectCenter, inclineAngle } = plane;

  const objectEl = elements.find((el) => el.type === "shape");
  const vectorEls = elements.filter((el) => el.type === "vector");
  const angleEl = elements.find((el) => el.type === "angle");

  const labelText = objectEl?.label || "";
  const boxWidth = Math.max(50, labelText.length * 8 + 24);
  const boxHeight = 36;

  // FIX: rotate the box CLOCKWISE by inclineAngle (positive), matching
  // a ramp that descends left-to-right. The previous `slopeAngleDeg`
  // (= -inclineAngle) rotated it the opposite way, so the box's long
  // axis pointed away from the slope instead of along it — that's why
  // it visually crossed through the incline line instead of resting
  // flush on top of it.
  const rotationDeg = inclineAngle;
  const rotRad = (rotationDeg * Math.PI) / 180;

  const MAX_LABEL_ROTATION = 30;
  const clampedTextRotation = Math.max(-MAX_LABEL_ROTATION, rotationDeg);

  const ARC_RADIUS = 28;
  const arcStart = { x: rampPoints.bottomRight.x - ARC_RADIUS, y: rampPoints.bottomRight.y };
  const arcEnd = {
    x: rampPoints.bottomRight.x - ARC_RADIUS * Math.cos((inclineAngle * Math.PI) / 180),
    y: rampPoints.bottomRight.y - ARC_RADIUS * Math.sin((inclineAngle * Math.PI) / 180),
  };
  const arcLabelPos = {
    x: rampPoints.bottomRight.x - (ARC_RADIUS + 18) * Math.cos((inclineAngle * Math.PI / 2) / 180),
    y: rampPoints.bottomRight.y - (ARC_RADIUS + 18) * Math.sin((inclineAngle * Math.PI / 2) / 180),
  };

  return (
    <g>
      <defs>
        <marker id="physics-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="context-stroke" />
        </marker>
      </defs>

      <polygon
        points={`${rampPoints.peak.x},${rampPoints.peak.y} ${rampPoints.bottomLeft.x},${rampPoints.bottomLeft.y} ${rampPoints.bottomRight.x},${rampPoints.bottomRight.y}`}
        fill="#F1EFE8" stroke="#5f5e5a" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke"
      />

      {angleEl && (
        <>
          <path
            d={`M ${arcStart.x} ${arcStart.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
            fill="none" stroke="#5f5e5a" strokeWidth={strokeWidth * 0.6} vectorEffect="non-scaling-stroke"
            />
          <text x={arcLabelPos.x} y={arcLabelPos.y+5} textAnchor="middle"
            fontSize={fontSize * (isMobile ? 1 : 1.15)} className="fill-slate-600 select-none">
            {angleEl.value ? `${angleEl.value}°` : angleEl.label}
          </text>
        </>
      )}

      <g transform={`rotate(${rotationDeg}, ${objectCenter.x}, ${objectCenter.y})`}>
        <rect
          x={objectCenter.x - boxWidth / 2} y={objectCenter.y - boxHeight / 2}
          width={boxWidth} height={boxHeight}
          fill="#E6F1FB" stroke="#185fa5" strokeWidth="2" rx="4"
        />
      </g>
      <text
        x={objectCenter.x} y={objectCenter.y}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={fontSize * (isMobile ? 1 : 1.15)} className="fill-slate-800 font-semibold select-none"
        transform={`rotate(${clampedTextRotation}, ${objectCenter.x}, ${objectCenter.y})`}
      >
        {labelText}
      </text>

      {vectorEls.map((v) => {
        // FIX: give each vector its own anchor point on the box's
        // (rotated) perimeter, instead of all sharing objectCenter.
        // 1. Convert the vector's WORLD angle into the box's LOCAL,
        //    unrotated frame: localAngle = worldAngle + rotationDeg.
        // 2. Find an edge point in that local frame (same trick
        //    renderFreeBodyDiagram already uses for the flat case).
        // 3. Rotate that local point back into world space by
        //    rotationDeg, and translate by objectCenter.
        const halfW = boxWidth / 2;
        const halfH = boxHeight / 2;

        const localAngleDeg = v.angle + rotationDeg;
        const localRad = (localAngleDeg * Math.PI) / 180;
        const lx = Math.cos(localRad) * halfW;
        const ly = -Math.sin(localRad) * halfH;

        const worldDX = lx * Math.cos(rotRad) - ly * Math.sin(rotRad);
        const worldDY = lx * Math.sin(rotRad) + ly * Math.cos(rotRad);

        const anchorX = objectCenter.x + worldDX;
        const anchorY = objectCenter.y + worldDY;

        return (
          <g key={v.id}>
            {renderVector(
              {
                x: anchorX, y: anchorY, angleDeg: v.angle, // world angle unchanged — arrow still points correctly
                length: v.length, label: v.label,
                color: v.dashed ? "#5f5e5a" : "#D85A30", dashed: v.dashed,
              },
              isMobile
            )}
          </g>
        );
      })}
    </g>
  );
}


export function renderPulleySystem(plane, elements, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { pulleyX, pulleyY, pulleyRadius, objectPositions } = plane;

  const objects = elements.filter((el) => el.type === "shape");
  const vectorEls = elements.filter((el) => el.type === "vector");

  return (
    <g>
      <defs>
        <marker id="physics-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="context-stroke" />
        </marker>
      </defs>

      {/* Support structure (ceiling bracket) */}
      <line x1={pulleyX - 15} y1={pulleyY - pulleyRadius - 10} x2={pulleyX + 15} y2={pulleyY - pulleyRadius - 10}
        stroke="#5f5e5a" strokeWidth={strokeWidth * 1.5} />
      <line x1={pulleyX} y1={pulleyY - pulleyRadius - 10} x2={pulleyX} y2={pulleyY - pulleyRadius}
        stroke="#5f5e5a" strokeWidth={strokeWidth} />

      {/* Pulley wheel */}
      <circle cx={pulleyX} cy={pulleyY} r={pulleyRadius} fill="#F1EFE8" stroke="#5f5e5a" strokeWidth={strokeWidth} />

      {/* Rope: from each object up to the pulley's edge */}
      {objects.map((obj) => {
        const pos = objectPositions[obj.id];
        const ropeAttachX = pulleyX + (obj.side === "left" ? -pulleyRadius : pulleyRadius);
        return (
          <line key={`rope-${obj.id}`}
            x1={pos.x} y1={pos.y - 18} x2={ropeAttachX} y2={pulleyY}
            stroke="#5f5e5a" strokeWidth={strokeWidth} />
        );
      })}

      {/* Objects */}
      {objects.map((obj) => {
        const pos = objectPositions[obj.id];
        const boxWidth = Math.max(40, (obj.label?.length || 0) * 7 + 16);
        return (
          <g key={obj.id}>
            <rect x={pos.x - boxWidth / 2} y={pos.y - 18} width={boxWidth} height={36}
              fill="#E6F1FB" stroke="#185fa5" strokeWidth="2" rx="4" />
            <foreignObject x={pos.x - boxWidth / 2} y={pos.y - 18} width={boxWidth} height={36}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  fontSize,
                  fontWeight: 600,
                }}
                className="text-slate-800"
              >
                <MathText text={obj.label} />
              </div>
            </foreignObject>
          </g>
        );
      })}

      {/* Force vectors, using attached_to to find their object's position */}
      {vectorEls.map((v) => {
        const pos = objectPositions[v.attached_to];
        if (!pos) return null;
        return (
          <g key={v.id}>
            {renderVector({ x: pos.x, y: pos.y, angleDeg: v.angle, length: v.length, label: v.label }, isMobile)}
          </g>
        );
      })}
    </g>
  );
}



export function renderInclinePulleySystem(plane, elements, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { rampPoints, pulleyX, pulleyY, pulleyRadius, objectACenter, objectBCenter, inclineAngle } = plane;

  const objectAEl = elements.find((el) => el.id === "object_a");
  const objectBEl = elements.find((el) => el.id === "object_b");
  const vectorEls = elements.filter((el) => el.type === "vector");

  const boxHeight = 36;
  const boxWidthFor = (label) => Math.max(50, (label?.length || 0) * 5 );
  const boxWidthA = boxWidthFor(objectAEl?.label);
  const boxWidthB = boxWidthFor(objectBEl?.label);

  // object_a rotates WITH the incline (same sign-fix as the standalone
  // incline calculator: rotate by +inclineAngle, clockwise, to match a
  // slope descending left-to-right).
  const rotationDeg = inclineAngle;
  const rotRad = (rotationDeg * Math.PI) / 180;
  return (
    <g>
      <defs>
        <marker id="physics-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="context-stroke" />
        </marker>
      </defs>

      {/* Incline surface */}
      <polygon
        points={`${rampPoints.peak.x},${rampPoints.peak.y} ${rampPoints.bottomLeft.x},${rampPoints.bottomLeft.y} ${rampPoints.bottomRight.x},${rampPoints.bottomRight.y}`}
        fill="#F1EFE8" stroke="#5f5e5a" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke"
      />

      {/* Pulley support + wheel, mounted above the peak */}
      <line x1={pulleyX-15} y1={pulleyY - pulleyRadius - 17} x2={pulleyX-15} y2={pulleyY - pulleyRadius-5}
        stroke="#5f5e5a" strokeWidth={strokeWidth} />
      <line x1={pulleyX - 29} y1={pulleyY - pulleyRadius - 17} x2={pulleyX} y2={pulleyY - pulleyRadius - 17}
        stroke="#5f5e5a" strokeWidth={strokeWidth * 1.5} />
      <circle cx={pulleyX-15} cy={pulleyY-5} r={pulleyRadius} fill="#F1EFE8" stroke="#5f5e5a" strokeWidth={strokeWidth} />

      {/* Rope: object_b (left, straight down) -> pulley LEFT side */}
      <line x1={pulleyX - pulleyRadius*1.5} y1={pulleyY- pulleyRadius*1.25}
        x2={objectBCenter.x} y2={objectBCenter.y - boxHeight / 2}
        stroke="#5f5e5a" strokeWidth={strokeWidth} />

      {/* Rope: pulley RIGHT side -> object_a's up-slope edge (SAME point tension_a anchors at) */}
      <line x1={pulleyX-3} y1={pulleyY - pulleyRadius}
        x2={objectACenter.x - Math.cos(rotRad) * (boxWidthA / 2) * 0.3}
        y2={objectACenter.y + Math.sin(rotRad) * (boxWidthA / 2) * 0.1}
        stroke="#5f5e5a" strokeWidth={strokeWidth} />

      {/* object_a: rotated box on the incline */}
      <g transform={`rotate(${rotationDeg}, ${objectACenter.x}, ${objectACenter.y})`}>
        <rect x={objectACenter.x - boxWidthA / 2} y={objectACenter.y - boxHeight / 2}
          width={boxWidthA} height={boxHeight} fill="#E6F1FB" stroke="#185fa5" strokeWidth="2" rx="4" />
      </g>
      {objectAEl?.label && (
        <foreignObject x={objectACenter.x - boxWidthA / 2} y={objectACenter.y - boxHeight / 2}
          width={boxWidthA} height={boxHeight}
          transform={`rotate(${Math.max(-30, Math.min(30, rotationDeg))}, ${objectACenter.x}, ${objectACenter.y})`}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize, fontWeight: 600 }}
            className="text-slate-800">
            <MathText text={objectAEl.label} />
          </div>
        </foreignObject>
      )}

      {/* object_b: flat hanging box */}
      <rect x={objectBCenter.x - boxWidthB / 2} y={objectBCenter.y - (boxHeight / 2)}
        width={boxWidthB} height={boxHeight} fill="#E6F1FB" stroke="#185fa5" strokeWidth="2" rx="4" />
      {objectBEl?.label && (
        <foreignObject x={objectBCenter.x - boxWidthB / 2} y={objectBCenter.y - boxHeight / 2}
          width={boxWidthB} height={boxHeight}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize, fontWeight: 600 }}
            className="text-slate-800">
            <MathText text={objectBEl.label} />
          </div>
        </foreignObject>
      )}
      {/* Vectors — object_a uses incline-rotated anchor points (same
          local->world conversion as the standalone incline fix);
          object_b uses simple top/bottom edge anchors (same as the
          flat pulley fix). */}
      {vectorEls.map((v) => {
        const isOnA = v.attached_to === "object_a";
        const center = isOnA ? objectACenter : objectBCenter;
        const boxW = isOnA ? boxWidthA : boxWidthB;
        const halfH = boxHeight / 2;

        let anchorX, anchorY;
        let drawAngle = v.angle;

        if (v.id === "tension_a") {
          // Correct up-slope edge: MINUS cos/sin, toward the peak/pulley,
          // matching objectAEdge used for the rope line itself — guaranteed
          // consistent by using the exact same formula, no separate
          // perpendicular offset needed at all.
          anchorX = objectACenter.x - Math.cos(rotRad) * (boxWidthA / 2)* 0.3;
          anchorY = objectACenter.y + Math.sin(rotRad) * (boxWidthA / 2)* 0.1;

          const toPulleyX = pulleyX - anchorX;
          const toPulleyY = pulleyY - anchorY;
          drawAngle = (Math.atan2(-toPulleyY, toPulleyX) * 180) / Math.PI;console.log("[DEBUG tension_a]", { objectACenter, rotRad, anchorX, anchorY, pulleyX, pulleyY, toPulleyX, toPulleyY, drawAngle });


        } else if (isOnA) {
          const localAngleDeg = v.angle - rotationDeg;
          const localRad = (localAngleDeg * Math.PI) / 180;
          const lx = Math.cos(localRad) * (boxW / 2);
          const ly = -Math.sin(localRad) * halfH;
          anchorX = center.x + (lx * Math.cos(rotRad) - ly * Math.sin(rotRad));
          anchorY = center.y + (lx * Math.sin(rotRad) + ly * Math.cos(rotRad));

        } else {
          const rad = (v.angle * Math.PI) / 180;
          anchorX = center.x;
          anchorY = center.y - Math.sin(rad) * halfH;
        }

        return (
          <g key={v.id}>
            {renderVector({ x: anchorX, y: anchorY, angleDeg: drawAngle, length: v.length, label: v.label }, isMobile)}
          </g>
        );
      })}
    </g>
  );
}



export function renderProjectileMotion(plane, elements, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { launchPoint, landingPoint, pathPoints, groundY, launchX } = plane;

  const velocityEl = elements.find((el) => el.type === "vector");

  // Trajectory: real sampled kinematic path, drawn as a polyline.
  const pathD = pathPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <g>
        {renderArrowMarkerDefs()}

      {/* Ground */}
      <line x1={0} y1={groundY} x2={launchX + (landingPoint.x - launchX) + 30} y2={groundY}
        stroke="#5f5e5a" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />

      {/* Launch platform (small ledge under the launch point) */}
      <line x1={launchX - 20} y1={launchPoint.y} x2={launchX} y2={launchPoint.y}
        stroke="#5f5e5a" strokeWidth={strokeWidth * 1.5} vectorEffect="non-scaling-stroke" />
      <line x1={launchX - 20} y1={launchPoint.y} x2={launchX - 20} y2={groundY}
        stroke="#5f5e5a" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />

      {/* Trajectory curve */}
      <path d={pathD} fill="none" stroke="#D85A30" strokeWidth={strokeWidth * 1.2}
        strokeDasharray="5,4" vectorEffect="non-scaling-stroke" />

      {/* Launch and landing points */}
      <circle cx={launchPoint.x} cy={launchPoint.y} r={4} fill="#185fa5" />
      <circle cx={landingPoint.x} cy={landingPoint.y} r={4} fill="#185fa5" />

      {/* Initial velocity vector, horizontal from the launch point */}
      {velocityEl && (() => {
        const end = computeVectorEndpoint(launchPoint.x, launchPoint.y, velocityEl.angle, velocityEl.length);
        return (
          <g>
            <line x1={launchPoint.x} y1={launchPoint.y} x2={end.x} y2={end.y}
              stroke="#D85A30" strokeWidth={strokeWidth * 1.3} vectorEffect="non-scaling-stroke"
              markerEnd="url(#physics-arrow)" />
            <foreignObject x={end.x + 6} y={end.y - fontSize * 1.6} width={120} height={fontSize * 1.8}>
              <div className="flex items-center font-semibold text-[#D85A30]" style={{ fontSize }}>
                <MathText text={velocityEl.label} />
              </div>
            </foreignObject>
          </g>
        );
      })()}
    </g>
  );
}


export function renderAngledProjectile(plane, elements, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { launchPoint, landingPoint, peakPoint, pathPoints, groundY } = plane;

  const velocityEl = elements.find((el) => el.type === "vector");
  const peakEl = elements.find((el) => el.id === "peak_point");

  const pathD = pathPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <g>
      {renderArrowMarkerDefs()}

      {/* Ground */}
      <line x1={0} y1={groundY} x2={landingPoint.x + 30} y2={groundY}
        stroke="#5f5e5a" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />

      {/* Trajectory curve */}
      <path d={pathD} fill="none" stroke="#D85A30" strokeWidth={strokeWidth * 1.2}
        strokeDasharray="5,4" vectorEffect="non-scaling-stroke" />

      {/* Peak marker — ONLY when the question includes it */}
      {peakEl && (
        <g>
          <line x1={peakPoint.x} y1={peakPoint.y} x2={peakPoint.x} y2={groundY}
            stroke="#5f5e5a" strokeWidth={strokeWidth * 0.5} strokeDasharray="3,3"
            vectorEffect="non-scaling-stroke" />
          <circle cx={peakPoint.x} cy={peakPoint.y} r={4} fill="#185fa5" />
          <foreignObject x={peakPoint.x - 50} y={peakPoint.y - fontSize * 2.2} width={100} height={fontSize * 1.8}>
            <div className="flex items-center justify-center font-semibold text-[#5f5e5a]" style={{ fontSize }}>
              <MathText text={peakEl.label} />
            </div>
          </foreignObject>
        </g>
      )}

      {/* Launch and landing points */}
      <circle cx={launchPoint.x} cy={launchPoint.y} r={4} fill="#185fa5" />
      <circle cx={landingPoint.x} cy={landingPoint.y} r={4} fill="#185fa5" />

      {/* Initial velocity vector, at the launch angle */}
      {velocityEl && (() => {
        const end = computeVectorEndpoint(launchPoint.x, launchPoint.y, velocityEl.angle, velocityEl.length);
        return (
          <g>
            <line x1={launchPoint.x} y1={launchPoint.y} x2={end.x} y2={end.y}
              stroke="#D85A30" strokeWidth={strokeWidth * 1.3} vectorEffect="non-scaling-stroke"
              markerEnd="url(#physics-arrow)" />
            <foreignObject x={end.x + 6} y={end.y - fontSize * 1.8} width={130} height={fontSize * 1.8}>
              <div className="flex items-center font-semibold text-[#D85A30]" style={{ fontSize }}>
                <MathText text={velocityEl.label} />
              </div>
            </foreignObject>
          </g>
        );
      })()}
    </g>
  );
}

export function renderAngledLaunchFromHeight(plane, elements, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { launchPoint, landingPoint, peakPoint, pathPoints, groundY, launchX } = plane;

  const velocityEl = elements.find((el) => el.type === "vector");
  const peakEl = elements.find((el) => el.id === "peak_point");

  const pathD = pathPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <g>
      {renderArrowMarkerDefs()}

      {/* Ground */}
      <line x1={0} y1={groundY} x2={landingPoint.x + 30} y2={groundY}
        stroke="#5f5e5a" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />

      {/* Launch platform / cliff face */}
      <line x1={launchX - 20} y1={launchPoint.y} x2={launchX} y2={launchPoint.y}
        stroke="#5f5e5a" strokeWidth={strokeWidth * 1.5} vectorEffect="non-scaling-stroke" />
      <line x1={launchX - 20} y1={launchPoint.y} x2={launchX - 20} y2={groundY}
        stroke="#5f5e5a" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />

      {/* Trajectory curve */}
      <path d={pathD} fill="none" stroke="#D85A30" strokeWidth={strokeWidth * 1.2}
        strokeDasharray="5,4" vectorEffect="non-scaling-stroke" />

      {/* Peak marker — only rendered when both the question includes it
          AND a peak actually exists (v0y > 0) */}
      {peakEl && peakPoint && (
        <g>
          <line x1={peakPoint.x} y1={peakPoint.y} x2={peakPoint.x} y2={groundY}
            stroke="#5f5e5a" strokeWidth={strokeWidth * 0.5} strokeDasharray="3,3"
            vectorEffect="non-scaling-stroke" />
          <circle cx={peakPoint.x} cy={peakPoint.y} r={4} fill="#185fa5" />
          <foreignObject x={peakPoint.x - 50} y={peakPoint.y - fontSize * 2.2} width={100} height={fontSize * 1.8}>
            <div className="flex items-center justify-center font-semibold text-[#5f5e5a]" style={{ fontSize }}>
              <MathText text={peakEl.label} />
            </div>
          </foreignObject>
        </g>
      )}

      {/* Launch and landing points */}
      <circle cx={launchPoint.x} cy={launchPoint.y} r={4} fill="#185fa5" />
      <circle cx={landingPoint.x} cy={landingPoint.y} r={4} fill="#185fa5" />

      {/* Initial velocity vector */}
      {velocityEl && (() => {
        const end = computeVectorEndpoint(launchPoint.x, launchPoint.y, velocityEl.angle, velocityEl.length);
        return (
          <g>
            <line x1={launchPoint.x} y1={launchPoint.y} x2={end.x} y2={end.y}
              stroke="#D85A30" strokeWidth={strokeWidth * 1.3} vectorEffect="non-scaling-stroke"
              markerEnd="url(#physics-arrow)" />
            <foreignObject x={end.x + 6} y={end.y - fontSize * 1.8} width={130} height={fontSize * 1.8}>
              <div className="flex items-center font-semibold text-[#D85A30]" style={{ fontSize }}>
                <MathText text={velocityEl.label} />
              </div>
            </foreignObject>
          </g>
        );
      })()}
    </g>
  );
}







