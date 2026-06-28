import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTeacherStore } from "../../store/teacherStore";
import { teacherRoutes } from "../../routes/teacherRoutes";
import EmptyState from "../../components/ui/EmptyState";
import ExamCard from "../../components/teacher/exams/ExamCard";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { PlusCircle } from "lucide-react";


export default function ExamsPage() {
  const { schoolSlug } = useParams();
  const routes = teacherRoutes(schoolSlug);
  const navigate = useNavigate();

  const { dashboard, fetchDashboard } = useTeacherStore();

  const exams = dashboard?.exams || [];

  useEffect(() => {
    fetchDashboard(schoolSlug);
  }, [schoolSlug, fetchDashboard]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <PageHeader
        title="Manage Exams"
        description="View and manage all exams"
        actions={
          <Button
            variant="primary"
            onClick={() => navigate(routes.exams.create)}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Create Exam
          </Button>
        }
      />

      {/* Empty */}
      {exams.length === 0 ? (
        <EmptyState
          title="No exams found"
          description="Create your first exam to get started."
        />
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              schoolSlug={schoolSlug}
              refresh={() => fetchDashboard(schoolSlug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}