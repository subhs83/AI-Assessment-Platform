from datetime import datetime, timezone,timedelta

from sqlalchemy import inspect

from smart_exam_system.extensions import db
from smart_exam_system.api.utils.init_data import create_default_super_admin
from smart_exam_system.api.utils.init_subscription_data import (
    create_default_subscription_plans,
    create_default_ai_features,
)


def serialize_school_class(school_class):
    return {
        "id": school_class.id,
        "name": school_class.name,
        "display_order": school_class.display_order,
        "is_active": school_class.is_active,
    }

def normalize(dt):
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def apply_exam_status(exam_dict):
    """
    Adds display_status to a single exam dict
    """

    now = datetime.now(timezone.utc)

    end_date = normalize(exam_dict.get("end_date"))

    if exam_dict.get("status") == "published" and end_date and now > end_date:
        exam_dict["display_status"] = "expired"
    else:
        exam_dict["display_status"] = exam_dict.get("status")

    return exam_dict


def no_cache(response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


import re

def generate_slug(name):
    slug = name.lower().strip()

    # replace spaces with -
    slug = re.sub(r"\s+", "-", slug)

    # remove special characters
    slug = re.sub(r"[^a-z0-9\-]", "", slug)

    return slug







def initialize_default_data():

    inspector = inspect(db.engine)
    tables = set(inspector.get_table_names())

    if "users" in tables:
        create_default_super_admin()

    if "subscription_plans" in tables:
        create_default_subscription_plans()

    if "ai_features" in tables:
        create_default_ai_features()