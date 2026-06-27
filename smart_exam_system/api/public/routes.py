from flask import request, jsonify

from smart_exam_system.extensions import db
from smart_exam_system.api.public import api_public_bp

from smart_exam_system.models import ContactMessage,DemoRequest


@api_public_bp.route("/api/contact", methods=["POST"])
def submit_contact_message():

    data = request.get_json()

    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    if not name:
        return jsonify({
            "success": False,
            "message": "Name is required"
        }), 400

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required"
        }), 400

    if not message:
        return jsonify({
            "success": False,
            "message": "Message is required"
        }), 400

    contact = ContactMessage(
        name=name,
        phone=phone,
        email=email,
        message=message
    )

    db.session.add(contact)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Message sent successfully"
    })



@api_public_bp.route("/api/demo", methods=["POST"])
def submit_demo_request():

    data = request.get_json()

    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    email = (data.get("email") or "").strip()
    school_name = (data.get("school_name") or "").strip()
    size = (data.get("size") or "").strip()

    if not name:
        return jsonify({
            "success": False,
            "message": "Name is required"
        }), 400

    if not phone:
        return jsonify({
            "success": False,
            "message": "Phone is required"
        }), 400

    if not school_name:
        return jsonify({
            "success": False,
            "message": "School name is required"
        }), 400

    demo = DemoRequest(
        name=name,
        phone=phone,
        email=email,
        school_name=school_name,
        size=size,
        status="new"
    )

    db.session.add(demo)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Demo request submitted successfully"
    })