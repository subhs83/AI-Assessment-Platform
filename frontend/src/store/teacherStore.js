import { create } from "zustand";
import { teacherApi } from "../api/teacherApi";
import aiApi from "../api/aiApi";

export const useTeacherStore = create((set, get) => ({
  dashboard: null,
  loading: false,
  error: null,

  students: [],
  schoolClasses: [],
  sections: [],
  ocrLanguages: [],

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

  
  fetchOcrLanguages: async (schoolSlug) => {
      try {
        const res = await aiApi.getOcrLanguages(schoolSlug);

        set({
          ocrLanguages: res.data.ocr_languages,
        });
      } catch (err) {
        console.error("Failed to load OCR languages", err);
      }
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
// School Classes
// -------------------------

fetchSchoolClasses: async (schoolSlug) => {

  const res =
    await teacherApi.getSchoolClasses(
      schoolSlug
    );

  set({
    schoolClasses:
      res.data.data.school_classes,
  });

},

createSchoolClass: async (
  schoolSlug,
  payload
) => {

  const response =
    await teacherApi.createSchoolClass(
      schoolSlug,
      payload
    );

  return response.data;

},

updateSchoolClass: async (
  schoolSlug,
  classId,
  payload
) => {

  const response =
    await teacherApi.updateSchoolClass(
      schoolSlug,
      classId,
      payload
    );

  return response.data;

},

deleteSchoolClass: async (
  schoolSlug,
  classId
) => {

  const response =
    await teacherApi.deleteSchoolClass(
      schoolSlug,
      classId
    );

  return response.data;

},

// -------------------------
// Sections
// -------------------------

fetchSections: async (schoolSlug, classId) => {
  const res = await teacherApi.getSections(schoolSlug, classId);

  set({
    sections: res.data.data.sections,
  });
},

createSection: async (schoolSlug, classId, payload) => {
  const res = await teacherApi.createSection(
    schoolSlug,
    classId,
    payload
  );

  return res.data;
},

updateSection: async (schoolSlug, classId, sectionId, payload) => {
  const res = await teacherApi.updateSection(
    schoolSlug,
    classId,
    sectionId,
    payload
  );

  return res.data;
},

deleteSection: async (schoolSlug, classId, sectionId) => {
  const res = await teacherApi.deleteSection(
    schoolSlug,
    classId,
    sectionId
  );

  return res.data;
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
      schoolClasses: [],
      sections: [],
    }),
}));