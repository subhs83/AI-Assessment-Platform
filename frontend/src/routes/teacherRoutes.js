export const teacherRoutes = (schoolSlug) => ({
  dashboard: `/school/${schoolSlug}/teacher`,

  exams: {
    list: `/school/${schoolSlug}/teacher/exams`,
    create: `/school/${schoolSlug}/teacher/exams/create`,

    questions: (examId) =>
      `/school/${schoolSlug}/teacher/exams/${examId}/questions`,

    upload: (examId) =>
      `/school/${schoolSlug}/teacher/exams/${examId}/questions/upload`,

    results: (examId) =>
      `/school/${schoolSlug}/teacher/exams/${examId}/results`,

    leaderboard: (examId) =>
      `/school/${schoolSlug}/teacher/exams/${examId}/leaderboard`,

    studentAttempts: (examId, studentDbId) =>
      `/school/${schoolSlug}/teacher/exams/${examId}/students/${studentDbId}/attempts`,
  },

  ai: {
    generate: `/school/${schoolSlug}/teacher/ai/generate`,
    history: `/school/${schoolSlug}/teacher/ai/history`,

    preview: (requestId) =>
      `/school/${schoolSlug}/teacher/ai/preview/${requestId}`,
  },

  questions: {
    upload: `/school/${schoolSlug}/teacher/questions/upload`,
  },
  
  attemptDetail: (attemptId) =>
    `/school/${schoolSlug}/teacher/attempts/${attemptId}`,
});