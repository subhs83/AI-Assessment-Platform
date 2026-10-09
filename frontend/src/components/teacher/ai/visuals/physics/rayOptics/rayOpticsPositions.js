import { getSvgDimensions,} from "../../geometry/geometryHelpers";
import {getShowImage, pointAtDeg, intersectLines, buildPrismGeometry, getDistanceLabel} from "./rayOpticsHelpers"

export function calculateConvexLensPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);
  const showImage = getShowImage(relationships);
  // calculateConvexLensPositions: after showImage
  const listedRays = relationships.find((r) => r.type === "ray_construction")?.rays;
  const drawFocalRay = !Array.isArray(listedRays) || listedRays.some((r) => typeof r !== "string" || /focal/.test(r));
  // add drawFocalRay to the returned object
  const lensEl = elements.find((e) => e.type === "lens");
  const objectEl = elements.find((e) => e.type === "object_arrow");
  // calculateConvexLensPositions — fix the focalEls filter:
  const focalEls = elements.filter((e) => e.type === "focal_point" && e.show !== false);

  const f = lensEl.focal_length;
  const uMag = objectEl.distance_from_lens;
  const ho = objectEl.height;

  const isAtF = Math.abs(uMag - f) < 1e-6; // epsilon, not exact ===, in case of float payloads

  const MAX_VIRTUAL_RATIO = 2.5; // drawn virtual image is never farther than 2.5f
  const uPlot =
    !isAtF && uMag < f && (f * uMag) / (f - uMag) > MAX_VIRTUAL_RATIO * f
      ? (MAX_VIRTUAL_RATIO * f) / (1 + MAX_VIRTUAL_RATIO)   // ≈ 0.71f
      : uMag;

  const uSigned = -uPlot;   // was -uMag
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
  const leftExtent = Math.max(uPlot, isAtF ? 0 : (isVirtual ? Math.abs(v) : 0), 2 * f);
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
    object: { x: lensX + uSigned * scale, baseY: axisY, tipY: axisY - ho * heightScale, distanceLabel: getDistanceLabel(objectEl, uMag) },
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

  return { lensX, axisY, scale, heightScale, f, uMag, v, m, caseLabel, isVirtual, isAtF, positions, showImage, drawFocalRay };
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
    object: { x: mirrorX - uMag * scale, baseY: axisY, tipY: axisY - ho * heightScale, distanceLabel: getDistanceLabel(objectEl, uMag) },
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
    object: { x: lensX + uSigned * scale, baseY: axisY, tipY: axisY - ho * heightScale, distanceLabel: getDistanceLabel(objectEl, uMag) },
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


export function calculateConvexMirrorPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);

  const mirrorEl = elements.find((e) => e.type === "mirror");
  const objectEl = elements.find((e) => e.type === "object_arrow");
  const focalEl = elements.find((e) => e.type === "focal_point");
  const centerEl = elements.find((e) => e.type === "center_of_curvature");

  const f = mirrorEl.focal_length;
  const uMag = objectEl.distance_from_mirror;
  const ho = objectEl.height;

  const fDist = f;
  const cDist = 2 * f;
  const fSigned = -f;
  const v = 1 / (1 / fSigned - 1 / uMag);
  const m = -v / uMag;

  const showImage = getShowImage(relationships);
  const rayConstructionRel = relationships.find((r) => r.type === "ray_construction");
  const useExplicitRays = Array.isArray(rayConstructionRel?.rays) && typeof rayConstructionRel.rays[0] === "object";

  const naturalBehindNeed = Math.max(Math.abs(v), fDist);
  const cPlotDist = Math.min(cDist, naturalBehindNeed * 1.5);

  const MIRROR_DEPTH = isMobile ? 15 : 20;
  const frontExtent = Math.max(uMag, MIRROR_DEPTH);
  const behindExtent = Math.max(Math.abs(v), cPlotDist);
  const scale = (SVG_WIDTH - 2 * paddingX - MIRROR_DEPTH) / (frontExtent + behindExtent);
  const mirrorX = paddingX + frontExtent * scale;
  const axisY = SVG_HEIGHT / 2;

  const imageHeightSigned = m * ho;
  const maxHeight = Math.max(Math.abs(ho), Math.abs(imageHeightSigned));
  const availableHeight = SVG_HEIGHT / 2 - paddingY - 20;
  const heightScale = Math.min(availableHeight / maxHeight, scale * 3);
  const rayHeightPx = Math.max(Math.abs(ho * heightScale), Math.abs(imageHeightSigned * heightScale));
  const mirrorHalf = Math.max(isMobile ? 45 : 60, rayHeightPx * 1.15);

  const positions = {
    mirror: { x: mirrorX, topY: axisY - mirrorHalf, bottomY: axisY + mirrorHalf },
    object: { x: mirrorX - uMag * scale, baseY: axisY, tipY: axisY - ho * heightScale, distanceLabel: getDistanceLabel(objectEl, uMag) },
    image: { x: mirrorX + Math.abs(v) * scale, baseY: axisY, tipY: axisY - imageHeightSigned * heightScale, isVirtual: true },
    F_right: focalEl ? { x: mirrorX + fDist * scale, y: axisY, label: focalEl.label } : null,
    C_right: centerEl ? { x: mirrorX + cPlotDist * scale, y: axisY, label: centerEl.label } : null,
  };

  // Synthetic point — never in the real payload — used only to plot the
  // "reflects_through_focal_point_front" WRONG distractor ray accurately.
  const frontFPoint = { x: mirrorX - fDist * scale, y: axisY };

  return { mirrorX, axisY, positions, showImage, useExplicitRays, rayConstructionRays: rayConstructionRel?.rays, frontFPoint, extend: isMobile ? 35 : 55 };
}

