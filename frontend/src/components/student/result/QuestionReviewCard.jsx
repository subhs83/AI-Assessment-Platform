import { useEffect, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
} from "lucide-react";


const QuestionReviewCard = ({
  q,
  index,
  openIndex,
  setOpenIndex,
  reviewMode,
}) => {

  const showCorrectAnswer =
  reviewMode === "full_review";

  const showExplanation =
   showCorrectAnswer &&
    q.explanation?.trim();

  const cardRef = useRef(null);
  const isOpen = openIndex === index;


useEffect(() => {
  if (isOpen) {
    cardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }
}, [isOpen]);

  // ✅ Add here

  return (
    <div 
    ref={cardRef}
    className="bg-white border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* HEADER */}
      <div
        onClick={() => {
            setOpenIndex(isOpen ? null : index);
          }}
        className="flex justify-between items-center p-5 cursor-pointer hover:bg-slate-50 transition"
      >

        <div className="flex items-center gap-3">

          {/* Question badge */}
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-700">
            {index + 1}
          </div>

          <div className="flex-1 flex items-center justify-between gap-3">

            <h3 className="font-semibold text-slate-900">
              Question {index + 1}
            </h3>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                q.remark === "Correct"
                  ? "bg-green-100 text-green-700"
                  : q.remark === "Incorrect"
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {/* Icon */}
              {q.remark === "Correct" && (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}

              {q.remark === "Incorrect" && (
                <XCircle className="w-3.5 h-3.5" />
              )}

              {q.remark === "Not Attempted" && (
                <MinusCircle className="w-3.5 h-3.5" />
              )}

              {q.remark}
            </span>

          </div>

        </div>

        <span className="text-xl text-slate-400">
          {isOpen ? "−" : "+"}
        </span>

      </div>

      {/* BODY */}
      {isOpen && (
        <div className="px-5 pb-5 animate-fade-in">

          {/* Question */}
          <p className="text-slate-800 font-medium">
            {q.question_text}
          </p>

          {/* Options */}
          <div className="mt-4 space-y-2">

            {Object.entries(q.options).map(([key, value]) => {

              const isSelected = q.selected_option === key;

              const isCorrectOption =
                q.correct_option === key;

              const isCorrectSelection =
                q.is_correct && isSelected;

              const isWrongSelection =
                !q.is_correct && isSelected;

              return (
                <div
                  key={key}
                  className={`
                    p-3 rounded-xl border transition-all
                    ${
                     showCorrectAnswer
                        ? isCorrectOption
                          ? "bg-green-50 border-green-400"
                          : isWrongSelection
                          ? "bg-red-50 border-red-400"
                          : "bg-slate-50 border-slate-200"
                        : isCorrectSelection
                        ? "bg-green-50 border-green-400"
                        : isWrongSelection
                        ? "bg-red-50 border-red-400"
                        : "bg-slate-50 border-slate-200"
                    }
                  `}
                >

                  <div className="flex items-start gap-3">

                    {/* OPTION KEY */}
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white border text-sm font-semibold text-slate-700 flex-shrink-0">
                      {key}
                    </span>

                    {/* OPTION TEXT */}
                    <div className="flex-1 text-slate-700 leading-relaxed">
                      {value}
                    </div>

                    {/* RIGHT LABELS */}
                    <div className="flex flex-col items-end gap-1">

                      {showCorrectAnswer && isCorrectOption && (
                        <span className="text-green-600 text-xs font-semibold whitespace-nowrap">
                          Correct Answer
                        </span>
                      )}
                      {isWrongSelection && (
                        <span className="text-red-600 text-xs font-semibold whitespace-nowrap">
                          Your Answer
                        </span>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

          {/* Selected summary */}
          <div className="mt-4 text-sm text-slate-600">
            Selected:
            <span className="font-semibold text-slate-900">
              {" "}
              {q.selected_option
                ? q.selected_text
                : "Not Attempted"}
            </span>
          </div>

          {showExplanation && (
            <div className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <h4 className="mb-2 font-semibold text-indigo-700">
                Answer Explanation
              </h4>

              <p className="text-sm leading-6 text-slate-700">
                {q.explanation}
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default QuestionReviewCard;