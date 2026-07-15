export const adminRoutes = (schoolSlug) => ({

  // Dashboard
  dashboard: `/school/${schoolSlug}/admin`,

  // Teachers
  teachers: `/school/${schoolSlug}/admin/teachers`,
  addTeacher: `/school/${schoolSlug}/admin/teachers/add`,

  // Performance
  performance: `/school/${schoolSlug}/admin/performance`,

  teacherPerformance:
    `/school/${schoolSlug}/admin/performance/teachers`,

  examPerformance:
    `/school/${schoolSlug}/admin/performance/exams`,

  examLeaderboard: (examUid) =>
    `/school/${schoolSlug}/admin/performance/exams/${examUid}/leaderboard`,

  // Reports
  reports: `/school/${schoolSlug}/admin/report`,

  schoolAnalytics:
    `/school/${schoolSlug}/admin/report/analytics`,

  downloadReports:
    `/school/${schoolSlug}/admin/report/download`,

  subscriptionReports:
    `/api/admin/${schoolSlug}/subscription`,

});