export function calculateLawOfReflectionPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const mirrorEl = elements.find((e) => e.type === "mirror");
  const incidentEl = elements.find((e) => e.type === "ray" && e.role === "incident");
  const reflectedEl = elements.find((e) => e.type === "ray" && e.role === "reflected");
  const angleIEl = elements.find((e) => e.type === "angle" && e.start_element === incidentEl?.id);
  const angleREl = elements.find((e) => e.type === "angle" && e.start_element === reflectedEl?.id);

  const axisX = SVG_WIDTH / 2;
  const mirrorY = SVG_HEIGHT / 2;
  const vertex = { x: axisX, y: mirrorY };

  const rawValue = Number(angleIEl?.value);
  const measuredFromSurface = angleIEl?.end_element === mirrorEl?.id;
  const incidentAngleDeg = Number.isFinite(rawValue) ? (measuredFromSurface ? 90 - rawValue : rawValue) : (incidentEl?.angle ?? 45);

  // Trust angle_i.value over the ray's own "angle" field — confirmed to disagree in real data.
  if (Number.isFinite(rawValue) && incidentEl?.angle != null && Math.abs(incidentAngleDeg - incidentEl.angle) > 0.5) {
    console.warn(`[reflection] incident_ray.angle (${incidentEl.angle}) disagrees with the stated angle (${incidentAngleDeg}). Rendering from the stated value.`);
  }

  const rawReflected = Number(angleREl?.value);
  const reflectedAngleDeg = Number.isFinite(rawReflected) ? rawReflected : incidentAngleDeg; // law of reflection by default; explicit value wins for wrong-ray distractors

  const RAY_RUN_PX = isMobile ? 90 : 130;
  const rad = (incidentAngleDeg * Math.PI) / 180;
  const incidentFrom = { x: axisX - Math.tan(rad) * RAY_RUN_PX, y: mirrorY - RAY_RUN_PX };
  const radR = (reflectedAngleDeg * Math.PI) / 180;
  const reflectedTo = { x: axisX + Math.tan(radR) * RAY_RUN_PX, y: mirrorY - RAY_RUN_PX };

  return {
    axisX, mirrorY, vertex, incidentFrom, reflectedTo,
    incidentAngleLabel: angleIEl?.label, reflectedAngleLabel: angleREl?.label,
    showReflectedRay: relationships.find((r) => r.type === "reflects_at_boundary")?.show_reflected_ray !== false,
    measuredFromSurface,
  };
}

