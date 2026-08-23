export default function GraphVisual({ visual }) {
  const elements = visual?.elements || [];

  const axes = elements.filter((e) => e.type === "axis");
  const points = elements.filter((e) => e.type === "point");
  const bars = elements.filter((e) => e.type === "bar");

  const graphType = visual?.graph_type || "";

  if (graphType === "line_graph") {
    return <LineGraph visual={visual} axes={axes} points={points} />;
  }

  if (graphType === "bar_graph") {
    return <BarGraph visual={visual} axes={axes} bars={bars} />;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Line Graph */
/* -------------------------------------------------------------------------- */

function LineGraph({ axes, points }) {
  if (!points.length) return null;

  const xAxis = axes.find((axis) => axis.id === "axis_x");
  const yAxis = axes.find((axis) => axis.id === "axis_y");

  const width = 520;
  const height = 300;

  const margin = {
    top: 25,
    right: 25,
    bottom: 55,
    left: 60,
  };

  const graphWidth = width - margin.left - margin.right;
  const graphHeight = height - margin.top - margin.bottom;

  const values = points.map((point) => Number(point.y_value) || 0);

  const minY = Math.min(0, ...values);
  const maxY = Math.max(...values);

  const range = maxY - minY || 1;

  const xStep =
    points.length === 1
      ? graphWidth
      : graphWidth / (points.length - 1);

  const getX = (index) =>
    margin.left + index * xStep;

  const getY = (value) =>
    margin.top +
    graphHeight -
    ((value - minY) / range) * graphHeight;

  const coordinates = points.map((point, index) => ({
    ...point,
    x: getX(index),
    y: getY(Number(point.y_value) || 0),
  }));

  const polylinePoints = coordinates
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const yTicks = 5;

  return (
    <FigureContainer>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full max-w-2xl text-slate-700"
      >
        {/* Y-axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + graphHeight}
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* X-axis */}
        <line
          x1={margin.left}
          y1={margin.top + graphHeight}
          x2={margin.left + graphWidth}
          y2={margin.top + graphHeight}
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Y-axis ticks/grid */}
        {Array.from({ length: yTicks + 1 }).map((_, index) => {
          const value =
            minY + ((maxY - minY) / yTicks) * index;

          const y = getY(value);

          return (
            <g key={`y-tick-${index}`}>
              <line
                x1={margin.left}
                y1={y}
                x2={margin.left + graphWidth}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.12"
              />

              <text
                x={margin.left - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-slate-500 text-[10px]"
              >
                {formatNumber(value)}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {coordinates.map((point, index) => (
          <text
            key={`x-label-${point.id || index}`}
            x={point.x}
            y={height - margin.bottom + 25}
            textAnchor="middle"
            className="fill-slate-600 text-[11px]"
          >
            {point.x_label || point.label}
          </text>
        ))}

        {/* Graph line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Points */}
        {coordinates.map((point, index) => (
          <g key={`point-${point.id || index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="currentColor"
            />

            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              className="fill-slate-700 text-[10px] font-medium"
            >
              {formatNumber(point.y_value)}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        {xAxis?.label && (
          <text
            x={margin.left + graphWidth / 2}
            y={height - 8}
            textAnchor="middle"
            className="fill-slate-600 text-xs font-medium"
          >
            {xAxis.label}
          </text>
        )}

        {yAxis?.label && (
          <text
            x="15"
            y={margin.top + graphHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 15 ${
              margin.top + graphHeight / 2
            })`}
            className="fill-slate-600 text-xs font-medium"
          >
            {yAxis.label}
          </text>
        )}
      </svg>
    </FigureContainer>
  );
}

/* -------------------------------------------------------------------------- */
/* Bar Graph */
/* -------------------------------------------------------------------------- */

function BarGraph({ axes, bars }) {
  if (!bars.length) return null;

  const xAxis = axes.find((axis) => axis.id === "axis_x");
  const yAxis = axes.find((axis) => axis.id === "axis_y");

  const width = 520;
  const height = 300;

  const margin = {
    top: 25,
    right: 25,
    bottom: 65,
    left: 60,
  };

  const graphWidth = width - margin.left - margin.right;
  const graphHeight = height - margin.top - margin.bottom;

  const values = bars.map(
    (bar) =>  Number(bar.value ?? bar.y_value ?? 0)
  );

  const maxValue = Math.max(0, ...values) || 1;

  const barGap = 25;

  const barWidth =
    (graphWidth - barGap * (bars.length - 1)) /
    bars.length;

  const getHeight = (value) =>
    (value / maxValue) * graphHeight;

  const yTicks = 5;

  return (
    <FigureContainer>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full max-w-2xl text-slate-700"
      >
        {/* Y-axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + graphHeight}
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* X-axis */}
        <line
          x1={margin.left}
          y1={margin.top + graphHeight}
          x2={margin.left + graphWidth}
          y2={margin.top + graphHeight}
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Y ticks */}
        {Array.from({ length: yTicks + 1 }).map(
          (_, index) => {
            const value =
              (maxValue / yTicks) * index;

            const y =
              margin.top +
              graphHeight -
              (value / maxValue) * graphHeight;

            return (
              <g key={`bar-y-tick-${index}`}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + graphWidth}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.12"
                />

                <text
                  x={margin.left - 8}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-slate-500 text-[10px]"
                >
                  {formatNumber(value)}
                </text>
              </g>
            );
          }
        )}

        {/* Bars */}
        {bars.map((bar, index) => {
          const value = Number(bar.value ?? bar.y_value ?? 0);

          const barHeight = getHeight(value);

          const x =
            margin.left +
            index * (barWidth + barGap);

          const y =
            margin.top +
            graphHeight -
            barHeight;

          return (
            <g key={`bar-${bar.id || index}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill="currentColor"
                opacity="0.8"
              />

              {/* Value */}
              <text
                x={x + barWidth / 2}
                y={y - 7}
                textAnchor="middle"
                className="fill-slate-700 text-[10px] font-medium"
              >
                {formatNumber(value)}
              </text>

              {/* Category */}
              <text
                x={x + barWidth / 2}
                y={height - margin.bottom + 25}
                textAnchor="middle"
                className="fill-slate-600 text-[10px]"
              >
                {bar.label}
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        {xAxis?.label && (
          <text
            x={margin.left + graphWidth / 2}
            y={height - 8}
            textAnchor="middle"
            className="fill-slate-600 text-xs font-medium"
          >
            {xAxis.label}
          </text>
        )}

        {yAxis?.label && (
          <text
            x="15"
            y={margin.top + graphHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 15 ${
              margin.top + graphHeight / 2
            })`}
            className="fill-slate-600 text-xs font-medium"
          >
            {yAxis.label}
          </text>
        )}
      </svg>
    </FigureContainer>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared wrapper */
/* -------------------------------------------------------------------------- */

function FigureContainer({ children }) {
  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Figure
      </div>

      <div className="flex justify-center">
        {children}
      </div>
    </div>
  );
}

function formatNumber(value) {
  if (Number.isInteger(value)) {
    return value;
  }

  return Number(value).toFixed(1);
}

