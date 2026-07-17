// src/store/school.js

import { create } from "zustand";
import { schoolApi } from "../api/schoolApi";


export const useSchoolStore = create((set) => ({
      loading: false,
      error: null,
      examOptions: null,
      branding: null,

  fetchExamOptions: async (schoolSlug) => {

    const res = await schoolApi.getBranding(schoolSlug);

    set({
        examOptions: res.data.data,
    });

    return res.data.data;
},


fetchSchoolBrand: async (schoolSlug) => {
    const res = await schoolApi.getExamOptions(schoolSlug);
    set({
        branding: res.data.data,
    });

    return res.data.data;
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