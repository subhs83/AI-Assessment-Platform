
import logging
import os

import requests
from sqlalchemy import text

from smart_exam_system.extensions import db
from smart_exam_system.models.attempt import AttemptModel
from smart_exam_system.models.system_setting import SystemSettingModel


logger = logging.getLogger(__name__)

CRONJOB_API_URL = "https://api.cron-job.org"
CRONJOB_STATUS_KEY = "auto_submit_cron_enabled"

# Serializes concurrent cron status checks across Render workers.
CRONJOB_LOCK_ID = 8781663


def sync_cron_job_status():
    """
    Enable cron-job.org if any unsubmitted attempt exists.
    Disable it when no unsubmitted attempts remain.

    Stores the last successfully synchronized status in system_settings.
    """

    api_key = os.getenv("CRONJOB_API_KEY")
    job_id = os.getenv("CRONJOB_JOB_ID")

    if not api_key or not job_id:
        logger.warning(
            "Cron-job.org sync skipped: CRONJOB_API_KEY "
            "or CRONJOB_JOB_ID is missing."
        )
        return False

    if not job_id.isdigit():
        logger.error("Cron-job.org sync skipped: invalid CRONJOB_JOB_ID.")
        return False

    try:
        # Serialize checks so concurrent attempt creation/submission
        # cannot leave the cron job in an outdated state.
        db.session.execute(
            text("SELECT pg_advisory_xact_lock(:lock_id)"),
            {"lock_id": CRONJOB_LOCK_ID},
        )

        # Check ALL unsubmitted attempts, including those not yet expired.
        has_unsubmitted_attempts = (
            db.session.query(AttemptModel.id)
            .filter(AttemptModel.is_submitted.is_(False))
            .limit(1)
            .first()
            is not None
        )

        desired_status = has_unsubmitted_attempts
        desired_value = str(desired_status).lower()

        setting = (
            db.session.query(SystemSettingModel)
            .filter_by(key=CRONJOB_STATUS_KEY)
            .with_for_update()
            .first()
        )

        # Avoid unnecessary API calls when the state is already correct.
        if setting and setting.value == desired_value:
            db.session.commit()
            logger.info(
                "Cron-job.org already synchronized: enabled=%s",
                desired_status,
            )
            return True

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "job": {
                "enabled": desired_status,
            }
        }

        response = requests.patch(
            f"{CRONJOB_API_URL}/jobs/{job_id}",
            headers=headers,
            json=payload,
            timeout=10,
        )

        response.raise_for_status()

        # Save the state only after the API confirms success.
        if setting is None:
            setting = SystemSettingModel(
                key=CRONJOB_STATUS_KEY,
                value=desired_value,
            )
            db.session.add(setting)
        else:
            setting.value = desired_value

        db.session.commit()

        logger.info(
            "Cron-job.org successfully synchronized: enabled=%s",
            desired_status,
        )
        return True

    except Exception:
        db.session.rollback()
        logger.exception("Failed to synchronize cron-job.org status.")
        return False