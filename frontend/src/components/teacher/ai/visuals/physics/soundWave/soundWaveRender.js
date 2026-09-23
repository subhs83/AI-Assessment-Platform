
import { getSvgDimensions } from "../../geometry/geometryHelpers";
import MathText from "../../../../../common/MathText"


export function renderTransverseWave(plane, elements, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { points, centerY, startX, pxWavelength, pxAmplitude, SVG_WIDTH } = plane;

  const amplitudeMarkerEl = elements.find((el) => el.id === "amplitude_marker");
  const wavelengthMarkerEl = elements.find((el) => el.id === "wavelength_marker");

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Amplitude marker: vertical double-arrow from centerline to the
  // first crest, positioned just after the wave starts.
  const crestX = startX + pxWavelength * 0.25; // first crest is at 1/4 wavelength
  const crestY = centerY - pxAmplitude;

  // Wavelength marker: horizontal double-arrow between two consecutive
  // points at the same phase (e.g. two consecutive crests).
  const secondCrestX = crestX + pxWavelength;

  return (
    <g>
      <defs>
        <marker id="wave-arrow-end" markerWidth="8" markerHeight="8" refX="6" refY="4" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="context-stroke" />
        </marker>
        <marker id="wave-arrow-start" markerWidth="8" markerHeight="8" refX="2" refY="4" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 Z" fill="context-stroke" />
        </marker>
      </defs>

      {/* Centerline (equilibrium position) */}
      <line x1={startX} y1={centerY} x2={SVG_WIDTH - 20} y2={centerY}
        stroke="currentColor" strokeWidth={strokeWidth * 0.4} strokeDasharray="4,4"
        className="text-slate-300" vectorEffect="non-scaling-stroke" />

      {/* The wave itself */}
      <path d={pathD} fill="none" stroke="#378add" strokeWidth={strokeWidth * 1.3} vectorEffect="non-scaling-stroke" />

      {/* Amplitude marker: vertical double-arrow at the first crest */}
      {amplitudeMarkerEl && (
        <g>
          <line x1={crestX} y1={centerY} x2={crestX} y2={crestY}
            stroke="#D85A30" strokeWidth={strokeWidth}
            markerEnd="url(#wave-arrow-end)" markerStart="url(#wave-arrow-start)" vectorEffect="non-scaling-stroke" />
          <foreignObject x={crestX + 8} y={(centerY + crestY) / 2 - 12} width={90} height={24}>
            <div style={{ display: "flex", alignItems: "center", height: "100%", fontSize, fontWeight: 600, color: "#D85A30" }}>
              <MathText text={amplitudeMarkerEl.label} />
            </div>
          </foreignObject>
        </g>
      )}

      {/* Wavelength marker: horizontal double-arrow between two crests */}
      {wavelengthMarkerEl && (
        <g>
          <line x1={crestX} y1={crestY - 15} x2={secondCrestX} y2={crestY - 15}
            stroke="#1D9E75" strokeWidth={strokeWidth}
            markerEnd="url(#wave-arrow-end)" markerStart="url(#wave-arrow-start)" vectorEffect="non-scaling-stroke" />
          <foreignObject x={(crestX + secondCrestX) / 2 - 45} y={crestY - 40} width={90} height={22}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize, fontWeight: 600, color: "#1D9E75" }}>
              <MathText text={wavelengthMarkerEl.label} />
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  );
}


