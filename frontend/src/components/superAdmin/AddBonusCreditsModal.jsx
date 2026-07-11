import { useEffect, useState } from "react";

export default function AddBonusCreditsModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}) {

  const [credits, setCredits] = useState(100);

  useEffect(() => {

    if (!open) return;

    setCredits(100);

  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {

    onSubmit({
      credits: Number(credits),
    });

  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

        <div className="border-b px-6 py-4">

          <h2 className="text-xl font-semibold">
            Add Bonus AI Credits
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Bonus credits are added immediately and do not affect the subscription plan.
          </p>

        </div>

        <div className="px-6 py-5">

          <label className="mb-2 block text-sm font-medium text-gray-600">
            Bonus Credits
          </label>

          <input
            type="number"
            min="1"
            value={credits}
            onChange={(e) =>
              setCredits(e.target.value)
            }
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-amber-500"
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
            className="rounded-lg bg-amber-500 px-5 py-2 text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {loading
              ? "Updating..."
              : "Add Credits"}
          </button>

        </div>

      </div>

    </div>

  );

}