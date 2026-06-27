import API from "./client";

export const homeApi = {


  requestDemo: (data) =>
  API.post("/api/demo", data ),

  sendContactMessage: (data) =>
    API.post( "/api/contact",  data),

  
};