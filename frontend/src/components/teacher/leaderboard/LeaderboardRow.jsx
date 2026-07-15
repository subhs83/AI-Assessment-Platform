import React from "react";

export default function LeaderboardRow({
  student,
  index,
}) {
  return (
    <tr
      className={`border-t hover:bg-gray-50 ${
        index === 0
          ? "bg-yellow-50"
          : index === 1
          ? "bg-gray-50"
          : index === 2
          ? "bg-orange-50"
          : ""
      }`}
    >

      <td className="p-3 font-semibold">

        {index === 0 ? (
          <span className="text-lg">
            🥇
          </span>
        ) : index === 1 ? (
          <span className="text-lg">
            🥈
          </span>
        ) : index === 2 ? (
          <span className="text-lg">
            🥉
          </span>
        ) : (
          `#${index + 1}`
        )}

      </td>

      <td className="p-3 font-medium">
        {student.first_name} {student.last_name}
      </td>

      <td className="p-3">
        {student.class_section || "-"}
      </td>

      <td className="p-3">
        {student.roll_number || "-"}
      </td>

      <td className="p-3">
        {student.attempts_count || "-"}
      </td>

      <td className="p-3 font-semibold text-green-600">
        {student.score} / {student.total_marks}
      </td>

      <td className="p-3 font-semibold">
        {(student.percentage || 0).toFixed(2)}%
      </td>

    </tr>
  );
}