import { useId, useLayoutEffect, useRef, useState } from "react";
import MathText from "../../../../common/MathText";
const STROKE = "#284561";
const HIDDEN = "#8296aa";
const SOLID_COLORS = {
  cube: {
    light: "#eff6ff",
    medium: "#bfdbfe",
    dark: "#60a5fa",
    deep: "#1e40af",
  },
  cuboid: {
    light: "#f0fdfa",
    medium: "#99f6e4",
    dark: "#2dd4bf",
    deep: "#115e59",
  },
  cylinder: {
    light: "#f5f3ff",
    medium: "#ddd6fe",
    dark: "#a78bfa",
    deep: "#5b21b6",
  },
  cone: {
    light: "#fffbeb",
    medium: "#fde68a",
    dark: "#fbbf24",
    deep: "#92400e",
  },
  sphere: {
    light: "#ecfeff",
    medium: "#a5f3fc",
    dark: "#22d3ee",
    deep: "#155e75",
  },
  hemisphere: {
    light: "#fff1f2",
    medium: "#fecdd3",
    dark: "#fb7185",
    deep: "#9f1239",
  },
  triangular_prism: {
    light: "#eef2ff",
    medium: "#c7d2fe",
    dark: "#818cf8",
    deep: "#3730a3",
  },
  square_pyramid: {
    light: "#ecfdf5",
    medium: "#a7f3d0",
    dark: "#34d399",
    deep: "#065f46",
  },
};
function polygonPoints(points) {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}
function usePaintIds() {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return {
    front: `solid-${id}-front`,
    top: `solid-${id}-top`,
    side: `solid-${id}-side`,
    curved: `solid-${id}-curved`,
    interior: `solid-${id}-interior`,
    sphere: `solid-${id}-sphere`,
  };
}
function PaintDefs({ ids, subtype }) {
  const colors = SOLID_COLORS[subtype] || SOLID_COLORS.cube;
  return (
    <defs>
      <linearGradient
        id={ids.front}
        x1="0%" y1="0%" x2="85%" y2="100%"
      >
        <stop offset="0%" stopColor={colors.light} />
        <stop offset="65%" stopColor={colors.medium} />
        <stop offset="100%" stopColor={colors.dark} />
      </linearGradient>
      <linearGradient
        id={ids.top}
        x1="0%" y1="0%" x2="60%" y2="100%"
      >
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor={colors.medium} />
      </linearGradient>
      <linearGradient
        id={ids.side}
        x1="0%" y1="0%" x2="100%" y2="90%"
      >
        <stop offset="0%" stopColor={colors.medium} />
        <stop offset="100%" stopColor={colors.dark} />
      </linearGradient>
      <linearGradient
        id={ids.curved}
        x1="0%" y1="0%" x2="100%" y2="0%"
      >
        <stop offset="0%" stopColor={colors.dark} />
        <stop offset="22%" stopColor={colors.medium} />
        <stop offset="40%" stopColor={colors.light} />
        <stop offset="65%" stopColor={colors.medium} />
        <stop offset="100%" stopColor={colors.deep} />
      </linearGradient>
      <radialGradient
        id={ids.interior}
        cx="50%" cy="85%" r="85%"
      >
        <stop offset="0%" stopColor={colors.medium} />
        <stop offset="65%" stopColor={colors.dark} />
        <stop offset="100%" stopColor={colors.deep} />
      </radialGradient>
      <radialGradient
        id={ids.sphere}
        cx="30%"
        cy="25%"
        r="80%"
        >
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor={colors.light} />
        <stop offset="65%" stopColor={colors.medium} />
        <stop offset="100%" stopColor={colors.deep} />
      </radialGradient>
    </defs>
  );
}
function Edge({ start, end, strokeWidth, dashed = false }) {
  return (
    <line x1={start.x} y1={start.y} x2={end.x} y2={end.y}
      stroke={dashed ? HIDDEN : STROKE}
      strokeWidth={strokeWidth * (dashed ? 0.65 : 0.85)}
      strokeDasharray={dashed ? `${strokeWidth * 3} ${strokeWidth * 2.5}` : undefined}
      strokeLinecap="round" strokeLinejoin="round" />
  );
}
function SolidDimensionLabel({ label, plane }) {
  const { fontSize, width, height } = plane;
  const text = String(label.text ?? "");
  const textRef = useRef(null);

  const [size, setSize] = useState({
    width: fontSize * 8,
    height: fontSize * 2.5,
  });

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;

    let active = true;

    const measure = () => {
      if (!active) return;

      // DOM layout sizes are unaffected by the SVG's screen scaling.
      const measuredWidth = Math.max(
        element.offsetWidth,
        element.scrollWidth
      );

      const measuredHeight = Math.max(
        element.offsetHeight,
        element.scrollHeight
      );

      if (!measuredWidth || !measuredHeight) return;

      const nextWidth = Math.ceil(
        measuredWidth + fontSize * 0.5
      );

      const nextHeight = Math.ceil(
        measuredHeight + fontSize * 0.5
      );

      setSize((previous) =>
        previous.width === nextWidth &&
        previous.height === nextHeight
          ? previous
          : { width: nextWidth, height: nextHeight }
      );
    };

    measure();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;

    observer?.observe(element);

    // Measure again after KaTeX fonts finish loading.
    document.fonts?.ready.then(measure);

    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [text, fontSize]);

  const labelWidth = Math.min(width, size.width);
  const labelHeight = Math.min(height, size.height);
  const anchor = label.anchor || "middle";

  const desiredX =
    anchor === "start"
      ? label.x
      : anchor === "end"
        ? label.x - labelWidth
        : label.x - labelWidth / 2;

  const x = Math.max(
    0,
    Math.min(width - labelWidth, desiredX)
  );

  const y = Math.max(
    0,
    Math.min(height - labelHeight, label.y - labelHeight / 2)
  );

  const justifyContent =
    anchor === "start"
      ? "flex-start"
      : anchor === "end"
        ? "flex-end"
        : "center";

  return (
    <foreignObject
      x={x}
      y={y}
      width={labelWidth}
      height={labelHeight}
    >
      <div
        className="text-slate-800"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent,
          width: "100%",
          height: "100%",
        }}
      >
        <div
          ref={textRef}
          style={{
            display: "inline-flex",
            alignItems: "center",
            flexShrink: 0,
            width: "max-content",
            fontSize: fontSize * 1.2,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          <MathText text={text} />
        </div>
      </div>
    </foreignObject>
  );
}

