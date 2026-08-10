export default function FigureSvg({
  viewBox = "0 0 1000 1000",
  children,
  className = "",
}) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <svg
        viewBox={viewBox}
        width="450"
        height="350"
        className="mx-auto"
        role="img"
        aria-label="Educational figure"
        >
        {children}
      </svg>
    </div>
  );
}