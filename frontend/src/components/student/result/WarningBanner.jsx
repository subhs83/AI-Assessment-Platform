import { memo } from "react";
import { AlertTriangle, TimerReset } from "lucide-react";

const WarningBanner = ({ result }) => {
  if (
    result.auto_submitted_reason !== "time_expired" &&
    result.auto_submitted_reason !== "max_violations"
  ) {
    return null;
  }

  const isTimeExpired =
    result.auto_submitted_reason === "time_expired";

  return (
    <div
      className={`
        mb-6
        rounded-2xl
        border
        shadow-sm
        px-5
        py-4
        flex
        items-start
        gap-4
        ${
          isTimeExpired
            ? "bg-yellow-50 border-yellow-200"
            : "bg-red-50 border-red-200"
        }
      `}
    >
      {/* Icon */}
      <div
        className={`
          flex-shrink-0
          w-11
          h-11
          rounded-xl
          flex
          items-center
          justify-center
          ${
            isTimeExpired
              ? "bg-yellow-100"
              : "bg-red-100"
          }
        `}
      >
        {isTimeExpired ? (
          <TimerReset className="w-6 h-6 text-yellow-700" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-red-700" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1">

        <h3
          className={`font-semibold ${
            isTimeExpired
              ? "text-yellow-900"
              : "text-red-900"
          }`}
        >
          {isTimeExpired
            ? "Time Limit Reached"
            : "Maximum Violations Reached"}
        </h3>

        <p
          className={`mt-1 text-sm ${
            isTimeExpired
              ? "text-yellow-800"
              : "text-red-800"
          }`}
        >
          Your exam was automatically submitted because{" "}
          {isTimeExpired
            ? "the allotted exam time expired."
            : "the maximum number of allowed violations was exceeded."}
        </p>

      </div>
    </div>
  );
};

export default memo(WarningBanner);