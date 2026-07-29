import {
  Users,
  Mail,
  ShieldCheck,
  ShieldAlert,
  LockKeyhole,
} from "lucide-react";

import MobileCard from "../../ui/mobile/MobileCard";

export default function TeacherMobileCard({
  teachers,
  onToggle,
  onReset,
}) {
  return (
    <div className="space-y-3">

      {teachers.map((teacher) => (

        <MobileCard
          key={teacher.id}
        >

          {/* Teacher */}
          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-indigo-100 p-2">
              <Users
                size={18}
                className="text-indigo-600"
              />
            </div>

            <div className="min-w-0 flex-1">

              <div className="font-semibold text-slate-900">
                {teacher.name}
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">

                <Mail
                  size={14}
                  className="text-blue-500"
                />

                <span className="truncate">
                  {teacher.email}
                </span>

              </div>

            </div>

          </div>

          {/* Status Row */}
          <div className="mt-4 flex items-center justify-between">

            <div>

              <div className="text-xs text-slate-500">
                Status
              </div>

              <span
                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  teacher.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {teacher.is_active
                  ? "Active"
                  : "Inactive"}
              </span>

            </div>

            <div className="text-right">

              <div className="text-xs text-slate-500">
                Password
              </div>

              <span
                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  teacher.force_password_change
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {teacher.force_password_change
                  ? "Required"
                  : "Completed"}
              </span>

            </div>

          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">

            <button
              type="button"
              onClick={() => onToggle(teacher)}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white transition ${
                teacher.is_active
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {teacher.is_active ? (
                <ShieldAlert size={16} />
              ) : (
                <ShieldCheck size={16} />
              )}

              {teacher.is_active
                ? "Deactivate"
                : "Activate"}
            </button>

            <button
              type="button"
              onClick={() => onReset(teacher)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
            >
              <LockKeyhole size={16} />
              Reset
            </button>

          </div>

        </MobileCard>

      ))}

    </div>
  );
}