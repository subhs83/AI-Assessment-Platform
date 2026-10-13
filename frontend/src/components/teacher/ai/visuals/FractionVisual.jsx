import { useId } from "react";
import { getSvgDimensions } from "./geometry/geometryHelpers";
import { useIsMobile } from "../../../../hooks/useIsMobile";
const SHADED = "#2563eb";
const UNSHADED = "#ffffff";
const OUTLINE = "#1e293b";
function validateVisual(visual) {
  const figure = visual?.figure;
  const partition = visual?.partition;
  const shadedParts = visual?.shaded_parts;
  if (
    figure?.type !== "fraction_model" ||
    figure?.feature !== "shaded_parts" ||
    !partition ||
    !Array.isArray(shadedParts)
  ) {
    return null;
  }
  const subtype = figure.subtype;
  let totalParts;
  switch (subtype) {
    case "rectangle":
    case "square": {
      const { rows, columns } = partition;
      if (
        partition.pattern !== "grid" ||
        !Number.isInteger(rows) ||
        !Number.isInteger(columns) ||
        rows < 1 ||
        rows > 6 ||
        columns < 1 ||
        columns > 6
      ) {
        return null;
      }
      totalParts = rows * columns;
      if (totalParts < 2 || totalParts > 24) return null;
      break;
    }
    case "bar":
    case "circle":
    case "oval":
    case "triangle": {
      const patterns = {
        bar: "equal_strips",
        circle: "equal_sectors",
        oval: "equal_sectors",
        triangle: "equal_base_triangles",
      };
      if (
        partition.pattern !== patterns[subtype] ||
        !Number.isInteger(partition.parts) ||
        partition.parts < 2 ||
        partition.parts > 12
      ) {
        return null;
      }
      totalParts = partition.parts;
      break;
    }
    case "regular_polygon": {
      const sides = figure.sides;
      if (
        partition.pattern !== "center_triangles" ||
        !Number.isInteger(sides) ||
        sides < 5 ||
        sides > 8 ||
        partition.parts !== sides
      ) {
        return null;
      }
      totalParts = sides;
      break;
    }
    case "heart":
    case "star": {
      if (
        partition.pattern !== "mirror_halves" ||
        partition.parts !== 2 ||
        partition.axis !== "vertical" ||
        (subtype === "star" && figure.star_points !== 5)
      ) {
        return null;
      }
      totalParts = 2;
      break;
    }
    default:
      return null;
  }
  if (
    shadedParts.some(
      (index) =>
        !Number.isInteger(index) ||
        index < 0 ||
        index >= totalParts
    ) ||
    new Set(shadedParts).size !== shadedParts.length
  ) {
    return null;
  }
  return {
    subtype,
    partition,
    totalParts,
    shaded: new Set(shadedParts),
  };
}
function polygonPoints(vertices) {
  return vertices.map(({ x, y }) => `${x},${y}`).join(" ");
}
function regularVertices(count, cx, cy, radius) {
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}
function starVertices(cx, cy, outerRadius, innerRadius) {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}
export default function FractionVisual({ visual }) {
  // Unique clipping IDs when several figures appear on the same page.
  const reactId = useId();
  const clipId = `fraction-clip-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const isMobile = useIsMobile();
    const {
    width,
    height,
    paddingX,
    paddingY,
    strokeWidth,
    } = getSvgDimensions(isMobile);
  const model = validateVisual(visual);
  if (!model) {
    return (
      <div
        role="status"
        className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
      >
        This fraction figure could not be displayed. Please review
        its partition data.
      </div>
    );
  }
  const { subtype, partition, totalParts, shaded } = model;
  const cx = width / 2;
  const cy = height / 2;
  // Leave clearance for outlines inside the configured padding.
  const availableWidth = Math.max(0, width - paddingX * 2 - strokeWidth);
  const availableHeight = Math.max(0, height - paddingY * 2 - strokeWidth);
  const shapeWidth = availableWidth * 0.9;
  const shapeHeight = availableHeight * 0.9;
  const radius = Math.min(shapeWidth, shapeHeight) / 2;
  // Fit a chosen aspect ratio with a single scale, without distortion.
  const fitShape = (aspectRatio) => {
    const fittedHeight = Math.min(shapeHeight, shapeWidth / aspectRatio);
    return { width: fittedHeight * aspectRatio, height: fittedHeight };
  };
  const fillFor = (index) =>
    shaded.has(index) ? SHADED : UNSHADED;
  const boundaryProps = {
    stroke: OUTLINE,
    strokeWidth,
    strokeLinejoin: "round",
  };
  let drawing = null;
  // Rectangle / square: equal-area grid cells.
  if (subtype === "rectangle" || subtype === "square") {
    const { width, height } = fitShape(subtype === "square" ? 1 : 1.625);
    const left = cx - width / 2;
    const top = cy - height / 2;
    const cellWidth = width / partition.columns;
    const cellHeight = height / partition.rows;
    drawing = Array.from({ length: totalParts }, (_, index) => {
      const row = Math.floor(index / partition.columns);
      const column = index % partition.columns;
      return (
        <rect
          key={index}
          x={left + column * cellWidth}
          y={top + row * cellHeight}
          width={cellWidth}
          height={cellHeight}
          fill={fillFor(index)}
          {...boundaryProps}
        />
      );
    });
  }
  // Bar: equal-width strips with the same height.
  else if (subtype === "bar") {
    const { width, height } = fitShape(3.5);
    const partWidth = width / totalParts;
    drawing = Array.from({ length: totalParts }, (_, index) => (
      <rect
        key={index}
        x={cx - width / 2 + index * partWidth}
        y={cy - height / 2}
        width={partWidth}
        height={height}
        fill={fillFor(index)}
        {...boundaryProps}
      />
    ));
  }
  // Circle / oval: equal circle sectors, stretched uniformly
  // along each axis for the oval. The affine transform preserves
  // equality of the sector areas.
  else if (subtype === "circle" || subtype === "oval") {
    const ellipse = fitShape(subtype === "oval" ? 1.53 : 1);
    const rx = ellipse.width / 2;
    const ry = ellipse.height / 2;
    drawing = Array.from({ length: totalParts }, (_, index) => {
      const startAngle =
        -Math.PI / 2 + (index * 2 * Math.PI) / totalParts;
      const endAngle =
        -Math.PI / 2 + ((index + 1) * 2 * Math.PI) / totalParts;
      const startX = cx + rx * Math.cos(startAngle);
      const startY = cy + ry * Math.sin(startAngle);
      const endX = cx + rx * Math.cos(endAngle);
      const endY = cy + ry * Math.sin(endAngle);
      const path = [
        `M ${cx} ${cy}`,
        `L ${startX} ${startY}`,
        `A ${rx} ${ry} 0 0 1 ${endX} ${endY}`,
        "Z",
      ].join(" ");
      return (
        <path
          key={index}
          d={path}
          fill={fillFor(index)}
          {...boundaryProps}
        />
      );
    });
  }
  // Triangle: equal base intervals sharing one apex.
  // Equal base lengths and common height give equal areas.
  else if (subtype === "triangle") {
    const triangle = fitShape(1.53);
    const apex = { x: cx, y: cy - triangle.height / 2 };
    const baseLeft = cx - triangle.width / 2;
    const baseY = cy + triangle.height / 2;
    const baseWidth = triangle.width;
    const partWidth = baseWidth / totalParts;
    drawing = Array.from({ length: totalParts }, (_, index) => (
      <polygon
        key={index}
        points={polygonPoints([
          apex,
          { x: baseLeft + index * partWidth, y: baseY },
          { x: baseLeft + (index + 1) * partWidth, y: baseY },
        ])}
        fill={fillFor(index)}
        {...boundaryProps}
      />
    ));
  }
  // Regular polygon: equal triangles from the centre.
  else if (subtype === "regular_polygon") {
    const vertices = regularVertices(totalParts, cx, cy, radius);
    drawing = vertices.map((vertex, index) => (
      <polygon
        key={index}
        points={polygonPoints([
          { x: cx, y: cy },
          vertex,
          vertices[(index + 1) % totalParts],
        ])}
        fill={fillFor(index)}
        {...boundaryProps}
      />
    ));
  }
  // Heart / star: symmetric shapes clipped into mirrored halves.
  else if (subtype === "heart" || subtype === "star") {
    const heart = fitShape(1.15);
    const left = cx - heart.width / 2;
    const top = cy - heart.height / 2;
    // Symmetric normalized control points, mapped into dynamic bounds.
    const heartPoint = (x, y) =>
      `${left + x * heart.width} ${top + y * heart.height}`;
    const heartPath = [
      `M ${heartPoint(0.5, 0.25)}`,
      `C ${heartPoint(0.32, 0)} ${heartPoint(0, 0)} ${heartPoint(0, 0.38)}`,
      `C ${heartPoint(0, 0.65)} ${heartPoint(0.26, 0.85)} ${heartPoint(0.5, 1)}`,
      `C ${heartPoint(0.74, 0.85)} ${heartPoint(1, 0.65)} ${heartPoint(1, 0.38)}`,
      `C ${heartPoint(1, 0)} ${heartPoint(0.68, 0)} ${heartPoint(0.5, 0.25)}`,
      "Z",
    ].join(" ");
    const starPoints = polygonPoints(
      starVertices(cx, cy, radius, radius * (4 / 9))
    );
    const shape =
      subtype === "heart" ? (
        <path d={heartPath} />
      ) : (
        <polygon points={starPoints} />
      );
    drawing = (
      <>
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {shape}
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect
            x={0}
            y={0}
            width={cx}
            height={height}
            fill={fillFor(0)}
          />
          <rect
            x={cx}
            y={0}
            width={width - cx}
            height={height}
            fill={fillFor(1)}
          />
          <line
            x1={cx}
            y1={0}
            x2={cx}
            y2={height}
            {...boundaryProps}
          />
        </g>
        {subtype === "heart" ? (
          <path
            d={heartPath}
            fill="none"
            {...boundaryProps}
          />
        ) : (
          <polygon
            points={starPoints}
            fill="none"
            {...boundaryProps}
          />
        )}
      </>
    );
  }
  return (
    <div className="my-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto block h-auto w-full max-w-xl"
        role="img"
        aria-label="Partitioned shape with shaded and unshaded regions"
      >
        {drawing}
      </svg>
    </div>
  );
}