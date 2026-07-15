import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { teacherRoutes } from "../../routes/teacherRoutes";
import { shareLink } from "../../utils/share";

import { useTeacherStore } from "../../store/teacherStore";

import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

import SubscriptionCard from "../../components/teacher/dashboard/SubscriptionCard";
import DashboardStats from "../../components/teacher/dashboard/DashboardStats";
import RecentExamsCard from "../../components/teacher/dashboard/RecentExamsCard";

import { PlusCircle } from "lucide-react";

export default function DashboardPage() {

  const { schoolSlug } = useParams();

  const navigate = useNavigate();

  const routes = teacherRoutes(schoolSlug);

  const { showToast } = useToast();

  const {
    dashboard,
    loading,
    error,
    fetchDashboard,
  } = useTeacherStore();


  useEffect(() => {

    if (!dashboard) {
      fetchDashboard(schoolSlug);
    }

  }, [
    schoolSlug,
    dashboard,
    fetchDashboard,
  ]);


  const handleShareQuiz = (exam) =>
    shareLink({
      title: exam.title,
      text: "Join this quiz using the link below:",
      url: `${window.location.origin}/school/${schoolSlug}/quiz/${exam.quiz_code}`,
      showToast,
      successMessage: "Quiz link copied",
    });


  const exams = dashboard?.exams ?? [];

  const stats = dashboard?.stats ?? {
    total_exams: 0,
    total_attempts: 0,
    draft_exams: 0,
  };

  const subscription = dashboard?.subscription ?? {
    plan: "",
    status: "",
    remaining_ai_credits: 0,
    used_ai_credits: 0,
    total_ai_credits: 0,
    expires_at: null,
  };

  const teacher = dashboard?.teacher ?? {};

  const recentExams = exams.slice(0, 3);


  if (loading && !dashboard) {

    return (
      <div className="space-y-4">
        <SkeletonCard />
      </div>
    );

  }


  if (error && !dashboard) {

    return (
      <ErrorState
        message={error}
        onRetry={() => fetchDashboard(schoolSlug)}
      />
    );

  }


  return (

    <div className="space-y-6">

      <PageHeader
        title="Teacher Dashboard"
        description={`Welcome back, ${teacher.name}`}
        actions={
          <Button
            variant="primary"
            onClick={() => navigate(routes.exams.create)}
          >
            <PlusCircle size={16} />
            Create Exam
          </Button>
        }
      />

      <SubscriptionCard
        subscription={subscription}
        onViewSubscription={() =>
          navigate(routes.subscription)
        }
      />

      <DashboardStats
        stats={stats}
      />

      <RecentExamsCard
        recentExams={recentExams}
        routes={routes}
        handleShareQuiz={handleShareQuiz}
      />

    </div>

  );

}