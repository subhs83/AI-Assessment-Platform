import { useEffect, useState } from "react";

export default function ExtendSubscriptionModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}) {

  const [durationDays, setDurationDays] = useState(30);

  useEffect(() => {

    if (!open) return;

    setDurationDays(30);

  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {

    onSubmit({
      duration_days: Number(durationDays),
    });

  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

        <div className="border-b px-6 py-4">

          <h2 className="text-xl font-semibold">
            Extend Subscription
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Extend the current subscription.
          </p>

        </div>

        <div className="px-6 py-5">

          <label className="mb-2 block text-sm font-medium text-gray-600">
            Extension (Days)
          </label>

          <input
            type="number"
            min="1"
            value={durationDays}
            onChange={(e) =>
              setDurationDays(e.target.value)
            }
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500"
          />

        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border px-5 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading
              ? "Updating..."
              : "Extend"}
          </button>

        </div>

      </div>

    </div>

  );

}