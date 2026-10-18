import ast
import copy
import importlib.util
import json
import logging
import os
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock


ROOT = Path(__file__).resolve().parent
AI_DIRECTORY = (
    ROOT / "smart_exam_system" / "api" / "services" / "ai"
)

# Load the actual parser without importing the Flask application.
spec = importlib.util.spec_from_file_location(
    "parser_under_test",
    AI_DIRECTORY / "response_parser.py",
)
parser = importlib.util.module_from_spec(spec)
spec.loader.exec_module(parser)


def make_question(name, invalid=False):
    question = {
        "question_text": name,
        "option_a": "1",
        "option_b": "2",
        "option_c": "3",
        "option_d": "4",
        "correct_answer": "A",
        "explanation": "This is a local retry-flow fixture.",
        "visual_required": False,
        "visual_type": None,
    }

    if invalid:
        question["option_b"] = "1"  # Duplicate option: must fail.

    return question


def make_response(questions):
    return json.dumps({"data": questions})


def load_service(outputs):
    """
    Execute the actual service functions with mocked dependencies.
    Imports and other module-level statements are deliberately not executed.
    """
    source = (AI_DIRECTORY / "ai_service.py").read_text(
        encoding="utf-8-sig"
    )
    tree = ast.parse(source)

    tree.body = [
        node
        for node in tree.body
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    ]

    queue = list(outputs)

    def fake_generate_content(**kwargs):
        if not queue:
            raise AssertionError(
                "Unexpected extra generation call: retry limit exceeded."
            )

        return SimpleNamespace(
            text=queue.pop(0),
            prompt_feedback=None,
            candidates=[
                SimpleNamespace(finish_reason="STOP")
            ],
        )

    generate_content = Mock(side_effect=fake_generate_content)

    client = SimpleNamespace(
        models=SimpleNamespace(generate_content=generate_content),
        files=SimpleNamespace(
            upload=Mock(
                side_effect=AssertionError("Unexpected file upload")
            ),
            delete=Mock(),
        ),
    )

    # Record the requested count without loading the full prompt builder.
    prompt_builder = Mock(
        side_effect=lambda **kwargs: (
            f"QUESTION COUNT: {kwargs['question_count']}\n"
            f"SOURCE: {kwargs['content']}"
        )
    )

    class FakeServerError(Exception):
        pass

    namespace = {
        "__name__": "ai_service_under_test",
        "json": json,
        "os": os,
        "tempfile": tempfile,
        "time": SimpleNamespace(sleep=Mock()),
        "logging": logging,
        "logger": Mock(),
        "current_app": SimpleNamespace(
            config={"GEMINI_API_KEY": "unused-test-key"},
            debug=False,
            logger=Mock(),
            instance_path=str(ROOT),
        ),
        "genai": SimpleNamespace(
            Client=Mock(return_value=client)
        ),
        "types": SimpleNamespace(
            GenerateContentConfig=lambda **kwargs: kwargs
        ),
        "ServerError": FakeServerError,
        "build_question_prompt": prompt_builder,
        "parse_ai_response": parser.parse_ai_response,
        "inspect_ai_response": parser.inspect_ai_response,
    }

    exec(
        compile(tree, str(AI_DIRECTORY / "ai_service.py"), "exec"),
        namespace,
    )

    return (
        namespace["generate_from_gemini"],
        generate_content,
        prompt_builder,
    )


