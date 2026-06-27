import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
open,
title = "Confirm Action",
description = "Are you sure you want to continue?",
confirmText = "Confirm",
cancelText = "Cancel",
variant = "danger",
loading = false,
onConfirm,
onClose,
}) {

if (!open) return null;

const buttonStyles = {
danger:
"bg-red-600 hover:bg-red-700 text-white",

primary:
  "bg-blue-600 hover:bg-blue-700 text-white",

success:
  "bg-emerald-600 hover:bg-emerald-700 text-white",

};

const iconStyles = {
danger:
"bg-red-100 text-red-600",

primary:
  "bg-blue-100 text-blue-600",

success:
  "bg-emerald-100 text-emerald-600",

};

return (

<div className="fixed inset-0 z-[9999]">

  {/* Backdrop */}

  <div
    className="
      absolute
      inset-0
      bg-black/50
      backdrop-blur-sm
      animate-in
      fade-in
      duration-200
    "
    onClick={onClose}
  />

  {/* Modal */}

  <div
    className="
      absolute
      inset-0
      flex
      items-center
      justify-center
      p-4
    "
  >

    <div
      className="
        w-full
        max-w-md
        rounded-3xl
        bg-white
        shadow-[0_30px_80px_rgba(0,0,0,0.18)]
        border
        animate-in
        zoom-in-95
        fade-in
        duration-200
      "
    >

      {/* Header */}

      <div className="p-6 pb-4">

        <div className="flex items-start justify-between">

          <div
            className={`
              h-14
              w-14
              rounded-2xl
              flex
              items-center
              justify-center
              ${iconStyles[variant]}
            `}
          >

            <AlertTriangle size={26} />

          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="
              text-gray-400
              hover:text-gray-700
              transition
            "
          >

            <X size={20} />

          </button>

        </div>

        <h3
          className="
            mt-5
            text-2xl
            font-bold
            text-gray-900
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-3
            text-gray-600
            leading-relaxed
          "
        >
          {description}
        </p>

      </div>

      {/* Footer */}

      <div
        className="
          px-6
          py-5
          border-t
          flex
          justify-end
          gap-3
        "
      >

        <button
          onClick={onClose}
          disabled={loading}
          className="
            px-5
            py-2.5
            rounded-xl
            border
            border-gray-300
            text-gray-700
            font-medium
            hover:bg-gray-50
            transition
            disabled:opacity-50
          "
        >
          {cancelText}
        </button>

        <button
          onClick={onConfirm}
          disabled={loading}
          className={`
            px-5
            py-2.5
            rounded-xl
            font-medium
            transition
            disabled:opacity-50
            ${buttonStyles[variant]}
          `}
        >

          {loading
            ? "Processing..."
            : confirmText}

        </button>

      </div>

    </div>

  </div>

</div>
);

}