function DimensionLabels({ plane }) {
  return (plane.dimensionLabels || []).map((label) => (
    <SolidDimensionLabel
      key={label.id}
      label={label}
      plane={plane}
    />
  ));
}
function BoxSolid({ plane }) {
  const ids = usePaintIds();
  const { A, B, C, D, E, F, G, H } = plane.vertices;
  const open = new Set(plane.figure.open_faces || []);
  const topOpen = open.has("top");
  const bottomOpen = open.has("bottom");
  const edges = [[A, B], [B, C], [C, D], [D, A], [A, E], [E, F], [F, B], [F, G], [G, C]];
  const rearEdges = [[E, H], [H, G], [H, D]];
  return (
    <g>
      <PaintDefs ids={ids} subtype={plane.figure.subtype} />
      {!bottomOpen && <polygon points={polygonPoints([D, C, G, H])} fill="#a2bdd4" />}
      {topOpen && <>
        <polygon points={polygonPoints([E, F, G, H])} fill={`url(#${ids.interior})`} />
        <polygon points={polygonPoints([A, E, H, D])} fill="#8faec7" />
      </>}
      <polygon points={polygonPoints([A, B, C, D])} fill={`url(#${ids.front})`} />
      <polygon points={polygonPoints([B, F, G, C])} fill={`url(#${ids.side})`} />
      {!topOpen && <polygon points={polygonPoints([A, E, F, B])} fill={`url(#${ids.top})`} />}
      {rearEdges.map(([start, end], index) => <Edge key={`rear-${index}`} start={start}
        end={end} strokeWidth={plane.strokeWidth} dashed />)}
      {edges.map(([start, end], index) => <Edge key={`edge-${index}`} start={start}
        end={end} strokeWidth={plane.strokeWidth} />)}
      {/* Subtle light on the upper-left boundary. */}
      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#ffffff"
        strokeWidth={plane.strokeWidth * 0.3} opacity="0.65" />
      <DimensionLabels plane={plane} />
    </g>
  );
}
export function renderCube(plane) {
  return plane?.vertices ? <BoxSolid plane={plane} /> : null;
}
export function renderCuboid(plane) {
  return plane?.vertices ? <BoxSolid plane={plane} /> : null;
}
function CylinderSolid({ plane }) {
  const ids = usePaintIds();
  const { cx, topY, bottomY, rx, ry } = plane.cylinder;
  const open = new Set(plane.figure.open_faces || []);
  const { strokeWidth } = plane;
  const outlineWidth = strokeWidth * 0.85;
  const body = `M ${cx - rx} ${topY} L ${cx - rx} ${bottomY} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottomY} L ${cx + rx} ${topY} A ${rx} ${ry} 0 0 1 ${cx - rx} ${topY} Z`;
  // Decorative thin rim; measurements still use the original outer edge.
  const rim = Math.min(rx * 0.055, ry * 0.3);
  return (
    <g>
      <PaintDefs ids={ids} subtype={plane.figure.subtype} />
      <path d={body} fill={`url(#${ids.curved})`} />
      <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill={`url(#${ids.top})`}
        stroke={STROKE} strokeWidth={outlineWidth} />
      {open.has("top") && <ellipse cx={cx} cy={topY} rx={rx - rim} ry={ry - rim}
        fill={`url(#${ids.interior})`} stroke="#7892aa" strokeWidth={strokeWidth * 0.45} />}
      <Edge start={{ x: cx - rx, y: topY }} end={{ x: cx - rx, y: bottomY }} strokeWidth={strokeWidth} />
      <Edge start={{ x: cx + rx, y: topY }} end={{ x: cx + rx, y: bottomY }} strokeWidth={strokeWidth} />
      <path d={`M ${cx - rx} ${bottomY} A ${rx} ${ry} 0 0 1 ${cx + rx} ${bottomY}`}
        fill="none" stroke={HIDDEN} strokeWidth={strokeWidth * 0.65}
        strokeDasharray={`${strokeWidth * 3} ${strokeWidth * 2.5}`} />
      <path d={`M ${cx - rx} ${bottomY} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottomY}`}
        fill="none" stroke={STROKE} strokeWidth={outlineWidth} />
      {open.has("bottom") && <text x={cx} y={bottomY + ry + plane.fontSize}
        textAnchor="middle" fontSize={plane.fontSize} fill={STROKE}>Open bottom</text>}
      {(plane.dimensionLines || []).map((dimension) => <Edge key={dimension.id}
        start={dimension.start} end={dimension.end} strokeWidth={strokeWidth} />)}
      <DimensionLabels plane={plane} />
    </g>
  );
}
export function renderCylinder(plane) {
  return plane?.cylinder ? <CylinderSolid plane={plane} /> : null;
}
function ConeSolid({ plane }) {
  const ids = usePaintIds();
  const { apex, base, left, right, rx, ry } = plane.cone;
  const { strokeWidth } = plane;
  const body = `M ${apex.x} ${apex.y} L ${left.x} ${left.y} A ${rx} ${ry} 0 0 0 ${right.x} ${right.y} Z`;
  return (
    <g>
      <PaintDefs ids={ids} subtype={plane.figure.subtype} />
      <path d={body} fill={`url(#${ids.curved})`} />
      <Edge start={apex} end={left} strokeWidth={strokeWidth} />
      <Edge start={apex} end={right} strokeWidth={strokeWidth} />
      <path d={`M ${left.x} ${base.y} A ${rx} ${ry} 0 0 1 ${right.x} ${base.y}`}
        fill="none" stroke={HIDDEN} strokeWidth={strokeWidth * 0.65}
        strokeDasharray={`${strokeWidth * 3} ${strokeWidth * 2.5}`} />
      <path d={`M ${left.x} ${base.y} A ${rx} ${ry} 0 0 0 ${right.x} ${base.y}`}
        fill="none" stroke={STROKE} strokeWidth={strokeWidth * 0.85} />
      {(plane.dimensionLines || []).map((dimension) => {
        const isVerticalHeight = Math.abs(dimension.start.x - apex.x) < 1e-6 &&
          Math.abs(dimension.start.y - apex.y) < 1e-6 &&
          Math.abs(dimension.end.x - base.x) < 1e-6 &&
          Math.abs(dimension.end.y - base.y) < 1e-6;
        return <Edge key={dimension.id} start={dimension.start} end={dimension.end}
          strokeWidth={strokeWidth} dashed={isVerticalHeight} />;
      })}
      <DimensionLabels plane={plane} />
    </g>
  );
}
export function renderCone(plane) {
  return plane?.cone ? <ConeSolid plane={plane} /> : null;
}
function RadialDimensionLines({ plane }) {
  return (plane.dimensionLines || []).map((dimension) => (
    <Edge
      key={dimension.id}
      start={dimension.start}
      end={dimension.end}
      strokeWidth={plane.strokeWidth}
    />
  ));
}
function SphereSolid({ plane }) {
  const ids = usePaintIds();
  const { cx, cy, r } = plane.sphere;
  const { strokeWidth } = plane;
  return (
    <g>
      <PaintDefs ids={ids} subtype={plane.figure.subtype} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={`url(#${ids.sphere})`}
        stroke={STROKE}
        strokeWidth={strokeWidth * 0.85}
      />
      {/* Equator: rear half hidden, front half visible. */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r * 0.28} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={HIDDEN}
        strokeWidth={strokeWidth * 0.65}
        strokeDasharray={`${strokeWidth * 3} ${strokeWidth * 2.5}`}
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r * 0.28} 0 0 0 ${cx + r} ${cy}`}
        fill="none"
        stroke={STROKE}
        strokeWidth={strokeWidth * 0.6}
        opacity="0.65"
      />
      <circle cx={cx} cy={cy} r={strokeWidth * 1.1} fill={STROKE} />
      <RadialDimensionLines plane={plane} />
      <DimensionLabels plane={plane} />
    </g>
  );
}
export function renderSphere(plane) {
  return plane?.sphere ? <SphereSolid plane={plane} /> : null;
}
function HemisphereSolid({ plane }) {
  const ids = usePaintIds();
  const { cx, baseY, r, ry } = plane.hemisphere;
  const { strokeWidth } = plane;
  const dome = [
    `M ${cx - r} ${baseY}`,
    `A ${r} ${r} 0 0 1 ${cx + r} ${baseY}`,
    `A ${r} ${ry} 0 0 1 ${cx - r} ${baseY}`,
    "Z",
  ].join(" ");
  return (
    <g>
      <PaintDefs ids={ids} subtype={plane.figure.subtype} />
      {/* Solid dome above its circular base. */}
      <path
        d={dome}
        fill={`url(#${ids.sphere})`}
      />
      {/* Front of the base perimeter. */}
      <path
        d={`M ${cx - r} ${baseY} A ${r} ${ry} 0 0 0 ${cx + r} ${baseY}`}
        fill="none"
        stroke={STROKE}
        strokeWidth={strokeWidth * 0.85}
      />
      {/* Rear base perimeter, hidden by the dome. */}
      <path
        d={`M ${cx - r} ${baseY} A ${r} ${ry} 0 0 1 ${cx + r} ${baseY}`}
        fill="none"
        stroke={HIDDEN}
        strokeWidth={strokeWidth * 0.65}
        strokeDasharray={`${strokeWidth * 3} ${strokeWidth * 2.5}`}
      />
      <path
        d={`M ${cx - r} ${baseY} A ${r} ${r} 0 0 1 ${cx + r} ${baseY}`}
        fill="none"
        stroke={STROKE}
        strokeWidth={strokeWidth * 0.85}
      />
      <circle
        cx={cx}
        cy={baseY}
        r={strokeWidth * 1.1}
        fill={STROKE}
      />
      <RadialDimensionLines plane={plane} />
      <DimensionLabels plane={plane} />
    </g>
  );
}
export function renderHemisphere(plane) {
  return plane?.hemisphere
    ? <HemisphereSolid plane={plane} />
    : null;
}
function PrismBaseDetail({ plane, ids }) {
  const { A, B, C, foot } = plane.baseDetail.vertices;
  const { strokeWidth, fontSize, width } = plane;
  const hasAltitude = plane.dimensionLines.some((d) => d.role === "base_altitude");
  const size = Math.min(fontSize * 0.65, Math.abs(C.y - foot.y) * 0.2);
  const onBase = foot.x >= Math.min(A.x, B.x) && foot.x <= Math.max(A.x, B.x);
  return <g>
    <line x1={fontSize} y1={plane.baseDetail.dividerY} x2={width - fontSize}
      y2={plane.baseDetail.dividerY} stroke="#cbd5e1" strokeWidth={strokeWidth * 0.4} />
    <text x={width / 2} y={plane.baseDetail.captionY} textAnchor="middle"
      dominantBaseline="middle" fontSize={fontSize} fill="#475569">Triangular base detail</text>
    <polygon points={polygonPoints([A, B, C])} fill={`url(#${ids.front})`}
      stroke={STROKE} strokeWidth={strokeWidth * 0.85} strokeLinejoin="round" />
    {hasAltitude && <>
      <Edge start={C} end={foot} strokeWidth={strokeWidth} dashed />
      {!onBase && <Edge start={foot.x < A.x ? A : B} end={foot} strokeWidth={strokeWidth} dashed />}
      <path d={`M ${foot.x} ${foot.y - size} L ${foot.x + size} ${foot.y - size} L ${foot.x + size} ${foot.y}`}
        fill="none" stroke={STROKE} strokeWidth={strokeWidth * 0.65} />
    </>}
  </g>;
}
function TriangularPrismSolid({ plane }) {
  const ids = usePaintIds();
  const { A, B, C, D, E, F, foot } = plane.prism.vertices;
  const { strokeWidth } = plane;
  const visibleEdges = [
    [A, B], [B, C], [C, A],
    [C, F], [F, E], [E, B],
  ];
  const hiddenEdges = [
    [A, D], [D, E], [D, F],
  ];
  const altitude = !plane.mobileStacked && (plane.dimensionLines || []).find(
    (dimension) => dimension.role === "base_altitude"
  );
  const markerSize = Math.min(
    plane.fontSize * 0.7,
    Math.hypot(C.x - foot.x, C.y - foot.y) * 0.2,
    Math.hypot(B.x - A.x, B.y - A.y) * 0.1
  );
  const footIsOnBase =
    foot.x >= Math.min(A.x, B.x) &&
    foot.x <= Math.max(A.x, B.x);
  const markerDirection = B.x - foot.x >= markerSize ? 1 : -1;
  return (
    <g>
      <PaintDefs ids={ids} subtype={plane.figure.subtype} />
      <polygon
        points={polygonPoints([C, F, E, B])}
        fill={`url(#${ids.side})`}
      />
      <polygon
        points={polygonPoints([A, B, C])}
        fill={`url(#${ids.front})`}
      />
      {hiddenEdges.map(([start, end], index) => (
        <Edge
          key={`hidden-${index}`}
          start={start}
          end={end}
          strokeWidth={strokeWidth}
          dashed
        />
      ))}
      {visibleEdges.map(([start, end], index) => (
        <Edge
          key={`visible-${index}`}
          start={start}
          end={end}
          strokeWidth={strokeWidth}
        />
      ))}
      {altitude && (
        <>
          <Edge
            start={C}
            end={foot}
            strokeWidth={strokeWidth}
            dashed
          />
          {!footIsOnBase && (
            <Edge
              start={foot.x < A.x ? A : B}
              end={foot}
              strokeWidth={strokeWidth}
              dashed
            />
          )}
          <path
            d={[
              `M ${foot.x} ${foot.y - markerSize}`,
              `L ${foot.x + markerDirection * markerSize} ${foot.y - markerSize}`,
              `L ${foot.x + markerDirection * markerSize} ${foot.y}`,
            ].join(" ")}
            fill="none"
            stroke={STROKE}
            strokeWidth={strokeWidth * 0.65}
          />
        </>
      )}
      {plane.baseDetail && <PrismBaseDetail plane={plane} ids={ids} />}
      {/* Thin callout guides; these are not solid edges. */}
        {(plane.leaderLines || []).map((leader) => (
        <line
            key={leader.id}
            x1={leader.start.x}
            y1={leader.start.y}
            x2={leader.end.x}
            y2={leader.end.y}
            stroke="#64748b"
            strokeWidth={strokeWidth * 0.45}
            strokeLinecap="round"
        />
        ))}
      <DimensionLabels plane={plane} />
    </g>
  );
}
export function renderTriangularPrism(plane) {
  return plane?.prism
    ? <TriangularPrismSolid plane={plane} />
    : null;
}