export function renderStandingWave(plane, elements, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { envelopeTop, envelopeBottom, centerY, startX, endX, toPixel, displayAmplitude, totalLengthMeters } = plane;

  const nodeEls = elements.filter((el) => el.id?.startsWith("node_marker"));
  const antinodeEls = elements.filter((el) => el.id?.startsWith("antinode_marker"));
  const measurementEls = elements.filter((el) => el.type === "measurement" && el.x1 !== undefined);

  const topPathD = envelopeTop.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const bottomPathD = envelopeBottom.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const niceTickStep = (() => {
    const roughSteps = [1, 2, 2.5, 5, 10, 20, 25, 50];
    const target = totalLengthMeters / 8;
    return roughSteps.reduce((best, step) =>
      Math.abs(step - target) < Math.abs(best - target) ? step : best
    , roughSteps[0]);
  })();

  const ticks = [];
  for (let x = 0; x <= totalLengthMeters + 1e-9; x += niceTickStep) {
    ticks.push(Math.round(x * 100) / 100);
  }

  return (
    <g>
      {/* Centerline — now doubles as the x-axis, with tick marks */}
      <line x1={startX} y1={centerY} x2={endX} y2={centerY}
        stroke="#5f5e5a" strokeWidth={strokeWidth * 0.6} strokeDasharray="4,4"
        vectorEffect="non-scaling-stroke" />
      {ticks.map((xMeters) => {
        const p = toPixel(xMeters, 0);
        return (
          <g key={`tick-${xMeters}`}>
            <line x1={p.x} y1={centerY - 4} x2={p.x} y2={centerY + 4}
              stroke="#5f5e5a" strokeWidth={strokeWidth * 0.8} vectorEffect="non-scaling-stroke" />
            <foreignObject x={p.x - 15} y={centerY + 7} width={30} height={fontSize * 1.4}>
              <div className="flex items-center justify-center text-slate-600" style={{ fontSize: fontSize * 1 }}>
                {xMeters}
              </div>
            </foreignObject>
          </g>
        );
      })}

      {/* Envelope curves */}
      <path d={topPathD} fill="none" stroke="#378add" strokeWidth={strokeWidth * 1.2}
        strokeDasharray="6,4" vectorEffect="non-scaling-stroke" />
      <path d={bottomPathD} fill="none" stroke="#378add" strokeWidth={strokeWidth * 1.2}
        strokeDasharray="6,4" vectorEffect="non-scaling-stroke" />

      {nodeEls[0] && (() => {
        const p = toPixel(nodeEls[0].x, 0);
        return (
          <g>
            <circle cx={p.x} cy={p.y} r={4} fill="#185fa5" />
            <foreignObject x={p.x - 25} y={p.y - fontSize * 2.4} width={70} height={fontSize * 1.6}>
              <div className="flex items-center font-semibold text-[#185fa5]" style={{ fontSize: fontSize * 0.85 }}>
                Node
              </div>
            </foreignObject>
          </g>
        );
      })()}
      {antinodeEls[0] && (() => {
        const p = toPixel(antinodeEls[0].x, displayAmplitude);
        return (
          <g>
            <circle cx={p.x} cy={p.y} r={4} fill="#D85A30" />
            <foreignObject x={p.x - 30} y={p.y - fontSize * 2.4} width={80} height={fontSize * 1.6}>
              <div className="flex items-center font-semibold text-[#D85A30]" style={{ fontSize: fontSize * 0.85 }}>
                Antinode
              </div>
            </foreignObject>
          </g>
        );
      })()}

      {measurementEls.map((el) => {
        const p1 = toPixel(el.x1, el.y1 ?? 0);
        const p2 = toPixel(el.x2, el.y2 ?? 0);
        const midX = (p1.x + p2.x) / 2;
        const bracketY = centerY + 26; // below the tick labels now, to avoid collision
        return (
          <g key={el.id}>
            <line x1={p1.x} y1={bracketY} x2={p2.x} y2={bracketY}
              stroke="#5f5e5a" strokeWidth={strokeWidth * 0.6} vectorEffect="non-scaling-stroke" />
            <line x1={p1.x} y1={bracketY - 4} x2={p1.x} y2={bracketY + 4}
              stroke="#5f5e5a" strokeWidth={strokeWidth * 0.6} vectorEffect="non-scaling-stroke" />
            <line x1={p2.x} y1={bracketY - 4} x2={p2.x} y2={bracketY + 4}
              stroke="#5f5e5a" strokeWidth={strokeWidth * 0.6} vectorEffect="non-scaling-stroke" />
            <foreignObject x={midX - 25} y={bracketY + 6} width={50} height={fontSize * 1.6}>
              <div className="flex items-center justify-center font-semibold text-slate-700" style={{ fontSize: fontSize * 0.85 }}>
                <MathText text={el.label} />
              </div>
            </foreignObject>
          </g>
        );
      })}
    </g>
  );
}


