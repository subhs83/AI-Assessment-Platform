import { getSvgDimensions,} from "../../geometry/geometryHelpers";
import {getShowImage} from "./rayOpticsHelpers"
export function calculateConvexLensPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);
  const showImage = getShowImage(relationships);
  const lensEl = elements.find((e) => e.type === "lens");
  const objectEl = elements.find((e) => e.type === "object_arrow");
  const focalEls = elements.filter((e) => e.type === "focal_point");

  const f = lensEl.focal_length;
  const uMag = objectEl.distance_from_lens;
  const ho = objectEl.height;

  const isAtF = Math.abs(uMag - f) < 1e-6; // epsilon, not exact ===, in case of float payloads

  const uSigned = -uMag;
  const v = isAtF ? null : 1 / (1 / f + 1 / uSigned);
  const m = isAtF ? null : v / uSigned;
  const isVirtual = isAtF ? false : v < 0;

  const caseLabel =
    isAtF ? "at_f" :
    uMag > 2 * f ? "beyond_2f" :
    uMag > f ? "between_f_2f" : "within_f";

  // No finite image to size the canvas around in this case — use a fixed
  // nominal extent (2f) on the emergent-ray side so the parallel rays have
  // visible room before hitting the canvas edge.
  const leftExtent = Math.max(uMag, isAtF ? 0 : (isVirtual ? Math.abs(v) : 0), 2 * f);
  const rightExtent = isAtF ? 2 * f : Math.max(isVirtual ? 0 : v, 2 * f);
  const scale = (SVG_WIDTH - 2 * paddingX) / (leftExtent + rightExtent);
  const lensX = paddingX + leftExtent * scale;
  const axisY = SVG_HEIGHT / 2;

  const imageHeightSigned = isAtF ? null : m * ho;
  const maxHeight = isAtF ? ho : Math.max(Math.abs(ho), Math.abs(imageHeightSigned));
  const availableHeight = SVG_HEIGHT / 2 - paddingY - 20;
  const heightScale = Math.min(availableHeight / maxHeight, scale * 3);

  const rayHeightPx = isAtF ? Math.abs(ho * heightScale) : Math.max(Math.abs(ho * heightScale), Math.abs(imageHeightSigned * heightScale));
  const lensHalf = Math.max(isMobile ? 45 : 60, rayHeightPx * 1.15);

  const positions = {
    lens: { x: lensX, topY: axisY - lensHalf, bottomY: axisY + lensHalf },
    object: { x: lensX + uSigned * scale, baseY: axisY, tipY: axisY - ho * heightScale, distanceLabel: String(uMag) },
    image: isAtF ? null : {
      x: lensX + v * scale,
      baseY: axisY,
      tipY: axisY - imageHeightSigned * heightScale,
      isVirtual,
      isInverted: m < 0,
    },
  };

  focalEls.forEach((el) => {
    const is2F = /2F/.test(el.id) || /2F/.test(el.label);
    const dist = is2F ? 2 * f : f;
    const sign = el.side === "left" ? -1 : 1;
    positions[el.id] = { x: lensX + sign * dist * scale, y: axisY, label: el.label };
  });

  return { lensX, axisY, scale, heightScale, f, uMag, v, m, caseLabel, isVirtual, isAtF, positions, showImage  };
}

