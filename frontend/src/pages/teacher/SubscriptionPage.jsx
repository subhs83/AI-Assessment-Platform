import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { useTeacherStore } from "../../store/teacherStore";

import PageHeader from "../../components/ui/PageHeader";
import BackButton from "../../components/ui/BackButton";
import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";

import CurrentPlanCard from "../../components/subscription/CurrentPlanCard";
import AICreditCard from "../../components/subscription/AICreditCard";
import PlanLimitsCard from "../../components/subscription/PlanLimitsCard";
import UpgradeInfoCard from "../../components/subscription/UpgradeInfoCard";

export default function SubscriptionPage() {

    const { schoolSlug } = useParams();

    const {
        subscription,
        loading,
        error,
        fetchSubscription,
    } = useTeacherStore();



    useEffect(() => {
        fetchSubscription(schoolSlug);
    }, [schoolSlug]);

    

    if (loading && !subscription) {
        return <SkeletonCard />;
    }

    if (error && !subscription) {
        return (
            <ErrorState
                message={error}
                onRetry={() => fetchSubscription(schoolSlug)}
            />
        );
    }

    if (!subscription) {
        return null;
    }

    return (
        <div className="space-y-6">

            <PageHeader
                title="Subscription"
                description="View your subscription plan, AI credits and usage."
                actions={
                        <BackButton to={-1} label="Back" />
                      }
            />

            <div className="grid gap-6 lg:grid-cols-2">

               <CurrentPlanCard
                    subscription={subscription}
                />

                <AICreditCard
                    usage={subscription.usage}
                />

            </div>

            <PlanLimitsCard
                limits={subscription.limits}
            />

            <UpgradeInfoCard />

        </div>
    );
}