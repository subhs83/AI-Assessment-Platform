export default function DashboardMetricCard({
  title,
  value,
  icon: Icon,
  color,
}) {
  const colorClasses = {
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-100",
    },
    green: {
      text: "text-green-600",
      bg: "bg-green-100",
    },
    amber: {
      text: "text-amber-600",
      bg: "bg-amber-100",
    },
    purple: {
      text: "text-purple-600",
      bg: "bg-purple-100",
    },
  };

  const styles = colorClasses[color] || colorClasses.blue;

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <div className={`mt-3 text-4xl font-bold ${styles.text}`}>
            {value}
          </div>
        </div>

        <div className={`rounded-2xl p-4 ${styles.bg}`}>
          <Icon
            size={28}
            className={styles.text}
          />
        </div>
      </div>
    </div>
  );
}