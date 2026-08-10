import SvgText from "./SvgText";

export default function SvgShape({ element }) {
  if (!element) {
    return null;
  }

  switch (element.type) {
    case "circle":
      return (
        <circle
          cx={element.cx}
          cy={element.cy}
          r={element.r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      );

    case "square":
      return (
        <rect
          x={element.x}
          y={element.y}
          width={element.size}
          height={element.size}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      );

    case "rectangle":
      return (
        <rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      );

    case "polygon":
      return (
        <polygon
          points={element.points
            ?.map(([x, y]) => `${x},${y}`)
            .join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      );

    case "line":
      return (
        <line
          x1={element.x1}
          y1={element.y1}
          x2={element.x2}
          y2={element.y2}
          stroke="currentColor"
          strokeWidth="3"
        />
      );

    case "point":
      return (
        <circle
          cx={element.x}
          cy={element.y}
          r="7"
          fill="currentColor"
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
      return renderArc(element);

    default:
      return null;
  }
}

function renderArc(element) {
  const {
    cx,
    cy,
    r,
    start_angle,
    end_angle,
  } = element;

  if (
    cx == null ||
    cy == null ||
    r == null ||
    start_angle == null ||
    end_angle == null
  ) {
    return null;
  }

  const start = polarToCartesian(
    cx,
    cy,
    r,
    end_angle
  );

  const end = polarToCartesian(
    cx,
    cy,
    r,
    start_angle
  );

  const largeArcFlag =
    Math.abs(end_angle - start_angle) <= 180 ? "0" : "1";

  const pathData = [
    `M ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
  ].join(" ");

  return (
    <path
      d={pathData}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
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