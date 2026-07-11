import { useEffect, useState } from "react";

import {
  SUBSCRIPTION_PLANS,
  BILLING_CYCLES,
} from "../../constants/subscription";

export default function ChangeSubscriptionPlanModal({
  open,
  onClose,
  onSubmit,
  currentPlan,
  loading = false,
}) {
  const [planCode, setPlanCode] = useState("TRIAL");

  const [billingCycle, setBillingCycle] = useState("MONTHLY");

  const [durationDays, setDurationDays] = useState(30);

  useEffect(() => {
    if (!open) return;

    setPlanCode(
      currentPlan?.plan_code || "TRIAL"
    );

    setBillingCycle("MONTHLY");

    setDurationDays(30);

  }, [open, currentPlan]);

  if (!open) return null;

  const handleSubmit = () => {

    onSubmit({
      plan_code: planCode,
      billing_cycle: billingCycle,
      duration_days: Number(durationDays),
    });

  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

        {/* Header */}

        <div className="border-b px-6 py-4">

          <h2 className="text-xl font-semibold">
            Change Subscription Plan
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select a new subscription plan and billing cycle.
          </p>

        </div>

        {/* Body */}

        <div className="space-y-5 px-6 py-5">

          {/* Current Plan */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-600">
              Current Plan
            </label>

            <div className="rounded-lg border bg-gray-50 px-3 py-2 font-medium">

              {currentPlan?.name || "-"}

            </div>

          </div>

          {/* Plan */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-600">
              Subscription Plan
            </label>

            <select
              value={planCode}
              onChange={(e) =>
                setPlanCode(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-500"
            >

              {SUBSCRIPTION_PLANS.map((plan) => (

                <option
                  key={plan.value}
                  value={plan.value}
                >
                  {plan.label}
                </option>

              ))}

            </select>

          </div>

          {/* Billing */}

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-600">
              Billing Cycle
            </label>

            <div className="flex gap-6">

              {BILLING_CYCLES.map((cycle) => (

                <label
                  key={cycle.value}
                  className="flex items-center gap-2"
                >

                  <input
                    type="radio"
                    value={cycle.value}
                    checked={
                      billingCycle === cycle.value
                    }
                    onChange={(e) =>
                      setBillingCycle(
                        e.target.value
                      )
                    }
                  />

                  <span>{cycle.label}</span>

                </label>

              ))}

            </div>

          </div>

          {/* Duration */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-600">
              Subscription Duration (Days)
            </label>

            <input
              type="number"
              min="1"
              value={durationDays}
              onChange={(e) =>
                setDurationDays(
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-indigo-500"
            />

          </div>

        </div>

        {/* Footer */}

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
            className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading
              ? "Updating..."
              : "Update Plan"}
          </button>

        </div>

      </div>

    </div>

  );

}