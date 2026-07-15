import {
    BrainCircuit,
    FileImage,
    FileText,
    HelpCircle,
    HardDrive,
 
} from "lucide-react";
import { dashboardThemes } from "../ui/dashboardThemes";

export default function PlanLimitsCard({ limits }) {
    const items = [
    {
        title: "Monthly AI Credits",
        icon: BrainCircuit,
        value: limits.monthly_ai_credits,
        theme: dashboardThemes.ai,
    },

    {
        title: "PDF Pages / Request",
        icon: FileText,
        value: limits.max_pdf_pages,
        theme: dashboardThemes.document,
    },

    {
        title: "Images / Request",
        icon: FileImage,
        value: limits.max_images_per_request,
        theme: dashboardThemes.image,
    },

    {
        title: "Questions / Generation",
        icon: HelpCircle,
        value: limits.max_questions_per_generation,
        theme: dashboardThemes.assessment,
    },

    {
        title: "Storage",
        icon: HardDrive,
        value: limits.storage_mb,
        theme: dashboardThemes.storage,
    },
];

    const visibleItems = items.filter(
        (item) =>
            item.value !== undefined &&
            item.value !== null
    );

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                    Plan Features & Limits
                </h2>

                <p className="text-sm text-slate-500">
                    Technical limits included in your current subscription.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {visibleItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className={`
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            p-5
                            transition
                            ${item.theme.hoverBorder}
                            ${item.theme.hoverBg}
                            `}
                        >
                            <div className={`
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    ${item.theme.iconBg}
                                    `}
                                 >
                                <Icon
                                    size={22}
                                    className={item.theme.iconColor}
                                />
                            </div>

                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                {item.title}
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {typeof item.value === "number"
                                    ? item.value.toLocaleString()
                                    : item.value}
                                {item.suffix ?? ""}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}