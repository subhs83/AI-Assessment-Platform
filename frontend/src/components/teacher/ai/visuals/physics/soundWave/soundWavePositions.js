
import { getSvgDimensions,} from "../../geometry/geometryHelpers";


export function calculateWavePositions({ amplitude, wavelength, numCycles = 2, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const availW = SVG_WIDTH - paddingX * 2;
  const availH = SVG_HEIGHT - paddingY * 2;

  // Scale wavelength to fill the available width across numCycles.
  const totalRealWidth = wavelength * numCycles;
  const pxPerUnit = availW / totalRealWidth;

  const pxWavelength = wavelength * pxPerUnit;
  const pxAmplitude = Math.min(amplitude * pxPerUnit, availH * 0.35); // cap so amplitude doesn't blow past canvas height

  const centerY = SVG_HEIGHT / 2;
  const startX = paddingX;

  // Generate a smooth path by sampling many points along the sine curve.
  const SAMPLES_PER_CYCLE = 40;
  const totalSamples = Math.round(numCycles * SAMPLES_PER_CYCLE);
  const points = [];
  for (let i = 0; i <= totalSamples; i++) {
    const t = i / SAMPLES_PER_CYCLE; // in units of wavelength
    const x = startX + t * pxWavelength;
    const y = centerY - Math.sin(t * 2 * Math.PI) * pxAmplitude;
    points.push({ x, y });
  }

  return {
    points,
    centerY,
    startX,
    pxWavelength,
    pxAmplitude,
    numCycles,
    SVG_WIDTH,
    SVG_HEIGHT,
  };
}

export function calculateStandingWavePositions({ wavelength, numCycles, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const DISPLAY_AMPLITUDE = 3;

  const centerY = SVG_HEIGHT / 2;
  const startX = paddingX + 15;
  const availableWidth = SVG_WIDTH - paddingX - startX - 15;

  const totalLengthMeters = numCycles * wavelength;
  const scaleX = availableWidth / Math.max(totalLengthMeters, 1);

  const availableHeight = (SVG_HEIGHT - 2 * paddingY) / 2;
  const scaleY = availableHeight / DISPLAY_AMPLITUDE;

  const toPixel = (xMeters, yMeters) => ({
    x: startX + xMeters * scaleX,
    y: centerY - yMeters * scaleY,
  });

  const SAMPLES_PER_CYCLE = 20;
  const totalSamples = Math.max(1, Math.round(SAMPLES_PER_CYCLE * numCycles));
  const envelopeTop = [];
  const envelopeBottom = [];
  for (let i = 0; i <= totalSamples; i++) {
    const xMeters = (i / totalSamples) * totalLengthMeters;
    const envelopeShape = Math.abs(Math.sin((2 * Math.PI * xMeters) / wavelength));
    envelopeTop.push(toPixel(xMeters, DISPLAY_AMPLITUDE * envelopeShape));
    envelopeBottom.push(toPixel(xMeters, -DISPLAY_AMPLITUDE * envelopeShape));
  }

  return {
    envelopeTop,
    envelopeBottom,
    centerY,
    startX,
    endX: startX + totalLengthMeters * scaleX,
    toPixel,
    displayAmplitude: DISPLAY_AMPLITUDE,
    totalLengthMeters,
  };
}

export function calculateLongitudinalWavePositions({ wavelength, numCycles, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX } = getSvgDimensions(isMobile);

  const centerY = SVG_HEIGHT / 2;
  const startX = paddingX + 15;
  const availableWidth = SVG_WIDTH - paddingX - startX - 15;
  const totalLengthMeters = numCycles * wavelength;
  const scaleX = availableWidth / Math.max(totalLengthMeters, 1);

  const DISPLACEMENT_AMPLITUDE_PX = isMobile ? 6 : 8; // how far particles shift, in pixels

  // Evenly-spaced "at rest" particle positions, then displaced
  // horizontally by d(x) = A*sin(2*pi*x/wavelength) — this IS the
  // actual physics: particles bunch together where the displacement
  // gradient pushes neighbors toward each other (compression), and
  // spread apart where it pushes them away (rarefaction).
  const PARTICLE_SPACING_METERS = wavelength / 16; // 16 particles per wavelength, dense enough to show clear bunching
  const particles = [];
  for (let xRest = 0; xRest <= totalLengthMeters + 1e-9; xRest += PARTICLE_SPACING_METERS) {
    const displacement = Math.sin((2 * Math.PI * xRest) / wavelength);
    const xDisplayMeters = xRest + (displacement * DISPLACEMENT_AMPLITUDE_PX) / scaleX;
    particles.push({
      x: startX + xDisplayMeters * scaleX,
      y: centerY,
    });
  }

  const toPixel = (xMeters) => ({
    x: startX + xMeters * scaleX,
    y: centerY,
  });

  return {
    particles,
    centerY,
    startX,
    endX: startX + totalLengthMeters * scaleX,
    toPixel,
    totalLengthMeters,
  };
}

export function calculateFixedStringHarmonicPositions({ stringLength, harmonicNumber, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const DISPLAY_AMPLITUDE = 3;
  //const wavelength = (2 * stringLength) / harmonicNumber; // L = n*(λ/2)

  const centerY = SVG_HEIGHT / 2;
  const startX = paddingX + 20;
  const availableWidth = SVG_WIDTH - paddingX - startX - 20;
  const scaleX = availableWidth / stringLength;

  const availableHeight = (SVG_HEIGHT - 2 * paddingY) / 2;
  const scaleY = availableHeight / DISPLAY_AMPLITUDE;

  const toPixel = (xMeters, yMeters) => ({
    x: startX + xMeters * scaleX,
    y: centerY - yMeters * scaleY,
  });

  const SAMPLES = Math.max(40, harmonicNumber * 20);
  const envelopeTop = [];
  const envelopeBottom = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const xMeters = (i / SAMPLES) * stringLength;
    const envelopeShape = Math.abs(Math.sin((Math.PI * harmonicNumber * xMeters) / stringLength));
    envelopeTop.push(toPixel(xMeters, DISPLAY_AMPLITUDE * envelopeShape));
    envelopeBottom.push(toPixel(xMeters, -DISPLAY_AMPLITUDE * envelopeShape));
  }

  // Nodes at x = k*(L/n), k=0..n (endpoints included). Antinodes at
  // the midpoints between consecutive nodes.
  const nodeXs = [];
  for (let k = 0; k <= harmonicNumber; k++) {
    nodeXs.push((k * stringLength) / harmonicNumber);
  }
  const antinodeXs = [];
  for (let k = 0; k < nodeXs.length - 1; k++) {
    antinodeXs.push((nodeXs[k] + nodeXs[k + 1]) / 2);
  }

  const fixedLeft = toPixel(0, 0);
  const fixedRight = toPixel(stringLength, 0);

  return {
    envelopeTop,
    envelopeBottom,
    nodePoints: nodeXs.map((x) => toPixel(x, 0)),
    antinodePoints: antinodeXs.map((x) => toPixel(x, DISPLAY_AMPLITUDE)),
    fixedLeft,
    fixedRight,
    centerY,
    startX,
    endX: startX + stringLength * scaleX,
    displayAmplitude: DISPLAY_AMPLITUDE,
  };
}


export function calculateWaveSuperpositionPositions({
  wave1Amplitude, wave1Wavelength, wave1Phase,
  wave2Amplitude, wave2Wavelength, wave2Phase,
  numCycles, isMobile = false,
}) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const centerY = SVG_HEIGHT / 2;
  const startX = paddingX + 15;
  const availableWidth = SVG_WIDTH - paddingX - startX - 15;

  // Use the longer of the two wavelengths to define the drawn span,
  // so both complete at least numCycles of the slower wave.
  const baseWavelength = Math.max(wave1Wavelength, wave2Wavelength);
  const totalLengthMeters = numCycles * baseWavelength;
  const scaleX = availableWidth / totalLengthMeters;

  const maxAmplitude = wave1Amplitude + wave2Amplitude; // worst-case resultant height
  const availableHeight = (SVG_HEIGHT - 2 * paddingY) / 2;
  const scaleY = availableHeight / Math.max(maxAmplitude, 1);

  const toPixel = (xMeters, yMeters) => ({
    x: startX + xMeters * scaleX,
    y: centerY - yMeters * scaleY,
  });

  const phaseRad1 = (wave1Phase * Math.PI) / 180;
  const phaseRad2 = (wave2Phase * Math.PI) / 180;

  const SAMPLES = Math.max(60, Math.round(30 * numCycles));
  const wave1Points = [];
  const wave2Points = [];
  const resultantPoints = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const xMeters = (i / SAMPLES) * totalLengthMeters;
    const y1 = wave1Amplitude * Math.sin((2 * Math.PI * xMeters) / wave1Wavelength + phaseRad1);
    const y2 = wave2Amplitude * Math.sin((2 * Math.PI * xMeters) / wave2Wavelength + phaseRad2);
    wave1Points.push(toPixel(xMeters, y1));
    wave2Points.push(toPixel(xMeters, y2));
    resultantPoints.push(toPixel(xMeters, y1 + y2)); // true superposition: sum at every point
  }

  return {
    wave1Points,
    wave2Points,
    resultantPoints,
    centerY,
    startX,
    endX: startX + totalLengthMeters * scaleX,
  };
}



