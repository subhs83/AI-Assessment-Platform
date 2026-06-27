import {
  WifiOff,
  ShieldCheck,
} from "lucide-react";

export default function OfflineBanner() {
  return (
    <div className="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">

      <div className="flex items-start gap-4 p-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100">

          <WifiOff
            size={22}
            className="text-amber-700"
          />

        </div>

        <div className="flex-1">

          <h3 className="font-semibold text-slate-900">
            Internet connection lost
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Don't worry. Your previously saved answers are
            safe and your exam will continue normally.
            New answers will automatically sync once your
            internet connection is restored.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">

            <ShieldCheck size={14} />

            Previously saved answers are secure

          </div>

        </div>

      </div>

    </div>
  );
}