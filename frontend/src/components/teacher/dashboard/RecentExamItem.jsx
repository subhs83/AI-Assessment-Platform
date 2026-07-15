import { Link } from "react-router-dom";
import {
  FileText,
  Share2,
  BarChart3,
} from "lucide-react";

export default function RecentExamItem({
  exam,
  routes,
  handleShareQuiz,
}) {
  return (
    <div
      className="
        group
        rounded-2xl
        border border-slate-200
        bg-gradient-to-br from-white to-slate-50/80
        p-5
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-indigo-200
        hover:shadow-md
      "
    >

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

        <div>

          <h3 className="text-lg font-semibold">
            {exam.title}
          </h3>

          {exam.class_section && (
            <p className="mt-1 text-sm text-blue-600">
              Class:{" "}
              <span>{exam.class_section}</span>
            </p>
          )}

          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs ${
              exam.display_status === "published"
                ? "bg-green-100 text-green-900"
                : exam.display_status === "expired"
                ? "bg-red-100 text-red-900"
                : "bg-gray-100 text-gray-900"
            }`}
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

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">

        <div className="rounded-xl border bg-slate-50 p-3">

          <p className="text-xs text-slate-500">
            Questions
          </p>

          <p className="mt-1 text-lg font-bold">
            {exam.total_questions}
          </p>

        </div>

        <div className="rounded-xl border bg-slate-50 p-3">

          <p className="text-xs text-slate-500">
            Attempts
          </p>

          <p className="mt-1 text-lg font-bold">
            {exam.total_attempts}
          </p>

        </div>

        <div className="rounded-xl border bg-slate-50 p-3">

          <p className="text-xs text-slate-500">
            Duration
          </p>

          <p className="mt-1 text-lg font-bold">
            {exam.duration_minutes} min
          </p>

        </div>

      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end">

        {exam.is_published && exam.total_attempts > 0 ? (

          <Link
            to={routes.exams.results(exam.exam_uid)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white transition hover:bg-indigo-700"
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
              className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition hover:bg-green-700"
            >

              <Share2 size={16} />

              Share Quiz

            </button>

          )

        )}

      </div>

    </div>
  );
}