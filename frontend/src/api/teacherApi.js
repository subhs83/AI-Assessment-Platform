import API from "./client";

export const teacherApi = {
  // -------------------------
  // Dashboard
  // -------------------------
  getDashboard: (schoolSlug) =>
    API.get(`/api/teacher/${schoolSlug}/dashboard`),

  // -------------------------
  // Exams
  // -------------------------
  createExam: (schoolSlug, payload) =>
    API.post(`/api/teacher/${schoolSlug}/exams`, payload),

  deleteExam: (schoolSlug, examId) =>
    API.delete(`/api/teacher/${schoolSlug}/exams/${examId}`),

  publishExam: (schoolSlug, examId) =>
    API.post(`/api/teacher/${schoolSlug}/exams/${examId}/publish`),

  // -------------------------
  // Questions
  // -------------------------
  uploadQuestions: (schoolSlug, examId, formData) =>
    API.post(
      `/api/teacher/${schoolSlug}/exams/${examId}/questions/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    ),

  getQuestions: (schoolSlug, examId) =>
    API.get(`/api/teacher/${schoolSlug}/exams/${examId}/questions`),

  // -------------------------
  // Results
  // -------------------------
  getResults: (schoolSlug, examId) =>
    API.get(`/api/teacher/${schoolSlug}/exams/${examId}/results`),

  // -------------------------
  // Leaderboard
  // -------------------------
  getLeaderboard: (schoolSlug, examId) =>
    API.get(`/api/teacher/${schoolSlug}/exams/${examId}/leaderboard`),

  // -------------------------
  // Student Attempts (LIST)
  // -------------------------
  getStudentAttempts: (schoolSlug, examId, studentDbId) =>
    API.get(
      `/api/teacher/${schoolSlug}/exams/${examId}/students/${studentDbId}/attempts`
    ),

  // -------------------------
  // Attempt Detail (DEEP VIEW)
  // -------------------------
  getAttemptDetail: (schoolSlug, attemptId) =>
    API.get(`/api/teacher/${schoolSlug}/attempts/${attemptId}`),

}

