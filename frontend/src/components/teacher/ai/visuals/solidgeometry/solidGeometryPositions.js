import { getSvgDimensions } from "../geometry/geometryHelpers";

export function calculateSolidGeometryPositions({
  parsed,
  isMobile = false,
}) {
  if (!parsed?.valid) return null;

  const dimensions = getSvgDimensions(isMobile);

  const {
    width,
    height,
    paddingX,
    paddingY,
    fontSize,
    //strokeWidth,
  } = dimensions;

  const subtype = parsed.figure.subtype;
  const roles = parsed.dimensionsByRole;

  // Reserve space around the solid for upright dimension labels.
const labelWidth = fontSize * 8;
const labelGap = fontSize * 0.8;

const mobilePrism =  isMobile && subtype === "triangular_prism";

const marginLeft = Math.max(
  paddingX,
  mobilePrism
    ? fontSize * 6
    : ["cuboid", "triangular_prism"].includes(subtype)
      ? labelWidth + labelGap
      : fontSize * 2
);

const marginRight = Math.max(
  paddingX,
  mobilePrism
    ? fontSize * 6
    : ["cylinder", "cone", "triangular_prism"].includes(subtype)
      ? labelWidth + labelGap
      : fontSize * 2
);

const marginTop = Math.max(paddingY, fontSize * 2.5);
const marginBottom = Math.max(paddingY, fontSize * 3);

const availableWidth = width - marginLeft - marginRight;
const availableHeight = height - marginTop - marginBottom;

if (availableWidth <= 0 || availableHeight <= 0) return null;

const cx = marginLeft + availableWidth / 2;
const cy = marginTop + availableHeight / 2;

  const plane = {
    ...dimensions,
    subtype,
    figure: parsed.figure,
    dimensionLabels: [],
    dimensionLines: [],
  };

  const addDimension = (role, start, end, labelPoint) => {
    const dimension = roles[role];
    if (!dimension) return;

    plane.dimensionLines.push({
        id: dimension.id,
        role,
        start,
        end,
    });

    plane.dimensionLabels.push({
      id: dimension.id,
      text: dimension.label,
      x: labelPoint.x,
      y: labelPoint.y,
      anchor: labelPoint.anchor || "middle",
    });
  };

  const fit = (naturalWidth, naturalHeight) =>
    Math.min(
      availableWidth / naturalWidth,
      availableHeight / naturalHeight
    ) * 0.9;

  if (subtype === "cube" || subtype === "cuboid") {
    const length =
      subtype === "cube" ? roles.side.value : roles.length.value;

    const boxWidth =
      subtype === "cube" ? length : roles.width.value;

    const boxHeight =
      subtype === "cube" ? length : roles.height.value;

    const depthXNatural = boxWidth * 0.45;
    const depthYNatural = boxWidth * (isMobile ? 0.15 : 0.3);

    const scale = fit(
      length + depthXNatural,
      boxHeight + depthYNatural
    );

    const frontWidth = length * scale;
    const frontHeight = boxHeight * scale;
    const depthX = depthXNatural * scale;
    const depthY = depthYNatural * scale;

    const left = cx - (frontWidth + depthX) / 2;
    const top = cy - (frontHeight + depthY) / 2;

    const A = { x: left, y: top + depthY };
    const B = { x: left + frontWidth, y: top + depthY };
    const C = { x: B.x, y: B.y + frontHeight };
    const D = { x: A.x, y: A.y + frontHeight };

    const back = (point) => ({
      x: point.x + depthX,
      y: point.y - depthY,
    });

    const E = back(A);
    const F = back(B);
    const G = back(C);
    const H = back(D);

    plane.vertices = { A, B, C, D, E, F, G, H };

    const bottomLabel = {
      x: (D.x + C.x) / 2,
      y: D.y + fontSize * 1.7,
    };

    if (subtype === "cube") {
      addDimension("side", D, C, bottomLabel);
    } else {
      addDimension("length", D, C, bottomLabel);

      addDimension("width", C, G, {
        x: (C.x + G.x) / 2 + fontSize * 1.3,
        y: (C.y + G.y) / 2 + fontSize * 1.5,
      });

      addDimension("height", A, D, {
        x: A.x - labelGap,
        y: (A.y + D.y) / 2,
        anchor: "end",
    });
    }

    return plane;
  }

  if (subtype === "triangular_prism") {
    const a = roles.base_side_a.value;
    const b = roles.base_side_b?.value;
    const c = roles.base_side_c?.value;
    const prismLength = roles.prism_length.value;

    const hasSides = Number.isFinite(b) && Number.isFinite(c);

    // When only base and altitude are supplied, horizontal apex
    // placement is schematic. No equality marks are added.
    const apexX = hasSides
        ? (a * a + b * b - c * c) / (2 * a)
        : a / 2;

    const altitude = roles.base_altitude?.value ??
        Math.sqrt(Math.max(0, b * b - apexX * apexX));

    const depthX = prismLength * 0.45;
    const depthY = prismLength * 0.3;

    const raw = {
        A: { x: 0, y: 0 },
        B: { x: a, y: 0 },
        C: { x: apexX, y: -altitude },
        D: { x: depthX, y: -depthY },
        E: { x: a + depthX, y: -depthY },
        F: { x: apexX + depthX, y: -altitude - depthY },
        foot: { x: apexX, y: 0 },
    };

    const points = Object.values(raw);
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    const scale = fit(maxX - minX, maxY - minY);

    const project = (p) => ({
        x: cx + (p.x - (minX + maxX) / 2) * scale,
        y: cy + (p.y - (minY + maxY) / 2) * scale,
    });

    const vertices = Object.fromEntries(
        Object.entries(raw).map(([id, point]) => [id, project(point)])
    );

    const { A, B, C, E, F, foot } = vertices;
    plane.prism = { vertices };

    plane.leaderLines = [];

    const midBC = {
    x: (B.x + C.x) / 2,
    y: (B.y + C.y) / 2,
    };

    const midAltitude = {
    x: foot.x,
    y: (C.y + foot.y) / 2,
    };

    // Base length below the front triangle.
    addDimension("base_side_a", A, B, {
    x: (A.x + B.x) / 2,
    y: A.y + fontSize * 1.7,
    });

    // Left sloping side.
    addDimension("base_side_b", A, C, {
    x: Math.min(A.x, C.x) - labelGap,
    y: (A.y + C.y) / 2,
    anchor: "end",
    });

    // Right sloping side: outside the entire prism.
    const rightLabelX = Math.max(B.x, E.x, F.x) + labelGap;

    addDimension("base_side_c", B, C, {
    x: rightLabelX,
    y: midBC.y,
    anchor: "start",
    });

    if (roles.base_side_c) {
    plane.leaderLines.push({
        id: "leader-base-c",
        start: midBC,
        end: {
        x: rightLabelX - labelGap * 0.3,
        y: midBC.y,
        },
    });
    }

    // Altitude: a separate callout above-left of the front apex.
    const altitudeLabelX = Math.min(A.x, C.x) - labelGap;
    const altitudeLabelY = C.y - fontSize * 1.5;

    addDimension("base_altitude", C, foot, {
    x: altitudeLabelX,
    y: altitudeLabelY,
    anchor: "end",
    });

    if (roles.base_altitude) {
    plane.leaderLines.push({
        id: "leader-altitude",
        start: midAltitude,
        end: {
        x: altitudeLabelX + labelGap * 0.3,
        y: altitudeLabelY,
        },
    });
    }

    // Prism length above the whole connecting edge.
    addDimension("prism_length", C, F, {
    x: (C.x + F.x) / 2,
    y: Math.min(C.y, F.y) - fontSize * 1.5,
    });
    
    if (roles.base_side_b) {
        plane.leaderLines.push({
            id: "leader-base-b",
            start: {
            x: (A.x + C.x) / 2,
            y: (A.y + C.y) / 2,
            },
            end: {
            x: Math.min(A.x, C.x) - labelGap * 0.7,
            y: (A.y + C.y) / 2,
            },
        });
        }

        if (roles.prism_length) {
        plane.leaderLines.push({
            id: "leader-prism-length",
            start: {
            x: (C.x + F.x) / 2,
            y: (C.y + F.y) / 2,
            },
            end: {
            x: (C.x + F.x) / 2,
            y: Math.min(C.y, F.y) - fontSize * 0.7,
            },
        });
        }
    return plane;
    }

    if (subtype === "square_pyramid") {
  const side = roles.base_side.value;

  const pyramidHeight = roles.height?.value ??
    Math.sqrt(
      roles.slant_height.value ** 2 - (side / 2) ** 2
    );

  // Project a horizontal square base into a parallelogram.
  // The apex stays vertically above its centre.
  const depthX = side * 0.38;
  const depthY = side * 0.28;

  const rawA = { x: 0, y: 0 };
  const rawB = { x: side, y: 0 };
  const rawC = { x: side + depthX, y: -depthY };
  const rawD = { x: depthX, y: -depthY };

  const rawCentre = {
    x: (rawA.x + rawC.x) / 2,
    y: (rawA.y + rawC.y) / 2,
  };

  const rawApex = {
    x: rawCentre.x,
    y: rawCentre.y - pyramidHeight,
  };

  const rawMidpoint = {
    x: (rawA.x + rawB.x) / 2,
    y: 0,
  };

  const raw = {
    A: rawA,
    B: rawB,
    C: rawC,
    D: rawD,
    centre: rawCentre,
    apex: rawApex,
    midpoint: rawMidpoint,
  };

  // Reserve one label lane on each side without altering
  // the margins of other solids.
  const textLane = fontSize * 6;
  const localLeft = Math.max(paddingX, textLane);
  const localRight = Math.max(paddingX, textLane);
  const localTop = Math.max(paddingY, fontSize * 2);
  const localBottom = Math.max(paddingY, fontSize * 3);

  const usableWidth = width - localLeft - localRight;
  const usableHeight = height - localTop - localBottom;

  if (usableWidth <= 0 || usableHeight <= 0) return null;

  const allPoints = Object.values(raw);
  const minX = Math.min(...allPoints.map((p) => p.x));
  const maxX = Math.max(...allPoints.map((p) => p.x));
  const minY = Math.min(...allPoints.map((p) => p.y));
  const maxY = Math.max(...allPoints.map((p) => p.y));

  const scale = Math.min(
    usableWidth / (maxX - minX),
    usableHeight / (maxY - minY)
  ) * 0.9;

  const project = (p) => ({
    x:
      localLeft + usableWidth / 2 +
      (p.x - (minX + maxX) / 2) * scale,
    y:
      localTop + usableHeight / 2 +
      (p.y - (minY + maxY) / 2) * scale,
  });

  const vertices = Object.fromEntries(
    Object.entries(raw).map(([id, point]) => [
      id,
      project(point),
    ])
  );

  const { A, B, apex, centre, midpoint } = vertices;

  plane.pyramid = { vertices };
  plane.leaderLines = [];

  addDimension("base_side", A, B, {
    x: (A.x + B.x) / 2,
    y: A.y + fontSize * 1.7,
  });

  const heightMidpoint = {
    x: centre.x,
    y: (apex.y + centre.y) / 2,
  };

  if (roles.height) {
    const labelX = A.x - labelGap;

    addDimension("height", apex, centre, {
      x: labelX,
      y: heightMidpoint.y,
      anchor: "end",
    });

    plane.leaderLines.push({
      id: "leader-pyramid-height",
      start: heightMidpoint,
      end: {
        x: labelX + labelGap * 0.3,
        y: heightMidpoint.y,
      },
    });
  }

  if (roles.slant_height) {
    const slantMidpoint = {
      x: (apex.x + midpoint.x) / 2,
      y: (apex.y + midpoint.y) / 2,
    };

    const labelX = Math.max(
      vertices.B.x,
      vertices.C.x
    ) + labelGap;

    // Separate labels vertically when both heights are supplied.
    const labelY = roles.height
      ? slantMidpoint.y + fontSize * 2.5
      : slantMidpoint.y;

    addDimension("slant_height", apex, midpoint, {
      x: labelX,
      y: labelY,
      anchor: "start",
    });

    plane.leaderLines.push({
      id: "leader-pyramid-slant",
      start: slantMidpoint,
      end: {
        x: labelX - labelGap * 0.3,
        y: labelY,
      },
    });
  }

  return plane;
}


  const radialRole = roles.radius ? "radius" : "diameter";
  const radius =
    radialRole === "radius"
      ? roles.radius.value
      : roles.diameter.value / 2;

  if (subtype === "cylinder") {
    const cylinderHeight = roles.height.value;
    const ellipseRatio = 0.28;

    const scale = fit(
      radius * 2,
      cylinderHeight + radius * ellipseRatio * 2
    );

    const rx = radius * scale;
    const ry = rx * ellipseRatio;
    const bodyHeight = cylinderHeight * scale;

    const topY = cy - bodyHeight / 2;
    const bottomY = cy + bodyHeight / 2;

    plane.cylinder = { cx, topY, bottomY, rx, ry };

    addDimension(
      radialRole,
      { x: radialRole === "radius" ? cx : cx - rx, y: topY },
      { x: cx + rx, y: topY },
      { x: cx, y: topY - ry - fontSize * 1.3 }
    );

    addDimension(
      "height",
      { x: cx + rx, y: topY },
      { x: cx + rx, y: bottomY },
      { x: cx + rx + fontSize * 2.5, y: cy,  anchor: "start", }
    );

    return plane;
  }

  if (subtype === "cone") {
    // Construction may derive a height, but only supplied dimensions
    // receive lines and labels.
    const coneHeight = roles.height?.value ??
      Math.sqrt(
        roles.slant_height.value ** 2 - radius ** 2
      );

    const ellipseRatio = 0.28;

    const scale = fit(
      radius * 2,
      coneHeight + radius * ellipseRatio
    );

    const rx = radius * scale;
    const ry = rx * ellipseRatio;
    const bodyHeight = coneHeight * scale;

    const apex = {
      x: cx,
      y: cy - (bodyHeight + ry) / 2,
    };

    const base = {
      x: cx,
      y: apex.y + bodyHeight,
    };

    const left = { x: cx - rx, y: base.y };
    const right = { x: cx + rx, y: base.y };

    plane.cone = { apex, base, left, right, rx, ry };

    addDimension(
      radialRole,
      radialRole === "radius" ? base : left,
      right,
      { x: cx, y: base.y + ry + fontSize * 1.4 }
    );

    addDimension("height", apex, base, {
      x: cx - fontSize * 2.2,
      y: (apex.y + base.y) / 2,
      
    });

    addDimension("slant_height", apex, right, {
      x: (apex.x + right.x) / 2 + fontSize * 2.5,
      y: (apex.y + right.y) / 2,
      anchor: "start",
    });

    return plane;
  }

  if (subtype === "sphere") {
    const scale = fit(radius * 2, radius * 2);
    const r = radius * scale;

    plane.sphere = { cx, cy, r };

    addDimension(
        radialRole,
        { x: radialRole === "radius" ? cx : cx - r, y: cy },
        { x: cx + r, y: cy },
        { x: cx, y: cy + r + fontSize * 1.5 }
    );

    return plane;
    }

    if (subtype === "hemisphere") {
        const ellipseRatio = 0.28;
        const scale = fit(radius * 2, radius * (1 + ellipseRatio));
        const r = radius * scale;
        const ry = r * ellipseRatio;

        const baseY = cy + (r - ry) / 2;

        plane.hemisphere = { cx, baseY, r, ry };

        addDimension(
            radialRole,
            {
            x: radialRole === "radius" ? cx : cx - r,
            y: baseY,
            },
            { x: cx + r, y: baseY },
            { x: cx, y: baseY + ry + fontSize * 1.5 }
        );

        return plane;
        }

  return null;
}