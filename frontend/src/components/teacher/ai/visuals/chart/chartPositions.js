import { getSvgDimensions } from "../geometry/geometryHelpers";

export function calculatePieChartPositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const centerX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;
  const SVG_AVAILABLE_WIDTH = SVG_WIDTH - paddingX * 2;
  const SVG_AVAILABLE_HEIGHT = SVG_HEIGHT -  paddingY * 2;
  const maxRadius = Math.min(SVG_AVAILABLE_WIDTH / 2, SVG_AVAILABLE_HEIGHT / 2)
  const radius = Math.max(maxRadius * 0.3, maxRadius);


  const total = elements.reduce((sum, el) => sum + (Number(el.value) || 0), 0);

  let currentAngle = -Math.PI / 2; // start at top (12 o'clock)
  const slices = elements.map((el) => {
    const fraction = total > 0 ? (Number(el.value) || 0) / total : 0;
    const sweepAngle = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sweepAngle;
    currentAngle = endAngle;

    const midAngle = (startAngle + endAngle) / 2;

    return {
      ...el,
      startAngle,
      endAngle,
      midAngle,
      percentage: fraction * 100,
    };
  });

  return { slices, centerX, centerY, radius, total };
}


export function renderPieChart(plane, isDonut = false, isMobile = false) {
  if (!plane) return null;

  const { strokeWidth, fontSize } = getSvgDimensions(isMobile);
  const { slices, centerX, centerY, radius } = plane;

  const COLORS = ["#378add", "#1D9E75", "#EF9F27", "#D4537E", "#7F77DD", "#D85A30", "#639922"];

  const innerRadius = isDonut ? radius * 0.65 : 0;

  const polarToXY = (angle, r) => ({
    x: centerX + Math.cos(angle) * r,
    y: centerY + Math.sin(angle) * r,
  });

  const arcPath = (slice) => {
    const outerStart = polarToXY(slice.startAngle, radius);
    const outerEnd = polarToXY(slice.endAngle, radius);
    const largeArc = slice.endAngle - slice.startAngle > Math.PI ? 1 : 0;

    if (isDonut) {
      const innerStart = polarToXY(slice.startAngle, innerRadius);
      const innerEnd = polarToXY(slice.endAngle, innerRadius);
      return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
        "Z",
      ].join(" ");
    }

    return [
      `M ${centerX} ${centerY}`,
      `L ${outerStart.x} ${outerStart.y}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      "Z",
    ].join(" ");
  };

  // Rough average character width for a bold sans-serif label at this
  // fontSize — good enough to decide "does this text fit" without
  // needing an actual canvas measureText call inside SVG render.
  const estimateTextWidth = (text, size) => text.length * size * 0.55;

  const insideLabelRadius = (radius + innerRadius) / 2;

  return (
    <g>
      {slices.map((slice, i) => {
        const sweep = slice.endAngle - slice.startAngle;
        const labelText = `${slice.label} (${Math.round(slice.percentage)}%)`;
        const textWidth = estimateTextWidth(labelText, fontSize * isMobile ? 0.95: 1.15);

        // Available straight-line width for a label centered at
        // insideLabelRadius, spanning this slice's angular sweep —
        // the actual constraint that matters, not the sweep angle in
        // isolation. A wide slice with long text can still fail this;
        // a narrow slice with short text can still pass it.
        const availableChordWidth = 2 * insideLabelRadius * Math.sin(sweep / 2);
        const isSmall = isDonut ? true :textWidth > availableChordWidth * 0.85; // small safety margin

        const labelRadius = isSmall ? radius * 1.25 : insideLabelRadius;
        const labelPos = polarToXY(slice.midAngle, labelRadius);

        return (
          <g key={slice.id || i}>
            <path d={arcPath(slice)} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={strokeWidth} />

            {isSmall && (
              <line
                x1={polarToXY(slice.midAngle, radius).x}
                y1={polarToXY(slice.midAngle, radius).y}
                x2={labelPos.x}
                y2={labelPos.y}
                stroke="currentColor"
                strokeWidth={strokeWidth * 0.8}
                className="text-slate-400"
              />
            )}

            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor={isSmall ? (Math.cos(slice.midAngle) > 0 ? "start" : "end") : "middle"}
              dominantBaseline="middle"
              fontSize={fontSize * (isMobile ? 0.95: 1.15)}
              className={isSmall ? "fill-slate-700 font-semibold" : "fill-white font-semibold"}
            >
              {labelText}
            </text>
          </g>
        );
      })}
    </g>
  );
}


// NEW: side legend/info panel showing each slice's raw value + unit
// alongside its percentage, so questions asked in the source units
// (hours, raw counts, etc.) can be answered directly from the figure
// without forcing that data into the pie's own arc labels.
export function renderPieChartLegend(slices, isMobile = false) {
  if (!Array.isArray(slices) || slices.length === 0) return null;

  const COLORS = ["#378add", "#1D9E75", "#EF9F27", "#D4537E", "#7F77DD", "#D85A30", "#639922"];

  const formatValue = (slice) => {
    if (slice.unit === "%") return `${slice.value}%`;
    if (slice.unit && slice.value !== undefined) return `${slice.value} ${slice.unit}`;
    return `${Math.round(slice.percentage)}%`;
  };

  return (
    <div className="flex flex-col gap-2 text-sm">
      {slices.map((slice, i) => (
        <div key={slice.id || i} className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 flex-shrink-0 rounded-sm"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
          />
          <span className="text-slate-700">
            <span className="font-semibold">{slice.label}</span>
            {": "}
            {formatValue(slice)}
          </span>
        </div>
      ))}
    </div>
  );
}