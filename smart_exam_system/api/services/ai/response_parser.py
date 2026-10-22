"""Parse generated MCQs; repair transport syntax, never rewrite their answers."""
import json
import logging
import re
import math

logger = logging.getLogger(__name__)

# Commands with prefixes that JSON could silently decode as control escapes.
_LATEX_COMMANDS = set("""
text textbf textit textrm theta times tau tan tanh tfrac frac beta bar
boxed binom big bigg begin neq ne nu nabla not ni rho right rightarrow
rangle rbrace rfloor rceil rm relax vec varphi vartheta varepsilon
angle circ pi sqrt alpha gamma delta lambda mu sigma phi omega infty
cdot le leq ge geq approx pm sin cos log ln mathrm mathbf left end
""".split())

_VISUAL_TYPES = {
    **dict.fromkeys((
        "triangle", "trapezoid", "parallelogram", "quadrilateral", "circle",
        "polygon", "coordinate_geometry", "fraction_model", "parallel_lines",
        "solid_geometry", "composite_geometry", "symmetry","mapping_diagram", 
        "conic_section",
    ), "geometry"),
    "table": "data_table", "chart": "chart", "graph": "graph",
    "venn_diagram": "venn_diagram", "physics": "physics", "chemistry": "chemistry",
}

# Narrow markers from observed unfinished generations; not a general prose filter.
_DRAFT_MARKERS = re.compile(
    r"\bwait,?\s+i made a mistake\b|"
    r"\bnew attempt for question\s*\d+\b|"
    r"\bre-checking the problem statement\b",
    re.IGNORECASE,
)


def _strip_outer_fences(text):
    """Accept a single fenced response or a lone closing fence, not multiple drafts."""
    text = text.lstrip("\ufeff").strip()
    text = re.sub(r"\A```(?:json)?[ \t]*\r?\n", "", text, count=1,
                  flags=re.IGNORECASE)
    # Handles both `}\n``` and `}` immediately followed by a closing fence.
    text = re.sub(r"\s*```\s*\Z", "", text, count=1)
    return text.strip()


def _repair_json_control_characters(text):
    """Escape raw controls and unescaped LaTeX without changing escaped backslashes.

    Known LaTeX commands are recognized inside $...$ math, including commands
    like \text whose first characters otherwise form valid JSON escapes.
    Unknown invalid JSON escapes are preserved as literal backslashes.
    Malformed Unicode escapes remain errors instead of being guessed.
    """
    result = []
    inside_string = False
    in_math = False
    i = 0
    while i < len(text):
        char = text[i]
        if char == '"':
            inside_string = not inside_string
            in_math = False
            result.append(char)
            i += 1
            continue
        if not inside_string:
            result.append(char)
            i += 1
            continue
        if char == "$":
            # Treat $$ as a single delimiter as well.
            delimiter = "$$" if text[i:i + 2] == "$$" else "$"
            in_math = not in_math
            result.append(delimiter)
            i += len(delimiter)
            continue
        if char == "\\":
            if i + 1 >= len(text):
                result.append(char)  # Let strict JSON parsing reject truncation.
                i += 1
                continue
            nxt = text[i + 1]
            # Consume escaped quotes/backslashes together; they cannot change state.
            if nxt in ('"', "\\", "/"):
                result.append(text[i:i + 2])
                i += 2
                continue
            match = re.match(r"[A-Za-z]+", text[i + 1:])
            if in_math and match and match.group() in _LATEX_COMMANDS:
                result.append("\\\\" + match.group())
                i += 1 + len(match.group())
                continue
            if nxt in "bfnrtu":
                result.append(text[i:i + 2])
                i += 2
                continue
            result.append("\\\\")
            i += 1
            continue
        if ord(char) < 32:
            result.append(json.dumps(char)[1:-1])
        else:
            result.append(char)
        i += 1
    return "".join(result)


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


def _reject_constant(value):
    raise ValueError(f"Invalid JSON numeric constant: {value}")

def _reflection_option_label(text):
    """Accept A, Image A, Polygon A, and simple LaTeX label wrappers."""
    text = text.strip().replace("$", "")
    text = re.sub(
        r"\\(?:text|mathrm|mathbf)\{([^{}]*)\}",
        r"\1",
        text,
    )
    text = re.sub(
        r"^(?:image|polygon|figure|candidate)\s+",
        "",
        text.strip(),
        flags=re.IGNORECASE,
    )
    return " ".join(text.split()).casefold()


