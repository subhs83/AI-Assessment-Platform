import { getSvgDimensions } from "../geometry/geometryHelpers"; // reuse only the pure dimension utility

function niceTickIntervalForScale(scale, minPixelSpacing = 35) {
  const minRealSpacing = minPixelSpacing / scale;
  const magnitude = Math.pow(10, Math.floor(Math.log10(minRealSpacing)));
  const normalized = minRealSpacing / magnitude;
  let nice;
  if (normalized <= 1) nice = 1;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 5) nice = 5;
  else nice = 10;
  return nice * magnitude;
}

export function calculateNumberLinePositions({ elements, figure, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX } = getSvgDimensions(isMobile);

  const { min, max } = figure?.bounds || { min: -5, max: 5 };
  const availW = SVG_WIDTH - paddingX * 2;
  const scale = availW / (max - min);
  const tick = niceTickIntervalForScale(scale);

  const CENTER_Y = SVG_HEIGHT / 2;

  const toPixelX = (x) => paddingX + (x - min) * scale;

  const positions = {};
  (elements || []).forEach((el) => {
    if (el.type === "point" && Number.isFinite(el.x)) {
      positions[el.id] = { x: toPixelX(el.x), y: CENTER_Y, labelAnchor: "auto" };
    }
  });

  return { positions, toPixelX, centerY: CENTER_Y, min, max, tick, lineY: CENTER_Y };
}



export function calculateBarGraphPositions({ categories, figure, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const maxValue = Math.max(...categories.map((c) => c.value), 0);
  // Add ~15% headroom so the tallest bar doesn't touch the very top.
  const yMax = maxValue * 1.15;

  const chartLeft = paddingX + 30; // extra room for y-axis labels
  const chartRight = SVG_WIDTH - paddingX;
  const chartTop = paddingY + 10;
  const chartBottom = SVG_HEIGHT - paddingY - 20; // room for x-axis category labels

  const chartWidth = chartRight - chartLeft;
  const chartHeight = chartBottom - chartTop;

  const n = categories.length;
  const slotWidth = chartWidth / n;
  const barWidth = slotWidth * 0.6; // 60% bar, 40% gap between bars

  const tick = niceTickIntervalForScale(chartHeight / yMax, 30);

  const bars = categories.map((cat, i) => {
    const barHeight = (cat.value / yMax) * chartHeight;
    const x = chartLeft + i * slotWidth + (slotWidth - barWidth) / 2;
    const y = chartBottom - barHeight;
    return { ...cat, x, y, width: barWidth, height: barHeight };
  });

  return {
    bars,
    chartLeft,
    chartRight,
    chartTop,
    chartBottom,
    yMax,
    tick,
    title: figure?.title,
  };
}