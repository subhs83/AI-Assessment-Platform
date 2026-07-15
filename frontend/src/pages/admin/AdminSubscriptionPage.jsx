import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { useAdminStore } from "../../store/adminStore";

import PageHeader from "../../components/ui/PageHeader";
import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";

import CurrentPlanCard from "../../components/subscription/CurrentPlanCard";
import AICreditCard from "../../components/subscription/AICreditCard";
import PlanLimitsCard from "../../components/subscription/PlanLimitsCard";
import UpgradeInfoCard from "../../components/subscription/UpgradeInfoCard";
import ResourceUsageCard from "../../components/subscription/ResourceUsageCard";

export default function SubscriptionPage() {
    const { schoolSlug } = useParams();

    const {
        subscription,
        subscriptionLoading,
        subscriptionError,
        fetchSubscription,
    } = useAdminStore();

    useEffect(() => {
        fetchSubscription(schoolSlug);
    }, [schoolSlug]);

    if (subscriptionLoading && !subscription) {
        return <SkeletonCard />;
    }

    if (subscriptionError && !subscription) {
        return (
            <ErrorState
                message={subscriptionError}
                onRetry={() => fetchSubscription(schoolSlug)}
            />
        );
    }

    if (!subscription) {
        return null;
    }

    return (
        <div className="space-y-4">
            <PageHeader
                title="Subscription"
                description="View your school's subscription plan, AI credits, usage and limits."
                
            />

            <div className="grid gap-6 lg:grid-cols-2">

            <CurrentPlanCard
                subscription={subscription}
            />

            <AICreditCard
                usage={subscription.usage}
            />

            <ResourceUsageCard
                resources={subscription.resources}
            />

            <PlanLimitsCard
                limits={subscription.limits}
            />

        </div>

        <UpgradeInfoCard
            description="Need additional AI credits, more students, or higher subscription limits? Contact the IndiaEduCore team to upgrade your school's subscription plan."
            buttonText="Upgrade Coming Soon"
        />
        </div>
    );
}