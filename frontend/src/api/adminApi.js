import API from "./client";

export const adminApi = {

  // =========================
  // Dashboard
  // =========================

  getDashboard: (schoolSlug) =>
    API.get(
      `/api/admin/${schoolSlug}/dashboard`
    ),


  // =========================
  // Teachers
  // =========================

  getTeachers: (schoolSlug) =>
    API.get(
      `/api/admin/${schoolSlug}/teachers`
    ),

  createTeacher: (schoolSlug, data) =>
    API.post(
      `/api/admin/${schoolSlug}/teachers`,
      data
    ),

  toggleTeacher: (schoolSlug, teacherId) =>
    API.patch(
      `/api/admin/${schoolSlug}/teachers/${teacherId}/toggle`
    ),

  resetTeacherPassword: (schoolSlug, teacherId) =>
    API.post(
      `/api/admin/${schoolSlug}/teachers/${teacherId}/reset-password`
    ),


  // =========================
  // Teacher Performance
  // =========================

  getTeacherPerformance: (schoolSlug) =>
    API.get(
      `/api/admin/${schoolSlug}/performance/teachers`
    ),


  // =========================
  // Exam Performance
  // =========================

  getExamPerformance: (schoolSlug) =>
    API.get(
      `/api/admin/${schoolSlug}/performance/exams`
    ),

  getExamPerformanceDetail: (
    schoolSlug,
    examId
  ) =>
    API.get(
      `/api/admin/${schoolSlug}/performance/exams/${examId}`
    ),


  getExamLeaderboard: (
  schoolSlug,
  examId
) =>
  API.get(
    `/api/admin/${schoolSlug}/exams/${examId}/leaderboard`
  ),

  // =========================
  // School Analytics
  // =========================

  getSchoolAnalytics: (schoolSlug) =>
    API.get(
      `/api/admin/${schoolSlug}/reports/analytics`
    ),


  // =========================
// Download Reports
// =========================

downloadTeacherReport: (schoolSlug) =>
  API.get(
    `/api/admin/${schoolSlug}/report/download/teachers`,
    {
      responseType: "blob"
    }
  ),

downloadExamPerformanceReport: (schoolSlug) =>
  API.get(
    `/api/admin/${schoolSlug}/report/download/exams`,
    {
      responseType: "blob"
    }
  ),

downloadSummaryReport: (schoolSlug) =>
  API.get(
    `/api/admin/${schoolSlug}/report/download/summary`,
    {
      responseType: "blob"
    }
  ),

};