import random


def generate_balanced_option_orders(questions):
    """
    Returns:
        {
            question_id: ["B", "D", "A", "C"],
            ...
        }
    """

    total_questions = len(questions)

    # Balanced target positions
    target_positions = []

    for option in ["A", "B", "C", "D"]:
        target_positions.extend(
            [option] * (total_questions // 4)
        )

    # Remaining questions
    remainder = total_questions % 4

    if remainder:
        target_positions.extend(
            random.sample(
                ["A", "B", "C", "D"],
                remainder,
            )
        )

    random.shuffle(target_positions)

    option_order_map = {}

    for question, target_position in zip(
        questions,
        target_positions,
    ):
        original_options = ["A", "B", "C", "D"]

        # Remove correct option
        original_options.remove(question.correct_option)

        random.shuffle(original_options)

        final_order = [None] * 4

        target_index = ["A", "B", "C", "D"].index(
            target_position
        )

        final_order[target_index] = question.correct_option

        remaining_indexes = [
            i
            for i in range(4)
            if i != target_index
        ]

        for index, option in zip(
            remaining_indexes,
            original_options,
        ):
            final_order[index] = option

        option_order_map[str(question.id)] = final_order

    return option_order_map



