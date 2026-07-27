import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import API from "../../api/client";
import { teacherRoutes } from "../../routes/teacherRoutes";

import BackButton from "../../components/ui/BackButton";
import PageHeader from "../../components/ui/PageHeader";
import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";

export default function ReviewQuestionsPage() {
  const { schoolSlug, examUid } = useParams();

  const routes = teacherRoutes(schoolSlug);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get(
        `/api/teacher/${schoolSlug}/exams/${examUid}/questions`
      );

      setQuestions(res.data.data?.questions || []);
    } catch {
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [schoolSlug, examUid]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchQuestions}
      />
    );
  }

  if (!questions.length) {
    return (
      <EmptyState
        title="No questions found"
        description="Upload questions first to review them."
      />
    );
  }

  return (
    <div className="space-y-6">

      <PageHeader
        title="Review Questions"
        description="Validate uploaded questions before publishing"
        actions={
          <BackButton
            to={routes.exams.list}
            label="Back to Exams"
          />
        }
      />

      <div className="space-y-5">

        {questions.map((q, index) => {
          const options = [
            { key: "A", value: q.option_a },
            { key: "B", value: q.option_b },
            { key: "C", value: q.option_c },
            { key: "D", value: q.option_d },
          ];

          return (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              {/* Question */}

              <div className="flex items-start gap-3">

                <div className="rounded-lg bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                  Q{index + 1}
                </div>

                <p className="flex-1 text-base font-medium leading-7 text-slate-800">
                  {q.question_text}
                </p>

              </div>

              {/* Options */}

              <div className="mt-5 space-y-3">

                {options.map((option) => {
                  const isCorrect =
                    option.key === q.correct_option;

                  return (
                    <div
                      key={option.key}
                      className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                        isCorrect
                          ? "border-green-300 bg-green-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                          isCorrect
                            ? "bg-green-600 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {option.key}
                      </div>

                      <p className="flex-1 text-sm leading-6 text-slate-700">
                        {option.value}
                      </p>

                      {isCorrect && (
                        <CheckCircle2
                          size={20}
                          className="shrink-0 text-green-600"
                        />
                      )}
                    </div>
                  );
                })}

              </div>

              {/* Footer */}

              <div className="mt-5 flex items-center justify-between border-t pt-4">

                <span className="text-sm text-slate-500">
                  Correct Answer
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  Option {q.correct_option}
                </span>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}