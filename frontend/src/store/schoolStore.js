// src/store/uiStore.js

import { create } from "zustand";
import { schoolApi } from "../api/schoolApi";


export const useSchoolStore = create((set) => ({
      loading: false,
      error: null,
      examOptions: null,

  fetchExamOptions: async (schoolSlug) => {

    const res = await schoolApi.getExamOptions(schoolSlug);


    set({
        examOptions: res.data.data,
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