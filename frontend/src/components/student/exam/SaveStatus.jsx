import { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SaveStatus({ status }) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState("idle");

  useEffect(() => {
    if (!status) return;

    setCurrent(status);
    setVisible(true);

    if (status === "saving") return;

    const t = setTimeout(() => {
      setVisible(false);
    }, 1400);

    return () => clearTimeout(t);
  }, [status]);

  if (!visible) return null;

  return (
    <div
      className="
        flex items-center gap-2
        rounded-full
        border
        bg-white/95
        backdrop-blur-md
        px-3 py-2
        shadow-lg
        transition-all
      "
    >
      {current === "saving" && (
        <>
          <Loader2
            size={20}
            className="animate-spin text-indigo-700"
          />

          <span className="text-xs font-medium text-slate-700">
            Saving...
          </span>
        </>
      )}

      {current === "saved" && (
        <>
          <CheckCircle2
            size={20}
            className="text-emerald-700"
          />

          <span className="text-xs font-medium text-slate-700">
            Saved
          </span>
        </>
      )}

      {current === "error" && (
        <>
          <AlertCircle
            size={20}
            className="text-red-700"
          />

          <span className="text-xs font-medium text-slate-700">
            Save failed
          </span>
        </>
      )}
    </div>
  );
}