import { getSvgDimensions } from "../geometry/geometryHelpers"; // reuse only the pure dimension utility
import MathText from "../../../../common/MathText";
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
  const AXIS_OVERHANG_RIGHT = isMobile ? 15 : 20;
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
              strokeWidth={strokeWidth * (isMobile ? 1 : 1.5)} vectorEffect="non-scaling-stroke" />
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
            <g key={`legend-${i}`} transform={`translate(${chartLeft+20 + i * 130}, ${chartTop - 12})`}>
              <rect width="13" height="13" fill={COLORS[i % COLORS.length]} rx="2" />
              <text x="20" y="12" fontSize={fontSize * (isMobile ? 1 : 1.2)} className="fill-slate-800 select-none">
                {s.label}
              </text>
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

function FunctionGraphLabel({
  x,
  y,
  width,
  height,
  text,
  fontSize,
  align = "center",
  color = "#334155",
}) {
  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            align === "right"
              ? "flex-end"
              : align === "left"
                ? "flex-start"
                : "center",
          width: "100%",
          height: "100%",
          fontSize,
          color,
          whiteSpace: "nowrap",
        }}
      >
        <span className="rounded bg-slate-50 px-0.5">
          <MathText text={text} />
        </span>
      </div>
    </foreignObject>
  );
}

