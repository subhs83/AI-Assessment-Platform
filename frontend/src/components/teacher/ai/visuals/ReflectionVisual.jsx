import { useIsMobile } from "../../../../hooks/useIsMobile";
import MathText from "../../../common/MathText";

import { parseReflection } from "./symmetry/reflectionParser";
import { calculateReflectionPositions } from "./symmetry/reflectionPositions";

const COLORS = {
  original: "#2563eb",
  candidate: "#ea580c",
  mirror: "#7c3aed",
  grid: "#e2e8f0",
  axis: "#64748b",
};

function MathLabel({
  text,
  x,
  y,
  plane,
  color = "#1e293b",
  background = false,
  compact = false,
}) {
  if (!text) return null;

  const fontSize = plane.fontSize * (compact ? 0.85 : 1);
  const labelWidth = Math.min(
    plane.width - 4,
    fontSize * (compact ? 4 : 7)
  );
  const labelHeight = fontSize * 2;

  const left = Math.max(
    2,
    Math.min(plane.width - labelWidth - 2, x - labelWidth / 2)
  );

  const top = Math.max(
    2,
    Math.min(plane.height - labelHeight - 2, y - labelHeight / 2)
  );

  return (
    <foreignObject
      x={left}
      y={top}
      width={labelWidth}
      height={labelHeight}
      style={{ overflow: "visible", pointerEvents: "none" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          fontSize,
          color,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            background: background ? "rgba(255,255,255,0.94)" : undefined,
            borderRadius: 4,
            padding: background ? "0 3px" : 0,
            fontWeight: compact ? 400 : 600,
          }}
        >
          <MathText text={text} />
        </span>
      </div>
    </foreignObject>
  );
}

function CoordinateGrid({ plane }) {
  const { grid, plot, fontSize, strokeWidth } = plane;
  if (!grid) return null;

  const numberY = Math.min(
    plot.bottom + fontSize,
    (grid.xAxisY ?? plot.bottom) + fontSize
  );

  const numberX = (grid.yAxisX ?? plot.left) - fontSize * 1.1;
  const thinStroke = Math.max(0.5, strokeWidth * 0.3);

  return (
    <g>
      {/* Grid */}
      {grid.minorXTicks.map(({ value, x }) => (
        <line
            key={`grid-x-${value}`}
            x1={x}
            y1={plot.top}
            x2={x}
            y2={plot.bottom}
            stroke={COLORS.grid}
            strokeWidth={thinStroke}
        />
        ))}

        {grid.minorYTicks.map(({ value, y }) => (
        <line
            key={`grid-y-${value}`}
            x1={plot.left}
            y1={y}
            x2={plot.right}
            y2={y}
            stroke={COLORS.grid}
            strokeWidth={thinStroke}
        />
        ))}

      {/* Cartesian axes */}
      {grid.xAxisY !== null && (
        <line
          x1={plot.left}
          y1={grid.xAxisY}
          x2={plot.right}
          y2={grid.xAxisY}
          stroke={COLORS.axis}
          strokeWidth={strokeWidth * 0.7}
        />
      )}

      {grid.yAxisX !== null && (
        <line
          x1={grid.yAxisX}
          y1={plot.top}
          x2={grid.yAxisX}
          y2={plot.bottom}
          stroke={COLORS.axis}
          strokeWidth={strokeWidth * 0.7}
        />
      )}

      {/* Coordinate numbers */}
      {grid.xTicks
        .filter(({ value }) => value !== 0)
        .map(({ value, x }) => (
          <MathLabel
            key={`number-x-${value}`}
            text={`$${value}$`}
            x={x}
            y={numberY}
            plane={plane}
            compact
          />
        ))}

      {grid.yTicks
        .filter(({ value }) => value !== 0)
        .map(({ value, y }) => (
          <MathLabel
            key={`number-y-${value}`}
            text={`$${value}$`}
            x={numberX}
            y={y}
            plane={plane}
            compact
          />
        ))}

      {grid.xAxisY !== null && grid.yAxisX !== null && (
        <MathLabel
          text="$0$"
          x={grid.yAxisX - fontSize}
          y={grid.xAxisY + fontSize}
          plane={plane}
          compact
        />
      )}

      {grid.xAxisY !== null && (
        <MathLabel
          text="$x$"
          x={plot.right + fontSize * 1.5}
          y={grid.xAxisY}
          plane={plane}
          color={COLORS.axis}
          compact
        />
      )}

      {grid.yAxisX !== null && (
        <MathLabel
          text="$y$"
          x={grid.yAxisX}
          y={plot.top - fontSize * 1.4}
          plane={plane}
          color={COLORS.axis}
          compact
        />
      )}
    </g>
  );
}