def _validate_reflection_candidates(question):
    """
    Validate polygon reflection MCQs without modifying their content.
    Returns an error string or None.

    Other symmetry features retain their existing validation.
    """
    visual = question["visual"]
    figure = visual["figure"]

    if (
        figure.get("type") != "symmetry"
        or figure.get("subtype") != "reflection"
        or figure.get("feature") != "identify_image"
    ):
        return None

    def fail(message):
        return "reflection: " + message

    elements = visual.get("elements")
    relationships = visual.get("relationships")

    if not isinstance(elements, list) or not isinstance(relationships, list):
        return fail("elements and relationships must be arrays")

    by_id = {}

    for element in elements:
        if not isinstance(element, dict):
            return fail("invalid element")

        element_id = element.get("id")

        if (
            not isinstance(element_id, str)
            or not element_id.strip()
            or element_id in by_id
        ):
            return fail("missing or duplicate element ID")

        if element.get("type") not in ("point", "polygon", "line"):
            return fail("unsupported element type")

        label = element.get("label", "")
        if not isinstance(label, str):
            return fail("labels must be strings")

        if element["type"] == "point":
            for axis in ("x", "y"):
                value = element.get(axis)
                if (
                    type(value) not in (int, float)
                    or not math.isfinite(value)
                ):
                    return fail("point coordinates must be finite numbers")

        by_id[element_id] = element

    groups = {
        "forms_polygon": [],
        "forms_line": [],
        "mirror_axis": [],
        "candidate_image": [],
    }

    for relation in relationships:
        if not isinstance(relation, dict):
            return fail("invalid relationship")

        kind = relation.get("type")
        refs = relation.get("elements")
        target = relation.get("target")

        if kind not in groups:
            return fail("unsupported relationship")

        if (
            not isinstance(refs, list)
            or not refs
            or not all(isinstance(ref, str) for ref in refs)
            or len(set(refs)) != len(refs)
            or any(ref not in by_id for ref in refs)
            or not isinstance(target, str)
            or target not in by_id
        ):
            return fail("invalid relationship references")

        groups[kind].append(relation)

    if (
        len(groups["mirror_axis"]) != 1
        or len(groups["forms_line"]) != 1
    ):
        return fail("exactly one mirror definition is required")

    mirror_link = groups["mirror_axis"][0]
    line_link = groups["forms_line"][0]
    original_id = mirror_link["target"]

    if (
        len(mirror_link["elements"]) != 1
        or by_id[original_id]["type"] != "polygon"
    ):
        return fail("mirror_axis must target the original polygon")

    mirror_id = mirror_link["elements"][0]

    if (
        by_id[mirror_id]["type"] != "line"
        or line_link["target"] != mirror_id
        or len(line_link["elements"]) != 2
        or sum(e["type"] == "line" for e in elements) != 1
    ):
        return fail("invalid mirror line")

    candidate_ids = []

    for link in groups["candidate_image"]:
        if link["target"] != original_id:
            return fail("all candidates must reference the same original")
        candidate_ids.extend(link["elements"])

    if (
        len(candidate_ids) != 4
        or len(set(candidate_ids)) != 4
        or original_id in candidate_ids
        or any(by_id[cid]["type"] != "polygon" for cid in candidate_ids)
    ):
        return fail("four distinct candidate polygon references are required")

    shape_ids = {original_id, *candidate_ids}
    polygon_ids = {
        eid for eid, element in by_id.items()
        if element["type"] == "polygon"
    }

    if polygon_ids != shape_ids:
        return fail("use only the original and four candidate polygons")

    # Normalize coordinates for scale-independent geometric comparisons.
    point_elements = [
        element for element in elements if element["type"] == "point"
    ]

    if not point_elements:
        return fail("missing construction points")

    min_x = min(p["x"] for p in point_elements)
    max_x = max(p["x"] for p in point_elements)
    min_y = min(p["y"] for p in point_elements)
    max_y = max(p["y"] for p in point_elements)

    scale = max(max_x - min_x, max_y - min_y)

    if not math.isfinite(scale) or scale <= 0:
        return fail("invalid coordinate range")

    coords = {
        p["id"]: (
            (p["x"] - min_x) / scale,
            (p["y"] - min_y) / scale,
        )
        for p in point_elements
    }

    eps = 1e-8

    def close(a, b):
        return math.hypot(a[0] - b[0], a[1] - b[1]) <= eps

    def cross(a, b, c):
        return (
            (b[0] - a[0]) * (c[1] - a[1])
            - (b[1] - a[1]) * (c[0] - a[0])
        )

    def on_segment(a, b, p):
        return (
            abs(cross(a, b, p)) <= eps
            and min(a[0], b[0]) - eps <= p[0] <= max(a[0], b[0]) + eps
            and min(a[1], b[1]) - eps <= p[1] <= max(a[1], b[1]) + eps
        )

    def intersects(a, b, c, d):
        ab_c, ab_d = cross(a, b, c), cross(a, b, d)
        cd_a, cd_b = cross(c, d, a), cross(c, d, b)

        proper = (
            ((ab_c > eps and ab_d < -eps) or
             (ab_c < -eps and ab_d > eps))
            and
            ((cd_a > eps and cd_b < -eps) or
             (cd_a < -eps and cd_b > eps))
        )

        return proper or any((
            on_segment(a, b, c),
            on_segment(a, b, d),
            on_segment(c, d, a),
            on_segment(c, d, b),
        ))

    polygons = {}
    used_points = set(line_link["elements"])

    for link in groups["forms_polygon"]:
        target = link["target"]
        refs = link["elements"]

        if (
            target not in shape_ids
            or target in polygons
            or len(refs) < 3
            or any(ref not in coords for ref in refs)
        ):
            return fail("invalid polygon boundary")

        vertices = [coords[ref] for ref in refs]
        used_points.update(refs)

        if any(
            close(vertices[i], vertices[j])
            for i in range(len(vertices))
            for j in range(i + 1, len(vertices))
        ):
            return fail("polygon has repeated vertices")

        # Remove redundant points on straight edges before comparisons.
        changed = True
        while changed and len(vertices) > 3:
            changed = False
            for i in range(len(vertices)):
                previous = vertices[i - 1]
                current = vertices[i]
                following = vertices[(i + 1) % len(vertices)]
                if on_segment(previous, following, current):
                    vertices.pop(i)
                    changed = True
                    break

        n = len(vertices)

        for i in range(n):
            previous = vertices[i - 1]
            current = vertices[i]
            following = vertices[(i + 1) % n]

            # Reject an edge that doubles back along its neighbour.
            if abs(cross(previous, current, following)) <= eps:
                dot = (
                    (previous[0] - current[0]) *
                    (following[0] - current[0])
                    + (previous[1] - current[1]) *
                    (following[1] - current[1])
                )
                if dot > eps:
                    return fail("polygon boundary doubles back")

            for j in range(i + 1, n):
                if j == i + 1 or (i == 0 and j == n - 1):
                    continue
                if intersects(
                    vertices[i], vertices[(i + 1) % n],
                    vertices[j], vertices[(j + 1) % n],
                ):
                    return fail("polygon boundary intersects itself")

        area_twice = sum(
            vertices[i][0] * vertices[(i + 1) % n][1]
            - vertices[(i + 1) % n][0] * vertices[i][1]
            for i in range(n)
        )

        if abs(area_twice) <= eps:
            return fail("polygon has zero or negligible area")

        polygons[target] = vertices

    if set(polygons) != shape_ids:
        return fail("every polygon needs exactly one boundary")
    # Match the frontend: supplied bounds must contain every polygon.
    # Mirror-definition endpoints may lie outside the visible bounds.
    if "bounds" in figure:
        bounds = figure["bounds"]
        keys = ("x_min", "x_max", "y_min", "y_max")

        if not isinstance(bounds, dict):
            return fail("bounds must be an object")

        if any(
            type(bounds.get(key)) not in (int, float)
            or not math.isfinite(bounds[key])
            for key in keys
        ):
            return fail("bounds must contain four finite numbers")

        if (
            bounds["x_min"] >= bounds["x_max"]
            or bounds["y_min"] >= bounds["y_max"]
        ):
            return fail("bounds must have positive width and height")

        for link in groups["forms_polygon"]:
            for point_id in link["elements"]:
                point = by_id[point_id]

                if not (
                    bounds["x_min"] <= point["x"] <= bounds["x_max"]
                    and bounds["y_min"] <= point["y"] <= bounds["y_max"]
                ):
                    return fail(
                        f"bounds exclude vertex {point_id} "
                        f"of polygon {link['target']}; "
                        "expand bounds to contain all polygons"
                    )

    if used_points != set(coords):
        return fail("unreferenced construction points")

    mirror_refs = line_link["elements"]
    if any(ref not in coords for ref in mirror_refs):
        return fail("mirror endpoints must be points")

    a, b = [coords[ref] for ref in mirror_refs]
    length = math.hypot(b[0] - a[0], b[1] - a[1])

    if length <= eps:
        return fail("mirror endpoints must be distinct")

    ux = (b[0] - a[0]) / length
    uy = (b[1] - a[1]) / length

    def signed_distance(point):
        return ux * (point[1] - a[1]) - uy * (point[0] - a[0])

    original = polygons[original_id]
    distances = [signed_distance(p) for p in original]

    if all(distance > eps for distance in distances):
        original_side = 1
    elif all(distance < -eps for distance in distances):
        original_side = -1
    else:
        return fail("original must lie entirely on one side of the mirror")

    for cid in candidate_ids:
        if not all(
            signed_distance(p) * original_side < -eps
            for p in polygons[cid]
        ):
            return fail(
                "all candidate polygons must lie entirely on the opposite side"
            )

    def same_polygon(first, second):
        """Compare boundaries regardless of starting vertex or direction."""
        if len(first) != len(second):
            return False

        n = len(first)
        return any(
            all(close(first[i], second[(start + direction * i) % n])
                for i in range(n))
            for start in range(n)
            for direction in (1, -1)
        )

    def centered_polygon(vertices):
        # Polygon boundaries have already had redundant collinear
        # vertices removed. Centering removes translation only;
        # orientation, size, and outline remain unchanged.
        center_x = sum(p[0] for p in vertices) / len(vertices)
        center_y = sum(p[1] for p in vertices) / len(vertices)

        return [
            (p[0] - center_x, p[1] - center_y)
            for p in vertices
        ]

    centered_candidates = {
        cid: centered_polygon(polygons[cid])
        for cid in candidate_ids
    }

    for i, cid in enumerate(candidate_ids):
        for other_id in candidate_ids[i + 1:]:
            first_label = by_id[cid].get("label") or cid
            second_label = by_id[other_id].get("label") or other_id

            if same_polygon(polygons[cid], polygons[other_id]):
                return fail(
                    f"candidates {first_label} and {second_label} "
                    "have identical geometry"
                )

            if same_polygon(
                centered_candidates[cid],
                centered_candidates[other_id],
            ):
                return fail(
                    f"candidates {first_label} and {second_label} "
                    "differ only by position; use visibly different "
                    "orientations or polygon outlines"
                )

    # Reflection across an arbitrary line using its unit normal.
    reflected = []
    for point in original:
        distance = signed_distance(point)
        reflected.append((
            point[0] + 2 * distance * uy,
            point[1] - 2 * distance * ux,
        ))

    matches = [
        cid for cid in candidate_ids
        if same_polygon(reflected, polygons[cid])
    ]

    if len(matches) != 1:
        return fail("exactly one candidate must be the true reflection")

    # Resolve options through visible labels, never element order or IDs.
    labels = [
        _reflection_option_label(by_id[cid].get("label", ""))
        for cid in candidate_ids
    ]
    options = [
        _reflection_option_label(question[f"option_{letter}"])
        for letter in "abcd"
    ]

    if (
        any(not label for label in labels)
        or len(set(labels)) != 4
        or len(set(options)) != 4
        or set(options) != set(labels)
    ):
        return fail(
            "options must uniquely reference candidate labels, e.g. Polygon A"
        )

    matching_label = _reflection_option_label(
        by_id[matches[0]]["label"]
    )
    correct_index = "ABCD".index(question["correct_answer"])

    if options[correct_index] != matching_label:
        return fail("correct_answer does not identify the true reflection")

    return None

