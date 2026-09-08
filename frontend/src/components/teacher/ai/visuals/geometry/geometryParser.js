function normalizeRelationship(relationship) {
  if (!relationship || !relationship.type) return null;

  const type = relationship.type;

  // --------------------------------------------------
  // TRIANGLE / POLYGON
  // --------------------------------------------------
 if (type === "forms_triangle" || type === "forms_polygon" || type === "forms_parallelogram" || type === "forms_trapezoid" || type === "forms_quadrilateral") {
  return {
    ...relationship,
    type,
    elements: relationship.elements || [],
    polygon_type: relationship.polygon_type || null,
    properties: relationship.properties || {},
  };
}

  // --------------------------------------------------
  // COLLINEAR & BETWEEN
  // --------------------------------------------------
  if (type === "collinear" || type === "is_collinear") {
    const elements = relationship.elements || [];
    return {
      ...relationship,
      type: "collinear",
      elements,
      __renderPolyline: elements.length >= 3 ? elements.map((id) => id) : null,
    };
  }

  if (type === "between") {
    return {
      ...relationship,
      type: "between",
      elements: relationship.elements || [],
      targets: relationship.targets || [],
    };
  }

  // --------------------------------------------------
  // MIDPOINT & POSITION ON SEGMENT
  // --------------------------------------------------
  if (type === "midpoint_of" || type === "is_midpoint_of") {
    const elements = relationship.elements || [];
    const pointId = relationship.element_id || elements.find((id) => String(id).startsWith("point_"));
    const segmentId = relationship.target_segment || relationship.target || elements.find((id) => String(id).startsWith("segment_"));

    return {
      ...relationship,
      type: "midpoint_of",
      element_id: pointId || null,
      target_segment: segmentId || null,
    };
  }

   if (type === "lies_on" || type === "is_on_segment" || type === "is_on_line" || type === "is_on_ray") {
    const elements = relationship.elements || [];
    const pointId =
      relationship.element_id ||
      elements.find((id) => String(id).startsWith("point_")) ||
      null;

    const segmentId =
      relationship.target ||
      relationship.target_segment ||
      elements.find((id) => String(id).startsWith("segment_")) ||
      null;

    return {
      ...relationship,
      type: "lies_on",
      element_id: pointId,
      target_segment: segmentId,
    };
  }

  // --------------------------------------------------
  // BISECTS (one or two segments bisected by a point)
  // --------------------------------------------------
  if (type === "bisects") {
    const elements = relationship.elements || [];
    const rawTarget = relationship.target;
    const targets = Array.isArray(rawTarget)
      ? rawTarget
      : [rawTarget].filter(Boolean);

    return {
      ...relationship,
      type: "bisects",
      elements,
      targets, // always an array, even for a single-segment case (e.g. kite)
    };
  }

    // --------------------------------------------------
    // CIRCLE: CENTER, RADIUS/DIAMETER, CIRCUMFERENCE POINTS
    // --------------------------------------------------
    if (type === "is_center_of") {
      return {
        ...relationship,
        type: "is_center_of",
        elements: relationship.elements || [],
        target: relationship.target || null,
      };
    }

    if (type === "is_radius_of" || type === "is_diameter_of") {
      return {
        ...relationship,
        type, // keep distinct — radius and diameter are meaningfully different facts
        elements: relationship.elements || [],
        target: relationship.target || null,
      };
    }

    if (type === "is_on_circumference" || type === "on_circumference") {
      return {
        ...relationship,
        type: "is_on_circumference",
        elements: relationship.elements || [],
        target: relationship.target || null,
      };
    }

    if (type === "forms_chord") {
  return {
    ...relationship,
    type: "forms_chord",
    elements: relationship.elements || [],
    target: relationship.target || null,
  };
}
  // --------------------------------------------------
  // ANGLE FORMATION & SAME-ARC RELATIONSHIPS
  // --------------------------------------------------
  if (type === "forms_angle") {
    return {
      ...relationship,
      type: "forms_angle",
      elements: relationship.elements || [],
      target: relationship.target || null,
    };
  }

  if (type === "subtends_same_arc") {
    return {
      ...relationship,
      type: "subtends_same_arc",
      elements: relationship.elements || [],
      target: relationship.target || null, // e.g. "arc_ab" — informational only, not used for positions today
    };
  }

  if (type === "inscribed_angle_half_central") {
    return {
      ...relationship,
      type: "inscribed_angle_half_central",
      elements: relationship.elements || [],
    };
  }
    
  // --------------------------------------------------
  // PARALLEL & PERPENDICULAR
  // --------------------------------------------------
  if (type === "parallel_to") {
    const elements = relationship.elements || [];
    const lineIds = elements.filter(
      (id) => String(id).startsWith("segment_") || String(id).startsWith("line_")
    );

    return {
      ...relationship,
      type: "parallel_to",
      elements,
      segment_id: relationship.segment_id || lineIds[0] || null,
      target_segment:
        relationship.target_segment || relationship.target || lineIds[1] || null,
    };
  }

  if (type === "perpendicular_to" || type === "is_perpendicular_to") {
    return {
      ...relationship,
      type: "perpendicular_to",
      elements: relationship.elements || [],
    };
  }


  // --------------------------------------------------
  // CIRCLE RELATIONSHIPS (TANGENT & SECANT)
  // --------------------------------------------------
  if (type === "tangent_to" || type === "tangent_at_point") {
    return {
      ...relationship,
      type: "tangent_to",
      elements: relationship.elements || [],
      target_circle: relationship.target || relationship.target_circle || null,
      at_point: relationship.at_point || null,
    };
  }

  if (type === "secant_to" || type === "is_secant_to") {
    return {
      ...relationship,
      type: "secant_to",
      elements: relationship.elements || [],
      target_circle: relationship.target || relationship.target_circle || null,
      at_points: relationship.at_points || [],
    };
  }

  // --------------------------------------------------
  // COORDINATE GEOMETRY (CARTESIAN PLANE)
  // --------------------------------------------------
  if (type === "plotted_on") {
    return {
      ...relationship,
      type: "plotted_on",
      elements: relationship.elements || [],
      target: relationship.target || "cartesian_plane",
    };
  }

  // --------------------------------------------------
  // GENERAL INTERSECTIONS & SEGMENT FORMATION
  // --------------------------------------------------
  if (type === "intersects" || type === "forms_segment" || type === "passes_through") {
    return {
      ...relationship,
      type,
      elements: relationship.elements || [],
      target: relationship.target || null,
    };
  }

  // --------------------------------------------------
  // CANONICAL FALLBACK
  // --------------------------------------------------
  return {
    ...relationship,
    elements: relationship.elements || [],
  };
}

