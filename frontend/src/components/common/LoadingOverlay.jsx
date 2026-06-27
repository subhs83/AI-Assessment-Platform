// src/components/ui/LoadingOverlay.jsx

import { Loader2 } from "lucide-react";

export default function LoadingOverlay({
  message = "Processing...",
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm flex items-center justify-center">

      <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-4">

        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

        <p className="text-sm font-medium text-gray-700">
          {message}
        </p>

      </div>

    </div>
  );
}