import { Link } from "react-router-dom";
import { useState} from "react"
import ExamStats from "./ExamStats";
import { useExamActions } from "../../../hooks/useExamActions";
import { teacherRoutes } from "../../../routes/teacherRoutes";
import { useToast } from "../../ui/Toast"
import ConfirmModal from "../../ui/ConfirmModal";

import {
  Play,
  Link as LinkIcon,
  FileText,
  BarChart3,
  Trophy,
  Trash2,
} from "lucide-react";

export default function ExamCard({
  exam,
  schoolSlug,
  refresh,
}) {
  const { publishExam, deleteExam } = useExamActions();
  const [examToDelete, setExamToDelete] =  useState(null);
  const routes = teacherRoutes(schoolSlug);
  const { showToast } = useToast();

  const statusClass = exam.is_expired
    ? "bg-red-100 text-red-700"
    : exam.is_published
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";

  const statusText = exam.is_expired
    ? "Expired"
    : exam.is_published
    ? "Published"
    : "Draft";

  return (
    <>
    <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4 hover:shadow-md transition">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {exam.title}
          </h3>

          {exam.quiz_code && (
            <p className="text-sm text-gray-500 mt-1">
              Quiz Code:{" "}
              <span className="font-mono text-gray-700">
                {exam.quiz_code}
              </span>
            </p>
          )}
        </div>

        <span className={`px-3 py-1 text-xs rounded-full ${statusClass}`}>
          {statusText}
        </span>
      </div>

      {/* ================= STATS ================= */}
      <ExamStats exam={exam} />

      {/* ================= ACTIONS (COMPACT SMART ROW) ================= */}
      <div className="flex flex-wrap gap-2 pt-3">

        {!exam.is_published && !exam.is_expired && (
          <button
            onClick={() => publishExam(schoolSlug, exam.id, refresh)}
            className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center gap-1"
          >
            <Play size={14} />
            Publish
          </button>
        )}

        {exam.quiz_code && !exam.is_expired && (
          <button
            onClick={async () => {
              try {
                const link = `${window.location.protocol}//${window.location.host}/school/${schoolSlug}/quiz/${exam.quiz_code}`;

                await navigator.clipboard.writeText(link);

                showToast("Quiz link copied", "success");
              } catch (err) {
                showToast("Failed to copy link", "error");
              }
            }}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
          >
             <LinkIcon size={14} />
            Copy Link
          </button>
        )}


        {exam.total_questions > 0 && !exam.is_expired && (
          <Link
            to={routes.exams.questions(exam.id)}
            className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 flex items-center gap-1"
          >
            <FileText size={14} />
            Review
          </Link>
        )}

        {exam.is_published && exam.total_attempts > 0 && (
          <Link
            to={routes.exams.results(exam.id)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
          >
            <BarChart3 size={14} />
            Results
          </Link>
        )}

        {exam.is_published && exam.total_attempts > 0 && (
          <Link
            to={routes.exams.leaderboard(exam.id)}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
          >
            <Trophy size={14} />
            Leaderboard
          </Link>
        )}

        {((exam.total_attempts === 0 && !exam.is_expired) || (exam.total_questions === 0)) && (
          <button
            onClick={() => setExamToDelete(exam.id)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}

      </div>
    </div>
    <ConfirmModal
      open={!!examToDelete}
      title="Delete Exam"
      description="
        This exam will be permanently removed.
        This action cannot be undone.
      "
      confirmText="Delete Exam"
      variant="danger"
      onClose={() => setExamToDelete(null)}
      onConfirm={async () => {

        await deleteExam(
          schoolSlug,
          examToDelete,
          refresh
        );

        setExamToDelete(null);

      }}
    />
  </>
  );
}