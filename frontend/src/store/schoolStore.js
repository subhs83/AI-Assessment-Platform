// src/store/school.js

import { create } from "zustand";
import { schoolApi } from "../api/schoolApi";
import API from "../api/client";


export const useSchoolStore = create((set) => ({
        loading: false,
        error: null,
        branding: null,

        examOptions: null,
        examOptionsSchoolSlug: null,

        subscriptionSummary: null,
        subscriptionSummarySchoolSlug: null,

  fetchExamOptions: async (schoolSlug) => {
    try {
        const res = await schoolApi.getExamOptions(schoolSlug);

        set({
            examOptions: res.data.data,
            examOptionsSchoolSlug: schoolSlug,
        });

        return res.data.data;

    } catch (error) {
        set({
            error: error.response?.data?.message || "Failed to load options",
        });

        throw error;
    }
},

    // fetchSubscriptionSummary: async (schoolSlug) => {
    //     try {
    //     const res = await schoolApi.getSubscriptionSummary(schoolSlug);

    //     set({
    //         subscriptionSummary: res.data.data, 
    //     });

    //     return res.data.data;
    // } 

    // catch (error) {
    //         set({
    //             error: error.response?.data?.message || "Failed to load subscriptionSummary",
    //         });

    //         throw error;
    //     }
    // },

    fetchSubscriptionSummary: async (schoolSlug) => {
    try {
        const res = await schoolApi.getSubscriptionSummary(schoolSlug);

        // console.log(
        //   "Subscription API response:",
        //   res.data.data
        // );

        set({
            subscriptionSummary: res.data.data,
            subscriptionSummarySchoolSlug: schoolSlug,
        });

        // console.log(
        //   "Store after update:",
        //   useSchoolStore.getState().subscriptionSummary
        // );

        return res.data.data;

        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to load subscriptionSummary",
        });

        throw error;
        }
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
  reset: () =>
    set({
      dashboard: null,
      loading: false,
      error: null,
      subscription: null,
      examOptions: null,
      subscriptionSummary:null,
      branding: null,

    }),
}));