function normalizeRelationship(relationship) {
  if (!relationship || !relationship.type) return null;

  const type = relationship.type;

  // --------------------------------------------------
  // TRIANGLE
  // --------------------------------------------------
  if (type === "forms_triangle") {
    return {
      ...relationship,
      type: "forms_triangle",
      elements: relationship.elements || [],
    };
  }

   // --------------------------------------------------
  // COLLINEAR
  // --------------------------------------------------
  if (type === "collinear") {
    const elements = relationship.elements || [];

    // If we have 3 points, treat them as a polyline
    if (elements.length === 3) {
      return {
        ...relationship,
        type: "collinear",
        elements,
        // Add a render helper so the visual engine can draw the line
        __renderPolyline: elements.map(id => id),
      };
    }

    return {
      ...relationship,
      type: "collinear",
      elements,
    };
  }


  // --------------------------------------------------
  // MIDPOINT
  // --------------------------------------------------
  if (type === "midpoint_of") {
  const elements = relationship.elements || [];

  const pointId =
    relationship.element_id ||
    elements.find((id) =>
      String(id).startsWith("point_")
    );

  const segmentId =
    relationship.target_segment ||
    relationship.target ||
    elements.find((id) =>
      String(id).startsWith("segment_")
    );

  return {
    ...relationship,
    type: "midpoint_of",
    element_id: pointId || null,
    target_segment: segmentId || null,
  };
}
  // --------------------------------------------------
  // LENGTH RELATIONSHIP
  // --------------------------------------------------
  if (type === "has_length_relationship") {
    return {
      ...relationship,
      type: "has_length_relationship",
      relationship:
        relationship.relationship || null,
    };
  }

    // --------------------------------------------------
    // LIES ON
    // --------------------------------------------------
    if (type === "lies_on") {
    const elements = relationship.elements || [];

    const pointId =
        relationship.element_id ||
        elements.find((id) =>
        String(id).startsWith("point_")
        ) ||
        null;

    const segmentId =
        relationship.target ||
        relationship.target_segment ||
        elements.find((id) =>
        String(id).startsWith("segment_")
        ) ||
        null;

    return {
        ...relationship,
        type: "lies_on",
        element_id: pointId,
        target_segment: segmentId,
    };
    }


    // --------------------------------------------------
    // PARALLEL
    // --------------------------------------------------
    if (type === "parallel_to") {
    const elements = relationship.elements || [];

    const segmentIds = elements.filter((id) =>
        String(id).startsWith("segment_")
    );

    const pointIds = elements.filter((id) =>
        String(id).startsWith("point_")
    );

    return {
        ...relationship,
        type: "parallel_to",
        elements,
        segment_id:
        relationship.segment_id ||
        segmentIds[0] ||
        null,
        target_segment:
        relationship.target_segment ||
        relationship.target ||
        segmentIds[1] ||
        null,
        point_ids: pointIds,
    };
    }

    // --------------------------------------------------
    // INTERSECTS
    // --------------------------------------------------
    if (type === "intersects") {
    return {
        ...relationship,
        type: "intersects",
        elements: relationship.elements || [],
        target_point:
        relationship.target_point ||
        relationship.target ||
        null,
    };
    }

    // --------------------------------------------------
    // CONNECTED
    // --------------------------------------------------
    if (type === "connected_to") {
    return {
        ...relationship,
        type: "connected_to",
        elements: relationship.elements || [],
    };
    }

    // --------------------------------------------------
    // EQUAL RELATIONSHIP
    // --------------------------------------------------
    if (type === "equal_to") {
    return {
        ...relationship,
        type: "equal_to",
        elements: relationship.elements || [],
    };
    }


    // --------------------------------------------------
    // PERPENDICULAR
    // --------------------------------------------------
    if (type === "perpendicular_to") {
      return {
        ...relationship,
        type: "perpendicular_to",
        elements: relationship.elements || [],
      };
    }

    // --------------------------------------------------
    // TANGENT AT POINT
    // --------------------------------------------------
    if (type === "tangent_at_point") {
      return {
        ...relationship,
        type: "tangent_at_point",
        elements: relationship.elements || [],
        target_circle:
          relationship.target_circle ||
          relationship.target ||
          null,
        at_point:
          relationship.at_point ||
          null,
      };
    }


    // --------------------------------------------------
    // SECANT TO CIRCLE
    // --------------------------------------------------
    if (type === "is_secant_to") {
      const elements = relationship.elements || [];
      return {
        ...relationship,
        type: "is_secant_to",
        elements,
        segment_id: elements[0] || relationship.element_id || null,
        target_circle: relationship.target || relationship.target_circle || null,
      };
    }

  // --------------------------------------------------
  // CANONICAL RELATIONSHIPS
  // --------------------------------------------------
  return {
    ...relationship,
    elements: relationship.elements || [],
  };
}

function normalizeElement(element) {
  if (
    !element ||
    !element.id ||
    !element.type
  ) {
    return null;
  }

  return {
    ...element,
    label: element.label || "",
    text: element.text || "",
  };
}

export function parseGeometry(visual) {
  if (!visual) {
    return {
      points: {},
      segments: [],
      angles: [],
      labels: [],
      relationships: [],
    };
  }

  const elements = Array.isArray(visual.elements)
    ? visual.elements
    : [];

  const normalizedElements = elements
    .map(normalizeElement)
    .filter(Boolean);

  const points = {};
  const segments = [];
  const angles = [];
  const labels = [];
  const circles = [];

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

    default:
      break;
  }
});

  const relationships = (
    Array.isArray(visual.relationships)
      ? visual.relationships
      : []
  )
    .map(normalizeRelationship)
    .filter(Boolean);

 return {
  points,
  segments,
  angles,
  labels,
  circles,
  relationships,
};
}