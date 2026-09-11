import { getSvgDimensions } from "../geometry/geometryHelpers"; // reuse only the pure dimension utility

export function renderNumberLine(elements, positions, plane, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { toPixelX, centerY, min, max, tick } = plane;

  const ticks = [];
  for (let v = Math.ceil(min / tick) * tick; v <= max; v += tick) {
    ticks.push(Math.round(v * 1e6) / 1e6);
  }

  const lineStart = toPixelX(min);
  const lineEnd = toPixelX(max);

  return (
    <g>
      {/* Base line with arrowheads at both ends */}
      <line x1={lineStart} y1={centerY} x2={lineEnd} y2={centerY}
        stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-800"
        vectorEffect="non-scaling-stroke" markerEnd="url(#arrow-end)" markerStart="url(#arrow-start)" />

      {/* Tick marks + numbers */}
      {ticks.map((v) => {
        const x = toPixelX(v);
        return (
          <g key={`tick-${v}`}>
            <line x1={x} y1={centerY - 5} x2={x} y2={centerY + 5}
              stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-800"
              vectorEffect="non-scaling-stroke" />
            <text x={x} y={centerY + (isMobile ? 30: 20)} textAnchor="middle" fontSize={fontSize*(isMobile ? 0.95: 1.15)}
              className="fill-slate-800 select-none">
              {v}
            </text>
          </g>
        );
      })}

      {/* Special elements: rays (shaded regions) and open/closed circles */}
      {(elements || []).map((el) => {
        if (el.type === "ray") {
        const startX = toPixelX(el.start_x);
        const endX = el.direction === "left" ? lineStart - 15 : lineEnd + 15;
        return (
            <line
            key={el.id}
            x1={startX} y1={centerY} x2={endX} y2={centerY}
            stroke="currentColor"
            strokeWidth={strokeWidth * 2.2}
            className={el.is_shaded ? "text-blue-600" : "text-slate-400"}
            vectorEffect="non-scaling-stroke"
            markerEnd="url(#arrow-end)"
            />
        );
        }
        if (el.type === "circle" && Number.isFinite(el.center_x)) {
          const x = toPixelX(el.center_x);
          return (
            <circle
              key={el.id}
              cx={x} cy={centerY} r="6"
              fill={el.is_hollow ? "white" : "currentColor"}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-blue-600"
              vectorEffect="non-scaling-stroke"
            />
          );
        }
        return null;
      })}

      {/* Point labels (from renderPoints-equivalent, but simplified for 1D) */}
        {(elements || []).map((el) => {
        if (el.type !== "point" || !positions[el.id]) return null;
        if (el.id.startsWith("marker_") || el.label === String(el.x)) return null;// skip generic reference points — axis ticks already show these
        const pos = positions[el.id];
        return (
            <g key={el.id}>
            <circle cx={pos.x} cy={pos.y} r="3.5" fill="currentColor" className="text-slate-800" />
            {el.label && (
                <text x={pos.x} y={pos.y - (isMobile ? 20: 14)} textAnchor="middle" fontSize={fontSize* (isMobile ? 0.95: 1.15)}
                className="fill-slate-800 font-bold select-none">
                {el.label}
                </text>
            )}
            </g>
        );
        })}

      {/* Arrow marker defs */}
      <defs>
        <marker id="arrow-end" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" className="text-slate-800" />
        </marker>
        <marker id="arrow-start" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" className="text-slate-800" />
        </marker>
      </defs>
    </g>
  );
}



export function renderBarGraph(plane, title, xAxisLabel, yAxisLabel, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { bars, chartLeft, chartRight, chartTop, chartBottom, yMax, tick } = plane;

  const yTicks = [];
  for (let v = 0; v <= yMax; v += tick) {
    yTicks.push(Math.round(v * 1e6) / 1e6);
  }

  const valueToY = (v) => chartBottom - (v / yMax) * (chartBottom - chartTop);

  return (
    <g>
      {/* Y-axis gridlines + labels */}
      {yTicks.map((v) => {
        const y = valueToY(v);
        return (
          <g key={`ytick-${v}`}>
            <line x1={chartLeft} y1={y} x2={chartRight} y2={y}
              stroke="currentColor" strokeWidth={strokeWidth * 0.4}
              className="text-slate-200" vectorEffect="non-scaling-stroke" />
            <text x={chartLeft - (isMobile ? 14: 8)} y={y} textAnchor="end" dominantBaseline="middle"
              fontSize={fontSize * (isMobile ? 0.95: 1.15)} className="fill-slate-600 select-none">
              {v}
            </text>
          </g>
        );
      })}

      {/* Axes */}
      <line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom}
        stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-800"
        vectorEffect="non-scaling-stroke" />
      <line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom}
        stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-800"
        vectorEffect="non-scaling-stroke" />

      {/* Bars */}
      {bars.map((bar, i) => (
        <g key={`bar-${i}`}>
          <rect x={bar.x} y={bar.y} width={bar.width} height={bar.height}
            fill="currentColor" className="text-blue-500" rx="2" />
          <text x={bar.x + bar.width / 2} y={bar.y - (isMobile ? 10: 6)} textAnchor="middle"
            fontSize={fontSize * (isMobile ? 0.95: 1.15)} className="fill-slate-700 font-semibold select-none">
            {bar.value}
          </text>
          <text x={bar.x + bar.width / 2} y={chartBottom + (isMobile ? 20: 16)} textAnchor="middle"
            fontSize={fontSize * (isMobile ? 0.95: 1.15)} className="fill-slate-700 select-none">
            {bar.label}
          </text>
        </g>
      ))}

      {/* Axis titles */}
      {yAxisLabel && (
        <text
            x={chartLeft - 35}
            y={(chartTop + chartBottom) / 2}
            textAnchor="middle"
            fontSize={fontSize * 0.95}
            className="fill-slate-600 font-semibold select-none"
            transform={`rotate(-90, ${chartLeft - 35}, ${(chartTop + chartBottom) / 2})`}
        >
            {yAxisLabel}
        </text>
        )}
      {xAxisLabel && (
        <text x={(chartLeft + chartRight) / 2} y={chartBottom + 34} textAnchor="middle"
          fontSize={fontSize * (isMobile ? 0.95: 1.15)} className="fill-slate-600 font-semibold select-none">
          {xAxisLabel}
        </text>
      )}
    </g>
  );
}