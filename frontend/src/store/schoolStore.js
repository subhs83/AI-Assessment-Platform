// src/store/school.js

import { create } from "zustand";
import { schoolApi } from "../api/schoolApi";
import API from "../api/client";


export const useSchoolStore = create((set) => ({
      loading: false,
      error: null,
      examOptions: null,
      branding: null,

  fetchExamOptions: async (schoolSlug) => {

    const res = await schoolApi.getExamOptions(schoolSlug);

    set({
        examOptions: res.data.data,
    });

    return res.data.data;
},


fetchSchoolBrand: async (schoolSlug) => {
    const res = await schoolApi.getBranding(schoolSlug);

    const branding = res.data.data;

    set({
        branding: {
            ...branding,
            logo: branding.logo
                ? `${API.defaults.baseURL}/static/uploads/schools/${branding.logo}`
                : null,
        },
    });

    return branding;
},


 


// -------------------------
  // Reset
  // -------------------------
  resetExamOptions: () =>
    set({
      dashboard: null,
      loading: false,
      error: null,
      subscription: null,
      examOptions: null,
    }),
}));