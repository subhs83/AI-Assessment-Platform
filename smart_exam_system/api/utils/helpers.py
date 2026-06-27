from datetime import datetime, timezone

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


