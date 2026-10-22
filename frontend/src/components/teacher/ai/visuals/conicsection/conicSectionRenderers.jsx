// conicsection/conicSectionRenderers.jsx

import MathText from "../../../../common/MathText";

const COLORS = {
  circle: "#2563eb",
  parabola: "#0d9488",
  ellipse: "#7c3aed",
  hyperbola: "#ea580c",
};

function ConicLabel({ label, plane, color = "#334155" }) {
  const x = Math.max(
    2,
    Math.min(
      plane.width - label.width - 2,
      label.x - label.width / 2
    )
  );

  const y = Math.max(
    2,
    Math.min(
      plane.height - label.height - 2,
      label.y - label.height / 2
    )
  );

  return (
    <foreignObject
      x={x}
      y={y}
      width={label.width}
      height={label.height}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
          label.align === "start"
            ? "flex-start"
            : label.align === "end"
              ? "flex-end"
              : "center",
          width: "100%",
          height: "100%",
          color,
          fontSize: plane.fontSize,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            background: "#f8fafc",
            borderRadius: 4,
            padding: "0 2px",
          }}
        >
          <MathText text={label.text} />
        </span>
      </div>
    </foreignObject>
  );
}

function ArrowHead({ tip, ux, uy, length, halfWidth, color }) {
  const baseX = tip.x - ux * length;
  const baseY = tip.y - uy * length;

  return (
    <polygon
      points={[
        `${tip.x},${tip.y}`,
        `${baseX - uy * halfWidth},${baseY + ux * halfWidth}`,
        `${baseX + uy * halfWidth},${baseY - ux * halfWidth}`,
      ].join(" ")}
      fill={color}
    />
  );
}

