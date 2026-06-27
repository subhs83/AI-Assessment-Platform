// src/components/ui/PageHeader.jsx

export default function PageHeader({
  title,
  description,
  actions,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {title}
        </h1>

        {description && (
          <p className="text-sm text-gray-500 mt-1 mb-4">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}