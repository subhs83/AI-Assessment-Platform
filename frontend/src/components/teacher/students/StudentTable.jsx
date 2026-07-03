import { Pencil, Trash2 } from "lucide-react";

export default function StudentTable({
  students,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">

      <table className="w-full">

        <thead>

          <tr className="bg-gray-50">

            <th className="text-left p-3 font-medium">
              Roll
            </th>

            <th className="text-left p-3 font-medium">
              Student
            </th>

            <th className="text-left p-3 font-medium">
              Class
            </th>

            <th className="text-left p-3 font-medium">
              Mobile
            </th>

            <th className="text-center p-3 font-medium">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {students.map((student) => (

            <tr
              key={student.student_uid}
              className="border-t hover:bg-gray-50"
            >

              <td className="p-3">
                {student.roll_number}
              </td>

              <td className="p-3">
                {student.student_name}
              </td>

              <td className="p-3">
                {student.student_class}
              </td>

              <td className="p-3">
                {student.mobile || "-"}
              </td>

              <td className="p-3">

                <div className="flex items-center justify-center gap-2">

                  <button
                    type="button"
                    title="Edit Student"
                    onClick={() => onEdit(student)}
                    className="
                      p-2
                      rounded-lg
                      text-blue-600
                      hover:bg-blue-50
                      hover:text-blue-700
                      transition
                    "
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    type="button"
                    title="Delete Student"
                    onClick={() => onDelete(student)}
                    className="
                      p-2
                      rounded-lg
                      text-red-600
                      hover:bg-red-50
                      hover:text-red-700
                      transition
                    "
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}