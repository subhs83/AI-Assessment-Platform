
import API from "./client";

export const schoolApi = {
  
getExamOptions(schoolSlug) {
  return API.get(`/api/school/${schoolSlug}/options` );
  
},

getSubscriptionSummary(schoolSlug) {
  return API.get(`/api/school/${schoolSlug}/subscription-summary` );
  
},

getBranding: (schoolSlug) =>
    API.get(`/api/school/${schoolSlug}/branding`),
  
}