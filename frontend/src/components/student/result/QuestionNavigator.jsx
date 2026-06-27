export default function QuestionNavigator({
  questions,
  questionRefs,
  setOpenIndex,
  openIndex,
}) {
  const jumpToQuestion = (q, index) => {
    setOpenIndex(index);

    requestAnimationFrame(() => {
      questionRefs.current[q.question_id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const correctCount = questions.filter(
    (q) => q.remark === "Correct"
  ).length;

  const incorrectCount = questions.filter(
    (q) => q.remark === "Incorrect"
  ).length;

  const notAttemptedCount = questions.filter(
    (q) => q.remark === "Not Attempted"
  ).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">
            Question Navigator
          </h3>

          <p className="text-sm text-slate-500">
            {questions.length} Questions
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-medium">
          <span className="flex items-center gap-1 text-green-700">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            {correctCount} Correct
          </span>

          <span className="flex items-center gap-1 text-red-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            {incorrectCount} Incorrect
          </span>

          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            {notAttemptedCount} Not Attempted
          </span>
        </div>
      </div>

      {/* Question Buttons */}
      <div className="flex flex-wrap gap-2">
        {questions.map((q, index) => {
          const color =
            q.remark === "Correct"
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : q.remark === "Incorrect"
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200";

          const active =
            openIndex === index
              ? "ring-2 ring-blue-500 scale-105 shadow-md"
              : "hover:scale-105 hover:-translate-y-0.5 hover:shadow-md";

          return (
            <button
              key={q.question_id}
              title={`Question ${index + 1}`}
              onClick={() => jumpToQuestion(q, index)}
              className={`
                w-10 h-10 rounded-lg font-medium
                transition-all duration-200
                ${color}
                ${active}
              `}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}