function normalizeElement(element) {
  if (!element || !element.id || !element.type) {
    return null;
  }

  return {
    ...element,
    label: element.label || "",
    text: element.text || "",
    value: element.value !== undefined ? element.value : null,
  };
}

export function parseGeometry(visual) {
  if (!visual) {
    return {
      points: {},
      segments: [],
      angles: [],
      labels: [],
      circles: [],
      relationships: [],
      figure: { type: null, subtype: null },
    };
  }

  const elements = Array.isArray(visual.elements) ? visual.elements : [];

  const normalizedElements = elements.map(normalizeElement).filter(Boolean);

  const points = {};
  const segments = [];
  const angles = [];
  const labels = [];
  const circles = [];
  const arcs = [];

  normalizedElements.forEach((element) => {
    switch (element.type) {
      case "point":
        points[element.id] = element;
        break;

      case "segment":
      case "line":
      case "ray":
        segments.push(element);
        break;

      case "angle":
        angles.push(element);
        break;

      case "label":
        labels.push(element);
        break;

      case "circle":
        circles.push(element);
        break;

      case "arc": 
      arcs.push(element); 
      break;


      default:
        break;
    }
  });

  const relationships = (
    Array.isArray(visual.relationships) ? visual.relationships : []
  )
    .map(normalizeRelationship)
    .filter(Boolean);

      // ==================================================
      // Auto-patch: synthesize a subtends_arc relationship (+ its arc_*
      // element) for feature: "segment" questions, since these JSONs
      // give a forms_angle at the center but no explicit arc element or
      // subtends_arc link — unlike "sector" questions, which already
      // state both. Without this, renderArcs has nothing to find the
      // angle through and draws nothing.
      // ==================================================
      if (visual.figure?.type === "circle" && visual.figure?.feature === "segment") {
        const centerRel = relationships.find((r) => r.type === "is_center_of");
        const centerId = centerRel?.elements?.[0] || null;

        const centralAngleRel = relationships.find(
          (r) => r.type === "forms_angle" && r.elements?.[1] === centerId
        );

        if (centralAngleRel) {
          const [ptA, , ptB] = centralAngleRel.elements || [];
          const letterA = String(ptA || "").replace("point_", "");
          const letterB = String(ptB || "").replace("point_", "");
          const arcId = `arc_${letterA}${letterB}`;

          const arcAlreadyExists = relationships.some(
            (r) => r.type === "subtends_arc" && r.target === arcId
          );

          if (!arcAlreadyExists && letterA && letterB) {
            relationships.push({
              type: "subtends_arc",
              elements: [centralAngleRel.target],
              target: arcId,
            });
            // Not pushed into `angles` — it's an arc, not an angle — but
            // renderArcs only needs the relationship + the target id
            // string to draw the boundary; it never reads an "arcs"
            // array element for feature: "segment" since no label/value
            // needs to attach to it beyond what forms_angle already has.
          }
        }
      }
    // ==================================================
    // ADD THE CODE HERE: Automatically patch missing base triangle segments
    // ==================================================
    const mainTriangleRel = relationships.find((r) => r.type === "forms_triangle");
    if (mainTriangleRel && Array.isArray(mainTriangleRel.elements) && mainTriangleRel.elements.length === 3) {
      const [v1, v2, v3] = mainTriangleRel.elements;
      const autoSegments = [
        { id: `segment_${v1}_${v2}`, start: v1, end: v2, type: "segment" },
        { id: `segment_${v2}_${v3}`, start: v2, end: v3, type: "segment" },
        { id: `segment_${v3}_${v1}`, start: v3, end: v1, type: "segment" },
      ];

      autoSegments.forEach((autoSeg) => {
        const exists = segments.some(
          (s) =>
            (s.start === autoSeg.start && s.end === autoSeg.end) ||
            (s.start === autoSeg.end && s.end === autoSeg.start) ||
            s.id === autoSeg.id
        );
        if (!exists) {
          segments.push(autoSeg);
        }
      });
    }

    // ==================================================
    // Auto-patch: draw each altitude as ONE line, vertex -> orthocenter.
    // The foot point (A/B/C/X/Y/Z) is always exactly collinear with its
    // vertex and H/O — H is defined as the intersection of the
    // vertex<->foot lines — so a single vertex->H segment automatically
    // passes through the foot when rendered, for both acute (foot
    // inside) and obtuse (foot outside) triangles. No separate
    // foot->H segment needed, and no fragile letter-matching for it.
    // ==================================================
    const orthoRel = relationships.find((r) => r.type === "intersect_at");
    const orthoId = orthoRel?.target || null;

    if (orthoId) {
      const orthoMatch = /^point_([a-z])$/i.exec(orthoId);
      if (orthoMatch) {
        const orthoLetter = orthoMatch[1].toLowerCase();

        relationships
          .filter((r) => r.type === "is_altitude" || r.type === "altitude")
          .forEach((rel) => {
            const vertexId = rel.elements?.[1]; // e.g. "point_m"
            const vertexMatch = /^point_([a-z])$/i.exec(vertexId || "");
            if (!vertexMatch) return;

            const vertexLetter = vertexMatch[1].toLowerCase();
            const segId = `segment_${vertexLetter}${orthoLetter}`;

            const alreadyExists = segments.some((s) => s.id === segId);
            if (!alreadyExists) {
              segments.push({ id: segId, type: "segment" });
            }
          });
      }
    }

        // ==================================================
    // Auto-patch: draw the triangle silhouette whenever figure.type is
    // "triangle", regardless of which specific relationships the JSON
    // happens to state. Vertex source tried in order, most reliable first:
    //   1. forms_triangle.elements (explicit, authoritative)
    //   2. Union of letters from is_midpoint_of targets (e.g. Q1: PS/QT/RU
    //      medians -> targets segment_qr/segment_pr/segment_pq -> {p,q,r})
    //   3. First 3 point ids in element order (e.g. Q2: only segment_yz
    //      is named, so tier 2 yields just {y,z} -- fall back to
    //      point_x/point_y/point_z from `elements`)
    // ==================================================
    if (visual.figure?.type === "triangle") {
      let triangleVertexIds = mainTriangleRel?.elements || null;

      if (!triangleVertexIds || triangleVertexIds.length !== 3) {
        const letters = new Set();
        relationships
          .filter((r) => r.type === "is_midpoint_of" && r.target)
          .forEach((r) => {
            const match = /^segment_([a-z])([a-z])$/i.exec(r.target);
            if (match) {
              letters.add(match[1].toLowerCase());
              letters.add(match[2].toLowerCase());
            }
          });

        if (letters.size === 3) {
          triangleVertexIds = [...letters].map((l) => `point_${l}`);
        }
      }

      if (!triangleVertexIds || triangleVertexIds.length !== 3) {
        // Tier 3: first 3 points in element order, excluding any point
        // that's already known to be a midpoint/derived point (S, W, T,
        // U, G, K, ...) so we don't accidentally grab a non-vertex.
        const derivedPointIds = new Set(
          relationships
            .filter((r) => r.type === "is_midpoint_of")
            .map((r) => r.elements?.[0])
            .filter(Boolean)
        );

        const candidateVertices = Object.keys(points).filter(
          (id) => !derivedPointIds.has(id)
        );

        if (candidateVertices.length >= 3) {
          triangleVertexIds = candidateVertices.slice(0, 3);
        }
      }

      if (triangleVertexIds && triangleVertexIds.length === 3) {
        const [v1, v2, v3] = triangleVertexIds;
        const sides = [
          [v1, v2],
          [v2, v3],
          [v3, v1],
        ];

        sides.forEach(([a, b]) => {
          const letterA = a.replace("point_", "");
          const letterB = b.replace("point_", "");
          const exists = segments.some(
            (s) =>
              (s.start === a && s.end === b) ||
              (s.start === b && s.end === a) ||
              s.id === `segment_${letterA}${letterB}` ||
              s.id === `segment_${letterB}${letterA}`
          );
          if (!exists) {
            segments.push({ id: `segment_${letterA}${letterB}`, start: a, end: b, type: "segment" });
          }
        });
      }
    }

    // ==================================================
    // Auto-patch: synthesize a circle entry for incircle questions,
    // since these JSONs describe the incircle only through relationships
    // (is_incenter / is_tangency_point_incircle) with no explicit
    // type:"circle" element. Center/radius get filled in later by
    // calculateGeometryPositions via __renderCenter/__renderRadius.
    // ==================================================
    const hasIncircleRel = relationships.some(
      (r) => r.type === "is_incenter" || r.type === "is_tangency_point_incircle"
    );
    if (hasIncircleRel && circles.length === 0) {
      circles.push({ id: "circle_incircle", type: "circle" });
    }

        // ==================================================
    // Auto-patch: draw both rays of every forms_angle relationship as
    // segments (vertex -> first, vertex -> second), if they aren't
    // already present. This matters most for circle-family angle
    // questions (central_inscribed_angle, inscribed_polygon same-arc
    // cases, etc.) where the JSON only states forms_angle and never an
    // explicit forms_segment / forms_triangle for the angle's own rays
    // — without this, the figure renders as bare arcs floating on the
    // circle with no visible triangle/polygon connecting the points.
    // Safe no-op for figures that already have these segments (e.g.
    // via forms_triangle's own auto-patch above) thanks to the
    // existence check.
    // ==================================================
    relationships
      .filter((r) => r.type === "forms_angle" && Array.isArray(r.elements) && r.elements.length === 3)
      .forEach((rel) => {
        const [firstId, vertexId, secondId] = rel.elements;
        if (!firstId || !vertexId || !secondId) return;

        [[vertexId, firstId], [vertexId, secondId]].forEach(([a, b]) => {
          const exists = segments.some(
            (s) =>
              (s.start === a && s.end === b) ||
              (s.start === b && s.end === a) ||
              s.id === `segment_${a}_${b}` ||
              s.id === `segment_${b}_${a}`
          );
          if (!exists) {
            segments.push({ id: `segment_${a}_${b}`, start: a, end: b, type: "segment" });
          }
        });
      });

  return {
    points,
    segments,
    angles,
    labels,
    circles,
    arcs,
    relationships,
    figure: visual.figure || { type: null, subtype: null },
  };
}