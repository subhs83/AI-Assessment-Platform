export default function AssetList({
  title,
  ids = [],
}) {
  if (!ids.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {ids.map((id) => (
          <span
            key={id}
            className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
          >
            {id}
          </span>
        ))}
      </div>
    </div>
  );
}