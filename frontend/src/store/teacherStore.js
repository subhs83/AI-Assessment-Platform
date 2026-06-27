import { create } from "zustand";
import { teacherApi } from "../api/teacherApi";

export const useTeacherStore = create((set, get) => ({
  dashboard: null,
  loading: false,
  error: null,

  fetchDashboard: async (schoolSlug) => {

  try {

    set({
      dashboard: null,
      loading: true,
      error: null
    });

    const res = await teacherApi.getDashboard( schoolSlug );

    set({
      dashboard: res.data.data,
      loading: false
    });

  } catch (err) {

    set({
      dashboard: null,
      error:
        err.response?.data?.message ||
        "Failed to load dashboard",
      loading: false
    });

  }

},

  createExam: async (schoolSlug, payload) => {
  const res = await teacherApi.createExam(
    schoolSlug,
    payload
  );

  return res.data;
},

  resetDashboard: () =>
    set({
      dashboard: null,
      loading: false,
      error: null,
    }),
}));