function Polygon({ shape, plane, candidate = false }) {
  if (!shape || shape.type !== "polygon") return null;

  const color = candidate ? COLORS.candidate : COLORS.original;

  return (
    <polygon
      points={shape.vertices.map((point) => `${point.x},${point.y}`).join(" ")}
      fill={color}
      fillOpacity={candidate ? 0.1 : 0.14}
      stroke={color}
      strokeWidth={plane.strokeWidth}
      strokeLinejoin="round"
      strokeDasharray={
        candidate
          ? `${plane.fontSize * 0.5} ${plane.fontSize * 0.3}`
          : undefined
      }
    />
  );
}

/*function LegendItem({ color, dashed = false, children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        style={{
          width: 20,
          borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}`,
        }}
      />
      {children}
    </span>
  );
}
*/
function polygonLabelPosition(shape, fontSize, below = false) {
  const xs = shape.vertices.map((point) => point.x);
  const ys = shape.vertices.map((point) => point.y);

  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: below
      ? Math.max(...ys) + fontSize * 1.2
      : Math.min(...ys) - fontSize * 1.2,
  };
}

function ReflectionPanel({ panel, plane }) {
  const { original, candidate, mirror } = panel;
  const { fontSize, strokeWidth, plot, grid } = plane;

  const points = new Map(
    panel.labelledPoints.map((point) => [point.id, point])
  );

  if (original.type === "point") {
    points.set(original.id, original);
  }

  // Crop unused canvas around candidate panels.
  // Every candidate uses the same plot and therefore the same crop.
  const padding = fontSize * 2;

  const viewLeft = candidate
    ? Math.max(0, plot.left - padding)
    : 0;

  const viewTop = candidate
    ? Math.max(0, plot.top - padding)
    : 0;

  const viewRight = candidate
    ? Math.min(plane.width, plot.right + padding)
    : plane.width;

  const viewBottom = candidate
    ? Math.min(plane.height, plot.bottom + padding)
    : plane.height;

  const originalLabel =
    original.type === "polygon"
      ? polygonLabelPosition(original, fontSize)
      : null;

  const candidateLabel = candidate
    ? polygonLabelPosition(candidate, fontSize, true)
    : null;

  // Suppress only redundant labels when the mirror is the named axis.
  const mirrorName = mirror.label.trim().toLowerCase();
  const tolerance = 0.01;

  const isXAxisMirror =
    grid?.xAxisY != null &&
    Math.abs(mirror.start.y - grid.xAxisY) < tolerance &&
    Math.abs(mirror.end.y - grid.xAxisY) < tolerance;

  const isYAxisMirror =
    grid?.yAxisX != null &&
    Math.abs(mirror.start.x - grid.yAxisX) < tolerance &&
    Math.abs(mirror.end.x - grid.yAxisX) < tolerance;

  const hideMirrorLabel =
    (isXAxisMirror && ["x", "x-axis", "x axis"].includes(mirrorName)) ||
    (isYAxisMirror && ["y", "y-axis", "y axis"].includes(mirrorName));

  // Prefer the upper endpoint; for horizontal mirrors, use the right end.
  const horizontal =
    Math.abs(mirror.start.y - mirror.end.y) < tolerance;

  const mirrorEnd = horizontal
    ? (mirror.start.x > mirror.end.x ? mirror.start : mirror.end)
    : (mirror.start.y < mirror.end.y ? mirror.start : mirror.end);

  const mirrorLabel = {
    x: horizontal
      ? mirrorEnd.x - fontSize * 1.5
      : mirrorEnd.x,
    y: mirrorEnd.y - fontSize * 1.2,
  };

  return (
    <div
        className={
            candidate
            ? "min-w-0 rounded-lg border border-slate-200 bg-white p-1 sm:p-2"
            : "min-w-0 rounded-xl border border-slate-200 bg-white p-2 sm:p-3"
        }
        >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`${viewLeft} ${viewTop} ${viewRight - viewLeft} ${viewBottom - viewTop}`}
        preserveAspectRatio="xMidYMid meet"
        className={
          candidate
            ? "mx-auto block h-auto w-full"
            : "mx-auto block h-auto w-full max-w-xl"
        }
        role="img"
        aria-label={
          candidate
            ? `Reflection candidate ${candidate.label} with original and mirror`
            : "Original point and mirror line"
        }
      >
        <CoordinateGrid plane={plane} />

        <Polygon shape={original} plane={plane} />
        <Polygon shape={candidate} plane={plane} candidate />

        <line
          x1={mirror.start.x}
          y1={mirror.start.y}
          x2={mirror.end.x}
          y2={mirror.end.y}
          stroke={COLORS.mirror}
          strokeWidth={strokeWidth}
          strokeDasharray={`${fontSize * 0.55} ${fontSize * 0.35}`}
        />

        {!hideMirrorLabel && (
          <MathLabel
            text={mirror.label}
            x={mirrorLabel.x}
            y={mirrorLabel.y}
            plane={plane}
            color={COLORS.mirror}
            background
          />
        )}

        {originalLabel && (
          <MathLabel
            text={original.label || "Original"}
            x={originalLabel.x}
            y={originalLabel.y}
            plane={plane}
            color={COLORS.original}
            background
          />
        )}

        {candidateLabel && (
          <MathLabel
            text={candidate.label}
            x={candidateLabel.x}
            y={candidateLabel.y}
            plane={plane}
            color={COLORS.candidate}
            background
          />
        )}

        {[...points.values()].map((point) => {
          const labelX =
            point.x > plot.right - fontSize * 3
              ? point.x - fontSize * 1.4
              : point.x + fontSize * 1.4;

          const labelY =
            point.y < plot.top + fontSize * 2
              ? point.y + fontSize * 1.4
              : point.y - fontSize * 1.4;

          return (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r={Math.max(2.5, strokeWidth * 1.5)}
                fill={COLORS.original}
              />

              <MathLabel
                text={point.label}
                x={labelX}
                y={labelY}
                plane={plane}
                color={COLORS.original}
                background
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function ReflectionVisual({ visual }) {
  const isMobile = useIsMobile();

  if (!visual) return null;

  const parsed = parseReflection(visual);

  const plane = parsed.valid
    ? calculateReflectionPositions({ parsed, isMobile })
    : null;

  if (!plane) {
    return (
      <div
        role="status"
        className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
      >
        This reflection figure could not be displayed. Please review
        its points and relationships.
      </div>
    );
  }

  const multiplePanels = plane.panels.length > 1;

  return (
    <div className="my-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div
        className={
          multiplePanels
            ? "grid grid-cols-2 gap-2 sm:gap-3"
            : "grid grid-cols-1"
        }
      >
        {plane.panels.map((panel) => (
          <ReflectionPanel
            key={panel.id}
            panel={panel}
            plane={plane}
          />
        ))}
      </div>
    </div>
  );
}