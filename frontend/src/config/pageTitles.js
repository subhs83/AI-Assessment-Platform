// src/config/pageTitles.js

const PAGE_TITLES = [
  // Dashboard
  {
    match: "/dashboard",
    title: "Dashboard"
  },

  // Teachers
  {
    match: "/admin/teachers/add",
    title: "Add Teacher"
  },
  {
    match: "/admin/teachers",
    title: "Teachers"
  },

  // Students
  {
    match: "/students/add",
    title: "Add Student"
  },
  {
    match: "/students/import",
    title: "Import Students"
  },
  {
    match: "/students",
    title: "Students"
  },

   {
    match: "/academic-structure",
    title: "Academic Structure"
  },

  // Exams
  {
    match: "/exams/create",
    title: "Create Exam"
  },
  {
    match: "/exams/edit/",
    title: "Edit Exam"
  },
  {
    match: "/exams",
    title: "Manage Exams"
  },

  // AI
  {
    match: "/ai/generate",
    title: "AI Generate Questions"
  },
  {
    match: "/ai/history",
    title: "Question History"
  },

  // Question Bank
  {
    match: "/questions/upload",
    title: "Upload Questions"
  },
  {
    match: "/questions",
    title: "Review Questions"
  },

  // Results
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

  // Performance
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

  // Reports
  {
    match: "/admin/reports/analytics",
    title: "School Analytics"
  },
  {
    match: "/admin/reports/download",
    title: "Download Reports"
  },

  // Settings
  {
    match: "admin/subscription",
    title: "Subscription"
  },
  {
    match: "/profile",
    title: "Profile"
  },
  {
    match: "/settings",
    title: "Settings"
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