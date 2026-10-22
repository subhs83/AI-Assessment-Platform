// graph/integralRegionRenderers.jsx

import MathText from "../../../../common/MathText";
import { useLayoutEffect, useRef, useState } from "react";

const COLORS = ["#2563eb", "#ea580c", "#0d9488", "#7c3aed"];
const BACKGROUND = "#f8fafc";

function IntegralLabel({ label, plane, color = "#334155" }) {
  const textRef = useRef(null);
  const [measured, setMeasured] = useState(null);

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;

    let active = true;

    const measure = () => {
      if (!active) return;

      // Layout dimensions are SVG user units here, independent
      // of the SVG's responsive scaling on the screen.
      const width = Math.ceil(
        Math.max(element.offsetWidth, element.scrollWidth) + 8
      );

      const height = Math.ceil(
        Math.max(element.offsetHeight, element.scrollHeight) + 8
      );

      if (width <= 8 || height <= 8) return;

      setMeasured((previous) =>
        previous?.width === width && previous?.height === height
          ? previous
          : { width, height }
      );
    };

    measure();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;

    observer?.observe(element);
    document.fonts?.ready.then(measure);

    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [label.text, plane.fontSize]);

  const width = Math.max(label.width, measured?.width || 0);
  const height = Math.max(label.height, measured?.height || 0);

  // Preserve the edge nearest the curve when expanding the box.
  const desiredX =
    label.align === "start"
      ? label.x - label.width / 2
      : label.align === "end"
        ? label.x + label.width / 2 - width
        : label.x - width / 2;

  let x = Math.max(
    2,
    Math.min(plane.width - width - 2, desiredX)
  );

  let y = Math.max(
    2,
    Math.min(
      plane.height - height - 2,
      label.y - height / 2
    )
  );

  // ADDED: check the actual measured box, not only its estimate.
// Axis labels and tick numbers keep their existing positions.
if (label.avoidCurve && measured && plane.curveSamples?.length) {
  const clearance = plane.fontSize * 0.35;
  const initialX = x;
  const initialY = y;
  const candidates = [];

  const intersects = (a, b) =>
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;

  const axes = [
    {
      x: plane.plot.left,
      y: plane.origin.y - plane.strokeWidth,
      width: plane.plot.right - plane.plot.left,
      height: plane.fontSize * 1.8,
    },
    {
      x: plane.origin.x - plane.fontSize * 2.2,
      y: plane.plot.top,
      width: plane.fontSize * 2.2 + plane.strokeWidth,
      height: plane.plot.bottom - plane.plot.top,
    },
  ];

  // Start at the existing position, then search nearby clear space.
  for (const offset of [0, 0.5, 1, 1.5, 2, 3, 4]) {
    const directions = offset === 0
      ? [[0, 0]]
      : [[0, -1], [0, 1], [-1, 0], [1, 0],
         [-1, -1], [1, -1], [-1, 1], [1, 1]];

    for (const [dx, dy] of directions) {
      const candidateX = initialX + dx * offset * plane.fontSize;
      const candidateY = initialY + dy * offset * plane.fontSize;

      if (
        candidateX < 2 ||
        candidateY < 2 ||
        candidateX + width > plane.width - 2 ||
        candidateY + height > plane.height - 2
      ) continue;

      const box = {
        x: candidateX - clearance,
        y: candidateY - clearance,
        width: width + clearance * 2,
        height: height + clearance * 2,
      };

      const curveHit = plane.curveSamples.some((point) =>
        point.x >= box.x &&
        point.x <= box.x + box.width &&
        point.y >= box.y &&
        point.y <= box.y + box.height
      );

      const axisHit = axes.some((axis) => intersects(box, axis));

      const labelHit = plane.labels.some((other) =>
        other.id !== label.id &&
        intersects(box, {
          x: other.x - other.width / 2,
          y: other.y - other.height / 2,
          width: other.width,
          height: other.height,
        })
      );

      if (!curveHit && !axisHit && !labelHit) {
        candidates.push({
          x: candidateX,
          y: candidateY,
          distance: Math.hypot(candidateX - initialX, candidateY - initialY),
        });
      }
    }
  }

  candidates.sort((a, b) => a.distance - b.distance);

  if (candidates.length) {
    x = candidates[0].x;
    y = candidates[0].y;
  }
}

  return (
    <foreignObject x={x} y={y} width={width} height={height}>
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
        <div
          ref={textRef}
          style={{
            display: "inline-flex",
            flexShrink: 0,
            width: "max-content",
            background: BACKGROUND,
            borderRadius: 3,
            padding: "0 2px",
          }}
        >
          <MathText text={label.text} />
        </div>
      </div>
    </foreignObject>
  );
}

