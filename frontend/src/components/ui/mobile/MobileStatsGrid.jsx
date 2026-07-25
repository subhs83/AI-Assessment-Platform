import MobileCard from "./MobileCard";

export default function MobileStatsGrid({
  items = [],
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <MobileCard
            key={index}
            className="p-3"
          >
            <div className="flex items-start justify-between">

              <div className="min-w-0 flex-1">

                <div
                  className={`text-xl font-bold ${
                    item.valueClassName || "text-slate-900"
                  }`}
                >
                  {item.value}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  {item.title}
                </div>

              </div>

              {Icon && (
                <div
                  className={`rounded-xl p-2 ${
                    item.iconBg || "bg-slate-100"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      item.iconColor || "text-slate-600"
                    }
                  />
                </div>
              )}

            </div>
          </MobileCard>
        );
      })}
    </div>
  );
}