def _validate_questions(questions, expected_count):
    if not isinstance(questions, list) or not questions:
        return "Invalid format: expected a non-empty 'data' list"
    if expected_count is not None and len(questions) != expected_count:
        return f"Expected {expected_count} questions, received {len(questions)}"

    text_fields = ("question_text", "option_a", "option_b", "option_c",
                   "option_d", "explanation")
    for number, question in enumerate(questions, 1):
        prefix = f"Question {number}: "
        if not isinstance(question, dict):
            return prefix + "expected an object"
        for field in text_fields:
            if not isinstance(question.get(field), str) or not question[field].strip():
                return prefix + f"missing or empty {field}"
        if question.get("correct_answer") not in ("A", "B", "C", "D"):
            return prefix + "correct_answer must be A, B, C or D"
        options = [question[f"option_{letter}"].strip() for letter in "abcd"]
        if len(set(options)) != 4:
            return prefix + "duplicate answer options"
        if _DRAFT_MARKERS.search(question["explanation"]):
            return prefix + "explanation contains unfinished drafting text"
        if type(question.get("visual_required")) is not bool:
            return prefix + "visual_required must be a boolean"
        if "visual_type" not in question:
            return prefix + "missing visual_type"
        if not question["visual_required"]:
            if question["visual_type"] is not None or question.get("visual") is not None:
                return prefix + "a nonvisual question must have visual_type null and no visual"
            continue
        visual = question.get("visual")
        if not isinstance(visual, dict) or not isinstance(visual.get("figure"), dict):
            return prefix + "missing visual.figure"
        figure = visual["figure"]
        figure_type = figure.get("type")
        if not isinstance(figure_type, str) or figure_type not in _VISUAL_TYPES:
            return prefix + "unsupported figure.type"
        if not isinstance(figure.get("subtype"), str) or not figure["subtype"].strip():
            return prefix + "missing figure.subtype"
        expected_visual_type = _VISUAL_TYPES[figure_type]

        # Accept the figure type mistakenly repeated as the visual category.
        if question["visual_type"] == figure_type:
            question["visual_type"] = expected_visual_type

        if question["visual_type"] != expected_visual_type:
            return prefix + "visual_type does not match figure.type"
        reflection_error = _validate_reflection_candidates(question)
        if reflection_error:
            return prefix + reflection_error
    return None


