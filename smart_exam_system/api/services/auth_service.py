from flask import url_for, flash
from smart_exam_system.models.user import UserModel
from smart_exam_system.api.utils.security import verify_password,hash_password
from smart_exam_system.models.login_log import LoginLogModel
from smart_exam_system.extensions import db
from datetime import datetime, timezone,timedelta



def get_dashboard_path(user):

    school_slug = ( user.school.slug if user.school else None )

    if user.role == "teacher":
        return f"/school/{school_slug}/teacher"

    elif user.role == "school_admin":
        return f"/school/{school_slug}/admin"

    elif user.role == "super_admin":
        return "/super-admin"

    return "/login"

def log_login_attempt(email, user, success, request):

    log = LoginLogModel(
        user_id=user.id if user else None,
        email=email,
        success=success,
        ip_address=request.remote_addr,
        user_agent=request.headers.get("User-Agent")
    )

    db.session.add(log)
    db.session.commit()



def change_user_password(user, new_password):

    user.password = hash_password(new_password)
    user.force_password_change = False

    db.session.commit()

    return True



def authenticate_user(email, password):

    user = UserModel.query.filter_by(email=email).first()

    if not user:
   
        return None

    result = verify_password(password, user.password)


    if not result:
        return None

    return user



def get_dashboard_redirect(role):

    if role == "super_admin":
        return url_for("super_admin.dashboard")

    elif role == "school_admin":
        return url_for("school_admin.dashboard")

    elif role == "teacher":
        return url_for("teacher.dashboard")

    return url_for("auth.login")



def validate_login_access(user, expected_role=None):

    if not user:
        return "Invalid credentials"

    # inactive user
    if not user.is_active:
        return "Account is inactive. Contact Super Admin."

    # role check
    if expected_role and user.role != expected_role:
        return "This account is not authorized for the selected role. Please use the correct login option."

    # school inactive
    if user.school and not user.school.is_active:
        return "School is inactive. Contact Super Admin."

    # expiry check
    if user.school and user.school.expiry_date:
        if user.school.expiry_date < datetime.utcnow():
            user.school.is_active = False
            return "Your school access has expired. Contact Super Admin."

    return None

# -------------------------------------------
# Login Rate Limiting (Brute Force Protection)
# -------------------------------


login_attempt_cache = {}  # { "email_or_ip": [timestamps] }


def is_rate_limited(key, limit=5, window_seconds=60):
    now = datetime.utcnow()

    attempts = login_attempt_cache.get(key, [])

    # keep only recent attempts
    attempts = [t for t in attempts if now - t < timedelta(seconds=window_seconds)]

    attempts.append(now)
    login_attempt_cache[key] = attempts

    return len(attempts) > limit