export default function MobileStatusBadge({
  children,
  color = "gray",
}) {
  const colors = {
    green:
      "bg-green-100 text-green-700 border-green-200",

    red:
      "bg-red-100 text-red-700 border-red-200",

    yellow:
      "bg-yellow-100 text-yellow-700 border-yellow-200",

    blue:
      "bg-blue-100 text-blue-700 border-blue-200",

    gray:
      "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-medium
        whitespace-nowrap
        ${colors[color] || colors.gray}
      `}
    >
      {children}
    </span>
  );
}