export default function SkeletonCard({
  children,
  className = "",
  animate = true,
}) {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 p-6
        ${animate ? "animate-pulse" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}