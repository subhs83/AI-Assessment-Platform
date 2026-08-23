import {
  calculateSegmentLabelPosition,
  getSegmentEndpoints 
} from "./geometryHelpers";

/*
 * geometryRenderers.js
 *
 * Rendering only.
 * Geometry meaning comes from:
 *
 * parseGeometry
 *      ↓
 * detectGeometryFigure
 *      ↓
 * calculateGeometryPositions
 *      ↓
 * geometryRenderers
 *
 * Do not change the AI data structure here.
 */

/* --------------------------------------------------
 * TEXT NORMALIZATION
 * -------------------------------------------------- */

 


function formatGeometryValue(value, type = "") {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  let text = String(value).trim();

  // --------------------------------------------------
  // Remove LaTeX math delimiters
  // --------------------------------------------------

  text = text.replace(/\$/g, "");

  // --------------------------------------------------
  // Convert LaTeX degree notation
  //
  // $(x + 25)^\circ$
  // $(x + 25)^{\circ}$
  // x^\circ
  // x^{\circ}
  // --------------------------------------------------

  text = text.replace(
    /\^\s*\{\s*\\circ\s*\}/g,
    "°"
  );

  text = text.replace(
    /\^\s*\\circ\b/g,
    "°"
  );

  // --------------------------------------------------
  // Remove remaining LaTeX braces
  // --------------------------------------------------

  text = text.replace(/[{}]/g, "");

  // --------------------------------------------------
  // Common LaTeX cleanup
  // --------------------------------------------------

  text = text.replace(
    /\\text\{([^}]*)\}/g,
    "$1"
  );

  text = text.replace(
    /\\mathrm\{([^}]*)\}/g,
    "$1"
  );

  text = text.replace(
    /\\,/g,
    " "
  );

  text = text.replace(
    /\\ /g,
    " "
  );

  // --------------------------------------------------
  // Remove markdown emphasis
  // --------------------------------------------------

  text = text.replace(/\*\*/g, "");

  // --------------------------------------------------
  // Normalize whitespace
  // --------------------------------------------------

  text = text
    .replace(/\s+/g, " ")
    .trim();

  // --------------------------------------------------
  // Angle values ALWAYS display degrees
  // --------------------------------------------------

  if (
    type === "angle" &&
    text &&
    !text.includes("°")
  ) {
    text += "°";
  }

  return text;
}

/* --------------------------------------------------
 * POINT LABEL LOOKUP
 * -------------------------------------------------- */

function findPointByLabel(
  points,
  label
) {
  if (
    !points ||
    !label
  ) {
    return null;
  }

  const target =
    String(label)
      .trim()
      .toUpperCase();

  return (
    Object.keys(points).find(
      (id) =>
        String(
          points[id]?.label || ""
        )
          .trim()
          .toUpperCase() === target
    ) || null
  );
}

/* --------------------------------------------------
 * SEGMENT
 * -------------------------------------------------- */

export function renderSegment(
  segment,
  index,
  positions,
  endpoints
) {
  if ( !segment || !endpoints ) {
    return null;
  }

  const { firstId, secondId,} = endpoints;

  const p1 =  positions[firstId];

  const p2 = positions[secondId];

  if ( !p1 || !p2 ) {
    return null;
  }

  return (
    <line
      key={`${segment.id}-${index}`}
      x1={p1.x}
      y1={p1.y}
      x2={p2.x}
      y2={p2.y}
      stroke="blue"
      strokeWidth="2"
      strokeLinecap="round"
    />
  );
}

/* --------------------------------------------------
 * POINTS
 * -------------------------------------------------- */

