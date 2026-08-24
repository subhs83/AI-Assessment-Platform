/*
 * --------------------------------------------------
 * SOLVE SIMPLE ALGEBRAIC EQUATION
 * --------------------------------------------------
 *
 * Currently designed for one-variable equations.
 *
 * Examples:
 *
 * solveEquation("x + 3 = 8")
 * -> 5
 *
 * solveEquation(
 *   "(x + 3) * (x - 2) = (x + 1) * (x - 1)"
 * )
 * -> 2.5
 *
 * The solver supports linear and quadratic
 * polynomial equations.
 *
 * No eval() is used.
 * --------------------------------------------------
 */

export function solveEquation(
  equation,
  variable = "x"
) {
  if (
    equation === null ||
    equation === undefined
  ) {
    return null;
  }

  let input =
    String(equation)
      .trim()
      .replace(/[−–—]/g, "-")
      .replace(/×/g, "*")
      .replace(/÷/g, "/");

  if (!input) {
    return null;
  }

  /*
   * ----------------------------------------------
   * FIND EQUALITY
   * ----------------------------------------------
   */

  const equalityIndex =
    input.indexOf("=");

  if (equalityIndex === -1) {
    throw new Error(
      "Equation must contain '='"
    );
  }

  const left =
    input
      .slice(0, equalityIndex)
      .trim();

  const right =
    input
      .slice(equalityIndex + 1)
      .trim();

  if (!left || !right) {
    throw new Error(
      "Equation must have both sides"
    );
  }

  /*
   * ----------------------------------------------
   * POLYNOMIAL REPRESENTATION
   * ----------------------------------------------
   *
   * Polynomial:
   *
   * a*x² + b*x + c
   *
   * represented as:
   *
   * {
   *   0: c,
   *   1: b,
   *   2: a
   * }
   * ----------------------------------------------
   */

  function addPolynomial(
    first,
    second
  ) {
    const result = {
      ...first,
    };

    Object.entries(second)
      .forEach(
        ([power, coefficient]) => {
          result[power] =
            (result[power] || 0) +
            coefficient;
        }
      );

    return result;
  }

  function subtractPolynomial(
    first,
    second
  ) {
    const result = {
      ...first,
    };

    Object.entries(second)
      .forEach(
        ([power, coefficient]) => {
          result[power] =
            (result[power] || 0) -
            coefficient;
        }
      );

    return result;
  }

  function multiplyPolynomial(
    first,
    second
  ) {
    const result = {};

    Object.entries(first)
      .forEach(
        ([firstPower, firstCoefficient]) => {
          Object.entries(second)
            .forEach(
              ([
                secondPower,
                secondCoefficient,
              ]) => {
                const power =
                  Number(firstPower) +
                  Number(secondPower);

                result[power] =
                  (result[power] || 0) +
                  firstCoefficient *
                    secondCoefficient;
              }
            );
        }
      );

    return result;
  }

  /*
   * ----------------------------------------------
   * TOKENIZE POLYNOMIAL EXPRESSION
   * ----------------------------------------------
   */

  function tokenize(expression) {
    const tokens = [];

    let index = 0;

    while (
      index <
      expression.length
    ) {
      const char =
        expression[index];

      if (
        /\s/.test(char)
      ) {
        index += 1;
        continue;
      }

      /*
       * Number
       */

      if (
        /[0-9.]/.test(char)
      ) {
        let number = "";

        while (
          index <
            expression.length &&
          /[0-9.]/.test(
            expression[index]
          )
        ) {
          number +=
            expression[index];

          index += 1;
        }

        const value =
          Number(number);

        if (
          !Number.isFinite(value)
        ) {
          throw new Error(
            `Invalid number: ${number}`
          );
        }

        tokens.push({
          type: "number",
          value,
        });

        continue;
      }

      /*
       * Variable
       */

      if (
        char === variable
      ) {
        tokens.push({
          type: "variable",
          value: variable,
        });

        index += 1;
        continue;
      }

      /*
       * Operators
       */

      if (
        char === "+" ||
        char === "-" ||
        char === "*" ||
        char === "/" ||
        char === "(" ||
        char === ")"
      ) {
        tokens.push({
          type: char,
          value: char,
        });

        index += 1;
        continue;
      }

      throw new Error(
        `Unsupported character: ${char}`
      );
    }

    /*
     * ------------------------------------------
     * INSERT IMPLICIT MULTIPLICATION
     * ------------------------------------------
     *
     * 2x       -> 2 * x
     * 2(x+1)   -> 2 * (x+1)
     * (x+1)x   -> (x+1) * x
     * (x+1)(x-1)
     * ------------------------------------------
     */

    const result = [];

    for (
      let i = 0;
      i < tokens.length;
      i += 1
    ) {
      const current =
        tokens[i];

      const previous =
        result[result.length - 1];

      const previousCanMultiply =
        previous &&
        (
          previous.type ===
            "number" ||
          previous.type ===
            "variable" ||
          previous.type ===
            ")"
        );

      const currentCanMultiply =
        current.type ===
          "variable" ||
        current.type ===
          "(";

      if (
        previousCanMultiply &&
        currentCanMultiply
      ) {
        result.push({
          type: "*",
          value: "*",
        });
      }

      result.push(current);
    }

    return result;
  }

  /*
   * ----------------------------------------------
   * POLYNOMIAL PARSER
   * ----------------------------------------------
   */

  function parsePolynomial(
    expression
  ) {
    const tokens =
      tokenize(expression);

    let position = 0;

    const peek = () =>
      tokens[position];

    const consume = () =>
      tokens[position++];

    /*
     * Primary
     */

    function parsePrimary() {
      const token =
        peek();

      if (!token) {
        throw new Error(
          "Unexpected end of expression"
        );
      }

      /*
       * Number
       */

      if (
        token.type ===
        "number"
      ) {
        consume();

        return {
          0: token.value,
        };
      }

      /*
       * Variable
       */

      if (
        token.type ===
        "variable"
      ) {
        consume();

        return {
          1: 1,
        };
      }

      /*
       * Parentheses
       */

      if (
        token.type ===
        "("
      ) {
        consume();

        const value =
          parseExpression();

        const closing =
          consume();

        if (
          !closing ||
          closing.type !== ")"
        ) {
          throw new Error(
            "Missing closing parenthesis"
          );
        }

        return value;
      }

      /*
       * Unary + / -
       */

      if (
        token.type === "+" ||
        token.type === "-"
      ) {
        consume();

        const value =
          parsePrimary();

        if (
          token.type === "-"
        ) {
          return Object.fromEntries(
            Object.entries(value)
              .map(
                ([
                  power,
                  coefficient,
                ]) => [
                  power,
                  -coefficient,
                ]
              )
          );
        }

        return value;
      }

      throw new Error(
        `Unexpected token: ${token.value}`
      );
    }

    /*
     * Multiplication
     */

    function parseMultiplication() {
      let value =
        parsePrimary();

      while (true) {
        const token =
          peek();

        if (
          !token ||
          (
            token.type !==
              "*" &&
            token.type !==
              "/"
          )
        ) {
          break;
        }

        consume();

        const right =
          parsePrimary();

        if (
          token.type ===
          "*"
        ) {
          value =
            multiplyPolynomial(
              value,
              right
            );
        } else {
          /*
           * Polynomial division is only
           * supported when dividing by
           * a constant.
           */

          const powers =
            Object.keys(right);

          if (
            powers.length !==
              1 ||
            Number(powers[0]) !==
              0
          ) {
            throw new Error(
              "Polynomial division by variable expression is not supported"
            );
          }

          const divisor =
            right[0];

          if (
            divisor === 0
          ) {
            throw new Error(
              "Division by zero"
            );
          }

          value =
            Object.fromEntries(
              Object.entries(value)
                .map(
                  ([
                    power,
                    coefficient,
                  ]) => [
                    power,
                    coefficient /
                      divisor,
                  ]
                )
            );
        }
      }

      return value;
    }

    /*
     * Addition / subtraction
     */

    function parseExpression() {
      let value =
        parseMultiplication();

      while (true) {
        const token =
          peek();

        if (
          !token ||
          (
            token.type !==
              "+" &&
            token.type !==
              "-"
          )
        ) {
          break;
        }

        consume();

        const right =
          parseMultiplication();

        if (
          token.type ===
          "+"
        ) {
          value =
            addPolynomial(
              value,
              right
            );
        } else {
          value =
            subtractPolynomial(
              value,
              right
            );
        }
      }

      return value;
    }

    const polynomial =
      parseExpression();

    if (
      position !==
      tokens.length
    ) {
      throw new Error(
        `Unexpected token: ${
          tokens[position]?.value
        }`
      );
    }

    return polynomial;
  }

  /*
   * ----------------------------------------------
   * BUILD EQUATION POLYNOMIAL
   * ----------------------------------------------
   */

  const leftPolynomial =
    parsePolynomial(left);

  const rightPolynomial =
    parsePolynomial(right);

  const equationPolynomial =
    subtractPolynomial(
      leftPolynomial,
      rightPolynomial
    );

  /*
   * Remove tiny floating-point noise.
   */

  Object.keys(
    equationPolynomial
  ).forEach(
    (power) => {
      if (
        Math.abs(
          equationPolynomial[power]
        ) < 1e-10
      ) {
        delete equationPolynomial[
          power
        ];
      }
    }
  );

  /*
   * ----------------------------------------------
   * FIND DEGREE
   * ----------------------------------------------
   */

  const powers =
    Object.keys(
      equationPolynomial
    ).map(Number);

  const degree =
    powers.length > 0
      ? Math.max(...powers)
      : 0;

  /*
   * ----------------------------------------------
   * CONSTANT EQUATION
   * ----------------------------------------------
   */

  if (degree === 0) {
    const constant =
      equationPolynomial[0] || 0;

    if (
      Math.abs(constant) <
      1e-10
    ) {
      return null;
    }

    return null;
  }

  /*
   * ----------------------------------------------
   * LINEAR EQUATION
   *
   * ax + b = 0
   *
   * x = -b / a
   * ----------------------------------------------
   */

  if (degree === 1) {
    const a =
      equationPolynomial[1] || 0;

    const b =
      equationPolynomial[0] || 0;

    if (
      Math.abs(a) <
      1e-10
    ) {
      return null;
    }

    const solution =
      -b / a;

    return Number.isFinite(
      solution
    )
      ? solution
      : null;
  }

  /*
   * ----------------------------------------------
   * QUADRATIC EQUATION
   *
   * ax² + bx + c = 0
   * ----------------------------------------------
   */

  if (degree === 2) {
    const a =
      equationPolynomial[2] || 0;

    const b =
      equationPolynomial[1] || 0;

    const c =
      equationPolynomial[0] || 0;

    const discriminant =
      b * b -
      4 * a * c;

    /*
     * No real solution.
     */

    if (
      discriminant < -1e-10
    ) {
      return null;
    }

    /*
     * One repeated root.
     */

    if (
      Math.abs(discriminant) <
      1e-10
    ) {
      const solution =
        -b / (2 * a);

      return Number.isFinite(
        solution
      )
        ? solution
        : null;
    }

    /*
     * Two real roots.
     *
     * For geometry questions we
     * currently return the positive
     * root when only one valid
     * geometric value is expected.
     */

    const sqrtD =
      Math.sqrt(
        Math.max(
          0,
          discriminant
        )
      );

    const root1 =
      (-b + sqrtD) /
      (2 * a);

    const root2 =
      (-b - sqrtD) /
      (2 * a);

    const validRoots =
      [root1, root2]
        .filter(
          (root) =>
            Number.isFinite(root)
        );

    if (
      validRoots.length === 0
    ) {
      return null;
    }

    /*
     * Prefer a positive root.
     */

    const positiveRoot =
      validRoots.find(
        (root) =>
          root > 0
      );

    return positiveRoot ??
      validRoots[0];
  }

  /*
   * Higher-degree equations are
   * intentionally not handled yet.
   */

  throw new Error(
    `Unsupported polynomial degree: ${degree}`
  );
}



