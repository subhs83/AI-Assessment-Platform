// src/components/teacher/results/ResultRow.jsx

import { useNavigate } from "react-router-dom";

export default function ResultRow({
  result,
  index,
  routes,
  examUid,
}) {
  const navigate = useNavigate();

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3 font-semibold text-gray-500">
        {index + 1}
      </td>

      <td
        className="cursor-pointer p-3"
        onClick={() =>
          navigate(
            routes.exams.studentAttempts(
              examUid,
              result.student_id
            )
          )
        }
      >
        <div className="font-medium text-indigo-600 hover:underline">
          {result.first_name} {result.last_name}
        </div>

        <div className="mt-1 text-xs text-gray-400">
          View Attempts →
        </div>
      </td>

      <td className="p-3">
        {result.class_section || "-"}
      </td>

      <td className="p-3">
        {result.roll_number || "-"}
      </td>

      <td className="p-3 font-semibold">
        {result.score} / {result.total_marks}
      </td>

      <td className="p-3">
        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
          {(result.percentage || 0).toFixed(2)}%
        </span>
      </td>

      <td className="p-3 text-center font-semibold">
        {result.attempts_count}
      </td>

      <td className="p-3">
        {result.violation_count ? (
          <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
            {result.violation_count}
          </span>
        ) : (
          <span className="text-gray-400">
            0
          </span>
        )}
      </td>

      <td className="p-3">
        {result.auto_submitted_reason ? (
          <div>
            <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
              Auto Submitted
            </span>

            <div className="mt-1 text-xs text-gray-500">
              {result.auto_submitted_reason}
            </div>
          </div>
        ) : (
          <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
            Completed
          </span>
        )}
      </td>
    </tr>
  );
}