export function calculateConcaveMirrorPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);
  const showImage = getShowImage(relationships);
  const mirrorEl = elements.find((e) => e.type === "mirror");
  const objectEl = elements.find((e) => e.type === "object_arrow");
  const focalPointEls = elements.filter((e) => e.type === "focal_point");
  const centerEl = focalPointEls.find((e) => /C/.test(e.id) || /C/.test(e.label));
  const focalEl = focalPointEls.find((e) => e.id !== centerEl?.id);

  const f = mirrorEl.focal_length;
  const uMag = objectEl.distance_from_mirror;
  const ho = objectEl.height;

  // Trust each element's own stated distance over deriving C = 2f.
  const fDist = focalEl?.distance_from_mirror ?? f;
  const cDist = centerEl?.distance_from_mirror ?? 2 * f;

  // NEW: cap C's DRAWN position so it never stretches the canvas far beyond
  // whatever the object/F actually need — true cDist is kept (cDist) for any
  // physics/labeling that needs the real value; cPlotDist is layout-only.
  const naturalFrontNeed = Math.max(uMag, fDist);
  const cPlotDist = Math.min(cDist, naturalFrontNeed * 1.5);

  const isAtF = Math.abs(uMag - f) < 1e-6;

  const v = isAtF ? null : 1 / (1 / f - 1 / uMag);
  const m = isAtF ? null : -v / uMag;
  const isVirtual = isAtF ? false : v < 0;

  const caseLabel =
    isAtF ? "at_f" :
    uMag > cDist ? "beyond_c" :
    uMag > fDist ? "between_f_c" : "within_f";

  if (isAtF) {
    const claimedRays = relationships.find((r) => r.type === "ray_construction")?.rays || [];
    if (claimedRays.includes("through_focal_point")) {
      console.warn(
        `[ray_diagram_mirror] object at u=f (${uMag}): "through_focal_point" ray is degenerate here ` +
        `and will be omitted from render. Check if this payload intended a different distance_from_mirror.`
      );
    }
  }

  const MIRROR_DEPTH = isMobile ? 15 : 20;
  const frontExtent = Math.max(uMag, isAtF ? 0 : (isVirtual ? 0 : v), cPlotDist);   // was cDist
  const behindExtent = isAtF ? fDist : (isVirtual ? Math.abs(v) : 0);
  const scale = (SVG_WIDTH - 2 * paddingX - MIRROR_DEPTH) / (frontExtent + behindExtent);
  const mirrorX = SVG_WIDTH - paddingX - MIRROR_DEPTH - behindExtent * scale;
  const axisY = SVG_HEIGHT / 2;

  const imageHeightSigned = isAtF ? null : m * ho;
  const maxHeight = isAtF ? ho : Math.max(Math.abs(ho), Math.abs(imageHeightSigned));
  const availableHeight = SVG_HEIGHT / 2 - paddingY - 20;
  const heightScale = Math.min(availableHeight / maxHeight, scale * 3);

  const rayHeightPx = isAtF ? Math.abs(ho * heightScale) : Math.max(Math.abs(ho * heightScale), Math.abs(imageHeightSigned * heightScale));
  const mirrorHalf = Math.max(isMobile ? 45 : 60, rayHeightPx * 1.15);

  const positions = {
    mirror: { x: mirrorX, topY: axisY - mirrorHalf, bottomY: axisY + mirrorHalf },
    object: { x: mirrorX - uMag * scale, baseY: axisY, tipY: axisY - ho * heightScale, distanceLabel: String(uMag) },
    F: focalEl ? { x: mirrorX - fDist * scale, y: axisY, label: focalEl.label } : null,
    C: centerEl ? { x: mirrorX - cPlotDist * scale, y: axisY, label: centerEl.label } : null,
    image: isAtF ? null : {
      x: isVirtual ? mirrorX + Math.abs(v) * scale : mirrorX - v * scale,
      baseY: axisY,
      tipY: axisY - imageHeightSigned * heightScale,
      isVirtual,
      isInverted: m < 0,
    },
  };

  return { mirrorX, axisY, scale, heightScale, f, fDist, cDist, cPlotDist, uMag, v, m, caseLabel, isVirtual, isAtF, positions, showImage };
}


