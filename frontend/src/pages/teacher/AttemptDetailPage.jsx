import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/client";
import SkeletonCard from "../../components/ui/SkeletonCard";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import BackButton from "../../components/ui/BackButton";
import MobileStatsGrid from "../../components/ui/mobile/MobileStatsGrid";


export default function AttemptDetailPage() {
  const { schoolSlug, attemptId } = useParams();


  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
  try {
    setLoading(true);

    const res = await API.get(
      `/api/teacher/${schoolSlug}/attempts/${attemptId}`
    );

    setData(res.data.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [schoolSlug, attemptId]);

  useEffect(() => {
  fetchReport();
}, [fetchReport]);


  const report = data?.report;

  const correctCount =
  report?.questions?.filter(
    (q) => q.remark === "Correct"
  ).length || 0;

const notAttemptedCount =
  report?.questions?.filter(
    (q) => q.remark === "Not Attempted"
  ).length || 0;

const wrongCount =
  (report?.total_questions || 0) -
  correctCount -
  notAttemptedCount;

  

  if (loading) return <SkeletonCard />;

  if (!report) {
    return (
      <EmptyState
        title="Report not found"
        description="Attempt data is missing"
      />
    );
  }

  const stats = [
    {
      label: "Score",
      value: `${report.score}/${report.total_marks}`,
    },
    {
      label: "Percentage",
      value: `${report.percentage?.toFixed(2)}%`,
      valueClassName: "text-indigo-600",
    },
    {
      label: "Questions",
      value: report.total_questions,
    },
    {
      label: "Correct",
      value: correctCount,
      valueClassName: "text-green-600",
    },
    {
      label: "Wrong",
      value: wrongCount,
      valueClassName: "text-red-600",
    },
    {
      label: "Skipped",
      value: notAttemptedCount,
      valueClassName: "text-yellow-600",
    },
  ];

  return (
  <div className="space-y-6">

    <PageHeader
      title="Attempt Analysis"
      description={`Review responses for ${report.student_name}`}
      actions={
        <BackButton to={-1} label="Back" />
      }
    />

    {/* Desktop Summary */}

    <div className="hidden md:grid gap-4 md:grid-cols-6">

      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <p className="text-sm text-gray-500">
          Score
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          {report.score}/{report.total_marks}
        </h2>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <p className="text-sm text-gray-500">
          Percentage
        </p>

        <h2 className="mt-2 text-2xl font-bold text-indigo-600">
          {report.percentage?.toFixed(2)}%
        </h2>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <p className="text-sm text-gray-500">
          Questions
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          {report.total_questions}
        </h2>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <p className="text-sm text-gray-500">
          Correct
        </p>

        <h2 className="mt-2 text-2xl font-bold text-green-600">
          {correctCount}
        </h2>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <p className="text-sm text-gray-500">
          Wrong
        </p>

        <h2 className="mt-2 text-2xl font-bold text-red-600">
          {wrongCount}
        </h2>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <p className="text-sm text-gray-500">
          Skipped
        </p>

        <h2 className="mt-2 text-2xl font-bold text-yellow-600">
          {notAttemptedCount}
        </h2>
      </div>

    </div>

    {/* Mobile Summary */}

    <div className="md:hidden">
      <MobileStatsGrid items={stats} />
    </div>

    {/* Questions */}
    <div className="space-y-4">

      {report.questions.map((q, index) => (

        <div
          key={index}
          className={`bg-white border rounded-xl shadow-sm p-5 ${
            q.remark === "Correct"
              ? "border-green-200"
              : q.remark === "Not Attempted"
              ? "border-yellow-200"
              : "border-red-200"
          }`}
        >

          <div className="mb-4">

          <div className="flex items-center justify-between gap-3">

            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Question {index + 1}
            </h3>

            {q.remark === "Correct" ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Correct
              </span>
            ) : q.remark === "Not Attempted" ? (
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                Skipped
              </span>
            ) : (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                Wrong
              </span>
            )}

          </div>

          <h4 className="mt-3 text-base font-medium leading-7 text-slate-900">
            {q.question_text}
          </h4>

        </div>

          <div className="space-y-2">

            {Object.entries(q.options || {}).map(([key, val]) => {

              const isSelected =
                key === q.selected_option;

              const isCorrect =
                val === q.correct_text;

              return (
                <div
                  key={key}
                  className={`
                    p-3 rounded-lg border text-sm
                    ${
                      isCorrect
                        ? "bg-green-50 border-green-300"
                        : ""
                    }
                    ${
                      isSelected &&
                      !isCorrect
                        ? "bg-red-50 border-red-300"
                        : ""
                    }
                  `}
                >

                  <div className="flex items-center justify-between">

                    <span>
                      {key}. {val}
                    </span>

                    <div className="flex gap-2">

                      {isSelected && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                          Selected
                        </span>
                      )}

                      {isCorrect && (
                        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                          Correct
                        </span>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>
      ))}

    </div>

  </div>
);
}