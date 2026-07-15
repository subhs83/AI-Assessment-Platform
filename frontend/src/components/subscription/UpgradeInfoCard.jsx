import { ArrowUpCircle, Sparkles } from "lucide-react";

export default function UpgradeInfoCard({
    title = "Need More Resources?",
    description = "If you need additional AI credits or higher subscription limits, you can upgrade your current plan at any time.",
    buttonText = "Upgrade Coming Soon",
    disabled = true,
    onClick,
}) {
    return (
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-6">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>

                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        {description}
                    </p>

                    <button
                        type="button"
                        disabled={disabled}
                        onClick={onClick}
                        className={`mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                            disabled
                                ? "cursor-not-allowed bg-indigo-600 text-white opacity-70"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                    >
                        <ArrowUpCircle size={18} />
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
}