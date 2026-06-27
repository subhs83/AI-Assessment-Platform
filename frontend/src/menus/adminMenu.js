import {
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  ClipboardList,
  PieChart,
  Download,
  LogOut
} from "lucide-react";

export function getAdminMenu(schoolSlug) {

  return [

    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: `/school/${schoolSlug}/admin`,
      end: true,
    },

    // ================= Teachers =================

    {
      type: "section",
      label: "Teachers"
    },

    {
      label: "View Teachers",
      icon: Users,
      path: `/school/${schoolSlug}/admin/teachers`,
      end: true,
    },

    {
      label: "Add Teacher",
      icon: UserPlus,
      path: `/school/${schoolSlug}/admin/teachers/add`,
      end: true,
    },

    // ================= Exam Performance =================

    {
      type: "section",
      label: "Exam Performance"
    },

    {
      label: "Teacher Performance",
      icon: BarChart3,
      path: `/school/${schoolSlug}/admin/performance/teachers`,
      end: true,
    },

    {
      label: "Exam Performance",
      icon: ClipboardList,
      path: `/school/${schoolSlug}/admin/performance/exams`,
      end: true,
    },

    // ================= Reports =================

    {
      type: "section",
      label: "Reports"
    },

    {
      label: "School Analytics",
      icon: PieChart,
      path: `/school/${schoolSlug}/admin/reports/analytics`,
      end: true,
    },

    {
      label: "Download Reports",
      icon: Download,
      path: `/school/${schoolSlug}/admin/reports/download`,
      end: true,
    },

    {
      type: "divider"
    },

    {
      label: "Logout",
      icon: LogOut,
      action: "logout"
    }

  ];

}