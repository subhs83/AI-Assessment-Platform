import {
  Home,
  PlusCircle,
  FileText,
  Upload,
  LogOut,
  Bot,
  History,
} from "lucide-react";

export const getTeacherMenu = (schoolSlug) => [
  {
    label: "Dashboard",
    icon: Home,
    path: `/school/${schoolSlug}/teacher`,
    end: true,
  },

  // =========================
  // EXAM SETUP
  // =========================
  {
    label: "Create Exam",
    icon: PlusCircle,
    path: `/school/${schoolSlug}/teacher/exams/create`,
    end: true,
  },

  // =========================
  // QUESTION CREATION
  // =========================
  {
    type: "section",
    label: "Question Creation",
  },

  {
    label: "AI Generate Questions",
    icon: Bot,
    path: `/school/${schoolSlug}/teacher/ai/generate`,
    end: true,
  },

  {
    label: "Upload Questions",
    icon: Upload,
    path: `/school/${schoolSlug}/teacher/questions/upload`,
    end: true,
  },

  {
    label: "Question History",
    icon: History,
    path: `/school/${schoolSlug}/teacher/ai/history`,
    end: true,
  },

  // =========================
  // EXAM MANAGEMENT
  // =========================
  {
    label: "Manage Exams",
    icon: FileText,
    path: `/school/${schoolSlug}/teacher/exams`,
    end: true,
  },

  {
    type: "divider",
  },

  {
    label: "Logout",
    icon: LogOut,
    action: "logout",
  },
];