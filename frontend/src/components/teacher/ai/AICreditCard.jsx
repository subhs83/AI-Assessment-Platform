import {
  Sparkles,
  Zap,
} from "lucide-react";

export default function AICreditCard({
  subscription,
  creditsRequired = 0,
}) {
  if (!subscription) {
    return null;
  }

  const total =
    subscription.total_ai_credits || 0;

  const used =
    subscription.used_ai_credits || 0;

  const remaining =
    subscription.remaining_ai_credits || 0;

  const percentage =
    total > 0
      ? Math.min((used / total) * 100, 100)
      : 0;

  return (
    <div className="mb-6 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-4 shadow-sm sm:p-5">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <div className="flex items-center gap-2">

            <Sparkles className="h-5 w-5 text-indigo-600" />

            <h2 className="text-base font-semibold sm:text-lg">
              AI Credits
            </h2>

          </div>

          <p className="mt-1 text-sm text-slate-500">
            Current Plan:{" "}
            <span className="font-medium text-slate-700">
              {subscription.plan}
            </span>
          </p>

        </div>

        <div className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">

          {remaining} Credits Left

        </div>

      </div>

      {/* Progress */}

      <div className="mt-4">

        <div className="mb-2 flex justify-between text-sm">

          <span className="text-slate-500">
            Usage
          </span>

          <span className="font-medium">
            {used} / {total}
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

      {creditsRequired > 0 && (

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">

          <div className="flex items-start gap-2">

            <Zap className="h-4 w-4 text-amber-600" />

            <span className="text-sm font-medium">

              This generation will consume{" "}
              <strong>{creditsRequired}</strong> AI credits.

            </span>

          </div>

        </div>

      )}

    </div>
  );
}