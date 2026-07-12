from flask import jsonify


def api_response(
    success=True,
    message=None,
    data=None,
    meta=None,
    status=200,
):
    response = jsonify({
        "success": success,
        "message": message,
        "data": data if data is not None else {},
        "meta": meta if meta is not None else {},
    })

    response.status_code = status

    return response