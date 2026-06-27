import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTeacherStore } from "../../store/teacherStore";

import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import { FileText, Users, HelpCircle, Clock } from "lucide-react";

export default function DashboardPage() {
  const { schoolSlug } = useParams();

  const {
    dashboard,
    loading,
    error,
    fetchDashboard,
  } = useTeacherStore();

  useEffect(() => {
    if (!dashboard) {
      fetchDashboard(schoolSlug);
    }
  }, [schoolSlug, dashboard, fetchDashboard]);

  const exams = dashboard?.exams ?? [];

  const stats = dashboard?.stats ?? {
    total_exams: 0,
    total_attempts: 0,
    total_questions: 0,
  };

  const teacher = dashboard?.teacher ?? {};

  const recentExams = exams.slice(0, 5);

  // Loading
  if (loading && !dashboard) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
      </div>
    );
  }

  // Error
  if (error && !dashboard) {
    return (
      <ErrorState
        message={error}
        onRetry={() => fetchDashboard(schoolSlug)}
      />
    );
  }

  return (
  <div className="space-y-6">

    {/* ================= HEADER ================= */}
    <PageHeader
      title="Teacher Dashboard"
      description={`Welcome back, ${teacher.name}`}
    />

    {/* ================= STATS ================= */}
    <div className="grid gap-4 md:grid-cols-3">

      <div className="bg-white p-5 rounded-lg shadow-sm border flex items-start gap-3">
        <FileText className="text-indigo-600" />
        <div>
          <p className="text-sm text-gray-500">Total Exams</p>
          <h2 className="text-3xl font-bold mt-1">
            {stats.total_exams}
          </h2>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border flex items-start gap-3">
        <Users className="text-green-600" />
        <div>
          <p className="text-sm text-gray-500">Total Attempts</p>
          <h2 className="text-3xl font-bold mt-1">
            {stats.total_attempts}
          </h2>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border flex items-start gap-3">
        <HelpCircle className="text-purple-600" />
        <div>
          <p className="text-sm text-gray-500">Total Questions</p>
          <h2 className="text-3xl font-bold mt-1">
            {stats.total_questions}
          </h2>
        </div>
      </div>

    </div>

    {/* ================= RECENT EXAMS ================= */}
    <div className="bg-white rounded-lg shadow-sm border">

      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">Recent Exams</h2>
        <p className="text-sm text-gray-500 mt-1">
          Showing latest {Math.min(recentExams.length, 5)} exams
        </p>
      </div>

      <div className="p-5">

        {recentExams.length === 0 ? (
          <EmptyState
            title="No exams yet"
            description="Create your first exam to get started."
          />
        ) : (
          <div className="grid gap-4">

            {recentExams.map((exam) => (
              <div
                key={exam.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition"
              >

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">

                  <div>
                    <h3 className="font-semibold text-lg">
                      {exam.title}
                    </h3>

                    <span
                      className={`
                        inline-flex mt-2 px-2 py-1 text-xs rounded-full
                        ${
                          exam.display_status === "published"
                            ? "bg-green-100 text-green-700"
                            : exam.display_status === "expired"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {exam.display_status}
                    </span>
                  </div>

                  {exam.quiz_code && (
                    <div className="text-sm text-gray-500">
                      Quiz Code:{" "}
                      <span className="font-medium text-gray-800">
                        {exam.quiz_code}
                      </span>
                    </div>
                  )}

                </div>

                {/* META */}
                <div className="grid grid-cols-3 gap-4 mt-4 text-sm">

                  <div>
                    <p className="text-gray-500">Questions</p>
                    <p className="font-semibold">
                      {exam.total_questions}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Attempts</p>
                    <p className="font-semibold">
                      {exam.total_attempts}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-semibold">
                      <Clock className="inline w-4 h-4 mr-1 text-gray-500" />
                      {exam.duration_minutes} min
                    </p>
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>

  </div>
);
}