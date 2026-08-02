import { ChevronDown } from "lucide-react";

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  helperText,
  error,
  required = false,
  disabled = false,
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
           name={name}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none rounded-lg border px-3 py-2 pr-10 bg-white focus:outline-none focus:ring-2 transition ${
            error
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:ring-indigo-200"
          } ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : ""
          }`}
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="text-xs text-gray-500">
          {helperText}
        </p>
      )}
      
    </div>
  );
}