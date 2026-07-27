import { Pencil, Trash2 } from "lucide-react";

import MobileCard from "../../ui/MobileCard";

export default function StudentCard({
  student,
  onEdit,
  onDelete,
}) {
  return (
    <MobileCard className="p-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0 flex-1">

          <h3 className="truncate text-base font-semibold text-slate-900">
            {student.student_name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Roll No: {student.roll_number}
          </p>

        </div>

        <div className="flex items-center gap-1">

          <button
            type="button"
            title="Edit Student"
            onClick={() => onEdit(student)}
            className="
              rounded-lg p-2
              text-blue-600
              transition
              hover:bg-blue-50
            "
          >
            <Pencil size={18} />
          </button>

          <button
            type="button"
            title="Delete Student"
            onClick={() => onDelete(student)}
            className="
              rounded-lg p-2
              text-red-600
              transition
              hover:bg-red-50
            "
          >
            <Trash2 size={18} />
          </button>

        </div>

      </div>

      {/* Info */}
      <div className="mt-4 flex items-center justify-between gap-4 border-t pt-3 text-sm">

        <div>

          <p className="text-slate-500">
            Class
          </p>

          <p className="font-medium text-slate-900">
            {student.student_class || "-"}
            {student.student_section
              ? ` - ${student.student_section}`
              : ""}
          </p>

        </div>

        <div className="text-right">

          <p className="text-slate-500">
            Mobile
          </p>

          <p className="font-medium text-slate-900">
            {student.mobile || "-"}
          </p>

        </div>

      </div>

    </MobileCard>
  );
}