export function calculateRefractionPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const mediaEls = elements.filter((e) => e.type === "medium");
  const rayEl = elements.find((e) => e.type === "ray" && e.role === "incident");
  const boundaryRel = relationships.find((r) => r.type === "boundary_shape");
  const isSlab = boundaryRel?.value === "slab";
  const thickness = boundaryRel?.thickness || 0;

  const sideOrder = { top: 0, middle: 1, bottom: 2 };
  const orderedMedia = [...mediaEls].sort((a, b) => (sideOrder[a.side] ?? 1) - (sideOrder[b.side] ?? 1));

  const axisX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;

  const SLAB_SCALE_PX = isMobile ? 6 : 8;
  const slabHeightPx = isSlab ? Math.min(thickness * SLAB_SCALE_PX, SVG_HEIGHT * 0.3) : 0;

  const interfaceYs = orderedMedia.length === 3
    ? [centerY - slabHeightPx / 2, centerY + slabHeightPx / 2]
    : [centerY];

  const snellRefractedAngle = (n1, n2, theta1Deg) => {
    const sinTheta2 = (n1 / n2) * Math.sin((theta1Deg * Math.PI) / 180);
    if (Math.abs(sinTheta2) > 1) return null; // TIR guard — not expected in this subtype
    return (Math.asin(sinTheta2) * 180) / Math.PI;
  };

  const RAY_RUN_PX = isMobile ? 90 : 130;
  const rad0 = (rayEl.angle * Math.PI) / 180;
  const firstY = interfaceYs[0];

  // incidentTo is the ONE anchor every later segment is built from — carried
  // forward explicitly (currentPoint), never independently recomputed.
  const incidentFrom = { x: axisX - Math.tan(rad0) * RAY_RUN_PX, y: firstY - RAY_RUN_PX };
  const incidentTo = { x: axisX, y: firstY };

  const segments = [{ from: incidentFrom, to: incidentTo, angleDeg: rayEl.angle }];
  let currentAngle = rayEl.angle;
  let currentPoint = incidentTo;

  interfaceYs.forEach((interfaceY, i) => {
    const nFrom = orderedMedia[i].index;
    const nTo = orderedMedia[i + 1].index;
    const refractedAngle = snellRefractedAngle(nFrom, nTo, currentAngle);
    if (refractedAngle == null) return;

    const targetY = i < interfaceYs.length - 1 ? interfaceYs[i + 1] : interfaceY + RAY_RUN_PX;
    const dy = targetY - interfaceY;
    const dx = Math.tan((refractedAngle * Math.PI) / 180) * dy;
    const nextPoint = { x: currentPoint.x + dx, y: targetY };

    segments.push({ from: currentPoint, to: nextPoint, angleDeg: refractedAngle });
    currentPoint = nextPoint;
    currentAngle = refractedAngle;
  });

  return { axisX, interfaceYs, orderedMedia, segments, isSlab, thickness, incidentAngle: rayEl.angle };
}



export function calculateTIRPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const mediaEls = elements.filter((e) => e.type === "medium");
  const rayEl = elements.find((e) => e.type === "ray" && e.role === "incident");
  const angleEl = elements.find((e) => e.type === "angle");
  const rel = relationships.find((r) => r.type === "reflects_or_refracts_at_boundary");

  // Trust rel.between order for physical roles (origin=denser, target=rarer),
  // never assume array position.
  const mediumFrom = mediaEls.find((m) => m.id === rel.between[0]);
  const mediumTo = mediaEls.find((m) => m.id === rel.between[1]);

  const sideOrder = { top: 0, bottom: 1 };
  const orderedMedia = [...mediaEls].sort((a, b) => (sideOrder[a.side] ?? 0) - (sideOrder[b.side] ?? 0));
  const interfaceY = SVG_HEIGHT / 2;
  const axisX = SVG_WIDTH / 2;

  const n1 = mediumFrom.index;
  const n2 = mediumTo.index;
  const criticalAngleDeg = (Math.asin(Math.min(n2 / n1, 1)) * 180) / Math.PI;
  const incidentAngle = rayEl.angle;

  const isAtCritical = Math.abs(incidentAngle - criticalAngleDeg) < 0.5; // epsilon covers payload rounding (41.8 vs true 41.81)
  const isAboveCritical = !isAtCritical && incidentAngle > criticalAngleDeg;

  const RAY_RUN_PX = isMobile ? 90 : 130;
  const rad = (incidentAngle * Math.PI) / 180;

  // Incident ray: rises from within the denser (origin) medium up to the interface.
  const incidentFrom = { x: axisX - Math.tan(rad) * RAY_RUN_PX, y: interfaceY + RAY_RUN_PX };
  const incidentTo = { x: axisX, y: interfaceY };

  // Reflected ray: mirrored across the normal, same angle, stays in the origin medium (goes back down).
  const reflectedTo = { x: axisX + Math.tan(rad) * RAY_RUN_PX, y: interfaceY + RAY_RUN_PX };

  let refractedTo = null;
  if (!isAboveCritical) {
    if (isAtCritical) {
      refractedTo = { x: axisX + RAY_RUN_PX, y: interfaceY }; // grazes along the boundary — tan(90°) undefined, handled explicitly
    } else {
      const sinRefracted = (n1 / n2) * Math.sin(rad);
      const refRad = Math.asin(Math.min(sinRefracted, 1));
      refractedTo = { x: axisX + Math.tan(refRad) * RAY_RUN_PX, y: interfaceY - RAY_RUN_PX };
    }
  }

  return {
    axisX, interfaceY, orderedMedia, incidentFrom, incidentTo, reflectedTo, refractedTo,
    isAtCritical, isAboveCritical, angleLabel: angleEl?.label
  };
}


