import { create } from "zustand";
import { authApi } from "../api/authApi";
import { useTeacherStore } from "./teacherStore";
import { useAdminStore } from "./adminStore";
// etc.

export const useAuthStore = create((set) => ({

  // -------------------------
  // State
  // -------------------------
  user: null,
  isAuthenticated: false,
  authLoading: true,
  authError: null,
  hasInitialized: false,


  // -------------------------
  // Login
  // -------------------------
  login: async (data) => {

    try {

      set({
        authLoading: true,
        authError: null
        
      });

      const response = await authApi.login(data);

      set({
        user: response.data.user,
        isAuthenticated: true,
        authLoading: false
      });

      return response.data;

    } catch (error) {

      set({
        authLoading: false,
        authError:
          error.response?.data?.message ||
          "Login failed"
      });

      throw error;
    }

  },


  // -------------------------
  // Initialize Auth
  // -------------------------
  initializeAuth: async () => {

    if (useAuthStore.getState().hasInitialized) {
      return;
    }

    try {

      set({
        authLoading: true
      });

      const response = await authApi.getCurrentUser();

      set({
        user: response.data.user,
        isAuthenticated: true,
        authLoading: false,
        hasInitialized: true,
      });

    } catch (error) {

      set({
        user: null,
        isAuthenticated: false,
        authLoading: false,
        hasInitialized: true,
      });

    }

  },


  // -------------------------
  // Logout
  // -------------------------
  logout: async () => {

  try {

    await authApi.logout();

  } finally {

    useTeacherStore.getState().resetDashboard();

    useAdminStore.getState().reset();

    // future
    // useExamStore.getState().reset();
    // useAIStore.getState().reset();

    set({
      user: null,
      isAuthenticated: false,
      authError: null,
      hasInitialized: false,
    });
  }

}

}));