function SquarePyramidSolid({ plane }) {
  const ids = usePaintIds();

  const {
    A,
    B,
    C,
    D,
    apex,
    centre,
    midpoint,
  } = plane.pyramid.vertices;

  const { strokeWidth, fontSize } = plane;

  const heightDimension = (plane.dimensionLines || []).find(
    (dimension) => dimension.role === "height"
  );

  const slantDimension = (plane.dimensionLines || []).find(
    (dimension) => dimension.role === "slant_height"
  );

  const markerSize = Math.min(
    fontSize * 0.6,
    Math.hypot(apex.x - midpoint.x, apex.y - midpoint.y) * 0.12,
    Math.hypot(B.x - A.x, B.y - A.y) * 0.12
  );

  // Slant height meets the midpoint of the front base edge
  // at a right angle in the triangular face.
  const slantLength = Math.hypot(
    apex.x - midpoint.x,
    apex.y - midpoint.y
  );

  const ux = (apex.x - midpoint.x) / slantLength;
  const uy = (apex.y - midpoint.y) / slantLength;

  const visibleEdges = [
    [A, B],
    [B, C],
    [apex, A],
    [apex, B],
    [apex, C],
  ];

  const hiddenEdges = [
    [A, D],
    [D, C],
    [apex, D],
  ];

  return (
    <g>
      <PaintDefs ids={ids} subtype={plane.figure.subtype} />

      <polygon
        points={polygonPoints([A, B, apex])}
        fill={`url(#${ids.front})`}
      />

      <polygon
        points={polygonPoints([B, C, apex])}
        fill={`url(#${ids.side})`}
      />

      {hiddenEdges.map(([start, end], index) => (
        <Edge
          key={`hidden-${index}`}
          start={start}
          end={end}
          strokeWidth={strokeWidth}
          dashed
        />
      ))}

      {visibleEdges.map(([start, end], index) => (
        <Edge
          key={`visible-${index}`}
          start={start}
          end={end}
          strokeWidth={strokeWidth}
        />
      ))}

      {heightDimension && (
        <>
          <Edge
            start={apex}
            end={centre}
            strokeWidth={strokeWidth}
            dashed
          />

          <circle
            cx={centre.x}
            cy={centre.y}
            r={strokeWidth}
            fill={STROKE}
          />
        </>
      )}

      {slantDimension && (
        <>
          <Edge
            start={apex}
            end={midpoint}
            strokeWidth={strokeWidth}
          />

          {/* Projected right-angle marker on the front face. */}
          <path
            d={[
              `M ${midpoint.x + ux * markerSize} ${midpoint.y + uy * markerSize}`,
              `L ${midpoint.x + ux * markerSize + markerSize} ${midpoint.y + uy * markerSize}`,
              `L ${midpoint.x + markerSize} ${midpoint.y}`,
            ].join(" ")}
            fill="none"
            stroke={STROKE}
            strokeWidth={strokeWidth * 0.65}
          />
        </>
      )}

      {(plane.leaderLines || []).map((leader) => (
        <line
          key={leader.id}
          x1={leader.start.x}
          y1={leader.start.y}
          x2={leader.end.x}
          y2={leader.end.y}
          stroke="#64748b"
          strokeWidth={strokeWidth * 0.45}
          strokeLinecap="round"
        />
      ))}

      <DimensionLabels plane={plane} />
    </g>
  );
}

export function renderSquarePyramid(plane) {
  return plane?.pyramid
    ? <SquarePyramidSolid plane={plane} />
    : null;
}