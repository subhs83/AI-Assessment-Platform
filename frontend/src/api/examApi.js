import API from "./client";

export const examApi = {
  getQuestion: (schoolSlug, attemptId, index) =>
    API.get(
      `/api/student/${schoolSlug}/attempt/${attemptId}/question/${index}`
    ),

  saveAnswer: (schoolSlug, attemptId, payload) =>
    API.post(
      `/api/student/${schoolSlug}/attempt/${attemptId}/answer`,
      payload
    ),

  submitExam: (schoolSlug, attemptId) =>
    API.post(
      `/api/student/${schoolSlug}/attempt/${attemptId}/submit`
    ),

  reportViolation: (schoolSlug, attemptId, reason) =>
    API.post(
      `/api/student/${schoolSlug}/attempt/${attemptId}/violation`,
      { reason }
    ),
 
};