export function calculateDopplerEffectPositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const sourceEl = elements.find((el) => el.id === "source");
  const wavefrontEls = elements.filter((el) => el.type === "circle");
  const observerEls = elements.filter((el) => el.id?.startsWith("observer"));

  // Determine the real-world bounding box of everything that needs to
  // be visible: every wavefront circle's full extent, the source, and
  // any observers.
  let minX = sourceEl?.x_position ?? 0;
  let maxX = minX;
  wavefrontEls.forEach((wf) => {
    minX = Math.min(minX, wf.emitted_at_x - wf.radius);
    maxX = Math.max(maxX, wf.emitted_at_x + wf.radius);
  });
  observerEls.forEach((obs) => {
    minX = Math.min(minX, obs.x_position);
    maxX = Math.max(maxX, obs.x_position);
  });

  let minY = -1, maxY = 1; // will be overwritten by circle extents below
  wavefrontEls.forEach((wf) => {
    minY = Math.min(minY, -wf.radius);
    maxY = Math.max(maxY, wf.radius);
  });

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const availableWidth = SVG_WIDTH - 2 * paddingX;
  const availableHeight = SVG_HEIGHT - 2 * paddingY;

  // ONE uniform scale for both axes — circles must stay circles, never
  // stretched into ellipses by independent x/y scaling.
  const scale = Math.min(availableWidth / rangeX, availableHeight / rangeY);

  const centerY = SVG_HEIGHT / 2;
  const originX = paddingX - minX * scale + (availableWidth - rangeX * scale) / 2;

  const toPixel = (xMeters, yMeters = 0) => ({
    x: originX + xMeters * scale,
    y: centerY + yMeters * scale,
  });

  const sourcePos = sourceEl ? toPixel(sourceEl.x_position) : null;
  const wavefronts = wavefrontEls.map((wf) => ({
    id: wf.id,
    center: toPixel(wf.emitted_at_x),
    radius: wf.radius * scale,
  }));
  const observers = observerEls.map((obs) => ({
    id: obs.id,
    label: obs.label,
    pos: toPixel(obs.x_position),
  }));

  return { sourcePos, sourceLabel: sourceEl?.label, wavefronts, observers, centerY };
}