import { dashboardIcons } from "../ui/dashboardIcons";
import { dashboardThemes } from "../ui/dashboardThemes";


export default function CurrentPlanCard({ subscription }) {
    const { plan, subscription: details } = subscription;
    const CrownIcon = dashboardIcons.subscription;
    const StatusIcon = dashboardIcons.status;
    const BillingIcon = dashboardIcons.billing;

    const status = (details.status || "").toLowerCase();
    const billingCycle = details.billing_cycle
        ? details.billing_cycle.charAt(0).toUpperCase() +
          details.billing_cycle.slice(1)
        : "-";

    const expiryDate = details.expires_at
        ? new Date(details.expires_at).toLocaleDateString()
        : "-";

    const statusClasses = {
        active: "bg-emerald-100 text-emerald-700",
        trial: "bg-blue-100 text-blue-700",
        expired: "bg-red-100 text-red-700",
        suspended: "bg-amber-100 text-amber-700",
        cancelled: "bg-slate-200 text-slate-700",
    };

    const statusClass =
        statusClasses[status] || "bg-slate-100 text-slate-700";

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
               <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${dashboardThemes.subscription.iconBg}`}>
                <CrownIcon
                    className={`h-6 w-6 ${dashboardThemes.subscription.iconColor}`}
                />
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
                        <div className={`flex items-center gap-2 ${dashboardThemes.success.iconColor}`}>
                            <StatusIcon size={16} />

                            <span className="text-xs uppercase">
                                Status
                            </span>
                        </div>

                        <span
                            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                        >
                            {status
                                ? status.charAt(0).toUpperCase() +
                                  status.slice(1)
                                : "-"}
                        </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <div className={`flex items-center gap-2 ${dashboardThemes.info.iconColor}`}>
                            <BillingIcon size={16} />

                            <span className="text-xs uppercase">
                                Billing
                            </span>
                        </div>

                        <p className="mt-3 font-semibold text-slate-900">
                            {billingCycle}
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-indigo-700">
                        Expires On
                    </p>

                    <p className="mt-2 font-semibold text-indigo-900">
                        {expiryDate}
                    </p>
                </div>
            </div>
        </div>
    );
}