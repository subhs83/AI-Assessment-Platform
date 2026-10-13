import MathText from "../../../common/MathText";
import { getSvgDimensions } from "./geometry/geometryHelpers";
import { useIsMobile } from "../../../../hooks/useIsMobile";

const DEG = Math.PI / 180;
const POSITIONS = ["upper_left", "upper_right", "lower_left", "lower_right"];

function validateVisual(visual) {
  const figure = visual?.figure;
  const lines = visual?.parallel_lines;
  const transversals = visual?.transversals;
  const marks = visual?.angle_marks;
  const orientation = figure?.orientation_deg ?? 0;
  const expectedCount = figure?.subtype === "single_transversal" ? 1
    : figure?.subtype === "double_transversal" ? 2 : 0;
  if (figure?.type !== "parallel_lines" || figure?.feature !== "find_angle" ||
      !expectedCount || !Number.isFinite(orientation) || orientation < 0 || orientation >= 180 ||
      !Array.isArray(lines) || lines.length < 2 || lines.length > 3 ||
      !Array.isArray(transversals) || transversals.length !== expectedCount ||
      !Array.isArray(marks) || marks.length < 2) return null;

  const items = [...lines, ...transversals, ...marks];
  if (items.some((item) => !item || typeof item.id !== "string" || !item.id.trim()) ||
      new Set(items.map((item) => item.id)).size !== items.length ||
      items.some((item) => typeof item.label !== "string")) return null;

  if (transversals.some((t) =>
      !["rising_right", "falling_right"].includes(t.direction) ||
      !Number.isFinite(t.inclination_deg) || t.inclination_deg < 30 || t.inclination_deg > 75)) return null;
  if (expectedCount === 2 && (transversals[0].direction !== transversals[1].direction ||
      Math.abs(transversals[0].inclination_deg - transversals[1].inclination_deg) > 1e-6)) return null;

  const lineIds = new Set(lines.map((line) => line.id));
  const transversalMap = new Map(transversals.map((t) => [t.id, t]));
  const seen = new Set();
  for (const mark of marks) {
    const t = transversalMap.get(mark.transversal_id);
    if (!lineIds.has(mark.parallel_line_id) || !t || !POSITIONS.includes(mark.position) ||
        typeof mark.is_unknown !== "boolean") return null;
    const key = `${mark.parallel_line_id}|${mark.transversal_id}|${mark.position}`;
    if (seen.has(key)) return null;
    seen.add(key);
    if (mark.is_unknown) {
      if (mark.value !== undefined || !mark.label.trim()) return null;
    } else {
      const acute = t.direction === "rising_right"
        ? ["upper_right", "lower_left"].includes(mark.position)
        : ["upper_left", "lower_right"].includes(mark.position);
      const expected = acute ? t.inclination_deg : 180 - t.inclination_deg;
      if (!Number.isFinite(mark.value) || Math.abs(mark.value - expected) > 1e-6) return null;
    }
  }
  if (marks.filter((mark) => mark.is_unknown).length !== 1) return null;
  return { lines, transversals, marks, orientation };
}

// Ray angles in SVG coordinates, in the reference frame BEFORE rotation.
function angleSector(direction, inclination, position) {
  const theta = inclination * DEG;
  const rising = direction === "rising_right";
  const sectors = rising ? {
    upper_right: [-theta, 0],
    upper_left: [-Math.PI, -theta],
    lower_left: [Math.PI - theta, Math.PI],
    lower_right: [0, Math.PI - theta],
  } : {
    upper_right: [theta - Math.PI, 0],
    upper_left: [-Math.PI, theta - Math.PI],
    lower_left: [theta, Math.PI],
    lower_right: [0, theta],
  };
  return sectors[position];
}