export function renderPoints(
  points,
  positions,
  relationships = [],
  segments = [],
  circles = []
) {
  return Object.keys(points).map((id) => {
    const point = points[id];
    const position = positions[id];

    if (!position) {
      return null;
    }

    /*
     * ------------------------------------------
     * POINT ON SEGMENT
     * ------------------------------------------
     */

    const isPointOnSegment =
      relationships.some(
        (r) =>
          (
            r.type === "midpoint_of" ||
            r.type === "lies_on"
          ) &&
          r.elements?.includes(id) &&
          r.elements?.some((elementId) =>
            String(elementId).startsWith("segment_")
          )
      );

    /*
    * ------------------------------------------
    * CIRCLE ENDPOINT
    * ------------------------------------------
    */

    let isCircleEndpoint = false;

    if (circles.length > 0) {
      const centerId =
        Object.keys(points).find(
          (pointId) =>
            String(
              points[pointId]?.label || ""
            ).toUpperCase() === "O"
        );

      if (centerId && id !== centerId) {

        /*
        * ----------------------------------------
        * RADIUS
        * ----------------------------------------
        *
        * O ---- P
        *
        * O is an endpoint of the segment.
        */

        const isRadiusEndpoint =
          segments.some((segment) => {
            const endpoints =
              getSegmentEndpoints(
                segment,
                points
              );

            if (!endpoints) {
              return false;
            }

            const normalizedLabel =
              String(segment.label || "")
                .replace(/\$/g, "")
                .trim()
                .toLowerCase();

            if (normalizedLabel !== "r") {
              return false;
            }

            if (
              endpoints.firstId !== centerId &&
              endpoints.secondId !== centerId
            ) {
              return false;
            }

            const otherId =
              endpoints.firstId === centerId
                ? endpoints.secondId
                : endpoints.firstId;

            return otherId === id;
          });


        /*
        * ----------------------------------------
        * DIAMETER
        * ----------------------------------------
        *
        * A ---- O ---- B
        *
        * O is midpoint of AB.
        */

        const isDiameterEndpoint =
          relationships.some((relationship) => {

            if (
              relationship.type !==
              "midpoint_of"
            ) {
              return false;
            }

            const midpointId =
              relationship.element_id ||
              relationship.elements?.find(
                (elementId) =>
                  elementId === centerId
              );

            if (midpointId !== centerId) {
              return false;
            }

            const diameterSegmentId =
              relationship.target_segment ||
              relationship.target ||
              relationship.elements?.find(
                (elementId) =>
                  String(elementId)
                    .startsWith("segment_")
              );

            if (!diameterSegmentId) {
              return false;
            }

            const diameterSegment =
              segments.find(
                (segment) =>
                  segment.id ===
                  diameterSegmentId
              );

            if (!diameterSegment) {
              return false;
            }

            const endpoints =
              getSegmentEndpoints(
                diameterSegment,
                points
              );

            if (!endpoints) {
              return false;
            }

            return (
              endpoints.firstId === id ||
              endpoints.secondId === id
            );
          });


        isCircleEndpoint =
          isRadiusEndpoint ||
          isDiameterEndpoint;
      }
    }

   /*
    * ------------------------------------------
    * LABEL POSITION
    * ------------------------------------------
    */

    let labelX = position.x;
    let labelY = position.y;
    let labelAnchor = "middle";

    if (isCircleEndpoint) {
      const centerId =
        Object.keys(points).find(
          (pointId) =>
            String(points[pointId]?.label || "")
              .toUpperCase() === "O"
        );

      const centerPosition =
        centerId
          ? positions[centerId]
          : null;

      if (centerPosition) {
        const dx =
          position.x - centerPosition.x;

        const dy =
          position.y - centerPosition.y;

        const length =
          Math.hypot(dx, dy);

        const outwardOffset = 14;

        if (length > 0) {
          labelX =
            position.x +
            (dx / length) * outwardOffset;

          labelY =
            position.y +
            (dy / length) * outwardOffset;

          /*
          * Horizontal direction:
          *
          * right endpoint → text starts to right
          * left endpoint  → text ends to left
          */
          if (Math.abs(dx) > Math.abs(dy)) {
            labelAnchor =
              dx > 0
                ? "start"
                : "end";
          } else {
            /*
            * Vertical endpoint.
            */
            labelAnchor = "middle";
          }
        }
      } else {
        labelX = position.x + 12;
        labelY = position.y + 4;
        labelAnchor = "start";
      }
    } else {
      labelY = isPointOnSegment
        ? position.y + 16
        : position.y - 10;
    }

    return (
      <g key={id}>
        <circle
          cx={position.x}
          cy={position.y}
          r="4"
          fill="currentColor"
        />

        {point.label && (
          <text
            x={labelX}
            y={labelY}
            textAnchor={labelAnchor}
            dominantBaseline="middle"
            className="fill-slate-800 text-sm font-semibold"
          >
            {point.label}
          </text>
        )}
      </g>
    );
  });
}
/* --------------------------------------------------
 * SEGMENT LABEL / VALUE
 * -------------------------------------------------- */

