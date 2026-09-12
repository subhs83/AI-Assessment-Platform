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
        stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-600"
        vectorEffect="non-scaling-stroke" markerEnd="url(#arrow-end)" markerStart="url(#arrow-start)" />

      {/* Tick marks + numbers */}
      {ticks.map((v) => {
        const x = toPixelX(v);
        return (
          <g key={`tick-${v}`}>
            <line x1={x} y1={centerY - (isMobile ? 8:5)} x2={x} y2={centerY + (isMobile ? 8 :5)}
              stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-800"
              vectorEffect="non-scaling-stroke" />
            <text x={x} y={centerY + (isMobile ? 30: 20)} textAnchor="middle" fontSize={fontSize*(isMobile ? 1: 1.15)}
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
            strokeWidth={strokeWidth * (isMobile ? 1.3 : 2)}
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
              cx={x} cy={centerY} r="8"
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
                <text x={pos.x} y={pos.y - (isMobile ? 20: 14)} textAnchor="middle" fontSize={fontSize* (isMobile ? 1.1: 1.15)}
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



export function renderLineGraph(plane, xAxisLabel, yAxisLabel, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { plottedSeries, categories, chartLeft, chartRight, chartTop, chartBottom, yMax, yMin, tick } = plane;

  const COLORS = ["#378add", "#D4537E", "#1D9E75", "rgb(239, 159, 39)"];
  const AXIS_OVERHANG_RIGHT = isMobile ? 10 : 20;
  const CIRCLE_RADIUS = isMobile ? "6" : "4"

  const yTicks = [];
  for (let v = Math.ceil(yMin / tick) * tick; v <= yMax; v += tick) {
    yTicks.push(Math.round(v * 1e6) / 1e6);
  }
  const valueToY = (v) => chartBottom - ((v - yMin) / (yMax - yMin)) * (chartBottom - chartTop);

  const showLegend = plottedSeries.length > 1;

  const allDataValues = [...new Set(
    plottedSeries.flatMap((s) => s.points.map((p) => p.value))
  )];

  const sortedByY = [...allDataValues].sort((a, b) => valueToY(a) - valueToY(b));
  const sideForValue = {};
  sortedByY.forEach((v, i) => { sideForValue[v] = i % 2 === 0 ? "left" : "right"; });

  const MIN_LABEL_GAP_PX = fontSize * 1.2;

  const declutter = (values) => {
    const items = values
      .map((v) => ({ value: v, trueY: valueToY(v), y: valueToY(v) }))
      .sort((a, b) => a.trueY - b.trueY);
    for (let i = 1; i < items.length; i++) {
      const minY = items[i - 1].y + MIN_LABEL_GAP_PX;
      if (items[i].y < minY) items[i].y = minY;
    }
    if (items.length > 1) {
      const trueCenter = items.reduce((s, d) => s + d.trueY, 0) / items.length;
      const shiftedCenter = items.reduce((s, d) => s + d.y, 0) / items.length;
      const shift = trueCenter - shiftedCenter;
      items.forEach((d) => { d.y += shift; });
    }
    return items;
  };

  const leftItems = declutter(allDataValues.filter((v) => sideForValue[v] === "left"));
  const rightItems = declutter(allDataValues.filter((v) => sideForValue[v] === "right"));

  const labelYFor = (v) => {
    const list = sideForValue[v] === "left" ? leftItems : rightItems;
    return list.find((d) => d.value === v)?.y ?? valueToY(v);
  };

  return (
    <g>
      {/* Horizontal gridlines */}
      {yTicks.map((v) => {
        const y = valueToY(v);
        return (
          <line key={`ytick-${v}`} x1={chartLeft} y1={y} x2={chartRight} y2={y}
            stroke="currentColor" strokeWidth={strokeWidth * 0.4}
            className="text-slate-200" vectorEffect="non-scaling-stroke" />
        );
      })}

      {/* Vertical guide lines — one per category (not per series),
          full-height, light — marks "this is where each x-tick is"
          without per-series clutter. */}
        {plottedSeries[0]?.points.map((p, i) => (
        <line key={`vguide-${i}`} x1={p.x} y1={chartTop} x2={p.x} y2={chartBottom}
          stroke="#cbd5e1" strokeWidth={strokeWidth * 0.8}
          strokeDasharray="2,3" opacity={0.8}
          vectorEffect="non-scaling-stroke" />
      ))}

      {/* Y-axis (left) — unchanged */}
      <line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom}
        stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-800"
        vectorEffect="non-scaling-stroke" />

      {/* X-axis (bottom) — extended on the RIGHT side only */}
      <line x1={chartLeft} y1={chartBottom} x2={chartRight + AXIS_OVERHANG_RIGHT} y2={chartBottom}
        stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-800"
        vectorEffect="non-scaling-stroke" />

      {categories.map((label, i) => (
        <text key={`xcat-${i}`} x={plottedSeries[0].points[i].x} y={chartBottom + 16}
          textAnchor="middle" fontSize={fontSize * 0.85} className="fill-slate-700 select-none">
          {label}
        </text>
      ))}

      {/* Horizontal guide lines — stop exactly at chartLeft/chartRight */}
      {plottedSeries.map((s, si) =>
        s.points.map((p, i) => (
          <line key={`guide-${si}-${i}`} x1={chartLeft} y1={p.y} x2={chartRight} y2={p.y}
            stroke={COLORS[si % COLORS.length]} strokeWidth={strokeWidth * 0.4}
            strokeDasharray="3,3" opacity="0.5" vectorEffect="non-scaling-stroke" />
        ))
      )}

      {plottedSeries.map((s, si) => {
        const pathD = s.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        return (
          <g key={`series-${si}`}>
            <path d={pathD} fill="none" stroke={COLORS[si % COLORS.length]}
              strokeWidth={strokeWidth * 1.5} vectorEffect="non-scaling-stroke" />
            {s.points.map((p, i) => (
              <circle key={`pt-${si}-${i}`} cx={p.x} cy={p.y} r = {CIRCLE_RADIUS}
                fill={COLORS[si % COLORS.length]} stroke={COLORS[si % COLORS.length]} strokeWidth={strokeWidth * 0.6} />
            ))}
          </g>
        );
      })}

      {/* Value labels — alternating left/right, sitting just outside
          the axis boundary */}
      {allDataValues.map((v) => {
        const side = sideForValue[v];
        const trueY = valueToY(v);
        const labelY = labelYFor(v);
        const moved = Math.abs(labelY - trueY) > 1;

        const axisX = side === "left" ? chartLeft : chartRight;
        const labelX = side === "left" ? chartLeft - 8 : chartRight + 8;
        const anchor = side === "left" ? "end" : "start";

        return (
          <g key={`dval-${v}`}>
            {moved && (
              <path d={`M ${axisX} ${trueY} L ${labelX} ${labelY}`}
                stroke="currentColor" strokeWidth={strokeWidth * 0.5}
                className="text-slate-400" fill="none" vectorEffect="non-scaling-stroke" />
            )}
            <text x={labelX} y={labelY} textAnchor={anchor} dominantBaseline="middle"
              fontSize={fontSize * 0.78} className="fill-slate-600 font-semibold select-none">
              {v}
            </text>
          </g>
        );
      })}

      {yAxisLabel && (
        <text x={chartLeft - 35} y={(chartTop + chartBottom) / 2} textAnchor="middle"
          fontSize={fontSize * 0.85} className="fill-slate-600 font-semibold select-none"
          transform={`rotate(-90, ${chartLeft - 35}, ${(chartTop + chartBottom) / 2})`}>
          {yAxisLabel}
        </text>
      )}
      {xAxisLabel && (
        <text x={(chartLeft + chartRight) / 2} y={chartBottom + 34} textAnchor="middle"
          fontSize={fontSize * 0.85} className="fill-slate-600 font-semibold select-none">
          {xAxisLabel}
        </text>
      )}

      {showLegend && (
        <g>
          {plottedSeries.map((s, i) => (
            <g key={`legend-${i}`} transform={`translate(${chartLeft+20 + i * 100}, ${chartTop - 12})`}>
              <rect width="13" height="13" fill={COLORS[i % COLORS.length]} rx="2" />
              <text x="20" y="10" fontSize={fontSize * (isMobile ? 1.1 : 1.2)} className="fill-slate-700 select-none">
                {s.label}
              </text>
            </g>
          ))}
        </g>
      )}
    </g>
  );
}