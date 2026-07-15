import {
    GraduationCap,
    Layers3,
    School,
    Users,
} from "lucide-react";
import { dashboardThemes } from "../ui/dashboardThemes";

export default function ResourceUsageCard({ resources }) {
   const items = [
    {
        title: "Students",
        icon: Users,
        data: resources.students,
        theme: dashboardThemes.student,
    },

    {
        title: "Teachers",
        icon: GraduationCap,
        data: resources.teachers,
        theme: dashboardThemes.teacher,
    },

    {
        title: "Classes",
        icon: School,
        data: resources.classes,
        theme: dashboardThemes.school,
    },

    {
        title: "Sections",
        icon: Layers3,
        data: resources.sections,
        theme: dashboardThemes.assessment,
    },
];

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                    Resource Usage
                </h2>

                <p className="text-sm text-slate-500">
                    Current usage of your subscription resources.
                </p>
            </div>

            <div className="space-y-5">
                {items.map((item) => {
                    const Icon = item.icon;

                    const used = item.data?.used ?? 0;
                    const limit = item.data?.limit ?? 0;

                    const percentage =
                        limit > 0
                            ? Math.min((used / limit) * 100, 100)
                            : 0;

                    let progressColor = "bg-emerald-500";

                    if (percentage >= 90) {
                        progressColor = "bg-red-500";
                    } else if (percentage >= 75) {
                        progressColor = "bg-amber-500";
                    }

                    return (
                        <div key={item.title}>
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.theme.iconBg}`}>
                                        <Icon
                                            size={20}
                                            className={item.theme.iconColor}
                                        />
                                    </div>

                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {item.title}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {used.toLocaleString()} /{" "}
                                            {limit.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <span className="text-sm font-semibold text-slate-700">
                                    {Math.round(percentage)}%
                                </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                                    style={{
                                        width: `${percentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}