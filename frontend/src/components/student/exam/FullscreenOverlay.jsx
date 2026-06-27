import {
  ShieldAlert,
  Maximize,
  AlertTriangle,
} from "lucide-react";

export default function FullscreenOverlay({
  violationCount,
  onResume,
}) {
  const remaining = Math.max(0, 3 - violationCount);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-5">

      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-6 text-center text-white">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">

            <ShieldAlert size={34} />

          </div>

          <h2 className="text-2xl font-bold">
            Fullscreen Required
          </h2>

          <p className="mt-2 text-sm text-indigo-100">
            The exam is temporarily paused until you return to fullscreen mode.
          </p>

        </div>

        {/* Body */}
        <div className="space-y-5 p-6">

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">

            <div className="flex items-center justify-between">

              <span className="text-sm font-medium text-slate-700">
                Violations
              </span>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                {violationCount} / 3
              </span>

            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-100">

              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{
                  width: `${(violationCount / 3) * 100}%`,
                }}
              />

            </div>

          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

            <AlertTriangle
              size={22}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>

              <div className="font-semibold text-red-700">
                Auto Submit Protection
              </div>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Your exam will be submitted automatically after
                <strong> 3 fullscreen violations.</strong>

                <br />

                Remaining attempts:
                <strong> {remaining}</strong>
              </p>

            </div>

          </div>

          <button
            onClick={onResume}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99]"
          >

            <Maximize size={20} />

            Return to Fullscreen

          </button>

        </div>

      </div>

    </div>
  );
}