/*
 * --------------------------------------------------
 * SAFE MATHEMATICAL EXPRESSION EVALUATOR
 * --------------------------------------------------
 *
 * Supported:
 *
 *   12
 *   x
 *   x + 3
 *   x - 2
 *   2x
 *   2*x
 *   x/2
 *   (x + 3) / 2
 *   2(x + 3)
 *   (x + 3)(x - 2)
 *
 * Variables are supplied through the second argument:
 *
 * evaluateExpression("x + 3", { x: 2.5 })
 * -> 5.5
 *
 * No eval() is used.
 * --------------------------------------------------
 */

export function evaluateExpression(
  expression,
  variables = {}
) {
  if (
    expression === null ||
    expression === undefined
  ) {
    return null;
  }

  let input =
    String(expression)
      .trim()
      .replace(/\\left/g, "")
      .replace(/\\right/g, "");

  if (!input) {
    return null;
  }

  /*
   * ----------------------------------------------
   * NORMALIZE COMMON MATHEMATICAL NOTATION
   * ----------------------------------------------
   */

  input = input
    .replace(/[−–—]/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/\^/g, "**");

  /*
   * Convert implicit multiplication:
   *
   * 2x       -> 2*x
   * 2(x+1)   -> 2*(x+1)
   * (x+1)2   -> (x+1)*2
   * (x+1)(x-1) -> (x+1)*(x-1)
   */

  input = input
    .replace(
      /(\d|\))\s*([a-zA-Z(])/g,
      "$1*$2"
    )
    .replace(
      /([a-zA-Z])\s*(\d|\()/g,
      "$1*$2"
    );

  /*
   * ----------------------------------------------
   * TOKENIZER
   * ----------------------------------------------
   */

  const tokens = [];

  let index = 0;

  while (index < input.length) {
    const char = input[index];

    /*
     * Whitespace
     */

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    /*
     * Number
     */

    if (
      /[0-9.]/.test(char)
    ) {
      let number = "";

      while (
        index < input.length &&
        /[0-9.]/.test(input[index])
      ) {
        number += input[index];
        index += 1;
      }

      const value = Number(number);

      if (!Number.isFinite(value)) {
        throw new Error(
          `Invalid number: ${number}`
        );
      }

      tokens.push({
        type: "number",
        value,
      });

      continue;
    }

    /*
     * Variable
     */

    if (
      /[a-zA-Z_]/.test(char)
    ) {
      let name = "";

      while (
        index < input.length &&
        /[a-zA-Z0-9_]/.test(input[index])
      ) {
        name += input[index];
        index += 1;
      }

      tokens.push({
        type: "variable",
        value: name,
      });

      continue;
    }

    /*
     * Operators
     */

    if (
      char === "+" ||
      char === "-" ||
      char === "*" ||
      char === "/" ||
      char === "(" ||
      char === ")"
    ) {
      tokens.push({
        type: char,
        value: char,
      });

      index += 1;
      continue;
    }

    /*
     * Anything else is unsupported.
     */

    throw new Error(
      `Unsupported character in expression: ${char}`
    );
  }

  /*
   * ----------------------------------------------
   * PARSER
   * ----------------------------------------------
   */

  let position = 0;

  const peek = () =>
    tokens[position];

  const consume = () =>
    tokens[position++];

  /*
   * Primary:
   *
   * number
   * variable
   * (expression)
   */

  function parsePrimary() {
    const token = peek();

    if (!token) {
      throw new Error(
        "Unexpected end of expression"
      );
    }

    if (
      token.type === "number"
    ) {
      consume();
      return token.value;
    }

    if (
      token.type === "variable"
    ) {
      consume();

      const value =
        variables[token.value];

      if (
        value === undefined ||
        value === null
      ) {
        throw new Error(
          `Unknown variable: ${token.value}`
        );
      }

      const numericValue =
        Number(value);

      if (
        !Number.isFinite(
          numericValue
        )
      ) {
        throw new Error(
          `Invalid value for variable: ${token.value}`
        );
      }

      return numericValue;
    }

    if (
      token.type === "("
    ) {
      consume();

      const value =
        parseExpression();

      const closing =
        consume();

      if (
        !closing ||
        closing.type !== ")"
      ) {
        throw new Error(
          "Missing closing parenthesis"
        );
      }

      return value;
    }

    /*
     * Unary + / -
     */

    if (
      token.type === "+" ||
      token.type === "-"
    ) {
      consume();

      const value =
        parsePrimary();

      return token.type === "-"
        ? -value
        : value;
    }

    throw new Error(
      `Unexpected token: ${token.value}`
    );
  }

  /*
   * Multiplication / division
   */

  function parseMultiplication() {
    let value =
      parsePrimary();

    while (true) {
      const token =
        peek();

      if (
        !token ||
        (
          token.type !== "*" &&
          token.type !== "/"
        )
      ) {
        break;
      }

      consume();

      const right =
        parsePrimary();

      if (
        token.type === "*"
      ) {
        value *= right;
      } else {
        if (right === 0) {
          throw new Error(
            "Division by zero"
          );
        }

        value /= right;
      }
    }

    return value;
  }

  /*
   * Addition / subtraction
   */

  function parseExpression() {
    let value =
      parseMultiplication();

    while (true) {
      const token =
        peek();

      if (
        !token ||
        (
          token.type !== "+" &&
          token.type !== "-"
        )
      ) {
        break;
      }

      consume();

      const right =
        parseMultiplication();

      if (
        token.type === "+"
      ) {
        value += right;
      } else {
        value -= right;
      }
    }

    return value;
  }

  const result =
    parseExpression();

  /*
   * There must be no unused tokens.
   */

  if (
    position !== tokens.length
  ) {
    throw new Error(
      `Unexpected token: ${
        tokens[position]?.value
      }`
    );
  }

  if (
    !Number.isFinite(result)
  ) {
    throw new Error(
      "Expression produced an invalid number"
    );
  }

  return result;
}






export function findPointByLabel(points, label) {
  if (!points || !label) {
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


/*
 * --------------------------------------------------
 * GET SEGMENT ENDPOINTS
 * --------------------------------------------------
 *
 * Supported sources, in priority order:
 *
 * 1. Explicit endpoint fields
 *
 *    {
 *      id: "side_1",
 *      start: "point_a",
 *      end: "point_b"
 *    }
 *
 * 2. Semantic elements
 *
 *    {
 *      elements: [
 *        "point_a",
 *        "point_b"
 *      ]
 *    }
 *
 * 3. Conventional IDs
 *
 *    segment_ab
 *    diagonal_pr
 *    ray_rs
 *
 * The frontend should never depend exclusively
 * on the generated ID format.
 * --------------------------------------------------
 */

export function getSegmentEndpoints(
  segment,
  points
) {
  if (!segment ||  !points
  ) {
    return null;
  }


  /*
   * ------------------------------------------------
   * 1. Explicit endpoint fields
   * ------------------------------------------------
   */

  const explicitFirst =
    segment.start ||
    segment.start_point ||
    segment.first ||
    segment.first_point;

  const explicitSecond =
    segment.end ||
    segment.end_point ||
    segment.second ||
    segment.second_point;

  if (
    explicitFirst &&
    explicitSecond &&
    points[explicitFirst] &&
    points[explicitSecond]
  ) {
    return {
      firstId: explicitFirst,
      secondId: explicitSecond,
    };
  }


  /*
   * ------------------------------------------------
   * 2. Elements containing two points
   * ------------------------------------------------
   */

  if (
    Array.isArray(
      segment.elements
    )
  ) {
    const pointIds =
      segment.elements.filter(
        (id) =>
          Boolean(points[id])
      );

    if (
      pointIds.length >= 2
    ) {
      return {
        firstId:
          pointIds[0],
        secondId:
          pointIds[1],
      };
    }
  }


  /*
   * ------------------------------------------------
   * 3. Parse conventional ID
   *
   * segment_ab
   * diagonal_pr
   * ray_rs
   * line_qs
   *
   * We deliberately support line/ray too because
   * the parser stores all of them in `segments`.
   * ------------------------------------------------
   */

  const id =
    String(
      segment.id || ""
    ).trim();

  const match =
    id.match(
      /^(?:segment_|diagonal_|ray_|line_)([a-z])([a-z])$/i
    );

  if (match) {
    const firstLabel =
      match[1];

    const secondLabel =
      match[2];

    const firstId =
      findPointByLabel(
        points,
        firstLabel
      );

    const secondId =
      findPointByLabel(
        points,
        secondLabel
      );

    if (
      firstId &&
      secondId
    ) {
      return {
        firstId,
        secondId,
      };
    }
  }


  /*
 * ----------------------------------------
 * 3. DETERMINISTIC SEGMENT ID
 *
 * Example:
 *
 * segment_ab -> point_a + point_b
 * segment_cd -> point_c + point_d
 * segment_om -> point_o + point_m
 * ----------------------------------------
 */

const segmentId =
  String(segment.id || "");

const idMatch =
  segmentId.match(
    /^segment_([a-z])([a-z])$/i
  );

if (idMatch) {
  const firstId =
    `point_${idMatch[1].toLowerCase()}`;

  const secondId =
    `point_${idMatch[2].toLowerCase()}`;

  if (
    points[firstId] &&
    points[secondId]
  ) {
    return {
      firstId,
      secondId,
    };
  }
}

  /*
   * ------------------------------------------------
   * Unable to resolve
   * ------------------------------------------------
   */

  return null;
}


/*
 * --------------------------------------------------
 * MIDPOINT
 * --------------------------------------------------
 */

export function midpoint(
  p1,
  p2
) {
  if (
    !p1 ||
    !p2
  ) {
    return null;
  }

  return {
    x:
      (p1.x + p2.x) / 2,

    y:
      (p1.y + p2.y) / 2,
  };
}

/*
 * --------------------------------------------------
 * INTERSECTION 
 * --------------------------------------------------
 */
export function lineIntersection(
  p1,
  p2,
  p3,
  p4
) {
  if (
    !p1 ||
    !p2 ||
    !p3 ||
    !p4
  ) {
    return null;
  }

  const denominator =
    (p1.x - p2.x) *
      (p3.y - p4.y) -
    (p1.y - p2.y) *
      (p3.x - p4.x);

  if (
    Math.abs(denominator) <
    0.000001
  ) {
    return null;
  }

  const determinant1 =
    p1.x * p2.y -
    p1.y * p2.x;

  const determinant2 =
    p3.x * p4.y -
    p3.y * p4.x;

  return {
    x:
      (
        determinant1 *
          (p3.x - p4.x) -
        (p1.x - p2.x) *
          determinant2
      ) /
      denominator,

    y:
      (
        determinant1 *
          (p3.y - p4.y) -
        (p1.y - p2.y) *
          determinant2
      ) /
      denominator,
  };
}

/*
 * --------------------------------------------------
 * calculate Segment Label Position
 * --------------------------------------------------
 */
  export function calculateSegmentLabelPosition(
    p1,
    p2,
    offset = 10
  ) {
    if (!p1 || !p2) {
      return null;
    }

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    const length = Math.hypot(dx, dy);

    if (length === 0) {
      return null;
    }

    // Midpoint of the segment
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    // Unit perpendicular vector
    const normalX = -dy / length;
    const normalY = dx / length;

    return {
      x: midX + normalX * offset,
      y: midY + normalY * offset,
    };
  }



  export function calculateCircleFromThreePoints(
    pointA,
    pointB,
    pointC
  ) {
    if (
      !pointA ||
      !pointB ||
      !pointC
    ) {
      return null;
    }

    const ax = Number(pointA.x);
    const ay = Number(pointA.y);

    const bx = Number(pointB.x);
    const by = Number(pointB.y);

    const cx = Number(pointC.x);
    const cy = Number(pointC.y);

    if (
      !Number.isFinite(ax) ||
      !Number.isFinite(ay) ||
      !Number.isFinite(bx) ||
      !Number.isFinite(by) ||
      !Number.isFinite(cx) ||
      !Number.isFinite(cy)
    ) {
      return null;
    }

    const denominator =
      2 *
      (
        ax * (by - cy) +
        bx * (cy - ay) +
        cx * (ay - by)
      );

    /*
    * Points are collinear.
    * A unique circle cannot be determined.
    */

    if (
      Math.abs(denominator) <
      0.000001
    ) {
      return null;
    }

    const aSquared =
      ax * ax +
      ay * ay;

    const bSquared =
      bx * bx +
      by * by;

    const cSquared =
      cx * cx +
      cy * cy;

    const centerX =
      (
        aSquared * (by - cy) +
        bSquared * (cy - ay) +
        cSquared * (ay - by)
      ) /
      denominator;

    const centerY =
      (
        aSquared * (cx - bx) +
        bSquared * (ax - cx) +
        cSquared * (bx - ax)
      ) /
      denominator;

    const radius =
      Math.sqrt(
        Math.pow(
          centerX - ax,
          2
        ) +
        Math.pow(
          centerY - ay,
          2
        )
      );

    if (
      !Number.isFinite(centerX) ||
      !Number.isFinite(centerY) ||
      !Number.isFinite(radius) ||
      radius <= 0
    ) {
      return null;
    }

    return {
      center: {
        x: centerX,
        y: centerY,
      },
      radius,
    };
  }


  export function lineCircleIntersections(px, py, angle, cx, cy, r) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  const a = dx * dx + dy * dy; // Always 1.0 since cos^2 + sin^2 = 1
  const b = 2 * (dx * (px - cx) + dy * (py - cy));
  const c = (px - cx) ** 2 + (py - cy) ** 2 - r * r;

  const disc = b * b - 4 * a * c;

  // No intersection
  if (disc < 0) return [];

  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);

  // 1. Separate roots into near and far points based on distance t along the ray
  const minT = Math.min(t1, t2);
  const maxT = Math.max(t1, t2);

  // 2. Ensure minT and maxT are distinct to avoid point overlap (disc > epsilon)
  if (Math.abs(maxT - minT) < 1e-3) {
    // Single intersection point (Tangent ray)
    return [
      { x: px + maxT * dx, y: py + maxT * dy },
      { x: px + maxT * dx, y: py + maxT * dy }
    ];
  }

  // Two distinct intersection points (Secant ray)
  return [
    { x: px + minT * dx, y: py + minT * dy }, // Point A / C (Near Intersection)
    { x: px + maxT * dx, y: py + maxT * dy }  // Point B / D (Far Intersection)
  ];
}


  // At the top of your geometry helper file/module:
export const getSvgDimensions = (isMobile = false) => {
  if (isMobile) {
    return {
      width: 360,
      height: 280,
      paddingX: 20, // Horizontal padding for mobile
      paddingY: 20, // Vertical padding for mobile
      strokeWidth: 3.5,
      fontSize: 18,
    };
  }

  return {
    width: 520,
    height: 160,
    paddingX: 60, // Horizontal padding for desktop
    paddingY: 20, // Vertical padding for desktop
    strokeWidth: 2,
    fontSize: 13,
  };
};