def parse_ai_response(response_text, expected_count=None):
    """Return the existing success/data or success/message/raw response shape.

    Pass the requested question count to enforce it. Existing one-argument
    callers continue working. Validates general question structure and polygon reflection
    identify_image geometry. Other mathematical topics are not fully validated.
    """
    if not isinstance(response_text, str) or not response_text.strip():
        return {"success": False, "message": "Empty or non-text AI response"}
    if expected_count is not None and (
        type(expected_count) is not int or expected_count < 1
    ):
        return {"success": False, "message": "expected_count must be a positive integer"}
    try:
        cleaned = _strip_outer_fences(response_text)
        # Run before decoding: JSON can silently turn malformed \text into a tab.
        repaired = _repair_json_control_characters(cleaned)
        data = json.loads(repaired, object_pairs_hook=_unique_object,
                          parse_constant=_reject_constant)
        if repaired != cleaned:
            logger.info("Repaired JSON string escaping in AI response")
        if not isinstance(data, dict):
            error = "Invalid format: expected JSON object"
        else:
            error = _validate_questions(data.get("data"), expected_count)
        if error:
            return {"success": False, "message": error, "raw": response_text}
        return {"success": True, "data": data["data"]}
    except json.JSONDecodeError as error:
        logger.warning("Invalid AI JSON at line %s column %s: %s",
                       error.lineno, error.colno, error.msg)
        return {"success": False, "message": "Invalid JSON from AI", "raw": response_text}
    except ValueError as error:
        return {"success": False, "message": str(error), "raw": response_text}
    except Exception:
        logger.exception("Unexpected error while parsing AI response")
        return {"success": False, "message": "Failed to parse AI response", "raw": response_text}

        