function makeLayout(model, dimensions) {
  const { width, height, paddingX, paddingY, fontSize } = dimensions;
  const { lines, transversals, orientation } = model;
  const rotation = -orientation * DEG; // Counterclockwise on screen.
  const rotate = ({ x, y }) => ({
    x: x * Math.cos(rotation) - y * Math.sin(rotation),
    y: x * Math.sin(rotation) + y * Math.cos(rotation),
  });
  // Relative construction units; mapped uniformly into the dynamic canvas.
  const lineGap = 60;
  const halfSpan = ((lines.length - 1) * lineGap) / 2;
  const extension = 32;
  const slope = (transversals[0].direction === "rising_right" ? -1 : 1) /
    Math.tan(transversals[0].inclination_deg * DEG);
  const offsets = transversals.length === 1 ? [0] : [-65, 65];
  const halfWidth = Math.abs(slope) * (halfSpan + extension) +
    Math.max(...offsets.map(Math.abs)) + 35;
  const rawLines = lines.map((line, i) => {
    const y = -halfSpan + i * lineGap;
    return { ...line, start: rotate({ x: -halfWidth, y }), end: rotate({ x: halfWidth, y }) };
  });
  const rawTransversals = transversals.map((t, i) => ({
    ...t,
    start: rotate({ x: offsets[i] + slope * (-halfSpan - extension), y: -halfSpan - extension }),
    end: rotate({ x: offsets[i] + slope * (halfSpan + extension), y: halfSpan + extension }),
  }));
  const all = [...rawLines, ...rawTransversals].flatMap((line) => [line.start, line.end]);
  const minX = Math.min(...all.map((p) => p.x));
  const maxX = Math.max(...all.map((p) => p.x));
  const minY = Math.min(...all.map((p) => p.y));
  const maxY = Math.max(...all.map((p) => p.y));
  // Reserve text space beyond the lines, rather than clipping upright labels.
  const marginX = Math.max(paddingX, fontSize * 2.7);
  const marginY = Math.max(paddingY, fontSize * 1.8);
  const scale = Math.min((width - 2 * marginX) / (maxX - minX),
    (height - 2 * marginY) / (maxY - minY));
  const project = (p) => ({
    x: width / 2 + (p.x - (minX + maxX) / 2) * scale,
    y: height / 2 + (p.y - (minY + maxY) / 2) * scale,
  });
  const intersections = new Map();
  lines.forEach((line, li) => transversals.forEach((t, ti) => {
    const y = -halfSpan + li * lineGap;
    intersections.set(`${line.id}|${t.id}`, project(rotate({ x: offsets[ti] + slope * y, y })));
  }));
  return {
    lines: rawLines.map((line) => ({ ...line, start: project(line.start), end: project(line.end) })),
    transversals: rawTransversals.map((line) => ({ ...line, start: project(line.start), end: project(line.end) })),
    intersections, scale, rotation,
  };
}

function MathLabel({ x, y, text, fontSize, width, height, color = "#1e293b" }) {
  const boxWidth = Math.max(fontSize * 3.2, Math.min(fontSize * 7, text.length * fontSize * 0.6));
  const boxHeight = fontSize * 2.2;
  const left = Math.max(0, Math.min(width - boxWidth, x - boxWidth / 2));
  const top = Math.max(0, Math.min(height - boxHeight, y - boxHeight / 2));
  return (
    <foreignObject x={left} y={top} width={boxWidth} height={boxHeight}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        width: "100%", height: "100%", fontSize, fontWeight: 800, color,
        whiteSpace: "nowrap", lineHeight: 1 }}>
        <MathText text={text} />
      </div>
    </foreignObject>
  );
}

export default function ParallelLinesVisual({ visual }) {
  const isMobile = useIsMobile();
  const dimensions = getSvgDimensions(isMobile);
  const { width, height, strokeWidth, fontSize } = dimensions;
  const model = validateVisual(visual);
  if (!model) {
    return <div role="status" className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      This angle figure could not be displayed. Please review its line and angle data.
    </div>;
  }
  const layout = makeLayout(model, dimensions);
  const transversalMap = new Map(model.transversals.map((t) => [t.id, t]));
  const arcs = [];
  const labels = [];

  [...layout.lines, ...layout.transversals].forEach((line) => {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;
    const length = Math.hypot(dx, dy);
    labels.push({ id: `label-${line.id}`, text: line.label,
      x: line.end.x + (dx / length) * fontSize * 1.3,
      y: line.end.y + (dy / length) * fontSize * 1.3 });
  });
  model.marks.forEach((mark) => {
    const t = transversalMap.get(mark.transversal_id);
    const vertex = layout.intersections.get(`${mark.parallel_line_id}|${mark.transversal_id}`);
    const [start, end] = angleSector(t.direction, t.inclination_deg, mark.position);
    const a = start + layout.rotation;
    const b = end + layout.rotation;
    const radius = Math.min(fontSize * 2, layout.scale * 24);
    const p1 = { x: vertex.x + radius * Math.cos(a), y: vertex.y + radius * Math.sin(a) };
    const p2 = { x: vertex.x + radius * Math.cos(b), y: vertex.y + radius * Math.sin(b) };
    arcs.push({ id: mark.id, path: `M ${p1.x} ${p1.y} A ${radius} ${radius} 0 0 1 ${p2.x} ${p2.y}` });
    const middle = (a + b) / 2;
    const distance = radius + fontSize * 1.65;
    labels.push({ id: `label-${mark.id}`,
      // Known values are authoritative; do not repeat an LLM-provided label.
      text: mark.is_unknown ? mark.label : `$${mark.value}^\\circ$`,
      x: vertex.x + distance * Math.cos(middle),
      y: vertex.y + distance * Math.sin(middle), color: "#9e180e" });
  });

  return (
    <div className="my-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet" className="mx-auto block h-auto w-full max-w-xl"
        role="img" aria-label="Parallel lines and transversals with given and unknown angles">
        {[...layout.lines, ...layout.transversals].map((line) => (
          <line key={line.id} x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y}
            stroke="#1e293b" strokeWidth={strokeWidth} strokeLinecap="round" />
        ))}
        {arcs.map((arc) => <path key={arc.id} d={arc.path} fill="none" stroke="#b45309" strokeWidth={strokeWidth} />)}
        {labels.map((label) => <MathLabel key={label.id} {...label} fontSize={fontSize*1.2} width={width} height={height} />)}
      </svg>
    </div>
  );
}
