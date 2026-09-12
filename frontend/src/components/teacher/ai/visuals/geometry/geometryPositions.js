

import {
  getSegmentEndpoints,
  midpoint,
  lineIntersection,
  solveEquation,
  evaluateExpression,
  calculateSlantVector,
  getTargetVertexId,
  fitPositionsToBounds,
  findSegmentBetween,
  solveApexXForRatio,
  projectPointToLine,
  footOfPerpendicular,
  intersectLines,
  tangentPointFromExternalPoint,
  getSegmentValueBetween,
  getSvgDimensions
} from "./geometryHelpers";


export function calculateGeometryPositions({
  points,
  segments,
  angles,
  relationships,
  figure,
  circles,
  isMobile = false,
}) {

  const pointIds = Object.keys(points);
  const positions = {};

  const { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY} = getSvgDimensions(isMobile);
  //console.log("getSvgDimensions: ",SVG_WIDTH,SVG_HEIGHT)
  const centerX = SVG_WIDTH/2;
  const centerY = SVG_HEIGHT/2;


  const SVG_AVAILABLE_WIDTH = SVG_WIDTH - paddingX * 2;

  const SVG_AVAILABLE_HEIGHT = SVG_HEIGHT -  paddingY * 2;

  /*
   * ------------------------------------------
   * SHARED LAYOUT CONFIG
   * ------------------------------------------
   *
   * Every figure type (circle sub-cases, the triangle family,
   * the quadrilateral family, and the generic fallback) reads
   * its canvas geometry from these three values instead of
   * hardcoding its own centerX/centerY/margins. Change the
   * canvas size or fill factor here and every figure type
   * scales together, consistently.
   *
   * HALF_W / HALF_H are the standard "safe" half-extents a
   * figure should stay within so nothing touches the SVG edge.
   */

  const FILL_FACTOR = 0.90;

  const HALF_W = (SVG_AVAILABLE_WIDTH / 2) * FILL_FACTOR;
  const HALF_H = (SVG_AVAILABLE_HEIGHT/2) * FILL_FACTOR;

  /*
   * ------------------------------------------
   * BASIC GEOMETRY DATA
   * ------------------------------------------
   */
// Extract circle, falling back gracefully if empty
      const circle = circles?.[0] || { id: "circle_o", type: "circle" };
    // 🔎 General & Robust Circle Center Detection
      // 1. Check if the circle object explicitly defines its center point    
      // 2. Look for a point with label "O" (e.g., label: "O")  
      // 3. Look for a point ID starting/ending with "center" or "point_o"
      const centerOfRel = relationships.find((r) => r.type === "is_center_of");
      const centerId =
        circle?.center ||
        centerOfRel?.elements?.[0] ||
        pointIds.find((id) => String(points[id]?.label || "").toUpperCase() === "O") ||
        pointIds.find((id) => id.toLowerCase().includes("center") || id.toLowerCase() === "point_o") ||
        null;
 
      // Base radius derived from available canvas size
      const maxRadius = Math.min(SVG_AVAILABLE_WIDTH / 2, SVG_AVAILABLE_HEIGHT / 2) 
      //console.log("maxRadius:",maxRadius)

      // Scale radius based on number of points (more points → smaller radius)
      const radius = Math.max(
        maxRadius * 0.3, // minimum radius safeguard
        maxRadius - pointIds.length*1
      );

    /*
      * ------------------------------------------
      * CIRCLE FAMILY DETECTION FLAGS
      * ------------------------------------------
      */
      const figureType = figure?.type;
      const feature = figure?.feature || "none";

      const isCircleFamily = figureType === "circle";

      const hasCentralInscribedAngleFeature =
        isCircleFamily && feature === "central_inscribed_angle";

      const hasChordPropertiesFeature =
        isCircleFamily && feature === "chord_properties";

      const hasTangentPropertiesFeature =
        isCircleFamily && feature === "tangent_properties";

      const hasTangentChordAngleFeature =
        isCircleFamily && feature === "tangent_chord_angle";

      const hasIntersectingChordsFeature =
        isCircleFamily && feature === "intersecting_chords";

      const hasSecantSecantFeature =
        isCircleFamily && feature === "secant_secant";

      const hasTangentSecantFeature =
        isCircleFamily && feature === "tangent_secant";

      const hasSectorFeature =
        isCircleFamily && feature === "sector";

      const hasSegmentFeature =
        isCircleFamily && feature === "segment";

      const hasInscribedPolygonFeature =
        isCircleFamily && feature === "inscribed_polygon";

      /*
      * ------------------------------------------
      * CIRCLE FAMILY POSITIONING (separate from triangle/quadrilateral chains)
      * ------------------------------------------
      */
      if (isCircleFamily) {
        //console.log("[DEBUG] Entered circle branch", { figureType, feature, centerId });

        // --------------------------------------------------
        // BASE LAYOUT — place the center (if one exists) and stamp the
        // circle's own render props. Every feature branch below assumes
        // the circle's center/radius are already fixed at this point.
        // --------------------------------------------------
        

        if (centerId) {
          positions[centerId] = { x: centerX, y: centerY, labelAnchor: "auto" };
        }

        circle.__renderCenter = { x: centerX, y: centerY };
        circle.__renderRadius = radius;

        if (!circles.some((c) => c.id === circle.id)) {
          circles.push(circle);
        }

        // --------------------------------------------------
        // Place any point declared via passes_through directly on the
        // circle's circumference, evenly spaced by default. Individual
        // feature branches below may override specific points afterward
        // (e.g. tangent points, chord endpoints at a computed angle).
        // --------------------------------------------------
        const onCircumferenceRels = relationships.filter((r) => r.type === "is_on_circumference");
        const fromIsOnCircumference = onCircumferenceRels.flatMap((r) => {
          // Some questions give a single point in `elements`, others give
          // an array of points directly (e.g. Q2 below, where both A and B
          // are listed together in one relationship's elements array).
          return (r.elements || []).filter((pid) => pid !== centerId);
        });

        const passesRel = relationships.find((r) => r.type === "passes_through");
        const fromPassesThrough = (passesRel?.target || []).filter((pid) => pid !== centerId);
        const circumferencePointIds = [...new Set([...fromPassesThrough, ...fromIsOnCircumference])];
        
        // ============================================================
        // ⬇️ REPLACE THE OLD BLOCK BELOW WITH THIS NEW VERSION ⬇️
        // ============================================================

        // Collect all point ids that a dedicated feature branch (secant or
        // tangent construction) will place itself, so this generic step
        // doesn't pre-empt them with a generic evenly-spaced position first
        // — which would break collinearity for secant/tangent lines.
        const securedByFeature = new Set();
        relationships
          .filter((r) => r.type === "forms_secant_through_points" || r.type === "is_tangent_to")
          .forEach((r) => (r.elements || []).forEach((pid) => securedByFeature.add(pid)));

        const angleStep = (2 * Math.PI) / Math.max(circumferencePointIds.length, 1);
        circumferencePointIds.forEach((pid, i) => {
          if (positions[pid] || securedByFeature.has(pid)) return; // skip feature-owned points
          const theta = -Math.PI / 2 + i * angleStep;
          positions[pid] = {
            x: centerX + Math.cos(theta) * radius,
            y: centerY + Math.sin(theta) * radius,
            labelAnchor: "auto",
          };
        });

        // ⬆️ END REPLACEMENT ⬆️

          // --------------------------------------------------
          // FEATURE BRANCHES
          // --------------------------------------------------
        if (hasCentralInscribedAngleFeature) {
          // Find the forms_angle relationship whose vertex (middle element) IS
          // the center — that's the central angle (e.g. ∠AOB). Any other
          // forms_angle relationship is an inscribed angle on the same arc.
          const formsAngleRels = relationships.filter((r) => r.type === "forms_angle");
          const centralRel = formsAngleRels.find((r) => r.elements?.[1] === centerId);
          const inscribedRels = formsAngleRels.filter((r) => r !== centralRel);

          if (centralRel) {
            const [ptA, , ptB] = centralRel.elements || [];
            const centralAngleObj = angles.find((a) => a.id === centralRel.target);
            const centralValueDeg = parseFloat(centralAngleObj?.value);
            const centralAngleRad = !isNaN(centralValueDeg)
              ? (centralValueDeg * Math.PI) / 180
              : Math.PI / 2; // sensible fallback if no numeric value is given

            // Anchor the central angle pointing "down" from O, so the minor arc
            // AB sits at the bottom and there's open space at the top for the
            // inscribed-angle vertex on the major arc.
            const baseTheta = Math.PI / 2;
            const thetaA = baseTheta - centralAngleRad / 2;
            const thetaB = baseTheta + centralAngleRad / 2;

            if (ptA) {
              positions[ptA] = {
                x: centerX + Math.cos(thetaA) * radius,
                y: centerY + Math.sin(thetaA) * radius,
                labelAnchor: "auto",
              };
            }
            if (ptB) {
              positions[ptB] = {
                x: centerX + Math.cos(thetaB) * radius,
                y: centerY + Math.sin(thetaB) * radius,
                labelAnchor: "auto",
              };
            }

            // Any inscribed-angle vertex (e.g. C) not already A/B/O goes on the
            // major arc, directly opposite the minor arc AB.
            const usedIds = new Set([ptA, ptB, centerId]);
            let placedCount = 0;
            inscribedRels.forEach((rel) => {
              const vertexId = rel.elements?.[1];
              if (!vertexId || usedIds.has(vertexId)) return;
              const spread = Math.PI / 6; // fan multiple inscribed vertices apart
              const theta = baseTheta + Math.PI + (placedCount - (inscribedRels.length - 1) / 2) * spread;
              positions[vertexId] = {
                x: centerX + Math.cos(theta) * radius,
                y: centerY + Math.sin(theta) * radius,
                labelAnchor: "auto",
              };
              usedIds.add(vertexId);
              placedCount += 1;
            });
          }

        } 
        else if (hasChordPropertiesFeature) {
          const chordRels = relationships.filter((r) => r.type === "forms_chord");

          // Two schematic center-angles: first chord toward the bottom,
          // second chord (if present) toward the top-left, so both are
          // clearly visible and don't overlap.
          const CHORD_ANGLES = [Math.PI / 2, -Math.PI / 2.5];
          const halfAngle = Math.PI / 6;

          chordRels.forEach((chordRel, idx) => {
            const [ptA, ptB] = chordRel.elements || [];
            const chordSegId = chordRel.target;
            if (!ptA || !ptB) return;

            const centerTheta = CHORD_ANGLES[idx % CHORD_ANGLES.length];

            positions[ptA] = {
              x: centerX + Math.cos(centerTheta - halfAngle) * radius,
              y: centerY + Math.sin(centerTheta - halfAngle) * radius,
              labelAnchor: "auto",
            };
            positions[ptB] = {
              x: centerX + Math.cos(centerTheta + halfAngle) * radius,
              y: centerY + Math.sin(centerTheta + halfAngle) * radius,
              labelAnchor: "auto",
            };

            const midRel = relationships.find(
              (r) => r.type === "lies_on" && (r.target_segment === chordSegId || r.target === chordSegId)
            );
            const mId = midRel?.element_id || midRel?.elements?.[0];
            if (mId) {
              positions[mId] = {
                x: (positions[ptA].x + positions[ptB].x) / 2,
                y: (positions[ptA].y + positions[ptB].y) / 2,
                labelAnchor: "auto",
              };
            }
          });
        } 
        else if (hasTangentPropertiesFeature) {
          const tangentRels = relationships.filter((r) => r.type === "is_tangent_to");

          tangentRels.forEach((rel, idx) => {
            const segOrLineId = rel.elements?.[0];
            const tangentPointId = rel.at_point;
            if (!segOrLineId || !tangentPointId) return;
            if (positions[tangentPointId]) return; // already placed (e.g. by another branch)

            // Find the external point via forms_segment (the OTHER endpoint of
            // the tangent segment, besides the tangent point itself).
            const segRel = relationships.find(
              (r) => r.type === "forms_segment" && r.target === segOrLineId
            );
            const externalPointId = segRel?.elements?.find((pid) => pid !== tangentPointId);
            if (!externalPointId) return;

            // Place the external point at a fixed schematic distance/angle if
            // not already positioned.
            if (!positions[externalPointId]) {
              const EXTERNAL_DISTANCE_MULTIPLIER = 1.8; // external point sits well outside the circle
              const schematicAngle = Math.PI / 4 + idx * (Math.PI / 3); // spread multiple external points apart
              positions[externalPointId] = {
                x: centerX + Math.cos(schematicAngle) * radius * EXTERNAL_DISTANCE_MULTIPLIER,
                y: centerY + Math.sin(schematicAngle) * radius * EXTERNAL_DISTANCE_MULTIPLIER,
                labelAnchor: "auto",
              };
            }

            const tangentPos = tangentPointFromExternalPoint(
              { x: centerX, y: centerY },
              radius,
              positions[externalPointId],
              idx % 2 === 0 ? 1 : -1 // alternate sides for multiple tangents from the same point (Q2)
            );

            if (tangentPos) {
              positions[tangentPointId] = { ...tangentPos, labelAnchor: "auto" };
            }
          });
        } 
        else if (hasTangentChordAngleFeature) {
          const tangentRel = relationships.find((r) => r.type === "is_tangent_to");
          if (tangentRel) {
            const tangentPointId = tangentRel.at_point;
            if (tangentPointId && !positions[tangentPointId]) {
              const FIXED_A_ANGLE = Math.PI * 0.7; // fixed schematic position for A
              positions[tangentPointId] = {
                x: centerX + Math.cos(FIXED_A_ANGLE) * radius,
                y: centerY + Math.sin(FIXED_A_ANGLE) * radius,
                labelAnchor: "auto",
              };
            }

            const A = positions[tangentPointId];
            if (A) {
              const radialAngle = Math.atan2(A.y - centerY, A.x - centerX);
              const tangentDirAngle = radialAngle + Math.PI / 2;
              const tangentDx = Math.cos(tangentDirAngle);
              const tangentDy = Math.sin(tangentDirAngle);

              const TANGENT_HALF_LENGTH = 55;

              // Identify Q and B via the forms_angle relationship (Q, A, B order).
              const angleRel = relationships.find(
                (r) => r.type === "forms_angle" && r.elements?.[1] === tangentPointId
              );
              const qId = angleRel?.elements?.[0];
              const bId = angleRel?.elements?.[2];

              if (qId) {
                positions[qId] = {
                  x: A.x + tangentDx * TANGENT_HALF_LENGTH,
                  y: A.y + tangentDy * TANGENT_HALF_LENGTH,
                  labelAnchor: "auto",
                };
              }

              // P = mirror of Q through A, opposite end of the same tangent line.
              const pId = Object.keys(points).find(
              (pid) => points[pid]?.label && pid !== tangentPointId && pid !== qId && pid !== bId &&
                !relationships.some((r) => r.type === "is_on_circumference" && r.elements?.includes(pid))
            );
            if (pId && !positions[pId]) {   // ✅ fixed — use pId, matching the outer variable
              positions[pId] = {
                x: A.x - tangentDx * TANGENT_HALF_LENGTH,
                y: A.y - tangentDy * TANGENT_HALF_LENGTH,
                labelAnchor: "auto",
              };
            }

              // Find the angle value to rotate by — read from the angle ELEMENT
              // itself (angles array), since that's where "value": "60" actually
              // lives in the original JSON, not on any relationship.
              const angleId = angleRel?.target;
              const angleEl = angles.find((a) => a.id === angleId);
              const angleDeg = Number.isFinite(parseFloat(angleEl?.value)) ? parseFloat(angleEl.value) : 60;
              const angleRad = (angleDeg * Math.PI) / 180;

              if (bId && !positions[bId]) {
                const chordDirAngle = tangentDirAngle + Math.PI - angleRad;
                const dx = Math.cos(chordDirAngle);
                const dy = Math.sin(chordDirAngle);

                const ax = A.x - centerX, ay = A.y - centerY;
                const t = -2 * (ax * dx + ay * dy);

                positions[bId] = {
                  x: A.x + dx * t,
                  y: A.y + dy * t,
                  labelAnchor: "auto",
                };
              }

              // Place C at a fixed schematic point on the circle, in the
              // alternate segment (arbitrary but consistent — any point on
              // that arc correctly demonstrates the theorem).
              const cRel = relationships.find((r) => r.type === "is_on_circumference");
              const cId = cRel?.elements?.[0];
              if (cId && !positions[cId]) {
                const C_ANGLE_OFFSET = Math.PI * 0.35;
                positions[cId] = {
                  x: centerX + Math.cos(radialAngle + C_ANGLE_OFFSET) * radius,
                  y: centerY + Math.sin(radialAngle + C_ANGLE_OFFSET) * radius,
                  labelAnchor: "auto",
                };
              }
            }
          }
        } 
        else if (hasIntersectingChordsFeature) {
          const passesRel = relationships.find((r) => r.type === "passes_through");
          const chordPointIds = passesRel?.target || [];
          const intersectRel = relationships.find((r) => r.type === "intersect_at");
          const eId = intersectRel?.target;

          const getSegVal = (segId) => {
            const segEl = segments.find((s) => s.id === segId);
            const num = parseFloat(segEl?.value);
            return Number.isFinite(num) ? num : null;
          };
          const findSegIdBetween = (p1, p2) =>
            relationships.find(
              (r) => r.type === "forms_segment" && r.elements?.includes(p1) && r.elements?.includes(p2)
            )?.target || null;

          let solvedOk = false;

          if (chordPointIds.length === 4 && eId) {
            const [aId, bId, cId, dId] = chordPointIds;

            let p1 = getSegVal(findSegIdBetween(aId, eId)); // AE
            let q1 = getSegVal(findSegIdBetween(eId, bId)); // EB
            let p2 = getSegVal(findSegIdBetween(cId, eId)); // CE
            let q2 = getSegVal(findSegIdBetween(eId, dId)); // ED

            // Solve the single unknown (marked "?") via the intersecting-chords
            // theorem: AE * EB = CE * ED.
            const nullCount = [p1, q1, p2, q2].filter((v) => v === null).length;
            if (nullCount === 1) {
              if (p1 === null) p1 = (p2 * q2) / q1;
              else if (q1 === null) q1 = (p2 * q2) / p1;
              else if (p2 === null) p2 = (p1 * q1) / q2;
              else if (q2 === null) q2 = (p1 * q1) / p2;
            }

            if ([p1, q1, p2, q2].every((v) => Number.isFinite(v) && v > 0)) {
              const L1 = (p1 + q1) / 2, s1 = (p1 - q1) / 2; // chord AB, local to its own line
              const L2 = (p2 + q2) / 2, s2 = (p2 - q2) / 2; // chord CD

              // Scale both chords (preserving their ratios) so the larger one
              // fits comfortably inside the circle.
              const k = (radius * 0.85) / Math.max(L1, L2);
              const L1s = L1 * k, s1s = s1 * k;
              const p2s = p2 * k, q2s = q2 * k;

              const h1 = Math.sqrt(Math.max(radius * radius - L1s * L1s, 0));
              const theta1 = (5 * Math.PI) / 6; // fixed schematic direction for chord AB
              const perp1 = theta1 + Math.PI / 2;

              // Foot of perpendicular from center to chord AB.
              const F1 = {
                x: centerX + Math.cos(perp1) * h1,
                y: centerY + Math.sin(perp1) * h1,
              };
              const u1 = { x: Math.cos(theta1), y: Math.sin(theta1) };

              const A = { x: F1.x - u1.x * L1s, y: F1.y - u1.y * L1s };
              const B = { x: F1.x + u1.x * L1s, y: F1.y + u1.y * L1s };
              const E = { x: F1.x + u1.x * s1s, y: F1.y + u1.y * s1s };

              // Chord CD's direction is NOT free — it must pass through the
              // SAME point E and split into exactly p2s/q2s. Solve for the
              // unit direction v satisfying (E-O)·v = s2s (derived from
              // requiring both C and D to lie on the circle).
              const e = { x: E.x - centerX, y: E.y - centerY };
              const eLen = Math.hypot(e.x, e.y);
              const c = s2 * k / eLen; // note: uses s2*k = s2s, same scale

              if (eLen > 0 && Math.abs(c) <= 1) {
                const ehat = { x: e.x / eLen, y: e.y / eLen };
                const nhat = { x: -ehat.y, y: ehat.x };
                const sinTerm = Math.sqrt(Math.max(0, 1 - c * c));

                // Two possible directions (±); pick whichever crosses chord1
                // at a clearer angle (avoid near-parallel chords).
                const buildV = (sign) => ({
                  x: c * ehat.x + sign * sinTerm * nhat.x,
                  y: c * ehat.y + sign * sinTerm * nhat.y,
                });
                let v2 = buildV(1);
                const dotWithU1 = Math.abs(v2.x * u1.x + v2.y * u1.y);
                if (dotWithU1 > 0.95) v2 = buildV(-1);

                const C = { x: E.x - v2.x * p2s, y: E.y - v2.y * p2s };
                const D = { x: E.x + v2.x * q2s, y: E.y + v2.y * q2s };

                positions[aId] = { ...A, labelAnchor: "auto" };
                positions[bId] = { ...B, labelAnchor: "auto" };
                positions[cId] = { ...C, labelAnchor: "auto" };
                positions[dId] = { ...D, labelAnchor: "auto" };
                positions[eId] = { ...E, labelAnchor: "auto" };
                solvedOk = true;
              }
            }
          }

          // Fallback: if lengths are missing/inconsistent (e.g. more than one
          // "?" so the theorem can't solve it, or the resulting direction is
          // degenerate), keep the old fixed-angle schematic as a safety net
          // rather than rendering nothing.
          if (!solvedOk && chordPointIds.length === 4) {
            const [aId, bId, cId, dId] = chordPointIds;
            const CHORD1_ANGLES = [Math.PI * 0.65, Math.PI * -0.25];
            const CHORD2_ANGLES = [Math.PI * 0.25, Math.PI * -0.65];

            positions[aId] = { x: centerX + Math.cos(CHORD1_ANGLES[0]) * radius, y: centerY + Math.sin(CHORD1_ANGLES[0]) * radius, labelAnchor: "auto" };
            positions[bId] = { x: centerX + Math.cos(CHORD1_ANGLES[1]) * radius, y: centerY + Math.sin(CHORD1_ANGLES[1]) * radius, labelAnchor: "auto" };
            positions[cId] = { x: centerX + Math.cos(CHORD2_ANGLES[0]) * radius, y: centerY + Math.sin(CHORD2_ANGLES[0]) * radius, labelAnchor: "auto" };
            positions[dId] = { x: centerX + Math.cos(CHORD2_ANGLES[1]) * radius, y: centerY + Math.sin(CHORD2_ANGLES[1]) * radius, labelAnchor: "auto" };

            if (eId) {
              const e = lineIntersection(positions[aId], positions[bId], positions[cId], positions[dId]);
              if (e) positions[eId] = { ...e, labelAnchor: "auto" };
            }
          }
        }
        else if (hasTangentSecantFeature) {
        const tangentRel = relationships.find((r) => r.type === "is_tangent_to");
        const secantRel = relationships.find((r) => r.type === "forms_secant_through_points");

        if (tangentRel && secantRel) {
          const tangentPointId = tangentRel.at_point;
          const [pId, bId, cId] = secantRel.elements || [];

          if (pId && !positions[pId]) {
            const EXT_MULTIPLIER = 2;
            const schematicAngle = Math.PI/2 * 0.25;
            positions[pId] = {
              x: centerX + Math.cos(schematicAngle) * radius * EXT_MULTIPLIER,
              y: centerY + Math.sin(schematicAngle) * radius * EXT_MULTIPLIER,
              labelAnchor: "auto",
            };
          }

          // Unconditional overwrite: the generic circumference loop already
          // placed A/B/C at naive evenly-spaced angles (since they're listed
          // in passes_through), which is NOT geometrically valid for a
          // tangent/secant configuration. These positions MUST be recomputed
          // relative to P, so we deliberately ignore whatever the generic
          // loop assigned rather than guard against overwriting it.
          if (tangentPointId && positions[pId]) {
            const tangentPos = tangentPointFromExternalPoint({ x: centerX, y: centerY }, radius, positions[pId], 1);
            if (tangentPos) positions[tangentPointId] = { ...tangentPos, labelAnchor: "auto" };
          }

          if (bId && cId && positions[pId]) {
            const px = positions[pId].x - centerX, py = positions[pId].y - centerY;
            const d = Math.hypot(px, py);

            const baseAngle = Math.atan2(py, px);
            const tangentOffsetAngle = Math.acos(radius / d);
            const secantOffsetAngle = tangentOffsetAngle * 0.5;
            const secantDirFromCenter = baseAngle + secantOffsetAngle;

            const aimX = centerX + Math.cos(secantDirFromCenter) * radius;
            const aimY = centerY + Math.sin(secantDirFromCenter) * radius;
            const rayDx = aimX - positions[pId].x;
            const rayDy = aimY - positions[pId].y;
            const rayLen = Math.hypot(rayDx, rayDy);
            const dx = rayDx / rayLen, dy = rayDy / rayLen;

            const b = 2 * (px * dx + py * dy);
            const c = px * px + py * py - radius * radius;
            const disc = b * b - 4 * c;

            if (disc >= 0) {
              const sqrtDisc = Math.sqrt(disc);
              const t1 = (-b - sqrtDisc) / 2;
              const t2 = (-b + sqrtDisc) / 2;
              const nearT = Math.min(t1, t2), farT = Math.max(t1, t2);

              positions[bId] = { x: positions[pId].x + dx * nearT, y: positions[pId].y + dy * nearT, labelAnchor: "auto" };
              positions[cId] = { x: positions[pId].x + dx * farT, y: positions[pId].y + dy * farT, labelAnchor: "auto" };
            }
          }
        }
        }
    
        else if (hasSecantSecantFeature) {
          const secantRels = relationships.filter((r) => r.type === "forms_secant_through_points");
          const SECANT_ANGLE_OFFSETS = [-0.5, 0.5];
          secantRels.forEach((rel, idx) => {
            
            const [pId, nearId, farId] = rel.elements || [];
            if (!pId || !nearId || !farId) {
              return;
            }

            if (!positions[pId]) {
              const EXT_MULTIPLIER = 1.9;
              positions[pId] = {
                x: centerX + Math.cos(Math.PI * 0.1) * radius * EXT_MULTIPLIER,
                y: centerY + Math.sin(Math.PI * 0.1) * radius * EXT_MULTIPLIER,
                labelAnchor: "auto",
              };
            }

            if (positions[nearId]) {
              return;
            }

            const toCenterAngle = Math.atan2(centerY - positions[pId].y, centerX - positions[pId].x);
            const secantDirAngle = toCenterAngle + SECANT_ANGLE_OFFSETS[idx % SECANT_ANGLE_OFFSETS.length];
            const dx = Math.cos(secantDirAngle), dy = Math.sin(secantDirAngle);
            const px = positions[pId].x - centerX, py = positions[pId].y - centerY;
            const b = 2 * (px * dx + py * dy);
            const c = px * px + py * py - radius * radius;
            const disc = b * b - 4 * c;
            if (disc >= 0) {
              
              const sqrtDisc = Math.sqrt(disc);
              const t1 = (-b - sqrtDisc) / 2;
              const t2 = (-b + sqrtDisc) / 2;
              const nearT = Math.min(t1, t2), farT = Math.max(t1, t2);

              positions[nearId] = { x: positions[pId].x + dx * nearT, y: positions[pId].y + dy * nearT, labelAnchor: "auto" };
              positions[farId] = { x: positions[pId].x + dx * farT, y: positions[pId].y + dy * farT, labelAnchor: "auto" };
            }
          });
        } 
        else if (hasSectorFeature) {
          const formsAngleRels = relationships.filter((r) => r.type === "forms_angle");
          const centralRel = formsAngleRels.find((r) => r.elements?.[1] === centerId);

          if (centralRel) {
            const [ptA, , ptB] = centralRel.elements || [];
            const angleObj = angles.find((a) => a.id === centralRel.target);
            const angleDeg = parseFloat(angleObj?.value);
            const angleRad = !isNaN(angleDeg) ? (angleDeg * Math.PI) / 180 : Math.PI / 3;

            // Same convention as central_inscribed_angle: point the wedge
            // downward from center so there's clear space above for labels,
            // and so a major-arc sweep (Q3) has room to read clearly.
            const baseTheta = Math.PI / 2;
            const thetaA = baseTheta - angleRad / 2;
            const thetaB = baseTheta + angleRad / 2;

            // Unconditional overwrite — the generic is_on_circumference loop
            // already placed A/B at naive evenly-spaced angles that do NOT
            // reflect the stated central angle value. That placement must be
            // replaced, not preserved (same lesson as the tangent-secant fix).
            if (ptA) {
              positions[ptA] = {
                x: centerX + Math.cos(thetaA) * radius,
                y: centerY + Math.sin(thetaA) * radius,
                labelAnchor: "auto",
              };
            }
            if (ptB) {
              positions[ptB] = {
                x: centerX + Math.cos(thetaB) * radius,
                y: centerY + Math.sin(thetaB) * radius,
                labelAnchor: "auto",
              };
            }
          }
        }
        
         else if (hasSegmentFeature) {
          const formsAngleRels = relationships.filter((r) => r.type === "forms_angle");
          const centralRel = formsAngleRels.find((r) => r.elements?.[1] === centerId);

          if (centralRel) {
            const [ptA, , ptB] = centralRel.elements || [];
            const angleObj = angles.find((a) => a.id === centralRel.target);
            const angleDeg = parseFloat(angleObj?.value);
            const angleRad = !isNaN(angleDeg) ? (angleDeg * Math.PI) / 180 : Math.PI / 3;

            // Same convention as sector: wedge points downward from center so
            // there's room above for the segment's shaded region/label.
            const baseTheta = Math.PI / 2;
            const thetaA = baseTheta - angleRad / 2;
            const thetaB = baseTheta + angleRad / 2;

            // Unconditional overwrite — is_on_circumference already ran A/B
            // through the generic evenly-spaced loop before this branch, which
            // does NOT reflect the actual central angle. Must replace it.
            if (ptA) {
              positions[ptA] = {
                x: centerX + Math.cos(thetaA) * radius,
                y: centerY + Math.sin(thetaA) * radius,
                labelAnchor: "auto",
              };
            }
            if (ptB) {
              positions[ptB] = {
                x: centerX + Math.cos(thetaB) * radius,
                y: centerY + Math.sin(thetaB) * radius,
                labelAnchor: "auto",
              };
            }
          }
        }
        else if (hasInscribedPolygonFeature) {
            const lockedIds = new Set();

            // Diameters: force their two endpoints to opposite ends of the circle.
            const diameterRels = relationships.filter((r) => r.type === "is_diameter_of");
            diameterRels.forEach((rel) => {
              const segId = rel.elements?.[0];
              const segRel = relationships.find((r) => r.type === "forms_segment" && r.target === segId);
              const [ptA, ptB] = segRel?.elements || [];
              if (!ptA || !ptB) return;

              const theta = -Math.PI / 2;
              positions[ptA] = {
                x: centerX + Math.cos(theta) * radius,
                y: centerY + Math.sin(theta) * radius,
                labelAnchor: "auto",
              };
              positions[ptB] = {
                x: centerX + Math.cos(theta + Math.PI) * radius,
                y: centerY + Math.sin(theta + Math.PI) * radius,
                labelAnchor: "auto",
              };
              lockedIds.add(ptA);
              lockedIds.add(ptB);
            });

            // subtends_same_arc: the two (or more) inscribed-angle vertices must
            // sit on the same major arc, away from the shared chord, so the figure
            // visually agrees with "these angles are equal" claims.
            const sameArcRels = relationships.filter((r) => r.type === "subtends_same_arc");
            const formsAngleRels = relationships.filter((r) => r.type === "forms_angle");

            sameArcRels.forEach((rel) => {
              const [angleIdA, angleIdB] = rel.elements || [];
              const relA = formsAngleRels.find((r) => r.target === angleIdA);
              const relB = formsAngleRels.find((r) => r.target === angleIdB);
              if (!relA || !relB) return;

              const [chordP1, vertexA, chordP2] = relA.elements || [];
              const [, vertexB] = relB.elements || [];
              if (!chordP1 || !chordP2) return;

              const baseTheta = Math.PI / 2;
              const chordHalfAngle = Math.PI / 5;

              if (!lockedIds.has(chordP1)) {
                positions[chordP1] = {
                  x: centerX + Math.cos(baseTheta - chordHalfAngle) * radius,
                  y: centerY + Math.sin(baseTheta - chordHalfAngle) * radius,
                  labelAnchor: "auto",
                };
              }
              if (!lockedIds.has(chordP2)) {
                positions[chordP2] = {
                  x: centerX + Math.cos(baseTheta + chordHalfAngle) * radius,
                  y: centerY + Math.sin(baseTheta + chordHalfAngle) * radius,
                  labelAnchor: "auto",
                };
              }

              // Spread the subtending vertices evenly across the remaining major arc.
              const vertexIds = [...new Set([vertexA, vertexB])].filter((v) => v && !lockedIds.has(v));
              const majorArcSpan = 2 * Math.PI - chordHalfAngle * 2;
              const startTheta = baseTheta + chordHalfAngle;
              vertexIds.forEach((vId, i) => {
                const t = (i + 1) / (vertexIds.length + 1);
                const theta = startTheta + majorArcSpan * t;
                positions[vId] = {
                  x: centerX + Math.cos(theta) * radius,
                  y: centerY + Math.sin(theta) * radius,
                  labelAnchor: "auto",
                };
                lockedIds.add(vId);
              });
            });
          }

        // --------------------------------------------------
        // GENERIC forms_segment / forms_angle WIRING — same pattern as
        // quadrilateral family, runs last so every derived point (tangent
        // points, chord intersections, etc.) already has a position.
        // --------------------------------------------------
        relationships
          .filter((r) => r.type === "forms_segment")
          .forEach((rel) => {
            const [ptA, ptB] = rel.elements || [];
            const segId = rel.target;
            if (!ptA || !ptB || !segId) return;
            if (!positions[ptA] || !positions[ptB]) return;

            let segObj = segments.find((s) => s.id === segId);
            if (segObj) {
              segObj.start = ptA;
              segObj.end = ptB;
              segObj.type = "segment";
            } else {
              segments.push({ id: segId, type: "segment", start: ptA, end: ptB });
            }
          });

        relationships
          .filter((r) => r.type === "forms_angle")
          .forEach((rel) => {
            const [firstId, vertexId, secondId] = rel.elements || [];
            const angleId = rel.target;
            if (!firstId || !vertexId || !secondId || !angleId) return;

            const firstLabel = points[firstId]?.label;
            const vertexLabel = points[vertexId]?.label;
            const secondLabel = points[secondId]?.label;
            if (!firstLabel || !vertexLabel || !secondLabel) return;

            let angleObj = angles.find((a) => a.id === angleId);
            if (angleObj) {
              angleObj.elements = [firstLabel, vertexLabel, secondLabel];
            } else {
              angles.push({ id: angleId, type: "angle", elements: [firstLabel, vertexLabel, secondLabel] });
            }
          });

          fitPositionsToBounds(positions,{ width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY }, circles);

      }


      /*
      * ------------------------------------------
      * POLYGON FAMILY DETECTION FLAGS
      * ------------------------------------------
      */
      const isPolygonFamily = figureType === "polygon";

      const hasPolygonCircumscribedCircleFeature =
        isPolygonFamily && feature === "circumscribed_circle";

      const hasPolygonInscribedCircleFeature =
        isPolygonFamily && feature === "inscribed_circle";

      const hasPolygonDiagonalsFeature =
        isPolygonFamily && feature === "diagonals";

      /*
      * ------------------------------------------
      * POLYGON FAMILY POSITIONING (separate from triangle/quadrilateral/circle chains)
      * ------------------------------------------
      */
      if (isPolygonFamily) {
        console.log("[DEBUG] Entered polygon branch", { figureType, feature });

        const formsRel = relationships.find((r) => r.type === "forms_polygon");
        const vertexIds = formsRel?.elements || [];
        const sideCount = formsRel?.properties?.sides || vertexIds.length;

        // --------------------------------------------------
        // BASE LAYOUT — N vertices evenly spaced around a fixed circle,
        // generalizing the same even-spacing pattern already used for
        // circumference points and cyclic quadrilaterals.
        // --------------------------------------------------
        if (vertexIds.length >= 3) {
          const POLY_RADIUS = Math.max(radius, 70); // reuse circle radius constant if available, else fallback
          const angleStep = (2 * Math.PI) / sideCount;
          const START_ANGLE = -Math.PI / 2; // first vertex at top

          vertexIds.forEach((vid, i) => {
            const theta = START_ANGLE + i * angleStep;
            positions[vid] = {
              x: centerX + Math.cos(theta) * POLY_RADIUS,
              y: centerY + Math.sin(theta) * POLY_RADIUS,
              labelAnchor: "auto",
            };
          });

          // Auto-draw the N sides, connecting consecutive vertices.
          for (let i = 0; i < sideCount; i++) {
            const from = vertexIds[i];
            const to = vertexIds[(i + 1) % vertexIds.length];
            const fromLetter = from.replace("point_", "");
            const toLetter = to.replace("point_", "");
            const segId = `segment_${fromLetter}${toLetter}`;
            const exists = segments.some(
              (s) =>
                (s.start === from && s.end === to) ||
                (s.start === to && s.end === from) ||
                s.id === segId
            );
            if (!exists) {
              segments.push({ id: segId, type: "segment", start: from, end: to });
            }
          }
        }
          // --------------------------------------------------
          // DIAGONAL INTERSECTION POINTS — compute the true geometric
          // intersection for any point declared via intersect_at between
          // two segments, now that all polygon vertices have real
          // positions. Without this, a point like P (diagonals AD x BE)
          // never gets a position at all, so its own label/dot and any
          // angle formed at it (e.g. angle_apb) silently fail to render.
          // --------------------------------------------------
          relationships
            .filter((r) => r.type === "intersect_at")
            .forEach((rel) => {
              const [segIdA, segIdB] = rel.elements || [];
              const pointId = rel.target;
              if (!segIdA || !segIdB || !pointId) return;

              const segRelA = relationships.find((r) => r.type === "forms_segment" && r.target === segIdA);
              const segRelB = relationships.find((r) => r.type === "forms_segment" && r.target === segIdB);
              const [a1, a2] = segRelA?.elements || [];
              const [b1, b2] = segRelB?.elements || [];

              const p1 = positions[a1], p2 = positions[a2];
              const p3 = positions[b1], p4 = positions[b2];
              if (!p1 || !p2 || !p3 || !p4) return;

              const intersection = lineIntersection(p1, p2, p3, p4);
              if (intersection) {
                positions[pointId] = { ...intersection, labelAnchor: "auto" };
              }
            });
        // --------------------------------------------------
        // FEATURE BRANCHES
        // --------------------------------------------------
        if (hasPolygonCircumscribedCircleFeature) {
          // Circumcircle: center = polygon's own center, radius = distance to
          // any vertex. Since vertices are already evenly placed around
          // (centerX, centerY) at POLY_RADIUS, this is nearly free.
          const centerOfRel = relationships.find((r) => r.type === "is_center_of");
          const centerPointId = centerOfRel?.elements?.[0];
          if (centerPointId && !positions[centerPointId]) {
            positions[centerPointId] = { x: centerX, y: centerY, labelAnchor: "auto" };
          }

          const passesRel = relationships.find((r) => r.type === "passes_through");
          if (passesRel?.elements?.[0]) {
            const circleId = passesRel.elements[0];
            const circleObj = circles.find((c) => c.id === circleId);
            if (circleObj && vertexIds.length > 0) {
              const anyVertex = positions[vertexIds[0]];
              circleObj.__renderCenter = { x: centerX, y: centerY };
              circleObj.__renderRadius = Math.hypot(anyVertex.x - centerX, anyVertex.y - centerY);
            }
          }
        }

        else if (hasPolygonInscribedCircleFeature) {
          // Incircle: tangent to every side's midpoint. Radius = apothem =
          // POLY_RADIUS * cos(pi / n) for a regular n-gon.
          const centerOfRel = relationships.find((r) => r.type === "is_center_of");
          const centerPointId = centerOfRel?.elements?.[0];
          if (centerPointId && !positions[centerPointId]) {
            positions[centerPointId] = { x: centerX, y: centerY, labelAnchor: "auto" };
          }

          const tangentRel = relationships.find((r) => r.type === "is_tangent_to");
          const circleId = tangentRel?.elements?.[0];
          const circleObj = circles.find((c) => c.id === circleId);
          if (circleObj && vertexIds.length >= 3) {
            const anyVertex = positions[vertexIds[0]];
            const outerRadius = Math.hypot(anyVertex.x - centerX, anyVertex.y - centerY);
            const apothem = outerRadius * Math.cos(Math.PI / sideCount);
            circleObj.__renderCenter = { x: centerX, y: centerY };
            circleObj.__renderRadius = apothem;
          }
        }

        else if (hasPolygonDiagonalsFeature) {
          // No special logic needed here: vertices come from the base layout
          // above, named diagonal segments are drawn by the generic
          // forms_segment/forms_chord wiring below, and any diagonal
          // intersection point (e.g. P where two diagonals cross) is computed
          // by the generic intersect_at handling above the feature branches.
          // This branch would need real logic only if a future "diagonals"
          // question requires something those three don't cover — e.g. a
          // shaded enclosed-region fill, or a parallel/equal-length tick mark
          // between two diagonals.
        }

        // --------------------------------------------------
        // GENERIC forms_segment / forms_angle WIRING (same pattern as
        // quadrilateral/circle families)
        // --------------------------------------------------
        relationships
          .filter((r) => r.type === "forms_segment" || r.type === "forms_chord")
          .forEach((rel) => {
            const [ptA, ptB] = rel.elements || [];
            const segId = rel.target;
            if (!ptA || !ptB || !segId) return;
            if (!positions[ptA] || !positions[ptB]) return;

            let segObj = segments.find((s) => s.id === segId);
            if (segObj) {
              segObj.start = ptA;
              segObj.end = ptB;
              segObj.type = "segment";
            } else {
              segments.push({ id: segId, type: "segment", start: ptA, end: ptB });
            }
          });

        relationships
          .filter((r) => r.type === "forms_angle")
          .forEach((rel) => {
            const [firstId, vertexId, secondId] = rel.elements || [];
            const angleId = rel.target;
            if (!firstId || !vertexId || !secondId || !angleId) return;

            const firstLabel = points[firstId]?.label;
            const vertexLabel = points[vertexId]?.label;
            const secondLabel = points[secondId]?.label;
            if (!firstLabel || !vertexLabel || !secondLabel) return;

            let angleObj = angles.find((a) => a.id === angleId);
            if (angleObj) {
              angleObj.elements = [firstLabel, vertexLabel, secondLabel];
            } else {
              angles.push({ id: angleId, type: "angle", elements: [firstLabel, vertexLabel, secondLabel] });
            }
          });

        // --------------------------------------------------
        // FINAL BOUNDS FIT
        // --------------------------------------------------
        fitPositionsToBounds(
          positions,
          { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY },
          circles
        );
      }

      
      /*
      * ==================================================
      * QUADRILATERAL GEOMETRY & SPECIALIZED LAYOUTS
      * ==================================================
      */

      const isQuadrilateralFamily =
        figureType === "parallelogram" || figureType === "trapezoid" || figureType === "quadrilateral";

      const hasParallelogramDiagonalsFeature =
        figureType === "parallelogram" && feature === "diagonals";

      const hasParallelogramAltitudeFeature =
        figureType === "parallelogram" && feature === "altitude";

      const hasTrapezoidMedianFeature =
        figureType === "trapezoid" && feature === "median";

      const hasTrapezoidDiagonalProportionalityFeature =
        figureType === "trapezoid" && feature === "diagonal_proportionality";

      const hasQuadrilateralDiagonalsFeature =
       figureType === "quadrilateral" && feature === "diagonals";

      const hasQuadrilateralAreaSplitFeature =
       figureType === "quadrilateral" && feature === "diagonal_area_split";

      const hasKiteAxisFeature =
        figureType === "quadrilateral" &&  figure?.subtype === "kite" &&
        (feature === "axis_of_symmetry" || feature === "diagonals");

      
      const hasCyclicQuadrilateralFeature =
        figureType === "quadrilateral" && figure?.subtype === "cyclic";

       
      // ==================================================
      // QUADRILATERAL FAMILY POSITIONING (separate from triangle chain)
      // ==================================================
      if (isQuadrilateralFamily) {
        // Every quadrilateral-family shape starts from its 4 declared vertices —
        // resolved once here, shared by every feature branch below.
        const formsRel = relationships.find(
          (r) =>
            r.type === "forms_parallelogram" ||
            r.type === "forms_trapezoid" ||
            r.type === "forms_quadrilateral"
        );
        const vertexIds = formsRel?.elements || [];
        // --------------------------------------------------
        // BASE VERTEX LAYOUT — must run before any feature branch below,
        // since diagonal/altitude math all reads positions[vertexId].
        // --------------------------------------------------
        if (isQuadrilateralFamily && vertexIds.length === 4) {
          const [v1, v2, v3, v4] = vertexIds;
          // Force-set all 4 to the correct quadrilateral layout, overriding
          // whatever generic/shared step (meant for triangles) already ran.
          if (figureType === "parallelogram") {
            positions[v1] = { x: centerX - 60, y: centerY - 60, labelAnchor: "top" };
            positions[v2] = { x: centerX + 90, y: centerY - 60, labelAnchor: "top" };
            positions[v3] = { x: centerX + 60, y: centerY + 60, labelAnchor: "bottom" };
            positions[v4] = { x: centerX - 90, y: centerY + 60, labelAnchor: "bottom" };
          } 
          else if (figureType === "trapezoid") {
            if (figure?.subtype === "right") {
              // One leg (v1-v4) vertical/perpendicular to both bases; slant
              // only on the opposite leg (v2-v3).
              positions[v1] = { x: centerX - 60, y: centerY - 60, labelAnchor: "top" };
              positions[v2] = { x: centerX + 20, y: centerY - 60, labelAnchor: "top" };
              positions[v3] = { x: centerX + 80, y: centerY + 60, labelAnchor: "bottom" };
              positions[v4] = { x: centerX - 60, y: centerY + 60, labelAnchor: "bottom" };
            } else {
              positions[v1] = { x: centerX - 40, y: centerY - 60, labelAnchor: "top" };
              positions[v2] = { x: centerX + 40, y: centerY - 60, labelAnchor: "top" };
              positions[v3] = { x: centerX + 90, y: centerY + 60, labelAnchor: "bottom" };
              positions[v4] = { x: centerX - 90, y: centerY + 60, labelAnchor: "bottom" };
            }
          } 

          else if (figureType === "quadrilateral" && figure?.subtype === "kite") {
            // Genuine kite shape: A and C on the vertical axis of symmetry,
            // B and D reflected across it (same x-distance from the axis,
            // mirrored), so AB=AD and CB=CD hold by construction.
            positions[v1] = { x: centerX, y: centerY - 80, labelAnchor: "top" };       // A (top)
            positions[v2] = { x: centerX + 70, y: centerY - 10, labelAnchor: "right" }; // B (right)
            positions[v3] = { x: centerX, y: centerY + 70, labelAnchor: "bottom" };     // C (bottom)
            positions[v4] = { x: centerX - 70, y: centerY - 10, labelAnchor: "left" };  // D (left, mirrored from B)
          }

          else if (figureType === "quadrilateral" && figure?.subtype === "cyclic") {
            const RADIUS = radius;
            const angles = [100, 20, -70, -160];
            vertexIds.forEach((vid, i) => {
              const rad = (angles[i] * Math.PI) / 180;
              positions[vid] = {
                x: centerX + Math.cos(rad) * RADIUS,
                y: centerY - Math.sin(rad) * RADIUS,
                labelAnchor: "auto",
              };
            });

            for (let i = 0; i < vertexIds.length; i++) {
              const from = vertexIds[i], to = vertexIds[(i + 1) % vertexIds.length];
              const fromLetter = from.replace("point_", ""), toLetter = to.replace("point_", "");
              const segId = `segment_${fromLetter}${toLetter}`;
              const exists = segments.some(
                (s) => (s.start === from && s.end === to) || (s.start === to && s.end === from) || s.id === segId
              );
              if (!exists) segments.push({ id: segId, type: "segment", start: from, end: to });
            }
          }
          else {
            positions[v1] = { x: centerX - 20, y: centerY - 70, labelAnchor: "top" };
            positions[v2] = { x: centerX + 80, y: centerY - 20, labelAnchor: "right" };
            positions[v3] = { x: centerX + 20, y: centerY + 70, labelAnchor: "bottom" };
            positions[v4] = { x: centerX - 80, y: centerY + 20, labelAnchor: "left" };
          }

          for (let i = 0; i < 4; i++) {
            const from = vertexIds[i];
            const to = vertexIds[(i + 1) % 4];
            const fromLetter = from.replace("point_", "");
            const toLetter = to.replace("point_", "");
            const segId = `segment_${fromLetter}${toLetter}`;
            const exists = segments.some(
              (s) => (s.start === from && s.end === to) || (s.start === to && s.end === from) || s.id === segId
            );
            if (!exists) {
              segments.push({ id: segId, type: "segment", start: from, end: to });
            }
          }
        }
        // --------------------------------------------------
        // LIGHTWEIGHT PROPORTIONAL NUDGE (runs for any subtype; only takes
        // effect when the JSON actually provides two independently different
        // half-diagonal values — e.g. rhombus's AE/BE. For parallelogram/
        // rectangle/square, where only one diagonal's length is typically
        // given (or diagonals are equal by definition), this naturally
        // finds nothing usable and leaves the fixed layout untouched.)
        // --------------------------------------------------
        if (hasParallelogramDiagonalsFeature) {
          const nudgeDiagRel = relationships.find((r) => r.type === "intersect_at");
          const nudgeCenterId = nudgeDiagRel?.target;
          const [nudgeDiagId1, nudgeDiagId2] = nudgeDiagRel?.elements || [];

          if (nudgeCenterId && nudgeDiagId1 && nudgeDiagId2) {
            const ne1 = getSegmentEndpoints({ id: nudgeDiagId1 }, points);
            const ne2 = getSegmentEndpoints({ id: nudgeDiagId2 }, points);

            if (ne1 && ne2) {
              const val1 = parseFloat(
                getSegmentValueBetween(relationships, segments, ne1.firstId, nudgeCenterId)
              );
              const val2 = parseFloat(
                getSegmentValueBetween(relationships, segments, ne2.firstId, nudgeCenterId)
              );

              // Only nudge if BOTH values exist, are numeric, and are actually
              // different (a near-1 ratio means "no meaningful signal to act on"
              // — e.g. parallelogram's AO/OC being equal by definition, which
              // should stay on the fixed generic layout, not get "corrected"
              // toward a ratio of 1 that's already true).
              if (
                Number.isFinite(val1) && Number.isFinite(val2) &&
                val1 > 0 && val2 > 0 &&
                Math.abs(val1 - val2) > 0.01
              ) {
                const rawRatio = val1 / val2;
                const ratio = Math.max(0.4, Math.min(2.5, rawRatio));

                const cx = vertexIds.reduce((sum, vid) => sum + positions[vid].x, 0) / 4;
                const cy = vertexIds.reduce((sum, vid) => sum + positions[vid].y, 0) / 4;

                const A = positions[ne1.firstId];
                const B = positions[ne2.firstId];

                const halfAC = Math.hypot(A.x - cx, A.y - cy);
                const halfBD = Math.hypot(B.x - cx, B.y - cy);
                const geoMean = Math.sqrt(halfAC * halfBD);

                const newHalfAC = geoMean * Math.sqrt(ratio);
                const newHalfBD = geoMean / Math.sqrt(ratio);

                const scaleAC = newHalfAC / halfAC;
                const scaleBD = newHalfBD / halfBD;

                [ne1.firstId, ne1.secondId].forEach((vid) => {
                  const p = positions[vid];
                  positions[vid] = { ...p, x: cx + (p.x - cx) * scaleAC, y: cy + (p.y - cy) * scaleAC };
                });

                [ne2.firstId, ne2.secondId].forEach((vid) => {
                  const p = positions[vid];
                  positions[vid] = { ...p, x: cx + (p.x - cx) * scaleBD, y: cy + (p.y - cy) * scaleBD };
                });
              }
            }
          }

          // --------------------------------------------------
          // EXISTING CODE — unchanged, now runs against the (possibly nudged)
          // vertex positions above.
          // --------------------------------------------------
          const diagRels = relationships.filter((r) => r.type === "intersect_at");
          diagRels.forEach((rel) => {
            const [diagId1, diagId2] = rel.elements || [];
            const targetId = rel.target;
            if (!diagId1 || !diagId2 || !targetId) return;

            const e1 = getSegmentEndpoints({ id: diagId1 }, points);
            const e2 = getSegmentEndpoints({ id: diagId2 }, points);
            if (!e1 || !e2) return;

            const A1 = positions[e1.firstId], B1 = positions[e1.secondId];
            const A2 = positions[e2.firstId], B2 = positions[e2.secondId];
            if (!A1 || !B1 || !A2 || !B2) return;

            const intersection = lineIntersection(A1, B1, A2, B2);
            if (intersection) {
              const isPerpendicularDiagonals = relationships.some(
                (r) => r.type === "perpendicular_to" && r.elements?.includes(diagId1) && r.elements?.includes(diagId2)
              );
              positions[targetId] = {
                ...intersection,
                labelAnchor: isPerpendicularDiagonals ? "left" : "auto",
              };
            }

            [
              { id: diagId1, start: e1.firstId, end: e1.secondId },
              { id: diagId2, start: e2.firstId, end: e2.secondId },
            ].forEach(({ id, start, end }) => {
              let segObj = segments.find((s) => s.id === id);
              if (segObj) {
                segObj.start = start;
                segObj.end = end;
                segObj.type = "segment";
              } else {
                segments.push({ id, type: "segment", start, end });
              }
            });
          });
        }
        else if (hasParallelogramAltitudeFeature) {
          // --- Pattern A: foot lies_on the base segment directly (e.g. PQRS) ---
          relationships
            .filter((r) => r.type === "lies_on")
            .forEach((rel) => {
              const footId = rel.element_id;
              const baseSideId = rel.target_segment;
              if (!footId || !baseSideId) return;

              const baseEndpoints = getSegmentEndpoints({ id: baseSideId }, points);
              if (!baseEndpoints) return;
              const A = positions[baseEndpoints.firstId];
              const B = positions[baseEndpoints.secondId];
              if (!A || !B) return;

              const segRel = relationships.find(
                (r) => r.type === "forms_segment" && r.elements?.includes(footId)
              );
              const vertexId = segRel?.elements?.find((pid) => pid !== footId);
              const vertex = vertexId ? positions[vertexId] : null;
              if (!vertex) return;

              positions[footId] = { ...footOfPerpendicular(vertex, A, B), labelAnchor: "auto" };

              if (vertexId) {
                const altSegRel = relationships.find(
                  (r) => r.type === "forms_segment" && r.elements?.includes(footId) && r.elements?.includes(vertexId)
                );
                if (altSegRel?.target) {
                  let seg = segments.find((s) => s.id === altSegRel.target);
                  if (seg) {
                    seg.start = footId;
                    seg.end = vertexId;
                    seg.type = "segment";
                  } else {
                    segments.push({ id: altSegRel.target, type: "segment", start: footId, end: vertexId });
                  }
                }
              }
            });

          // --- Pattern B: foot is_on_line (extended base), vertex/base named
          //     explicitly via is_altitude_from / is_altitude_to_base (e.g. LMNP) ---
          relationships
            .filter((r) => r.type === "is_altitude_from")
            .forEach((rel) => {
              const altitudeSegId = rel.elements?.[0];
              const vertexId = rel.target;
              if (!altitudeSegId || !vertexId) return;

              const baseRel = relationships.find(
                (r) => r.type === "is_altitude_to_base" && r.elements?.includes(altitudeSegId)
              );
              const baseSideId = baseRel?.target;
              if (!baseSideId) return;

              const baseEndpoints = getSegmentEndpoints({ id: baseSideId }, points);
              const vertex = positions[vertexId];
              if (!baseEndpoints || !vertex) return;

              const A = positions[baseEndpoints.firstId];
              const B = positions[baseEndpoints.secondId];
              if (!A || !B) return;

              const formsSegRel = relationships.find(
                (r) => r.type === "forms_segment" && r.target === altitudeSegId
              );
              const footId = formsSegRel?.elements?.find((pid) => pid !== vertexId);
              if (!footId) return;

              positions[footId] = { ...footOfPerpendicular(vertex, A, B), labelAnchor: "auto" };

              let seg = segments.find((s) => s.id === altitudeSegId);
              if (seg) {
                seg.start = footId;
                seg.end = vertexId;
                seg.type = "segment";
              } else {
                segments.push({ id: altitudeSegId, type: "segment", start: footId, end: vertexId });
              }
            });
        }

        else if (hasTrapezoidMedianFeature) {
          relationships
            .filter((r) => r.type === "midpoint_of")
            .forEach((rel) => {
              const pointId = rel.element_id;
              const sideId = rel.target_segment;
              if (!pointId || !sideId) return;

              const endpoints = getSegmentEndpoints({ id: sideId }, points);
              if (!endpoints) return;
              const A = positions[endpoints.firstId];
              const B = positions[endpoints.secondId];
              if (!A || !B) return;

              positions[pointId] = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2, labelAnchor: "auto" };
            });
        }

        else if (hasTrapezoidDiagonalProportionalityFeature) {
          const diagRels = relationships.filter((r) => r.type === "intersect_at");
          diagRels.forEach((rel) => {
            const [diagId1, diagId2] = rel.elements || [];
            const targetId = rel.target;
            if (!diagId1 || !diagId2 || !targetId) return;

            const e1 = getSegmentEndpoints({ id: diagId1 }, points);
            const e2 = getSegmentEndpoints({ id: diagId2 }, points);
            if (!e1 || !e2) return;

            const A1 = positions[e1.firstId], B1 = positions[e1.secondId];
            const A2 = positions[e2.firstId], B2 = positions[e2.secondId];
            if (!A1 || !B1 || !A2 || !B2) return;

            const intersection = lineIntersection(A1, B1, A2, B2);
            if (intersection) positions[targetId] = { ...intersection, labelAnchor: "auto" };

            [
              { id: diagId1, start: e1.firstId, end: e1.secondId },
              { id: diagId2, start: e2.firstId, end: e2.secondId },
            ].forEach(({ id, start, end }) => {
              let segObj = segments.find((s) => s.id === id);
              if (segObj) { segObj.start = start; segObj.end = end; segObj.type = "segment"; }
              else segments.push({ id, type: "segment", start, end });
            });
          });
        }

        else if (hasQuadrilateralDiagonalsFeature) {
        // identical body to hasTrapezoidDiagonalProportionalityFeature
        const diagRels = relationships.filter((r) => r.type === "intersect_at");
        diagRels.forEach((rel) => {
          const [diagId1, diagId2] = rel.elements || [];
          const targetId = rel.target;
          if (!diagId1 || !diagId2 || !targetId) return;
          const e1 = getSegmentEndpoints({ id: diagId1 }, points);
          const e2 = getSegmentEndpoints({ id: diagId2 }, points);
          if (!e1 || !e2) return;
          const A1 = positions[e1.firstId], B1 = positions[e1.secondId];
          const A2 = positions[e2.firstId], B2 = positions[e2.secondId];
          if (!A1 || !B1 || !A2 || !B2) return;
          const intersection = lineIntersection(A1, B1, A2, B2);
          if (intersection) positions[targetId] = { ...intersection, labelAnchor: "auto" };
          [
            { id: diagId1, start: e1.firstId, end: e1.secondId },
            { id: diagId2, start: e2.firstId, end: e2.secondId },
          ].forEach(({ id, start, end }) => {
            let segObj = segments.find((s) => s.id === id);
            if (segObj) { segObj.start = start; segObj.end = end; segObj.type = "segment"; }
            else segments.push({ id, type: "segment", start, end });
          });
        });
      }

        else if (hasQuadrilateralAreaSplitFeature) {
          const perpRels = relationships.filter((r) => r.type === "perpendicular_to");
          
          const SPLIT_RATIOS = [0.30, 0.70];
          let splitIndex = 0;

          perpRels.forEach((rel) => {
            const [heightSegId, baseSegId] = rel.elements || [];
            if (!heightSegId || !baseSegId) return;

            const heightSegRel = relationships.find(
              (r) => r.type === "forms_segment" && r.target === heightSegId
            );
            const [ptId1, ptId2] = heightSegRel?.elements || [];
            if (!ptId1 || !ptId2) return;

            const footId = [ptId1, ptId2].find((pid) =>
              relationships.some(
                (r) => r.type === "lies_on" && (r.element_id === pid || r.elements?.[0] === pid) &&
                  (r.target_segment === baseSegId || r.target === baseSegId)
              )
            );
            const vertexId = [ptId1, ptId2].find((pid) => pid !== footId);
            if (!footId || !vertexId) return;

            const baseEndpoints = getSegmentEndpoints({ id: baseSegId }, points);
            if (!baseEndpoints) return;
            const B = positions[baseEndpoints.firstId];
            const D = positions[baseEndpoints.secondId];
            if (!B || !D) return;

            const heightVal = parseFloat(
              getSegmentValueBetween(relationships, segments, vertexId, footId)
            );
            if (!Number.isFinite(heightVal)) return;

            const t = SPLIT_RATIOS[splitIndex % SPLIT_RATIOS.length];
            splitIndex += 1;

            const footPos = {
              x: B.x + (D.x - B.x) * t,
              y: B.y + (D.y - B.y) * t,
            };
            positions[footId] = { ...footPos, labelAnchor: "auto" };

            const dx = D.x - B.x, dy = D.y - B.y;
            const len = Math.hypot(dx, dy) || 1;
            const perpX = -dy / len;
            const perpY = dx / len;

            const side = splitIndex === 1 ? -1 : 1;

            positions[vertexId] = {
              x: footPos.x + perpX * heightVal * side * 10,
              y: footPos.y + perpY * heightVal * side * 10,
              labelAnchor: "auto",
            };
          });

          // ============================================================
          // ⬇️ ADD THIS NEW BLOCK HERE — after perpRels.forEach finishes ⬇️
          // Auto-draw the 4 quadrilateral sides (AB, BC, CD, DA) since this
          // JSON only ever specifies the diagonal BD and the two height
          // segments, never the actual outline.
          // ============================================================
          for (let i = 0; i < vertexIds.length; i++) {
            const from = vertexIds[i];
            const to = vertexIds[(i + 1) % vertexIds.length];
            const fromLetter = from.replace("point_", "");
            const toLetter = to.replace("point_", "");
            const segId = `segment_${fromLetter}${toLetter}`;
            const exists = segments.some(
              (s) =>
                (s.start === from && s.end === to) ||
                (s.start === to && s.end === from) ||
                s.id === segId
            );
            if (!exists) {
              segments.push({ id: segId, type: "segment", start: from, end: to });
            }
          }
          // ⬆️ END NEW BLOCK ⬆️
        }

        else if (hasKiteAxisFeature) {
          const diagRel = relationships.find((r) => r.type === "intersect_at");
          if (diagRel) {
            const [diagId1, diagId2] = diagRel.elements || [];
            const targetId = diagRel.target;

            const e1 = getSegmentEndpoints({ id: diagId1 }, points);
            const e2 = getSegmentEndpoints({ id: diagId2 }, points);

            if (e1 && e2 && targetId) {
              const A1 = positions[e1.firstId], B1 = positions[e1.secondId];
              const A2 = positions[e2.firstId], B2 = positions[e2.secondId];

              if (A1 && B1 && A2 && B2) {
                const intersection = lineIntersection(A1, B1, A2, B2);
                if (intersection) {
                  positions[targetId] = { ...intersection, labelAnchor: "auto" };
                }

                // Draw both diagonals as full segments, vertex-to-vertex.
                [
                  { id: diagId1, start: e1.firstId, end: e1.secondId },
                  { id: diagId2, start: e2.firstId, end: e2.secondId },
                ].forEach(({ id, start, end }) => {
                  let segObj = segments.find((s) => s.id === id);
                  if (segObj) { segObj.start = start; segObj.end = end; segObj.type = "segment"; }
                  else segments.push({ id, type: "segment", start, end });
                });
              }
            }
          }
        }

        else if (hasCyclicQuadrilateralFeature) {
        // Stamp the already-placed circle element with center/radius, reusing
        // the same passes_through pattern as triangle's circumcircle.
        const passesRel = relationships.find((r) => r.type === "passes_through");
        if (passesRel?.elements?.[0]) {
          const circleId = passesRel.elements[0];
          const circleObj = circles.find((c) => c.id === circleId);
          const pts = (passesRel.target || []).map((pid) => positions[pid]).filter(Boolean);
          if (circleObj && pts.length >= 1) {
            // Center/radius are already fixed by our layout (centerX, centerY, RADIUS)
            // — but compute from actual point positions for robustness in case the
            // layout constants ever change.
            const avgX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
            const avgY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
            const avgR = pts.reduce((s, p) => s + Math.hypot(p.x - avgX, p.y - avgY), 0) / pts.length;
            circleObj.__renderCenter = { x: avgX, y: avgY };
            circleObj.__renderRadius = avgR;
          }
        }

        // Q2-style exterior angle: extend a side past a vertex to a new point,
        // using is_collinear instead of triangle's extends_side.

        relationships
          .filter((r) => r.type === "collinear")
          .forEach((rel) => {
            const [fromId, pivotId, newPointId] = rel.elements || [];
            if (!fromId || !pivotId || !newPointId) return;
            const from = positions[fromId];
            const pivot = positions[pivotId];
            if (!from || !pivot) return;

            const dx = pivot.x - from.x, dy = pivot.y - from.y;
            const len = Math.hypot(dx, dy);
            if (len < 1e-6) return;

            const EXTENSION_LENGTH = 50;
            positions[newPointId] = {
              x: pivot.x + (dx / len) * EXTENSION_LENGTH,
              y: pivot.y + (dy / len) * EXTENSION_LENGTH,
              labelAnchor: "auto",
            };

            const segId = `segment_${pivotId.replace("point_","")}${newPointId.replace("point_","")}`;
            let segObj = segments.find((s) => s.id === segId);
            if (segObj) { segObj.start = pivotId; segObj.end = newPointId; segObj.type = "segment"; }
            else segments.push({ id: segId, type: "segment", start: pivotId, end: newPointId });
          });
      }


        // ==================================================
        // ⬇️ ADD THE NEW BLOCK RIGHT HERE ⬇️
        // Process ALL forms_segment relationships generically, mutating any
        // declared segment placeholder with real start/end now that every
        // point (vertices + any feature-derived point like O/T/E/K) has a
        // position. Runs LAST, after every feature branch above, since some
        // segments (e.g. segment_ao) need a feature-derived point (point_o)
        // that only exists once its branch has already run.
        // ==================================================

        relationships
        .filter((r) => r.type === "forms_angle")
        .forEach((rel) => {
          const [firstId, vertexId, secondId] = rel.elements || [];
          const angleId = rel.target;
          if (!firstId || !vertexId || !secondId || !angleId) return;

          const firstLabel = points[firstId]?.label;
          const vertexLabel = points[vertexId]?.label;
          const secondLabel = points[secondId]?.label;
          if (!firstLabel || !vertexLabel || !secondLabel) return;

          let angleObj = angles.find((a) => a.id === angleId);
          if (angleObj) {
            angleObj.elements = [firstLabel, vertexLabel, secondLabel];
          } else {
            angles.push({ id: angleId, type: "angle", elements: [firstLabel, vertexLabel, secondLabel] });
          }
        });
        relationships
          .filter((r) => r.type === "forms_segment")
          .forEach((rel) => {
            const [ptA, ptB] = rel.elements || [];
            const segId = rel.target;
            if (!ptA || !ptB || !segId) return;
            if (!positions[ptA] || !positions[ptB]) return;

            let segObj = segments.find((s) => s.id === segId);
            if (segObj) {
              segObj.start = ptA;
              segObj.end = ptB;
              segObj.type = "segment";
            } else {
              segments.push({ id: segId, type: "segment", start: ptA, end: ptB });
            }
          });

          // --------------------------------------------------
          // ORPHANED SEGMENT FALLBACK — some questions give sub-segment values
          // (e.g. segment_pt, segment_tr) with no forms_segment relationship at
          // all. Last resort: resolve directly from the id's two-letter pattern
          // against point labels, once every point has a real position.
          // --------------------------------------------------
          segments.forEach((seg) => {
            if (seg.start && seg.end) return;
            const match = /^segment_([a-z])([a-z])$/i.exec(seg.id || "");
            if (!match) return;
            const [, letterA, letterB] = match;
            const findByLabel = (letter) =>
              Object.keys(points).find(
                (pid) => String(points[pid]?.label || "").toLowerCase() === letter.toLowerCase()
              );
            const idA = findByLabel(letterA);
            const idB = findByLabel(letterB);
            if (idA && idB && positions[idA] && positions[idB]) {
              seg.start = idA;
              seg.end = idB;
            }
          });
        // ==================================================
        // ⬆️ END OF NEW BLOCK ⬆️
        // ==================================================
        fitPositionsToBounds( positions, { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY }, circles);
      }


      /*
      * --------------------------------------------------
      * FEATURE DETECTION HELPER (EXPLICIT + FALLBACK)
      * --------------------------------------------------
      */

      const hasPoint = (id) => Boolean(points[id]);
      const hasParallelFeature =
        feature === "parallel_segment" ||
        relationships.some((r) => r.type === "parallel_to");

      const hasAltitudeFeature =
        feature === "altitude" ||
        relationships.some((r) => r.type === "is_altitude" || r.type === "altitude");

      const hasMedianFeature =
        feature === "median" ||
        relationships.some((r) => r.type === "median_of");

      const hasBisectorFeature =
        feature === "angle_bisector" ||
        relationships.some((r) => r.type === "bisects_angle" || r.type === "angle_bisector");

      const hasIncircleFeature =
        feature === "incircle" ||
        relationships.some(
          (r) => r.type === "is_incenter" || r.type === "is_tangency_point_incircle"
        );

      const hasExcircleFeature =
      feature === "excircle" ||
      (relationships.some((r) => r.type === "is_center_of") &&
        relationships.some((r) => r.type === "is_tangent_to"));


      const hasCircumcenterFeature =
      feature === "circumscribed_circle" ||
      relationships.some((r) => r.type === "is_perpendicular_bisector_of") ||
      (relationships.some((r) => r.type === "is_center_of") &&
        relationships.some((r) => r.type === "passes_through"));
        

      const hasExteriorFeature =
        feature === "exterior_angle" ||
        relationships.some((r) => r.type === "exterior_angle");

      const hasCevianFeature = 
      feature === "cevian_concurrency" ||
      feature === "transversal" ||
      relationships.some(
        (r) =>
          r.type === "concurrent_at" ||
          r.type === "is_on_extension_of_segment" ||
          r.type === "forms_ratio"
      );
      
      // 1. Relational & Feature Detection Signals
      const mainTriangleRel = relationships.find((r) => r.type === "forms_triangle");
      const mainVertexIds = mainTriangleRel?.elements || pointIds.slice(0, 3);

      const bisectorRel = relationships.find(
        (r) => r.type === "bisects_angle" || r.type === "angle_bisector"
      );
      const bisectorApexId = bisectorRel?.target_angle_vertex;

      const isSymmetric =
        figure?.subtype === "isosceles" ||
        figure?.subType === "isosceles" ||
        figure?.subtype === "equilateral" ||
        figure?.subType === "equilateral" ||
        relationships.some(
          (r) => r.type === "congruent_segments" || r.type === "equal_length" || r.type === "equal_sides"
        );

      const isObtuse = relationships.some((r) => r.type === "is_obtuse_angle");

      // ==================================================
      // MOVED UP: vertex ordering must happen BEFORE the anchor block,
      // since the isosceles branch below needs topId to look up the
      // apex angle. Previously this lived inside the
      // `if (figure?.type === "triangle" ...)` block further down,
      // which ran AFTER the anchor block tried to use topId.
      // ==================================================
      let orderedVertexIds = mainVertexIds;
      if (bisectorApexId && mainVertexIds.includes(bisectorApexId)) {
        const others = mainVertexIds.filter((id) => id !== bisectorApexId);
        orderedVertexIds = [bisectorApexId, ...others];
      }

      let topId = orderedVertexIds[0];
      let bottomLeftId = orderedVertexIds[1];
      let bottomRightId = orderedVertexIds[2];

      // Coordinate Anchors
      let apexX, apexY, baseLeftX, baseLeftY, baseRightX, baseRightY;

      if (isObtuse) {
        apexY = centerY - HALF_H;
        baseLeftY = centerY + HALF_H;
        baseRightX = centerX + HALF_W;
        baseRightY = centerY + HALF_H;
        baseLeftX = centerX - HALF_W * 0.5;
        apexX = centerX - HALF_W * 1.2;
      } else {
        const ACUTE_BASE_RATIO = 1.5;
        let halfBase = Math.min(HALF_W, HALF_H * ACUTE_BASE_RATIO);
        let halfHeight = HALF_H; // default vertical half-span

        const isEquilateral =
          figure?.subtype === "equilateral" || figure?.subType === "equilateral";

        if (isEquilateral) {
          const idealHalfBase = (HALF_H * 2) / Math.sqrt(3);
          halfBase = Math.min(HALF_W, idealHalfBase);
        } else if (isSymmetric) {
          const apexAngleRel = relationships.find(
            (r) =>
              r.type === "forms_angle" &&
              r.elements?.[1] === topId &&
              r.target &&
              !isNaN(parseFloat(angles.find((a) => a.id === r.target)?.value))
          );
          const apexAngleDeg = apexAngleRel
            ? parseFloat(angles.find((a) => a.id === apexAngleRel.target)?.value)
            : null;

          if (apexAngleDeg > 0 && apexAngleDeg < 180) {
            // ratio = halfBase / height, exact from the stated angle.
            // MAXIMIZE FOOTPRINT: use the full available width for the
            // base, then derive height from that — rather than fixing
            // height and shrinking the base, which produced a
            // sliver-thin triangle for narrow apex angles. The resulting
            // height may exceed HALF_H; fitPositionsToBounds rescales
            // the whole figure uniformly afterward, which preserves the
            // angle (uniform scale doesn't distort angles), so this is
            // safe.
            const ratio = Math.tan((apexAngleDeg / 2) * (Math.PI / 180));
            halfBase = HALF_W;
            halfHeight = ratio > 0 ? halfBase / ratio : HALF_H;
          }
        }

        const apexOffset = isSymmetric ? 0 : halfBase * 0.25;

        apexX = centerX + apexOffset;
        apexY = centerY - halfHeight;
        baseLeftX = centerX - halfBase;
        baseLeftY = centerY + halfHeight;
        baseRightX = centerX + halfBase;
        baseRightY = centerY + halfHeight;
      }

 
      /* --------------------------------------------------
        * RIGHT TRIANGLE DETECTION
        * -------------------------------------------------- */

        const rightAngleInfo = (angles || [])
          .filter(
            (angle) =>
              angle?.type === "angle" &&
              Number(angle?.value) === 90
          )
          .map((angle) => {
            const vertexRel = relationships.find(
              (r) =>
                r?.type === "at_vertex" &&
                r?.target === angle.id
            );

            return {
              angle,
              vertexId: vertexRel?.elements?.[0],
            };
          })
          .find((item) => mainVertexIds.includes(item.vertexId));

        const hasRightTriangle = Boolean(rightAngleInfo);
      /*
      * --------------------------------------------------
      * TRIANGLE FAMILY
      * --------------------------------------------------
      */
      // ==================================================
      // SHAPE-SPECIFIC ROUTING
      // ==================================================
      if (figure?.type === "triangle") {

            /* --------------------------------------------------
            * SUBTYPE: GENERAL / ACUTE / OBTUSE TRIANGLE POSITIONS
            * -------------------------------------------------- */
            const leftSeg = findSegmentBetween(segments, points, topId, bottomLeftId);
            const rightSeg = findSegmentBetween(segments, points, topId, bottomRightId);
            const leftVal = leftSeg?.value ? parseFloat(leftSeg.value) : null;
            const rightVal = rightSeg?.value ? parseFloat(rightSeg.value) : null;

            if (leftVal > 0 && rightVal > 0) {
              apexX = solveApexXForRatio({
                baseLeftX,
                baseRightX,
                apexY,
                baseY: baseLeftY,
                targetRatio: leftVal / rightVal,
              });
            }

            positions[topId] = { x: apexX, y: apexY, labelAnchor: "top" };
            positions[bottomLeftId] = { x: baseLeftX, y: baseLeftY, labelAnchor: "bottom-left" };
            positions[bottomRightId] = { x: baseRightX, y: baseRightY, labelAnchor: "bottom-right" };


        // 2. Feature Routing

        if (hasRightTriangle) {

            /* --------------------------------------------------
            * 1. FIND RIGHT-ANGLE VERTEX
            * -------------------------------------------------- */

            const rightAngleRelationship =
              rightAngleInfo
                ? relationships.find(
                    (relationship) =>
                      relationship.type === "at_vertex" &&
                      relationship.target === rightAngleInfo.angle.id &&
                      Array.isArray(relationship.elements) &&
                      relationship.elements.length > 0
                  )
                : null;


            const rightVertexId = rightAngleRelationship?.elements?.[0] || mainVertexIds[1];

            /* --------------------------------------------------
            * 2. FIND HYPOTENUSE VERTICES
            * -------------------------------------------------- */

            const hypotenuseVertices = mainVertexIds.filter((id) => id !== rightVertexId);
            const v1Id = hypotenuseVertices[0] || mainVertexIds[0];
            const v2Id = hypotenuseVertices[1] || mainVertexIds[2];


            /* --------------------------------------------------
            * 3. PLACE RIGHT-ANGLE VERTEX
            * -------------------------------------------------- */

            positions[rightVertexId] = {x: baseLeftX, y: baseLeftY,labelAnchor: "bottom-left"};

            /* -------------------------------------------------
            * 4. PLACE HYPOTENUSE ENDPOINTS
            * -------------------------------------------------- */
            positions[v1Id] = {x: baseLeftX, y: apexY, labelAnchor: "top"};
            positions[v2Id] = {x: baseRightX, y: baseRightY, labelAnchor: "bottom-right"};


            /* --------------------------------------------------
            * 5. FIND ALTITUDE FOOT
            * -------------------------------------------------- */

            const onSegmentRel =
              relationships.find(
                (relationship) => relationship.type === "is_on_segment" &&
                  Array.isArray( relationship.elements) &&
                  relationship.elements.length > 0
              );


            const footPointId = onSegmentRel?.elements?.[0] ||
             pointIds.find((id) =>!mainVertexIds.includes(id));


            /* --------------------------------------------------
            * 6. PROJECT ALTITUDE FOOT
            * -------------------------------------------------- */

            if (footPointId) {
              const H1 =  positions[v1Id];
              const H2 =  positions[v2Id];
              const Corner =  positions[rightVertexId];

              if (H1 && H2 && Corner) {
                const footPos =  projectPointToLine( Corner.x,Corner.y, H1.x,H1.y,H2.x,H2.y);
                positions[footPointId] = {x: footPos.x, y: footPos.y, labelAnchor: "auto",};
              }
            }
          }

        else if (hasParallelFeature) {
          // 1. Find the two points that lie ON the sides (D/E, S/T, M/N)
          //    via is_on_segment relationships, instead of guessing by
          //    array position (pointIds[3]/[4]) — robust to point order.
          const apexLabel = points[topId]?.label?.toLowerCase();
          const leftLabel = points[bottomLeftId]?.label?.toLowerCase();
          const rightLabel = points[bottomRightId]?.label?.toLowerCase();

          const findPointOnSide = (vLabel1, vLabel2) => {
            const rel = relationships.find((r) => {
              if (r.type !== "is_on_segment") return false;
              const target = String(r.target || "").toLowerCase();
              return (
                target === `segment_${vLabel1}${vLabel2}` ||
                target === `segment_${vLabel2}${vLabel1}`
              );
            });
            return rel?.elements?.[0] || null;
          };

          const leftIntersectId = findPointOnSide(apexLabel, leftLabel) || pointIds[3] || "point_d";
          const rightIntersectId = findPointOnSide(apexLabel, rightLabel) || pointIds[4] || "point_e";

          const clean = (v) => v == null ? null : String(v).replace(/\$/g, "").trim();

          const c1 = clean(getSegmentValueBetween(relationships, segments, topId, leftIntersectId));
          const c2 = clean(getSegmentValueBetween(relationships, segments, leftIntersectId, bottomLeftId));
          const c3 = clean(getSegmentValueBetween(relationships, segments, topId, rightIntersectId));
          const c4 = clean(getSegmentValueBetween(relationships, segments, rightIntersectId, bottomRightId));

          const isSymbolic = [c1, c2, c3, c4].some(
            (v) => v && /[a-zA-Z]/.test(v)
          );

          let nearLeft = null, farLeft = null, nearRight = null, farRight = null;

          if (isSymbolic && c1 && c2 && c3 && c4) {
            // e.g. Q3: XM=x, MY=x-2, XN=x+2, NZ=x-1 — solve BPT's own
            // constraint (near/far equal on both sides) for the variable,
            // then substitute back into every expression.
            const varMatch = [c1, c2, c3, c4]
              .map((v) => /[a-zA-Z]/.exec(v))
              .find(Boolean);
            const variable = varMatch ? varMatch[0] : "x";

            try {
              // near1*far2 = far1*near2  (cross-multiplied proportion)
              const solved = solveEquation( `(${c1})*(${c4}) = (${c2})*(${c3})`, variable);
              if (solved !== null) {
                const vars = { [variable]: solved };
                nearLeft = evaluateExpression(c1, vars);
                farLeft = evaluateExpression(c2, vars);
                nearRight = evaluateExpression(c3, vars);
                farRight = evaluateExpression(c4, vars);
              }
            } catch (e) {
              // leave values null -> falls back to DEFAULT_RATIO below
            }
          } else {
            const num = (v) => {
              const n = parseFloat(v);
              return Number.isFinite(n) ? n : null;
            };
            nearLeft = num(c1);
            farLeft = num(c2);
            nearRight = num(c3);
            farRight = num(c4);
          }

          // 3. Per-side fraction of apex->mid distance along the full side.
          // A parallel-to-base line REQUIRES both ratios to be equal (BPT) —
          // so if only one side's ratio is actually known (e.g. Q1, where
          // EC is the unknown being solved for), use that same ratio for
          // BOTH sides. Never mix a computed ratio with an unrelated
          // default — that's what broke DE || BC.
          const DEFAULT_RATIO = 0.4;

          const knownLeftRatio =
            nearLeft > 0 && farLeft > 0 ? nearLeft / (nearLeft + farLeft) : null;
          const knownRightRatio =
            nearRight > 0 && farRight > 0
              ? nearRight / (nearRight + farRight)
              : null;

          const sharedRatio = knownLeftRatio ?? knownRightRatio ?? DEFAULT_RATIO;

          const leftRatio = sharedRatio;
          const rightRatio = sharedRatio;

          // 4. If BOTH full side lengths are known, scale apexX so the two
          //    drawn sides are actually proportional (fixes "PS looks
          //    bigger than PT" — same bisection approach as the earlier
          //    bisector-side fix).
          const totalLeft = nearLeft > 0 && farLeft > 0 ? nearLeft + farLeft : null;
          const totalRight = nearRight > 0 && farRight > 0 ? nearRight + farRight : null;

          if (totalLeft && totalRight) {
            apexX = solveApexXForRatio({
              baseLeftX,
              baseRightX,
              apexY,
              baseY: baseLeftY,
              targetRatio: totalLeft / totalRight,
            });
            positions[topId] = { ...positions[topId], x: apexX };
          }

          positions[leftIntersectId] = {
            x: apexX + leftRatio * (baseLeftX - apexX),
            y: apexY + leftRatio * (baseLeftY - apexY),
            labelAnchor: "left",
          };

          positions[rightIntersectId] = {
            x: apexX + rightRatio * (baseRightX - apexX),
            y: apexY + rightRatio * (baseRightY - apexY),
            labelAnchor: "right",
          };
        }
        
        else if (hasBisectorFeature || bisectorRel) {
        // Determine the bisector point lying on the base
        const bisectorPointId =
          pointIds.find(
            (id) => id !== topId && id !== bottomLeftId && id !== bottomRightId
          ) || "point_s";

        let ratio = 0.5; // Default to exact midpoint (ideal for Isosceles)

        // Calculate ratio dynamically if side segment values are present
        const segmentList = Object.values(segments || {});
        const leftSide = segmentList.find(
          (s) => s.value && (s.id?.includes(topId) || s.label?.includes(points[topId]?.label))
        );
        const rightSide = segmentList.find(
          (s) =>
            s.value &&
            s !== leftSide &&
            (s.id?.includes(topId) || s.label?.includes(points[topId]?.label))
        );

        if (leftSide?.value && rightSide?.value) {
          const val1 = parseFloat(leftSide.value);
          const val2 = parseFloat(rightSide.value);
          if (val1 > 0 && val2 > 0) {
            ratio = val1 / (val1 + val2);
          }
        }

        // Interpolate bisector point on the base segment
        positions[bisectorPointId] = {
          x: baseLeftX + ratio * (baseRightX - baseLeftX),
          y: baseLeftY + ratio * (baseRightY - baseLeftY),
          labelAnchor: "bottom",
        };
      }
        /* --------------------------------------------------
        * FEATURE: ALTITUDE / ORTHOCENTER
        * -------------------------------------------------- */
        else if (hasAltitudeFeature) {
        const altitudeRels = relationships.filter(
          (r) => r.type === "is_altitude" || r.type === "altitude"
        );

        const altitudeLines = [];

        altitudeRels.forEach((rel) => {
          const [segId, vertexId] = rel.elements;
          const vertexPos = positions[vertexId];
          if (!vertexPos) return;

          const [a, b] = mainVertexIds.filter((id) => id !== vertexId);
          const A = positions[a];
          const B = positions[b];
          if (!A || !B) return;

          const foot = footOfPerpendicular(vertexPos, A, B);
          const endpoints = getSegmentEndpoints({ id: segId }, points);
          const footId = endpoints && (endpoints.firstId === vertexId ? endpoints.secondId : endpoints.firstId);
          if (footId) positions[footId] = { x: foot.x, y: foot.y, labelAnchor: "auto" };
            altitudeLines.push({ p1: vertexPos, p2: foot });
          });

        const intersectRel = relationships.find((r) => r.type === "intersect_at");
        if (intersectRel?.target && hasPoint(intersectRel.target) && altitudeLines.length >= 2) {
          const [line1, line2] = altitudeLines;
          const ortho = intersectLines(line1.p1, line1.p2, line2.p1, line2.p2);
          if (ortho) {
            positions[intersectRel.target] = { x: ortho.x, y: ortho.y, labelAnchor: "auto" };
          }
        }
      }

        /* --------------------------------------------------
         * FEATURE: MEDIAN / CENTROID
         * -------------------------------------------------- */
        else if (hasMedianFeature) {
          const midpointOf = (A, B) => ({ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 });

          // 1. Place every midpoint from is_midpoint_of relationships, and
          //    remember each vertex->midpoint median line for later.
          const medianLines = [];

          relationships
            .filter((r) => r.type === "is_midpoint_of")
            .forEach((rel) => {
              const pointId = rel.elements?.[0];
              const endpoints = getSegmentEndpoints({ id: rel.target }, points);
              if (!pointId || !endpoints) return;

              const A = positions[endpoints.firstId];
              const B = positions[endpoints.secondId];
              if (!A || !B) return;

              const mid = midpointOf(A, B);
              positions[pointId] = { x: mid.x, y: mid.y, labelAnchor: "auto" };

              const oppositeVertex = mainVertexIds.find(
                (id) => id !== endpoints.firstId && id !== endpoints.secondId
              );
              if (oppositeVertex && positions[oppositeVertex]) {
                medianLines.push({ p1: positions[oppositeVertex], p2: mid });
              }
            });

          // 2a. THREE-MEDIAN CASE: centroid via intersect_at, same pattern
          //     as the altitude/orthocenter intersection.
          const intersectRel = relationships.find((r) => r.type === "intersect_at");
          if (intersectRel?.target && hasPoint(intersectRel.target) && medianLines.length >= 2) {
            const [l1, l2] = medianLines;
            const centroid = intersectLines(l1.p1, l1.p2, l2.p1, l2.p2);
            if (centroid) {
              positions[intersectRel.target] = { x: centroid.x, y: centroid.y, labelAnchor: "auto" };
            }
          }

          // 2b. SINGLE-MEDIAN CASE: point dividing the median in a stated
          //     ratio (e.g. centroid at 2:1 along XW). "parts" order is
          //     assumed to match "ratio" order: parts[0]:parts[1].
          const ratioRel = relationships.find((r) => r.type === "divides_segment_in_ratio");
          if (ratioRel) {
            const dividedPointId = ratioRel.elements?.[0];
           const endpoints = getSegmentEndpoints({ id: ratioRel.target }, points);
            const ratioParts = String(ratioRel.ratio || "").split(":").map(Number);

            if (
              dividedPointId &&
              endpoints &&
              positions[endpoints.firstId] &&
              positions[endpoints.secondId] &&
              ratioParts.length === 2 &&
              ratioParts.every((n) => Number.isFinite(n) && n > 0)
            ) {
              const [r1, r2] = ratioParts;
              const t = r1 / (r1 + r2); // fraction from firstId toward secondId
              const A = positions[endpoints.firstId];
              const B = positions[endpoints.secondId];

              positions[dividedPointId] = {
                x: A.x + t * (B.x - A.x),
                y: A.y + t * (B.y - A.y),
                labelAnchor: "auto",
              };
            }
          }
        }

                /* --------------------------------------------------
         * FEATURE: INCIRCLE / INCENTER / TANGENCY POINTS
         * -------------------------------------------------- */
        else if (hasIncircleFeature) {
          const A = positions[topId];
          const B = positions[bottomLeftId];
          const C = positions[bottomRightId];

          if (A && B && C) {
            const a = Math.hypot(B.x - C.x, B.y - C.y);
            const b = Math.hypot(A.x - C.x, A.y - C.y);
            const c = Math.hypot(A.x - B.x, A.y - B.y);
            const sum = a + b + c;

            const incenter = {
              x: (a * A.x + b * B.x + c * C.x) / sum,
              y: (a * A.y + b * B.y + c * C.y) / sum,
            };

            const incenterRel = relationships.find((r) => r.type === "is_incenter");
            const incenterId = incenterRel?.element_id;
            if (incenterId) {
              positions[incenterId] = { x: incenter.x, y: incenter.y, labelAnchor: "auto" };
            }

            let firstFoot = null;

            relationships
              .filter((r) => r.type === "is_tangency_point_incircle")
              .forEach((rel) => {
                const pointId = rel.elements?.[0];
                const endpoints = getSegmentEndpoints({ id: rel.side }, points);
                if (!pointId || !endpoints) return;

                const sideA = positions[endpoints.firstId];
                const sideB = positions[endpoints.secondId];
                if (!sideA || !sideB) return;

                const foot = footOfPerpendicular(incenter, sideA, sideB);
                positions[pointId] = { x: foot.x, y: foot.y, labelAnchor: "auto" };
                if (!firstFoot) firstFoot = foot;
              });

            // Stamp the synthesized circle (from parseGeometry) with its
            // real center/radius. renderCircles checks __renderCenter /
            // __renderRadius with top priority, so this is all it needs
            // to actually draw — inradius = distance from incenter to
            // ANY tangency foot (equal by construction, so the first
            // one computed above works for all three sides).
            const incircleObj = circles.find((c) => c.id === "circle_incircle");
            if (incircleObj && firstFoot) {
              incircleObj.__renderCenter = { x: incenter.x, y: incenter.y };
              incircleObj.__renderRadius = Math.hypot(
                firstFoot.x - incenter.x,
                firstFoot.y - incenter.y
              );
            }
          }
        }

        /* --------------------------------------------------
         * FEATURE: EXCIRCLE / EXCENTER
         * -------------------------------------------------- */
        else if (hasExcircleFeature ) {
          // 1. Identify the "opposite" vertex — the point common to BOTH
          // collinear-extension relationships (P is shared by P-Q-S and
          // P-R-T). That's the vertex whose two sides get extended, and
          // the excircle sits on the far side of the opposite side (QR)
          // from it.
          const collinearRels = relationships.filter(
            (r) => r.type === "is_collinear" || r.type === "collinear"
          );

          let oppositeVertexId = topId; // sensible fallback
          let extLines = [];

          if (collinearRels.length >= 2) {
            const [rel1, rel2] = collinearRels;
            const common = rel1.elements?.find(
              (id) => rel2.elements?.includes(id) && mainVertexIds.includes(id)
            );
            if (common) {
              oppositeVertexId = common;
              extLines = [rel1, rel2];
            }
          }

          const otherVertices = mainVertexIds.filter((id) => id !== oppositeVertexId);
          const [bId, cId] = otherVertices;

          const Apos = positions[oppositeVertexId];
          const Bpos = positions[bId];
          const Cpos = positions[cId];

          if (Apos && Bpos && Cpos) {
            // Standard excenter formula (excircle opposite A, tangent to
            // BC and the extensions of AB/AC):
            // I_A = (-a*A + b*B + c*C) / (-a+b+c), where a=|BC|, b=|CA|, c=|AB|.
            const a = Math.hypot(Bpos.x - Cpos.x, Bpos.y - Cpos.y);
            const b = Math.hypot(Apos.x - Cpos.x, Apos.y - Cpos.y);
            const c = Math.hypot(Apos.x - Bpos.x, Apos.y - Bpos.y);
            const denom = -a + b + c;

            if (Math.abs(denom) > 1e-6) {
              const excenter = {
                x: (-a * Apos.x + b * Bpos.x + c * Cpos.x) / denom,
                y: (-a * Apos.y + b * Bpos.y + c * Cpos.y) / denom,
              };

              const centerRel = relationships.find((r) => r.type === "is_center_of");
              const excenterPointId = centerRel?.elements?.[0];
              const circleId = centerRel?.elements?.[1];

              if (excenterPointId) {
                positions[excenterPointId] = {
                  x: excenter.x,
                  y: excenter.y,
                  labelAnchor: "auto",
                };
              }

              // Tangent point on BC = perpendicular foot from the
              // excenter — inradius-equivalent for this excircle.
              const footBC = footOfPerpendicular(excenter, Bpos, Cpos);

              // circle_e is already in `circles` (explicit in elements
              // this time, unlike the incircle case) — just stamp its
              // render props. renderCircles checks __renderCenter /
              // __renderRadius with top priority.
              const circleObj = circles.find((circ) => circ.id === circleId);
              if (circleObj) {
                circleObj.__renderCenter = { x: excenter.x, y: excenter.y };
                circleObj.__renderRadius = Math.hypot(
                  footBC.x - excenter.x,
                  footBC.y - excenter.y
                );
              }

              // 2. Place S and T at their TRUE tangent points — the
              // perpendicular foot from the excenter onto each extended
              // line (P-Q extended through S, P-R extended through T).
              // footOfPerpendicular works on the INFINITE line through
              // its two input points, so passing P and Q (not P and S)
              // correctly lands the foot beyond Q automatically, without
              // needing to guess an extension distance.
              extLines.forEach((rel) => {
                const extPointId = rel.elements?.find(
                  (id) => id !== oppositeVertexId && !otherVertices.includes(id)
                );
                const throughVertexId = rel.elements?.find((id) =>
                  otherVertices.includes(id)
                );
                const throughPos = positions[throughVertexId];
                if (!extPointId || !throughPos || !Apos) return;

                const tangentFoot = footOfPerpendicular(excenter, Apos, throughPos);
                positions[extPointId] = {
                  x: tangentFoot.x,
                  y: tangentFoot.y,
                  labelAnchor: "auto",
                };
              });
            }
          }
        }


        /* --------------------------------------------------
         * FEATURE: CIRCUMCENTER / CIRCUMCIRCLE
         * -------------------------------------------------- */
        else if (hasCircumcenterFeature) {
          const A = positions[topId];
          const B = positions[bottomLeftId];
          const C = positions[bottomRightId];

          if (A && B && C) {
            // Standard closed-form circumcenter — exact, and independent
            // of how many perpendicular-bisector lines the JSON happens
            // to list (2 or 3), since it's derived from all 3 vertices
            // directly rather than intersecting whichever lines exist.
            const D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
            if (Math.abs(D) > 1e-6) {
              const ux =
                ((A.x ** 2 + A.y ** 2) * (B.y - C.y) +
                  (B.x ** 2 + B.y ** 2) * (C.y - A.y) +
                  (C.x ** 2 + C.y ** 2) * (A.y - B.y)) /D;
              const uy =
                ((A.x ** 2 + A.y ** 2) * (C.x - B.x) +
                  (B.x ** 2 + B.y ** 2) * (A.x - C.x) +
                  (C.x ** 2 + C.y ** 2) * (B.x - A.x)) /D;

              const circumcenter = {x: ux, y: uy};

              // 1. Place the labeled circumcenter point, however it's
              // referenced (intersect_at target, or is_center_of elements).
              const intersectRel = relationships.find((r) => r.type === "intersect_at");
              const centerOfRel = relationships.find((r) => r.type === "is_center_of");
              const centerPointId = intersectRel?.target || centerOfRel?.elements?.[0];

              if (centerPointId) {
                positions[centerPointId] = {
                  x: circumcenter.x,
                  y: circumcenter.y,
                  labelAnchor: "auto",
                };
              }

              // 2. CASE A: perpendicular-bisector LINES (Q1/Q2) — draw
              // each named line as a real segment from its side's
              // midpoint to the circumcenter. This is geometrically
              // EXACT, not a visual approximation — the circumcenter
              // lies on every perpendicular bisector by definition, so
              // midpoint->circumcenter IS the bisector line segment.
              relationships
              .filter((r) => r.type === "is_perpendicular_bisector_of")
              .forEach((rel) => {
                const lineId = rel.elements?.[0];
                const endpoints = getSegmentEndpoints({ id: rel.target }, points);
                if (!lineId || !endpoints) return;

                const sideA = positions[endpoints.firstId];
                const sideB = positions[endpoints.secondId];
                if (!sideA || !sideB) return;

                const mid = { x: (sideA.x + sideB.x) / 2, y: (sideA.y + sideB.y) / 2 };

                const midId = `point_mid_${lineId}`;
                points[midId] = points[midId] || { id: midId, label: "", type: "point" };
                positions[midId] = { x: mid.x, y: mid.y, labelAnchor: "auto" };

                // Find the existing placeholder segment/line entry and enrich it,
                // instead of skipping because it already exists.
                let segObj = segments.find((s) => s.id === lineId);
                if (segObj) {
                  segObj.start = midId;
                  segObj.end = centerPointId;
                  segObj.type = "segment"; // normalize so renderSegment/getSegmentEndpoints treat it consistently
                } else {
                  segments.push({ id: lineId, type: "segment", start: midId, end: centerPointId });
                }
              });

              // 3. CASE B: explicit circumscribed CIRCLE (Q3) — stamp
              // the already-declared circle's render props. Radius =
              // distance to any vertex (equal for all three, since the
              // circle passes through D, E, F by construction).
              const passesRel = relationships.find((r) => r.type === "passes_through");
              if (passesRel?.elements?.[0]) {
                const circleId = passesRel.elements[0]; // was: passesRel.target (wrong — that's the points array)
                const circleObj = circles.find((c) => c.id === circleId);
                if (circleObj) {
                  circleObj.__renderCenter = { x: circumcenter.x, y: circumcenter.y };
                  circleObj.__renderRadius = Math.hypot(A.x - ux, A.y - uy);
                }
              }
            }
          }
        }

        /* --------------------------------------------------
         * FEATURE: EXTERIOR ANGLE / EXTERIOR ANGLE BISECTOR
         * -------------------------------------------------- */
        else if (hasExteriorFeature && !hasCevianFeature) {    
          // 1. Extend sides into rays, placing the new synthetic point.
        relationships
          .filter((r) => r.type === "extends_side")
          .forEach((rel) => {
            const [segmentId, pivotId, newPointId] = rel.elements || [];
            const rayId = rel.target;
            if (!pivotId || !newPointId || !rayId) return;

            const endpoints = getSegmentEndpoints({ id: segmentId }, points);
            if (!endpoints) return;

            const farId = endpoints.firstId === pivotId ? endpoints.secondId : endpoints.firstId;
            const pivot = positions[pivotId];
            const far = positions[farId];
            if (!pivot || !far) return;

            const dx = pivot.x - far.x;
            const dy = pivot.y - far.y;
            const len = Math.hypot(dx, dy);
            if (len < 1e-6) return;

            const EXTENSION_LENGTH = 50; // px — tune to match your existing scale
            positions[newPointId] = {
              x: pivot.x + (dx / len) * EXTENSION_LENGTH,
              y: pivot.y + (dy / len) * EXTENSION_LENGTH,
              labelAnchor: "auto",
            };

            // Find-and-mutate placeholder, same pattern as the bisector fix.
            let segObj = segments.find((s) => s.id === rayId);
            if (segObj) {
              segObj.start = pivotId;
              segObj.end = newPointId;
              segObj.type = "segment";
            } else {
              segments.push({ id: rayId, type: "segment", start: pivotId, end: newPointId });
            }
          });

        // 2. Build angle entries from forms_angle — bypasses the id-regex fallback entirely.
        relationships
          .filter((r) => r.type === "forms_angle")
          .forEach((rel) => {
            const [firstId, vertexId, secondId] = rel.elements || [];
            const angleId = rel.target;
            if (!firstId || !vertexId || !secondId || !angleId) return;

            const firstLabel = points[firstId]?.label;
            const vertexLabel = points[vertexId]?.label;
            const secondLabel = points[secondId]?.label;
            if (!firstLabel || !vertexLabel || !secondLabel) return;

            const elementsForRender = [firstLabel, vertexLabel, secondLabel];
            let angleObj = angles.find((a) => a.id === angleId);
            if (angleObj) {
              angleObj.elements = elementsForRender;
            } else {
              angles.push({ id: angleId, type: "angle", elements: elementsForRender });
            }
          });
      }

      else if (hasCevianFeature) {
        
      // Helper: find the segment id (not just value) between two points, via forms_segment.
        const triangleRel = relationships.find((r) => r.type === "forms_triangle");
        const vertexOrder = triangleRel?.elements || [];

        const getCyclicNearFar = (pointIdA, pointIdB) => {
          const i = vertexOrder.indexOf(pointIdA);
          const j = vertexOrder.indexOf(pointIdB);
          if (i === -1 || j === -1) return { near: pointIdA, far: pointIdB };
          return (i + 1) % vertexOrder.length === j
            ? { near: pointIdA, far: pointIdB }
            : { near: pointIdB, far: pointIdA };
        };

        const getSegmentIdBetween = (pointIdA, pointIdB) => {
          const rel = relationships.find(
            (r) => r.type === "forms_segment" && r.elements?.length === 2 &&
              r.elements.includes(pointIdA) && r.elements.includes(pointIdB)
          );
          if (rel?.target) return rel.target;

          const found = segments.find((s) => {
            const ep = getSegmentEndpoints(s, points);
            return ep && ((ep.firstId === pointIdA && ep.secondId === pointIdB) ||
                          (ep.firstId === pointIdB && ep.secondId === pointIdA));
          });
          return found?.id || null;
        };

        const getRatioForFoot = (nearPointId, pointId, farPointId) => {
          const nearVal = parseFloat(getSegmentValueBetween(relationships, segments, nearPointId, pointId));
          const farVal = parseFloat(getSegmentValueBetween(relationships, segments, pointId, farPointId));
          if (Number.isFinite(nearVal) && Number.isFinite(farVal)) return nearVal / farVal;

          const nearSegId = getSegmentIdBetween(nearPointId, pointId);
          const farSegId = getSegmentIdBetween(pointId, farPointId);
          if (nearSegId && farSegId) {
            const ratioRel = relationships.find(
              (r) => r.type === "forms_ratio" && r.elements?.includes(nearSegId) &&
                r.elements?.includes(farSegId) && typeof r.value === "string" && r.value.includes(":")
            );
            if (ratioRel) {
              const [num, den] = ratioRel.value.split(":").map(Number);
              if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) return num / den;
            }
          }
          return null;
        };

        const lieRels = relationships.filter((r) => r.type === "lies_on");

        const footInfos = lieRels
          .map((rel) => {
            const pointId = rel.element_id || rel.elements?.[0];
            const sideId = rel.target_segment || rel.target;
            const endpoints = pointId && sideId ? getSegmentEndpoints({ id: sideId }, points) : null;
            if (!endpoints) return null;

            const { near, far } = getCyclicNearFar(endpoints.firstId, endpoints.secondId);
            return { pointId, near, far, ratio: getRatioForFoot(near, pointId, far) };
          })
          .filter(Boolean);

        const missing = footInfos.filter((f) => f.ratio === null);
        const known = footInfos.filter((f) => f.ratio !== null);
        if (missing.length === 1 && known.length === 2) {
          missing[0].ratio = 1 / (known[0].ratio * known[1].ratio);
        }

        footInfos.forEach(({ pointId, near, far, ratio }) => {
          const A = positions[near];
          const B = positions[far];
          if (!A || !B) return;
          const t = ratio !== null ? ratio / (1 + ratio) : 0.5;
          positions[pointId] = { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t, labelAnchor: "auto" };
        });

      // 2. Resolve is_on_extension_of_segment (Menelaus' U) — unchanged from before.
      relationships
        .filter((r) => r.type === "is_on_extension_of_segment")
        .forEach((rel) => {
          const pointId = rel.elements?.[0];
          const sideId = rel.target;
          if (!pointId || !sideId) return;

          const endpoints = getSegmentEndpoints({ id: sideId }, points);
          if (!endpoints) return;
          const near = positions[endpoints.firstId];
          const far = positions[endpoints.secondId];
          if (!near || !far) return;

          const EXTENSION_LENGTH = 40;
          const dx = far.x - near.x, dy = far.y - near.y;
          const len = Math.hypot(dx, dy);
          if (len < 1e-6) return;
          const t = EXTENSION_LENGTH / len;

          positions[pointId] = {
            x: far.x + dx * t,
            y: far.y + dy * t,
            labelAnchor: "auto",
          };
        });

      // 3. Resolve concurrent_at — plain two-cevian intersection, NO forcing needed.
      // Since all three feet are now placed at their true, Ceva-consistent ratios,
      // the third cevian is mathematically guaranteed to pass through the same
      // point on any triangle shape — no correction step required.
      const concurrentRel = relationships.find((r) => r.type === "concurrent_at");
      if (concurrentRel?.elements?.length >= 2 && concurrentRel.target) {
        const [lineId1, lineId2] = concurrentRel.elements;

        const resolveLineEndpoints = (lineId) => {
          const chars = lineId.replace("line_", "").split("");
          if (chars.length !== 2) return null;
          const firstPt = points[`point_${chars[0]}`] ? `point_${chars[0]}` : null;
          const secondPt = points[`point_${chars[1]}`] ? `point_${chars[1]}` : null;
          return firstPt && secondPt ? { start: firstPt, end: secondPt } : null;
        };

        const e1 = resolveLineEndpoints(lineId1);
        const e2 = resolveLineEndpoints(lineId2);

        if (e1 && e2) {
          const A1 = positions[e1.start], B1 = positions[e1.end];
          const A2 = positions[e2.start], B2 = positions[e2.end];
          if (A1 && B1 && A2 && B2) {
            const intersection = lineIntersection(A1, B1, A2, B2);
            if (intersection) {
              positions[concurrentRel.target] = { ...intersection, labelAnchor: "auto" };
            }
          }
          concurrentRel.elements.forEach((lineId) => {
            const endpoints = resolveLineEndpoints(lineId);
            if (!endpoints) return;
            let segObj = segments.find((s) => s.id === lineId);
            if (segObj) {
              segObj.start = endpoints.start;
              segObj.end = endpoints.end;
              segObj.type = "segment";
            } else {
              segments.push({ id: lineId, type: "segment", start: endpoints.start, end: endpoints.end });
            }
          });
        }
      }
    }

      fitPositionsToBounds(positions, { width: SVG_WIDTH, height: SVG_HEIGHT, paddingX, paddingY }, circles);
    
    }


 


