
import argparse
from datetime import datetime, timedelta, timezone

from smart_exam_system import app
from smart_exam_system.extensions import db
from smart_exam_system.models.attempt import AttemptModel
from smart_exam_system.models.exam import ExamModel
from smart_exam_system.api.services.student_service import auto_submit_attempt

# Use the same import path that your existing
# test_expired_attempt.py uses for auto_submit_attempt.
# Example:
# from smart_exam_system.services.attempt_service import auto_submit_attempt


def utc_now_naive():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def get_deadline(attempt):
    return attempt.start_time + timedelta(
        minutes=attempt.exam.duration_minutes
    )

def print_time_debug():
    now_utc = datetime.now(timezone.utc)
    now_ist = now_utc.astimezone(
        timezone(timedelta(hours=5, minutes=30))
    )

    print("\n--- TIME DEBUG ---")
    print(f"Current UTC Time : {now_utc}")
    print(f"Current IST Time : {now_ist}")
    print("------------------\n")

def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--attempt-id",
        type=int,
        help="Inspect a specific attempt"
    )
    parser.add_argument(
        "--submit",
        action="store_true",
        help="Finalize the specified expired attempt"
    )
    parser.add_argument(
        "--batch-submit",
        action="store_true",
        help="Finalize expired attempts in batches"
    )

    args = parser.parse_args()

    if args.submit and args.attempt_id is None:
        parser.error("--submit requires --attempt-id")

    if args.batch_submit and (
        args.submit or args.attempt_id is not None
    ):
        parser.error(
            "--batch-submit cannot be combined "
            "with --submit or --attempt-id"
        )

    with app.app_context():
        print_time_debug()
        expired_count = 0
        submitted_count = 0
        failed_count = 0
        processed_ids = set()
        batch_number = 0

        while True:
            if args.attempt_id is not None:
                if batch_number > 0:
                    break

                attempts = (
                    db.session.query(AttemptModel)
                    .filter(AttemptModel.id == args.attempt_id)
                    .all()
                )

            else:
                now = utc_now_naive()

                query = (
                    db.session.query(AttemptModel)
                    .join(
                        ExamModel,
                        AttemptModel.exam_id == ExamModel.id
                    )
                    .filter(
                        AttemptModel.is_submitted.is_(False),
                        (
                            AttemptModel.start_time
                            + ExamModel.duration_minutes
                            * db.text("INTERVAL '1 minute'")
                        ) <= now
                    )
                )

                if processed_ids:
                    query = query.filter(
                        ~AttemptModel.id.in_(processed_ids)
                    )

                attempts = (
                    query
                    .order_by(AttemptModel.start_time.asc())
                    .limit(100)
                    .all()
                )

            if not attempts:
                break

            batch_number += 1

            if args.batch_submit:
                print(f"\nProcessing batch {batch_number}")

            for attempt in attempts:
                attempt_id = attempt.id
                processed_ids.add(attempt_id)

                if attempt.is_submitted:
                    print(
                        f"Attempt {attempt_id}: already submitted"
                    )
                    continue

                deadline = get_deadline(attempt)
                print(f"Attempt ID       : {attempt.id}")
                print(f"Quiz Start (UTC) : {attempt.start_time}")
                print(f"Quiz Deadline    : {deadline}")
                print(f"Current UTC      : {utc_now_naive()}")

                if utc_now_naive() < deadline:
                    print(
                        f"Attempt {attempt_id}: not expired"
                    )
                    continue

                expired_count += 1

                print(
                    f"Expired attempt: {attempt_id}, "
                    f"Deadline: {deadline}"
                )

                if not (args.submit or args.batch_submit):
                    continue

                try:
                    locked_attempt = (
                        db.session.query(AttemptModel)
                        .filter(AttemptModel.id == attempt_id)
                        .populate_existing()
                        .with_for_update(of=AttemptModel)
                        .one()
                    )

                    if locked_attempt.is_submitted:
                        db.session.rollback()
                        print(
                            f"Attempt {attempt_id}: "
                            "already submitted by another request"
                        )
                        continue

                    if utc_now_naive() < get_deadline(
                        locked_attempt
                    ):
                        db.session.rollback()
                        print(
                            f"Attempt {attempt_id}: "
                            "no longer expired"
                        )
                        continue

                    auto_submit_attempt(
                        locked_attempt,
                        "time_expired"
                    )

                    submitted_count += 1

                    print(
                        f"SUBMITTED attempt {attempt_id}"
                    )

                except Exception as exc:
                    db.session.rollback()

                    failed_count += 1

                    print(
                        f"FAILED attempt {attempt_id}: "
                        f"{type(exc).__name__}: {exc}"
                    )

                    if not args.batch_submit:
                        raise

            # Dry-run and targeted modes execute only once.
            if not args.batch_submit:
                break

        print("\n--- Processing Summary ---")
        print(f"Expired attempts found: {expired_count}")
        print(f"Attempts submitted: {submitted_count}")
        print(f"Batch failures: {failed_count}")

        if not args.submit and not args.batch_submit:
            print("DRY RUN — No attempts were submitted.")

        if failed_count:
            raise SystemExit(1)



if __name__ == "__main__":
    main()
