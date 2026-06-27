import {
History,
FileText,
RefreshCw,
Eye
} from "lucide-react";

export default function AIHistoryPreview() {
const items = [
{
topic: "Photosynthesis",
source: "PDF",
difficulty: "Medium",
count: 20,
},
{
topic: "Cell Structure",
source: "Image",
difficulty: "Easy",
count: 15,
},

];

return ( <div
   className="
     bg-white
     rounded-3xl
     border
     shadow-lg
     overflow-hidden
     hover:shadow-2xl
    transition-all
    duration-300
   "
 >

  {/* Header */}

  <div className="border-b px-6 py-5">

    <div className="flex items-center justify-between">

      <div>

        <h3 className="font-bold text-xl text-gray-900">
          AI Question History
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Reuse previously generated question sets
        </p>

      </div>

      <History className="text-blue-600" />

    </div>

  </div>

  <div className="p-6 space-y-4">

    {items.map((item) => (
      <div
        key={item.topic}
        className="
          border
          rounded-2xl
          p-4
          hover:bg-gray-50
          transition
        "
      >

        <div className="flex items-start justify-between">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <div
                className="
                  px-2 py-1
                  rounded-full
                  bg-blue-50
                  text-blue-700
                  text-xs
                "
              >
                {item.source}
              </div>

              <div
                className="
                  px-2 py-1
                  rounded-full
                  bg-green-50
                  text-green-700
                  text-xs
                "
              >
                Completed
              </div>

            </div>

            <h4 className="font-semibold text-gray-900">
              {item.topic}
            </h4>

            <div className="text-sm text-gray-500 mt-2">
              {item.difficulty} • {item.count} Questions
            </div>

          </div>

          <FileText
            size={20}
            className="text-gray-400"
          />

        </div>

        <div className="flex gap-3 mt-4">

          <button
            className="
              flex-1
              bg-blue-50
              text-blue-700
              rounded-xl
              py-2
              font-medium
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <Eye size={16} />
            View
          </button>

          <button
            className="
              flex-1
              bg-green-50
              text-green-700
              rounded-xl
              py-2
              font-medium
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <RefreshCw size={16} />
            Generate Again
          </button>

        </div>

      </div>
    ))}

  </div>

</div>
);
}
