import API from "../api/client";
import { useToast } from "../components/ui/Toast";

export function useExamActions() {
 const { showToast } = useToast();
  const publishExam = async (schoolSlug, examId, refresh) => {
    try {
      const res = await API.post(
        `/api/teacher/${schoolSlug}/exams/${examId}/publish`
      );

      if (res.data.success) {
        showToast("Exam published successfully", "success");
        refresh();
      } else {
        showToast(res.data.message || "Publish failed", "error");
      }

    } catch (err) {
      showToast(
        err?.response?.data?.message || "Error publishing exam",
        "error"
      );
      
    }
  };

  const deleteExam = async ( schoolSlug, examId, refresh) => {
  try {

    const res = await API.delete(
      `/api/teacher/${schoolSlug}/exams/${examId}`
    );

    if (res.data.success) {

      showToast(
        "Exam deleted",
        "success"
      );

      refresh();

    } else {

      showToast(
        res.data.message ||
        "Delete failed",
        "error"
      );

    }

  } catch (err) {

    showToast(
      err?.response?.data?.message ||
      "Error deleting exam",
      "error"
    );

  }
};

  return {
    publishExam,
    deleteExam,
  };
}