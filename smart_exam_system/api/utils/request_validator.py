def validate_required_fields(data, required_fields):
    """
    Validate required JSON fields.

    Args:
        data (dict): Request JSON.
        required_fields (list): Required field names.

    Raises:
        ValueError: If any required field is missing.
    """

    missing_fields = [
        field
        for field in required_fields
        if field not in data
    ]

    if missing_fields:
        raise ValueError(
            "Missing required fields: "
            + ", ".join(missing_fields)
        )