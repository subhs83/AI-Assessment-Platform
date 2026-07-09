import { useState, useEffect } from "react";

export default function GrantAttemptModal({
  open,
  loading = false,
  onClose,
  onSubmit,
}) {
  const [grantedAttempts, setGrantedAttempts] = useState(1);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setGrantedAttempts(1);
      setReason("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit({
      granted_attempts: grantedAttempts,
      reason,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">

        <h2 className="text-xl font-semibold">
          Grant Additional Attempt
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Allow this student to attempt the exam again.
        </p>

        <div className="mt-5">

          <label className="block text-sm font-medium mb-2">
            Additional Attempts
          </label>

          <input
            type="number"
            min={1}
            value={grantedAttempts}
            onChange={(e) =>
              setGrantedAttempts(Number(e.target.value))
            }
            className="w-full border rounded-lg px-3 py-2"
          />

        </div>

        <div className="mt-4">

          <label className="block text-sm font-medium mb-2">
            Reason
          </label>

          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

        </div>

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            {loading ? "Granting..." : "Grant"}
          </button>

        </div>

      </div>

    </div>
  );
}