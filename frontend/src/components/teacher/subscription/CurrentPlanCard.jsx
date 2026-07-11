import { CalendarDays, Crown, ShieldCheck } from "lucide-react";

export default function CurrentPlanCard({ subscription }) {
  const { plan, subscription: details } = subscription;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
          <Crown className="h-6 w-6 text-indigo-600" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Current Plan
          </h2>

          <p className="text-sm text-slate-500">
            Your active subscription
          </p>
        </div>
      </div>

      <div className="space-y-5">

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Plan
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {plan.name}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {plan.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="rounded-xl bg-slate-50 p-4">

            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck size={16} />
              <span className="text-xs uppercase">
                Status
              </span>
            </div>

            <p className="mt-2 font-semibold text-emerald-600">
              {details.status}
            </p>

          </div>

          <div className="rounded-xl bg-slate-50 p-4">

            <div className="flex items-center gap-2 text-slate-500">
              <CalendarDays size={16} />
              <span className="text-xs uppercase">
                Billing
              </span>
            </div>

            <p className="mt-2 font-semibold text-slate-900">
              {details.billing_cycle}
            </p>

          </div>

        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">

          <p className="text-xs uppercase tracking-wide text-indigo-700">
            Expires On
          </p>

          <p className="mt-2 font-semibold text-indigo-900">
            {new Date(details.expires_at).toLocaleDateString()}
          </p>

        </div>

      </div>

    </div>
  );
}