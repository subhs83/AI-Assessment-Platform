import { useIsMobile } from "../../../../hooks/useIsMobile";
import MathText from "../../../common/MathText";

import { parseSymmetry } from "./symmetry/symmetryParser";
import { calculateSymmetryPositions } from "./symmetry/symmetryPositions";

export default function SymmetryVisual({ visual }) {
  const isMobile = useIsMobile();

  if (!visual) return null;

  const parsed = parseSymmetry(visual);
  const plane = parsed.valid
    ? calculateSymmetryPositions({ parsed, isMobile })
    : null;

  if (!plane) {
    return (
      <div
        role="status"
        className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
      >
        This symmetry figure could not be displayed. Please review
        its shape and symmetry relationships.
      </div>
    );
  }

  const { shape, fontSize, strokeWidth } = plane;

  const labelX = (label) =>
    Math.max(
      2,
      Math.min(plane.width - label.width - 2, label.x - label.width / 2)
    );

  const labelY = (label) =>
    Math.max(
      2,
      Math.min(plane.height - label.height - 2, label.y - label.height / 2)
    );

  return (
    <div className="my-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <svg
        viewBox={`0 0 ${plane.width} ${plane.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto block h-auto w-full max-w-xl"
        role="img"
        aria-label={
        plane.figure.subtype === "rotational_symmetry"
          ? "Shape with a labelled centre for a rotational-symmetry question"
          : plane.figure.feature === "count_lines"
            ? "Shape for a line-symmetry question"
            : "Shape with labelled candidate lines"
      }
      >
        {shape.type === "polygon" ? (
          <polygon
            points={shape.vertices.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="#dbeafe"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        ) : (
          <ellipse
            cx={shape.center.x}
            cy={shape.center.y}
            rx={shape.rx}
            ry={shape.ry}
            fill="#dbeafe"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
        )}

        {/* Every candidate uses the same appearance.
            Correctness never changes its styling. */}
        {plane.lines.map((line) => (
          <line
            key={line.id}
            x1={line.start.x}
            y1={line.start.y}
            x2={line.end.x}
            y2={line.end.y}
            stroke="#7c3aed"
            strokeWidth={strokeWidth * 0.8}
            strokeDasharray={`${fontSize * 0.45} ${fontSize * 0.3}`}
            strokeLinecap="round"
          />
        ))}

        {/* Unlabelled construction points are intentionally hidden. */}
        {/* Place vertex labels outward; keep centre labels beside their dots. */}
        {plane.points.map((point) => {
          const vertices = shape.type === "polygon" ? shape.vertices : [];

          const isVertex = vertices.some(
            (vertex) =>
              Math.hypot(vertex.x - point.x, vertex.y - point.y) < 0.01
          );

          let offsetX = fontSize * 0.7;
          let offsetY = -fontSize * 0.7;
          let anchor = "start";
          let baseline = "auto";

          if (isVertex) {
            // Use the adjacent boundary edges to find the outward direction.
            const index = vertices.findIndex(
              (vertex) =>
                Math.hypot(vertex.x - point.x, vertex.y - point.y) < 0.01
            );

            const previous = vertices[
              (index + vertices.length - 1) % vertices.length
            ];
            const next = vertices[(index + 1) % vertices.length];

            const signedArea = vertices.reduce((sum, vertex, i) => {
              const following = vertices[(i + 1) % vertices.length];
              return sum + vertex.x * following.y - following.x * vertex.y;
            }, 0);

            const direction = signedArea > 0 ? 1 : -1;

            const incomingLength = Math.hypot(
              point.x - previous.x,
              point.y - previous.y
            );
            const outgoingLength = Math.hypot(
              next.x - point.x,
              next.y - point.y
            );

            let nx = direction * (
              (point.y - previous.y) / incomingLength +
              (next.y - point.y) / outgoingLength
            );

            let ny = -direction * (
              (point.x - previous.x) / incomingLength +
              (next.x - point.x) / outgoingLength
            );

            const normalLength = Math.hypot(nx, ny);

            if (normalLength > 1e-8) {
              nx /= normalLength;
              ny /= normalLength;

              offsetX = nx * fontSize * 0.75;
              offsetY = ny * fontSize * 0.75;

              anchor = nx < -0.25 ? "end" : nx > 0.25 ? "start" : "middle";
              baseline = ny > 0.25 ? "hanging" : ny < -0.25 ? "auto" : "middle";
            }
          }

          return (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r={Math.max(2, strokeWidth)}
                fill="#1e293b"
              />

              <text
                x={point.x + offsetX}
                y={point.y + offsetY}
                textAnchor={anchor}
                dominantBaseline={baseline}
                fontSize={fontSize}
                fontWeight="600"
                fill="#1e293b"
              >
                {point.label}
              </text>
            </g>
          );
        })}

        {plane.labels.map((label) => (
          <foreignObject
            key={label.id}
            x={labelX(label)}
            y={labelY(label)}
            width={label.width}
            height={label.height}
          >
            <div
              className="text-violet-700"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                fontSize,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              <MathText text={label.text} />
            </div>
          </foreignObject>
        ))}
      </svg>
    </div>
  );
}