export function calculatePlaneMirrorPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY } = getSvgDimensions(isMobile);
  const objectEl = elements.find((e) => e.type === "object_arrow");
  const uMag = objectEl.distance_from_mirror;
  const ho = objectEl.height;
  const showImage = getShowImage(relationships);

  const mirrorX = SVG_WIDTH / 2;
  const scale = Math.min((SVG_WIDTH / 2 - paddingX) / uMag, 12);
  const axisY = SVG_HEIGHT / 2;
  const heightScale = Math.min((SVG_HEIGHT / 2 - paddingY - 20) / ho, scale * 1.5);

  return {
    mirrorX, axisY, showImage,
    positions: {
      object: { x: mirrorX - uMag * scale, baseY: axisY, tipY: axisY - ho * heightScale, distanceLabel: getDistanceLabel(objectEl, uMag) },
      image: { x: mirrorX + uMag * scale, baseY: axisY, tipY: axisY - ho * heightScale }, // image distance = object distance, always
    },
  };
}

export function calculatePrismDeviationPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const prismEl = elements.find((e) => e.type === "prism");
  const incidentEl = elements.find((e) => e.type === "ray" && e.role === "incident");
  const angleAEl = elements.find((e) => e.type === "angle" && e.at === "apex");
  const angleI1El = elements.find((e) => e.type === "angle" && e.at === "incident_surface");
  const angleDeltaEl = elements.find((e) => e.type === "angle" && e.at === "deviation");
  const angleR1El = elements.find((e) => e.type === "angle" && e.between_ray_and_normal === "incident");
  const angleR2El = elements.find((e) => e.type === "angle" && e.between_ray_and_normal === "emergent");
  const angleEEl = elements.find((e) => e.type === "angle" && e.at === "emergent_surface");


  const rel = relationships.find((r) => r.type === "refracts_through");
  const isMinDeviation = rel?.condition === "minimum_deviation";
  const n = prismEl.index ?? 1.5;
  const A = prismEl.apex_angle ?? Number(angleAEl?.value) ?? 60;

  const rawI1 = Number(angleI1El?.value);
  const i1 = Number.isFinite(rawI1) ? rawI1 : incidentEl.angle;
  if (Number.isFinite(rawI1) && incidentEl.angle != null && Math.abs(i1 - incidentEl.angle) > 0.5) {
    console.warn(`[prism] incident_ray.angle (${incidentEl.angle}) disagrees with stated i1 (${i1}). Rendering from the stated value.`);
  }

  let r1, r2, e;
  if (isMinDeviation) {
    r1 = r2 = A / 2;
    e = i1;
  } else {
    const sinR1 = Math.sin((i1 * Math.PI) / 180) / n;
    r1 = (Math.asin(Math.min(Math.max(sinR1, -1), 1)) * 180) / Math.PI;
    r2 = A - r1;
    const sinE = n * Math.sin((r2 * Math.PI) / 180);
    e = Math.abs(sinE) > 1 ? null : (Math.asin(sinE) * 180) / Math.PI; // null = TIR inside — unexpected for standard prism questions, guarded anyway
  }

  const FACE_LENGTH = isMobile ? 160 : 180; // was 140 / 190
  const apexPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT * 0.1 }; 
  const geo = buildPrismGeometry(A, apexPoint, FACE_LENGTH);
  const P1 = { x: geo.apexPoint.x + geo.dirLeft.x * FACE_LENGTH * 0.55, y: geo.apexPoint.y + geo.dirLeft.y * FACE_LENGTH * 0.55 };

  const RUN = isMobile ? 90 : 130;
  // ASSUMPTION, unverified: +i1 tilts the incident ray to visually arrive from
  // the upper-left, matching every other subtype's convention.
  const travelInDeg = geo.normalLeftDeg + 180 + i1;
  const incidentFrom = pointAtDeg(P1, travelInDeg + 180, RUN);

  const travelRefractedDeg = geo.normalLeftDeg + 180 + r1;
  const refractedDir = pointAtDeg({ x: 0, y: 0 }, travelRefractedDeg, 1);
  const P2 = intersectLines(P1, { x: P1.x + refractedDir.x, y: P1.y + refractedDir.y }, geo.apexPoint, geo.rightBottom) || geo.rightBottom;

  // ASSUMPTION, unverified: the emergent ray mirrors the incident ray's sign
  // convention across the prism's axis of symmetry — minus instead of plus.
  let emergentTo = null;
  if (e != null) {
    const travelOutDeg = geo.normalRightDeg - e;
    emergentTo = pointAtDeg(P2, travelOutDeg, RUN);
  }

  // Deviation construction (dashed "what if it hadn't bent" line) is drawn only
  // when the payload actually wants it LABELED — Q1 has no angle_delta element,
  // so no such line is drawn there, keeping its numeric answer un-measurable.
  const undeviatedTo = angleDeltaEl ? pointAtDeg(P2, travelInDeg, RUN) : null;

  return {
    geo, P1, P2, incidentFrom, emergentTo, undeviatedTo,
    i1Label: angleI1El?.label, ALabel: angleAEl?.label, deltaLabel: angleDeltaEl?.label,
    showEmergentRay: rel?.show_emergent_ray !== false,
    r1Label: angleR1El?.label, r2Label: angleR2El?.label, eLabel: angleEEl?.label,
  };
}

