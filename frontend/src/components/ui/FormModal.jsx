// src/components/ui/FormModal.jsx

import { X } from "lucide-react";

export default function FormModal({
  open,
  title,
  description = "",
  children,
  saveText = "Save",
  cancelText = "Cancel",
  loading = false,
  maxWidth = "max-w-2xl",
  onSave,
  onClose,
}) {
  if (!open) return null;

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
          className={`
            w-full
            ${maxWidth}
            rounded-3xl
            bg-white
            border
            shadow-[0_30px_80px_rgba(0,0,0,0.18)]
            animate-in
            zoom-in-95
            fade-in
            duration-200
          `}
        >

          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b">

            <div>

              <h2 className="text-2xl font-bold text-gray-900">
                {title}
              </h2>

              {description && (
                <p className="mt-2 text-gray-600">
                  {description}
                </p>
              )}

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
              <X size={22} />
            </button>

          </div>

          {/* Body */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer */}
          <div
            className="
              flex
              justify-end
              gap-3
              border-t
              px-6
              py-5
            "
          >

            <button
              onClick={onClose}
              disabled={loading}
              className="
                rounded-xl
                border
                border-gray-300
                px-5
                py-2.5
                font-medium
                text-gray-700
                hover:bg-gray-50
                disabled:opacity-50
              "
            >
              {cancelText}
            </button>

            <button
              onClick={onSave}
              disabled={loading}
              className="
                rounded-xl
                bg-indigo-600
                px-5
                py-2.5
                font-medium
                text-white
                hover:bg-indigo-700
                disabled:opacity-50
              "
            >
              {loading ? "Saving..." : saveText}
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}