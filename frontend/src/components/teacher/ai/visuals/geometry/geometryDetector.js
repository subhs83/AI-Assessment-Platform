  export function detectGeometryFigure({
    points,
    segments,
    circles,
    relationships,
  }) {
    const pointIds = Object.keys(points);

    const hasPoint = (id) =>
      Boolean(points[id]);

    const hasSegment = (id) =>
      segments.some(
        (segment) => segment.id === id
      );

    const hasCircle = circles && circles.length > 0;

    /*
    * --------------------------------------------------
    * CIRCLE
    * --------------------------------------------------
    */

    if (hasCircle) {
      // console.log("[GEOMETRY DETECTOR] matched: circle" );

      return {
        type: "circle",
        pointIds,
        circleIds: circles.map(
          (circle) => circle.id
        ),
      };
    }

    /*
    * --------------------------------------------------
    * RELATIONSHIP COLLECTION
    * --------------------------------------------------
    */

    const parallelPairs = relationships.filter(
      (r) =>
        r.type === "parallel_to" &&
        r.elements?.length === 2
    );

    const equalRelationships =
      relationships.filter(
        (r) => r.type === "equal_to"
      );

    const intersections =
      relationships.filter(
        (r) => r.type === "intersects"
      );

    const midpointRelationships =
      relationships.filter(
        (r) => r.type === "midpoint_of"
      );

  
    /*
    * --------------------------------------------------
    * TRIANGLE CORE
    *
    * Primary semantic signal:
    * forms_triangle
    *
    * Legacy-compatible signal:
    * connected_to with 3 point IDs
    * --------------------------------------------------
    */

    const triangleRelationship =
      relationships.find((r) => {
        if ( r.type !== "forms_triangle" && r.type !== "connected_to" ) {
          return false;
        }
        const ids = r.elements || [];
        return (
          ids.length === 3 && ids.every(hasPoint)
        );
      });

    const hasTriangleCore =  Boolean(triangleRelationship);

    /*
    * --------------------------------------------------
    * TRIANGLE VERTICES
    *
    * Keep the actual triangle vertices separate
    * from additional points such as D or S.
    * --------------------------------------------------
    */

    const trianglePointIds =  triangleRelationship?.elements || [];

    /*
    * --------------------------------------------------
    * POINT ON SEGMENT
    *
    * Canonical:
    *
    * {
    *   elements: ["point_d", "segment_ac"],
    *   type: "lies_on"
    * }
    *
    * Also tolerate:
    *
    * {
    *   elements: ["point_d", "point_a", "point_c"],
    *   type: "connected_to"
    * }
    *
    * because existing Gemini output may describe
    * "D is on AC" using three point IDs.
    * --------------------------------------------------
    */

    const hasPointOnSegment = relationships.some((r) => {
      const ids = r.elements || [];

      // Canonical semantic form
      if (r.type === "lies_on") {
        // Case: element_id + target
        if (r.element_id && r.target) {
          return hasPoint(r.element_id) && r.target.startsWith("segment_");
        }

        // Case: elements array with point + segment
        if (ids.length === 2) {
          const [pointId, segmentId] = ids;
          return hasPoint(pointId) && hasSegment(segmentId);
        }
      }

      // Existing three-point form
      if (r.type === "connected_to" && ids.length === 3 && ids.every(hasPoint)) {
        const pointOnLine = ids.find(id => !trianglePointIds.includes(id));
        if (!pointOnLine) return false;

        const triangleSidePoints = ids.filter(
          id => id !== pointOnLine && trianglePointIds.includes(id)
        );

        return triangleSidePoints.length === 2;
      }

      return false;
    });




  const triangleRelationships = relationships.filter(
    (r) =>
      r.type === "forms_triangle" &&
      r.elements?.length === 3 &&
      r.elements.every((id) => points[id])
  );


    

    /*
    * --------------------------------------------------
    * COLLINEAR EXTENSION
    *
    * Example:
    *
    * Q, R, S are collinear
    *
    * where PQR is the triangle and S
    * is the extension point.
    * --------------------------------------------------
    */

    const hasCollinearExtension =
      relationships.some((r) => {
        if (r.type !== "collinear") {
          return false;
        }

        const ids = r.elements || [];

        if (
          ids.length < 3 ||
          !ids.every(hasPoint)
        ) {
          return false;
        }

        /*
        * At least one point must be outside
        * the original triangle.
        */
        return ids.some(
          (id) =>
            !trianglePointIds.includes(id)
        );
      });


      /*
 * --------------------------------------------------
 * TRIANGLE WITH EXTERIOR ANGLE
 * --------------------------------------------------
 */
const hasExteriorAngle =
  relationships.some(r => r.type === "has_angle" || r.type === "has_value") &&
  (
    hasCollinearExtension ||
    relationships.some(r =>
      r.type === "connected_to" &&
      r.elements?.length === 3 &&
      r.elements.some(id => !trianglePointIds.includes(id))
    )
  );

  /*
    * --------------------------------------------------
    * TRIANGLE WITH ALTITUDE
    * --------------------------------------------------
    */
    const hasAltitude =
      relationships.some(
        (r) =>
          r.type === "perpendicular_to" &&
          r.elements?.length === 2 &&
          r.elements.includes("segment_ad") &&
          r.elements.includes("segment_bc")
      );

    /*
    * --------------------------------------------------
    * TRIANGLE WITH ANGLE BISECTOR
    * --------------------------------------------------
    */
    const hasBisector =
      relationships.some(
        (r) =>
          r.type === "equal_to" &&
          r.elements?.length === 2 &&
          r.elements.every((id) => id.startsWith("angle_"))
      );

    /*
    * --------------------------------------------------
    * TRIANGLE WITH MEDIAN
    * --------------------------------------------------
    */
    const hasMedian =
      relationships.some(
        (r) =>
          r.type === "midpoint_of" &&
          r.element_id &&
          r.target &&
          r.target.startsWith("segment_")
      );


    /*
    * --------------------------------------------------
    * RHOMBUS
    * --------------------------------------------------
    */

    const hasFourEqualSides =
      equalRelationships.some((r) => {
        const ids = r.elements || [];

        return (
          ids.length === 4 &&
          ids.every(hasSegment)
        );
      });

    const hasDiagonalIntersection =
      intersections.some((r) => {
        const ids = r.elements || [];

        return ids.length === 2;
      });

    if (
      pointIds.length >= 5 &&
      hasFourEqualSides &&
      hasDiagonalIntersection
    ) {
      return {
        type: "rhombus",
        pointIds,
      };
    }

    /*
    * --------------------------------------------------
    * PARALLELOGRAM
    * --------------------------------------------------
    */

    if (
      pointIds.length === 4 &&
      parallelPairs.length >= 2
    ) {
      return {
        type: "parallelogram",
        pointIds,
      };
    }

    /*
    * --------------------------------------------------
    * TRAPEZOID WITH MEDIAN
    * --------------------------------------------------
    */

    const hasMedianSegment =
      segments.some((segment) =>
        String(segment.label || "")
          .toUpperCase()
          .includes("MEDIAN")
      );

    if (
      pointIds.length === 4 &&
      parallelPairs.length === 1 &&
      midpointRelationships.length >= 2 &&
      hasMedianSegment
    ) {
      return {
        type: "trapezoid_median",
        pointIds,
      };
    }


    /*
  * --------------------------------------------------
  * TRAPEZOID WITH INTERSECTING DIAGONALS
  * --------------------------------------------------
  *
  *        A────────B
  *         \      /
  *          \ E  /
  *           \  /
  *            \/
  *            /\
  *           /  \
  *        C────────D
  *
  * AB || CD
  * AC and BD intersect at E
  */

  const parallelRelation = relationships.find(
    (r) =>
      r.type === "parallel_to" &&
      r.segment_id &&
      r.target_segment
  );

  const diagonalIntersectionRelation =
    relationships.find(
      (r) =>
        r.type === "intersects" &&
        r.elements?.length === 2 &&
        r.elements.every((id) =>
          String(id).startsWith("segment_")
        ) &&
        r.target
    );

  if (
    parallelRelation &&
    diagonalIntersectionRelation
  ) {
    const parallelSegments = [
      parallelRelation.segment_id,
      parallelRelation.target_segment,
    ];

    const diagonalSegments =
      diagonalIntersectionRelation.elements;

    const hasAC = diagonalSegments.includes(
      "segment_ac"
    );

    const hasBD = diagonalSegments.includes(
      "segment_bd"
    );

    if (
      hasAC &&
      hasBD
    ) {
      // console.log("[GEOMETRY DETECTOR] matched: trapezoid_with_intersecting_diagonals" );

      return {
        type:
          "trapezoid_with_intersecting_diagonals",
        pointIds,
        parallelSegments,
        diagonalSegments,
        intersectionPoint:
          diagonalIntersectionRelation.target,
      };
    }
  }
    /*
    * --------------------------------------------------
    * GENERIC TRAPEZOID
    * --------------------------------------------------
    */

    if (
      pointIds.length === 4 &&
      parallelPairs.length === 1
    ) {
      return {
        type: "trapezoid",
        pointIds,
      };
    }



    /*
      * --------------------------------------------------
      * KITE
      * --------------------------------------------------
      */
      const hasKite =
        pointIds.length === 4 &&
        relationships.some(
          (r) =>
            r.type === "equal_to" &&
            r.elements?.includes("segment_ab") &&
            r.elements?.includes("segment_da")
        ) &&
        relationships.some(
          (r) =>
            r.type === "equal_to" &&
            r.elements?.includes("segment_bc") &&
            r.elements?.includes("segment_cd")
        );

      if (hasKite) {
        // console.log("[GEOMETRY DETECTOR] matched: kite");
        return {
          type: "kite",
          pointIds,
        };
      }




     /*
      * --------------------------------------------------
      * QUADRILATERAL
      * --------------------------------------------------
      */
      const quadrilateralRelation = relationships.find(
        (r) =>
          r.type === "connected_to" &&
          r.elements?.length === 4 &&
          r.elements.every((id) => pointIds.includes(id))
      );

      if (pointIds.length === 4 && quadrilateralRelation) {
        // console.log("[GEOMETRY DETECTOR] matched: quadrilateral");
        return {
          type: "quadrilateral",
          pointIds,
        };
      }



    /*
      * --------------------------------------------------
      * TRIANGLE WITH EXTERIOR / EXTENSION
      * --------------------------------------------------
      */

      if (hasTriangleCore && hasExteriorAngle && !hasAltitude && !hasBisector && !hasMedian) {
      // console.log( "[GEOMETRY DETECTOR] matched:", "triangle_exterior_angle", pointIds);
      return {
          type: "triangle_exterior_angle",
          pointIds,
      };
      }


      /*
      * --------------------------------------------------
      * TRIANGLE WITH TWO MIDPOINTS
      * --------------------------------------------------
      *
      * Example:
      *
      *          X
      *         / \
      *        M---N
      *       /     \
      *      Y-------Z
      *
      * M = midpoint of XY
      * N = midpoint of XZ
      *
      * MN is therefore parallel to YZ.
      * --------------------------------------------------
      */

      const triangleMidpointRelations =
      midpointRelationships.filter((relationship) => {
          const midpointId =
          relationship.element_id ||
          relationship.elements?.find(
              (id) => points[id]
          );

          const segmentId =
          relationship.target_segment ||
          relationship.elements?.find((id) =>
              segments.some(
              (segment) => segment.id === id
              )
          );

          return (
          midpointId &&
          segmentId &&
          points[midpointId] &&
          segments.some(
              (segment) =>
              segment.id === segmentId
          )
          );
      });

      const hasTriangleWithTwoMidpoints =
      hasTriangleCore &&
      triangleMidpointRelations.length >= 2;


      /*
      * --------------------------------------------------
      * TRIANGLE WITH TWO MIDPOINTS
      * --------------------------------------------------
      */

      if (hasTriangleWithTwoMidpoints ) {
      // console.log("[GEOMETRY DETECTOR] matched:", "triangle_with_midpoints" );
      return {
          type: "triangle_with_midpoints",
          pointIds,
      };
      }

      /*
      * --------------------------------------------------
      * INTERSECTING SEGMENTS
      * --------------------------------------------------
      *
      * Example:
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
      * --------------------------------------------------
      */

      const intersectingSegmentsRelations =
        relationships.filter((relationship) =>
          relationship.type === "intersects" &&
          relationship.elements?.includes("segment_ad") &&
          relationship.elements?.includes("segment_bc") &&
          relationship.target === "point_e"
        );

      const hasIntersectingSegments =
        intersectingSegmentsRelations.length >= 1;

      /*
      * --------------------------------------------------
      * INTERSECTING SEGMENTS
      * --------------------------------------------------
      */
      if (hasIntersectingSegments) {
        // console.log("[GEOMETRY DETECTOR] matched:", "intersecting_segments");
        return {
          type: "intersecting_segments",
          pointIds,
        };
      }



      /*
      * --------------------------------------------------
      * TRIANGLE WITH POINT ON SIDE
      * --------------------------------------------------
      */

      if ( hasTriangleCore &&  hasPointOnSegment && !hasAltitude && !hasBisector && !hasMedian ) {
          // console.log( "[GEOMETRY DETECTOR] matched:","triangle_with_point" );
      return {
          type: "triangle_with_point",
          pointIds,
      };
      }

      /*
      * --------------------------------------------------
      * TRIANGLE WITH ALTITUDE
      * --------------------------------------------------
      */

      if (hasAltitude) {
        //  console.log( "[GEOMETRY DETECTOR] matched:","triangle_with_altitude" );
        return { type: "triangle_with_altitude", pointIds }
      };


      /*
      * --------------------------------------------------
      * TRIANGLE WITH ANGLE BISECTOR
      * --------------------------------------------------
      */

      if (hasBisector) {
        //  console.log( "[GEOMETRY DETECTOR] matched:","triangle_with_angle_bisector" );
        return { type: "triangle_with_angle_bisector", pointIds }
      };


      /*
      * --------------------------------------------------
      * TRIANGLE WITH MEDIAN
      * --------------------------------------------------
      */

      if (hasMedian) {
        //  console.log( "[GEOMETRY DETECTOR] matched:","triangle_with_median" );
        return { type: "triangle_with_median", pointIds }
      };

      /*
      * --------------------------------------------------
      * TRIANGLE WITH PARALLEL INTERNAL SEGMENT
      * --------------------------------------------------
      *
      *        A
      *       / \
      *      D---E
      *     /     \
      *    B-------C
      *
      * D lies on AB
      * E lies on AC
      * DE || BC
      */

      const hasTriangleParallelSegment =
      hasTriangleCore &&
      relationships.filter(
          (r) => r.type === "lies_on"
      ).length >= 2 &&
      relationships.some(
          (r) =>
          r.type === "parallel_to" &&
          r.elements?.length === 2
      );

      if (hasTriangleParallelSegment) {
      // console.log("[GEOMETRY DETECTOR] matched: triangle_with_parallel_segment");

      return {
          type: "triangle_with_parallel_segment",
          pointIds,
      };
      }



     /*
      * --------------------------------------------------
      * TRIANGLE WITH SHARED SIDE
      * --------------------------------------------------
      */
      
    const hasTwoTrianglesSharingSide =
    triangleRelationships.length >= 2 &&
    triangleRelationships.some((r1) =>
      triangleRelationships.some((r2) => {
        if (r1 === r2) return false;

        const sharedPoints =
          r1.elements.filter((id) =>
            r2.elements.includes(id)
          );

        if (sharedPoints.length !== 2) {
          return false;
        }

        // Make sure the two shared points
        // are actually connected by a segment.
        return relationships.some(
          (r) =>
            r.type === "connected_to" &&
            r.elements?.length === 2 &&
            sharedPoints.includes(r.elements[0]) &&
            sharedPoints.includes(r.elements[1])
        );
      })
    );

      if (hasTwoTrianglesSharingSide) {
      // console.log( "[GEOMETRY DETECTOR] matched: triangle_with_shared_side");

      return {
          type: "triangle_with_shared_side",
          pointIds,
      };
      }


      
      /*
      * --------------------------------------------------
      * BASIC TRIANGLE
      * --------------------------------------------------
      */

    if (pointIds.length === 3 && hasTriangleCore) {
    // console.log("[GEOMETRY DETECTOR] matched: triangle");

    return {
      type: "triangle",
      pointIds,
    };
  }

   

     /*
    * --------------------------------------------------
    * GENERIC
    * --------------------------------------------------
    */

    return {
      type: "generic",
      pointIds,
    };
  }