export function calculatePrismDispersionPositions({ elements, relationships, isMobile = false }) {
  const { width: SVG_WIDTH, height: SVG_HEIGHT } = getSvgDimensions(isMobile);
  const prismEl = elements.find((e) => e.type === "prism");
  const incidentEl = elements.find((e) => e.type === "ray" && e.role === "incident");
  const rel = relationships.find((r) => r.type === "disperses");

  const A = prismEl.apex_angle ?? 60;
  const i1 = incidentEl.angle ?? 45;
  // calculatePrismDispersionPositions — reduce these two values:
  const FACE_LENGTH = isMobile ? 160 : 180; // was 140/190
  const apexPoint = { x: SVG_WIDTH * 0.4, y: SVG_HEIGHT * 0.1 }; // was 0.22 — push the whole prism up, more clearance below
  const geo = buildPrismGeometry(A, apexPoint, FACE_LENGTH);
  const P1 = { x: geo.apexPoint.x + geo.dirLeft.x * FACE_LENGTH * 0.55, y: geo.apexPoint.y + geo.dirLeft.y * FACE_LENGTH * 0.55 };

  const RUN = isMobile ? 90 : 130;
  const travelInDeg = geo.normalLeftDeg + 180 + i1;
  const incidentFrom = pointAtDeg(P1, travelInDeg + 180, RUN);

  // calculatePrismDispersionPositions — replace the bands construction:
  const COLORS = ["#E53935", "#FB8C00", "#FDD835", "#43A047", "#1E88E5", "#3949AB", "#8E24AA"];
  const n0 = 1.5;
  const SPREAD_DEG = isMobile ? 10 : 12; // schematic exaggeration — the real spread is too small to see

  const bands = COLORS.map((color, idx) => {
    const n = n0 + idx * 0.004;
    const r1c = (Math.asin(Math.sin((i1 * Math.PI) / 180) / n) * 180) / Math.PI;
    const r2c = A - r1c;
    const sinE = n * Math.sin((r2c * Math.PI) / 180);
    const baseEc = Math.abs(sinE) > 1 ? 90 : (Math.asin(sinE) * 180) / Math.PI;

    const mid = (COLORS.length - 1) / 2;
    const ec = baseEc + (idx - mid) * (SPREAD_DEG / (COLORS.length - 1)); // evenly fan out around the true center angle

    const refractedDir = pointAtDeg({ x: 0, y: 0 }, geo.normalLeftDeg + 180 + r1c, 1);
    const P2 = intersectLines(P1, { x: P1.x + refractedDir.x, y: P1.y + refractedDir.y }, geo.apexPoint, geo.rightBottom) || geo.rightBottom;
    const emergentTo = pointAtDeg(P2, geo.normalRightDeg - ec, RUN * 1.15); // slightly longer run too, more room for the fan to read

    return { color, P2, emergentTo };
  });

  return { geo, P1, incidentFrom, bands, labelColors: rel?.label_colors === true, colorNames: ["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet"] };
}

export function calculateSimpleMicroscopePositions({ elements, relationships, isMobile = false }) {
  const base = calculateConvexLensPositions({ elements, relationships, isMobile });
  const observerEl = elements.find((e) => e.type === "observer");
if (observerEl) {
  const fPx = base.f * base.scale;
  const eyeX = base.lensX + Math.max(70, Math.min(fPx * 0.5, 160));
  const slope = (base.axisY - base.positions.object.tipY) / (base.lensX - base.positions.object.x);
  base.positions.observer = { x: eyeX, y: base.axisY + slope * (eyeX - base.lensX), label: observerEl.label };
}
  return base;
}