class PartialRetryTests(unittest.TestCase):
    def setUp(self):
        self.q1 = make_question("Question one")
        self.q2 = make_question("Question two")
        self.q3 = make_question("Question three")

    def call_service(self, service):
        return service(
            content="Generate three test questions.",
            question_count=3,
            language="english",
            difficulty="medium",
            blooms_level="mixed",
        )

    def test_all_valid_requires_one_call(self):
        expected = [self.q1, self.q2, self.q3]
        service, api, builder = load_service([
            make_response(expected),
        ])

        result = json.loads(self.call_service(service))

        self.assertEqual(result["data"], expected)
        self.assertEqual(api.call_count, 1)
        self.assertEqual(builder.call_count, 1)

    def test_only_failed_question_is_replaced(self):
        bad_q2 = make_question("Question two", invalid=True)
        replacement = make_question("Replacement for question two")

        service, api, builder = load_service([
            make_response([self.q1, bad_q2, self.q3]),
            make_response([replacement]),
        ])

        result = json.loads(self.call_service(service))

        self.assertEqual(
            result["data"],
            [self.q1, replacement, self.q3],
        )
        self.assertEqual(api.call_count, 2)
        self.assertEqual(
            [call.kwargs["question_count"] for call in builder.call_args_list],
            [3, 1],
        )

        retry_prompt = api.call_args_list[1].kwargs["contents"]
        failed_json = retry_prompt.split("FAILED SLOTS:\n", 1)[1].split(
            "\nRETAINED QUESTIONS", 1
        )[0]
        failed_slots = json.loads(failed_json)

        self.assertEqual(len(failed_slots), 1)
        self.assertEqual(
            failed_slots[0]["original_question_number"], 2
        )
        self.assertEqual(
            failed_slots[0]["previous_question"], bad_q2
        )

    def test_two_replacements_restore_original_order(self):
        replacement1 = make_question("Replacement one")
        replacement3 = make_question("Replacement three")

        service, api, builder = load_service([
            make_response([
                make_question("Question one", invalid=True),
                self.q2,
                make_question("Question three", invalid=True),
            ]),
            make_response([replacement1, replacement3]),
        ])

        result = json.loads(self.call_service(service))

        self.assertEqual(
            result["data"],
            [replacement1, self.q2, replacement3],
        )
        self.assertEqual(api.call_count, 2)
        self.assertEqual(
            builder.call_args_list[1].kwargs["question_count"], 2
        )

    def test_invalid_replacement_stops_after_two_calls(self):
        service, api, _ = load_service([
            make_response([
                self.q1,
                make_question("Question two", invalid=True),
                self.q3,
            ]),
            make_response([
                make_question("Still invalid", invalid=True),
            ]),
        ])

        with self.assertRaisesRegex(
            ValueError,
            "after one replacement attempt",
        ):
            self.call_service(service)

        self.assertEqual(api.call_count, 2)

    def test_wrong_replacement_count_is_rejected(self):
        service, api, _ = load_service([
            make_response([
                self.q1,
                make_question("Question two", invalid=True),
                self.q3,
            ]),
            # Only one replacement was requested.
            make_response([self.q1, self.q2, self.q3]),
        ])

        with self.assertRaisesRegex(
            ValueError,
            "Expected 1 questions, received 3",
        ):
            self.call_service(service)

        self.assertEqual(api.call_count, 2)

    def test_malformed_initial_response_retries_full_batch(self):
        expected = [self.q1, self.q2, self.q3]

        service, api, builder = load_service([
            '{"data": [',
            make_response(expected),
        ])

        result = json.loads(self.call_service(service))

        self.assertEqual(result["data"], expected)
        self.assertEqual(api.call_count, 2)
        self.assertEqual(
            [call.kwargs["question_count"] for call in builder.call_args_list],
            [3, 3],
        )

    def test_geometry_errors_are_inspected_per_question(self):
        # Reuse a known invalid reflection to ensure inspection
        # does not bypass the geometry validator.
        bad = copy.deepcopy(self.q2)
        bad.update({
            "visual_required": True,
            "visual_type": "geometry",
            "visual": {
                "figure": {
                    "type": "symmetry",
                    "subtype": "reflection",
                    "feature": "identify_image",
                },
                "elements": [],
                "relationships": [],
            },
        })

        result = parser.inspect_ai_response(
            make_response([self.q1, bad, self.q3]),
            expected_count=3,
        )

        self.assertTrue(result["batch_readable"])
        self.assertEqual(
            [item["valid"] for item in result["items"]],
            [True, False, True],
        )
        self.assertIn("reflection:", result["items"][1]["error"])


if __name__ == "__main__":
    logging.disable(logging.CRITICAL)
    print("Running offline tests. Gemini is mocked; no API calls.\n", flush=True)
    unittest.main(verbosity=2)