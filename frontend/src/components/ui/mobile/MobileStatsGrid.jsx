import MobileCard from "./MobileCard";

export default function MobileStatsGrid({
  items,
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <MobileCard
            key={item.title}
            className="p-3"
          >
            <div className="flex items-start justify-between">

              <div className="min-w-0">

                <div className="text-xl font-bold text-slate-900">
                  {item.value}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  {item.title}
                </div>

              </div>

              <div
                className={`rounded-xl p-2 ${item.iconBg}`}
              >
                <Icon
                  size={18}
                  className={item.iconColor}
                />
              </div>

            </div>
          </MobileCard>
        );
      })}
    </div>
  );
}