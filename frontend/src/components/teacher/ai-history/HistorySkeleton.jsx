export default function HistorySkeleton() {
  return (
    <div className="space-y-4">

      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="bg-white border rounded-xl p-5 shadow-sm animate-pulse"
        >

          <div className="flex flex-col gap-5">

            {/* Header */}
            <div className="flex justify-between">

              <div className="flex items-center gap-3">

                <div className="h-10 w-10 bg-gray-200 rounded-lg" />

                <div className="space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-28 bg-gray-200 rounded" />
                </div>

              </div>

            </div>


            {/* Title */}
            <div className="space-y-2">

              <div className="h-5 w-3/4 bg-gray-200 rounded" />

              <div className="h-4 w-1/2 bg-gray-200 rounded" />

            </div>


            {/* Metadata */}
            <div className="flex gap-3">

              <div className="h-6 w-20 bg-gray-200 rounded-full" />

              <div className="h-6 w-28 bg-gray-200 rounded-full" />

              <div className="h-6 w-24 bg-gray-200 rounded-full" />

            </div>


            {/* Buttons */}
            <div className="flex justify-end gap-2">

              <div className="h-9 w-32 bg-gray-200 rounded-lg" />

              <div className="h-9 w-32 bg-gray-200 rounded-lg" />

            </div>


          </div>

        </div>
      ))}

    </div>
  );
}