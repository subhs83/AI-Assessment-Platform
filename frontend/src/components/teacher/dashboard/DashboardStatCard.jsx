export default function DashboardStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  valueClassName = "text-slate-900",
  iconClassName = "bg-slate-100 text-slate-600",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-center justify-between">

        <div>

          <p className={`text-3xl font-bold ${valueClassName}`}>
            {value}
          </p>

          <p className="mt-1 font-medium text-slate-700">
            {title}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {subtitle}
          </p>

        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon className="h-6 w-6" />
        </div>

      </div>

    </div>
  );
}