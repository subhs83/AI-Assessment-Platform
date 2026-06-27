const StatCard = ({
  icon,
  label,
  value,
  color = "text-slate-900",
}) => {
  return (
    <div className="bg-white rounded-2xl border p-5 flex items-center gap-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="text-2xl">{icon}</div>

      <div>
        <p className="text-sm text-slate-500">{label}</p>

        <h3 className={`text-xl font-bold ${color}`}>
          {value}
        </h3>
      </div>
    </div>
  );
};

export default StatCard;