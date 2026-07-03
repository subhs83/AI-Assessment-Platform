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
  
  downloadQuestionTemplate: (schoolSlug) =>
  API.get(
    `/api/teacher/${schoolSlug}/questions/template`,
    {
      responseType: "blob",
    }
  ),

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


  // -------------------------
  // Students
  // -------------------------


  getStudents: (schoolSlug) =>
    API.get(`/api/teacher/${schoolSlug}/students`),

  
createStudent: (schoolSlug, payload) => {
  console.log("API CALL TRIGGERED", schoolSlug, payload);

  return API.post(
    `/api/teacher/${schoolSlug}/students`,
    payload
  );
},

updateStudent: (  schoolSlug,  studentUid,  payload) => {
  return API.put(
    `/api/teacher/${schoolSlug}/students/${studentUid}`,
    payload
  );
},

deleteStudent: (schoolSlug, studentUid) => {

  return API.delete(
    `/api/teacher/${schoolSlug}/students/${studentUid}`
  );

},

  downloadStudentTemplate: (schoolSlug) =>
  API.get(
    `/api/teacher/${schoolSlug}/students/template`,
    {
      responseType: "blob",
    }
  ),

  importStudents: (schoolSlug, formData) =>
  API.post(
    `/api/teacher/${schoolSlug}/students/import`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  ),

  

}