export function renderSegmentAnnotations(
  segments,
  points,
  positions,
  relationships = []
) {

 
  return segments.map(
    (segment, index) => {

  
      const endpoints =
        getSegmentEndpoints(
          segment,
          points
        );

      if (!endpoints) {
        return null;
      }

      const p1 =
        positions[
          endpoints.firstId
        ];

      const p2 =
        positions[
          endpoints.secondId
        ];


      if (!p1 || !p2) {
        return null;
      }

      const rawText =
      segment.text ||
      segment.value_expression ||
      (
        segment.value !== undefined
          ? String(segment.value)
          : ""
      ) 
      const text =
        formatGeometryValue(
          rawText,
          "segment"
        );

      if (!text) {
        return null;
      }
    

      const labelPosition =
        calculateSegmentLabelPosition(
          p1,
          p2,
        );
        
        

      if (!labelPosition) {
        return null;
      }

      return (
        <text
          key={
            segment.id ||
            `segment-label-${index}`
          }
          x={labelPosition.x}
          y={labelPosition.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-slate-700 text-xs font-semibold"
        >
          {text}
        </text>
      );
    }
  );
}
/* --------------------------------------------------
 * ANGLE GEOMETRY HELPERS
 * -------------------------------------------------- */

/*
 * Normalize an angle to:
 *
 * -π ... +π
 */
function normalizeAngle(angle) {
  while (
    angle > Math.PI
  ) {
    angle -=
      2 * Math.PI;
  }

  while (
    angle < -Math.PI
  ) {
    angle +=
      2 * Math.PI;
  }

  return angle;
}

/*
 * Create an SVG arc path between two
 * rays sharing the same vertex.
 */
function createAngleArcPath({
  vertex,
  first,
  second,
  radius,
}) {
  const firstAngle =
    Math.atan2(
      first.y - vertex.y,
      first.x - vertex.x
    );

  const secondAngle =
    Math.atan2(
      second.y - vertex.y,
      second.x - vertex.x
    );

  let delta =
    normalizeAngle(
      secondAngle -
        firstAngle
    );

  /*
   * Start point on first ray.
   */
  const startX =
    vertex.x +
    Math.cos(firstAngle) *
      radius;

  const startY =
    vertex.y +
    Math.sin(firstAngle) *
      radius;

  /*
   * End point on second ray.
   */
  const endX =
    vertex.x +
    Math.cos(secondAngle) *
      radius;

  const endY =
    vertex.y +
    Math.sin(secondAngle) *
      radius;

  /*
   * For our triangle/exterior-angle
   * use cases the smaller angle is correct.
   */
  const largeArcFlag =
    Math.abs(delta) >
    Math.PI
      ? 1
      : 0;

  /*
   * SVG sweep direction.
   *
   * Positive mathematical angle becomes
   * clockwise in SVG because Y increases
   * downward.
   */
  const sweepFlag =
    delta > 0
      ? 1
      : 0;

  return {
    path: `
      M ${startX} ${startY}
      A ${radius} ${radius}
        0 ${largeArcFlag}
        ${sweepFlag}
        ${endX} ${endY}
    `,
    firstAngle,
    secondAngle,
    delta,
  };
}

/* --------------------------------------------------
 * ANGLE LABEL POSITION
 * -------------------------------------------------- */

function calculateAngleLabelPosition({
  vertex,
  first,
  second,
  offset,
}) {
  const v1x =
    first.x -
    vertex.x;

  const v1y =
    first.y -
    vertex.y;

  const v2x =
    second.x -
    vertex.x;

  const v2y =
    second.y -
    vertex.y;

  const len1 =
    Math.hypot(
      v1x,
      v1y
    );

  const len2 =
    Math.hypot(
      v2x,
      v2y
    );

  if (
    len1 === 0 ||
    len2 === 0
  ) {
    return null;
  }

  const ux =
    v1x / len1;

  const uy =
    v1y / len1;

  const vx =
    v2x / len2;

  const vy =
    v2y / len2;

  /*
   * Angle bisector direction.
   */
  const bisectorX =
    ux + vx;

  const bisectorY =
    uy + vy;

  const bisectorLength =
    Math.hypot(
      bisectorX,
      bisectorY
    );

  if (
    bisectorLength === 0
  ) {
    return null;
  }

  return {
    x:
      vertex.x +
      (bisectorX /
        bisectorLength) *
        offset,

    y:
      vertex.y +
      (bisectorY /
        bisectorLength) *
        offset,
  };
}

/* --------------------------------------------------
 * ANGLES
 *
 * Renders:
 *
 * 1. actual SVG angle arc
 * 2. angle value
 *
 * Example:
 *
 *       P
 *      / \
 *     /   \
 *    Q--R--S
 *
 * angle_prs
 *
 * P - R - S
 *
 * R = vertex
 * -------------------------------------------------- */

export function renderAngles(
  angles,
  points,
  positions,
  figure // 🔴 pass figure into this function
) {
  return angles.map((angle, index) => {
    if (!angle) return null;

    const id = String(angle.id || "");
    const match = id.match(/^angle_([a-z])([a-z])([a-z])$/i);
    if (!match) return null;

    const firstId = findPointByLabel(points, match[1]);
    const vertexId = findPointByLabel(points, match[2]);
    const secondId = findPointByLabel(points, match[3]);

    if (!firstId || !vertexId || !secondId) return null;

    const vertex = positions[vertexId];
    const first = positions[firstId];
    const second = positions[secondId];
    if (!vertex || !first || !second) return null;

    const arc = createAngleArcPath({ vertex, first, second, radius: 24 });
    const labelPosition = calculateAngleLabelPosition({
      vertex,
      first,
      second,
      offset: 38,
    });
    if (!labelPosition) return null;

    // 🔴 FIX: suppress value only for altitude type
    let value = "";
    if (figure?.type !== "triangle_with_altitude") {
      const rawValue =
        angle.text || angle.value_expression || angle.value || "";
      value = rawValue
        ? formatGeometryValue(rawValue, "angle")
        : "";
    }

    return (
      <g key={angle.id || `angle-${index}`}>
        <path
          d={arc.path}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.75"
        />
        {value && (
          <text
            x={labelPosition.x}
            y={labelPosition.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-700 text-xs font-semibold"
          >
            {value}
          </text>
        )}
      </g>
    );
  });
}




export function renderCircles(
  circles,
  points,
  positions
) {

  const SVG_WIDTH = 520;
  const SVG_HEIGHT = 160;
  const HORIZONTAL_PADDING = 50;
  const VERTICAL_PADDING = 10;
  if (
    !Array.isArray(circles) ||
    circles.length === 0
  ) {
    return null;
  }

  /*
   * ----------------------------------------
   * SAFE SVG RADIUS
   * ----------------------------------------
   */

  const safeRadius =
    Math.min( 
      SVG_WIDTH / 2 - HORIZONTAL_PADDING,
      SVG_HEIGHT / 2 - VERTICAL_PADDING
    );

  return circles.map((circle, index) => {
      /*
       * ----------------------------------------
       * SPECIALIZED CENTER
       * ----------------------------------------
       *
       * geometryPositions.js may calculate a
       * circle center even when the AI geometry
       * does not contain point_o.
       */

      const specializedCenter = circle.__renderCenter;

      /*
       * ----------------------------------------
       * NORMAL CENTER
       * ----------------------------------------
       *
       * Preserve normal circle behavior where
       * point O exists.
       */

      const centerId =
        Object.keys(points || {}).find(
          (id) =>
            String(
              points[id]?.label || ""
            )
              .trim()
              .toUpperCase() === "O"
        );

      const normalCenter =
        centerId &&
        positions?.[centerId]
          ? positions[centerId]
          : null;

      /*
       * ----------------------------------------
       * SELECT CENTER
       * ----------------------------------------
       *
       * Priority:
       *
       * 1. Specialized calculated center
       * 2. Existing point O
       */

      const center = specializedCenter || normalCenter;

      /*
       * ----------------------------------------
       * NO CENTER
       * ----------------------------------------
       */

      if (
        !center ||
        !Number.isFinite(
          Number(center.x)
        ) ||
        !Number.isFinite(
          Number(center.y)
        )
      ) {
        console.warn(
          "[RENDER CIRCLE] No valid center",
          {
            circleId: circle.id,
            specializedCenter,
            centerId,
            normalCenter,
          }
        );

        return null;
      }

      /*
       * ----------------------------------------
       * RADIUS
       * ----------------------------------------
       *
       * Prefer specialized geometry radius.
       * Otherwise use the normal fallback.
       */

      const calculatedRadius =  Number( circle.__renderRadius  );

      const renderRadius =
        Number.isFinite(
          calculatedRadius
        ) &&
        calculatedRadius > 0
          ? calculatedRadius
          : safeRadius;

      /*
       * ----------------------------------------
       * DEBUG
       * ----------------------------------------
       */

      // console.log(
      //   "[RENDER CIRCLE]",
      //   {
      //     circleId: circle.id,
      //     center,
      //     renderRadius,
      //     specialized:
      //       Boolean(
      //         specializedCenter
      //       ),
      //   }
      // );

      /*
       * ----------------------------------------
       * DRAW
       * ----------------------------------------
       */

      return (
        <circle
          key={
            circle.id ||
            `circle-${index}`
          }
          cx={center.x}
          cy={center.y}
          r={renderRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      );
    }
  );
}


// geometryRenderers.js

export function renderCollinear(relationships, positions) {
  return relationships
    .filter(rel => rel.type === "collinear" && rel.__renderPolyline)
    .map((rel, idx) => {
      const pts = rel.__renderPolyline
        .map(id => positions[id])
        .filter(p => p && typeof p.x === "number" && typeof p.y === "number");

      if (pts.length >= 2) {
        const pointsAttr = pts.map(p => `${p.x},${p.y}`).join(" ");
        return (
          <polyline
            key={`collinear-${idx}`}
            points={pointsAttr}
            stroke="blue"
            strokeWidth="2"
            fill="none"
          />
        );
      }
      return null;
    });
}
