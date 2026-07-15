import {
  Users,
  Mail,
  ShieldCheck,
  ShieldAlert,
  LockKeyhole,
} from "lucide-react";

export default function TeacherRow({
  teacher,
  onToggle,
  onReset,
}) {
  return (
    <tr className="hover:bg-gray-50 transition">

      <td className="px-6 py-4">

        <div className="flex items-center gap-3">

          <div className="rounded-lg bg-indigo-100 p-2">
            <Users
              size={16}
              className="text-indigo-600"
            />
          </div>

          <div className="font-semibold text-gray-900 whitespace-nowrap">
            {teacher.name}
          </div>

        </div>

      </td>

      <td className="px-6 py-4">

        <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">

          <Mail
            size={16}
            className="text-blue-500"
          />

          {teacher.email}

        </div>

      </td>

      <td className="px-6 py-4">

        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            teacher.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {teacher.is_active
            ? "Active"
            : "Inactive"}
        </span>

      </td>

      <td className="px-6 py-4">

        {teacher.force_password_change ? (

          <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
            Required
          </span>

        ) : (

          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            Completed
          </span>

        )}

      </td>

      <td className="px-6 py-4">

        <div className="flex items-center gap-2 whitespace-nowrap">

          <button
            onClick={() => onToggle(teacher)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition ${
              teacher.is_active
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {teacher.is_active ? (
              <ShieldAlert size={18} />
            ) : (
              <ShieldCheck size={18} />
            )}

            {teacher.is_active
              ? "Deactivate"
              : "Activate"}
          </button>

          <button
            onClick={() => onReset(teacher)}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
          >
            <LockKeyhole size={18} />

            Reset
          </button>

        </div>

      </td>

    </tr>
  );
}