export function renderLongitudinalWave(plane, elements, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { particles, centerY, startX, endX, toPixel, totalLengthMeters } = plane;

  const pointEls = elements.filter((el) => el.type === "point" && el.x_position !== undefined);

  const niceTickStep = (() => {
    const roughSteps = [1, 2, 2.5, 5, 10, 20, 25, 50];
    const target = totalLengthMeters / 8;
    return roughSteps.reduce((best, step) =>
      Math.abs(step - target) < Math.abs(best - target) ? step : best
    , roughSteps[0]);
  })();
  const ticks = [];
  for (let x = 0; x <= totalLengthMeters + 1e-9; x += niceTickStep) {
    ticks.push(Math.round(x * 100) / 100);
  }

  return (
    <g>
      {/* Baseline with ticks, same convention as standing wave's axis */}
      <line x1={startX} y1={centerY + 30} x2={endX} y2={centerY + 30}
        stroke="#5f5e5a" strokeWidth={strokeWidth * 0.6} strokeDasharray="4,4"
        vectorEffect="non-scaling-stroke" />
      {ticks.map((xMeters) => {
        const p = toPixel(xMeters);
        return (
          <g key={`tick-${xMeters}`}>
            <line x1={p.x} y1={centerY + 26} x2={p.x} y2={centerY + 34}
              stroke="#5f5e5a" strokeWidth={strokeWidth * 0.8} vectorEffect="non-scaling-stroke" />
            <foreignObject x={p.x - 15} y={centerY + 37} width={30} height={fontSize * 1.4}>
              <div className="flex items-center justify-center text-slate-600" style={{ fontSize: fontSize * 0.75 }}>
                {xMeters}
              </div>
            </foreignObject>
          </g>
        );
      })}

      {/* Particles: density visually shows compression/rarefaction */}
      {particles.map((p, i) => (
        <circle key={`particle-${i}`} cx={p.x} cy={p.y} r={3} fill="#378add" />
      ))}

      {/* Labeled reference points, placed at their given x_position,
          on top of the particle field they're meant to identify. */}
      {pointEls.map((el) => {
        const p = toPixel(el.x_position);
        return (
          <g key={el.id}>
            <circle cx={p.x} cy={p.y} r={5} fill="none" stroke="#D85A30" strokeWidth={strokeWidth} />
            <foreignObject x={p.x - 12} y={p.y - fontSize * 2.2} width={24} height={fontSize * 1.6}>
              <div className="flex items-center justify-center font-semibold text-[#D85A30]" style={{ fontSize }}>
                {el.label}
              </div>
            </foreignObject>
          </g>
        );
      })}
    </g>
  );
}


export function renderFixedStringHarmonic(plane, elements, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth } = getSvgDimensions(isMobile);
  const { envelopeTop, envelopeBottom, nodePoints, antinodePoints, fixedLeft, fixedRight, centerY } = plane;

  const topPathD = envelopeTop.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const bottomPathD = envelopeBottom.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Fixed-end symbol: a small wall/hatch mark, the conventional way
  // physics diagrams show a rigidly fixed support.
  const renderFixedEnd = (p, keyPrefix) => (
    <g key={keyPrefix}>
      <line x1={p.x} y1={p.y - 20} x2={p.x} y2={p.y + 20}
        stroke="#5f5e5a" strokeWidth={strokeWidth * 1.2} vectorEffect="non-scaling-stroke" />
      {[-14, -7, 0, 7, 14].map((offset) => (
        <line key={offset} x1={p.x} y1={p.y + offset} x2={p.x - 6} y2={p.y + offset + 6}
          stroke="#5f5e5a" strokeWidth={strokeWidth * 0.6} vectorEffect="non-scaling-stroke" />
      ))}
    </g>
  );

  return (
    <g>
      <line x1={fixedLeft.x} y1={centerY} x2={fixedRight.x} y2={centerY}
        stroke="#5f5e5a" strokeWidth={strokeWidth * 0.5} strokeDasharray="4,4"
        vectorEffect="non-scaling-stroke" />

      <path d={topPathD} fill="none" stroke="#378add" strokeWidth={strokeWidth * 1.2}
        strokeDasharray="6,4" vectorEffect="non-scaling-stroke" />
      <path d={bottomPathD} fill="none" stroke="#378add" strokeWidth={strokeWidth * 1.2}
        strokeDasharray="6,4" vectorEffect="non-scaling-stroke" />

      {/* Fixed-end supports, drawn as hatched walls */}
      {renderFixedEnd(fixedLeft, "fixed-left")}
      {renderFixedEnd(fixedRight, "fixed-right")}

      {/* All nodes and antinodes ARE shown here — unlike the open-ended
          standing wave topic, this figure's whole point is for the
          student to COUNT them, so hiding any would defeat the
          question. No answer-leaking risk here since the question
          never asks "where is node #2", only "how many total". */}
      {nodePoints.map((p, i) => (
        <circle key={`node-${i}`} cx={p.x} cy={p.y} r={4} fill="#185fa5" />
      ))}
      {antinodePoints.map((p, i) => (
        <circle key={`antinode-${i}`} cx={p.x} cy={p.y} r={4} fill="#D85A30" />
      ))}
    </g>
  );
}