function overlaps(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function renderIntegralRegion(plane) {
  if (!plane) return null;

  const {
    plot,
    origin,
    fontSize,
    strokeWidth,
    figure,
    xTicks,
    yTicks,
  } = plane;

  const tickLength = fontSize * 0.25;
  const numberSize = fontSize * 0.85;
  const arrowLength = fontSize * 0.65;
  const arrowHalfWidth = fontSize * 0.25;

  const numberWidth = (text) =>
    Math.max(numberSize, String(text).length * numberSize * 0.65);

  const labelBoxes = plane.labels.map((label) => ({
    x: label.x - label.width / 2,
    y: label.y - label.height / 2,
    width: label.width,
    height: label.height,
  }));

  const coveredByLabel = (box) =>
    labelBoxes.some((other) => overlaps(box, other));

  // Keep ticks; reduce only numeric labels when space is limited.
  const xSpacing = figure.x_tick_step * plane.scaleX;
  const ySpacing = figure.y_tick_step * plane.scaleY;

  const widestXNumber = Math.max(
    ...xTicks.map((tick) => numberWidth(tick.label)),
    numberSize
  );

  const xStride = Math.max(
    1,
    Math.ceil((widestXNumber + fontSize * 0.65) / xSpacing)
  );

  const yStride = Math.ceil(
  (yTicks.some((tick) => tick.mathLabel)
    ? fontSize * 3
    : numberSize * 1.8) / ySpacing
)

  // Fixed convention: x-axis numbers below; y-axis numbers left.
    const xHasMathTicks = xTicks.some((tick) => tick.mathLabel);
    //const yHasMathTicks = yTicks.some((tick) => tick.mathLabel);

    const tickLabelHeight = (tick) =>
        tick.mathLabel ? fontSize * 2.6 : numberSize;

    const tickLabelWidth = (tick) =>
        tick.mathLabel
        ? Math.max(fontSize * 2.4, numberWidth(tick.label))
        : numberWidth(tick.label);

    // Leave room for stacked fractions below the x-axis.
    const xNumberY =
        origin.y +
        tickLength +
        (xHasMathTicks ? fontSize * 1.5 : numberSize);

    const yNumberX = origin.x - tickLength - fontSize * 0.35;

    const showXNumber = (tick) => {
    if (tick.value === 0) return false;

    const index = Math.round(tick.value / figure.x_tick_step);
    if (index % xStride !== 0) return false;

    const width = tickLabelWidth(tick);
    const height = tickLabelHeight(tick);

    return !coveredByLabel({
      x: tick.x - width / 2,
      y: xNumberY - height / 2,
      width,
      height,
    });
  };

  const showYNumber = (tick) => {
    if (tick.value === 0) return false;

    const index = Math.round(tick.value / figure.y_tick_step);
    if (index % yStride !== 0) return false;

    const width = tickLabelWidth(tick);
    const height = tickLabelHeight(tick);

    return !coveredByLabel({
      x: yNumberX - width,
      y: tick.y - height / 2,
      width,
      height,
    });
  };

  const zeroBox = {
    x: origin.x - fontSize * 1.15,
    y: origin.y + fontSize * 0.35,
    width: numberSize,
    height: numberSize,
  };

  return (
    <g>
      {/* Draw the requested region first, behind all curves. */}
      {plane.shadedRegions.map((region) => (
        <path
          key={region.id}
          d={region.d}
          fill="#14b8a6"
          fillOpacity={0.2}
          stroke="none"
        />
      ))}

      {figure.show_grid && (
        <g stroke="#cbd5e1" strokeWidth={strokeWidth * 0.35}>
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

      {/* Finite edges that actually bound the shaded region. */}
      <g
        stroke="#64748b"
        strokeWidth={strokeWidth * 0.75}
        fill="none"
      >
        {plane.boundaryLines.map((line) => (
          <line
            key={line.id}
            x1={line.start.x}
            y1={line.start.y}
            x2={line.end.x}
            y2={line.end.y}
          />
        ))}
      </g>

      {/* Coordinate axes and all tick marks. */}
      <g
        stroke="#64748b"
        strokeWidth={strokeWidth}
        fill="none"
      >
        <line
          x1={plot.left}
          y1={origin.y}
          x2={plot.right + arrowLength}
          y2={origin.y}
        />

        <line
          x1={origin.x}
          y1={plot.bottom}
          x2={origin.x}
          y2={plot.top - arrowLength}
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

      <g fill="#64748b">
        <polygon
          points={[
            `${plot.right + arrowLength},${origin.y}`,
            `${plot.right},${origin.y - arrowHalfWidth}`,
            `${plot.right},${origin.y + arrowHalfWidth}`,
          ].join(" ")}
        />

        <polygon
          points={[
            `${origin.x},${plot.top - arrowLength}`,
            `${origin.x - arrowHalfWidth},${plot.top}`,
            `${origin.x + arrowHalfWidth},${plot.top}`,
          ].join(" ")}
        />
      </g>

      {/* Each curve keeps the same colour as its equation label. */}
      {plane.curvePaths.map((curve) => (
        <path
          key={curve.id}
          d={curve.d}
          fill="none"
          stroke={COLORS[curve.colorIndex % COLORS.length]}
          strokeWidth={strokeWidth * 1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      <g
        fill="#475569"
        fontSize={numberSize}
        fontWeight={500}
        paintOrder="stroke"
        stroke={BACKGROUND}
        strokeWidth={2}
        strokeLinejoin="round"
      >
        {xTicks.filter((tick) => !tick.mathLabel && showXNumber(tick)).map((tick) => (
          <text
            key={`number-x-${tick.value}`}
            x={tick.x}
            y={xNumberY}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {tick.label}
          </text>
        ))}

        {yTicks.filter((tick) => !tick.mathLabel && showYNumber(tick)).map((tick) => (
          <text
            key={`number-y-${tick.value}`}
            x={yNumberX}
            y={tick.y}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {tick.label}
          </text>
        ))}

        {!coveredByLabel(zeroBox) && (
          <text
            x={origin.x - fontSize * 0.4}
            y={xNumberY}
            textAnchor="end"
            dominantBaseline="middle"
          >
            0
          </text>
        )}
      </g>
    {/* Pi ticks use MathText for proper stacked fractions. */}
      {xTicks
        .filter((tick) => tick.mathLabel && showXNumber(tick))
        .map((tick) => (
          <IntegralLabel
            key={`math-x-${tick.value}`}
            plane={{ ...plane, fontSize: numberSize }}
            color="#475569"
            label={{
              text: tick.mathLabel,
              x: tick.x,
              y: xNumberY,
              width: tickLabelWidth(tick),
              height: tickLabelHeight(tick),
              align: "middle",
            }}
          />
        ))}

      {yTicks
        .filter((tick) => tick.mathLabel && showYNumber(tick))
        .map((tick) => (
          <IntegralLabel
            key={`math-y-${tick.value}`}
            plane={{ ...plane, fontSize: numberSize }}
            color="#475569"
            label={{
              text: tick.mathLabel,
              x: yNumberX - tickLabelWidth(tick) / 2,
              y: tick.y,
              width: tickLabelWidth(tick),
              height: tickLabelHeight(tick),
              align: "end",
            }}
          />
        ))}
      <IntegralLabel
        plane={plane}
        label={{
          text: "$x$",
          x: plot.right + fontSize * 1.6,
          y: origin.y,
          width: fontSize * 2,
          height: fontSize * 2,
          align: "middle",
        }}
      />

      <IntegralLabel
        plane={plane}
        label={{
          text: plane.yAxisLabel,
          x: origin.x,
          y: plot.top - fontSize * 1.7,
          width: fontSize * 2,
          height: fontSize * 2,
          align: "middle",
        }}
      />

      {plane.labels.map((label) => (
        <IntegralLabel
          key={label.id}
          label={label}
          plane={plane}
          color={COLORS[label.colorIndex % COLORS.length]}
        />
      ))}
    </g>
  );
}