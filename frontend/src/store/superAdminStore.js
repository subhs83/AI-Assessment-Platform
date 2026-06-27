import { create } from "zustand";
import { superAdminApi } from "../api/superAdminApi";




export const useSuperAdminStore = create((set, get) => ({
    
    
  // -------------------------
  // State
  // -------------------------

  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,

  schools: [],
  schoolsLoading: false,
  schoolsError: null,

  createSchoolLoading: false,

  analyticsData: null,
  analyticsLoading: false,
  analyticsError: null,

  demoRequests: [],
  demoRequestsLoading: false,
  demoRequestsError: null,

  contactMessages: [],
  contactMessagesLoading: false,
  contactMessagesError: null,

  loginLogsData: [],
  loginStats: null,
  loginLogsLoading: false,
  loginLogsError: null,
  demoRequestsData: [],
  contactMessagesData: [],
  systemHealth: null,
   platformStats: null,
  loading: false,
  aiDashboard: null,
  loadingAIDashboard: false,
  aiSourceStats: null,
  loadingAISourceStats: false,
  aiTrends: [],
  loadingAITrends: false,
  aiSchools: [],
  loadingAISchools: false,
  aiTeachers: [],
  loadingAITeachers: false,
  aiRecent: [],
  loadingAIRecent: false,

  // -------------------------
  // Dashboard
  // -------------------------
  

  fetchDashboard: async () => {
    

    set({
      dashboardLoading: true,
      dashboardError: null
    });

    try {
        

      const response =
        await superAdminApi.getDashboard();

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
  // Schools
  // -------------------------

  fetchSchools: async () => {

    try {

      set({
        schoolsLoading: true,
        schoolsError: null
      });

      const response =
        await superAdminApi.getSchools();

      set({
        schools: response.data.data,
        schoolsLoading: false
      });

    } catch (error) {

      set({
        schoolsLoading: false,
        schoolsError:
          error.response?.data?.message ||
          "Failed to load schools"
      });

    }

  },


  fetchDemoRequests: async () => {

  set({ loading: true });

  try {

    const response =
      await superAdminApi.getDemoRequests();

    set({
      demoRequestsData:
        response.data.demo_requests || []
    });

  } finally {

    set({ loading: false });

  }

},


fetchContactMessages: async () => {

  set({ loading: true });

  try {

    const response =
      await superAdminApi.getContactMessages();

    set({
      contactMessagesData:
        response.data.contact_messages || []
    });

  } finally {

    set({ loading: false });

  }

},


fetchLoginLogs: async () => {

  set({ loading: true });

  try {

    const response =
      await superAdminApi.getLoginLogs();

    set({
      loginLogsData:
        response.data.logs || [],

      loginStats:
        response.data.stats || null
    });

  } finally {

    set({
      loading: false
    });

  }

},

 // ================= ACTION =================

 fetchAIDashboard: async () => {
  set({ loadingAIDashboard: true });

  try {
    const res = await superAdminApi.getAIDashboard();

    set({
      aiDashboard: res.data,
      loadingAIDashboard: false,
    });

  } catch (error) {

    set({
      loadingAIDashboard: false,
    });

    throw error;
  }
},


fetchAISourceStats: async () => {

  set({
    loadingAISourceStats: true
  });

  try {

    const res = await superAdminApi.getAISourceStats();

    set({
      aiSourceStats: res.data,
      loadingAISourceStats: false
    });

  } catch (error) {

    set({
      loadingAISourceStats: false
    });

    throw error;
  }

},


fetchAITrends: async () => {

  set({
    loadingAITrends: true
  });

  try {

    const res = await superAdminApi.getAITrends();

    set({
      aiTrends: res.data || [],
      loadingAITrends: false
    });

  } catch (error) {

    set({
      loadingAITrends: false
    });

    throw error;
  }

},


fetchAISchools: async () => {

  set({
    loadingAISchools: true
  });

  try {

    const res = await superAdminApi.getAISchools();

    set({
      aiSchools: res.data || [],
      loadingAISchools: false
    });

  } catch (error) {

    set({
      loadingAISchools: false
    });

    throw error;
  }

},


fetchAITeachers: async () => {

  set({
    loadingAITeachers: true
  });

  try {

    const res =
      await superAdminApi.getAITeachers();

    set({
      aiTeachers: res.data || [],
      loadingAITeachers: false
    });

  } catch (error) {

    set({
      loadingAITeachers: false
    });

    throw error;
  }

},

fetchAIRecent: async () => {

  set({
    loadingAIRecent: true
  });

  try {

    const res =
      await superAdminApi.getAIRecent();

    set({
      aiRecent: res.data || [],
      loadingAIRecent: false
    });

  } catch (error) {

    set({
      loadingAIRecent: false
    });

    throw error;
  }

},



  fetchPlatformStats: async () => {

    try {

      set({ loading: true });

      const response =
        await superAdminApi.getPlatformStats();

      set({
        platformStats: response.data
      });

    } catch (error) {

      console.error("Platform stats error:", error);

    } finally {

      set({ loading: false });
    }

  },

fetchSystemHealth: async () => {

  const response =
    await superAdminApi.getSystemHealth();

  set({
    systemHealth:
      response.data
  });

},
  // -------------------------
  // Create School
  // -------------------------

  createSchool: async (formData) => {
  set({ loading: true });

  try {
    const response = await superAdminApi.createSchool(formData);

    return response.data;

  } finally {
    set({ loading: false });
  }
},


  // -------------------------
  // Edit School
  // -------------------------
getSchoolById: async (schoolId) => {

  set({ loading: true });

  try {

    const response = await superAdminApi.getSchoolById(schoolId);

    return response.data;

  } finally {

    set({ loading: false });

  }

},

  // -------------------------
  // Update School
  // -------------------------
updateSchool: async (schoolId, formData) => {

  set({ loading: true });

  try {

    const response = await superAdminApi.updateSchool(
      schoolId,
      formData
    );

    return response.data;

  } finally {

    set({ loading: false });

  }

},


  // -------------------------
  // Toggle School
  // -------------------------

  toggleSchool: async (schoolId) => {

    const response =
      await superAdminApi.toggleSchool(
        schoolId
      );

    get().fetchSchools();

    return response.data;

  },

    // -------------------------
  //  Admin Page
  // -------------------------

getSchoolAdmins: async (schoolId) => {

  set({ loading: true });

  try {

    const response =
      await superAdminApi.getSchoolAdmins(
        schoolId
      );

    return response.data;

  } finally {

    set({ loading: false });

  }

},


// -------------------------
//  Create Admin
// -------------------------

createSchoolAdmin: async (schoolId, payload) => {

  set({ loading: true });

  try {

    const response =
      await superAdminApi.createSchoolAdmin(
        schoolId,
        payload
      );

    return response.data;

  } finally {

    set({ loading: false });

  }

},

  // -------------------------------------
  // Toggle & Reset School Admin Password
  // ------------------------------------

  toggleSchoolAdmin: async (userId) => {

  const response =
    await superAdminApi.toggleSchoolAdmin(userId);

  return response.data;

},

resetSchoolAdminPassword: async (userId) => {

  const response =
    await superAdminApi.resetSchoolAdminPassword(userId);

  return response.data;

},


updateDemoStatus: async (
  demoId,
  status
) => {

  const response =
    await superAdminApi.updateDemoStatus(
      demoId,
      status
    );

  return response.data;

},

deleteDemoRequest: async (demoId) => {

  const response =
    await superAdminApi.deleteDemoRequest(
      demoId
    );

  set(state => ({
    demoRequestsData:
      state.demoRequestsData.filter(
        d => d.id !== demoId
      )
  }));

  return response.data;

},

updateContactStatus: async (
  messageId,
  status
) => {

  const response =
    await superAdminApi.updateContactStatus(
      messageId,
      status
    );

  return response.data;

},

deleteContactMessage: async (
  messageId
) => {

  const response =
    await superAdminApi.deleteContactMessage(
      messageId
    );

  set(state => ({
    contactMessagesData:
      state.contactMessagesData.filter(
        m => m.id !== messageId
      )
  }));

  return response.data;

},


extendSchoolValidity: async (schoolId, payload) => {

  const response =
    await superAdminApi.extendSchoolValidity(
      schoolId,
      payload
    );

  return response.data;

},

resetSchoolValidity: async (schoolId) => {

  const response =
    await superAdminApi.resetSchoolValidity(
      schoolId
    );

  return response.data;

},


deleteSchool: async (schoolId) => {

  const response =
    await superAdminApi.deleteSchool(
      schoolId
    );

  set(state => ({
    schools:
      state.schools.filter(
        s => s.id !== schoolId
      )
  }));

  return response.data;

},
  // -------------------------
  // Reset
  // -------------------------

  reset: () =>
    set({

      dashboardData: null,
      dashboardLoading: false,
      dashboardError: null,

      schools: [],
      schoolsLoading: false,
      schoolsError: null,

      analyticsData: null,
      analyticsLoading: false,
      analyticsError: null,

      demoRequests: [],
      contactMessages: [],
      loginLogs: [],
      aiDashboard: null,
      loadingAIDashboard: false,
      aiSourceStats: null,
      loadingAISourceStats: false,
      aiTrends: [],
      loadingAITrends: false,
      aiSchools: [],
      loadingAISchools: false,
      aiTeachers: [],
      loadingAITeachers: false,
      aiRecent: [],
      loadingAIRecent: false,


    })

}));