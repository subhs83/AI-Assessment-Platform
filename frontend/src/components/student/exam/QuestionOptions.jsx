import { Check } from "lucide-react";

export default function QuestionOptions({
  options,
  selected,
  saving,
  isOffline,
  onSelect,
}) {
  return (
  <div className="space-y-2.5">

    {Object.entries(options).map(([key, value]) => {

      const isSelected = selected === key;

      return (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          disabled={saving || isOffline}
          className={`
            group
            w-full
            rounded-2xl
            border
            px-4
            py-3
            text-left
            transition-all
            duration-200
            flex
            items-center
            gap-3

            ${
              isSelected
                ? `
                  border-indigo-500
                  bg-indigo-50
                  shadow-md
                  ring-2
                  ring-indigo-100
                `
                : `
                  border-slate-200
                  bg-white
                  hover:border-indigo-300
                  hover:bg-slate-50
                  hover:shadow-sm
                `
            }

            ${
              saving || isOffline
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer active:scale-[0.99]"
            }
          `}
        >

         {/* Option Badge */}

        <div
          className={`
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-full border-2
            text-sm font-bold
            transition-all

            ${
              isSelected
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-300 bg-white text-slate-700 group-hover:border-indigo-400"
            }
          `}
        >
          {key}
        </div>

        {/* Option Text */}

        <div className="flex-1 min-w-0">
            <p
              className={`
                whitespace-pre-wrap
                break-words
                text-[15px]
                leading-7
                md:text-base

                ${
                  isSelected
                    ? "font-semibold text-slate-900"
                    : "text-slate-700"
                }
              `}
            >
              {value}
            </p>
          </div>

          {/* Selected */}

          <div className="flex items-center">
            {isSelected && (
              <Check
                size={22}
                className="text-indigo-700"
              />
            )}
          </div>

        </button>
      );
    })}

  </div>
);
}