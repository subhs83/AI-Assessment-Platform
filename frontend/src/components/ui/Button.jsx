// src/components/ui/Button.jsx

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white",

    secondary:
      "bg-gray-600 hover:bg-gray-700 text-white",

    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white",

    danger:
      "bg-red-600 hover:bg-red-700 text-white",

    info:
      "bg-blue-600 hover:bg-blue-700 text-white",

    purple:
      "bg-purple-600 hover:bg-purple-700 text-white",
  };

  return (
    <button
      className={`
        px-4 py-2
        rounded-lg
        text-sm
        font-medium
        flex 
        items-center 
        gap-1
        transition-colors
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}