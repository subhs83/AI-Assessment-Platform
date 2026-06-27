import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/client";
import SkeletonCard from "../../components/ui/SkeletonCard";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import BackButton from "../../components/ui/BackButton";


export default function AttemptDetailPage() {
  const { schoolSlug, attemptId } = useParams();


  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
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
  };

  useEffect(() => {
    fetchReport();
  }, [attemptId]);
 console.log("data :",data)
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

  return (
  <div className="space-y-6">

    <PageHeader
      title="Attempt Analysis"
      description={`Review responses for ${report.student_name}`}
      actions={
        <BackButton to={-1} label="Go Back" />
      }
    />

    {/* Summary */}
    <div className="grid gap-4 md:grid-cols-6">

      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <p className="text-sm text-gray-500">
          Score
        </p>

        <h2 className="text-2xl font-bold mt-2">
          {report.score}/{report.total_marks}
        </h2>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <p className="text-sm text-gray-500">
          Percentage
        </p>

        <h2 className="text-2xl font-bold mt-2 text-indigo-600">
          {report.percentage?.toFixed(2)}%
        </h2>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <p className="text-sm text-gray-500">
          Questions
        </p>

        <h2 className="text-2xl font-bold mt-2">
          {report.total_questions}
        </h2>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <p className="text-sm text-gray-500">
          Correct
        </p>

        <h2 className="text-2xl font-bold mt-2 text-green-600">
          {correctCount}
        </h2>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <p className="text-sm text-gray-500">
          Wrong
        </p>

        <h2 className="text-2xl font-bold mt-2 text-red-600">
          {wrongCount}
        </h2>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <p className="text-sm text-gray-500">
          Skipped
        </p>

        <h2 className="text-2xl font-bold mt-2 text-yellow-600">
          {notAttemptedCount}
        </h2>
      </div>

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

          <div className="flex items-start justify-between gap-4 mb-4">

            <h3 className="font-medium text-lg">
              Q{index + 1}. {q.question_text}
            </h3>

            {q.remark === "Correct" ? (
              <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                Correct
              </span>
            ) : q.remark === "Not Attempted" ? (
              <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                Skipped
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">
                Wrong
              </span>
            )}

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