# smart_exam_system/api/auth/routes.py

from flask import request, jsonify,session
from flask_login import (
    login_user,
    logout_user,
    current_user,
    login_required
)

from smart_exam_system.api.auth import api_auth_bp
from smart_exam_system.api.services.auth_service import (
    authenticate_user,
    validate_login_access,
    log_login_attempt,
    get_dashboard_path,
    change_user_password,

)
from smart_exam_system.api.utils.security import verify_password,validate_password_strength

@api_auth_bp.route("/login", methods=["POST"])
def login_api():
    logout_user()
    session.clear()
    
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    expected_role = data.get("role")
    user = authenticate_user(
        email=email,
        password=password
    )
    
    if not user:

        log_login_attempt(
            email,
            None,
            False,
            request
        )

        return jsonify({
            "success": False,
            "message": "Incorrect email or password."
        }), 401

    error = validate_login_access(
        user,
        expected_role
    )

    if error:

        log_login_attempt(
            email,
            user,
            False,
            request
        )

        return jsonify({
            "success": False,
            "message": error
        }), 403

    login_user(user)
    log_login_attempt( email, user, True, request )

    redirect_path = (
        "/change-password"
        if user.force_password_change
        else get_dashboard_path(user)
    )

    return jsonify({
        "success": True,
        "user": user.to_dict(),
        "redirect_path": redirect_path
    })



    # ----------------------------------------
    # Current User
    # ----------------------------------------
@api_auth_bp.route("/me", methods=["GET"])
@login_required
def current_user_api():

    return jsonify({
        "success": True,
        "user": current_user.to_dict()
    })

    # ----------------------------------------
    # Change Password
    # ----------------------------------------

@api_auth_bp.route("/change-password", methods=["POST"])
@login_required
def change_password_api():

    data = request.get_json()
    new_password = data.get("new_password")

    error = validate_password_strength(new_password)
    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 400

    change_user_password(current_user, new_password)

    # 🔥 IMPORTANT FIX
    logout_user()
    session.clear()

    return jsonify({
        "success": True,
        "message": "Password changed successfully. Please login again.",
        "force_logout": True
    })
# ----------------------------------------
# Logout
# ----------------------------------------
@api_auth_bp.route("/logout", methods=["POST"])
@login_required
def logout_api():

    logout_user()

    return jsonify({
        "success": True,
        "message": "Logged out successfully"
    })