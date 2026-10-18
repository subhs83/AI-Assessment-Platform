// visuals/MappingDiagramVisual.jsx

import { useId } from "react";

import { useIsMobile } from "../../../../hooks/useIsMobile";
import MathText from "../../../common/MathText";

import { parseMappingDiagram } from "./mapping/mappingDiagramParser";
import { calculateMappingDiagramPositions } from "./mapping/mappingDiagramPositions";

function DiagramLabel({ box, text, fontSize, isTitle = false }) {
  const justifyContent =
    box.align === "right"
      ? "flex-end"
      : box.align === "left"
        ? "flex-start"
        : "center";

  return (
    <foreignObject
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
    >
      <div
        className="text-slate-800"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent,
          width: "100%",
          height: "100%",
          fontSize,
          fontWeight: isTitle ? 700 : 500,
          whiteSpace: "nowrap",
        }}
      >
        <MathText text={text} />
      </div>
    </foreignObject>
  );
}

export default function MappingDiagramVisual({ visual }) {
  const isMobile = useIsMobile();

  // Unique per mounted diagram, including pages with several questions.
  const instanceId = useId();
  const arrowId = `mapping-arrow-${instanceId.replace(/:/g, "")}`;

  if (!visual) return null;

  const parsed = parseMappingDiagram(visual);

  const plane = parsed.valid
    ? calculateMappingDiagramPositions({ parsed, isMobile })
    : null;

  if (!plane) {
    return (
      <div
        role="status"
        className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
      >
        This mapping diagram could not be displayed. Please review
        its sets, members and arrow relationships.
      </div>
    );
  }

  const { fontSize, strokeWidth } = plane;
  const sets = [plane.sourceSet, plane.targetSet];

  const arrowSize = Math.max(fontSize * 0.55, strokeWidth * 3);

  return (
    <div className="my-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <svg
        viewBox={`0 0 ${plane.width} ${plane.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto block h-auto w-full max-w-xl"
        role="img"
        aria-label="Mapping diagram with arrows from the left set to the right set"
      >
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth={arrowSize}
            markerHeight={arrowSize}
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill="#475569" />
          </marker>
        </defs>

        {/* Set enclosures. Colours distinguish sets, not correctness. */}
        {sets.map((set) => (
          <ellipse
            key={`outline-${set.id}`}
            cx={set.cx}
            cy={set.cy}
            rx={set.rx}
            ry={set.ry}
            fill={set.side === "source" ? "#eff6ff" : "#f0fdfa"}
            stroke={set.side === "source" ? "#2563eb" : "#0f766e"}
            strokeWidth={strokeWidth}
          />
        ))}

        {/* Draw connections before dots and labels. */}
        {plane.arrows.map((arrow) => (
          <path
            key={arrow.id}
            d={arrow.path}
            fill="none"
            stroke="#475569"
            strokeWidth={strokeWidth * 0.85}
            strokeLinecap="round"
            markerEnd={`url(#${arrowId})`}
          />
        ))}

        {sets.map((set) => (
          <g key={`members-${set.id}`}>
            <DiagramLabel
              box={set.titleBox}
              text={set.label}
              fontSize={fontSize}
              isTitle
            />

            {set.members.map((member) => (
              <g key={member.id}>
                <circle
                  cx={member.x}
                  cy={member.y}
                  r={member.pointRadius}
                  fill="#1e293b"
                />

                <DiagramLabel
                  box={member.labelBox}
                  text={member.label}
                  fontSize={fontSize}
                />
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}