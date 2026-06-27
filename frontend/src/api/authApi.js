import API from "./client";

export const authApi = {
  login: (data) => API.post("/api/auth/login", data, {
    withCredentials: true
  }),

  getCurrentUser: () => API.get("/api/auth/me"),


  logout: () => API.post("/api/auth/logout"),

  changePassword: (data) =>
      API.post("/api/auth/change-password",  data ),

};