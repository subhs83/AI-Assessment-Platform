import { getSvgDimensions } from "../geometry/geometryHelpers";

// in calculateInclinePositions's file
export const INCLINE_BOX_HEIGHT = 36;

export function calculateFreeBodyPositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const centerX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;

  const objectEl = elements.find((el) => el.type === "shape");
  const vectorEls = elements.filter((el) => el.type === "vector");

  const OBJECT_SIZE = 50;

  return {
    centerX,
    centerY,
    objectEl,
    vectorEls,
    objectSize: OBJECT_SIZE,
  };
}



export function calculateInclinePositions({ elements, inclineAngle = 30, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);
  const angleValue = Math.round(Math.tan((inclineAngle * Math.PI) / 180)*100)/100 >= 1 
  const widthMultiplyer = isMobile? 0.4 : 0.25
  const rampBaseWidth = angleValue ? SVG_WIDTH * widthMultiplyer : Math.min(SVG_WIDTH * 0.6, SVG_HEIGHT)
  const rampHeight =  rampBaseWidth * Math.tan((inclineAngle * Math.PI) / 180)
  const paddingOffset = isMobile ? 3 :1
  const baseX = paddingX * paddingOffset
  const baseY = SVG_HEIGHT - paddingY*paddingOffset;

  // Standard orientation: peak at top-left, base runs right, hypotenuse
  // slopes from the peak DOWN to the bottom-right corner.
  const rampPoints = {
    peak: { x: baseX, y: baseY - rampHeight },
    bottomLeft: { x: baseX, y: baseY },
    bottomRight: { x: baseX + rampBaseWidth, y: baseY },
  };

  // Object sits partway up the hypotenuse (peak -> bottomRight line).
  const t = 0.45; // fraction along the slope from the peak
  const onSlope = {
    x: rampPoints.peak.x + t * (rampPoints.bottomRight.x - rampPoints.peak.x),
    y: rampPoints.peak.y + t * (rampPoints.bottomRight.y - rampPoints.peak.y),
  };

  // Normal direction: perpendicular to the slope, pointing AWAY from
  // the ramp's interior (up and to the right of the slope line).
  // Slope direction vector (peak -> bottomRight) has angle
  // -inclineAngle from horizontal (sloping downward to the right).
  // The outward normal is that direction rotated +90°.
  const slopeAngleDeg = -inclineAngle; // downward-right slope
  const normalAngleDeg = slopeAngleDeg + 90; // = 90 - inclineAngle

  const OBJECT_OFFSET = INCLINE_BOX_HEIGHT / 2 + 4; // half box height + small clearance gap
  const normalRad = (normalAngleDeg * Math.PI) / 180;
  const objectCenter = {
    x: onSlope.x + Math.cos(normalRad) * OBJECT_OFFSET,
    y: onSlope.y - Math.sin(normalRad) * OBJECT_OFFSET,
  };

  return {
    rampPoints,
    objectCenter,
    inclineAngle,
    slopeAngleDeg,
    normalAngleDeg, // = 90 - inclineAngle, for reference/validation against JSON's own normal angle
  };
}


export function calculatePulleyPositions({ elements, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingY } = getSvgDimensions(isMobile);

  const pulleyX = SVG_WIDTH / 2;
  const pulleyY = paddingY + 15;
  const PULLEY_RADIUS = 18;

  const objects = elements.filter((el) => el.type === "shape");

  const BOX_HALF_HEIGHT = 18;
  const VECTOR_CLEARANCE = 35; // medium vector length + label offset, with a little margin

  // Total vertical room available below the pulley center, inside the canvas.
  const availableBelowPulley = SVG_HEIGHT - paddingY - pulleyY;
  // Reserve space for box + vector + label at the bottom; whatever's
  // left over is how far the box can hang below the pulley.
  const HANG_DISTANCE = Math.max(30, availableBelowPulley - BOX_HALF_HEIGHT - VECTOR_CLEARANCE);

  const estimateBoxWidth = (label) => Math.max(40, (label?.length || 0) * 7 + 16);
  const maxBoxWidth = Math.max(...objects.map((o) => estimateBoxWidth(o.label)), 30);
  const GAP_BETWEEN_BOXES = isMobile ? 20 : 30;
  const xOffsetMagnitude = maxBoxWidth / 2 + GAP_BETWEEN_BOXES / 2;

  const objectPositions = {};
  objects.forEach((obj) => {
    const xOffset = obj.side === "left" ? -xOffsetMagnitude : xOffsetMagnitude;
    objectPositions[obj.id] = {
      x: pulleyX + xOffset,
      y: pulleyY + HANG_DISTANCE,
    };
  });

  return { pulleyX, pulleyY, pulleyRadius: PULLEY_RADIUS, objectPositions };
}


