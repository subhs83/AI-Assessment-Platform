import { BrainCircuit } from "lucide-react";

export default function AICreditCard({ usage }) {

  const percentage =
    usage.total_credits > 0
      ? (usage.used_credits / usage.total_credits) * 100
      : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3 mb-6">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
          <BrainCircuit className="h-6 w-6 text-violet-600" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            AI Credits
          </h2>

          <p className="text-sm text-slate-500">
            Current billing period
          </p>
        </div>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {usage.total_credits}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Remaining
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {usage.remaining_credits}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Used
          </p>

          <p className="mt-2 text-xl font-semibold text-amber-600">
            {usage.used_credits}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Bonus
          </p>

          <p className="mt-2 text-xl font-semibold text-indigo-600">
            {usage.bonus_credits}
          </p>
        </div>

      </div>

      <div className="mt-6">

        <div className="flex justify-between text-sm mb-2">

          <span className="text-slate-500">
            Credit Usage
          </span>

          <span className="font-medium">
            {Math.round(percentage)}%
          </span>

        </div>

        <div className="h-3 rounded-full bg-slate-200 overflow-hidden">

          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
}