/*
 * --------------------------------------------------
 * GENERIC
 * --------------------------------------------------
 *
 * Generic N-gon layout with angle support for 3- and 4-point figures,
 * falling back to an upright radial distribution.
 */
if (figure.type === "generic") {
  const count = pointIds.length;
  // 1. Check if an explicit angle relationship exists
  const { angleValue, vertexId } = getTargetVertexId(relationships, pointIds);

  if (count === 3 && angleValue !== null) {
    // Treat as dynamic generic triangle
    const [p1, p2, p3] = pointIds;
    const baseWidth = HALF_W * 1.4;
    const bottomY = centerY + HALF_H * 0.4;
    const leftX = centerX - baseWidth / 2;
    const rightX = centerX + baseWidth / 2;

    if (vertexId === p2) {
      const angleRad = (angleValue * Math.PI) / 180;
      const sideLength = baseWidth * 0.8;
      positions[p2] = { x: leftX, y: bottomY };
      positions[p3] = { x: rightX, y: bottomY };
      positions[p1] = {
        x: leftX + sideLength * Math.cos(angleRad),
        y: bottomY - sideLength * Math.sin(angleRad),
      };
    } else if (vertexId === p3) {
      const angleRad = (angleValue * Math.PI) / 180;
      const sideLength = baseWidth * 0.8;
      positions[p2] = { x: leftX, y: bottomY };
      positions[p3] = { x: rightX, y: bottomY };
      positions[p1] = {
        x: rightX - sideLength * Math.cos(angleRad),
        y: bottomY - sideLength * Math.sin(angleRad),
      };
    } else {
      const halfAngleRad = ((angleValue / 2) * Math.PI) / 180;
      const height = (baseWidth / 2) / Math.tan(halfAngleRad);
      positions[p2] = { x: leftX, y: bottomY };
      positions[p3] = { x: rightX, y: bottomY };
      positions[p1] = {
        x: centerX,
        y: bottomY - Math.min(height, HALF_H * 1.5),
      };
    }
  } else if (count === 4 && angleValue !== null) {

    // Treat as dynamic generic 4-sided figure
    const [p1, p2, p3, p4] = pointIds;
    const sideLength = HALF_H * 0.8;
    const baseWidth = HALF_W * 1.0;

    const targetIndex = pointIds.indexOf(vertexId);
    const { dx, dy } = calculateSlantVector(angleValue, sideLength, targetIndex);

    const topY = centerY - dy / 2;
    const bottomY = centerY + dy / 2;
    const startX = centerX - baseWidth / 2 - dx / 2;

    positions[p1] = { x: startX, y: topY };
    positions[p2] = { x: startX + baseWidth, y: topY };
    positions[p3] = { x: positions[p2].x + dx, y: bottomY };
    positions[p4] = { x: positions[p1].x + dx, y: bottomY };
  } else {

    // 2. Default Fallback: Upright Radial N-gon Distribution
    const radius = Math.min(SVG_AVAILABLE_WIDTH, SVG_AVAILABLE_HEIGHT) / 2.5;
    const angleStep = (2 * Math.PI) / count;
    
    // Starting at -PI/2 places point 0 at the top apex (12 o'clock)
    const startAngle = -Math.PI / 2; 

    pointIds.forEach((id, index) => {
      const angle = startAngle + index * angleStep;
      positions[id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }
}


 
  /*
   * --------------------------------------------------
   * GENERIC MIDPOINTS
   * --------------------------------------------------
   *
   * Only calculate midpoint positions
   * that have not already been assigned
   * by a figure-specific layout.
   * --------------------------------------------------
   */

  relationships.filter((r) => r.type === "midpoint_of")
    .forEach((relationship) => {
        const midpointId = relationship.element_id;
        if ( !midpointId ||   positions[midpointId]  ) {
          return;
        }
        const targetSegmentId =  relationship.target_segment;
        if (!targetSegmentId) {
          return;
        }
        const segment =  segments.find( (item) => item.id === targetSegmentId);

        if (!segment) {
          return;
        }

        const endpoints =  getSegmentEndpoints( segment,  points );

        if (!endpoints) {
          return;
        }

        const p1 =  positions[ endpoints.firstId ];
        const p2 = positions[ endpoints.secondId ];

        if (!p1 || !p2) {
          return;
        }

        positions[midpointId] = midpoint(p1, p2);
      }
    );

  /*
   * --------------------------------------------------
   * UNIVERSAL SAFETY-NET FALLBACK
   * --------------------------------------------------
   *
   * Every figure-specific block above is best-effort: it only runs
   * when its expected relationships/points are present in the input.
   * An unrecognized figure.type, a partially-specified figure, or a
   * point that no block above happened to touch would otherwise be
   * silently dropped from `positions` and fail to render.
   *
   * This final pass guarantees every point in `points` ends up with
   * SOME position -- any point still missing one is placed on an
   * ellipse using the same shared centerX/centerY/HALF_W/HALF_H
   * constants as every other figure type, so even the fallback stays
   * visually consistent with the rest of the renderer.
   */

  const unpositionedPointIds = pointIds.filter((id) => !positions[id]);

  if (unpositionedPointIds.length > 0) {
    const angleStep = (2 * Math.PI) / Math.max(unpositionedPointIds.length, 1);

    unpositionedPointIds.forEach((id, index) => {
      const angle = -Math.PI / 2 + index * angleStep;

      positions[id] = {
        x: centerX + Math.cos(angle) * HALF_W,
        y: centerY + Math.sin(angle) * HALF_H,
      };
    });

    console.warn(
      "[GEOMETRY RENDER] Fallback-positioned points (no figure-specific rule matched):",
      { figureType: figure?.type, unpositionedPointIds }
    );
  }

  return positions;
}

