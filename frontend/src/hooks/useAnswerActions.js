import { useExamStore } from "../store/examStore";
import { examApi } from "../api/examApi";

export function useAnswerActions(schoolSlug, attemptId) {
  const setAnswer = useExamStore((state) => state.setAnswer);
  const setSaving = useExamStore((state) => state.setSaving);
  const setSaveStatus = useExamStore((state) => state.setSaveStatus);

  const saveAnswer = async (questionId, option, index) => {
    // 🔥 instantly reset UI (prevents old state sticking)
    setSaving(true);
    setSaveStatus("saving");

    // optimistic UI update
    setAnswer(index, option, attemptId);

    try {
      await examApi.saveAnswer(schoolSlug, attemptId, {
        question_id: questionId,
        selected_option: option,
      });

      setSaveStatus("saved"); // ✅ clean state
    } catch (err) {
      setSaveStatus("error");
      console.log(err.response?.data || err.message);
    } finally {
      setSaving(false);
    }
  };

  return { saveAnswer };
}