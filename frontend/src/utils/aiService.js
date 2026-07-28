// import API from "../api/client";
// import { useSchoolStore } from "../store/schoolStore";

// export async function generateQuestions(schoolSlug, formData) {
//   const res = await API.post(
//     `/api/teacher/${schoolSlug}/ai/generate`,
//     formData,
//     {
//       headers: {    
//         "Content-Type": "multipart/form-data",
//       },
//     }
//   );

//   // Refresh subscription after successful AI request
//   await useSchoolStore
//     .getState()
//     .fetchSubscriptionSummary(schoolSlug);

//   return res;
// }