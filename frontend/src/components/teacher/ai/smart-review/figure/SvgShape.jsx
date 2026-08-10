import SvgText from "./SvgText";

export default function SvgShape({ element }) {
  if (!element) {
    return null;
  }

  const fill = element.fill ?? "none";
  const stroke = element.stroke ?? "black";
  const strokeWidth = element.strokeWidth ?? 3;

  switch (element.type) {
    case "circle":
      return (
        <circle
          cx={element.cx}
          cy={element.cy}
          r={element.r}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );

    case "square":
      return (
        <rect
          x={element.x}
          y={element.y}
          width={element.size}
          height={element.size}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );

    case "rectangle":
      return (
        <rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );

    case "polygon":
      return (
        <polygon
          points={
            element.points
              ?.map(([x, y]) => `${x},${y}`)
              .join(" ") || ""
          }
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );

    case "line":
      return (
        <line
          x1={element.x1}
          y1={element.y1}
          x2={element.x2}
          y2={element.y2}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );

    case "point":
      return (
        <circle
          cx={element.x}
          cy={element.y}
          r={element.r ?? 7}
          fill={fill === "none" ? "black" : fill}
          stroke={stroke === "none" ? "none" : stroke}
          strokeWidth={strokeWidth}
        />
      );

    case "text":
      return (
        <SvgText
          x={element.x}
          y={element.y}
        >
          {element.text}
        </SvgText>
      );

    case "arc":
      return renderArc(element, stroke, strokeWidth);

    default:
      return null;
  }
}

function renderArc(element, stroke, strokeWidth) {
  const {
    cx,
    cy,
    r,
  } = element;

  // Support the new AI JSON naming.
  const startAngle =
    element.startAngle ?? element.start_angle;

  const endAngle =
    element.endAngle ?? element.end_angle;

  if (
    cx == null ||
    cy == null ||
    r == null ||
    startAngle == null ||
    endAngle == null
  ) {
    return null;
  }

  const start = polarToCartesian(
    cx,
    cy,
    r,
    endAngle
  );

  const end = polarToCartesian(
    cx,
    cy,
    r,
    startAngle
  );

  const largeArcFlag =
    Math.abs(endAngle - startAngle) <= 180
      ? "0"
      : "1";

  const pathData = [
    `M ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
  ].join(" ");

  return (
    <path
      d={pathData}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

function polarToCartesian(cx, cy, r, angle) {
  const angleInRadians =
    ((angle - 90) * Math.PI) / 180;

  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}