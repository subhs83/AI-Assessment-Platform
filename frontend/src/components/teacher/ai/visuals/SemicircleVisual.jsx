import MathText from "../../../common/MathText";
import { calculateSemicircleGeometry } from "./geometry/semicircleGeometry";

function MeasurementLabel({ guide, plane }) {
  const labelWidth = Math.min(plane.width, plane.fontSize * 10);
  const labelHeight = plane.fontSize * 2.2;

  const x = Math.max(
    0,
    Math.min(plane.width - labelWidth, guide.labelX - labelWidth / 2)
  );

  return (
    <foreignObject
      x={x}
      y={guide.labelY - labelHeight / 2}
      width={labelWidth}
      height={labelHeight}
    >
      <div
        className="text-slate-800"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          fontSize: plane.fontSize,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        <MathText text={guide.text} />
      </div>
    </foreignObject>
  );
}

export default function SemicircleVisual({ visual, isMobile = false }) {
  const plane = calculateSemicircleGeometry(visual, isMobile);

  if (!plane.valid) {
    return (
      <div
        role="status"
        className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
      >
        This semicircle could not be displayed. Please review its
        centre, diameter, and radius relationships.
      </div>
    );
  }

  const { fontSize, strokeWidth } = plane;
  const arcOnly = plane.feature === "arc_length";
  const tick = Math.max(2, fontSize * 0.2);

  return (
    <div className="my-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <svg
        viewBox={`0 0 ${plane.width} ${plane.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto block h-auto w-full max-w-xl"
        role="img"
        aria-label={
          arcOnly
            ? "Semicircle with its curved arc highlighted"
            : "Semicircle with given radius or diameter"
        }
      >
        <path
          d={plane.regionPath}
          fill={plane.feature === "area" ? "#dbeafe" : "#eff6ff"}
          stroke="none"
        />

        <path
          d={plane.arcPath}
          fill="none"
          stroke={arcOnly ? "#2563eb" : "#1e293b"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Diameter remains visible but is muted for arc-length questions. */}
        <line
          x1={plane.left.x}
          y1={plane.left.y}
          x2={plane.right.x}
          y2={plane.right.y}
          stroke={arcOnly ? "#94a3b8" : "#1e293b"}
          strokeWidth={arcOnly ? strokeWidth * 0.65 : strokeWidth}
        />

        {plane.points.map((point) => (
          <g key={point.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r={Math.max(2, strokeWidth)}
              fill="#1e293b"
            />

            {point.label && (
              <text
                x={point.x}
                y={point.y + fontSize * 1.25}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight="600"
                fill="#1e293b"
              >
                {point.label}
              </text>
            )}
          </g>
        ))}

        {plane.guides.map((guide) => (
          <g key={guide.id}>
            <g
              stroke="#64748b"
              strokeWidth={strokeWidth * 0.5}
              fill="none"
            >
              <line
                x1={guide.start.x}
                y1={guide.start.y}
                x2={guide.end.x}
                y2={guide.end.y}
              />

              {[guide.start, guide.end].map((point, index) => (
                <line
                  key={index}
                  x1={point.x}
                  y1={point.y - tick}
                  x2={point.x}
                  y2={point.y + tick}
                />
              ))}
            </g>

            <MeasurementLabel guide={guide} plane={plane} />
          </g>
        ))}
      </svg>
    </div>
  );
}