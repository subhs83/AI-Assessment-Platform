import copy
import importlib.util
import json
from pathlib import Path


# Load only response_parser.py, avoiding Flask application imports.
parser_path = (
    Path(__file__).resolve().parent
    / "smart_exam_system"
    / "api"
    / "services"
    / "ai"
    / "response_parser.py"
)

spec = importlib.util.spec_from_file_location(
    "response_parser_under_test",
    parser_path,
)
parser = importlib.util.module_from_spec(spec)
spec.loader.exec_module(parser)


def make_question():
    elements = []
    relationships = []

    def add_polygon(shape_id, label, vertices):
        point_ids = []

        for index, (x, y) in enumerate(vertices):
            point_id = f"{shape_id}_p{index}"
            point_ids.append(point_id)
            elements.append({
                "id": point_id,
                "type": "point",
                "x": x,
                "y": y,
            })

        elements.append({
            "id": shape_id,
            "type": "polygon",
            "label": label,
        })

        relationships.append({
            "type": "forms_polygon",
            "elements": point_ids,
            "target": shape_id,
        })

    add_polygon(
        "original", "P",
        [(-4, 0), (-1, 0), (-3, 2)],
    )

    # Correct reflection across x=0.
    add_polygon(
        "image_a", "A",
        [(4, 0), (1, 0), (3, 2)],
    )

    # Distinct orientations, not translation-only alternatives.
    add_polygon(
        "image_b", "B",
        [(4, 2), (1, 2), (3, 0)],
    )
    add_polygon(
        "image_c", "C",
        [(4, 2), (1, 2), (2, 0)],
    )
    add_polygon(
        "image_d", "D",
        [(1, 0), (4, 0), (2, 2)],
    )

    elements.extend([
        {"id": "m1", "type": "point", "x": 0, "y": -2},
        {"id": "m2", "type": "point", "x": 0, "y": 4},
        {"id": "mirror", "type": "line", "label": "L"},
    ])

    relationships.extend([
        {
            "type": "forms_line",
            "elements": ["m1", "m2"],
            "target": "mirror",
        },
        {
            "type": "mirror_axis",
            "elements": ["mirror"],
            "target": "original",
        },
        {
            "type": "candidate_image",
            "elements": ["image_a", "image_b", "image_c", "image_d"],
            "target": "original",
        },
    ])

    return {
        "question_text": "Which polygon is the reflection of P across L?",
        "option_a": "Polygon A",
        "option_b": "Polygon B",
        "option_c": "Polygon C",
        "option_d": "Polygon D",
        "correct_answer": "A",
        "explanation": (
            "Polygon A has the reflected orientation, with corresponding "
            "vertices equally far from opposite sides of L."
        ),
        "visual_required": True,
        "visual_type": "geometry",
        "visual": {
            "figure": {
                "type": "symmetry",
                "subtype": "reflection",
                "feature": "identify_image",
                "show_grid": False,
            },
            "elements": elements,
            "relationships": relationships,
        },
    }


def polygon_points(question, shape_id):
    visual = question["visual"]
    by_id = {element["id"]: element for element in visual["elements"]}
    link = next(
        relationship
        for relationship in visual["relationships"]
        if relationship["type"] == "forms_polygon"
        and relationship["target"] == shape_id
    )
    return [by_id[point_id] for point_id in link["elements"]]


def copy_polygon(question, source, target, dx=0, dy=0):
    source_points = polygon_points(question, source)
    target_points = polygon_points(question, target)

    for first, second in zip(source_points, target_points):
        second["x"] = first["x"] + dx
        second["y"] = first["y"] + dy


def transform_all_points(question, transform):
    for element in question["visual"]["elements"]:
        if element["type"] == "point":
            element["x"], element["y"] = transform(
                element["x"], element["y"]
            )


def validate(question):
    return parser.parse_ai_response(
        json.dumps({"data": [question]}),
        expected_count=1,
    )


failures = []


def check(name, question, expected_error=None):
    result = validate(question)

    if expected_error is None:
        passed = result.get("success") is True
    else:
        passed = (
            result.get("success") is False
            and expected_error in result.get("message", "")
        )

    print(f"{'PASS' if passed else 'FAIL'}: {name}")

    if not passed:
        failures.append(name)
        print("  Returned:", result.get("message", "success"))
        print("  Expected:", expected_error or "success")


base = make_question()

# 1. Valid geometry.
check("Valid vertical reflection", base)

# 2. Rotate the entire construction: mirror becomes horizontal.
question = copy.deepcopy(base)
transform_all_points(question, lambda x, y: (-y, x))
check("Valid horizontal reflection", question)

# 3. Uniform rotation/scaling: mirror becomes y=x.
question = copy.deepcopy(base)
transform_all_points(question, lambda x, y: (x + y, -x + y))
check("Valid slanted reflection", question)

# 4. Equivalent relationship format.
question = copy.deepcopy(base)
relations = question["visual"]["relationships"]
relations[:] = [
    relation for relation in relations
    if relation["type"] != "candidate_image"
]
relations.extend(
    {
        "type": "candidate_image",
        "elements": [candidate],
        "target": "original",
    }
    for candidate in ["image_a", "image_b", "image_c", "image_d"]
)
check("Separate candidate relationships", question)

# 5. Candidate B duplicates A.
question = copy.deepcopy(base)
copy_polygon(question, "image_a", "image_b")
check("Duplicate candidate", question, "identical geometry")

# 6. Same boundary, but different starting vertex and direction.
question = copy.deepcopy(base)
copy_polygon(question, "image_a", "image_b")
link = next(
    relation for relation in question["visual"]["relationships"]
    if relation["type"] == "forms_polygon"
    and relation["target"] == "image_b"
)
ids = link["elements"]
link["elements"] = [ids[1], ids[0], ids[2]]
check("Reordered duplicate candidate", question, "identical geometry")

# 7. Candidate B differs from A only by translation.
question = copy.deepcopy(base)
copy_polygon(question, "image_a", "image_b", dx=2)
check("Translation-only candidate", question, "differ only by position")

# 8. Candidate B is placed on the original's side.
question = copy.deepcopy(base)
for point in polygon_points(question, "image_b"):
    point["x"] = -point["x"]
check("Wrong-side candidate", question, "opposite side")

# 9. Original touches the mirror.
question = copy.deepcopy(base)
polygon_points(question, "original")[0]["x"] = 0
check("Original touches mirror", question, "original must lie entirely")

# 10. Declared bounds exclude vertices.
question = copy.deepcopy(base)
question["visual"]["figure"]["bounds"] = {
    "x_min": -3,
    "x_max": 5,
    "y_min": -3,
    "y_max": 5,
}
check("Bounds exclude polygon", question, "bounds exclude vertex")

# 11. Geometry is valid but answer key is wrong.
question = copy.deepcopy(base)
question["correct_answer"] = "B"
check("Incorrect answer key", question, "correct_answer does not identify")

# 12. No candidate is the exact reflection.
question = copy.deepcopy(base)
polygon_points(question, "image_a")[2]["x"] += 0.25
check("No correct reflection", question, "exactly one candidate")

# 13. Options reordered: correct answer must follow the visible label.
question = copy.deepcopy(base)
question["option_a"] = "Polygon B"
question["option_b"] = "Polygon A"
question["correct_answer"] = "B"
check("Reordered options with correct key", question)

if failures:
    raise SystemExit(f"\n{len(failures)} test(s) failed.")

print("\nAll 13 local validation tests passed. No API calls were made.")