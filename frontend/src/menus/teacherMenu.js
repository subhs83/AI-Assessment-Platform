import {
  Home,
  FileText,
  PlusCircle,
  Bot,
  Upload,
  History,
  Users,
  LogOut,
} from "lucide-react";

export const getTeacherMenu = (schoolSlug) => [
  {
    label: "Dashboard",
    icon: Home,
    path: `/school/${schoolSlug}/teacher`,
    end: true,
  },

  // =========================
  // ASSESSMENT
  // =========================
  {
    type: "section",
    label: "Assessment",
  },

  {
    label: "Create Exam",
    icon: PlusCircle,
    path: `/school/${schoolSlug}/teacher/exams/create`,
    end: true,
  },

  {
    label: "Manage Exams",
    icon: FileText,
    path: `/school/${schoolSlug}/teacher/exams`,
    end: true,
  },

  // =========================
  // QUESTION BANK
  // =========================
  {
    type: "section",
    label: "Question Bank",
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
  // STUDENTS
  // =========================
  {
    type: "section",
    label: "Students",
  },

  {
    label: "Students",
    icon: Users,
    path: `/school/${schoolSlug}/teacher/students`,
    end: true,
  },

  // =========================
  // ACCOUNT
  // =========================
  {
    type: "divider",
  },

  {
    label: "Logout",
    icon: LogOut,
    action: "logout",
  },
];