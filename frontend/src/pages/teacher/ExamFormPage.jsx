import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import { useTeacherStore } from "../../store/teacherStore";
import { teacherRoutes } from "../../routes/teacherRoutes";

import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

import ExamRegistrationMode from "../../components/teacher/exams/ExamRegistrationMode";
import ExamBasicInfo from "../../components/teacher/exams/ExamBasicInfo";
import ExamTargetSelector from "../../components/teacher/exams/ExamTargetSelector";
import ExamSettings from "../../components/teacher/exams/ExamSettings";
import ExamSchedule from "../../components/teacher/exams/ExamSchedule";
import ExamOptions from "../../components/teacher/exams/ExamOptions";

const INITIAL_FORM = {
    title: "",
    targets: [],
    duration_minutes: 30,
    marks: 1,
    negative: 0,
    max_attempts: 1,
    registration_mode: "open",
    show_result_review: true,
    start_date: "",
    end_date: "",
};


export default function ExamFormPage() {

  const { showToast } = useToast();

  const navigate = useNavigate();

  const { schoolSlug, examUid } = useParams();

  const routes = teacherRoutes(schoolSlug);

  //const { fetchExam, updateExam,} = useTeacherStore();

  const createExam = useTeacherStore(
    (s) => s.createExam
  );
  const fetchExam = useTeacherStore(
    (s) => s.fetchExam
  );

  const updateExam = useTeacherStore(
    (s) => s.updateExam
  );

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);

   const isEdit = Boolean(examUid);

  


  const loadExam = useCallback(async () => {
    try {
      setLoading(true);

      const exam = await fetchExam(
        schoolSlug,
        examUid
      );

      if (!exam) {
        showToast("Exam not found.", "error");
        navigate(routes.exams.list);
        return;
      }

      setForm(exam);

    } catch (err) {

      console.error(err);

      showToast(
        "Failed to load exam.",
        "error"
      );

      navigate(routes.exams.list);

    } finally {
      setLoading(false);
    }

  }, [
    schoolSlug,
    examUid,
    fetchExam,
    navigate,
    routes.exams.list,
    showToast,
  ]);

  useEffect(() => {

      if (!isEdit) return;

      loadExam();

  }, [loadExam,isEdit]);

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

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

      if (isEdit) {

      await updateExam(
          schoolSlug,
          examUid,
          form
      );

  } else {

      await createExam(
          schoolSlug,
          form
      );

  }

      showToast(
          isEdit
              ? "Exam updated successfully."
              : "Exam created successfully.",
          "success"
      );

      navigate(routes.exams.list);

    } catch (err) {

      console.error(err);

      showToast(
        err.response?.data?.message ||
        isEdit
    ? "Failed to update exam"
    : "Failed to create exam"
      );

    } finally {

      setLoading(false);

    }

  };

 
  return (

    <div className="max-w-4xl mx-auto">

      <div className="bg-white rounded-lg border shadow-sm p-6">

        <PageHeader
            title={
                isEdit
                    ? "Edit Exam"
                    : "Create Exam"
            }
            description={
                isEdit
                    ? "Update your draft exam."
                    : "Configure exam settings before publishing."
            }
        />

        <form
          onSubmit={handleSubmit}
          className="space-y-6 mt-2"
        >

          <ExamRegistrationMode
            value={form.registration_mode}
            onChange={handleChange}
          />

          <ExamBasicInfo
            form={form}
            handleChange={handleChange}
          >

            <ExamTargetSelector
              schoolSlug={schoolSlug}
              form={form}
              setForm={setForm}
            />

          </ExamBasicInfo>

          <ExamSettings
            form={form}
            handleChange={handleChange}
          />

          <ExamSchedule
            form={form}
            handleChange={handleChange}
          />

          <ExamOptions
            form={form}
            handleChange={handleChange}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              {loading
                  ? (
                      isEdit
                          ? "Updating..."
                          : "Creating..."
                  )
                  : (
                      isEdit
                          ? "Update Exam"
                          : "Create Exam"
                  )}
            </Button>

          </div>

        </form>

      </div>

    </div>

  );

}