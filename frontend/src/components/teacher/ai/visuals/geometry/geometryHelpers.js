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

  const leftPolynomial = parsePolynomial(left);

  const rightPolynomial =  parsePolynomial(right);

  const equationPolynomial = subtractPolynomial(leftPolynomial,rightPolynomial);

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

  const powers = Object.keys( equationPolynomial ).map(Number);

  const degree = powers.length > 0 ? Math.max(...powers) : 0;

  /*
   * ----------------------------------------------
   * CONSTANT EQUATION
   * ----------------------------------------------
   */

  if (degree === 0) {
    const constant = equationPolynomial[0] || 0;

    if ( Math.abs(constant) < 1e-10) {
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
    const a = equationPolynomial[1] || 0;

    const b = equationPolynomial[0] || 0;

    if (Math.abs(a) < 1e-10) {
      return null;
    }

    const solution = -b / a;

    return Number.isFinite( solution) ? solution : null;
  }

  /*
   * ----------------------------------------------
   * QUADRATIC EQUATION
   *
   * ax² + bx + c = 0
   * ----------------------------------------------
   */

  if (degree === 2) {
    const a =  equationPolynomial[2] || 0;

    const b =  equationPolynomial[1] || 0;

    const c =  equationPolynomial[0] || 0;

    const discriminant =  b * b - 4 * a * c;

    /*
     * No real solution.
     */

    if ( discriminant < -1e-10) {
      return null;
    }

    /*
     * One repeated root.
     */

    if ( Math.abs(discriminant) < 1e-10) {
      const solution = -b / (2 * a);

      return Number.isFinite(solution) ? solution  : null;
    }

    /*
     * Two real roots.
     *
     * For geometry questions we
     * currently return the positive
     * root when only one valid
     * geometric value is expected.
     */

    const sqrtD =  Math.sqrt( Math.max(0, discriminant));

    const root1 = (-b + sqrtD) /(2 * a);

    const root2 = (-b - sqrtD) / (2 * a);

    const validRoots = [root1, root2].filter((root) => Number.isFinite(root));

    if (validRoots.length === 0) {
      return null;
    }

    /*
     * Prefer a positive root.
     */

    const positiveRoot = validRoots.find((root) => root > 0 );
    return positiveRoot ?? validRoots[0];
  }

  /*
   * Higher-degree equations are
   * intentionally not handled yet.
   */

  throw new Error( `Unsupported polynomial degree: ${degree}` );
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
export function lineIntersection(p1, p2, p3, p4) {
  if (!p1 || !p2 || !p3 || !p4) {
    return null;
  }
  const denominator = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if ( Math.abs(denominator) < 0.000001) {
    return null;
  }
  const determinant1 = p1.x * p2.y - p1.y * p2.x;
  const determinant2 = p3.x * p4.y -  p3.y * p4.x;
  return {
    x: (determinant1 * (p3.x - p4.x) - (p1.x - p2.x) * determinant2 ) / denominator,
    y: (determinant1 * (p3.y - p4.y) - (p1.y - p2.y) * determinant2) / denominator,
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


/**
 * Projects a point P(px, py) onto an infinite line passing through A(ax, ay) and B(bx, by).
 * Reusable for altitudes, perpendicular bisectors, or any vector projections.
 */
export function projectPointToLine(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const abLenSq = abx * abx + aby * aby;
  
  if (abLenSq === 0) return { x: ax, y: ay };

  const apx = px - ax;
  const apy = py - ay;
  const t = (apx * abx + apy * aby) / abLenSq;

  return {
    x: ax + t * abx,
    y: ay + t * aby,
  };
}


/**
 * Generic helper to calculate the slant vector offset (dx, dy) for a polygon vertex angle.
 * 
 * @param {number} angleDeg - Target angle in degrees
 * @param {number} sideLength - Length of the adjacent side
 * @param {number} targetIndex - Index of the target vertex in the polygon array (0 to 3)
 * @returns {{dx: number, dy: number}} Vector offset components
 */
export function calculateSlantVector(angleDeg, sideLength, targetIndex = 1) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const dy = sideLength * Math.sin(angleRad);
  let dx = 0;

  switch (targetIndex) {
    case 0: // Top-Left vertex (e.g., A or X)
    case 3: // Bottom-Left vertex (e.g., D or W)
      dx = sideLength * Math.cos(angleRad);
      break;

    case 2: // Bottom-Right vertex (e.g., C or Z)
    case 1: // Top-Right vertex (e.g., B or Y)
    default:
      dx = -sideLength * Math.cos(angleRad);
      break;
  }

  return { dx, dy };
}


// Find the segment connecting two specific point ids, regardless of
// which "elements"/naming convention it used — reuses the same
// endpoint-resolution getSegmentEndpoints already relies on elsewhere.
export function findSegmentBetween(segments, points, idA, idB) {
  return segments.find((s) => {
    const ep = getSegmentEndpoints(s, points);
    if (!ep) return false;
    return (
      (ep.firstId === idA && ep.secondId === idB) ||
      (ep.firstId === idB && ep.secondId === idA)
    );
  });
}


// Intersection of infinite line p1-p2 with infinite line p3-p4.
// Shared by altitude (orthocenter) and median (centroid) — both need
// "where do two cevian lines cross," just with different lines feeding in.
export function intersectLines(p1, p2, p3, p4) {
  const d1x = p2.x - p1.x, d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x, d2y = p4.y - p3.y;
  const denom = d1x * d2y - d1y * d2x;
  if (Math.abs(denom) < 1e-9) return null;
  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denom;
  return { x: p1.x + t * d1x, y: p1.y + t * d1y };
}

// Value of the segment connecting two specific point ids, resolved via
// forms_segment relationships + the segments array. Shared by any
// feature that needs "what's the length between these two named
// points" (currently parallel_segment; reusable for future features
// needing the same lookup).
export function getSegmentValueBetween(relationships, segments, idA, idB) {
  const rel = relationships.find(
    (r) =>
      (r.type === "forms_segment" || r.type === "forms_chord") &&
      Array.isArray(r.elements) &&
      r.elements.includes(idA) &&
      r.elements.includes(idB)
  );
  if (!rel?.target) return null;
  const segObj = segments.find((s) => s.id === rel.target);
  return segObj?.value ?? null;
}

      // Hoisted: used by both hasAltitudeFeature and hasIncircleFeature.
      // Foot of the perpendicular from P onto the infinite line through A,B.
export function footOfPerpendicular(P, A, B) {
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return { x: A.x, y: A.y };
        const t = ((P.x - A.x) * dx + (P.y - A.y) * dy) / lenSq;
        return { x: A.x + t * dx, y: A.y + t * dy };
      };

// Given a fixed apex height and base width, find the apex's horizontal
// position so that the two rendered side lengths (apex->baseLeft,
// apex->baseRight) are actually proportional to targetRatio
// (= leftValue / rightValue). Distance from apex to a base vertex is
// sqrt(horizontalOffset^2 + height^2) -- strictly monotonic in the
// offset -- so this always converges via bisection, unlike a linear
// horizontal-only approximation which would be wrong whenever height
// is comparable to the base width.
export function solveApexXForRatio({ baseLeftX, baseRightX, apexY, baseY, targetRatio }) {
  const H = baseY - apexY;
  let lo = baseLeftX;
  let hi = baseRightX;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    const distL = Math.hypot(mid - baseLeftX, H);
    const distR = Math.hypot(baseRightX - mid, H);
    if (distL / distR < targetRatio) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

export function fitPositionsToBounds(positions, bounds, circles = []) {
  const { width, height, paddingX, paddingY } = bounds;

  const ids = Object.keys(positions).filter(
    (id) => Number.isFinite(positions[id]?.x) && Number.isFinite(positions[id]?.y)
  );

  // Include circle centers/radii in the bounding box too, so a circle
  // that extends beyond every point (like an excircle) doesn't get
  // clipped even after points themselves fit.
  const circleBoxes = (circles || [])
    .filter(
      (c) =>
        c.__renderCenter &&
        Number.isFinite(c.__renderCenter.x) &&
        Number.isFinite(c.__renderCenter.y) &&
        Number.isFinite(c.__renderRadius)
    )
    .map((c) => ({
      minX: c.__renderCenter.x - c.__renderRadius,
      maxX: c.__renderCenter.x + c.__renderRadius,
      minY: c.__renderCenter.y - c.__renderRadius,
      maxY: c.__renderCenter.y + c.__renderRadius,
    }));

  if (ids.length === 0 && circleBoxes.length === 0) return positions;

  const xs = ids.map((id) => positions[id].x);
  const ys = ids.map((id) => positions[id].y);

  let minX = xs.length ? Math.min(...xs) : Infinity;
  let maxX = xs.length ? Math.max(...xs) : -Infinity;
  let minY = ys.length ? Math.min(...ys) : Infinity;
  let maxY = ys.length ? Math.max(...ys) : -Infinity;

  circleBoxes.forEach((box) => {
    minX = Math.min(minX, box.minX);
    maxX = Math.max(maxX, box.maxX);
    minY = Math.min(minY, box.minY);
    maxY = Math.max(maxY, box.maxY);
  });

  const bboxW = maxX - minX || 1;
  const bboxH = maxY - minY || 1;
  const safeW = width - paddingX * 2;
  const safeH = height - paddingY * 2;

  const scale = Math.min(1, safeW / bboxW, safeH / bboxH);

  const bboxCenterX = (minX + maxX) / 2;
  const bboxCenterY = (minY + maxY) / 2;
  const targetCenterX = width / 2;
  const targetCenterY = height / 2;

  const transform = (x, y) => ({
    x: targetCenterX + (x - bboxCenterX) * scale,
    y: targetCenterY + (y - bboxCenterY) * scale,
  });

  ids.forEach((id) => {
    const { x, y } = transform(positions[id].x, positions[id].y);
    positions[id] = { ...positions[id], x, y };
  });

  // Apply the SAME transform to every circle's center, and scale its
  // radius by the same factor, so circles stay geometrically consistent
  // with the (now-transformed) points they're tangent to / centered on.
  (circles || []).forEach((c) => {
    if (
      c.__renderCenter &&
      Number.isFinite(c.__renderCenter.x) &&
      Number.isFinite(c.__renderCenter.y) &&
      Number.isFinite(c.__renderRadius)
    ) {
      const { x, y } = transform(c.__renderCenter.x, c.__renderCenter.y);
      c.__renderCenter = { x, y };
      c.__renderRadius = c.__renderRadius * scale;
    }
  });

  return positions;
}

/**
 * Generic helper to extract which point in `pointIds` corresponds to the vertex of the target angle.
 */
export function getTargetVertexId(relationships, pointIds) {
  const angleRel = relationships.find(
    (r) => r.type === "has_value" && String(r.element_id || "").toLowerCase().includes("angle")
  );

  if (!angleRel) return { angleValue: null, vertexId: pointIds[0] };

  const angleValue = typeof angleRel.value === "number" ? angleRel.value : Number(angleRel.value);
  const rawAngleId = String(angleRel.element_id).toLowerCase();

  // Clean point IDs to bare tokens (e.g., "point_x" -> "x")
  const pointTokens = pointIds.map((id) => ({
    fullId: id,
    token: id.replace(/^(point_|node_|v_)/i, "").toLowerCase(),
  }));

  // Match middle vertex of 3-letter sequence (e.g. angle_xyz -> "y") or single vertex (angle_x -> "x")
  let matchedPoint = pointTokens.find((pt) =>
    rawAngleId.includes(`_${pt.token}_`) ||
    rawAngleId.endsWith(`_${pt.token}`) ||
    rawAngleId === `angle_${pt.token}`
  );

  // Fallback: If 3-letter angle like "angle_xyz", extract middle letter "y"
  if (!matchedPoint) {
    const tripleMatch = rawAngleId.match(/angle_([a-z0-9])([a-z0-9])([a-z0-9])/i);
    if (tripleMatch) {
      const midToken = tripleMatch[2].toLowerCase();
      matchedPoint = pointTokens.find((pt) => pt.token === midToken);
    }
  }

  return {
    angleValue: isNaN(angleValue) ? null : angleValue,
    vertexId: matchedPoint ? matchedPoint.fullId : pointIds[0],
  };
}

export function tangentPointFromExternalPoint(center, radius, externalPoint, side = 1) {
  const dx = externalPoint.x - center.x;
  const dy = externalPoint.y - center.y;
  const d = Math.hypot(dx, dy);
  if (d <= radius) return null; // point is inside or on the circle, no tangent exists

  // Angle from center to external point.
  const baseAngle = Math.atan2(dy, dx);
  // Angle offset between OP and OA (the tangent point), derived from
  // the right triangle OAP: cos(offset) = radius / d.
  const offsetAngle = Math.acos(radius / d);

  const tangentAngle = baseAngle - side * offsetAngle; // side = 1 or -1 for the two possible tangent points
  return {
    x: center.x + Math.cos(tangentAngle) * radius,
    y: center.y + Math.sin(tangentAngle) * radius,
  };
}


// Compute nice tick interval targeting a MINIMUM pixel spacing,
// using the shared scale (not an independent per-axis range target).
// This guarantees consistent visual tick density on both axes,
// regardless of how their real-world ranges compare to each other.
function niceTickIntervalForScale(scale, minPixelSpacing = 18) {
  const minRealSpacing = minPixelSpacing / scale;
  const magnitude = Math.pow(10, Math.floor(Math.log10(minRealSpacing)));
  const normalized = minRealSpacing / magnitude;
  let nice;
  if (normalized <= 1) nice = 1;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 5) nice = 5;
  else nice = 10;
  return nice * magnitude;
}


export function computeCoordinatePlane(bounds, dataPoints, svgWidth, svgHeight, paddingX, paddingY) {
 
  let minX, maxX, minY, maxY;
  if (bounds) {
    ({ x_min: minX, x_max: maxX, y_min: minY, y_max: maxY } = bounds);
  } else {
    const xs = dataPoints.map((p) => p.x);
    const ys = dataPoints.map((p) => p.y);
    minX = Math.min(0, ...xs);
    maxX = Math.max(0, ...xs);
    minY = Math.min(0, ...ys);
    maxY = Math.max(0, ...ys);
    maxX = maxY>maxX ? maxY : maxX
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    minX -= rangeX * 0.15;
    maxX += rangeX * 0.15;
    minY -= rangeY * 0.15;
    maxY += rangeY * 0.15;
  }
  maxX = maxY>maxX ? maxY : maxX
  const availW = svgWidth - paddingX * 2;
  const availH = svgHeight - paddingY * 2;
  const scaleX = availW / (maxX - minX);
  const scaleY = availH / (maxY - minY);
  const scale = Math.min(scaleX, scaleY);

  // Center the used portion within the available canvas, rather than
  // anchoring it to one corner — distributes any unused margin (from
  // the aspect-ratio mismatch between data range and canvas) evenly.
  const usedW = (maxX - minX) * scale;
  const usedH = (maxY - minY) * scale;
  const offsetX = paddingX + (availW - usedW) / 2;
  const offsetY = paddingY + (availH - usedH) / 2;

  const tickX = niceTickIntervalForScale(scale);
  const tickY = niceTickIntervalForScale(scale);

  const toPixel = (x, y) => ({
    x: offsetX + (x - minX) * scale,
    y: svgHeight - offsetY - (y - minY) * scale,
  });

  return { minX, maxX, minY, maxY, tickX, tickY, scale, toPixel };
}

/*
 * ------------------------------------------
 * COORDINATE PARSING (fallback only — most points now carry x/y
 * directly on the element, per the current prompt format)
 * ------------------------------------------
 */
export function parseCoordinate(raw) {
  if (!raw) return null;
  const match = /\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/.exec(String(raw));
  if (!match) return null;
  return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
}


  // At the top of your geometry helper file/module:
export const getSvgDimensions = (isMobile = false) => {
  if (isMobile) {
    return {
      width: 380,
      height:  240, // taller for coordinate planes
      paddingX: 20,
      paddingY: 20,
      strokeWidth: 3,
      fontSize: 16,
    };
  }

  return {
    width:  520,
    height:  200,
    paddingX:  60,
    paddingY:  25,
    strokeWidth: 2,
    fontSize: 10,
  };
};