export function renderWaveSuperposition(plane, elements, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { wave1Points, wave2Points, resultantPoints, centerY, startX, endX } = plane;

  const wave1El = elements.find((el) => el.id === "wave_1");
  const wave2El = elements.find((el) => el.id === "wave_2");
  const resultantEl = elements.find((el) => el.id === "resultant_wave");

  const pathFrom = (points) => points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
   return (
    <g>
      <line x1={startX} y1={centerY} x2={endX} y2={centerY}
        stroke="#5f5e5a" strokeWidth={strokeWidth * 0.4} strokeDasharray="4,4"
        vectorEffect="non-scaling-stroke" />

      {/* Component waves — dashed, since they're the "inputs" being
          combined, not the actual physical outcome shown here. */}
      <path d={pathFrom(wave1Points)} fill="none" stroke="#378add" strokeWidth={strokeWidth}
        strokeDasharray="5,4" vectorEffect="non-scaling-stroke" />
      <path d={pathFrom(wave2Points)} fill="none" stroke="#1D9E75" strokeWidth={strokeWidth}
        strokeDasharray="5,4" vectorEffect="non-scaling-stroke" />

      {/* Resultant — solid, the real physical wave produced by superposition */}
      <path d={pathFrom(resultantPoints)} fill="none" stroke="#D85A30" strokeWidth={strokeWidth * 1.5}
        vectorEffect="non-scaling-stroke" />

      {/* Legend */}
      <g transform={`translate(${startX}, ${centerY - (plane.centerY - plane.startX > 0 ? 0 : 0)})`}>
        {[
          { label: wave1El?.label || "Wave 1", color: "#378add", dashed: true },
          { label: wave2El?.label || "Wave 2", color: "#1D9E75", dashed: true },
          { label: resultantEl?.label || "Resultant", color: "#D85A30", dashed: false },
        ].map((item, i) => (
          <g key={item.label} transform={`translate(${i * 110}, 0)`}>
            <line x1={0} y1={0} x2={20} y2={0} stroke={item.color}
              strokeWidth={strokeWidth * (item.dashed ? 1 : 1.5)}
              strokeDasharray={item.dashed ? "5,4" : undefined} />
            <foreignObject x={24} y={-fontSize} width={90} height={fontSize * 2}>
              <div className="flex items-center text-slate-700" style={{ fontSize: fontSize * 0.85 }}>
                {item.label}
              </div>
            </foreignObject>
          </g>
        ))}
      </g>
    </g>
  );
}


export function renderDopplerEffect(plane, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { sourcePos, sourceLabel, wavefronts, observers } = plane;

  return (
    <g>
      {/* Wavefronts — drawn largest (oldest) first, so smaller/newer
          circles layer visibly on top near the source. */}
      {wavefronts.map((wf) => (
        <circle key={wf.id} cx={wf.center.x} cy={wf.center.y} r={wf.radius}
          fill="none" stroke="#378add" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      ))}

      {/* Source, with a small arrow indicating direction of motion */}
      {sourcePos && (
        <g>
          <circle cx={sourcePos.x} cy={sourcePos.y} r={5} fill="#D85A30" />
          <line x1={sourcePos.x} y1={sourcePos.y} x2={sourcePos.x + 18} y2={sourcePos.y}
            stroke="#D85A30" strokeWidth={strokeWidth} markerEnd="url(#physics-arrow)"
            vectorEffect="non-scaling-stroke" />
          {sourceLabel && (
            <foreignObject x={sourcePos.x - 40} y={sourcePos.y + 10} width={100} height={fontSize * 1.6}>
              <div className="flex items-center font-semibold text-[#D85A30]" style={{ fontSize: fontSize * 0.9 }}>
                {sourceLabel}
              </div>
            </foreignObject>
          )}
        </g>
      )}

      {/* Observers */}
      {observers.map((obs) => (
        <g key={obs.id}>
          <circle cx={obs.pos.x} cy={obs.pos.y} r={4} fill="#185fa5" />
          <foreignObject x={obs.pos.x - 20} y={obs.pos.y - fontSize * 2.2} width={40} height={fontSize * 1.6}>
            <div className="flex items-center justify-center font-semibold text-[#185fa5]" style={{ fontSize: fontSize * 0.9 }}>
              {obs.label}
            </div>
          </foreignObject>
        </g>
      ))}
    </g>
  );
}