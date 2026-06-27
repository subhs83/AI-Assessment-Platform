import { create } from "zustand";
import { adminApi } from "../api/adminApi";

export const useAdminStore = create((set, get) => ({

  // -------------------------
  // State
  // -------------------------
  teachers: [],
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,
  createTeacherLoading: false,
  teacherPerformance: [],
  teacherPerformanceLoading: false,
  teacherPerformanceError: null,
  examPerformance: [],
  examPerformanceLoading: false,
  examPerformanceError: null,
  schoolAnalytics: null,
  schoolAnalyticsLoading: false,
  schoolAnalyticsError: null,
  topTeachers: [],
  topExams: [],
  // -------------------------
  // Dashboard
  // -------------------------

  fetchDashboard: async (schoolSlug) => {

    set({
      dashboardLoading: true,
      dashboardError: null
    });

    try {

      const response = await adminApi.getDashboard(
        schoolSlug
      );

      set({
        dashboardData: response.data.data,
        dashboardLoading: false
      });

    } catch (error) {

      set({
        dashboardLoading: false,
        dashboardError:
          error.response?.data?.message ||
          "Failed to load dashboard"
      });

    }

  },

  // -------------------------
  // View Teacher
  // -------------------------

  fetchTeachers: async (schoolSlug) => {

  try {

    set({
      teachersLoading: true,
      teachersError: null
    });

    const response =
      await adminApi.getTeachers(
        schoolSlug
      );

    set({
      teachers: response.data.data,
      teachersLoading: false
    });

  } catch (error) {

    set({
      teachersLoading: false,
      teachersError:
        error.response?.data?.message ||
        "Failed to load teachers"
    });

  }

},

  // -------------------------
  // Add Teacher
  // -------------------------
createTeacher: async (schoolSlug, data) => {

  try {

    set({
      createTeacherLoading: true
    });

    const response =
      await adminApi.createTeacher(
        schoolSlug,
        data
      );

    set({
      createTeacherLoading: false
    });

    return response.data;

  } catch (error) {

    set({
      createTeacherLoading: false
    });

    throw error;

  }

},

  // -------------------------
  // Toggle Teacher
  // -------------------------

toggleTeacher: async (schoolSlug, teacherId) => {

  const response =
    await adminApi.toggleTeacher(
      schoolSlug,
      teacherId
    );

  get().fetchTeachers(schoolSlug);

  return response.data;

},
  // -------------------------
  // Reset Password
  // -------------------------

resetTeacherPassword: async (
  schoolSlug,
  teacherId
) => {

  const response =
    await adminApi.resetTeacherPassword(
      schoolSlug,
      teacherId
    );

  get().fetchTeachers(schoolSlug);

  return response.data;

},

  // -------------------------
  // Teacher Performance
  // -------------------------
fetchTeacherPerformance: async (schoolSlug) => {

  try {

    set({
      teacherPerformance: [],
      teacherPerformanceLoading: true,
      teacherPerformanceError: null
    });

    const res =
      await adminApi.getTeacherPerformance(
        schoolSlug
      );

    set({
      teacherPerformance: res.data.data,
      teacherPerformanceLoading: false
    });

  } catch (err) {

    set({
      teacherPerformance: [],
      teacherPerformanceLoading: false,
      teacherPerformanceError:
        err.response?.data?.message ||
        "Failed to load teacher performance"
    });

  }

},


getExamPerformance: async (schoolSlug) => {
  set({
    examPerformanceLoading: true,
    examPerformanceError: null,
    examPerformance: null
  });

  try {
    const res =
      await adminApi.getExamPerformance(
        schoolSlug
      );

    set({
      examPerformance: res.data,
      examPerformanceLoading: false,
    });

  } catch (error) {

    set({
      examPerformanceError:
        error.response?.data?.message ||
        "Failed to load exam performance",
      examPerformanceLoading: false,
    });

  }
},

getSchoolAnalytics: async (schoolSlug) => {

    set({
        schoolAnalyticsLoading: true,
        schoolAnalytics: null,
        schoolAnalyticsError: null
    });

    try {

        const response = 
        await adminApi.getSchoolAnalytics(schoolSlug)

        set({
            schoolAnalytics: response.data,
            schoolAnalyticsLoading: false
        });

    } catch (error) {

        set({
            schoolAnalyticsError:
                error.response?.data?.message ||
                "Failed to load analytics",
            schoolAnalyticsLoading: false
        });

    }

},

reset: () =>
  set({
    dashboardData: null,
    dashboardLoading: false,
    dashboardError: null,

    teachers: [],
    teachersLoading: false,
    teachersError: null,
  }),
}));