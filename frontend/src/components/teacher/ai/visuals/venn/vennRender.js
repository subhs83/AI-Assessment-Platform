import { getSvgDimensions } from "../geometry/geometryHelpers";

export function renderVennDiagram(plane, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { circles, positionedRegions,  SVG_WIDTH, SVG_HEIGHT } = plane;

  const COLORS = ["#378add", "#D4537E", "#1D9E75"];

  // Fix: keep "outside all sets" region safely inside the rectangle.
  // (Already fixed via getRegionOffsets — reduce radius*1.7 to something
  // like radius*0.95, tuned to sit just below the circles but above
  // the rectangle's bottom edge — see updated offsets below.)

  return (
    <g>
      {positionedRegions.some((r) => (r.in || []).length === 0) && (
        <rect
          x={40} y={20} width={SVG_WIDTH - 80} height={SVG_HEIGHT - 40}
          fill="none" stroke="currentColor" strokeWidth={strokeWidth * 0.6}
          className="text-slate-400" vectorEffect="non-scaling-stroke"
        />
      )}

      {circles.map((c, i) => (
        <circle
          key={c.id}
          cx={c.cx} cy={c.cy} r={c.r}
          fill={COLORS[i % COLORS.length]}
          fillOpacity="0.25"
          stroke={COLORS[i % COLORS.length]}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Region value labels only — no in-diagram set-name text at all */}
      {positionedRegions.map((r, i) => (
        <text key={`region-${i}`} x={r.x} y={r.y} textAnchor="middle" dominantBaseline="middle"
          fontSize={fontSize} className="fill-slate-800 font-bold select-none">
          {r.value}
        </text>
      ))}
    </g>
  );
}



export function renderVennLegend(sets, isMobile = false) {
  const COLORS = ["#378add", "#D4537E", "#1D9E75"];
  return (
    <div className="flex flex-wrap gap-4 text-sm mb-2">
      {sets.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 flex-shrink-0 rounded-full border"
            style={{ backgroundColor: `${COLORS[i % COLORS.length]}40`, borderColor: COLORS[i % COLORS.length] }}
          />
          <span className="text-slate-700 font-medium">{s.label}</span>
        </div>
      ))}
    </div>
  );
}