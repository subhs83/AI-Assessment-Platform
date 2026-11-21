import os
import secrets

from flask import request, jsonify

from smart_exam_system.api.internal import api_internal_bp
from smart_exam_system.api.services.cronjob_service import (
    sync_cron_job_status,
)


@api_internal_bp.route(
    "/sync-cron-job",
    methods=["POST"],
)
def sync_cron_job():
    expected_token = os.getenv("CRONJOB_SYNC_TOKEN")
    provided_token = request.headers.get("Authorization", "")

    if not expected_token:
        return jsonify({
            "success": False,
            "message": "Internal sync token is not configured.",
        }), 503

    if not secrets.compare_digest(
        provided_token,
        f"Bearer {expected_token}",
    ):
        return jsonify({
            "success": False,
            "message": "Unauthorized.",
        }), 401

    synced = sync_cron_job_status()

    if not synced:
        return jsonify({
            "success": False,
            "message": "Cron-job status synchronization failed.",
        }), 503

    return jsonify({
        "success": True,
        "message": "Cron-job status synchronized successfully.",
    }), 200