export default function AIPrintLayout({
  questions = [],
  showAnswers = false,
}) {
  return (
    <div
      id="ai-print-layout"
      className="mx-auto max-w-4xl bg-white p-8 text-black"
    >
      {/* Header */}

      <h1 className="mb-8 text-center text-2xl font-bold">
        Question Paper
      </h1>

      {/* Student Information */}

      <div className="mb-10 grid grid-cols-2 gap-x-12 gap-y-4 text-sm">

        <div>
          <span className="font-semibold">
            Name :
          </span>{" "}
          ________________________________
        </div>

        <div>
          <span className="font-semibold">
            Roll No :
          </span>{" "}
          ______________________
        </div>

        <div>
          <span className="font-semibold">
            Class :
          </span>{" "}
          _______________________________
        </div>

        <div>
          <span className="font-semibold">
            Section :
          </span>{" "}
          ____________________
        </div>

      </div>

      {/* Questions */}

      <div className="space-y-8">

        {questions.map((question, index) => (

          <div
            key={index}
            className="break-inside-avoid border-b border-gray-300 pb-6"
          >

            {/* Question */}

            <h2 className="mb-4 text-base font-semibold leading-relaxed">

              Q{index + 1}. {question.question_text}

            </h2>

            {/* Options */}

            <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">

              <div className="break-words">
                <span className="font-semibold">
                  A.
                </span>{" "}
                {question.option_a}
              </div>

              <div className="break-words">
                <span className="font-semibold">
                  B.
                </span>{" "}
                {question.option_b}
              </div>

              <div className="break-words">
                <span className="font-semibold">
                  C.
                </span>{" "}
                {question.option_c}
              </div>

              <div className="break-words">
                <span className="font-semibold">
                  D.
                </span>{" "}
                {question.option_d}
              </div>

            </div>

            {/* Answer */}

            {showAnswers && (

              <div className="mt-4 text-sm font-semibold">

                Correct Answer : {question.correct_answer}

              </div>

            )}

          </div>

        ))}

      </div>

    </div>
  );
}