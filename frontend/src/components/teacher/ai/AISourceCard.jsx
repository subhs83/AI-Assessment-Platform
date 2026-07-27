import {
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AISourceCard({
  data,
  showSource,
  setShowSource,
}) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:rounded-xl">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <FileText size={18} />

          <h2 className="font-semibold">
            Source Content
          </h2>

        </div>

        {data.source_type !== "topic" && (

          <button
            onClick={() =>
              setShowSource(!showSource)
            }
            className="flex items-center gap-1 text-sm font-medium text-blue-600"
          >

            {showSource ? (
              <>
                <ChevronUp size={16} />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Expand
              </>
            )}

          </button>

        )}

      </div>

      {!showSource && (

        <p className="mt-3 line-clamp-1 text-sm text-slate-700">
          <b>Topic:</b>{" "}
          {data.source_text || "N/A"}
        </p>

      )}

      {showSource && (

        <div
          className="
            mt-3
            max-h-64
            overflow-y-auto
            rounded-lg
            border-t
            bg-white
            p-3
            pt-3
            whitespace-pre-wrap
            text-sm
            text-gray-600
          "
        >
          <b>Topic:</b>{" "}
          {data.source_text || "N/A"}
        </div>

      )}

    </div>
  );
}