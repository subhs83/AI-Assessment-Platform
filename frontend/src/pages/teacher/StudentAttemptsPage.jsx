import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/client";
import SkeletonCard from "../../components/ui/SkeletonCard";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import { teacherRoutes } from "../../routes/teacherRoutes";
import BackButton from "../../components/ui/BackButton";

export default function StudentAttemptsPage() {
  const { schoolSlug, examId, studentDbId } = useParams();
  const routes = teacherRoutes(schoolSlug);
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const attempts = useMemo(() => {
  return data?.attempts || [];
}, [data]);

  const filteredAttempts = useMemo(() => {
    if (!attempts.length) return [];
    return attempts.filter((a) => {
      if (filter === "all") return true;
      if (filter === "best") return a.is_best;
      if (filter === "auto") return !!a.auto_submitted_reason;
      if (filter === "violation") return a.violation_count > 0;
      return true;
    });
  }, [attempts, filter]);

  const fetchAttempts = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get(
        `/api/teacher/${schoolSlug}/exams/${examId}/students/${studentDbId}/attempts`
      );

      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  },[schoolSlug, examId, studentDbId]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  if (loading) return <SkeletonCard />;
  if (!data) return <EmptyState message="No attempts found" />;

  const student = attempts?.[0]?.student;// optional if backend adds later
  console.log(" student :",student)


 return (
  <div className="space-y-6">
     
          <BackButton to={routes.exams.results(examId)} label="Go Back" />
          
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

      <PageHeader
        title="Student Attempts"
        description="View attempt history and performance analysis"
        backTo={`/school/${schoolSlug}/teacher/exams/${examId}/results`}
        backLabel="Back to Results"
      />
    </div>

    {/* Student Summary */}
    <div className="bg-white border rounded-xl shadow-sm p-5">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h2 className="text-xl font-semibold">
            {student?.name || "Student"}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Class {student?.class || "-"} • Roll No. {student?.roll || "-"}
          </p>
        </div>

        <div className="flex gap-4">

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Attempts
            </p>

            <p className="text-xl font-bold">
              {attempts.length}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Best Attempt
            </p>

            <p className="text-xl font-bold text-green-600">
              #{attempts.find(a => a.is_best)?.attempt_number || "-"}
            </p>
          </div>

        </div>

      </div>

    </div>

    {/* Filter Pills */}
    <div className="flex flex-wrap gap-2">

      {[
        { value: "all", label: "All Attempts" },
        { value: "best", label: "Best" },
        { value: "auto", label: "Auto Submitted" },
        { value: "violation", label: "Violations" },
      ].map((item) => (
        <button
          key={item.value}
          onClick={() => setFilter(item.value)}
          className={`px-4 py-2 rounded-lg text-sm border transition
          ${
            filter === item.value
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          {item.label}
        </button>
      ))}

    </div>

    {/* Empty */}
    {filteredAttempts.length === 0 ? (
      <EmptyState
        title="No attempts found"
        description="No attempt matches the selected filter."
      />
    ) : (
      <div className="grid gap-4">

        {filteredAttempts.map((a) => (

          <div
            key={a.id}
            className={`bg-white border rounded-xl shadow-sm p-5
            ${
              a.is_best
                ? "border-green-300 bg-green-50/30"
                : ""
            }`}
          >

            {/* Top */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h3 className="text-lg font-semibold">
                    Attempt #{a.attempt_number}
                  </h3>

                  {a.is_best && (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      Best Attempt
                    </span>
                  )}

                  {a.auto_submitted_reason && (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                      Auto Submitted
                    </span>
                  )}

                  {!a.auto_submitted_reason &&
                    a.violation_count > 0 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Violation
                    </span>
                  )}

                </div>

              </div>

              <button
                onClick={() => navigate(routes.attemptDetail(a.id))}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                View Analysis
              </button>

            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4 mt-5">

              <div>
                <p className="text-xs text-gray-500">
                  Score
                </p>

                <p className="font-semibold text-lg">
                  {a.score} / {a.total_marks}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Percentage
                </p>

                <p className="font-semibold text-lg text-blue-600">
                  {(a.percentage || 0).toFixed(2)}%
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Violations
                </p>

                <p className="font-semibold text-lg">
                  {a.violation_count || 0}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Status
                </p>

                <p className="font-semibold">
                  {a.auto_submitted_reason
                    ? "Auto Submitted"
                    : "Normal"}
                </p>
              </div>

            </div>

            {/* Time */}
            <div className="mt-5 pt-4 border-t text-sm text-gray-500">

              <div>
                Started: {a.start_time}
              </div>

              <div className="mt-1">
                Ended: {a.end_time}
              </div>

              {a.auto_submitted_reason && (
                <div className="mt-2 text-red-600">
                  Reason: {a.auto_submitted_reason}
                </div>
              )}

            </div>

          </div>

        ))}

      </div>
    )}

  </div>
);
}