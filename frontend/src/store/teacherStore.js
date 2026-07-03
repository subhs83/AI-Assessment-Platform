import { create } from "zustand";
import { teacherApi } from "../api/teacherApi";

export const useTeacherStore = create((set, get) => ({
  dashboard: null,
  loading: false,
  error: null,

  students: [],

  // -------------------------
  // NEW: Upload states
  // -------------------------
  uploadLoading: false,
  uploadResult: null,
  uploadError: null,

  // -------------------------
  // Dashboard
  // -------------------------
  fetchDashboard: async (schoolSlug) => {
    try {
      set({
        dashboard: null,
        loading: true,
        error: null,
      });

      const res = await teacherApi.getDashboard(schoolSlug);

      set({
        dashboard: res.data.data,
        loading: false,
      });
    } catch (err) {
      set({
        dashboard: null,
        error:
          err.response?.data?.message ||
          "Failed to load dashboard",
        loading: false,
      });
    }
  },

  // -------------------------
  // Exams
  // -------------------------
  createExam: async (schoolSlug, payload) => {
    const res = await teacherApi.createExam(
      schoolSlug,
      payload
    );

    return res.data;
  },

  // -------------------------
  // Students list
  // -------------------------
  fetchStudents: async (schoolSlug) => {
    const res = await teacherApi.getStudents(schoolSlug);

    set({
      students: res.data.data.students,
    });
  },

  createStudent: async (schoolSlug, payload) => {

  const response =
    await teacherApi.createStudent(
      schoolSlug,
      payload
    );

  return response.data;

},


updateStudent: async (
  schoolSlug,
  studentUid,
  payload
) => {

  const response =
    await teacherApi.updateStudent(
      schoolSlug,
      studentUid,
      payload
    );

  return response.data;

},

deleteStudent: async (
  schoolSlug,
  studentUid
) => {

  const response =
    await teacherApi.deleteStudent(
      schoolSlug,
      studentUid
    );

  return response.data;

},

  // -------------------------
  // Templates
  // -------------------------
  downloadQuestionTemplate: async (schoolSlug) => {
    const response =
      await teacherApi.downloadQuestionTemplate(
        schoolSlug
      );

    return response.data;
  },

  downloadStudentTemplate: async (schoolSlug) => {
    const response =
      await teacherApi.downloadStudentTemplate(schoolSlug);

    return response.data;
  },

  // -------------------------
  // 🚀 IMPORT STUDENTS (FIXED + PRODUCTION READY)
  // -------------------------
  importStudents: async (schoolSlug, file) => {
    try {
      set({
        uploadLoading: true,
        uploadError: null,
        uploadResult: null,
      });

      const formData = new FormData();
      formData.append("excel_file", file);

      const response = await teacherApi.importStudents(
        schoolSlug,
        formData
      );

      const result = response.data;

      set({
        uploadLoading: false,
        uploadResult: result.data,
      });

      return result;

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Student import failed";

      set({
        uploadLoading: false,
        uploadError: msg,
      });

      throw err;
    }
  },

  // -------------------------
  // Reset
  // -------------------------
  resetDashboard: () =>
    set({
      dashboard: null,
      loading: false,
      error: null,
      students: [],
      uploadLoading: false,
      uploadResult: null,
      uploadError: null,
    }),
}));