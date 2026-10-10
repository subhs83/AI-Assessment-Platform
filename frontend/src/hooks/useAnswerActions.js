import { useExamStore } from "../store/examStore";
import { examApi } from "../api/examApi";

export function useAnswerActions(schoolSlug, attemptId) {
  const setAnswer = useExamStore((state) => state.setAnswer);

  const saveAnswer = async (questionId, option, index) => {
    const questionKey = `${attemptId}_${index}`;
    const requestId = Symbol("answer-save");

    useExamStore.setState({
      saving: true,
      saveStatus: "saving",
      saveStatusQuestionKey: questionKey,
      activeSaveRequestId: requestId,
    });

    setAnswer(index, option, attemptId);

    const isLatestRequest = () =>
      useExamStore.getState().activeSaveRequestId === requestId;

    try {
      await examApi.saveAnswer(schoolSlug, attemptId, {
        question_id: questionId,
        selected_option: option,
      });

      if (isLatestRequest()) {
        useExamStore.setState({ saveStatus: "saved" });
      }
    } catch (err) {
      if (isLatestRequest()) {
        useExamStore.setState({ saveStatus: "error" });
      }

      console.error(err.response?.data || err.message);
    } finally {
      if (isLatestRequest()) {
        useExamStore.setState({
          saving: false,
          activeSaveRequestId: null,
        });
      }
    }
  };

  return { saveAnswer };
}