export function calculateInclinePulleyPositions({ elements, inclineAngle = 30, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const rampBaseWidth = Math.min(SVG_WIDTH * 0.42, 200); // narrower ramp, leaving room for object_b on the right
  const rampHeight = Math.min(
    (SVG_HEIGHT - 2 * paddingY) * 0.7,
    rampBaseWidth * Math.tan((inclineAngle * Math.PI) / 180)
  );

  const HANGING_MASS_SPACE = 100
  const baseX = paddingX + HANGING_MASS_SPACE;
  const baseY = SVG_HEIGHT - paddingY*(isMobile ? 4 : 1.5);

  const rampPoints = {
    peak: { x: baseX, y: baseY - rampHeight },
    bottomLeft: { x: baseX, y: baseY },
    bottomRight: { x: baseX + rampBaseWidth, y: baseY },
  };

  const PULLEY_OFFSET_X = 20;
  const PULLEY_OFFSET_Y = 13;
  const PULLEY_RADIUS = 16;
  const pulleyX = rampPoints.peak.x + PULLEY_OFFSET_X;
  const pulleyY = rampPoints.peak.y - PULLEY_OFFSET_Y;

  // object_a: on the incline face, BELOW and to the right of the
  // pulley/peak, sitting ON the slope — same as before.
  const t = 0.5;
  const onSlope = {
    x: rampPoints.peak.x + t * (rampPoints.bottomRight.x - rampPoints.peak.x),
    y: rampPoints.peak.y + t * (rampPoints.bottomRight.y - rampPoints.peak.y),
  };
  const slopeAngleDeg = -inclineAngle;
  const normalAngleDeg = slopeAngleDeg + 90;
  const BOX_HALF_HEIGHT = 18;
  const OBJECT_OFFSET = BOX_HALF_HEIGHT + 4;
  const normalRad = (normalAngleDeg * Math.PI) / 180;
  const objectACenter = {
    x: onSlope.x + Math.cos(normalRad) * OBJECT_OFFSET,
    y: onSlope.y - Math.sin(normalRad) * OBJECT_OFFSET,
  };

  // object_b: hangs on the OPPOSITE (back) side of the pulley — i.e.
  // to the RIGHT of the pulley's x-position, independent of where
  // object_a sits, with a clear horizontal gap. This is the actual
  // fix: object_b's position no longer derives from object_a's edge
  // at all, it derives from the pulley, matching a real two-sided
  // pulley system where each rope segment goes to a different side.

  const objectBRopeX = rampPoints.peak.x - 55; // to the LEFT of the vertical edge
  const HANG_DISTANCE = Math.max(60, (SVG_HEIGHT - paddingY*(isMobile ? 4 : 1.5)) - pulleyY - BOX_HALF_HEIGHT - 10);

  const objectBCenter = {
    x: objectBRopeX,
    y: pulleyY + HANG_DISTANCE,
  };
  return {
    rampPoints,
    pulleyX,
    pulleyY,
    pulleyRadius: PULLEY_RADIUS,
    objectACenter,
    objectBCenter,
    inclineAngle,
    slopeAngleDeg,
  };
}
export function calculateProjectileMotionPositions({ figure, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const launchHeight = figure?.launch_height ?? 20;
  const launchVelocity = figure?.launch_velocity ?? 10;
  const G = 9.8;

  // Real kinematics: time to fall launchHeight, then horizontal range
  // in that same time. This is what makes the curve an ACTUAL
  // projectile path, not a generic decorative parabola.
  const timeOfFlight = Math.sqrt((2 * launchHeight) / G);
  const range = launchVelocity * timeOfFlight;

  // Reserve room for the launch platform (a small ledge/tower) on the
  // left, and the ground line across the bottom.
  const groundY = SVG_HEIGHT - paddingY;
  const launchX = paddingX + 15;
  const launchY = paddingY + 15;

  const availableWidth = SVG_WIDTH - paddingX - launchX;
  const availableHeight = groundY - launchY;

  // Scale real-world meters into pixels, independently for x and y,
  // so a tall-narrow or short-wide trajectory both fit the canvas.
  const scaleX = availableWidth / Math.max(range, 1);
  const scaleY = availableHeight / Math.max(launchHeight, 1);

  const toPixel = (xMeters, yMeters) => ({
    x: launchX + xMeters * scaleX,
    y: launchY + yMeters * scaleY, // yMeters is "distance fallen", grows downward — matches SVG y direction directly
  });

  // Sample the true kinematic path (x = v0*t, y = 1/2*g*t^2) at many
  // points, rather than approximating with a generic Bezier curve —
  // this guarantees the drawn curve is physically accurate.
  const SAMPLES = 24;
  const pathPoints = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = (i / SAMPLES) * timeOfFlight;
    const xMeters = launchVelocity * t;
    const yMeters = 0.5 * G * t * t;
    pathPoints.push(toPixel(xMeters, yMeters));
  }

  const launchPoint = toPixel(0, 0);
  const landingPoint = toPixel(range, launchHeight);

  return {
    launchPoint,
    landingPoint,
    pathPoints,
    groundY,
    launchX,
    launchHeight,
    launchVelocity,
    range,
    timeOfFlight,
  };
}


export function calculateAngledProjectilePositions({ figure, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const launchAngle = figure?.launch_angle ?? 45;
  const launchVelocity = figure?.launch_velocity ?? 20;
  const G = 9.8;

  const angleRad = (launchAngle * Math.PI) / 180;
  const v0x = launchVelocity * Math.cos(angleRad);
  const v0y = launchVelocity * Math.sin(angleRad);

  // Equal launch/landing height: symmetric parabola.
  const timeOfFlight = (2 * v0y) / G;
  const range = v0x * timeOfFlight;
  const maxHeight = (v0y * v0y) / (2 * G);
  const timeToPeak = timeOfFlight / 2;

  const groundY = SVG_HEIGHT - paddingY;
  const launchX = paddingX + 15;
  const launchY = groundY; // ground-level launch

  const availableWidth = SVG_WIDTH - paddingX - launchX;
  const availableHeight = groundY - (paddingY + 10);

  const scaleX = availableWidth / Math.max(range, 1);
  const scaleY = availableHeight / Math.max(maxHeight, 1);

  const toPixel = (xMeters, yMeters) => ({
    x: launchX + xMeters * scaleX,
    y: launchY - yMeters * scaleY, // yMeters is height ABOVE ground, so subtract to go up in SVG
  });

  const SAMPLES = 30;
  const pathPoints = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = (i / SAMPLES) * timeOfFlight;
    const xMeters = v0x * t;
    const yMeters = v0y * t - 0.5 * G * t * t;
    pathPoints.push(toPixel(xMeters, yMeters));
  }

  const launchPoint = toPixel(0, 0);
  const landingPoint = toPixel(range, 0);
  const peakPoint = toPixel(v0x * timeToPeak, maxHeight);

  return {
    launchPoint,
    landingPoint,
    peakPoint,
    pathPoints,
    groundY,
    launchX,
    launchAngle,
    launchVelocity,
    range,
    maxHeight,
    timeOfFlight,
  };
}

export function calculateAngledLaunchFromHeightPositions({ figure, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const launchAngle = figure?.launch_angle ?? 30;
  const launchVelocity = figure?.launch_velocity ?? 20;
  const launchHeight = figure?.launch_height ?? 20;
  const G = 9.8;

  const angleRad = (launchAngle * Math.PI) / 180;
  const v0x = launchVelocity * Math.cos(angleRad);
  const v0y = launchVelocity * Math.sin(angleRad);

  // Asymmetric case: solve the full quadratic for when height returns
  // to -launchHeight (ground level), not the simple symmetric formula.
  // 0 = launchHeight + v0y*t - 0.5*g*t^2  =>  0.5g*t^2 - v0y*t - launchHeight = 0
  const a = 0.5 * G;
  const b = -v0y;
  const c = -launchHeight;
  const discriminant = b * b - 4 * a * c;
  const timeOfFlight = (-b + Math.sqrt(Math.max(discriminant, 0))) / (2 * a);

  const range = v0x * timeOfFlight;

  // Peak only exists (above launch height) if v0y > 0. For a
  // below-horizontal launch (v0y <= 0), there's no rise at all —
  // the object only falls, so no peak should ever be computed/shown.
  const hasPeak = v0y > 0;
  const timeToPeak = hasPeak ? v0y / G : 0;
  const peakHeightAboveLaunch = hasPeak ? (v0y * v0y) / (2 * G) : 0;

  const groundY = SVG_HEIGHT - paddingY;
  const launchX = paddingX + 15;

  const maxHeightAboveGround = launchHeight + peakHeightAboveLaunch;

  const availableWidth = SVG_WIDTH - paddingX - launchX - 20;
  const availableHeight = groundY - (paddingY + 10);

  const scaleX = availableWidth / Math.max(range, 1);
  const scaleY = availableHeight / Math.max(maxHeightAboveGround, 1);

  const launchY = groundY - launchHeight * scaleY;

  const toPixel = (xMeters, yMetersAboveLaunch) => ({
    x: launchX + xMeters * scaleX,
    y: launchY - yMetersAboveLaunch * scaleY,
  });

  const SAMPLES = 30;
  const pathPoints = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = (i / SAMPLES) * timeOfFlight;
    const xMeters = v0x * t;
    const yMetersAboveLaunch = v0y * t - 0.5 * G * t * t;
    pathPoints.push(toPixel(xMeters, yMetersAboveLaunch));
  }

  const launchPoint = toPixel(0, 0);
  const landingPoint = toPixel(range, -launchHeight);
  const peakPoint = hasPeak ? toPixel(v0x * timeToPeak, peakHeightAboveLaunch) : null;

  return {
    launchPoint,
    landingPoint,
    peakPoint,
    pathPoints,
    groundY,
    launchX,
    launchAngle,
    launchVelocity,
    launchHeight,
    range,
    timeOfFlight,
  };
}




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