import sys

from smart_exam_system import app
from smart_exam_system.extensions import db
from smart_exam_system.models.attempt import AttemptModel
from smart_exam_system.api.services.student_service import (
    is_attempt_expired,
    auto_submit_attempt,
)


def main(attempt_id):
    with app.app_context():
        attempt = db.session.get(AttemptModel, attempt_id)

        if not attempt:
            print("Attempt not found")
            return

        print("Attempt ID:", attempt.id)
        print("Submitted:", attempt.is_submitted)
        print("Expired:", is_attempt_expired(attempt))

        if attempt.is_submitted:
            print("Already submitted. No changes made.")
            print("Score:", attempt.score)
            print("Total marks:", attempt.total_marks)
            print("Percentage:", attempt.percentage)
            print("Reason:", attempt.auto_submitted_reason)
            print("End time:", attempt.end_time)
            return

        if not is_attempt_expired(attempt):
            print("Quiz is still active. No changes made.")
            return

        confirmation = input(
            f"Type SUBMIT-{attempt.id} to finalize: "
        )

        if confirmation != f"SUBMIT-{attempt.id}":
            print("Cancelled. No changes made.")
            return

        auto_submit_attempt(attempt, "time_expired")

        print("Finalized successfully.")
        print("Score:", attempt.score)
        print("Total marks:", attempt.total_marks)
        print("Percentage:", attempt.percentage)
        print("Submitted:", attempt.is_submitted)
        print("Reason:", attempt.auto_submitted_reason)
        print("End time:", attempt.end_time)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_expired_attempt.py ATTEMPT_ID")
        sys.exit(1)

    main(int(sys.argv[1]))