def inspect_ai_response(response_text, expected_count):
    """Inspect individual questions without accepting a partial batch."""
    result = parse_ai_response(
        response_text,
        expected_count=expected_count,
    )

    if result.get("success"):
        return {
            "batch_readable": True,
            "items": [
                {
                    "index": index,
                    "valid": True,
                    "question": question,
                    "error": None,
                }
                for index, question in enumerate(result["data"])
            ],
        }

    # Recover only complete JSON with the expected number of slots.
    # Never guess ordering from truncated JSON or an incorrect count.
    try:
        if not isinstance(response_text, str):
            raise ValueError("Non-text response")

        data = json.loads(
            _repair_json_control_characters(
                _strip_outer_fences(response_text)
            ),
            object_pairs_hook=_unique_object,
            parse_constant=_reject_constant,
        )

        questions = (
            data.get("data")
            if isinstance(data, dict)
            else None
        )

        if (
            type(expected_count) is not int
            or expected_count < 1
            or not isinstance(questions, list)
            or len(questions) != expected_count
        ):
            raise ValueError("Cannot map questions to requested slots")

    except (ValueError, TypeError, OverflowError):
        return {
            "batch_readable": False,
            "message": result.get("message", "Invalid response"),
            "items": [],
        }

    items = []

    for index, question in enumerate(questions):
        checked = parse_ai_response(
            json.dumps(
                {"data": [question]},
                ensure_ascii=False,
            ),
            expected_count=1,
        )

        error = checked.get("message", "Validation failed")

        # The service adds the original question number.
        if error.startswith("Question 1: "):
            error = error[len("Question 1: "):]

        items.append({
            "index": index,
            "valid": bool(checked.get("success")),
            "question": (
                checked["data"][0]
                if checked.get("success")
                else question
            ),
            "error": None if checked.get("success") else error,
        })

    return {
        "batch_readable": True,
        "items": items,
    }