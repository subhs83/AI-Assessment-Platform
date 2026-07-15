    import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";

import { useAdminStore } from "../../store/adminStore";

import SkeletonCard from "../../components/ui/SkeletonCard";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader"
import ExamPerformanceFilters from "../../components/admin/performance/ExamPerformanceFilters";
import ExamPerformanceTable from "../../components/admin/performance/ExamPerformanceTable";

import { BarChart3} from "lucide-react";

export default function ExamPerformancePage() {

  const { schoolSlug } = useParams();
  const [search, setSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const {
    examPerformance,
    examPerformanceLoading,
    examPerformanceError,
    getExamPerformance,
  } = useAdminStore();

  
  useEffect(() => {
    getExamPerformance(schoolSlug);
  }, [schoolSlug, getExamPerformance]);

const exams = examPerformance || [];

const teachers = [
  ...new Set(
    exams.map(
      (exam) => exam.teacher_name
    )
  ),
];

const classes = [
  ...new Set(
    exams.map((exam) => 
      exam.class_section).filter(Boolean)
  ),
];

const filteredExams = exams.filter((exam) => {

  const matchesSearch =
    exam.exam_title
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    exam.teacher_name
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    (exam.class_section || "")
      .toLowerCase()
      .includes(search.toLowerCase());

  const matchesTeacher =
    teacherFilter === "all" ||
    exam.teacher_name === teacherFilter;

  const matchesClass =
    classFilter === "all" ||
    exam.class_section === classFilter;

  return (
    matchesSearch &&
    matchesTeacher &&
    matchesClass
  );
});



  if (examPerformanceLoading) {
    return <SkeletonCard />;
  }

  if (examPerformanceError) {
    return <ErrorState message={examPerformanceError} />;
  }

  if (!exams.length) {
    return (
      <EmptyState
        title="No exams found"
        message="No exam performance data is available."
      />
    );
  }



  return (
  <div className="space-y-6">

    {/* Header */}
    <PageHeader
      title="Exam Performance"
      description="Monitor overall exam performance across the school."
      icon={BarChart3}
      iconColor="text-indigo-600"
      iconBackground="bg-indigo-100"
  />

      {/* Filters */}
    <ExamPerformanceFilters
      search={search}
      setSearch={setSearch}
      teacherFilter={teacherFilter}
      setTeacherFilter={setTeacherFilter}
      classFilter={classFilter}
      setClassFilter={setClassFilter}
      teachers={teachers}
      classes={classes}
    />

    {/* Table */}
    <ExamPerformanceTable
      schoolSlug={schoolSlug}
      exams={filteredExams}
  />

  </div>
);
}