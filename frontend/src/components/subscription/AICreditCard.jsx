import { BrainCircuit } from "lucide-react";

export default function AICreditCard({ usage }) {
    const totalCredits = usage?.total_ai_credits ?? 0;
    const usedCredits = usage?.used_ai_credits ?? 0;
    const remainingCredits = usage?.remaining_ai_credits ?? 0;
    const bonusCredits = usage?.bonus_ai_credits ?? 0;

    const percentage =
        totalCredits > 0
            ? Math.min(
                  Math.max((usedCredits / totalCredits) * 100, 0),
                  100
              )
            : 0;

    let progressColor =
        "bg-gradient-to-r from-emerald-500 to-green-600";

    if (percentage >= 80) {
        progressColor =
            "bg-gradient-to-r from-red-500 to-rose-600";
    } else if (percentage >= 50) {
        progressColor =
            "bg-gradient-to-r from-amber-500 to-orange-500";
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                    <BrainCircuit className="h-6 w-6 text-violet-600" />
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
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
                        {totalCredits.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        Remaining
                    </p>

                    <p className="mt-2 text-2xl font-bold text-emerald-600">
                        {remainingCredits.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        Used
                    </p>

                    <p className="mt-2 text-xl font-semibold text-amber-600">
                        {usedCredits.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        Bonus
                    </p>

                    <p className="mt-2 text-xl font-semibold text-indigo-600">
                        {bonusCredits.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                        Credit Usage
                    </span>

                    <span className="font-medium text-slate-900">
                        {Math.round(percentage)}%
                    </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                        style={{
                            width: `${percentage}%`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}