import { PlusCircle } from "lucide-react";

export default function AdditionalAttemptCard({
  totalGrantedAttempts = 0,
  grantHistory = [],  
  onGrant,
}) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>

          <h2 className="text-lg font-semibold">
            Additional Attempts
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Grant extra attempts to this student for the current exam.
          </p>

        </div>

        <div className="rounded-xl bg-indigo-50 px-4 py-3 text-center">

        <p className="text-xs text-gray-500">
          Total Granted
        </p>

        <p className="mt-1 text-2xl font-bold text-indigo-600">
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
      {grantHistory.length > 0 && (
        <div className="mt-5 border-t pt-4">

          <p className="mb-3 text-sm font-semibold text-gray-700">
            Grant History
          </p>

          <div className="space-y-2">

            {grantHistory.map((grant) => (
              <div
                key={grant.id}
                className="rounded-lg bg-gray-50 px-3 py-2 text-sm"
              >
                <div className="font-medium text-gray-800">
                  +{grant.attempts_granted || 1} Attempt
                </div>

                <div className="text-xs text-gray-500">
                  {grant.reason || "No reason provided"}
                </div>
              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}