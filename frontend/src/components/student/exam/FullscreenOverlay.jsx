import { useEffect, useState } from "react";

import {
  ShieldAlert,
  Maximize,
  AlertTriangle,
  Play,
} from "lucide-react";

export default function FullscreenOverlay({
  mode = "violation",
  violationCount = 0,
  onResume,
}) {

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isStart) return;

    setCountdown(5);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStart]);

  const remaining = Math.max(0, 3 - violationCount);

  const isStart = mode === "start";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-5">

      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-6 text-center text-white">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">

            <ShieldAlert size={34} />

          </div>

          <h2 className="text-2xl font-bold">
            {isStart ? "Ready to Start" : "Fullscreen Required"}
          </h2>

          <p className="mt-2 text-sm text-indigo-100">
            {isStart
              ? "For a secure exam experience, fullscreen mode will be enabled before you begin."
              : "The exam is temporarily paused until you return to fullscreen mode."}
          </p>

        </div>

        {/* Body */}
        <div className="space-y-5 p-6">

          {isStart ? (

            <>
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">

                <h3 className="font-semibold text-slate-900">
                  Before You Start
                </h3>

                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">

                  <li>✓ Fullscreen mode is required.</li>

                  <li>✓ Do not switch tabs or apps.</li>

                  <li>✓ Ensure you have a stable internet connection.</li>

                  <li>✓ The exam timer starts immediately after entering.</li>

                </ul>

              </div>

              <button
                  onClick={onResume}
                  className={`
                    flex w-full items-center justify-center gap-2
                    rounded-2xl py-3.5 font-semibold text-white
                    transition-all duration-300 active:scale-[0.98]

                    ${
                      countdown === 0
                        ? `
                          bg-indigo-600
                          hover:bg-indigo-700
                          shadow-xl
                          ring-4 ring-indigo-200
                          animate-pulse
                        `
                        : `
                          bg-slate-400
                          cursor-not-allowed
                        `
                    }
                  `}
                  disabled={countdown !== 0}
                >
                  <Play size={20} />

                  {countdown === 0
                    ? "Tap to Start Exam"
                    : `Starting in ${countdown}s`}
                </button>
            </>

          ) : (

            <>
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

                    Remaining violations allowed:
                    <strong> {remaining}</strong>

                  </p>

                </div>

              </div>

              <button
                onClick={onResume}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99]"
              >

                <Maximize size={20} />

                Resume Exam

              </button>
            </>
          )}

        </div>

      </div>

    </div>
  );
}