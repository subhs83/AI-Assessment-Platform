import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import ChangeSubscriptionPlanModal from "../../components/superAdmin/ChangeSubscriptionPlanModal";
import ExtendSubscriptionModal from "../../components/superAdmin/ExtendSubscriptionModal";
import AddBonusCreditsModal from "../../components/superAdmin/AddBonusCreditsModal";
import ConfirmModal from "../../components/ui/ConfirmModal";

import { useToast } from "../../components/ui/Toast";

import { useSuperAdminStore } from "../../store/superAdminStore";

export default function SchoolSubscriptionPage() {

  const { schoolId } = useParams();
  const { showToast } = useToast();

  const [subscription, setSubscription] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showPlanModal, setShowPlanModal] =  useState(false);

  const [showExtendModal, setShowExtendModal] =  useState(false);

  const [showBonusModal, setShowBonusModal] =  useState(false);

  const [showStatusModal, setShowStatusModal] =  useState(false);

  const {
  getSchoolSubscription,
    changeSubscriptionPlan,
    extendSubscription,
    addBonusCredits,  
    updateSubscriptionStatus,
  } = useSuperAdminStore();

  

  const loadSubscription = useCallback(async () => {

    setLoading(true);

    setError("");

    try {

      const response = await getSchoolSubscription(schoolId);

      setSubscription( response.data );

    } catch (err) {

      setError(
        err.response?.data?.error ||
        "Failed to load subscription."
      );

    } finally {

      setLoading(false);

    }

  }, [schoolId, getSchoolSubscription]);

    useEffect(() => {

      loadSubscription();

    }, [loadSubscription]);

    

  const handleChangePlan = async (payload) => {

    try {

      await changeSubscriptionPlan(
        schoolId,
        payload
      );

      showToast(
        "Subscription updated successfully.",
        "success"
      );

      setShowPlanModal(false);

      await loadSubscription();

    } catch (err) {

      showToast(
        err.response?.data?.message ||
        "Failed to update subscription.",
        "error"
      );

    }

  };

  const handleExtendSubscription = async (
    payload
  ) => {

    try {

      await extendSubscription(
        schoolId,
        payload
      );

      showToast(
        "Subscription extended successfully.",
        "success"
      );

      setShowExtendModal(false);

      await loadSubscription();

    } catch (err) {

      showToast(
        err.response?.data?.message ||
        "Failed to extend subscription.",
        "error"
      );

    }

  };

  const handleBonusCredits = async (
    payload
  ) => {

    try {

      await addBonusCredits(
        schoolId,
        payload
      );

      showToast(
        "Bonus credits added successfully.",
        "success"
      );

      setShowBonusModal(false);

      await loadSubscription();

    } catch (err) {

      showToast(
        err.response?.data?.message ||
        "Failed to add bonus credits.",
        "error"
      );

    }

  };

  const handleSubscriptionStatus = async () => {

    try {

      const nextStatus =
        subscription.subscription.status === "SUSPENDED"
          ? "ACTIVE"
          : "SUSPENDED";

      await updateSubscriptionStatus(
        schoolId,
        {
          status: nextStatus,
        }
      );

      showToast(
        "Subscription status updated successfully.",
        "success"
      );

      setShowStatusModal(false);

      await loadSubscription();

    } catch (err) {

      showToast(
        err.response?.data?.message ||
        "Failed to update subscription status.",
        "error"
      );

    }

  };

  if (loading) {

    return (
      <div className="p-6">
        Loading subscription...
      </div>
    );

  }

  if (error) {

    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );

  }

  return (
  <div className="p-6 space-y-6">

    {/* Header */}
    <div className="flex items-center justify-between">

      <div>
        <h1 className="text-3xl font-bold">
          {subscription.school.name}
        </h1>

        <p className="text-gray-500 mt-1">
          Subscription & AI Usage Management
        </p>
      </div>

      <div className="text-right">

        <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
          {subscription.plan.name}
        </span>

        <p className="mt-2 text-sm text-gray-500">
          {subscription.subscription.billing_cycle}
        </p>

      </div>

    </div>

    {/* Top Cards */}

    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

      <div className="bg-white rounded-xl shadow p-5">

        <p className="text-gray-500 text-sm">
          Subscription Status
        </p>

        <h3 className="mt-2 text-2xl font-bold">
          {subscription.subscription.status}
        </h3>

      </div>

      <div className="bg-white rounded-xl shadow p-5">

        <p className="text-gray-500 text-sm">
          Total AI Credits
        </p>

        <h3 className="mt-2 text-2xl font-bold">
          {subscription.limits.monthly_ai_credits}
        </h3>

      </div>

      <div className="bg-white rounded-xl shadow p-5">

        <p className="text-gray-500 text-sm">
          Used Credits
        </p>

        <h3 className="mt-2 text-2xl font-bold">
          {subscription.usage.used_ai_credits}
        </h3>

      </div>

      <div className="bg-white rounded-xl shadow p-5">

        <p className="text-gray-500 text-sm">
          Remaining Credits
        </p>

        <h3 className="mt-2 text-2xl font-bold text-green-600">
          {subscription.usage.remaining_ai_credits}
        </h3>

      </div>

    </div>

    {/* Details */}

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Subscription */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-lg font-semibold mb-5">
          Subscription Details
        </h2>

        <div className="space-y-4">

          <div className="flex justify-between">

            <span className="text-gray-500">
              Plan
            </span>

            <span className="font-medium">
              {subscription.plan.name}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-gray-500">
              Status
            </span>

            <span className="font-medium">
              {subscription.subscription.status}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-gray-500">
              Billing Cycle
            </span>

            <span className="font-medium">
              {subscription.subscription.billing_cycle}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-gray-500">
              Starts On
            </span>

            <span className="font-medium">
              {new Date(
                subscription.subscription.starts_at
              ).toLocaleDateString()}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-gray-500">
              Expires On
            </span>

            <span className="font-medium">
              {new Date(
                subscription.subscription.expires_at
              ).toLocaleDateString()}
            </span>

          </div>

        </div>

      </div>

      {/* Limits */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-lg font-semibold mb-5">
          Plan Limits
        </h2>

        <div className="space-y-4">

          <div className="flex justify-between">

            <span className="text-gray-500">
              Max Students
            </span>

            <span className="font-medium">
              {subscription.limits.max_students}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-gray-500">
              Max Teachers
            </span>

            <span className="font-medium">
              {subscription.limits.max_teachers}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-gray-500">
              Monthly Credits
            </span>

            <span className="font-medium">
              {subscription.limits.monthly_ai_credits}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-gray-500">
              Bonus Credits
            </span>

            <span className="font-medium">
              {subscription.usage.bonus_ai_credits}
            </span>

          </div>

        </div>

      </div>

    </div>

    {/* Actions */}

    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-lg font-semibold mb-5">
        Subscription Actions
      </h2>

      <div className="flex flex-wrap gap-3">

        <button
          onClick={() =>
            setShowPlanModal(true)
          }
          className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Change Plan
        </button>

        <button
        onClick={() => setShowExtendModal(true) }
         className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
          Extend Subscription
        </button>

        <button
          onClick={() =>  setShowBonusModal(true)}
          className="px-5 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
        >
          Add Bonus Credits
        </button>

        <button
          onClick={() =>
            setShowStatusModal(true)
          }
          className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >

          {subscription.subscription.status === "ACTIVE"
            ? "Suspend Subscription"
            : "Activate Subscription"}

        </button>

      </div>

    </div>

    <ChangeSubscriptionPlanModal
        open={showPlanModal}
        onClose={() =>
          setShowPlanModal(false)
        }
        onSubmit={handleChangePlan}
        currentPlan={subscription.plan}
      />
      <ExtendSubscriptionModal
        open={showExtendModal}
        onClose={() =>
          setShowExtendModal(false)
        }
        onSubmit={handleExtendSubscription}
      />

      <AddBonusCreditsModal
        open={showBonusModal}
        onClose={() =>
          setShowBonusModal(false)
        }
        onSubmit={handleBonusCredits}
      />

      <ConfirmModal
        open={showStatusModal}
        title={
          subscription.subscription.status === "SUSPENDED"
            ? "Activate Subscription"
            : "Suspend Subscription"
        }
        description={
          subscription.subscription.status === "SUSPENDED"
            ? "This school will regain access to all subscription features."
            : "The school will lose access to all subscription features until reactivated."
        }
        confirmText={
          subscription.subscription.status === "SUSPENDED"
            ? "Activate"
            : "Suspend"
        }
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleSubscriptionStatus}
        onClose={() =>
          setShowStatusModal(false)
        }
      />

  </div>
  
);

}