export function calculateConcaveLensPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);
  const showImage = getShowImage(relationships);
  const lensEl = elements.find((e) => e.type === "lens");
  const objectEl = elements.find((e) => e.type === "object_arrow");
  const focalEls = elements.filter((e) => e.type === "focal_point");
  const rayEls = elements.filter((e) => e.type === "ray");

  const f = lensEl.focal_length;
  const uMag = objectEl.distance_from_lens;
  const ho = objectEl.height;

  // Diverging lens: f negative in the Cartesian convention we've used throughout.
  const fSigned = -f;
  const uSigned = -uMag;
  const v = 1 / (1 / fSigned + 1 / uSigned);
  const m = v / uSigned; // always positive & <1 for real u,f>0 — virtual/erect/diminished, no branching needed

  const rayConstructionRel = relationships.find((r) => r.type === "ray_construction");
  const rayIds = new Set(rayEls.map((e) => e.id));
  // Two payload shapes seen: a plain string list ("parallel_to_axis", "through_center")
  // means "derive the standard rays"; a list of actual ray element ids means
  // "render exactly these explicit (possibly WRONG) paths" — MCQ ray-identification style.
  const useExplicitRays = rayConstructionRel?.rays?.some((r) => rayIds.has(r));

  const distOf = (el) => el.distance ?? el.distance_from_lens ?? el.distance_from_mirror ?? f;
  const leftFocalDists = focalEls.filter((e) => e.side !== "right").map(distOf);
  const rightFocalDists = focalEls.filter((e) => e.side === "right").map(distOf);

  const leftExtent = Math.max(uMag, Math.abs(v), f, ...leftFocalDists);
  const rightExtent = Math.max(f, ...rightFocalDists);
  const scale = (SVG_WIDTH - 2 * paddingX) / (leftExtent + rightExtent);
  const lensX = paddingX + leftExtent * scale;
  const axisY = SVG_HEIGHT / 2;

  const imageHeightSigned = m * ho;
  const maxHeight = Math.max(Math.abs(ho), Math.abs(imageHeightSigned));
  const availableHeight = SVG_HEIGHT / 2 - paddingY - 20;
  const heightScale = Math.min(availableHeight / maxHeight, scale * 3);
  const lensHalf = Math.max(isMobile ? 45 : 60, Math.abs(ho * heightScale) * 1.15);

  const positions = {
    lens: { x: lensX, topY: axisY - lensHalf, bottomY: axisY + lensHalf },
    object: { x: lensX + uSigned * scale, baseY: axisY, tipY: axisY - ho * heightScale, distanceLabel: String(uMag) },
    image: { x: lensX + v * scale, baseY: axisY, tipY: axisY - imageHeightSigned * heightScale, isVirtual: true },
  };

  focalEls.forEach((el) => {
    const sign = el.side === "left" ? -1 : 1;
    positions[el.id] = { x: lensX + sign * distOf(el) * scale, y: axisY, label: el.label };
  });

  // Fallback near/far focal lookups for the standard (non-explicit) ray derivation,
  // in case the payload omits F1/F2 by those exact ids.
  const nearFocal = focalEls.find((e) => e.side !== "right" && Math.abs(distOf(e) - f) < 1e-6);
  //const farFocal = focalEls.find((e) => e.side === "right" && Math.abs(distOf(e) - f) < 1e-6);
  const nearFocalPoint = nearFocal ? positions[nearFocal.id] : { x: lensX - f * scale, y: axisY };

  return { lensX, axisY, scale, heightScale, f, uMag, v, m, positions, rayEls, useExplicitRays, nearFocalPoint, extend: isMobile ? 35 : 55, showImage };
}