import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTeacherStore } from "../../store/teacherStore";
import { teacherRoutes } from "../../routes/teacherRoutes";
import {
  Calendar,
  Clock,
  Percent,
  Repeat,
  X,
  ArrowLeft,
  Save,
  FileText,
  GraduationCap
} from "lucide-react";

 
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

export default function CreateExamPage() {
  const { showToast } = useToast(); 
  const navigate = useNavigate();
  const { schoolSlug } = useParams();
  const routes = teacherRoutes(schoolSlug);
  const createExam = useTeacherStore((s) => s.createExam);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
  title: "",
  class_name: "",
  duration_minutes: 30,
  marks: 1,
  negative: 0,
  max_attempts: 1,
  show_result_review: true,
  start_date: "",
  end_date: "",
});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createExam(
        schoolSlug,
        form
      );

      navigate(routes.exams.list);

    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to create exam", "error");
    
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">

      <div className="bg-white rounded-lg border shadow-sm p-6">

        {/* ================= HEADER ================= */}
        <PageHeader
          title="Create Exam"
          description="Configure exam settings before publishing"
        />

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
         <div className="grid md:grid-cols-2 gap-4">

          {/* ================= TITLE ================= */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
             <FileText size={14} />
                Exam Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. MathQuizChap 1"
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          {/* ================= CLASS ================= */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <GraduationCap size={14} />
              Class
            </label>

            <input
              name="class_name"
              value={form.class_name}
              onChange={handleChange}
              placeholder="e.g. 1 Rose, 3A"
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />

            <p className="mt-1 text-xs text-gray-500">
              Helps organize analytics and reports.
            </p>
          </div>
          </div>
          {/* ================= GRID SETTINGS ================= */}
          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Clock size={14} />
                Duration (minutes)
              </label>

              <input
                type="number"
                name="duration_minutes"
                value={form.duration_minutes}
                onChange={handleChange}
                min="1"
                required
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Percent size={14} />
                Marks Per Question
              </label>

              <input
                type="number"
                name="marks"
                value={form.marks}
                onChange={handleChange}
                min="1"
                step="0.5"
                required
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <X size={14} />
                Negative Marks
              </label>

              <input
                type="number"
                name="negative"
                value={form.negative}
                onChange={handleChange}
                min="0"
                step="0.25"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Repeat size={14} />
                Max Attempts
              </label>

              <input
                type="number"
                name="max_attempts"
                value={form.max_attempts}
                onChange={handleChange}
                min="1"
                required
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

          </div>

          {/* ================= DATES ================= */}
          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Calendar size={14} />
                Start Date
              </label>

              <input
                type="datetime-local"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Calendar size={14} />
                End Date
              </label>

              <input
                type="datetime-local"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

          </div>

          {/* ================= TOGGLE ================= */}
          <label className="flex items-center gap-3 text-sm">

            <input
              type="checkbox"
              name="show_result_review"
              checked={form.show_result_review}
              onChange={handleChange}
              className="w-4 h-4"
            />

            <span className="text-sm">
              Allow Detailed Result Review
            </span>

          </label>

          {/* ================= ACTIONS ================= */}
          <div className="flex justify-end gap-3 pt-4 border-t">

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
               className="flex items-center gap-2"
            >
              <ArrowLeft size={16} className="mr-2" />
              Cancel
            </Button>

            <Button type="submit" disabled={loading}  className="flex items-center gap-2">
              <Save size={16} className="mr-2" />
              {loading ? "Creating..." : "Create Exam"}
            </Button>

          </div>

        </form>

      </div>

    </div>
  );
}