export function renderFunctionGraph(plane, isMobile = false) {
  if (!plane) return null;

  const {
    width,
    height,
    fontSize,
    strokeWidth,
    chartLeft,
    chartRight,
    chartTop,
    chartBottom,
    chartWidth,
    origin,
    xTicks,
    yTicks,
    plottedCurves,
    asymptotes,
    axes,
    showLegend,
    horizontalAsymptotes = [],
    endpointMarkers = [],
    continuationArrows = [],
    isInverse = false,
  } = plane;

  const tickLength = fontSize * 0.3;
  const labelHeight = fontSize * 2.3;
  const xLabelWidth = fontSize * 3.2;
  const yLabelWidth = fontSize * (isInverse ? 3.4 : 2.8);

  // Retain every tick mark, but thin crowded number labels.
  // Use the same mathematical tick spacing on desktop and mobile.
  const xSpacing = plane.scaleX * (
    xTicks.length > 1
      ? xTicks[1].value - xTicks[0].value
      : plane.maxX - plane.minX
  );

  const ySpacing = plane.scaleY * (
    yTicks.length > 1
      ? yTicks[1].value - yTicks[0].value
      : plane.maxY - plane.minY
  );

  const xLabelStride = Math.max(
    1,
    Math.ceil((xLabelWidth + fontSize * 0.2) / xSpacing)
  );

    const yLabelStride = Math.max(
    1,
    Math.ceil(
      (
        isInverse
          ? labelHeight + fontSize * 0.2
          : fontSize * 1.8
      ) / ySpacing
    )
  );

  // Prefer labels below the x-axis and left of the y-axis.
  // Flip sides when an axis sits at a plot boundary.
  const xLabelsBelow =
    origin.y + tickLength + labelHeight <= height - fontSize * 1.5;

  const yLabelsLeft =
    origin.x - tickLength - yLabelWidth >= 2;

      const xLabelY = xLabelsBelow
    ? origin.y + tickLength + fontSize * 0.15
    : origin.y - tickLength - labelHeight - fontSize * 0.15;

  const yLabelX = yLabelsLeft
    ? origin.x - tickLength - yLabelWidth - fontSize * 0.15
    : origin.x + tickLength + fontSize * 0.15;

      const inverseFunction = plottedCurves[0]?.function;

  const getXTickLabelY = (tick) => {
    if (!isInverse) return xLabelY;

    // asin/atan lie below the x-axis for negative x.
    // Put those labels above the axis; other labels go below.
    const placeAbove =
      tick.value < 0 &&
      ["asin", "atan"].includes(inverseFunction);

    return placeAbove
      ? origin.y - tickLength - labelHeight - fontSize * 0.15
      : xLabelY;
  };

  const getYTickLabelY = (value, pixelY) => {
    const centered = pixelY - labelHeight / 2;

    if (!isInverse) return centered;

    // Only offset a label near the curve's y-intercept.
    const intercept =
      inverseFunction === "acos" ? Math.PI / 2 : 0;

    const distanceFromIntercept =
      Math.abs(value - intercept) * plane.scaleY;

    if (distanceFromIntercept > labelHeight) return centered;

    // Beside the left of the y-axis:
    // acos slopes upward to the left; asin/atan slope downward.
    const offset =
      inverseFunction === "acos"
        ? fontSize * 0.85
        : -fontSize * 0.85;

    return centered + offset;
  };

  const clampLabelX = (x, boxWidth) =>
    Math.max(2, Math.min(width - boxWidth - 2, x));

  // Several curves can share an asymptote.
  const uniqueAsymptotes = asymptotes.filter(
    (item, index, all) =>
      all.findIndex(
        (other) => Math.abs(other.x - item.x) < 0.01
      ) === index
  );

  const legendCurves = plottedCurves.filter(
    (curve) => curve.label
  );

    // These y-values explain included endpoints and limiting values.
  // Keep them labelled even when intermediate ticks are thinned.
  const importantYValues = isInverse
    ? [
        ...horizontalAsymptotes.map((item) => item.value),
        ...endpointMarkers.map(
          (point) => plane.minY + (chartBottom - point.y) / plane.scaleY
        ),
      ]
    : [];

  const isImportantYTick = (tick) =>
    importantYValues.some(
      (value) => Math.abs(value - tick.value) < 1e-7
    );

  const showYTickLabel = (tick) => {
    if (tick.value === 0) return false;

    if (isImportantYTick(tick)) return true;

    if (tick.index % yLabelStride !== 0) return false;

    // Reserve room around the important fraction labels.
    return !importantYValues.some((value) => {
      const importantY = plane.toPixel(0, value).y;

      return (
        Math.abs(importantY - tick.y) <
        labelHeight + fontSize * 0.15
      );
    });
  };

  const hasYTick = (value) =>
    yTicks.some((tick) => Math.abs(tick.value - value) < 1e-7);

  return (
    <g>
      {/* Optional background grid. */}
      {plane.figure.show_grid && (
        <g stroke="#e2e8f0" strokeWidth={strokeWidth * 0.45}>
          {xTicks
            .filter((tick) => tick.value !== 0)
            .map((tick) => (
              <line
                key={`grid-x-${tick.index}`}
                x1={tick.x}
                y1={chartTop}
                x2={tick.x}
                y2={chartBottom}
              />
            ))}

          {yTicks
            .filter((tick) => tick.value !== 0)
            .map((tick) => (
              <line
                key={`grid-y-${tick.index}`}
                x1={chartLeft}
                y1={tick.y}
                x2={chartRight}
                y2={tick.y}
              />
            ))}
        </g>
      )}

      {/* Asymptotes are guides, never connected curve segments. */}
      {uniqueAsymptotes.map((item) => (
        <line
          key={item.id}
          x1={item.x}
          y1={chartTop}
          x2={item.x}
          y2={chartBottom}
          stroke="#94a3b8"
          strokeWidth={strokeWidth * 0.65}
          strokeDasharray={`${fontSize * 0.35} ${fontSize * 0.3}`}
        />
      ))}

      {/* Inverse tangent approaches these lines but never reaches them. */}
      {horizontalAsymptotes.map((item) => (
        <line
          key={item.id}
          x1={chartLeft}
          y1={item.y}
          x2={chartRight}
          y2={item.y}
          stroke="#94a3b8"
          strokeWidth={strokeWidth * 0.65}
          strokeDasharray={`${fontSize * 0.35} ${fontSize * 0.3}`}
        />
      ))}
      {/* Cartesian axes through zero. */}
      <g stroke="#334155" strokeWidth={strokeWidth}>
        <line
          x1={chartLeft}
          y1={origin.y}
          x2={chartRight}
          y2={origin.y}
        />
        <line
          x1={origin.x}
          y1={chartTop}
          x2={origin.x}
          y2={chartBottom}
        />
      </g>

      {/* Curve paths are already clipped by the positions function. */}
      {plottedCurves.map((curve) => (
        <g key={curve.id}>
          {curve.paths.map((path, index) => (
            <path
              key={`${curve.id}-${index}`}
              d={path}
              fill="none"
              stroke={curve.color}
              strokeWidth={strokeWidth * 1.3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
      ))}

      

      {/* These arrows mark continuation, not finite endpoints. */}
      {continuationArrows.map((arrow) => {
        const arrowLength = fontSize * 0.65;
        const halfWidth = fontSize * 0.25;
        const { tip, direction, color } = arrow;

        const base = {
          x: tip.x - direction.x * arrowLength,
          y: tip.y - direction.y * arrowLength,
        };

        const points = [
          tip,
          {
            x: base.x - direction.y * halfWidth,
            y: base.y + direction.x * halfWidth,
          },
          {
            x: base.x + direction.y * halfWidth,
            y: base.y - direction.x * halfWidth,
          },
        ]
          .map((point) => `${point.x},${point.y}`)
          .join(" ");

        return (
          <polygon
            key={arrow.id}
            points={points}
            fill={color}
          />
        );
      })}
      {/* X ticks and radian labels. */}
      {xTicks.map((tick) => (
        <g key={`x-tick-${tick.index}`}>
          <line
            x1={tick.x}
            y1={origin.y - tickLength}
            x2={tick.x}
            y2={origin.y + tickLength}
            stroke="#334155"
            strokeWidth={strokeWidth * 0.8}
          />

          {tick.value !== 0 &&
            tick.index % xLabelStride === 0 && (
              <FunctionGraphLabel
                x={clampLabelX(
                  tick.x - xLabelWidth / 2,
                  xLabelWidth
                )}
                y={getXTickLabelY(tick)}
                width={xLabelWidth}
                height={labelHeight}
                text={tick.label}
                fontSize={fontSize}
              />
            )}
        </g>
      ))}

      {/* Y ticks and number labels. */}
      {yTicks.map((tick) => (
        <g key={`y-tick-${tick.index}`}>
          <line
            x1={origin.x - tickLength}
            y1={tick.y}
            x2={origin.x + tickLength}
            y2={tick.y}
            stroke="#334155"
            strokeWidth={strokeWidth * 0.8}
          />

          {showYTickLabel(tick) && (
              <FunctionGraphLabel
                x={clampLabelX(yLabelX, yLabelWidth)}
                y={getYTickLabelY(tick.value, tick.y)}
                width={yLabelWidth}
                height={labelHeight}
                text={tick.label}
                fontSize={fontSize}
                align={isInverse || yLabelsLeft ? "right" : "left"}
              />
            )}
            
        </g>
      ))}

      {/* Avoid duplicate labels when an asymptote is already a y tick. */}
      {horizontalAsymptotes
        .filter((item) => !hasYTick(item.value))
        .map((item) => (
          <FunctionGraphLabel
            key={`label-${item.id}`}
            x={clampLabelX(yLabelX, yLabelWidth)}
            y={item.y - labelHeight / 2}
            width={yLabelWidth}
            height={labelHeight}
            text={item.label}
            fontSize={fontSize}
            align={isInverse || yLabelsLeft ? "right" : "left"}
          />
        ))}

      {/* Keep zero beside the origin, away from the inverse curve. */}
      <FunctionGraphLabel
        x={clampLabelX(
          isInverse || yLabelsLeft
            ? origin.x - fontSize * 1.6
            : origin.x + fontSize * 0.4,
          fontSize * 1.2
        )}
        y={
          isInverse && ["asin", "atan"].includes(inverseFunction)
            ? origin.y - fontSize * 1.8
            : xLabelY
        }
        width={fontSize * 1.2}
        height={isInverse ? fontSize * 1.4 : labelHeight}
        text="$0$"
        fontSize={fontSize}
      />

      {/* Axis titles outside the plotting area. */}
      <FunctionGraphLabel
        x={chartLeft}
        y={height - fontSize * 1.8}
        width={chartWidth}
        height={fontSize * 1.6}
        text={axes.x.label}
        fontSize={fontSize}
      />

      <FunctionGraphLabel
        x={clampLabelX(
          origin.x - fontSize * (isInverse ? 3.5 : 1),
          fontSize * (isInverse ? 7 : 2)
        )}
        y={chartTop - fontSize * 1.8}
        width={fontSize * (isInverse ? 7 : 2)}
        height={fontSize * 1.6}
        text={axes.y.label}
        fontSize={fontSize}
      />

      {/* Only supplied neutral curve labels are shown. */}
      {showLegend && legendCurves.map((curve, index) => {
        const slotWidth = chartWidth / legendCurves.length;
        const x = chartLeft + index * slotWidth;
        const y = fontSize * 0.3;

        return (
          <g key={`legend-${curve.id}`}>
            <line
              x1={x}
              y1={y + fontSize * 0.8}
              x2={x + fontSize * 1.5}
              y2={y + fontSize * 0.8}
              stroke={curve.color}
              strokeWidth={strokeWidth * 1.3}
            />

            <FunctionGraphLabel
              x={x + fontSize * 1.8}
              y={y}
              width={Math.max(fontSize, slotWidth - fontSize * 2)}
              height={fontSize * 1.6}
              text={curve.label}
              fontSize={fontSize}
              align="left"
              color={curve.color}
            />
          </g>
        );
      })}

      {/* Filled dots mark included mathematical endpoints. */}
      {endpointMarkers.map((point) => (
        <circle
          key={point.id}
          cx={point.x}
          cy={point.y}
          r={Math.max(3, strokeWidth * 1.6)}
          fill={point.color}
          stroke={point.color}
          strokeWidth={strokeWidth * 0.5}
        />
      ))}
    </g>
  );
}

