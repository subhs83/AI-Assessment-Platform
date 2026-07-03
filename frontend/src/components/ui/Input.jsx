export default function Input({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  name,
  required = false,
  disabled = false,
  readOnly = false,
  error,
}) {
  return (
    <div className="space-y-1">

      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}

          {required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`
          w-full
          rounded-lg
          border
          px-3
          py-2
          outline-none
          transition

          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-300"
              : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
          }

          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white"
          }
        `}
      />

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

    </div>
  );
}