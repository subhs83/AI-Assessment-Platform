export default function MobileCard({
  children,
  className = "",
  onClick,
}) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`
        w-full
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-200
        hover:shadow-md
        active:scale-[0.99]
        ${onClick ? "cursor-pointer text-left" : ""}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}