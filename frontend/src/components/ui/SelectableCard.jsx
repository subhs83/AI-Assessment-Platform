import { Check } from "lucide-react";

export default function SelectableCard({
  title,
  subtitle,
  icon: Icon,
  theme,
  selected = false,
  recommended = false,
  onClick,
}) {

  const iconNormal =  theme.icon?.normal || "bg-slate-100 text-slate-600";

  const iconSelected =  theme.icon?.selected || "bg-indigo-600 text-white";

   const cardNormal =  theme.card?.normal || "border-slate-200";

  const cardSelected =  theme.card?.selected || "border-indigo-500";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative w-full overflow-hidden rounded-2xl border
        p-3 sm:p-5 text-left transition-all duration-200

        ${
          selected
            ? `${cardSelected}  shadow-lg ring-2 ring-indigo-100`
            : `${cardNormal}  hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg`
        }
      `}
    >
      {/* Selected Badge */}
      {selected && (
        <div className="absolute right-4 top-6 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow ">
          <Check size={15} strokeWidth={3} />
        </div>
      )}

      {/* Recommended */}
      {recommended && (
        <div className="absolute left-4 top-4 z-10 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          Recommended
        </div>
      )}

      <div className="mt-8 sm:mt-7">
        {/* Icon */}
        {Icon && (
          <div
            className={`
                mb-3 sm:mb-5
                flex
                h-10 w-10
                sm:h-12 sm:w-12
                items-center justify-center rounded-xl
                transition-all duration-200

                ${
                    selected
                        ? iconSelected
                        : iconNormal
                }
            `}
        >
            <Icon size={18} className="sm:h-[22px] sm:w-[22px]" />
        </div>
        )}

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900">
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
    </button>
  );
}