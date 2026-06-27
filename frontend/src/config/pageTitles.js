// src/config/pageTitles.js

const PAGE_TITLES = [
  {
    match: "/admin/teachers/add",
    title: "Add Teacher"
  },
  {
    match: "/admin/teachers",
    title: "Teachers"
  },
  {
    match: "/admin/performance/teachers",
    title: "Teacher Performance"
  },
  {
    match: "/admin/performance/exams/",
    title: "Leaderboard"
  },
  {
    match: "/admin/performance/exams",
    title: "Exam Performance"
  },
  {
    match: "/admin/reports/analytics",
    title: "School Analytics"
  },
  {
    match: "/admin/reports/download",
    title: "Download Reports"
  },

  {
    match: "/exams/create",
    title: "Create Exam"
  },

  {
    match: "/ai/generate",
    title: "AI Generate Questions"
  },

  {
    match: "/ai/history",
    title: "Question History"
  },

  {
    match: "/questions/upload",
    title: "Upload Questions"
  },
  {
    match: "/questions",
    title: "Review Questions"
  },
  {
    match: "/results",
    title: "Results"
  },
  {
    match: "/leaderboard",
    title: "Leaderboard"
  },
  {
    match: "/attempts/",
    title: "Attempt Detail"
  },
  {
    match: "/students/",
    title: "Student Attempts"
  },
  {
    match: "/exams",
    title: "Manage Exams"
  }
];

export function getPageTitle(pathname) {

  if (pathname.endsWith("/admin")) {
    return "Dashboard";
  }

  if (pathname.endsWith("/teacher")) {
    return "Dashboard";
  }

  const page = PAGE_TITLES.find(
    item => pathname.includes(item.match)
  );

  return page?.title || "LMS";
}