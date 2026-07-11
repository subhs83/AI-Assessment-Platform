import { Calendar, FileQuestion, Gauge, Globe2 } from "lucide-react";

import { getSourceMeta } from "../../../utils/aiSource";
import HistoryCardActions from "./HistoryCardActions";

export default function HistoryCard({
  item,
  onView,
  onGenerateAgain,
}) {
  const source = getSourceMeta(item.source_type);
  const SourceIcon = source.icon;
  const language =  item.language ||  item.document_language ||  null;

  return (
    <div className="bg-white border rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col gap-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

          <div className="flex items-center gap-3">

            <div
              className={`p-2 rounded-lg ${source.badge}`}
            >
              <SourceIcon size={18} />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <span className="text-xs font-medium uppercase">
                  {source.label}
                </span>

                <span
                  className={`text-xs px-2 py-1 rounded-full
                    ${
                      item.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >
                  {item.status}
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* Title */}
        <div>

          <h2 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-2">
            {item.topic || "Untitled"}
          </h2>

        </div>


        {/* Metadata */}
        <div className="flex flex-wrap gap-3 text-xs">

          <span
            className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"
          >
            <Gauge size={14}/>
            {item.difficulty
              ? item.difficulty.charAt(0).toUpperCase() +
                item.difficulty.slice(1)
              : "N/A"}
          </span>


          <span
            className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"
          >
            <FileQuestion size={14}/>
            {item.question_count} Questions
          </span>

          {language && (
            <span
              className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"
            >
              <Globe2 size={14}/>
              {language}
            </span>
          )}


          <span
            className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"
          >
            <Calendar size={14}/>
            {new Date(item.created_at).toLocaleDateString()}
          </span>


        </div>


        {/* Actions */}
        <HistoryCardActions
          item={item}
          onView={onView}
          onGenerateAgain={onGenerateAgain}
        />

      </div>

    </div>
  );
}