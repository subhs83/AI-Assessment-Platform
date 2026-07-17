
import API from "./client";

export const schoolApi = {
getExamOptions(schoolSlug) {
  return API.get(`/api/school/${schoolSlug}/options` );
  
},

getBranding: (schoolSlug) =>
    API.get(`/api/school/${schoolSlug}/branding`),
  
}