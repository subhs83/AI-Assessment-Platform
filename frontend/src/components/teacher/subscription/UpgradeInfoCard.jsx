import { ArrowUpCircle, Sparkles } from "lucide-react";

export default function UpgradeInfoCard() {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-6">

      <div className="flex items-start gap-4">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
          <Sparkles className="h-6 w-6 text-indigo-600" />
        </div>

        <div className="flex-1">

          <h2 className="text-lg font-semibold text-slate-900">
            Need More Resources?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            If you need additional AI credits, more students, or higher plan
            limits, please contact your School Administrator. Subscription
            upgrades are managed at the school level.
          </p>

          <button
            disabled
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white opacity-70 cursor-not-allowed"
          >
            <ArrowUpCircle size={18} />
            Upgrade Managed by School
          </button>

        </div>

      </div>

    </div>
  );
}