export function renderConicSection(plane) {
  if (!plane) return null;

  const {
    figure,
    conic,
    plot,
    origin,
    fontSize,
    strokeWidth,
    ellipse,
    paths,
    points,
    lines,
    labels,
    continuationArrows,
    xTicks,
    yTicks,
  } = plane;

  const color = COLORS[conic.subtype] || "#2563eb";
  const axisColor = "#64748b";
  const tickLength = fontSize * 0.28;

  const numberWidth = (text) =>
    Math.max(fontSize * 1.3, String(text).length * fontSize * 0.65 + 6);

  /*const maxXLabelWidth = Math.max(
    fontSize * 1.3,
    ...xTicks.map((tick) => numberWidth(tick.label))
  );

  const xSpacing =
    xTicks.length > 1
      ? Math.abs(xTicks[1].x - xTicks[0].x)
      : plot.right - plot.left;

  const ySpacing =
    yTicks.length > 1
      ? Math.abs(yTicks[1].y - yTicks[0].y)
      : plot.bottom - plot.top; */

  // Keep tick marks, but thin their labels when space is limited.
  const xStride = 2;
  const yStride = 2;

  const zeroXIndex = xTicks.findIndex((tick) => tick.value === 0);
  const zeroYIndex = yTicks.findIndex((tick) => tick.value === 0);

  const xLabelY = origin.y + tickLength + fontSize * 0.85;
  const yLabelX = origin.x - tickLength - fontSize * 0.4;
  const yNumberAnchor = "end";

  // Avoid placing tick numbers underneath point/line labels.
  const overlapsAnnotation = (box) =>
    labels.some((label) => {
      const left = Math.max(
        2,
        Math.min(
          plane.width - label.width - 2,
          label.x - label.width / 2
        )
      );

      const top = Math.max(
        2,
        Math.min(
          plane.height - label.height - 2,
          label.y - label.height / 2
        )
      );

      return (
        box.x < left + label.width &&
        box.x + box.width > left &&
        box.y < top + label.height &&
        box.y + box.height > top
      );
    });

  // Preserve important circle/ellipse extrema when they match ticks.
    // Number every second tick, counting outward from zero.
  // All intermediate tick marks remain visible.
  const showXNumber = (tick, index) => {
    if (tick.value === 0) return false;

    if ((index - Math.max(0, zeroXIndex)) % xStride !== 0) {
      return false;
    }

    const width = numberWidth(tick.label);

    return !overlapsAnnotation({
      x: tick.x - width / 2,
      y: xLabelY - fontSize / 2,
      width,
      height: fontSize,
    });
  };

  const showYNumber = (tick, index) => {
    if (tick.value === 0) return false;

    if ((index - Math.max(0, zeroYIndex)) % yStride !== 0) {
      return false;
    }

    const width = numberWidth(tick.label);

    return !overlapsAnnotation({
      x: yLabelX - width,
      y: tick.y - fontSize / 2,
      width,
      height: fontSize,
    });
  };

  const zeroBox = {
    x: origin.x - fontSize * 1.15,
    y: origin.y + fontSize * 0.35,
    width: fontSize,
    height: fontSize,
  };

  return (
    <g>
      {/* Optional coordinate grid */}
      {figure.show_grid && (
        <g stroke="#e2e8f0" strokeWidth={strokeWidth * 0.4}>
          {xTicks
            .filter((tick) => tick.value !== 0)
            .map((tick) => (
              <line
                key={`grid-x-${tick.value}`}
                x1={tick.x}
                y1={plot.top}
                x2={tick.x}
                y2={plot.bottom}
              />
            ))}

          {yTicks
            .filter((tick) => tick.value !== 0)
            .map((tick) => (
              <line
                key={`grid-y-${tick.value}`}
                x1={plot.left}
                y1={tick.y}
                x2={plot.right}
                y2={tick.y}
              />
            ))}
        </g>
      )}

      {/* Cartesian axes */}
      <g
        stroke={axisColor}
        strokeWidth={strokeWidth * 0.65}
        fill="none"
      >
        <line
          x1={plot.left}
          y1={origin.y}
          x2={plot.right + fontSize * 0.5}
          y2={origin.y}
        />

        <line
          x1={origin.x}
          y1={plot.bottom}
          x2={origin.x}
          y2={plot.top - fontSize * 0.5}
        />

        {xTicks.map((tick) => (
          <line
            key={`tick-x-${tick.value}`}
            x1={tick.x}
            y1={origin.y - tickLength}
            x2={tick.x}
            y2={origin.y + tickLength}
          />
        ))}

        {yTicks.map((tick) => (
          <line
            key={`tick-y-${tick.value}`}
            x1={origin.x - tickLength}
            y1={tick.y}
            x2={origin.x + tickLength}
            y2={tick.y}
          />
        ))}
      </g>

      <ArrowHead
        tip={{ x: plot.right + fontSize * 0.5, y: origin.y }}
        ux={1}
        uy={0}
        length={fontSize * 0.55}
        halfWidth={fontSize * 0.2}
        color={axisColor}
      />

      <ArrowHead
        tip={{ x: origin.x, y: plot.top - fontSize * 0.5 }}
        ux={0}
        uy={-1}
        length={fontSize * 0.55}
        halfWidth={fontSize * 0.2}
        color={axisColor}
      />

      {/* Only lines explicitly linked through marks_line */}
      {lines.map((line) => (
        <line
          key={line.id}
          x1={line.start.x}
          y1={line.start.y}
          x2={line.end.x}
          y2={line.end.y}
          stroke="#94a3b8"
          strokeWidth={strokeWidth * 0.75}
          strokeDasharray={`${fontSize * 0.45} ${fontSize * 0.3}`}
        />
      ))}

      {/* Exact circle/ellipse outline */}
      {ellipse && (
        <ellipse
          cx={ellipse.center.x}
          cy={ellipse.center.y}
          rx={ellipse.rx}
          ry={ellipse.ry}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth * 1.25}
        />
      )}

      {/* Separate open-curve paths */}
      {paths.map((path) => (
        <path
          key={path.id}
          d={path.d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth * 1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {continuationArrows.map((arrow) => (
        <ArrowHead
          key={arrow.id}
          tip={arrow.tip}
          ux={arrow.ux}
          uy={arrow.uy}
          length={fontSize * 0.7}
          halfWidth={fontSize * 0.25}
          color={color}
        />
      ))}

      {/* Axis numbers */}
      <g
        fill="#475569"
        fontSize={fontSize * 0.85}
        fontWeight={500}
      >
        {xTicks.map((tick, index) =>
          showXNumber(tick, index) ? (
            <text
              key={`number-x-${tick.value}`}
              x={tick.x}
              y={xLabelY}
              textAnchor="middle"
              dominantBaseline="middle"
              paintOrder="stroke"
              stroke="#f8fafc"
              strokeWidth={2}
              strokeLinejoin="round"
            >
              {tick.label}
            </text>
          ) : null
        )}

        {yTicks.map((tick, index) =>
          showYNumber(tick, index) ? (
            <text
              key={`number-y-${tick.value}`}
              x={yLabelX}
              y={tick.y}
              textAnchor={yNumberAnchor}
              dominantBaseline="middle"
              paintOrder="stroke"
              stroke="#f8fafc"
              strokeWidth={2}
              strokeLinejoin="round"
            >
              {tick.label}
            </text>
          ) : null
        )}

        {!overlapsAnnotation(zeroBox) && (
          <text
            x={zeroBox.x + zeroBox.width / 2}
            y={zeroBox.y + zeroBox.height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            0
          </text>
        )}
      </g>

      {/* Axis names remain close to their arrowheads */}
      <ConicLabel
        plane={plane}
        label={{
          text: "$x$",
          x: plot.right + fontSize * 1.1,
          y: origin.y,
          width: fontSize * 1.2,
          height: fontSize * 1.5,
        }}
      />

      <ConicLabel
        plane={plane}
        label={{
          text: "$y$",
          x: origin.x,
          y: plot.top - fontSize * 1.25,
          width: fontSize * 1.2,
          height: fontSize * 1.5,
        }}
      />

      {/* Point and line labels use the shared MathText component */}
      {labels.map((label) => (
        <ConicLabel
          key={label.id}
          label={label}
          plane={plane}
        />
      ))}

      {/* Draw marked points last so labels do not obscure their centres */}
      {points.map((point) => (
        <circle
          key={point.id}
          cx={point.x}
          cy={point.y}
          r={Math.max(2.5, strokeWidth * 1.5)}
          fill={color}
          stroke="#f8fafc"
          strokeWidth={strokeWidth * 0.5}
        />
      ))}
    </g>
  );
}