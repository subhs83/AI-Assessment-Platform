export default function AIQuestionCard({
  question,
  index,
  selected,
  onToggle,
}) {
  return (
    <div
      onClick={onToggle}
      className={`
        cursor-pointer rounded-xl border p-4 shadow-sm transition
        ${
          selected
            ? "bg-blue-50 ring-2 ring-blue-500"
            : "bg-white hover:bg-gray-50"
        }
      `}
    >
      <div className="flex items-start gap-3">

        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-1"
        />

        <div className="w-full">

          <div className="mb-3 flex items-start gap-2">

            <span
              className="
                whitespace-nowrap rounded-md
                bg-blue-100 px-2 py-1
                text-xs font-semibold
                text-blue-700
              "
            >
              Q{index + 1}
            </span>

            <h3 className="font-semibold">
              {question.question_text}
            </h3>

          </div>

          <div className="ml-2 space-y-1 text-sm">

            <div>
              A. {question.option_a}
            </div>

            <div>
              B. {question.option_b}
            </div>

            <div>
              C. {question.option_c}
            </div>

            <div>
              D. {question.option_d}
            </div>

          </div>

          <div className="mt-3 text-sm font-medium text-green-600">
            Correct Answer: {question.correct_answer}
          </div>

        </div>

      </div>

    </div>
  );
}