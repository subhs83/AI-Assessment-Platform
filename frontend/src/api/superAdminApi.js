import API from "./client";

export const superAdminApi = {

  // =========================
  // Dashboard
  // =========================

  getDashboard: () =>
    API.get(
      "/api/superadmin/dashboard"
    ),

  // =========================
  // Schools
  // =========================

  getSchools: () =>
    API.get( "/api/superadmin/schools" ),

  createSchool: (data) =>
    API.post( "/api/superadmin/schools",  data ),

  getSchoolById: (schoolId) =>
  API.get(`/api/superadmin/schools/${schoolId}`),

  updateSchool: (schoolId, formData) =>
  API.put(`/api/superadmin/schools/${schoolId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  ),

  toggleSchool: (schoolId) =>
    API.patch(`/api/superadmin/schools/${schoolId}/toggle` ),

  // =========================
  // Admin
  // =========================

  getSchoolAdmins: (schoolId) => 
    API.get( `/api/superadmin/schools/${schoolId}/admins` ),

  createSchoolAdmin: (schoolId, payload) =>
  API.post( `/api/superadmin/schools/${schoolId}/admins`, payload ),

  toggleSchoolAdmin: (userId) =>
  API.patch(`/api/superadmin/admins/${userId}/toggle` ),

  resetSchoolAdminPassword: (userId) =>
  API.post( `/api/superadmin/admins/${userId}/reset-password` ),

  // =====================
  // DEMO REQUESTS
  // =====================

  getDemoRequests: () =>
  API.get("/api/superadmin/demo-requests"),

  updateDemoStatus: (demoId, status) =>
    API.patch(`/api/superadmin/demo-requests/${demoId}/status`, { status }),

  deleteDemoRequest: (demoId) =>
    API.delete(`/api/superadmin/demo-requests/${demoId}` ),

  // =====================
  // CONTACT MESSAGES
  // =====================

  getContactMessages: () =>
    API.get("/api/superadmin/contact-messages"),

  updateContactStatus: (messageId, status) =>
  API.patch( `/api/superadmin/contact-messages/${messageId}/status`,
    { status }
  ),

  deleteContactMessage: (messageId) =>
  API.delete( `/api/superadmin/contact-messages/${messageId}` ),

  // =====================
  // School Vailidity
  // =====================
  extendSchoolValidity: (schoolId, payload) =>
  API.post(`/api/superadmin/schools/${schoolId}/extend`, payload),


  resetSchoolValidity: (schoolId) =>
  API.post(
    `/api/superadmin/schools/${schoolId}/reset-validity`
  ),


  deleteSchool: (schoolId) =>
  API.delete( `/api/superadmin/schools/${schoolId}`  ),
  // =========================
  // Analytics
  // =========================
  getPlatformStats: () =>
  API.get("/api/superadmin/platform-stats"),

  getSystemHealth: () =>
  API.get("/api/superadmin/system-health" ),

  // =========================
  // Login Logs
  // =========================

  getLoginLogs: () =>
    API.get("/api/superadmin/login-logs"),

  // =========================
  // AI Analytics
  // =========================

  getAIDashboard: () =>
  API.get("/api/superadmin/ai/dashboard"),

  getAISourceStats: () =>
  API.get( "/api/superadmin/ai/source-stats" ),

  getAITrends: () =>
  API.get( "/api/superadmin/ai/trends" ),

  getAISchools: () =>
  API.get("/api/superadmin/ai/schools"),

  getAITeachers: () =>
  API.get( "/api/superadmin/ai/teachers" ),

  getAIRecent: () =>
  API.get( "/api/superadmin/ai/recent" ),
  };