import { useEffect } from "react";
import { useNavigate,useParams,Link } from "react-router-dom";
import { useTeacherStore } from "../../store/teacherStore";

import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import { FileText, Users, HelpCircle, BarChart3, Share2, PlusCircle } from "lucide-react";
import { teacherRoutes } from "../../routes/teacherRoutes"
import { shareLink } from "../../utils/share";
import { useToast } from "../../components/ui/Toast"
import Button from "../../components/ui/Button";


export default function DashboardPage() {
  const { schoolSlug } = useParams();
  const { showToast } = useToast();
  const routes = teacherRoutes(schoolSlug);
  const navigate = useNavigate();

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


  const handleShareQuiz = (exam) =>
  shareLink({
    title: exam.title,
    text: "Join this quiz using the link below:",
    url: `${window.location.origin}/school/${schoolSlug}/quiz/${exam.quiz_code}`,
    showToast,
    successMessage: "Quiz link copied",
  });

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
      actions={
          <Button
            variant="primary"
            onClick={() => navigate(routes.exams.create)}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Create Exam
          </Button>
        }
    />

    {/* ================= STATS ================= */}
    <div className="grid gap-5 md:grid-cols-3">

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-3xl font-bold text-indigo-700">
            {stats.total_exams}
          </p>

          <p className="mt-1 font-medium text-slate-700">
            Total Exams
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Live Data
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
          <FileText className="h-6 w-6 text-indigo-600" />
        </div>

      </div>

    </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-3xl font-bold text-green-700">
            {stats.total_attempts}
          </p>

          <p className="mt-1 font-medium text-slate-700">
            Total Attempts
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Live Data
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
          <Users className="h-6 w-6 text-green-600" />
        </div>

      </div>

    </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-3xl font-bold text-purple-700">
            {stats.total_questions}
          </p>

          <p className="mt-1 font-medium text-slate-700">
            Total Questions
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Live Data
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
          <HelpCircle className="h-6 w-6 text-purple-600" />
        </div>

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
        className="
          group
          rounded-2xl
          border border-slate-200
          bg-gradient-to-br from-white to-slate-50/80
          p-5
          shadow-sm
          transition-all
          duration-200
          hover:shadow-md
          hover:-translate-y-0.5
          hover:border-indigo-200
        "
      >

        {/* Accent Strip
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 mb-5" /> */}

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">

      <div>
        <h3 className="font-semibold text-lg">
          {exam.title}
        </h3>

        <span
          className={`
            inline-flex mt-2 px-3 py-1.5 rounded-full text-xs rounded-full
            ${
              exam.display_status === "published"
                ? "bg-green-100 text-green-900"
                : exam.display_status === "expired"
                ? "bg-red-100 text-red-900"
                : "bg-gray-100 text-gray-900"
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
    <div className="grid grid-cols-3 gap-3 mt-5">

    <div className="rounded-xl border bg-slate-50 p-3">
      <p className="text-xs text-slate-500">Questions</p>
      <p className="mt-1 text-lg font-bold">{exam.total_questions}</p>
    </div>

    <div className="rounded-xl border bg-slate-50 p-3">
      <p className="text-xs text-slate-500">Attempts</p>
      <p className="mt-1 text-lg font-bold">{exam.total_attempts}</p>
    </div>

    <div className="rounded-xl border bg-slate-50 p-3">
      <p className="text-xs text-slate-500">Duration</p>
      <p className="mt-1 text-lg font-bold">{exam.duration_minutes} min</p>
    </div>

  </div>

    {/* ACTION */}
    <div className="mt-4 flex justify-end">

      {exam.is_published && exam.total_attempts > 0 ? (
        <Link
          to={routes.exams.results(exam.id)}
          className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition"
        >
          <BarChart3 size={16} />
          View Results
        </Link>
      ) : (
        exam.quiz_code &&
        exam.is_published &&
        !exam.is_expired && (
          <button
            onClick={() => handleShareQuiz(exam)}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition"
          >
            <Share2 size={16} />
            Share Quiz
          </button>
        )
      )}

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