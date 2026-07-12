import SelectableCard from "./SelectableCard";

export default function OptionCardGroup({
  title,
  description,
  value,
  onChange,
  options,
  columns = 4,
}) {
  const gridClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
  };

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      <div className={`grid gap-4 ${gridClasses[columns]}`}>
        {options.map((option) => (
          <SelectableCard
            key={option.value}
            title={option.label}
            subtitle={option.subtitle}
            icon={option.icon}
            theme={option.theme}
            selected={value === option.value}
            recommended={option.recommended}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>
    </section>
  );
}