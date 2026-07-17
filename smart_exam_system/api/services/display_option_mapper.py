def build_display_options(raw_options, order):
    """
    Converts original options into display options.

    Example
    -------
    order = ["D", "A", "C", "B"]

    Returns

    {
        "A": raw_options["D"],
        "B": raw_options["A"],
        "C": raw_options["C"],
        "D": raw_options["B"],
    }
    """

    display_letters = ["A", "B", "C", "D"]

    return {
        display: raw_options[original]
        for display, original in zip(display_letters, order)
    }


def display_to_original(display_option, order):
    """
    Student clicked Display A/B/C/D.

    Example
    -------
    order = ["D","A","C","B"]

    Display A -> Original D
    Display B -> Original A
    """

    mapping = {
        "A": order[0],
        "B": order[1],
        "C": order[2],
        "D": order[3],
    }

    return mapping.get(display_option)


def original_to_display(original_option, order):
    """
    Converts database value back to display value.

    Example
    -------
    order = ["D","A","C","B"]

    Original D -> Display A
    Original A -> Display B
    """

    reverse = {
        original: display
        for display, original in zip(
            ["A", "B", "C", "D"],
            order,
        )
    }

    return reverse.get(original_option)