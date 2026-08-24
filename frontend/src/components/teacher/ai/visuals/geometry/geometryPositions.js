

import {
  getSegmentEndpoints,
  midpoint,
  lineIntersection,
  solveEquation,
  evaluateExpression,
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

  const FILL_FACTOR = 0.80;

  const HALF_W = (SVG_AVAILABLE_WIDTH / 2.5) * FILL_FACTOR;
  const HALF_H = (SVG_AVAILABLE_HEIGHT / 2) * FILL_FACTOR;

  /*
   * ------------------------------------------
   * BASIC GEOMETRY DATA
   * ------------------------------------------
   */

   // 🔎 Circle center detection
  const centerId =
    pointIds.find((id) => String(points[id]?.label || "").toUpperCase() === "O") ||
    pointIds.find((id) => id.toLowerCase() === "point_o") ||
    null;

  // Base radius derived from available canvas size
  const maxRadius = Math.min(SVG_AVAILABLE_WIDTH / 2, SVG_AVAILABLE_HEIGHT / 2) 
  //console.log("maxRadius:",maxRadius)

  // Scale radius based on number of points (more points → smaller radius)
  const radius = Math.max(
    maxRadius * 0.3, // minimum radius safeguard
    maxRadius - pointIds.length*3
  );

  //console.log("pointIds.length: ",pointIds.length)

  let specializedCircleGeometry = false;

  /*
   * ------------------------------------------
   * CIRCLE GEOMETRY
   * ------------------------------------------
   */

  if ( figure?.type === "circle" && Array.isArray(circles) &&  circles.length > 0 ) {
    const circle = circles[0];

    // console.log("[DEBUG CIRCLE INPUT]", {
    //   figure,
    //   circle,
    //   centerId,
    //   pointIds,
    //   points,
    //   segments,
    //   relationships,
    // });
    /*
    * ------------------------------------------
    * TWO CHORD GEOMETRY DETECTION
    * ------------------------------------------
    */

    const midpointRelationships =
      relationships.filter(
        (relationship) =>
          relationship.type === "midpoint_of" &&
          relationship.element_id &&
          relationship.target_segment
      );

    const chordCandidates =
      midpointRelationships
        .map((relationship) => {
          const segment =
            segments.find(
              (candidate) =>
                candidate.id ===
                relationship.target_segment
            );

          if (!segment) {
            return null;
          }

          const endpoints =
            getSegmentEndpoints(
              segment,
              points
            );

          if (!endpoints) {
            return null;
          }

          const lengthRelationship =
            relationships.find(
              (item) =>
                item.type === "has_length" &&
                item.element_id === segment.id
            );

          return {
            segmentId: segment.id,
            midpointId:
              relationship.element_id,
            firstId:
              endpoints.firstId,
            secondId:
              endpoints.secondId,
            length:
              Number(lengthRelationship?.value),
          };
        })
        .filter(
          (item) =>
            item &&
            Number.isFinite(item.length)
        );

    const hasTwoChordGeometry = Boolean(centerId) && chordCandidates.length >= 2;

    /*
     * ------------------------------------------
     * FIND CIRCLE POINTS
     * ------------------------------------------
     */

    const circlePointIds =
      relationships
        .filter(
          (relationship) =>
            relationship.type === "lies_on" &&
            relationship.elements?.some((id) =>
              String(id).startsWith("point_")
            ) &&
            relationship.elements?.some((id) =>
              String(id).startsWith("circle_")
            )
        )
        .map((relationship) =>
          relationship.elements.find((id) =>
            String(id).startsWith("point_")
          )
        )
        .filter(Boolean);

    /*
     * ------------------------------------------
     *CIRCLE: TANGENT + CHORD CASE
     * ------------------------------------------
     *
     * Two tangents from an external point:
     *
     *        A
     *       / \
     *      /   \
     *     O     P
     *      \   /
     *       \ /
     *        B
     *
     * ∠AOB = 180° - ∠APB
     */

    const tangentRelationships =
      relationships.filter(
        (relationship) =>
          relationship.type === "tangent_at_point" &&
          relationship.at_point
      );

    const perpendicularRelationships =
      relationships.filter(
        (relationship) =>
          relationship.type === "perpendicular_to"
      );

    const uniqueTangentPointIds = [
      ...new Set(
        tangentRelationships
          .map(
            (relationship) =>
              relationship.at_point
          )
          .filter(Boolean)
      ),
    ];

    const hasTwoTangents =  tangentRelationships.length >= 2;

    const hasTangentPerpendiculars =  perpendicularRelationships.length >= 2;

    const hasTangentChordGeometry =
      Boolean(centerId) &&
      hasTwoTangents &&
      hasTangentPerpendiculars &&
      uniqueTangentPointIds.length >= 2 &&
      uniqueTangentPointIds.every(
        (id) =>
          circlePointIds.includes(id)
      );

    if (hasTangentChordGeometry) {

      specializedCircleGeometry = true;

      /*
       * ----------------------------------------
       * FIND EXTERNAL POINT
       * ----------------------------------------
       */

      const externalPointId =
        pointIds.find((pointId) => {
          if (
            pointId === centerId ||
            uniqueTangentPointIds.includes(pointId)
          ) {
            return false;
          }

          const connectedTangentCount =
            segments.filter((segment) => {
              const endpoints =
                getSegmentEndpoints(
                  segment,
                  points
                );

              if (!endpoints) {
                return false;
              }

              const hasExternalPoint =
                endpoints.firstId === pointId ||
                endpoints.secondId === pointId;

              const otherId =
                endpoints.firstId === pointId
                  ? endpoints.secondId
                  : endpoints.firstId;

              return (
                hasExternalPoint &&
                uniqueTangentPointIds.includes(otherId)
              );
            }).length;

          return connectedTangentCount >= 2;
        });

      /*
       * ----------------------------------------
       * FIND ANGLE BETWEEN TANGENTS
       * ----------------------------------------
       */

      const tangentAngle =
        Array.isArray(angles)
          ? angles.find(
              (angle) =>
                angle?.value !== undefined
            )
          : null;

      const externalAngle =
        Number(tangentAngle?.value);

      /*
       * ----------------------------------------
       * CENTER
       * ----------------------------------------
       */

      positions[centerId] = {
        x: centerX,
        y: centerY,
      };

      /*
       * ----------------------------------------
       * CIRCLE RADIUS
       * ----------------------------------------
       */
      //console.log("circleRadius; ", radius)
      const circleRadius = radius;

      circle.__renderRadius =  circleRadius;

      /*
       * ----------------------------------------
       * TANGENT POINTS
       * ----------------------------------------
       */

      const validAngle =  Number.isFinite(externalAngle) && externalAngle > 0 && externalAngle < 180;

      const centralAngle = validAngle ? 180 - externalAngle  : 90;

      const halfCentralAngle =  (centralAngle / 2) *  (Math.PI / 180);

      const tangentPointA = uniqueTangentPointIds[0];

      const tangentPointB =  uniqueTangentPointIds[1];

      positions[tangentPointA] = {
        x: centerX + Math.cos(halfCentralAngle) * circleRadius,
        y: centerY - Math.sin(halfCentralAngle) * circleRadius,
      };

      positions[tangentPointB] = {
        x: centerX + Math.cos(halfCentralAngle) * circleRadius,
        y: centerY + Math.sin(halfCentralAngle) * circleRadius,
      };

      /*
       * ----------------------------------------
       * EXTERNAL POINT
       * ----------------------------------------
       *
       * OP = r / sin(∠APB / 2)
       */

      if ( externalPointId && validAngle ) {
        const halfExternalAngle = (externalAngle / 2) * (Math.PI / 180);
        const sinHalf = Math.sin(halfExternalAngle);

        if (sinHalf > 0) {
          const externalDistance = circleRadius / sinHalf;

          positions[externalPointId] = {
            x: centerX + externalDistance,
            y: centerY,
          };
        }
      }

      /*
       * ----------------------------------------
       * OTHER CIRCLE POINTS
       * ----------------------------------------
       */

      circlePointIds.forEach((pointId) => {
        if (
          pointId !== tangentPointA &&
          pointId !== tangentPointB &&
          pointId !== centerId
        ) {
          positions[pointId] = {
            x: centerX,
            y: centerY,
          };
        }
      });
    }


    /*
      * ------------------------------------------
      * CIRCLE: SIMPLE TANGENT LENGTH CASE
      * ------------------------------------------
      *
      * Pattern:
      *
      *        A
      *        |\
      *        | \
      *        |  \
      *   O----+   P
      *     (radius)
      *
      * O = circle center, A = point of tangency (on the
      * circle), P = external point. OA ⟂ PA at A (radius
      * is perpendicular to the tangent at the point of
      * tangency), so triangle OAP is right-angled at A.
      *
      * Given any two of {OA (radius), OP (center-to-
      * external distance), PA (tangent length)}, the third
      * is found via the Pythagorean theorem.
      *
      * Required:
      * - one "has_center" relationship (circle -> center point)
      * - one "perpendicular_to" relationship at a point on
      *   the circle, between the radius segment and the
      *   tangent segment (this identifies the tangent point,
      *   the radius segment, and the tangent segment)
      * - "has_length" values for two of the three sides
      */

      if (!specializedCircleGeometry) {
        const hasCenterRel = relationships.find(
          (relationship) => relationship.type === "has_center"
        );

        const perpRel = relationships.find(
          (relationship) =>
            relationship.type === "perpendicular_to" && relationship.at_point
        );

        if (hasCenterRel && perpRel && Array.isArray(perpRel.elements) && perpRel.elements.length === 2) {
          const circle =
            (Array.isArray(circles) &&
              circles.find((c) => c.id === hasCenterRel.element_id)) ||
            (Array.isArray(circles) ? circles[0] : null);

          const centerPointId = hasCenterRel.target;
          const tangentPointId = perpRel.at_point;

          if (circle && centerPointId && tangentPointId) {
            const [segIdA, segIdB] = perpRel.elements;
            const segA = segments.find((s) => s.id === segIdA);
            const segB = segments.find((s) => s.id === segIdB);
            const epA = segA ? getSegmentEndpoints(segA, points) : null;
            const epB = segB ? getSegmentEndpoints(segB, points) : null;

            const otherEndpoint = (ep, knownId) =>
              ep.firstId === knownId ? ep.secondId : ep.firstId;

            if (epA && epB) {
              let radiusSegment = null;
              let tangentSegment = null;
              let externalPointId = null;

              if (otherEndpoint(epA, tangentPointId) === centerPointId) {
                radiusSegment = segA;
                tangentSegment = segB;
                externalPointId = otherEndpoint(epB, tangentPointId);
              } else if (otherEndpoint(epB, tangentPointId) === centerPointId) {
                radiusSegment = segB;
                tangentSegment = segA;
                externalPointId = otherEndpoint(epA, tangentPointId);
              }

              if (radiusSegment && tangentSegment && externalPointId) {
                const centerToExternalSegment = segments.find((s) => {
                  const ep = getSegmentEndpoints(s, points);
                  if (!ep) return false;
                  return (
                    (ep.firstId === centerPointId && ep.secondId === externalPointId) ||
                    (ep.firstId === externalPointId && ep.secondId === centerPointId)
                  );
                });

                const getLength = (segmentId) => {
                  const rel = relationships.find(
                    (relationship) =>
                      relationship.type === "has_length" &&
                      relationship.element_id === segmentId
                  );
                  return rel && typeof rel.value === "number" ? rel.value : null;
                };

                const radiusLength = getLength(radiusSegment.id);
                const opLength = centerToExternalSegment
                  ? getLength(centerToExternalSegment.id)
                  : null;
                const tangentLengthGiven = getLength(tangentSegment.id);

                /*
                * Solve whichever side of the right triangle
                * (OA, OP, PA) is missing, given the other two.
                */

                let radiusVal = radiusLength;
                let opVal = opLength;
                let tangentVal = tangentLengthGiven;

                if (radiusVal != null && opVal != null && tangentVal == null) {
                  if (opVal > radiusVal) {
                    tangentVal = Math.sqrt(opVal * opVal - radiusVal * radiusVal);
                  }
                } else if (radiusVal != null && tangentVal != null && opVal == null) {
                  opVal = Math.sqrt(radiusVal * radiusVal + tangentVal * tangentVal);
                } else if (opVal != null && tangentVal != null && radiusVal == null) {
                  if (opVal > tangentVal) {
                    radiusVal = Math.sqrt(opVal * opVal - tangentVal * tangentVal);
                  }
                }

                if (
                  radiusVal != null &&
                  opVal != null &&
                  tangentVal != null &&
                  radiusVal > 0 &&
                  tangentVal > 0 &&
                  opVal > radiusVal
                ) {
                  /*
                  * ------------------------------------------
                  * RAW CONSTRUCTION -- ORIENTATION-AWARE
                  * ------------------------------------------
                  *
                  * O at origin, legs OA and AP perpendicular
                  * at A. Try both orientations (radius leg
                  * along x / tangent leg along y, and vice
                  * versa) and keep whichever yields the larger
                  * scale once fit to the actual SVG canvas
                  * shape -- a landscape canvas wastes space if
                  * the longer leg is forced onto the short
                  * axis, which is what made the circle render
                  * too small before.
                  */

                  const availHalfW = SVG_AVAILABLE_WIDTH / 2;
                  const availHalfH = SVG_AVAILABLE_HEIGHT / 2;

                  const scaleForOrientation = (xLeg, yLeg) =>
                    Math.min(
                      (availHalfW * FILL_FACTOR) / xLeg,
                      (availHalfH * FILL_FACTOR) / yLeg
                    );

                  // Orientation A: radius along x, tangent along y
                  const scaleA = scaleForOrientation(radiusVal, tangentVal);
                  // Orientation B: tangent along x, radius along y
                  const scaleB = scaleForOrientation(tangentVal, radiusVal);

                  const useOrientationB = scaleB > scaleA;
                  const fitScale = useOrientationB ? scaleB : scaleA;

                  const rawO = { x: 0, y: 0 };
                  const rawA = useOrientationB
                    ? { x: 0, y: radiusVal }
                    : { x: radiusVal, y: 0 };
                  const rawP = useOrientationB
                    ? { x: tangentVal, y: radiusVal }
                    : { x: radiusVal, y: tangentVal };

                  /*
                  * ------------------------------------------
                  * FIT TO SVG CANVAS
                  * ------------------------------------------
                  */

                  const applyFit = (p) => ({
                    x: centerX + p.x * fitScale,
                    y: centerY + p.y * fitScale,
                  });

                  positions[centerPointId] = applyFit(rawO);
                  positions[tangentPointId] = applyFit(rawA);
                  positions[externalPointId] = applyFit(rawP);

                  circle.__renderCenter = { x: centerX, y: centerY };
                  circle.__renderRadius = radiusVal * fitScale;

                  specializedCircleGeometry = true;

                 /* console.log("[SIMPLE TANGENT LENGTH]", {
                    circleId: circle.id,
                    center: circle.__renderCenter,
                    radius: circle.__renderRadius,
                    orientation: useOrientationB ? "B" : "A",
                    solved: { radiusVal, opVal, tangentVal },
                    positions: {
                      O: positions[centerPointId],
                      A: positions[tangentPointId],
                      P: positions[externalPointId],
                    },
                  });*/
                }
              }
            }
          }
        }
      }



      /*
      * ------------------------------------------
      * CIRCLE: ANGLE IN SEMICIRCLE CASE (THALES' THEOREM)
      * ------------------------------------------
      *
      * Pattern:
      *
      *        E
      *       / \
      *      /   \
      *   C ------- D
      *        O
      *
      * CD is a diameter, E is any other point on the
      * circle. By Thales' theorem, angle CED is always
      * 90 degrees, regardless of where E sits on the
      * circle (as long as it isn't C or D). No given
      * numeric values are needed to construct this --
      * only the diameter relationship and the third
      * point. E's position is a free choice; placing it
      * at the top of the circle (perpendicular to the
      * diameter) gives a clean, symmetric figure.
      *
      * Required:
      * - one "is_diameter_of" relationship (segment -> circle)
      * - one "forms_triangle" relationship containing the
      *   diameter's two endpoints plus one more point
      */

      if (!specializedCircleGeometry) {
        const diameterRel = relationships.find(
          (relationship) => relationship.type === "is_diameter_of"
        );

        if (diameterRel) {
          const circle =
            (Array.isArray(circles) &&
              circles.find((c) => c.id === diameterRel.target)) ||
            (Array.isArray(circles) ? circles[0] : null);

          const diameterSegment = segments.find(
            (s) => s.id === diameterRel.element_id
          );

          if (circle && diameterSegment) {
            const diameterEndpoints = getSegmentEndpoints(diameterSegment, points);

            const triangleRel = relationships.find(
              (relationship) =>
                relationship.type === "forms_triangle" &&
                Array.isArray(relationship.elements) &&
                diameterEndpoints &&
                relationship.elements.includes(diameterEndpoints.firstId) &&
                relationship.elements.includes(diameterEndpoints.secondId)
            );

            if (diameterEndpoints && triangleRel) {
              const thirdPointId = triangleRel.elements.find(
                (id) =>
                  id !== diameterEndpoints.firstId &&
                  id !== diameterEndpoints.secondId
              );

              if (thirdPointId) {
                /*
                * ------------------------------------------
                * RAW CONSTRUCTION ON A UNIT CIRCLE
                * ------------------------------------------
                *
                * C and D as a horizontal diameter, third
                * point at the top -- the right angle at the
                * third point holds automatically by Thales'
                * theorem regardless of this choice.
                */

                const rawC = { x: -1, y: 0 };
                const rawD = { x: 1, y: 0 };
                const rawThird = { x: 0, y: -1 };

                /*
                * ------------------------------------------
                * FIT TO SVG CANVAS
                * ------------------------------------------
                *
                * Simple symmetric circle -- no external
                * points sticking out -- so a plain uniform
                * fit to the available space works directly.
                */


                const targetRadius =
                  (Math.min(SVG_AVAILABLE_WIDTH, SVG_AVAILABLE_HEIGHT) / 2) *
                  FILL_FACTOR;

                const applyFit = (p) => ({
                  x: centerX + p.x * targetRadius,
                  y: centerY + p.y * targetRadius,
                });

                positions[diameterEndpoints.firstId] = applyFit(rawC);
                positions[diameterEndpoints.secondId] = applyFit(rawD);
                positions[thirdPointId] = applyFit(rawThird);

                circle.__renderCenter = { x: centerX, y: centerY };
                circle.__renderRadius = targetRadius;

                /*
                * The angle at the third point is always 90
                * degrees by construction. If the angle element
                * has no given value (common for this question
                * type, since it's what's being asked), fill it
                * in for any downstream label rendering.
                */

              

                specializedCircleGeometry = true;

                // console.log("[ANGLE IN SEMICIRCLE]", {
                //   circleId: circle.id,
                //   center: circle.__renderCenter,
                //   radius: circle.__renderRadius,
                //   positions: {
                //     [points[diameterEndpoints.firstId]?.label]:
                //       positions[diameterEndpoints.firstId],
                //     [points[diameterEndpoints.secondId]?.label]:
                //       positions[diameterEndpoints.secondId],
                //     [points[thirdPointId]?.label]: positions[thirdPointId],
                //   },
                // });
              }
            }
          }
        }
      }




      /*
      * ------------------------------------------
      *CIRCLE: CENTRAL ANGLE -> INSCRIBED ANGLE CASE
      * ------------------------------------------
      *
      * Pattern:
      *
      *        P
      *         \
      *          \  (central angle at M)
      *      M    Q
      *
      *          R   <-- on the MAJOR arc PQ
      *
      * M = center, P and Q on the circle, central angle
      * PMQ given. R is a third point on the circle, on
      * the MAJOR arc PQ specifically (not just anywhere).
      *
      * Inscribed angle theorem: an inscribed angle is
      * half of the arc it intercepts -- the arc PQ NOT
      * containing the vertex. Since R is on the major
      * arc, angle PRQ intercepts the MINOR arc (the one
      * equal to the given central angle), so:
      *
      *   angle PRQ = centralAngle / 2
      *
      * (If R were on the minor arc instead, it would
      * intercept the major arc and the answer would be
      * (360 - centralAngle) / 2 -- a different question.
      * This block assumes "major arc" as stated and
      * places R there deliberately.)
      *
      * Required:
      * - one "has_center" relationship (circle -> center point)
      * - a central angle element (vertex = center point,
      *   value given) identified by parsing its label
      * - a third point (R) that lies_on the circle and is
      *   NOT one of the two rays of the central angle
      */

      if (!specializedCircleGeometry) {
        const hasCenterRel = relationships.find(
          (relationship) => relationship.type === "has_center"
        );

        if (hasCenterRel) {
          const circle =
            (Array.isArray(circles) &&
              circles.find((c) => c.id === hasCenterRel.element_id)) ||
            (Array.isArray(circles) ? circles[0] : null);

          const centerPointId = hasCenterRel.target;
          const centerPoint = centerPointId ? points[centerPointId] : null;

          if (circle && centerPoint) {
            /*
            * Find a central angle: an angle element whose
            * middle (vertex) letter matches the center point's
            * label, and whose value is given.
            */

            const parseAngleLetters = (angleEl) => {
              if (!angleEl?.label) return null;
              const cleaned = angleEl.label
                .replace(/\\angle/g, "")
                .replace(/[^A-Za-z]/g, "");
              return cleaned.length === 3 ? cleaned.split("") : null;
            };

            const centralAngleEl = Array.isArray(angles)
              ? angles.find((angleEl) => {
                  const letters = parseAngleLetters(angleEl);
                  return (
                    letters &&
                    letters[1] === centerPoint.label &&
                    typeof angleEl.value === "number"
                  );
                })
              : null;

            if (centralAngleEl) {
              const letters = parseAngleLetters(centralAngleEl);
              const letterToPointId = {};
              Object.keys(points).forEach((id) => {
                letterToPointId[points[id].label] = id;
              });

              const rayAId = letterToPointId[letters[0]];
              const rayBId = letterToPointId[letters[2]];

              if (rayAId && rayBId) {
                /*
                * Third point: any point (other than the center
                * and the two rays) that lies on this circle.
                */

                const onCirclePointIds = relationships
                  .filter(
                    (relationship) =>
                      relationship.type === "lies_on" &&
                      Array.isArray(relationship.elements) &&
                      relationship.elements.includes(circle.id)
                  )
                  .map((relationship) =>
                    relationship.elements.find((id) => id !== circle.id)
                  );

                const thirdPointId = onCirclePointIds.find(
                  (id) => id !== rayAId && id !== rayBId
                );

                if (thirdPointId) {
                  const centralAngleValue = centralAngleEl.value;

                  if (centralAngleValue > 0 && centralAngleValue < 360) {
                    /*
                    * ------------------------------------------
                    * RAW CONSTRUCTION ON A UNIT CIRCLE
                    * ------------------------------------------
                    *
                    * Place the two rays symmetric about the top,
                    * separated by the given central angle (this
                    * spans the MINOR arc when centralAngle < 180).
                    * Place the third point diametrically opposite
                    * that midpoint, guaranteeing it lands on the
                    * MAJOR arc.
                    */

                    const toRad = (deg) => (deg * Math.PI) / 180;
                    const halfAngle = centralAngleValue / 2;

                    const ptOnUnitCircle = (theta) => ({
                      x: Math.cos(theta),
                      y: Math.sin(theta),
                    });

                    const thetaRayA = toRad(90 + halfAngle);
                    const thetaRayB = toRad(90 - halfAngle);
                    const thetaThird = toRad(270);

                    const rawRayA = ptOnUnitCircle(thetaRayA);
                    const rawRayB = ptOnUnitCircle(thetaRayB);
                    const rawThird = ptOnUnitCircle(thetaThird);
                    const rawCenter = { x: 0, y: 0 };

                    /*
                    * ------------------------------------------
                    * FIT TO SVG CANVAS
                    * ------------------------------------------
                    */


                    const targetRadius =
                      (Math.min(SVG_AVAILABLE_WIDTH, SVG_AVAILABLE_HEIGHT) / 2) *
                      FILL_FACTOR;

                    const applyFit = (p) => ({
                      x: centerX + p.x * targetRadius,
                      y: centerY + p.y * targetRadius,
                    });

                    positions[centerPointId] = applyFit(rawCenter);
                    positions[rayAId] = applyFit(rawRayA);
                    positions[rayBId] = applyFit(rawRayB);
                    positions[thirdPointId] = applyFit(rawThird);

                    circle.__renderCenter = { x: centerX, y: centerY };
                    circle.__renderRadius = targetRadius;

                    /*
                    * Fill in the inscribed angle's value for any
                    * downstream label rendering, if not already
                    * given (this is typically what's being asked).
                    */

                    // if (Array.isArray(angles)) {
                    //   const inscribedAngleValue = centralAngleValue / 2;

                    //   angles.forEach((angleEl) => {
                    //     if (angleEl.id === centralAngleEl.id) {
                    //       return;
                    //     }

                    //     const angleLetters = parseAngleLetters(angleEl);

                    //     if (
                    //       typeof angleEl.value !== "number" &&
                    //       angleLetters &&
                    //       angleLetters[1] === points[thirdPointId]?.label
                    //     ) {
                    //       angleEl.value = inscribedAngleValue;
                    //     }
                    //   });
                    // }

                    specializedCircleGeometry = true;

                    /*console.log("[CENTRAL -> INSCRIBED ANGLE]", {
                      circleId: circle.id,
                      center: circle.__renderCenter,
                      radius: circle.__renderRadius,
                      centralAngle: centralAngleValue,
                      inscribedAngle: centralAngleValue / 2,
                      positions: {
                        [centerPoint.label]: positions[centerPointId],
                        [letters[0]]: positions[rayAId],
                        [letters[2]]: positions[rayBId],
                        [points[thirdPointId]?.label]: positions[thirdPointId],
                      },
                    });*/
                  }
                }
              }
            }
          }
        }
      }



      /*
    * ==========================================================
    * CIRCLE: TWO TANGENTS FROM AN EXTERNAL POINT
    * ==========================================================
    *
    * Input structure:
    *
    *              A
    *             / \
    *            /   \
    *           /     \
    *          P       O
    *           \     /
    *            \   /
    *             \ /
    *              B
    *
    * PA and PB are tangents from external point P.
    *
    * Tangent theorem:
    *
    *             PA = PB
    *
    * Therefore, if:
    *
    * PA = expressionA
    * PB = expressionB
    *
    * then:
    *
    * expressionA = expressionB
    *
    * Solve for x and evaluate both lengths.
    *
    * IMPORTANT:
    *
    * - Do NOT hardcode question values.
    * - Do NOT require point_o.
    * - Use getSegmentEndpoints().
    * - Use solveEquation().
    * - Use the existing expression evaluator.
    * - Circle center is rendering metadata only.
    * ==========================================================
    */

    const equalTangentRelationship =
      relationships.find(
        (relationship) =>
          relationship.type === "equal_to" &&
          Array.isArray(
            relationship.elements
          ) &&
          relationship.elements.length === 2
      );

    if ( equalTangentRelationship && !specializedCircleGeometry) {
      /*
      * --------------------------------------------------------
      * IDENTIFY THE TWO SEGMENTS
      * --------------------------------------------------------
      */

      const tangentSegmentIds =
        equalTangentRelationship.elements;

      const tangentSegmentA =
        segments.find(
          (segment) =>
            segment.id ===
            tangentSegmentIds[0]
        );

      const tangentSegmentB =
        segments.find(
          (segment) =>
            segment.id ===
            tangentSegmentIds[1]
        );

      /*
      * --------------------------------------------------------
      * VALIDATE SEGMENTS
      * --------------------------------------------------------
      */

      if ( tangentSegmentA && tangentSegmentB ) {
        /*
        * ------------------------------------------------------
        * GET SEGMENT ENDPOINTS
        * ------------------------------------------------------
        */

        const endpointsA =  getSegmentEndpoints(tangentSegmentA, points);

        const endpointsB = getSegmentEndpoints( tangentSegmentB, points );

        if ( endpointsA &&  endpointsB ) {
          /*
          * ----------------------------------------------------
          * FIND COMMON EXTERNAL POINT
          * ----------------------------------------------------
          *
          * PA and PB must share the same external point.
          */

          const externalPointId =
            endpointsA.firstId ===
              endpointsB.firstId ||
            endpointsA.firstId ===
              endpointsB.secondId
              ? endpointsA.firstId
              : endpointsA.secondId ===
                  endpointsB.firstId ||
                endpointsA.secondId ===
                  endpointsB.secondId
                ? endpointsA.secondId
                : null;

          /*
          * ----------------------------------------------------
          * FIND TANGENCY POINTS
          * ----------------------------------------------------
          */

          let tangentPointAId = null;
          let tangentPointBId = null;

          if (externalPointId) {
            tangentPointAId =
              endpointsA.firstId ===
                externalPointId
                ? endpointsA.secondId
                : endpointsA.firstId;

            tangentPointBId =
              endpointsB.firstId ===
                externalPointId
                ? endpointsB.secondId
                : endpointsB.firstId;
          }

          /*
          * ----------------------------------------------------
          * FIND CIRCLE
          * ----------------------------------------------------
          */

          const tangentCircle =
            circles.find(
              (circle) =>
                circle &&
                circle.type === "circle"
            );

          /*
          * ----------------------------------------------------
          * GET EXPRESSIONS
          * ----------------------------------------------------
          */

          const expressionA =
            tangentSegmentA.value_expression;

          const expressionB =
            tangentSegmentB.value_expression;

          if (
            externalPointId &&
            tangentPointAId &&
            tangentPointBId &&
            tangentCircle &&
            expressionA &&
            expressionB
          ) {
            /*
            * --------------------------------------------------
            * BUILD EQUATION
            * --------------------------------------------------
            */

            const equation =  `${expressionA} = ${expressionB}`;

            /*
            * --------------------------------------------------
            * SOLVE EQUATION
            * --------------------------------------------------
            */

            const solvedX =   solveEquation( equation );

            /*
            * --------------------------------------------------
            * EVALUATE TANGENT LENGTHS
            * --------------------------------------------------
            */

            let tangentLengthA = null;
            let tangentLengthB = null;

            if (
              Number.isFinite(
                Number(solvedX)
              )
            ) {
              tangentLengthA =
                evaluateExpression(
                  expressionA,
                  {
                    x: Number(solvedX),
                  }
                );

              tangentLengthB =
                evaluateExpression(
                  expressionB,
                  {
                    x: Number(solvedX),
                  }
                );
            }

            /*
            * --------------------------------------------------
            * VALIDATE LENGTHS
            * --------------------------------------------------
            */

            if (
              Number.isFinite(
                tangentLengthA
              ) &&
              Number.isFinite(
                tangentLengthB
              ) &&
              tangentLengthA > 0 &&
              tangentLengthB > 0
            ) {
              /*
              * ------------------------------------------------
              * USE A COMMON TANGENT LENGTH
              * ------------------------------------------------
              *
              * They should be equal because of the
              * equal_to relationship.
              *
              * Average them to avoid tiny floating-point
              * differences.
              */

              const tangentLength =
                (
                  tangentLengthA +
                  tangentLengthB
                ) / 2;

              /*
              * ------------------------------------------------
              * SVG LAYOUT
              * ------------------------------------------------
              *
              * We construct a clean symmetric
              * tangent configuration.
              *
              * P is the external point.
              * A and B are tangent points.
              */

              const secantHalfLength =
                tangentLength * 0.65;

              /*
              * Keep the mathematical rendering
              * comfortably inside the SVG.
              */

              const maximumWidth =
                secantHalfLength * 2 +
                tangentLength;

              const maximumHeight =
                tangentLength;

              const horizontalScale =
                maximumWidth > 0
                  ? SVG_AVAILABLE_WIDTH /
                    maximumWidth
                  : 1;

              const verticalScale =
                maximumHeight > 0
                  ? SVG_AVAILABLE_HEIGHT /
                    maximumHeight
                  : 1;

              const scale =
                Math.min(
                  horizontalScale,
                  verticalScale
                );

              /*
              * ------------------------------------------------
              * VISUAL TANGENT LENGTH
              * ------------------------------------------------
              */

              const visualTangentLength =
                tangentLength *
                scale;

              const visualHalfChord =
                secantHalfLength *
                scale;

              /*
              * ------------------------------------------------
              * POSITION P
              * ------------------------------------------------
              */

              const externalX =
                centerX -
                visualHalfChord -
                visualTangentLength *
                  0.35;

              const externalY =
                centerY;

              positions[
                externalPointId
              ] = {
                x: externalX,
                y: externalY,
              };

              /*
              * ------------------------------------------------
              * POSITION A
              * ------------------------------------------------
              */

              positions[
                tangentPointAId
              ] = {
                x:
                  externalX +
                  visualHalfChord,
                y:
                  externalY -
                  visualTangentLength *
                    0.55,
              };

              /*
              * ------------------------------------------------
              * POSITION B
              * ------------------------------------------------
              */

              positions[
                tangentPointBId
              ] = {
                x:
                  externalX +
                  visualHalfChord,
                y:
                  externalY +
                  visualTangentLength *
                    0.55,
              };

              /*
              * ------------------------------------------------
              * DERIVE CIRCLE
              * ------------------------------------------------
              *
              * A and B are symmetric tangent points.
              *
              * The circle center is horizontally
              * aligned with P.
              */

              const pointA =
                positions[
                  tangentPointAId
                ];

              const pointB =
                positions[
                  tangentPointBId
                ];

              /*
              * Midpoint of AB.
              */

              const circleCenterX =
                (
                  pointA.x +
                  pointB.x
                ) / 2;

              const circleCenterY =
                (
                  pointA.y +
                  pointB.y
                ) / 2;

              /*
              * Radius is the distance from
              * circle center to A.
              */

              const radiusDX =  pointA.x -  circleCenterX;

              const radiusDY =  pointA.y - circleCenterY;

              const displayRadius =
                Math.sqrt(
                  radiusDX *
                    radiusDX +
                  radiusDY *
                    radiusDY
                );

              /*
              * ------------------------------------------------
              * VALIDATE CIRCLE
              * ------------------------------------------------
              */

              if (
                Number.isFinite(
                  circleCenterX
                ) &&
                Number.isFinite(
                  circleCenterY
                ) &&
                Number.isFinite(
                  displayRadius
                ) &&
                displayRadius > 0
              ) {
                /*
                * ----------------------------------------------
                * STORE SPECIALIZED CIRCLE RENDER DATA
                * ----------------------------------------------
                */

                tangentCircle.__renderCenter =
                  {
                    x:
                      circleCenterX,
                    y:
                      circleCenterY,
                  };

                tangentCircle.__renderRadius =
                  displayRadius;

                /*
                * ----------------------------------------------
                * DEBUG
                * ----------------------------------------------
                */

                // console.log(
                //   "[TWO TANGENTS GEOMETRY]",
                //   {
                //     externalPointId,

                //     tangentPointAId,

                //     tangentPointBId,

                //     expressionA,

                //     expressionB,

                //     equation,

                //     solvedX,

                //     tangentLengthA,

                //     tangentLengthB,

                //     tangentLength,

                //     circleCenterX,

                //     circleCenterY,

                //     displayRadius,
                //   }
                // );

                /*
                * ----------------------------------------------
                * MARK SPECIALIZED GEOMETRY AS HANDLED
                * ----------------------------------------------
                */

                specializedCircleGeometry =  true;
              }
            }
          }
        }
      }
    }


    /*
    * ==========================================================
    * CIRCLE: EXTERNAL SECANT + SECANT ANGLE GEOMETRY
    * ==========================================================
    *
    * Input structure:
    *
    *                 A
    *                /
    *               /
    *              B
    *             /
    *            P
    *             \
    *              C
    *               \
    *                D
    *
    * P is external to the circle.
    *
    * P-A-B are collinear.
    * P-C-D are collinear.
    *
    * PB and PD are secants.
    *
    * External secant angle theorem:
    *
    * angle P =
    *     1/2 × (far arc - near arc)
    *
    * In this input:
    *
    * arc AC = 70°
    * arc BD = 30°
  
    *
    * IMPORTANT:
    *
    * - Do NOT hardcode arc values.
    * - Do NOT require point_o.
    * - Use getSegmentEndpoints().
    * - Use relationship data to identify geometry.
    * - Circle center is rendering metadata only.
    * ==========================================================
    */

      if (!specializedCircleGeometry) {
       
        const arcAC = relationships.find(
          (r) => r.type === "has_value" && r.elements.includes("arc_ac")
        );
        const arcBD = relationships.find(
          (r) => r.type === "has_value" && r.elements.includes("arc_bd")
        );

        if (arcAC && arcBD) {
          const farArcValue = Number(arcAC.value);
          const nearArcValue = Number(arcBD.value);
          const externalAngle = (farArcValue - nearArcValue) / 2;

          if (externalAngle > 0) {
            // 1. Convert external angle to radians and clamp to a safe threshold (< 90 deg)
            const extAngleRad = (Math.min(externalAngle, 60) * Math.PI) / 180;

            // 2. Set radius dynamic to available canvas extents
            const r = Math.min(HALF_W, HALF_H) 

            // 3. Compute distance dP mathematically so sin(extAngleRad) < (r / dP)
            // Using a 0.70 factor guarantees the secant rays slice well inside the circle
            const safeSinFactor = 0.70;
            const dP = r / (Math.sin(extAngleRad) / safeSinFactor);

            // 4. Center the combined geometry (Point P to Center C) dynamically around centerX/centerY
            const totalSpanX = dP + r;
            const startX = centerX - totalSpanX / 2;

            const px = startX;
            const py = centerY;
            positions["point_p"] = { x: px, y: py };

            const cx = px + dP;
            const cy = centerY;

            if (points["point_o"]) {
              positions["point_o"] = { x: cx, y: cy };
            }

            // 5. Robust Line-Circle Intersection helper
            function lineCircleIntersections(px, py, angle, cx, cy, r) {
              const dx = Math.cos(angle);
              const dy = Math.sin(angle);

              const fx = px - cx;
              const fy = py - cy;

              const a = dx * dx + dy * dy; // 1.0
              const b = 2 * (fx * dx + fy * dy);
              const c = fx * fx + fy * fy - r * r;

              const disc = b * b - 4 * a * c;
              if (disc < 0) return []; // Should not trigger now because dP is dynamically bounded

              const sqrtDisc = Math.sqrt(disc);
              const t1 = (-b - sqrtDisc) / (2 * a);
              const t2 = (-b + sqrtDisc) / (2 * a);

              // t1 is entry point (near), t2 is exit point (far)
              return [
                { x: px + t1 * dx, y: py + t1 * dy }, // Near point (A or C)
                { x: px + t2 * dx, y: py + t2 * dy }, // Far point (B or D)
              ];
            }

            // Two secant directions
            const baseAngle = Math.atan2(cy - py, cx - px);
            const angleAB = baseAngle - extAngleRad;
            const angleCD = baseAngle + extAngleRad;

            const ptsAB = lineCircleIntersections(px, py, angleAB, cx, cy, r);
            const ptsCD = lineCircleIntersections(px, py, angleCD, cx, cy, r);

            if (ptsAB.length === 2 && ptsCD.length === 2) {
                // t1 (ptsAB[0]) is the NEAR intersection (Point B)
                // t2 (ptsAB[1]) is the FAR intersection (Point A)
                const [B, A] = ptsAB; 

                // t1 (ptsCD[0]) is the NEAR intersection (Point D)
                // t2 (ptsCD[1]) is the FAR intersection (Point C)
                const [D, C] = ptsCD; 

                positions["point_a"] = A; // Far point (Arc AC = 70°)
                positions["point_b"] = B; // Near point (Arc BD = 30°)
                positions["point_c"] = C; // Far point (Arc AC = 70°)
                positions["point_d"] = D; // Near point (Arc BD = 30°)

                // Rest of rendering data remains the same...
                const circle = circles.find((c) => c && c.type === "circle");
                if (circle) {
                  circle.__renderCenter = { x: cx, y: cy };
                  circle.__renderRadius = r;
                }

                // Update polylines to represent ray order: P -> B -> A and P -> D -> C
                const relPAB = relationships.find(
                  (rel) =>
                    rel.type === "collinear" &&
                    rel.elements.includes("point_p") &&
                    rel.elements.includes("point_a") &&
                    rel.elements.includes("point_b")
                );
                if (relPAB) {
                  relPAB.__renderPolyline = ["point_p", "point_b", "point_a"];
                }

                const relPCD = relationships.find(
                  (rel) =>
                    rel.type === "collinear" &&
                    rel.elements.includes("point_p") &&
                    rel.elements.includes("point_c") &&
                    rel.elements.includes("point_d")
                );
                if (relPCD) {
                  relPCD.__renderPolyline = ["point_p", "point_d", "point_c"];
                }

                // Keep explicit segments for compatibility (connecting P to the furthest points A & C)
                const segPA = segments.find((s) => s.id === "segment_pa" || s.id === "segment_pb");
                if (segPA) segPA.__renderEndpoints = [positions["point_p"], positions["point_a"]];

                const segPC = segments.find((s) => s.id === "segment_pc" || s.id === "segment_pd");
                if (segPC) segPC.__renderEndpoints = [positions["point_p"], positions["point_c"]];

                specializedCircleGeometry = true;
              }
          }
        }
      }


      /*
      * ==========================================================
      *CIRCLE:  CENTRAL ANGLE + ARC LENGTH GEOMETRY
      * ==========================================================
      */


       // --- Circle + central angle ---
  const angleRel = relationships.find(
    r => r.type === "has_value" && r.element_id === "angle_aob"
  );
  const segOA = segments.find(s => s.id === "segment_oa");
  const segOB = segments.find(s => s.id === "segment_ob");

  if (angleRel && segOA && segOB) {
    
    const angleValue = Number(angleRel.value); // e.g. 150°
    // Center O
    positions["point_o"] = { x: centerX, y: centerY };

    // Circle render data
    const circle = circles.find(c => c.type === "circle");
    if (circle) {
      circle.__renderCenter = { x: centerX, y: centerY };

      // Deliberately fuller than the shared FILL_FACTOR (0.80): this case
      // has no external points sticking out past the circle, so it can
      // safely use more of the canvas.
      const CENTRAL_ANGLE_FILL_FACTOR = 0.85;

      const targetRadius =
        (Math.min(SVG_AVAILABLE_WIDTH, SVG_AVAILABLE_HEIGHT) / 2) *  CENTRAL_ANGLE_FILL_FACTOR;
      // scale radius to fit SVG canvas
      circle.__renderRadius = targetRadius
    }

    // Place A at 0° (to the right)
    const ax = centerX + circle.__renderRadius;
    const ay = centerY;
    positions["point_a"] = { x: ax, y: ay };

    // Place B rotated by angleValue counterclockwise
    const rad = (Math.PI / 180) * angleValue;
    const bx = centerX + circle.__renderRadius * Math.cos(rad);
    const by = centerY - circle.__renderRadius * Math.sin(rad);
    positions["point_b"] = { x: bx, y: by };

    // Wire segments OA and OB
    segOA.__renderEndpoints = [positions["point_o"], positions["point_a"]];
    segOB.__renderEndpoints = [positions["point_o"], positions["point_b"]];

    // Wire angle AOB
    const angleObj = angles.find(a => a.id === "angle_aob");
    if (angleObj) {
      angleObj.__renderVertex = positions["point_o"];
      angleObj.__renderArms = [positions["point_a"], positions["point_b"]];
      angleObj.__renderValue = angleValue;
    }

    // Wire arc AB
    const arcRel = relationships.find(rel =>
      rel.elements && rel.elements.includes("arc_ab")
    );
    if (arcRel) {
      arcRel.__renderArc = {
        center: positions["point_o"],
        radius: circle.__renderRadius,
        start: positions["point_a"],
        end: positions["point_b"],
        sweep: angleValue,
      };
    }

    specializedCircleGeometry = true;
  }

    /*
      * ------------------------------------------
      *CIRCLE: RADIUS CASE
      * ------------------------------------------
     *
     * Only run if tangent/chord geometry
     * did NOT already handle this circle.
     * ------------------------------------------
     */

    if ( centerId && !specializedCircleGeometry && !hasTwoChordGeometry ) {
      const radiusSegment =  segments.find((segment) => {
          const endpoints = getSegmentEndpoints( segment,  points);

          if (!endpoints) {
            return false;
          }

          const normalizedLabel =
            String(segment.label || "")
              .replace(/\$/g, "")
              .trim()
              .toLowerCase();

          /*
           * Radius case should specifically
           * identify r.
           *
           * Do not accidentally treat every
           * center-connected segment as radius.
           */

          if (normalizedLabel !== "r") {
            return false;
          }

          return (
            endpoints.firstId === centerId ||
            endpoints.secondId === centerId
          );
        });

      if (radiusSegment) {
        const endpoints = getSegmentEndpoints(radiusSegment, points);

        if (endpoints) {
          const otherId = endpoints.firstId === centerId
              ? endpoints.secondId
              : endpoints.firstId;

          positions[centerId] = {
            x: centerX,
            y: centerY,
          };

          if (otherId) {
            positions[otherId] = {
              x: centerX + radius,
              y: centerY,
            };
          }

          const center = positions[centerId];
          const radiusPoint = positions[otherId];

          if ( center && radiusPoint) {
            circle.__renderRadius =
              Math.hypot(
                radiusPoint.x - center.x,
                radiusPoint.y - center.y
              );
          }

          specializedCircleGeometry = true;
        }
      }
    }

    /*
     * ------------------------------------------
     *CIRCLE:  DIAMETER CASE
     * ------------------------------------------
     *
     * A ---- O ---- B
     *
     * O is midpoint of AB.
     * ------------------------------------------
     */

    const midpointRelationship =
      relationships.find(
        (relationship) =>
          relationship.type === "midpoint_of" &&
          relationship.element_id &&
          relationship.target_segment
      );

    if (
      midpointRelationship &&
      centerId &&
      !specializedCircleGeometry &&
      !hasTwoChordGeometry
    ) {
      const diameterSegment =
        segments.find(
          (segment) =>
            segment.id === midpointRelationship.target_segment
        );

      if (diameterSegment) {
        const endpoints =
          getSegmentEndpoints(
            diameterSegment,
            points
          );

        if (endpoints) {
          const firstId = endpoints.firstId;
          const secondId = endpoints.secondId;

          positions[firstId] = {
            x: centerX - radius,
            y: centerY,
          };

          positions[secondId] = {
            x: centerX + radius,
            y: centerY,
          };

          positions[centerId] = {
            x: centerX,
            y: centerY,
          };

          circle.__renderRadius =  radius;
          specializedCircleGeometry = true;
        }
      }
    }

  /*
 * --------------------------------------------------
 * CIRCLE: TWO CHORD CASE
 * --------------------------------------------------
 *
 * Example:
 *
 *          A -------- B
 *               M
 *               |
 *               |
 *               O
 *               |
 *               |
 *               N
 *          C -------- D
 *
 * OM ⟂ AB
 * ON ⟂ CD
 *
 * M = midpoint(AB)
 * N = midpoint(CD)
 *
 * Known:
 *
 * AB = 12
 * OM = 8
 * CD = 16
 *
 * Therefore:
 *
 * r² = OM² + (AB / 2)²
 *
 * ON² = r² - (CD / 2)²
 */

if (  hasTwoChordGeometry) {


  /*
   * ------------------------------------------
   * FIND MIDPOINT RELATIONSHIPS
   * ------------------------------------------
   */

  const midpointRelationships =
    relationships.filter(
      (relationship) =>
        relationship.type === "midpoint_of" &&
        relationship.element_id &&
        relationship.target_segment
    );

  /*
   * ------------------------------------------
   * FIND LENGTH RELATIONSHIPS
   * ------------------------------------------
   */

  const lengthRelationships =
    relationships.filter(
      (relationship) =>
        relationship.type === "has_length" &&
        relationship.element_id &&
        Number.isFinite(
          Number(relationship.value)
        )
    );

  /*
   * ------------------------------------------
   * FIND PERPENDICULAR RELATIONSHIPS
   * ------------------------------------------
   */

  const perpendicularRelationships =
    relationships.filter(
      (relationship) =>
        relationship.type === "perpendicular_to" &&
        Array.isArray(
          relationship.elements
        ) &&
        relationship.elements.length === 2
    );

  /*
   * ------------------------------------------
   * BUILD CHORD DATA
   * ------------------------------------------
   */

  const chords =
    midpointRelationships
      .map((midpointRelationship) => {
        const midpointId =
          midpointRelationship.element_id;

        const chordSegmentId =
          midpointRelationship.target_segment;

        const chordSegment =
          segments.find(
            (segment) =>
              segment.id ===
              chordSegmentId
          );

        if (!chordSegment) {
          return null;
        }

        const endpoints =
          getSegmentEndpoints(
            chordSegment,
            points
          );

        if (!endpoints) {
          return null;
        }

        const lengthRelationship =
          lengthRelationships.find(
            (relationship) =>
              relationship.element_id ===
              chordSegmentId
          );

        return {
          midpointId,
          segmentId: chordSegmentId,
          firstId: endpoints.firstId,
          secondId: endpoints.secondId,
          length:
            lengthRelationship
              ? Number(
                  lengthRelationship.value
                )
              : null,
        };
      })
      .filter(Boolean);

  /*
   * ------------------------------------------
   * CENTER -> MIDPOINT SEGMENTS
   * ------------------------------------------
   */

  const centerSegments =
    segments.filter((segment) => {
      const endpoints =
        getSegmentEndpoints(
          segment,
          points
        );

      if (!endpoints) {
        return false;
      }

      return (
        endpoints.firstId === centerId ||
        endpoints.secondId === centerId
      );
    });

  /*
   * ------------------------------------------
   * MATCH CHORD WITH OM / ON
   * ------------------------------------------
   */

  const chordCases = [];
  perpendicularRelationships.forEach(
    (relationship) => {
      const [
        firstElementId,
        secondElementId,
      ] = relationship.elements;

      /*
       * Find chord side.
       */

      const chord =
        chords.find(
          (item) =>
            item.segmentId === firstElementId ||
            item.segmentId === secondElementId
        );

      if (!chord) {
        return;
      }

      /*
       * Find center -> midpoint segment.
       */

      const centerSegment =
        centerSegments.find(
          (segment) => {
            const endpoints = getSegmentEndpoints( segment, points );

            if (!endpoints) {
              return false;
            }

            const otherId = endpoints.firstId === centerId
                ? endpoints.secondId
                : endpoints.firstId;

            return (
              otherId ===  chord.midpointId
            );
          }
        );

      if (!centerSegment) {
        return;
      }

      chordCases.push({ chord, centerSegment, });
    }
  );

 /*
 * ------------------------------------------
 * TWO CHORD GEOMETRY CALCULATION
 * ------------------------------------------
 *
 * AB = 12
 * OM = 8
 * CD = 16
 *
 * For a chord:
 *
 * radius² = distance² + (chord / 2)²
 *
 * Therefore:
 *
 * r² = 8² + (12 / 2)²
 *    = 64 + 36
 *    = 100
 *
 * r = 10
 *
 * For CD:
 *
 * ON² = 10² - (16 / 2)²
 *     = 100 - 64
 *     = 36
 *
 * ON = 6
 */

if (chordCases.length >= 2) {
  const first = chordCases[0];
  const second = chordCases[1];

  /*
   * ----------------------------------------
   * GET CENTER-TO-CHORD DISTANCE
   * ----------------------------------------
   *
   * The distance is represented by the
   * center segment itself, e.g. OM or ON.
   */

  const getSegmentLength = (segmentId) => {
    const relationship =
      relationships.find(
        (item) =>
          item.type === "has_length" &&
          item.element_id === segmentId &&
          Number.isFinite(
            Number(item.value)
          )
      );

    return relationship
      ? Number(relationship.value)
      : null;
  };

  const firstDistance =  getSegmentLength( first.centerSegment.id );
  const secondDistance = getSegmentLength( second.centerSegment.id);

  /*
   * ----------------------------------------
   * IDENTIFY KNOWN CHORD
   * ----------------------------------------
   *
   * We need one chord whose:
   *
   * - chord length is known
   * - center distance is known
   */

  let known = null;
  let other = null;

  if ( Number.isFinite(first.chord.length) && Number.isFinite(firstDistance)) {
    known = {
      chord: first.chord,
      centerSegment: first.centerSegment,
      distance: firstDistance,
    };

    other = {
      chord: second.chord,
      centerSegment: second.centerSegment,
      distance: secondDistance,
    };
  } else if (
    Number.isFinite( second.chord.length ) &&
    Number.isFinite( secondDistance )
  ) {
    known = {
      chord: second.chord,
      centerSegment: second.centerSegment,
      distance: secondDistance,
    };

    other = {
      chord: first.chord,
      centerSegment: first.centerSegment,
      distance: firstDistance,
    };
  }


  /*
   * ----------------------------------------
   * CALCULATE
   * ----------------------------------------
   */

    if ( 
      known && other && 
      Number.isFinite( known.chord.length ) && 
      Number.isFinite( known.distance ) && 
      Number.isFinite(other.chord.length)
    ) {
    /*
     * --------------------------------------
     * RADIUS
     * --------------------------------------
     */

    const knownHalfChord = known.chord.length / 2;
    const radiusSquared = known.distance * known.distance +  knownHalfChord * knownHalfChord;
    const circleRadius =  Math.sqrt( radiusSquared );

    /*
     * --------------------------------------
     * SECOND CHORD DISTANCE
     * --------------------------------------
     */

    const otherHalfChord =  other.chord.length / 2;

    const otherDistanceSquared = radiusSquared - otherHalfChord * otherHalfChord;

    if (otherDistanceSquared >= 0 ) {
      const otherDistance = Math.sqrt(otherDistanceSquared );

      /*
       * ------------------------------------
       * SVG SCALE
       * ------------------------------------
       *
       * Keep the entire circle inside
       * the SVG.
       */

      const svgRadius = radius

      const scale = svgRadius / circleRadius;
      const knownDistancePx = known.distance * scale;
      const otherDistancePx = otherDistance * scale;
      const knownHalfPx = knownHalfChord * scale;
      const otherHalfPx = otherHalfChord *  scale;

      /*
       * ------------------------------------
       * CENTER
       * ------------------------------------
       */

      positions[centerId] = { x: centerX, y: centerY, };
      circle.__renderRadius =  svgRadius;
      /*
       * ------------------------------------
       * KNOWN CHORD
       * ------------------------------------
       *
       * Put known chord above center.
       */

      const knownY = centerY -  knownDistancePx;

      positions[ known.chord.midpointId] = { x: centerX,  y: knownY, };
      positions[ known.chord.firstId ] = { x: centerX - knownHalfPx,  y: knownY, };
      positions[ known.chord.secondId ] = {x: centerX + knownHalfPx,  y: knownY, };

      /*
       * ------------------------------------
       * OTHER CHORD
       * ------------------------------------
       *
       * Put second chord below center.
       */

      const otherY = centerY + otherDistancePx;
      positions[other.chord.midpointId] = {
        x: centerX,
        y: otherY,
      };

      positions[other.chord.firstId] = {
        x:centerX - otherHalfPx,
        y: otherY,
      };

      positions[ other.chord.secondId ] = {
        x: centerX + otherHalfPx,
        y: otherY,
      };

      /*
       * ------------------------------------
       * DONE
       * ------------------------------------
       */

      specializedCircleGeometry = true;
    }
  }
}
}



/******************************************************
   * ----------------------------------------------------
   *CIRCLE: TANGENT + SECANT GEOMETRY
   * ----------------------------------------------------
   *
   * Input structure:
   *
   *              T
   *             /
   *            /
   * P -------- A -------- B
   *
   * PT = tangent length
   * PA = external secant portion
   * PB = complete secant
   *
   * Power of a point:
   *
   * PT² = PA × PB
   *
   * Therefore:
   *
   * PB = PT² / PA
   * AB = PB - PA
   *
   * IMPORTANT:
   *
   * - Do NOT require point_o.
   * - Do NOT hardcode question values.
   * - Use getSegmentEndpoints().
   * - Derive the circle from the supplied geometry.
   * - SVG scaling is derived from the actual values.
   ******************************************************/

  const tangentRelationship =
    relationships.find(
      (relationship) =>
        relationship.type === "tangent_at_point" &&
        relationship.at_point
    );

  const secantRelationship =
    relationships.find(
      (relationship) =>
        relationship.type === "intersects" &&
        Array.isArray(
          relationship.at_points
        ) &&
        relationship.at_points.length >= 2
    );

  
  if ( tangentRelationship && secantRelationship 
    && !specializedCircleGeometry) {
    /*
    * ------------------------------------------
    * IDENTIFY TANGENCY / SECANT POINTS
    * ------------------------------------------
    */

    const tangentPointId = tangentRelationship.at_point;

    const secantPointIds = secantRelationship.at_points;

    /*
    * ------------------------------------------
    * FIND TANGENT SEGMENT
    * ------------------------------------------
    */

    const tangentSegmentId =
      Array.isArray(tangentRelationship.elements)
        ? tangentRelationship.elements[0]
        : null;

    const tangentSegment = segments.find((segment) =>segment.id === tangentSegmentId);

    if (tangentSegment) {
      const tangentEndpoints = getSegmentEndpoints(tangentSegment, points);

      if (tangentEndpoints) {
        /*
        * ----------------------------------------
        * FIND EXTERNAL POINT P
        * ----------------------------------------
        *
        * Tangent segment connects:
        *
        * P ---- T
        */

        const externalPointId = tangentEndpoints.firstId === tangentPointId
            ? tangentEndpoints.secondId
            : tangentEndpoints.firstId;

        /*
        * ----------------------------------------
        * FIND PA
        * ----------------------------------------
        */

        const paSegment =
          segments.find(
            (segment) => {
              const endpoints =
                getSegmentEndpoints(
                  segment,
                  points
                );

              if (!endpoints) {
                return false;
              }

              const connectsExternalToA =
                (
                  endpoints.firstId === externalPointId &&
                  endpoints.secondId === secantPointIds[0]
                ) ||
                (
                  endpoints.secondId === externalPointId &&
                  endpoints.firstId ===  secantPointIds[0]
                );

              return connectsExternalToA;
            }
          );

        /*
        * ----------------------------------------
        * FIND COMPLETE SECANT PB
        * ----------------------------------------
        *
        * PB connects the external point P
        * to the second circle intersection B.
        */

        const pbSegment =
          segments.find(
            (segment) => {
              const endpoints = getSegmentEndpoints( segment, points );

              if (!endpoints) {
                return false;
              }

              const hasExternalPoint =
                endpoints.firstId === externalPointId ||
                endpoints.secondId === externalPointId;

              if (!hasExternalPoint) {
                return false;
              }

              const otherId =
                endpoints.firstId === externalPointId
                  ? endpoints.secondId
                  : endpoints.firstId;

              return (
                otherId === secantPointIds[1]
              );
            }
          );

        /*
        * ----------------------------------------
        * LENGTH HELPER
        * ----------------------------------------
        */

        const getKnownLength =
          (segmentId) => {
            if (!segmentId) {
              return null;
            }

            const relationship =
              relationships.find(
                (item) =>
                  item.type ===
                    "has_length" &&
                  item.element_id ===
                    segmentId &&
                  Number.isFinite(
                    Number(
                      item.value
                    )
                  )
              );

            return relationship
              ? Number(relationship.value )
              : null;
          };

        /*
        * ----------------------------------------
        * GET KNOWN LENGTHS
        * ----------------------------------------
        */

        const tangentLength = getKnownLength(tangentSegment.id );

        const paLength = paSegment ? getKnownLength( paSegment.id) : null;

        /*
        * PB may already be explicitly supplied.
        *
        * If it is not supplied, derive it
        * using power of a point.
        */

        let pbLength = pbSegment ? getKnownLength( pbSegment.id ) : null;

        /*
        * ----------------------------------------
        * DERIVE PB
        * ----------------------------------------
        *
        * PT² = PA × PB
        */

        if (
          !Number.isFinite(pbLength) &&
          Number.isFinite(tangentLength) &&
          Number.isFinite(paLength) &&
          paLength > 0
        ) {
          pbLength = (tangentLength * tangentLength) / paLength;
        }

        /*
        * ----------------------------------------
        * DERIVE AB
        * ----------------------------------------
        */

        let abLength = null;

        if ( 
          Number.isFinite(pbLength) &&
          Number.isFinite(paLength)
        ) {
          abLength = pbLength - paLength;
        }

        /*
        * ----------------------------------------
        * VALIDATE
        * ----------------------------------------
        */

        const validGeometry =
          Number.isFinite(tangentLength) &&
          Number.isFinite(paLength) &&
          Number.isFinite(pbLength) &&
          Number.isFinite(abLength) &&
          tangentLength > 0 &&
          paLength > 0 &&
          pbLength > paLength &&
          abLength > 0;

        if (validGeometry) {
          /*
          * --------------------------------------
          * DEBUG
          * --------------------------------------
          */

          // console.log(
          //   "[TANGENT SECANT INPUT]",
          //   {
          //     externalPointId,
          //     tangentPointId,
          //     secantPointIds,
          //     tangentSegmentId:
          //       tangentSegment.id,
          //     paSegmentId:
          //       paSegment?.id || null,
          //     pbSegmentId:
          //       pbSegment?.id || null,
          //     tangentLength,
          //     paLength,
          //     pbLength,
          //     abLength,
          //   }
          // );

          /*
          * --------------------------------------
          * MATHEMATICAL CIRCLE
          * --------------------------------------
          *
          * Put:
          *
          * P = (0, 0)
          * A = (PA, 0)
          * B = (PB, 0)
          *
          * Since A and B lie on the circle,
          * the circle center is:
          *
          * Ox = (PA + PB) / 2
          *
          * The radius is:
          *
          * r = (PB - PA) / 2
          *
          * But we must also satisfy:
          *
          * OP² - r² = PT²
          *
          * which follows from power of a point.
          */

          const mathematicalCenterX = (paLength + pbLength) / 2;

          const mathematicalRadius = abLength / 2;

          /*
          * --------------------------------------
          * SVG SCALE
          * --------------------------------------
          *
          * One scale for the entire construction.
          */

          const maximumMathematicalWidth = pbLength;

          const maximumMathematicalHeight = tangentLength;

          const horizontalScale =
            maximumMathematicalWidth > 0
              ? SVG_AVAILABLE_WIDTH / maximumMathematicalWidth
              : 1;

          const verticalScale =
            maximumMathematicalHeight > 0
              ? SVG_AVAILABLE_HEIGHT / maximumMathematicalHeight
              : 1;

          const scale =  Math.min( horizontalScale, verticalScale);

          /*
          * --------------------------------------
          * VISUAL POSITION
          * --------------------------------------
          */

          const secantY =  centerY

          /*
          * Center the complete secant
          * horizontally in the SVG.
          */

          const externalX = centerX - (pbLength * scale) / 2;

          const pointAX = externalX + paLength * scale;

          const pointBX = externalX + pbLength * scale;

          /*
          * --------------------------------------
          * POSITION P
          * --------------------------------------
          */

          positions[externalPointId] = {
            x: externalX,
            y: secantY,
          };

          /*
          * --------------------------------------
          * POSITION A
          * --------------------------------------
          */

          positions[secantPointIds[0]] = {
            x: pointAX,
            y: secantY,
          };

          /*
          * --------------------------------------
          * POSITION B
          * --------------------------------------
          */

          positions[secantPointIds[1]] = {
            x: pointBX,
            y: secantY,
          };

          /*
          * --------------------------------------
          * CIRCLE CENTER
          * --------------------------------------
          *
          * The center lies at the midpoint
          * of chord AB.
          */

          const circleCenterX = externalX + mathematicalCenterX * scale;
          const circleCenterY = secantY;

          /*
          * --------------------------------------
          * CIRCLE RADIUS
          * --------------------------------------
          */

          const displayRadius = mathematicalRadius * scale;

          /*
            * --------------------------------------
            * POSITION TANGENCY POINT
            * --------------------------------------
            *
            * Calculate the actual tangent point from
            * external point P to circle O.
            *
            * There are two valid tangent points.
            * We choose the upper one for rendering.
            */

            const pointP =  positions[externalPointId];

            if (pointP) {
              const dx = pointP.x - circleCenterX;

              const dy = pointP.y - circleCenterY;

              const distanceSquared = dx * dx + dy * dy;

              const radiusSquared =  displayRadius * displayRadius;

              if (distanceSquared > radiusSquared) {
                /*
                * Base point on the radius direction.
                */

                const factor = radiusSquared / distanceSquared;

                const baseX = circleCenterX + factor * dx;

                const baseY = circleCenterY + factor * dy;

                /*
                * Perpendicular offset to reach
                * the tangent point.
                */

                const tangentFactor =
                  displayRadius *
                  Math.sqrt(Math.max(0, distanceSquared - radiusSquared)) / distanceSquared;

                /*
                * Perpendicular vector:
                *
                * (-dy, dx)
                */

                const tangentX = baseX - tangentFactor * dy;

                const tangentY = baseY + tangentFactor * dx;

                positions[tangentPointId] = {
                  x: tangentX,
                  y: tangentY,
                };
              }
            }

          /*
          * --------------------------------------
          * STORE CIRCLE RENDER DATA
          * --------------------------------------
          */

          circle.__renderCenter = {
            x: circleCenterX,
            y: circleCenterY,
          };

          circle.__renderRadius =  displayRadius;

          /*
          * --------------------------------------
          * DONE
          * --------------------------------------
          */

          specializedCircleGeometry = true;
        }
      }
    }
  }

 
    /*
      * ------------------------------------------
      * CIRCLE: INTERSECTING CHORDS GEOMETRY DETECTION
      * ------------------------------------------
      *
      * Pattern:
      *
      * A ----- E ----- B
      *        /
      *       /
      *      C ----- D
      *
      * Two chords AB and CD intersect at E.
      *
      * Required:
      * - one "intersects" relationship containing
      *   segment_ab and segment_cd
      * - E is the target intersection point
      * - four segments AE, EB, CE, ED
      * - each partial segment may contain
      *   value_expression
      */

      /*
      * ------------------------------------------
      * ROBUST CHORD ENDPOINT RESOLUTION
      * ------------------------------------------
      *
      * getSegmentEndpoints() resolves a segment's endpoints from its
      * .label (e.g. "AE" -> point_a, point_e). That works fine for the
      * partial segments (AE/EB/CE/ED), which always have labels.
      *
      * But the FULL chord segments (segment_ab, segment_cd) often have
      * no .label at all in the schema -- only an id. In that case
      * getSegmentEndpoints() returns null, which silently breaks
      * detection downstream.
      *
      * This fallback resolves a chord's endpoints from the "collinear"
      * relationship that passes through the intersection point instead
      * (e.g. [point_a, point_e, point_b]) -- that relationship always
      * exists for this pattern and doesn't depend on the chord segment
      * having a label.
      */

      function getChordEndpointsRobust(
        chordSegment,
        intersectionPointId,
        points,
        fallbackGroup
      ) {
        const direct = getSegmentEndpoints(chordSegment, points);

        if (direct) {
          return direct;
        }

        if (fallbackGroup && Array.isArray(fallbackGroup.elements)) {
          const others = fallbackGroup.elements.filter(
            (id) => id !== intersectionPointId
          );

          if (others.length === 2) {
            return { firstId: others[0], secondId: others[1] };
          }
        }

        return null;
      }

      /*
      * ------------------------------------------
      * INTERSECTING CHORDS GEOMETRY DETECTION
      * ------------------------------------------
      */

      const intersectingChordsRelationship =
        relationships.find(
          (relationship) => {
            if (
              relationship.type !== "intersects" ||
              !Array.isArray(
                relationship.elements
              ) ||
              relationship.elements.length < 2
            ) {
              return false;
            }

            const segmentIds =
              relationship.elements.filter(
                (id) =>
                  segments.some(
                    (segment) =>
                      segment.id === id
                  )
              );

            if (segmentIds.length < 2) {
              return false;
            }

            const firstChordId = segmentIds[0];

            const secondChordId = segmentIds[1];

            const firstChord =
              segments.find(
                (segment) =>
                  segment.id === firstChordId
              );

            const secondChord =
              segments.find(
                (segment) =>
                  segment.id === secondChordId
              );

            if (!firstChord || !secondChord) {
              return false;
            }

            /*
            * Intersection target must be a point.
            * (We no longer require getSegmentEndpoints() to succeed on
            * the full chord segments here -- that check is unreliable
            * for unlabeled chord segments and isn't needed for detection.
            * Endpoints are resolved robustly, with a fallback, below.)
            */

            const intersectionPointId = relationship.target;

            if (
              !intersectionPointId ||
              !points[intersectionPointId]
            ) {
              return false;
            }

            return true;
          }
        );

      const hasIntersectingChordsGeometry =
        Boolean(
          intersectingChordsRelationship
        );

      /*
      * ------------------------------------------
      *CIRCLE: INTERSECTING CHORDS DATA
      * ------------------------------------------
      */

      if (
        hasIntersectingChordsGeometry &&
        !specializedCircleGeometry
      ) {
        const chordSegmentIds =
          intersectingChordsRelationship.elements;

        const firstChordId =
          chordSegmentIds[0];

        const secondChordId =
          chordSegmentIds[1];

        const firstChord =
          segments.find(
            (segment) =>
              segment.id === firstChordId
          );

        const secondChord =
          segments.find(
            (segment) =>
              segment.id === secondChordId
          );

        const intersectionPointId =
          intersectingChordsRelationship.target ||
          intersectingChordsRelationship.target_point;

        /*
        * ------------------------------------------
        * CHORD ENDPOINTS (ROBUST)
        * ------------------------------------------
        */

        const collinearGroupsThroughE =
          relationships.filter(
            (relationship) =>
              relationship.type === "collinear" &&
              Array.isArray(relationship.elements) &&
              relationship.elements.includes(
                intersectionPointId
              )
          );

        const firstChordEndpoints =
          getChordEndpointsRobust(
            firstChord,
            intersectionPointId,
            points,
            collinearGroupsThroughE[0]
          );

        const secondChordEndpoints =
          getChordEndpointsRobust(
            secondChord,
            intersectionPointId,
            points,
            collinearGroupsThroughE[1]
          );

        if (
          !firstChordEndpoints ||
          !secondChordEndpoints
        ) {
          console.warn(
            "[INTERSECTING CHORDS] Could not resolve chord endpoints",
            { firstChordEndpoints, secondChordEndpoints }
          );
        } else {

          /*
          * ------------------------------------------
          * FIND PARTIAL CHORD SEGMENTS
          * ------------------------------------------
          */

          const partialSegments = {
            AE: null,
            EB: null,
            CE: null,
            ED: null,
          };

          segments.forEach((segment) => {
            const endpoints =
              getSegmentEndpoints(
                segment,
                points
              );

            if (!endpoints) {
              return;
            }

            const firstId =
              endpoints.firstId;

            const secondId =
              endpoints.secondId;

            const connects =
              (a, b) =>
                (firstId === a && secondId === b) ||
                (firstId === b && secondId === a);

            if (
              connects(
                firstChordEndpoints.firstId,
                intersectionPointId
              )
            ) {
              partialSegments.AE =
                segment;
            }

            if (
              connects(
                intersectionPointId,
                firstChordEndpoints.secondId
              )
            ) {
              partialSegments.EB =
                segment;
            }

            if (
              connects(
                secondChordEndpoints.firstId,
                intersectionPointId
              )
            ) {
              partialSegments.CE =
                segment;
            }

            if (
              connects(
                intersectionPointId,
                secondChordEndpoints.secondId
              )
            ) {
              partialSegments.ED =
                segment;
            }
          });

          /*
          * ------------------------------------------
          * SOLVE INTERSECTING CHORDS EQUATION
          * ------------------------------------------
          */

          const aeExpression =
            partialSegments.AE?.value_expression;

          const ebExpression =
            partialSegments.EB?.value_expression;

          const ceExpression =
            partialSegments.CE?.value_expression;

          const edExpression =
            partialSegments.ED?.value_expression;

          if (
            aeExpression &&
            ebExpression &&
            ceExpression &&
            edExpression
          ) {
            const equation =
              `(${aeExpression}) * (${ebExpression}) = ` +
              `(${ceExpression}) * (${edExpression})`;

            const solvedX = solveEquation(equation);

            const variables = {
              x: solvedX,
            };

            const aeLength =
              evaluateExpression(
                aeExpression,
                variables
              );

            const ebLength =
              evaluateExpression(
                ebExpression,
                variables
              );

            const ceLength =
              evaluateExpression(
                ceExpression,
                variables
              );

            const edLength =
              evaluateExpression(
                edExpression,
                variables
              );

            /*
            * ------------------------------------------
            * STEP 1: PLACE CHORDS IN RAW / LOCAL SPACE
            * ------------------------------------------
            *
            * Place E at the local origin and lay out A, B, C, D using
            * the actual mathematical segment lengths directly (no pixel
            * scale yet). The absolute size/position here is thrown away
            * in step 3 -- only the SHAPE (relative lengths + crossing
            * angle) matters, which is what determines where the true
            * circumcircle center falls relative to these points.
            */

            const angle = 35 * (Math.PI / 180);

            const abDx = Math.cos(angle);
            const abDy = Math.sin(angle);

            const cdAngle = angle + Math.PI / 2;
            const cdDx = Math.cos(cdAngle);
            const cdDy = Math.sin(cdAngle);

            const rawPositions = {};

            rawPositions[firstChordEndpoints.firstId] = {
              x: -aeLength * abDx,
              y: -aeLength * abDy,
            };

            rawPositions[firstChordEndpoints.secondId] = {
              x: ebLength * abDx,
              y: ebLength * abDy,
            };

            rawPositions[secondChordEndpoints.firstId] = {
              x: -ceLength * cdDx,
              y: -ceLength * cdDy,
            };

            rawPositions[secondChordEndpoints.secondId] = {
              x: edLength * cdDx,
              y: edLength * cdDy,
            };

            rawPositions[intersectionPointId] = { x: 0, y: 0 };

            /*
            * ------------------------------------------
            * STEP 2: FIND THE TRUE CIRCUMCIRCLE (RAW SPACE)
            * ------------------------------------------
            */

            const intersectingChordsCircle =
              circles.find(
                (circle) =>
                  circle &&
                  circle.type === "circle"
              );

            let fittedPositions = rawPositions;

            if (intersectingChordsCircle) {
              const rawA = rawPositions[firstChordEndpoints.firstId];
              const rawB = rawPositions[firstChordEndpoints.secondId];
              const rawC = rawPositions[secondChordEndpoints.firstId];
              const rawD = rawPositions[secondChordEndpoints.secondId];

              const midpointAB = {
                x: (rawA.x + rawB.x) / 2,
                y: (rawA.y + rawB.y) / 2,
              };

              const midpointCD = {
                x: (rawC.x + rawD.x) / 2,
                y: (rawC.y + rawD.y) / 2,
              };

              const chordAB = { x: rawB.x - rawA.x, y: rawB.y - rawA.y };
              const chordCD = { x: rawD.x - rawC.x, y: rawD.y - rawC.y };

              const normalAB = { x: -chordAB.y, y: chordAB.x };
              const normalCD = { x: -chordCD.y, y: chordCD.x };

              const lengthAB = Math.sqrt(
                normalAB.x * normalAB.x + normalAB.y * normalAB.y
              );
              const lengthCD = Math.sqrt(
                normalCD.x * normalCD.x + normalCD.y * normalCD.y
              );

              if (lengthAB > 0 && lengthCD > 0) {
                normalAB.x /= lengthAB;
                normalAB.y /= lengthAB;
                normalCD.x /= lengthCD;
                normalCD.y /= lengthCD;

                const deltaX = midpointCD.x - midpointAB.x;
                const deltaY = midpointCD.y - midpointAB.y;

                const denominator =
                  normalAB.x * normalCD.y - normalAB.y * normalCD.x;

                if (Math.abs(denominator) > 0.000001) {
                  const t =
                    (deltaX * normalCD.y - deltaY * normalCD.x) /
                    denominator;

                  const rawCircleCenterX = midpointAB.x + normalAB.x * t;
                  const rawCircleCenterY = midpointAB.y + normalAB.y * t;

                  const radiusDX = rawCircleCenterX - rawA.x;
                  const radiusDY = rawCircleCenterY - rawA.y;

                  const rawRadius = Math.sqrt(
                    radiusDX * radiusDX + radiusDY * radiusDY
                  );

                  if (
                    Number.isFinite(rawCircleCenterX) &&
                    Number.isFinite(rawCircleCenterY) &&
                    Number.isFinite(rawRadius) &&
                    rawRadius > 0
                  ) {
                    /*
                    * ------------------------------------------
                    * STEP 3: FIT THE CIRCLE TO THE SVG CANVAS
                    * ------------------------------------------
                    *
                    * Apply one uniform scale + translate to the whole
                    * figure so the TRUE circumcircle lands centered at
                    * (centerX, centerY) and sized to fit within the
                    * available SVG area, regardless of canvas aspect
                    * ratio or crossing angle. A similarity transform
                    * preserves "point lies on circle" exactly, so A/B/C/D
                    * stay exactly on the resulting circle and E stays
                    * exactly where it belongs relative to it.
                    */


                    const targetRadius = radius
                     

                    const fitScale = targetRadius / rawRadius;

                    const applyFit = (p) => ({
                      x: centerX + (p.x - rawCircleCenterX) * fitScale,
                      y: centerY + (p.y - rawCircleCenterY) * fitScale,
                    });

                    fittedPositions = {};
                    Object.keys(rawPositions).forEach((pointId) => {
                      fittedPositions[pointId] = applyFit(
                        rawPositions[pointId]
                      );
                    });

                    intersectingChordsCircle.__renderCenter = {
                      x: centerX,
                      y: centerY,
                    };

                    intersectingChordsCircle.__renderRadius = targetRadius;

                    /*
                    * ------------------------------------------
                    * DEBUG
                    * ------------------------------------------
                    */

                    // console.log(
                    //   "[INTERSECTING CHORDS CIRCLE]",
                    //   {
                    //     circleId: intersectingChordsCircle.id,
                    //     center: { x: centerX, y: centerY },
                    //     radius: targetRadius,
                    //     points: fittedPositions,
                    //   }
                    // );
                  }
                }
              }
            }

            /*
            * ------------------------------------------
            * STEP 4: COMMIT FINAL POSITIONS
            * ------------------------------------------
            */

            Object.keys(fittedPositions).forEach((pointId) => {
              positions[pointId] = fittedPositions[pointId];
            });

            /*
            * ------------------------------------------
            * STEP 5: LOCK OUT GENERIC / DEFAULT PLACEMENT
            * ------------------------------------------
            *
            * The `!specializedCircleGeometry` guard at the top of this
            * block only checks this flag -- nothing here ever SET it.
            * If any generic fallback elsewhere (e.g. a default "distribute
            * points evenly around a circle" step driven by `lies_on`
            * relationships) is gated the same way, it will still run
            * after us and overwrite A/B/C/D with its own independent
            * placement -- which has no reason to land on the circle we
            * just fit. Setting this flag tells that generic logic to
            * skip these already-positioned points.
            */

            specializedCircleGeometry = true;
          }
        }
      }

  

  /*
    * ------------------------------------------
    * CIRCLE: TANGENT + CHORD CASE
    * ------------------------------------------
    *
    * Pattern:
    *
    *   Inscribed triangle ABC with a tangent line
    *   at one vertex (e.g. tangent AT at A).
    *
    *   Given:
    *    - one interior triangle angle at the tangent
    *      point (e.g. angle BAC)
    *    - one tangent-chord angle at the tangent
    *      point (e.g. angle CAT)
    *
    *   Uses the tangent-chord (alternate segment)
    *   theorem: the tangent-chord angle equals the
    *   inscribed angle in the alternate segment.
    */

    if (circle && !specializedCircleGeometry) {
      const tangentChordTriangleRel = relationships.find(
        (relationship) => relationship.type === "forms_triangle"
      );

      const tangentAtPointRel = relationships.find(
        (relationship) =>
          relationship.type === "tangent_at_point" &&
          relationship.target === circle.id
      );

      if (
        tangentChordTriangleRel &&
        tangentAtPointRel &&
        Array.isArray(angles) &&
        angles.length >= 2
      ) {
        const triangleVertexIds = tangentChordTriangleRel.elements;
        const tangentPointId = tangentAtPointRel.at_point;
        const tangentPoint = points[tangentPointId];
        const tangentLineId = tangentAtPointRel.elements?.[0];

        const farTangentPointRel = relationships.find(
          (relationship) =>
            relationship.type === "lies_on" &&
            Array.isArray(relationship.elements) &&
            relationship.elements.includes(tangentLineId)
        );

        const farTangentPointId = farTangentPointRel?.elements.find(
          (id) => id !== tangentLineId
        );

        const farTangentPoint = farTangentPointId
          ? points[farTangentPointId]
          : null;

        if (
          tangentPointId &&
          tangentPoint &&
          farTangentPoint &&
          triangleVertexIds.includes(tangentPointId)
        ) {
          /*
          * Angle elements only carry a LaTeX label like
          * "$\angle CAT$" -- no direct point references.
          * Parse the three letters; the middle one is
          * always the vertex.
          */
          const parseAngleLetters = (angleEl) => {
            if (!angleEl?.label) return null;
            const cleaned = angleEl.label
              .replace(/\\angle/g, "")
              .replace(/[^A-Za-z]/g, "");
            return cleaned.length === 3 ? cleaned.split("") : null;
          };

          let tangentChordAngle = null;
          let triangleVertexAngle = null;

          angles.forEach((angleEl) => {
            const letters = parseAngleLetters(angleEl);
            if (!letters) return;
            const vertexLetter = letters[1];
            if (vertexLetter !== tangentPoint.label) return;
            if (letters.includes(farTangentPoint.label)) {
              tangentChordAngle = { ...angleEl, letters };
            } else {
              triangleVertexAngle = { ...angleEl, letters };
            }
          });

          if (
            tangentChordAngle &&
            triangleVertexAngle &&
            typeof tangentChordAngle.value === "number" &&
            typeof triangleVertexAngle.value === "number"
          ) {
            const letterToPointId = {};
            Object.keys(points).forEach((id) => {
              letterToPointId[points[id].label] = id;
            });

            const chordFarLetter = tangentChordAngle.letters.find(
              (letter) =>
                letter !== tangentPoint.label &&
                letter !== farTangentPoint.label
            );

            const allVertexLabels = triangleVertexIds.map(
              (id) => points[id].label
            );

            const remainingLetter = allVertexLabels.find(
              (letter) =>
                letter !== tangentPoint.label && letter !== chordFarLetter
            );

            if (chordFarLetter && remainingLetter) {
              const idA = tangentPointId;
              const idChordFar = letterToPointId[chordFarLetter];
              const idRemaining = letterToPointId[remainingLetter];
              const idT = farTangentPointId;

              /*
              * angle at tangent point (A) = given directly
              * angle at remaining vertex = tangent-chord value
              *   (alternate segment theorem)
              * angle at chord-far vertex = remainder of 180
              */
              const angleAtA = triangleVertexAngle.value;
              const angleAtRemaining = tangentChordAngle.value;
              const angleAtChordFar = 180 - angleAtA - angleAtRemaining;

              if (angleAtChordFar > 0 && angleAtChordFar < 180) {
                /*
                * STEP 1: raw construction on a unit circle.
                * Arc opposite each vertex = 2x the inscribed
                * angle at that vertex.
                */
                const toRad = (deg) => (deg * Math.PI) / 180;

                const arcAtoChordFar = 2 * angleAtRemaining;
                const arcChordFarToRemaining = 2 * angleAtA;

                const thetaA = -Math.PI / 2;
                const thetaChordFar = thetaA + toRad(arcAtoChordFar);
                const thetaRemaining =
                  thetaChordFar + toRad(arcChordFarToRemaining);

                const ptOnUnitCircle = (theta) => ({
                  x: Math.cos(theta),
                  y: Math.sin(theta),
                });

                const rawA = ptOnUnitCircle(thetaA);
                const rawChordFar = ptOnUnitCircle(thetaChordFar);
                const rawRemaining = ptOnUnitCircle(thetaRemaining);

                /*
                * STEP 2: tangent direction at A -- perpendicular
                * to radius OA, on the side OPPOSITE the remaining
                * vertex relative to chord A-ChordFar (alternate
                * segment side, per the theorem).
                */
                const side = (p, q, x) => {
                  const v1 = { x: q.x - p.x, y: q.y - p.y };
                  const v2 = { x: x.x - p.x, y: x.y - p.y };
                  return v1.x * v2.y - v1.y * v2.x;
                };

                const radiusLen = Math.hypot(rawA.x, rawA.y);
                const perpOption1 = {
                  x: -rawA.y / radiusLen,
                  y: rawA.x / radiusLen,
                };
                const perpOption2 = {
                  x: rawA.y / radiusLen,
                  y: -rawA.x / radiusLen,
                };
                const probe = {
                  x: rawA.x + perpOption1.x,
                  y: rawA.y + perpOption1.y,
                };

                const remainingSide = side(rawA, rawChordFar, rawRemaining);
                const probeSide = side(rawA, rawChordFar, probe);
                const tangentDir =
                  probeSide * remainingSide < 0 ? perpOption1 : perpOption2;

                const TANGENT_RAY_LENGTH = 1;
                const rawT = {
                  x: rawA.x + tangentDir.x * TANGENT_RAY_LENGTH,
                  y: rawA.y + tangentDir.y * TANGENT_RAY_LENGTH,
                };

                /*
                * STEP 3: fit the raw unit circle to the SVG
                * canvas -- one uniform scale, centered at
                * (centerX, centerY), sized to the available
                * SVG area. Preserves "on the circle" exactly.
                */
                const targetRadius =
                  (Math.min(
                    SVG_AVAILABLE_WIDTH,
                    SVG_AVAILABLE_HEIGHT
                  ) / 2) * FILL_FACTOR;

                const fitScale = targetRadius;

                const applyFit = (p) => ({
                  x: centerX + p.x * fitScale,
                  y: centerY + p.y * fitScale,
                });

                positions[idA] = applyFit(rawA);
                positions[idChordFar] = applyFit(rawChordFar);
                positions[idRemaining] = applyFit(rawRemaining);
                positions[idT] = applyFit(rawT);

                circle.__renderCenter = { x: centerX, y: centerY };
                circle.__renderRadius = targetRadius;

                specializedCircleGeometry = true;

                // console.log("[TANGENT + CHORD CIRCLE]", {
                //   circleId: circle.id,
                //   center: circle.__renderCenter,
                //   radius: circle.__renderRadius,
                //   angles: { angleAtA, angleAtRemaining, angleAtChordFar },
                // });
              }
            }
          }
        }
      }
    }

  }
  /*
   * ------------------------------------------
   * CIRCLE: GENERIC FALLBACK
   * ------------------------------------------
   *
   * Only execute when no specialized
   * circle geometry handled the points.
   * ------------------------------------------
   */

  if (figure?.type === "circle" && !specializedCircleGeometry ) {
    pointIds.forEach((id, index) => {
      const angle =
        -Math.PI / 2 +
        (index * 2 * Math.PI) /
          pointIds.length;

      positions[id] = {
        x: centerX +  Math.cos(angle) *  radius,
        y: centerY +  Math.sin(angle) *  radius,
      };
    });
  } 

   
  
  /*
  * --------------------------------------------------
  * HELPERS
  * --------------------------------------------------
  */

  const hasPoint = (id) => Boolean(points[id]);

  const triangleRelationships = relationships.filter(
    (r) =>
      r.type === "forms_triangle" &&
      r.elements?.length === 3 &&
      r.elements.every(hasPoint)
  );

  const triangleRelationship = triangleRelationships.find(
    (relationship) => relationship.elements?.length === 3
  );

  const triangleIds = triangleRelationship?.elements || [];

 /*
 * --------------------------------------------------
 * AUTO‑ADD TRIANGLE SIDES (extension) — FIXED
 * --------------------------------------------------
 */
/*triangleRelationships.forEach(tri => {
  const [p1, p2, p3] = tri.elements;

  // All three sides of the triangle
  const pairs = [
    [p1, p2],
    [p2, p3],
    [p1, p3],
  ];

  pairs.forEach(([a, b]) => {
    // Ensure uniqueness by checking exact pair match (unordered)
    const exists = segments.some(s => {
      if (!s.elements) return false;
      const [x, y] = s.elements;
      return (
        (x === a && y === b) ||
        (x === b && y === a)
      );
    });

    if (!exists) {
      const segId = `segment_${a.replace("point_", "")}${b.replace("point_", "")}`;
      segments.push({
        id: segId,
        type: "segment",
        elements: [a, b],
      });
      console.log("[DEBUG] Auto‑added triangle side:", segId);
    }
  });
});
*/

  /*
 * --------------------------------------------------
 * AUTO‑ADD TRIANGLE SIDES (Reusable Function)
 * --------------------------------------------------
 */

  /*
function ensureTriangleSides(triangleRelationships, segments) {
  triangleRelationships.forEach(tri => {
    const [p1, p2, p3] = tri.elements;

    const pairs = [
      [p1, p2],
      [p2, p3],
      [p1, p3],
    ];

    pairs.forEach(([a, b]) => {
      const exists = segments.some(
        s => s.elements?.includes(a) && s.elements?.includes(b)
      );

      if (!exists) {
        const segId = `segment_${a.replace("point_", "")}${b.replace("point_", "")}`;
        segments.push({
          id: segId,
          type: "segment",
          elements: [a, b],
        });
        console.log("[DEBUG] Auto‑added triangle side:", segId);
      }
    });
  });
}
*/

  
  /*
   * --------------------------------------------------
   * TRIANGLE FAMILY
   * --------------------------------------------------
   */
  if (
    [
      "triangle",
      "triangle_exterior_angle",
      "triangle_with_point",
      "triangle_with_midpoints",
      "triangle_with_parallel_segment",
      "triangle_with_shared_side",
      "intersecting_segments",
      "triangle_with_altitude",
      "triangle_with_median",
      "triangle_with_angle_bisector",
    ].includes(figure.type) &&
    triangleRelationships.length >= 1   
  ) {

    const [a, b, c] =  triangleIds;

    /*
     * Standard triangle.
     *
     *       A
     *      / \
     *     /   \
     *    B-----C
     */

    positions[a] = { x: centerX, y: centerY - HALF_H };
    positions[b] = { x: centerX - HALF_W, y: centerY + HALF_H };
    positions[c] = { x: centerX + HALF_W, y: centerY + HALF_H };

    // ✅ Add triangle sides only if not already present in JSON
  const sideSegments = [
    { id: "segment_ab", firstId: a, secondId: b },
    { id: "segment_bc", firstId: b, secondId: c },
    { id: "segment_ac", firstId: a, secondId: c },
  ];



    /*
     * ------------------------------------------------
     * EXTERIOR ANGLE
     * ------------------------------------------------
     *
     * Find the collinear extension point.
     */

      if (figure.type === "triangle_exterior_angle") {

       
      // Prefer collinear relation if available
      let extensionRelation = relationships.find(
        (r) =>
          r.type === "collinear" &&
          r.elements?.length >= 3 &&
          r.elements.some((id) => !triangleIds.includes(id))
      );

      // Fallback: connected_to with 3 points (two triangle + one extra)
      if (!extensionRelation) {
        extensionRelation = relationships.find(
          (r) =>
            r.type === "connected_to" &&
            r.elements?.length === 3 &&
            r.elements.some((id) => !triangleIds.includes(id))
        );
      }

      if (extensionRelation) {
        const extensionId = extensionRelation.elements.find(
          (id) => !triangleIds.includes(id)
        );

        const extensionTriangleIds = extensionRelation.elements.filter((id) =>
          triangleIds.includes(id)
        );

        if (extensionId && extensionTriangleIds.length >= 2) {
          const [extensionBaseId, otherBaseId] = extensionTriangleIds;
          const apexId = triangleIds.find(
            (id) => id !== extensionBaseId && id !== otherBaseId
          );
          
          //console.log("[apexId && extensionBaseId && otherBaseId]:",{apexId, extensionBaseId, otherBaseId})
          if (apexId && extensionBaseId && otherBaseId) {
            // Standard horizontal-base layout, unified with the shared constants.
            // The extension point sits past otherBaseId, so the triangle itself
            // is shrunk to 80% of HALF_W to leave room for it inside the canvas.
            const baseHalfW = HALF_W * 0.8;

            positions[apexId] = { x: centerX, y: centerY - HALF_H };
            positions[extensionBaseId] = { x: centerX - baseHalfW, y: centerY + HALF_H };
            positions[otherBaseId] = { x: centerX + baseHalfW * 0.5, y: centerY + HALF_H };
            positions[extensionId] = { x: centerX + HALF_W, y: centerY + HALF_H };
          }
        }
      }
    }

    /*
    * --------------------------------------------------
    * TRIANGLE WITH ALTITUDE
    * --------------------------------------------------
    *
    *       A
    *      /|
    *     / |
    *    /  |
    *   B---D---C
    *
    * AD ⟂ BC
    * 
    */
    

    if (figure.type === "triangle_with_altitude") {
      // Only draw the triangle + altitude line
      // Do NOT render any has_value angles here
      const [a, b, c] = triangleIds;
      const d = relationships.find(
        (r) => r.type === "lies_on" && r.target_segment === "segment_bc" 
      )?.element_id;

      if (a && b && c && d) {
        positions[b] = { x: centerX - HALF_W, y: centerY + HALF_H };
        positions[c] = { x: centerX + HALF_W, y: centerY + HALF_H };
        positions[a] = { x: centerX, y: centerY - HALF_H };
        positions[d] = { x: centerX, y: centerY + HALF_H };
      }

    }

    /*
      * --------------------------------------------------
      * TRIANGLE WITH ANGLE BISECTOR
      * --------------------------------------------------
      *
      *       P
      *      / \
      *     /   \
      *    Q-----S
      *     \   /
      *      \ /
      *       R
      *
      * QS bisects ∠PQR
      */
      if (figure.type === "triangle_with_angle_bisector") {
        const [p, q, r] = triangleIds;
        const s = relationships.find(r =>
          r.type === "collinear" && r.elements?.includes("point_s")
        )?.elements.find(id => id === "point_s");

        if (p && q && r && s) {
          // Base PR horizontal
          positions[p] = { x: centerX - HALF_W, y: centerY + HALF_H };
          positions[r] = { x: centerX + HALF_W, y: centerY + HALF_H };

          // Apex Q
          positions[q] = { x: centerX, y: centerY - HALF_H };

          // Point S on PR
          positions[s] = { x: centerX, y: centerY + HALF_H };
        }
      }


      /*
      * --------------------------------------------------
      * TRIANGLE WITH MEDIAN
      * --------------------------------------------------
      *
      *       X
      *      / \
      *     /   \
      *    Y-----Z
      *      \ /
      *       W
      *
      * W is midpoint of YZ, XW is median
      */
      if (figure.type === "triangle_with_median") {
        const [x, y, z] = triangleIds;
        const w = relationships.find(r =>
          r.type === "midpoint_of" && r.element_id === "point_w"
        )?.element_id;

        if (x && y && z && w) {
          // Base YZ horizontal
          positions[y] = { x: centerX - HALF_W, y: centerY + HALF_H };
          positions[z] = { x: centerX + HALF_W, y: centerY + HALF_H };

          // Apex X
          positions[x] = { x: centerX, y: centerY - HALF_H };

          // Midpoint W
          positions[w] = { x: centerX, y: centerY + HALF_H };
        }
      }



    /*
    * ------------------------------------------------
    * TRIANGLE WITH POINT ON SIDE
    * ------------------------------------------------
    */
    if (figure.type === "triangle_with_point") {

      sideSegments.forEach(seg => {
        const exists = segments.some(s => s.id === seg.id);
        if (!exists) {
          segments.push({
            id: seg.id,
            type: "segment",
            elements: [seg.firstId, seg.secondId],
          });
          //console.log("[DEBUG] Auto‑added side:", seg.id);
        } else {
         // console.log("[DEBUG] Using JSON‑defined side:", seg.id);
        }
      });
        
      // ✅ Now continue with your extraPoints placement loop
      const extraPoints = pointIds.filter(id => !triangleIds.includes(id));

      extraPoints.forEach(extraId => {
      const relation = relationships.find(
        r =>
          r.type === "lies_on" &&
          (r.element_id === extraId || r.elements?.includes(extraId))
      );
      if (!relation) return;

      let segmentId = relation.target || relation.target_segment;
      if (!segmentId) {
        segmentId = relation.elements?.find(id =>
          segments.some(segment => segment.id === id)
        );
      }
      if (!segmentId) return;

      // ✅ Special handling for AB and AC with length ratios
      if (segmentId === "segment_ab") {
        const pA = positions["point_a"];
        const pB = positions["point_b"];
        if (pA && pB) {
          const adSeg = segments.find(s => s.id === "segment_ad");
          const dbSeg = segments.find(s => s.id === "segment_db");

          let ratio = 0.5;
          if (adSeg?.value !== undefined && dbSeg?.value !== undefined) {
            const ad = Number(adSeg.value);
            const db = Number(dbSeg.value);
            const total = ad + db;
            if (total > 0) ratio = ad / total;
          }

          positions[extraId] = {
            x: pA.x + (pB.x - pA.x) * ratio,
            y: pA.y + (pB.y - pA.y) * ratio,
          };

          // Save ratio for parallel placement of E
          positions.__lastRatioAB = ratio;
        }
        return; // stop here, don’t run generic ratio block
      }

      if (segmentId === "segment_ac") {
        const pA = positions["point_a"];
        const pC = positions["point_c"];
        if (pA && pC) {
          const ratio = positions.__lastRatioAB ?? 0.5;
          positions[extraId] = {
            x: pA.x + (pC.x - pA.x) * ratio,
            y: pA.y + (pC.y - pA.y) * ratio,
          };
        }
        return;
      }

      // ✅ Otherwise, fall back to your existing ratio block
      const segment = segments.find(item => item.id === segmentId);
      if (!segment) {
        // midpoint fallback (your existing code)
        let p1, p2;
        if (segmentId === "segment_bc") {
          p1 = positions["point_b"];
          p2 = positions["point_c"];
        } else if (segmentId === "segment_ac") {
          p1 = positions["point_a"];
          p2 = positions["point_c"];
        } else if (segmentId === "segment_ab") {
          p1 = positions["point_a"];
          p2 = positions["point_b"];
        }
        if (p1 && p2) {
          positions[extraId] = {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
          };
        }
        return;
      }
    

        // ✅ Only run this if we actually have a defined segment
        const endpoints = getSegmentEndpoints(segment, points);
        if (!endpoints) return;

        const p1 = positions[endpoints.firstId];
        const p2 = positions[endpoints.secondId];
        if (!p1 || !p2) return;

        let ratio = 0.5;

        const relatedLengthSegments = segments.filter(item => {
          const itemEndpoints = getSegmentEndpoints(item, points);
          if (!itemEndpoints) return false;
          return (
            (itemEndpoints.firstId === endpoints.firstId &&
              itemEndpoints.secondId === extraId) ||
            (itemEndpoints.firstId === extraId &&
              itemEndpoints.secondId === endpoints.firstId) ||
            (itemEndpoints.firstId === extraId &&
              itemEndpoints.secondId === endpoints.secondId) ||
            (itemEndpoints.firstId === endpoints.secondId &&
              itemEndpoints.secondId === extraId)
          );
        });

        const firstPart = relatedLengthSegments.find(item => item.value !== undefined);
        const secondPart = relatedLengthSegments
          .filter(item => item !== firstPart && item.value !== undefined)
          .find(item => true);

        if (
          firstPart &&
          secondPart &&
          Number(firstPart.value) >= 0 &&
          Number(secondPart.value) >= 0
        ) {
          const firstValue = Number(firstPart.value);
          const secondValue = Number(secondPart.value);
          const total = firstValue + secondValue;
          if (total > 0) {
            ratio = firstValue / total;
          }
        }

        positions[extraId] = {
          x: p1.x + (p2.x - p1.x) * ratio,
          y: p1.y + (p2.y - p1.y) * ratio,
        };
      });
    }


    /*
      * --------------------------------------------------
      * TRIANGLE WITH TWO MIDPOINTS
      * --------------------------------------------------
      *
      * M = midpoint of XY
      * N = midpoint of XZ
      *
      *             X
      *            / \
      *           /   \
      *          M-----N
      *         /       \
      *        Y---------Z
      *
      * MN is parallel to YZ.
      */

      if ( figure.type === "triangle_with_midpoints") {
        const coreIds = new Set([
          a,
          b,
          c,
        ]);

        const midpointPoints = [];

        relationships
          .filter(
            (r) =>
              r.type === "midpoint_of"
          )
          .forEach((relationship) => {
            const midpointId =
              relationship.element_id ||
              relationship.elements?.find(
                (id) =>
                  points[id] &&
                  !coreIds.has(id)
              );

            const segmentId =
              relationship.target_segment ||
              relationship.elements?.find(
                (id) =>
                  segments.some(
                    (segment) =>
                      segment.id === id
                  )
              );

            if (
              midpointId &&
              segmentId
            ) {
              midpointPoints.push({
                midpointId,
                segmentId,
              });
            }
          });

        midpointPoints.forEach(
          ({
            midpointId,
            segmentId,
          }) => {
            const segment =
              segments.find(
                (segment) =>
                  segment.id === segmentId
              );

            if (!segment) {
              return;
            }

            const endpoints =
              getSegmentEndpoints(
                segment,
                points
              );

            if (!endpoints) {
              return;
            }

            const {
              firstId,
              secondId,
            } = endpoints;

            const p1 =
              positions[firstId];

            const p2 =
              positions[secondId];

            if (!p1 || !p2) {
              return;
            }

            positions[midpointId] =
              midpoint(p1, p2);
          }
        );
      }
      /*
      * --------------------------------------------------
      * TRIANGLE WITH PARALLEL INTERNAL SEGMENT
      * --------------------------------------------------
      */

      // parallelSegmentLayout:
      if (figure.type === "triangle_with_parallel_segment") {
        /*
        * -----------------------------------------------
        * OUTER TRIANGLE
        * -----------------------------------------------
        */

        const outerTriangle =
          triangleRelationships.find(
            (r) =>
              r.elements?.length === 3
          );

        if (!outerTriangle) {
          // Not enough data for this specialized layout -- stop just
          // this block. The universal fallback at the end of the
          // function will still place any point left unpositioned.
          // break parallelSegmentLayout;
        }

        const outerIds =
          outerTriangle.elements;

        /*
        * -----------------------------------------------
        * IDENTIFY D AND E
        * -----------------------------------------------
        *
        * D lies on AB
        * E lies on AC
        */

        const liesOnRelations =
          relationships.filter(
            (r) => r.type === "lies_on"
          );

        let pointD = null;
        let pointE = null;

        liesOnRelations.forEach((relation) => {
          const pointId =
            relation.element_id ||
            relation.elements?.find(
              (id) =>
                points[id] &&
                !outerIds.includes(id)
            );

          const target =
            relation.target ||
            relation.target_segment ||
            relation.elements?.find(
              (id) =>
                segments.some(
                  (segment) =>
                    segment.id === id
                )
            );

          if (!pointId || !target) {
            return;
          }

          const segment =
            segments.find(
              (segment) =>
                segment.id === target
            );

          if (!segment) {
            return;
          }

          const endpoints =
            getSegmentEndpoints(
              segment,
              points
            );

          if (!endpoints) {
            return;
          }

          const [p1, p2] = [
            endpoints.firstId,
            endpoints.secondId,
          ];

          /*
          * Point lies on AB
          */
          if (
            outerIds.includes(p1) &&
            outerIds.includes(p2)
          ) {
            if (
              outerIds.includes(p1) &&
              outerIds.includes(p2)
            ) {
              // identify using actual segment
              const labels = [
                points[p1]?.label,
                points[p2]?.label,
              ];

              if (
                labels.includes("A") &&
                labels.includes("B")
              ) {
                pointD = pointId;
              }

              if (
                labels.includes("A") &&
                labels.includes("C")
              ) {
                pointE = pointId;
              }
            }
          }
        });

        /*
        * -----------------------------------------------
        * SAFER FALLBACK USING LABELS
        * -----------------------------------------------
        */

        const a =
          outerIds.find(
            (id) => points[id]?.label === "A"
          );

        const b =
          outerIds.find(
            (id) => points[id]?.label === "B"
          );

        const c =
          outerIds.find(
            (id) => points[id]?.label === "C"
          );

        if (!a || !b || !c) {
          // Same as above: bail out of just this specialized layout,
          // not the whole function, so the universal fallback still runs.
          // break parallelSegmentLayout;
        }

        /*
        * If relationship detection did not identify
        * D/E yet, use the two non-triangle points
        * only as a fallback.
        */

        const extraPoints =
          pointIds.filter(
            (id) =>
              !outerIds.includes(id)
          );

        if (!pointD) {
          pointD =
            extraPoints.find(
              (id) => points[id]?.label === "D"
            );
        }

        if (!pointE) {
          pointE =
            extraPoints.find(
              (id) => points[id]?.label === "E"
            );
        }

        /*
        * -----------------------------------------------
        * OUTER TRIANGLE POSITION
        * -----------------------------------------------
        */

        positions[a] = {
          x: centerX,
          y: centerY - HALF_H,
        };

        positions[b] = {
          x: centerX - HALF_W,
          y: centerY + HALF_H,
        };

        positions[c] = {
          x: centerX + HALF_W,
          y: centerY + HALF_H,
        };

        /*
        * -----------------------------------------------
        * INTERNAL PARALLEL SEGMENT
        * -----------------------------------------------
        *
        * Put D and E at the same height.
        */

        if (pointD && pointE) {
          const dRatio = 0.45;

          positions[pointD] = {
            x:
              positions[a].x +
              (positions[b].x - positions[a].x) *
                dRatio,
            y:
              positions[a].y +
              (positions[b].y - positions[a].y) *
                dRatio,
          };

          positions[pointE] = {
            x:
              positions[a].x +
              (positions[c].x - positions[a].x) *
                dRatio,
            y:
              positions[a].y +
              (positions[c].y - positions[a].y) *
                dRatio,
          };
        }
      }

    /*
    * --------------------------------------------------
    * TRIANGLE WITH SHARED SIDE
    * --------------------------------------------------
    *
    *        B
    *       / \
    *      /   \
    *     A-----C
    *      \   /
    *       \ /
    *        D
    *
    * ABC and ADC share AC.
    */

    if (figure.type === "triangle_with_shared_side") {
      const triangleRelations = relationships.filter(
        (r) =>
          r.type === "forms_triangle" &&
          r.elements?.length === 3
      );

      if (triangleRelations.length >= 2) {
        const first = triangleRelations[0].elements;
        const second = triangleRelations[1].elements;

        const sharedIds = first.filter((id) =>
          second.includes(id)
        );

        if (sharedIds.length === 2) {
          const outerFirst = first.find(
            (id) => !sharedIds.includes(id)
          );

          const outerSecond = second.find(
            (id) => !sharedIds.includes(id)
          );

          const [sharedA, sharedC] = sharedIds;

          if (
            outerFirst &&
            outerSecond &&
            sharedA &&
            sharedC
          ) {
            // Shared side: horizontal, centered on the canvas.
            positions[sharedA] = {
              x: centerX - HALF_W,
              y: centerY,
            };

            positions[sharedC] = {
              x: centerX + HALF_W,
              y: centerY,
            };

            // First triangle above AC.
            positions[outerFirst] = {
              x: centerX,
              y: centerY - HALF_H,
            };

            // Second triangle below AC.
            positions[outerSecond] = {
              x: centerX,
              y: centerY + HALF_H,
            };
          }
        }
      }
    }


    /*
      * --------------------------------------------------
      * INTERSECTING SEGMENTS
      * --------------------------------------------------
      *
      *        A---------D
      *          \     /
      *           \   /
      *            \ /
      *             E
      *            / \
      *           /   \
      *          B-----C
      *
      * AD and BC intersect at E.
      */

      /*
      * --------------------------------------------------
      * INTERSECTING SEGMENTS
      * --------------------------------------------------
      */
      if (figure.type === "intersecting_segments") {
        // Place A, B, C, D using the shared canvas constants -- A/C form
        // the upper corners, B/D the lower corners, so AD and BC cross
        // near the center of the figure.
        positions["point_a"] = { x: centerX - HALF_W, y: centerY - HALF_H };
        positions["point_b"] = { x: centerX - HALF_W * 0.7, y: centerY + HALF_H };
        positions["point_c"] = { x: centerX + HALF_W, y: centerY - HALF_H };
        positions["point_d"] = { x: centerX + HALF_W * 0.7, y: centerY + HALF_H };

        // Compute intersection E of AD and BC
        const pA = positions["point_a"];
        const pD = positions["point_d"];
        const pB = positions["point_b"];
        const pC = positions["point_c"];

        /*function lineIntersection(p1, p2, p3, p4) {
          const x1 = p1.x, y1 = p1.y;
          const x2 = p2.x, y2 = p2.y;
          const x3 = p3.x, y3 = p3.y;
          const x4 = p4.x, y4 = p4.y;

          const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
          if (denom === 0) return null;

          const px =
            ((x1 * y2 - y1 * x2) * (x3 - x4) -
              (x1 - x2) * (x3 * y4 - y3 * x4)) /
            denom;
          const py =
            ((x1 * y2 - y1 * x2) * (y3 - y4) -
              (y1 - y2) * (x3 * y4 - y3 * x4)) /
            denom;

          return { x: px, y: py };
        }*/

        const intersection = lineIntersection(pA, pD, pB, pC);
        if (intersection) {
          positions["point_e"] = intersection;
        }

        /*
        * --------------------------------------------------
        * AUTO‑ADD TRIANGLE SIDES (extension)
        * --------------------------------------------------
        */
        triangleRelationships.forEach(tri => {
          const [p1, p2, p3] = tri.elements;

          const pairs = [
            [p1, p2],
            [p2, p3],
            [p1, p3],
          ];

          pairs.forEach(([a, b]) => {
            const exists = segments.some(
              s => s.elements?.includes(a) && s.elements?.includes(b)
            );

            if (!exists) {
              const segId = `segment_${a.replace("point_", "")}${b.replace("point_", "")}`;
              segments.push({
                id: segId,
                type: "segment",
                elements: [a, b],
              });
              //console.log("[DEBUG] Auto‑added triangle side:", segId);
            }
          });
        });

        //console.log("[GEOMETRY RENDER] matched:", "intersecting_segments", positions);
      }

}


  /*
   * --------------------------------------------------
   * PARALLELOGRAM
   * --------------------------------------------------
   *
   * Do NOT use pointIds ordering.
   *
   * Use the parallel relationships to identify
   * the two pairs of opposite sides.
   * --------------------------------------------------
   */

  if ( figure.type === "parallelogram") {

    /*
     * For now use a stable semantic layout,
     * but map the first four point IDs only
     * after determining that they form the
     * quadrilateral.
     *
     * This keeps the geometry stable while
     * avoiding triangle-related points.
     */

    const quadPoints = pointIds.slice(0, 4);

    if ( quadPoints.length === 4 ) {
      const [ a, b, c, d, ] = quadPoints;

      // Slant amount as a fraction of HALF_W, so the parallelogram's
      // shear scales with the canvas instead of being a fixed pixel skew.
      const slant = HALF_W * 0.25;

      positions[a] = { x: centerX - HALF_W + slant, y: centerY - HALF_H };
      positions[b] = { x: centerX + HALF_W + slant, y: centerY - HALF_H };
      positions[c] = { x: centerX + HALF_W - slant, y: centerY + HALF_H };
      positions[d] = { x: centerX - HALF_W - slant, y: centerY + HALF_H };
    }
  }
  

  /*
   * --------------------------------------------------
   * RHOMBUS
   * --------------------------------------------------
   */

  if ( figure.type === "rhombus" ) {
    const quadPoints = pointIds.slice(0, 4);

    if ( quadPoints.length === 4 ) {
      const [ p, q,  r, s, ] = quadPoints;

      positions[p] = { x: centerX, y: centerY - HALF_H, };

      positions[q] = { x: centerX + HALF_W, y: centerY, };

      positions[r] = { x: centerX, y: centerY + HALF_H, };

      positions[s] = { x: centerX - HALF_W, y: centerY, };

      const centerId =  pointIds.find( (id) => !quadPoints.includes(id) );

      if (centerId) {
        positions[centerId] = { x: centerX, y: centerY, };
      }
    }
  }

    /*
    * --------------------------------------------------
    * TRAPEZOID
    * --------------------------------------------------
    *
    * IMPORTANT:
    *
    * Parallel bases are ALWAYS horizontal
    * in our renderer.
    *
    *       A---------B
    *        \       /
    *         \     /
    *          D---C
    *
    * --------------------------------------------------
    */

    if ( figure.type === "trapezoid" ||
      figure.type === "trapezoid_median"
    ) {
      const quadPoints = pointIds.slice(0, 4);

      if ( quadPoints.length === 4) {

        const [ a, b, c, d,] = quadPoints;
        // Top base narrower than the bottom base, as a fraction of HALF_W.
        const topHalfW = HALF_W * 0.65;

        positions[a] = { x: centerX - topHalfW, y: centerY - HALF_H,};
        positions[b] = { x: centerX + topHalfW, y: centerY - HALF_H,};
        positions[c] = { x: centerX + HALF_W, y: centerY + HALF_H,};
        positions[d] = { x: centerX - HALF_W, y: centerY + HALF_H,};

        /*
        * ------------------------------------------------
        * TRAPEZOID MEDIAN
        * ------------------------------------------------
        *
        * Median is the segment joining the
        * midpoints of the two legs.
        *
        *       A---------B
        *        \       /
        *         M-----N
        *        /       \
        *       D---------C
        *
        * Derive M and N from the actual legs.
        */

        if (figure.type === "trapezoid_median" ) {
          const midpointPoints = pointIds.filter( (id) =>!quadPoints.includes(id));

          if ( midpointPoints.length >= 2) {
            const m = midpoint( positions[a], positions[d]);

            const n =  midpoint(positions[b],positions[c]);

            positions[midpointPoints[0]] = m;

            positions[midpointPoints[1]] = n;
          }
        }
      }
    }
    
    /*
    * --------------------------------------------------
    * TRAPEZOID WITH INTERSECTING DIAGONALS
    * --------------------------------------------------
    *
    *        A────────────B
    *         \          /
    *          \        /
    *           \  E   /
    *            \    /
    *             \  /
    *              \/
    *              /\
    *             /  \
    *            /    \
    *        D────────────C
    *
    * AB || CD
    * AC and BD intersect at E.
    */

    if (  figure.type === "trapezoid_with_intersecting_diagonals") {
      
      const a = pointIds.find( (id) => points[id]?.label === "A");
      const b = pointIds.find( (id) => points[id]?.label === "B");
      const c = pointIds.find((id) =>points[id]?.label === "C");
      const d = pointIds.find((id) =>points[id]?.label === "D");
      const e = pointIds.find((id) =>points[id]?.label === "E");

      if (a && b &&c && d ) {
        const topHalfW = HALF_W * 0.65;

        positions[a] = { x: centerX - topHalfW, y: centerY - HALF_H,};
        positions[b] = { x: centerX + topHalfW, y: centerY - HALF_H,};
        positions[c] = { x: centerX + HALF_W, y: centerY + HALF_H,};
        positions[d] = { x: centerX - HALF_W, y: centerY + HALF_H,};

        /*
        * AC and BD are the diagonals.
        */

        const ac = segments.find((segment) => segment.id === "segment_ac" );

        const bd = segments.find((segment) => segment.id === "segment_bd");

        if ( e && ac && bd) {
          const acEndpoints = getSegmentEndpoints( ac, points);

          const bdEndpoints = getSegmentEndpoints( bd, points );

          if ( acEndpoints && bdEndpoints) {
            const intersection = lineIntersection( 
              positions[ acEndpoints.firstId ],
                positions[acEndpoints.secondId],
                positions[bdEndpoints.firstId ],
                positions[bdEndpoints.secondId]
              );

            if (intersection) {
              positions[e] = intersection;
            }
          }
        }
      }
    }

    /*
    * --------------------------------------------------
    * KITE
    * --------------------------------------------------
    *
    * Layout convention:
    *       A
    *      / \
    *     /   \
    *    B     D
    *     \   /
    *      \ /
    *       C
    */

    if (figure.type === "kite") {
      const quadPoints = pointIds.slice(0, 4);

      if (quadPoints.length === 4) {
        const [a, b, c, d] = quadPoints;

        // Apex A at top
        positions[a] = { x: centerX, y: centerY - HALF_H };

        // Left vertex B
        positions[b] = { x: centerX - HALF_W / 1.5, y: centerY };

        // Bottom vertex C
        positions[c] = { x: centerX, y: centerY + HALF_H };

        // Right vertex D
        positions[d] = { x: centerX + HALF_W / 1.5, y: centerY };

        // Optional center point (intersection of diagonals)
        const centerId = pointIds.find((id) => !quadPoints.includes(id));
        if (centerId) {
          positions[centerId] = { x: centerX, y: centerY };
        }
      }
    }


    /*
 * --------------------------------------------------
 * QUADRILATERAL
 * --------------------------------------------------
 *
 * Generic four‑sided layout:
 *        A────B
 *        │    │
 *        D────C
 */
if (figure.type === "quadrilateral") {
  const quadPoints = pointIds.slice(0, 4);

  if (quadPoints.length === 4) {
    const [a, b, c, d] = quadPoints;

    positions[a] = { x: centerX - HALF_W / 2, y: centerY - HALF_H };
    positions[b] = { x: centerX + HALF_W / 2, y: centerY - HALF_H };
    positions[c] = { x: centerX + HALF_W / 2, y: centerY + HALF_H };
    positions[d] = { x: centerX - HALF_W / 2, y: centerY + HALF_H };

  }
}

/*
 * --------------------------------------------------
 * GENERIC
 * --------------------------------------------------
 *
 * Fallback layout: distribute points evenly around a circle.
 */
if (figure.type === "generic") {
  const radius = Math.min(SVG_AVAILABLE_WIDTH, SVG_AVAILABLE_HEIGHT) / 2.5;
  const angleStep = (2 * Math.PI) / pointIds.length;

  pointIds.forEach((id, index) => {
    const angle = index * angleStep;
    positions[id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  //console.log("[LAYOUT] generic positions:", positions);
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
    const angleStep =
      (2 * Math.PI) /
      Math.max(unpositionedPointIds.length, 1);

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

