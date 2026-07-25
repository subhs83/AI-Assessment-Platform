export default function PageHeader({
  title,
  description,
  actions,
  icon: Icon,
  iconClassName = "bg-indigo-50 text-indigo-600",
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-start gap-4">

        {Icon && (
          <div className={`rounded-2xl p-3 ${iconClassName}`}>
            <Icon size={26} />
          </div>
        )}

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {title}
          </h1>

          {description && (
            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>

      </div>

      {actions && (
        <div
          className="
            flex
            w-full
            flex-wrap
            items-center
            justify-end
            gap-2
            md:w-auto
            md:flex-nowrap
            md:justify-end
            min-w-0
          "
        >
          {actions}
        </div>
      )}
    </div>
  );
}