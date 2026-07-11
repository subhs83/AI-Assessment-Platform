import API from "./client";

 const aiApi = {
  // 1. Generate AI Questions
  generate: (schoolSlug, payload) =>
    API.post(
      `/api/teacher/${schoolSlug}/ai/generate`,
      payload
    ),

  // 2. Get AI Request (Preview)
  getRequest: (schoolSlug, requestId) =>
    API.get(
      `/api/teacher/${schoolSlug}/ai/request/${requestId}`
    ),

  // 3. Save Selected Questions to Exam
  saveToExam: (schoolSlug, payload) =>
    API.post(
      `/api/teacher/${schoolSlug}/ai/save-to-exam`,
      payload
    ),

  // 4. AI History (future-ready)
getHistory: (schoolSlug, params = {}) =>
    API.get(`/api/teacher/${schoolSlug}/ai/history`, {
      params,
    }),

    getOcrLanguages: (schoolSlug) =>
  API.get(`/api/teacher/${schoolSlug}/ai/options`),

    getAIConfig: (schoolSlug) =>
    API.get(`/api/teacher/${schoolSlug}/ai/config`),

};

export default aiApi