import { Pencil, Trash2 } from "lucide-react";
import MobileCard from "../../components/ui/MobileCard";

export default function StudentCard({
  student,
  onEdit,
  onDelete,
}) {
  return (
    <MobileCard>

      <div className="flex items-start justify-between">

        <div>
          <h3 className="font-semibold text-slate-900">
            {student.student_name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Roll: {student.roll_number}
          </p>
        </div>


        <div className="flex gap-1">

          <button
            onClick={() => onEdit(student)}
            className="
              rounded-lg p-2
              text-blue-600
              hover:bg-blue-50
            "
          >
            <Pencil size={18}/>
          </button>


          <button
            onClick={() => onDelete(student)}
            className="
              rounded-lg p-2
              text-red-600
              hover:bg-red-50
            "
          >
            <Trash2 size={18}/>
          </button>

        </div>

      </div>


      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">

        <div>
          <p className="text-slate-500">
            Class
          </p>
          <p className="font-medium">
            {student.student_class || "-"}
          </p>
        </div>


        <div>
          <p className="text-slate-500">
            Section
          </p>
          <p className="font-medium">
            {student.student_section || "-"}
          </p>
        </div>


        <div>
          <p className="text-slate-500">
            Mobile
          </p>
          <p className="font-medium">
            {student.mobile || "-"}
          </p>
        </div>

      </div>

    </MobileCard>
  );
}