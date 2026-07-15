export const teacherRoutes = (schoolSlug) => ({
  dashboard: `/school/${schoolSlug}/teacher`,

  exams: {
    list: `/school/${schoolSlug}/teacher/exams`,
    create: `/school/${schoolSlug}/teacher/exams/create`,

    edit: (examUid) =>
    `/school/${schoolSlug}/teacher/exams/${examUid}/edit`,

    questions: (examUid) =>
      `/school/${schoolSlug}/teacher/exams/${examUid}/questions`,

    upload: (examUid) =>
      `/school/${schoolSlug}/teacher/exams/${examUid}/questions/upload`,

    results: (examUid) =>
      `/school/${schoolSlug}/teacher/exams/${examUid}/results`,

    leaderboard: (examUid) =>
      `/school/${schoolSlug}/teacher/exams/${examUid}/leaderboard`,

    studentAttempts: (examUid, studentDbId) =>
      `/school/${schoolSlug}/teacher/exams/${examUid}/students/${studentDbId}/attempts`,
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


students: {
    list: `/school/${schoolSlug}/teacher/students`,
  },

schoolClasses: {
    list: `/school/${schoolSlug}/teacher/school-classes`,
  },

subscription:
    `/school/${schoolSlug}/teacher/subscription`,

});