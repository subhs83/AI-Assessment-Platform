import Button from "../../ui/Button";

export default function SubscriptionCard({
  subscription,
  onViewSubscription,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 shadow-sm">

      <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}
        <div>

          <div className="flex items-center gap-3">

            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {subscription.plan}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                subscription.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : subscription.status === "TRIAL"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {subscription.status}
            </span>

          </div>

          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            {subscription.remaining_ai_credits.toLocaleString()} AI Credits Remaining
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {subscription.used_ai_credits.toLocaleString()} used of{" "}
            {subscription.total_ai_credits.toLocaleString()} monthly credits.
          </p>

        </div>

        {/* Right */}
        <div className="flex flex-col items-start gap-3 lg:items-end">

          <div className="text-sm text-slate-500">
            Subscription expires
          </div>

          <div className="text-lg font-semibold text-slate-800">
            {subscription.expires_at
              ? new Date(subscription.expires_at).toLocaleDateString()
              : "-"}
          </div>

          <Button
            variant="success"
            onClick={onViewSubscription}
          >
            View Subscription
          </Button>

        </div>

      </div>

    </div>
  );
}