import { useLayoutEffect, useRef, useState } from "react";
import MathText from "../../../../common/MathText";

const FILLS = ["#dbeafe", "#ccfbf1", "#ede9fe", "#fef3c7"];

function CompositeLabel({ label, plane }) {
  const ref = useRef(null);
  const [size, setSize] = useState({
    width: plane.fontSize * 6,
    height: plane.fontSize * 2.5,
  });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    let active = true;

    const measure = () => {
      if (!active) return;

      const width = Math.ceil(
        Math.max(element.offsetWidth, element.scrollWidth) + 8
      );

      const height = Math.ceil(
        Math.max(element.offsetHeight, element.scrollHeight) + 8
      );

      if (width <= 8 || height <= 8) return;

      setSize((previous) =>
        previous.width === width && previous.height === height
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

  const width = Math.min(plane.width, size.width);
  const height = Math.min(plane.height, size.height);

  const x = Math.max(
    0,
    Math.min(plane.width - width, label.x - width / 2)
  );

  const y = Math.max(
    0,
    Math.min(plane.height - height, label.y - height / 2)
  );

  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <div
        className="text-slate-800"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          ref={ref}
          style={{
            display: "inline-flex",
            flexShrink: 0,
            width: "max-content",
            fontSize: plane.fontSize,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <MathText text={label.text} />
        </div>
      </div>
    </foreignObject>
  );
}

function Guide({ guide, strokeWidth }) {
  const tick = 3;
  const horizontal =
    Math.abs(guide.start.y - guide.end.y) < 0.001;

  return (
    <g
      fill="none"
      stroke="#64748b"
      strokeWidth={strokeWidth * 0.45}
    >
      {/* Measurement bar, disconnected from the figure */}
      <line
        x1={guide.start.x}
        y1={guide.start.y}
        x2={guide.end.x}
        y2={guide.end.y}
      />

      {/* Short end ticks */}
      {[guide.start, guide.end].map((point, index) => (
        <line
          key={index}
          x1={point.x - (horizontal ? 0 : tick)}
          y1={point.y - (horizontal ? tick : 0)}
          x2={point.x + (horizontal ? 0 : tick)}
          y2={point.y + (horizontal ? tick : 0)}
        />
      ))}
    </g>
  );
}

function JoinedRectangles({ plane }) {
  return (
    <g>
      {/* Subtle fills distinguish the component rectangles. */}
            {/* CHANGED: cutouts fill only the remaining region.
          A single path avoids seams between adjacent fill cells. */}
      {plane.figure?.subtype === "rectangular_cutouts" ? (
        <path
          d={(plane.fillRects || [])
            .map(
              (r) =>
                `M ${r.x} ${r.y} ` +
                `h ${r.width} v ${r.height} ` +
                `h ${-r.width} Z`
            )
            .join(" ")}
          fill={FILLS[0]}
          stroke="none"
        />
      ) : (
        plane.rectangles.map((rectangle, index) => (
          <rect
            key={rectangle.id}
            x={rectangle.x}
            y={rectangle.y}
            width={rectangle.width}
            height={rectangle.height}
            fill={FILLS[index % FILLS.length]}
          />
        ))
      )}
      {/* Strong outline follows only the composite boundary. */}
      {plane.boundary.map((edge, index) => (
        <line
          key={`boundary-${index}`}
          x1={edge.start.x}
          y1={edge.start.y}
          x2={edge.end.x}
          y2={edge.end.y}
          stroke="#1e293b"
          strokeWidth={plane.strokeWidth}
          strokeLinecap="round"
        />
      ))}

      {plane.dimensionGuides.map((guide) => (
        <Guide
          key={guide.id}
          guide={guide}
          strokeWidth={plane.strokeWidth}
        />
      ))}

      {/* Names identify the parts referenced by your edited questions. */}
      

      {plane.labels.map((label) => (
        <CompositeLabel
          key={label.id}
          label={label}
          plane={plane}
        />
      ))}
    </g>
  );
}

const LAWN_FILL = "#dcfce7";
const PATH_FILL = "#fde7bd";
const PATH_STROKE = "#927044";
const PARK_STROKE = "#1e293b";

function rectanglePath(rectangle) {
  return (
    `M ${rectangle.x} ${rectangle.y} ` +
    `h ${rectangle.width} ` +
    `v ${rectangle.height} ` +
    `h ${-rectangle.width} Z`
  );
}

function CrossingPathsShape({ plane }) {
  const { park, horizontal: h, vertical: v, strokeWidth } = plane;

  const parkRight = park.x + park.width;
  const parkBottom = park.y + park.height;
  const hBottom = h.y + h.height;
  const vRight = v.x + v.width;

  // One outline for the union of both paths.
  // No internal line crosses their intersection.
  const points = [
    [v.x, park.y],
    [vRight, park.y],
    [vRight, h.y],
    [parkRight, h.y],
    [parkRight, hBottom],
    [vRight, hBottom],
    [vRight, parkBottom],
    [v.x, parkBottom],
    [v.x, hBottom],
    [park.x, hBottom],
    [park.x, h.y],
    [v.x, h.y],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return (
    <g>
      <rect
        x={park.x}
        y={park.y}
        width={park.width}
        height={park.height}
        fill={LAWN_FILL}
      />

      <polygon
        points={points}
        fill={PATH_FILL}
        stroke={PATH_STROKE}
        strokeWidth={strokeWidth * 0.8}
        strokeLinejoin="round"
      />

      <rect
        x={park.x}
        y={park.y}
        width={park.width}
        height={park.height}
        fill="none"
        stroke={PARK_STROKE}
        strokeWidth={strokeWidth}
      />
    </g>
  );
}

function BoundaryPathShape({ plane }) {
  const { outer, inner, strokeWidth } = plane;

  return (
    <g>
      {/* Lawn or original garden occupies the inner rectangle. */}
      <rect
        x={inner.x}
        y={inner.y}
        width={inner.width}
        height={inner.height}
        fill={LAWN_FILL}
      />

      {/* Ring only: the inner region is excluded from the path. */}
      <path
        d={`${rectanglePath(outer)} ${rectanglePath(inner)}`}
        fill={PATH_FILL}
        fillRule="evenodd"
      />

      <rect
        x={outer.x}
        y={outer.y}
        width={outer.width}
        height={outer.height}
        fill="none"
        stroke={PARK_STROKE}
        strokeWidth={strokeWidth}
      />

      <rect
        x={inner.x}
        y={inner.y}
        width={inner.width}
        height={inner.height}
        fill="none"
        stroke={PATH_STROKE}
        strokeWidth={strokeWidth * 0.8}
      />
    </g>
  );
}

function CompositePaths({ plane }) {
  return (
    <g>
      {plane.pathConfig.kind === "crossing_paths" ? (
        <CrossingPathsShape plane={plane} />
      ) : (
        <BoundaryPathShape plane={plane} />
      )}

      {plane.dimensionGuides.map((guide) => (
        <Guide
          key={guide.id}
          guide={guide}
          strokeWidth={plane.strokeWidth}
        />
      ))}

      {plane.labels.map((label) => (
        <CompositeLabel
          key={label.id}
          label={label}
          plane={plane}
        />
      ))}
    </g>
  );
}

function CompositeRegion({ plane }) {
  const grid = plane.regionKind === "grid";

  return (
    <g>
      {grid ? (
        <>
          {plane.rectangles.map((cell) => (
            <rect
              key={cell.id}
              x={cell.x}
              y={cell.y}
              width={cell.width}
              height={cell.height}
              fill="#dbeafe"
            />
          ))}

          {plane.gridEdges.map((edge, index) => (
            <line
              key={`grid-edge-${index}`}
              x1={edge.start.x}
              y1={edge.start.y}
              x2={edge.end.x}
              y2={edge.end.y}
              stroke={edge.count === 1 ? "#1e293b" : "#94a3b8"}
              strokeWidth={
                edge.count === 1
                  ? plane.strokeWidth
                  : plane.strokeWidth * 0.55
              }
              strokeLinecap="round"
            />
          ))}
        </>
      ) : (
        <>
          {plane.parts.map((part, index) => (
            <rect
              key={part.id}
              x={part.x}
              y={part.y}
              width={part.width}
              height={part.height}
              fill={FILLS[index % FILLS.length]}
              stroke="#64748b"
              strokeWidth={plane.strokeWidth * 0.7}
            />
          ))}

          <rect
            x={plane.outer.x}
            y={plane.outer.y}
            width={plane.outer.width}
            height={plane.outer.height}
            fill="none"
            stroke="#1e293b"
            strokeWidth={plane.strokeWidth}
          />
        </>
      )}

      {plane.dimensionGuides.map((guide) => (
        <Guide
          key={guide.id}
          guide={guide}
          strokeWidth={plane.strokeWidth}
        />
      ))}

      {plane.labels.map((label) => (
        <CompositeLabel
          key={label.id}
          label={label}
          plane={plane}
        />
      ))}
    </g>
  );
}


function RectangleSemicircle({ plane }) {
  return (
    <g>
      {/* One continuous boundary; no internal attachment diameters. */}
      <path
        d={plane.outlinePath}
        fill="#dbeafe"
        stroke="#1e293b"
        strokeWidth={plane.strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Only drawn when a radius dimension is explicitly supplied. */}
      {plane.radiusLines.map((line) => (
        <g key={line.id}>
          <line
            x1={line.start.x}
            y1={line.start.y}
            x2={line.end.x}
            y2={line.end.y}
            stroke="#64748b"
            strokeWidth={plane.strokeWidth * 0.6}
          />
          <circle
            cx={line.start.x}
            cy={line.start.y}
            r={plane.strokeWidth}
            fill="#64748b"
          />
        </g>
      ))}

      {plane.dimensionGuides.map((guide) => (
        <Guide
          key={guide.id}
          guide={guide}
          strokeWidth={plane.strokeWidth}
        />
      ))}

      {plane.labels.map((label) => (
        <CompositeLabel
          key={label.id}
          label={label}
          plane={plane}
        />
      ))}
    </g>
  );
}

export function renderJoinedRectangles(plane) {
  if (!plane) return null;

  if (plane.semicircleConfig) {
    return <RectangleSemicircle plane={plane} />;
  }

  if (plane.regionKind) {
    return <CompositeRegion plane={plane} />;
  }

  if (plane.pathConfig) {
    return <CompositePaths plane={plane} />;
  }

  return <JoinedRectangles plane={plane} />;
}
