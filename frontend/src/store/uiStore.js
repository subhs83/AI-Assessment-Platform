// src/store/uiStore.js

import { create } from "zustand";

export const useUIStore = create((set) => ({
  loading: false,
  loadingMessage: "Processing...",

  showLoading: (message = "Processing...") =>
    set({
      loading: true,
      loadingMessage: message,
    }),

  hideLoading: () =>
    set({
      loading: false,
      loadingMessage: "Processing...",
    }),
}));