import { getSvgDimensions } from "../geometry/geometryHelpers";

export function calculatePieChartPositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const centerX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;
  const SVG_AVAILABLE_WIDTH = SVG_WIDTH - paddingX * 2;
  const SVG_AVAILABLE_HEIGHT = SVG_HEIGHT -  paddingY * 2;
  const maxRadius = Math.min(SVG_AVAILABLE_WIDTH / 2, SVG_AVAILABLE_HEIGHT / 2)
  const radius = maxRadius * (isMobile ? 0.65 : 0.85);
 


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

  const estimateTextWidth = (text, size) => text.length * size * 0.58;
  const insideLabelRadius = (radius + innerRadius) / 2;
  const outsideLabelRadius = radius * 1.25;
  const LINE_HEIGHT = fontSize * 1.4; // minimum vertical gap between two outside labels

  // --------------------------------------------------
  // PASS 1: decide inside vs. outside for every slice, and compute
  // each outside label's initial (un-collision-resolved) position.
  // --------------------------------------------------
  const labelData = slices.map((slice) => {
    const sweep = slice.endAngle - slice.startAngle;
    const labelText = `${slice.label} (${Math.round(slice.percentage)}%)`;
    const textWidth = estimateTextWidth(labelText, fontSize * 0.95);
    const availableChordWidth = 2 * insideLabelRadius * Math.sin(sweep / 2);
    const isSmall = (isDonut || isMobile) ? true : textWidth > availableChordWidth * 0.85;

    const anchorPoint = polarToXY(slice.midAngle, radius); // where the leader line starts, on the arc
    const idealOutsidePos = polarToXY(slice.midAngle, outsideLabelRadius);
    const insidePos = polarToXY(slice.midAngle, insideLabelRadius);

    return {
      slice,
      labelText,
      isSmall,
      anchorPoint,
      side: Math.cos(slice.midAngle) >= 0 ? "right" : "left",
      // y starts as the ideal position; PASS 2 below may adjust this
      x: isSmall ? idealOutsidePos.x : insidePos.x,
      y: isSmall ? idealOutsidePos.y : insidePos.y,
    };
  });

  // --------------------------------------------------
  // PASS 2: resolve vertical collisions between outside labels that
  // share the same side (left/right of center). Sort top-to-bottom,
  // then push any label down that's too close to the one above it.
  // Mirrors the classic pie/donut label-declutter technique.
  // --------------------------------------------------
  ["left", "right"].forEach((side) => {
    const group = labelData
      .filter((d) => d.isSmall && d.side === side)
      .sort((a, b) => a.y - b.y);

    for (let i = 1; i < group.length; i++) {
      const prev = group[i - 1];
      const curr = group[i];
      const minY = prev.y + LINE_HEIGHT;
      if (curr.y < minY) {
        curr.y = minY;
      }
    }

    // Re-center the whole group vertically around its own average, so
    // a cluster of small slices doesn't drift entirely toward the
    // bottom of the chart after repeated pushing.
    if (group.length > 1) {
      const originalCenter =
        group.reduce((sum, d) => sum + polarToXY(d.slice.midAngle, outsideLabelRadius).y, 0) / group.length;
      const newCenter = group.reduce((sum, d) => sum + d.y, 0) / group.length;
      const shift = originalCenter - newCenter;
      group.forEach((d) => { d.y += shift; });
    }
  });

  return (
    <g>
      {labelData.map((d, i) => {
        const { slice, labelText, isSmall, anchorPoint, x, y } = d;

        return (
          <g key={slice.id || i}>
            <path d={arcPath(slice)} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={strokeWidth} />

            {isSmall && (
              <line
                x1={anchorPoint.x}
                y1={anchorPoint.y}
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeWidth={strokeWidth * 0.8}
                className="text-slate-400"
              />
            )}

            <text
              x={x}
              y={y}
              textAnchor={isSmall ? (Math.cos(slice.midAngle) > 0 ? "start" : "end") : "middle"}
              dominantBaseline="middle"
              fontSize={fontSize * (isMobile ? 0.95 : 1.15)}
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
    <div className="pt-4 flex flex-col gap-2 text-sm">
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