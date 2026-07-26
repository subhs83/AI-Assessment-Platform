export default function PageHeader({
  title,
  description,
  actions,
  icon: Icon,
  iconClassName = "bg-indigo-50 text-indigo-600",
}) {
  return (
    <div className="flex md:flex-row md:items-center md:justify-between gap-4">
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
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}