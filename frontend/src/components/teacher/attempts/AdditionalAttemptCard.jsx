import { PlusCircle } from "lucide-react";

export default function AdditionalAttemptCard({
  totalGrantedAttempts = 0,
  onGrant,
}) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

        <div>

          <h2 className="text-lg font-semibold">
            Additional Attempts
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Grant extra attempts to this student for the current exam.
          </p>

        </div>

        <div className="text-center">

          <p className="text-xs text-gray-500">
            Total Granted
          </p>

          <p className="text-3xl font-bold text-indigo-600">
            {totalGrantedAttempts}
          </p>

        </div>

      </div>

      <div className="mt-5 pt-5 border-t flex justify-end">

        <button
          onClick={onGrant}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusCircle size={18} />

          Grant Additional Attempt
        </button>

      </div>

    </div>
  );
}