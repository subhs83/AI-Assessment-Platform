import {
  Users,
  GraduationCap,
  BrainCircuit,
} from "lucide-react";

export default function PlanLimitsCard({ limits }) {
  const items = [
    {
      icon: Users,
      title: "Maximum Students",
      value: limits.max_students,
    },
    {
      icon: GraduationCap,
      title: "Maximum Teachers",
      value: limits.max_teachers,
    },
    {
      icon: BrainCircuit,
      title: "Monthly AI Credits",
      value: limits.monthly_ai_credits,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Plan Limits
        </h2>

        <p className="text-sm text-slate-500">
          Resources included in your current subscription.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                <Icon
                  size={22}
                  className="text-indigo-600"
                />
              </div>

              <p className="text-xs uppercase tracking-wide text-slate-500">
                {item.title}
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {item.value}
              </p>
            </div>
          );
        })}

      </div>

    </div>
  );
}