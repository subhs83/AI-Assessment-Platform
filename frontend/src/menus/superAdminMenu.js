import {
  LayoutDashboard,
  School,
  PlusCircle,
  Mail,
  MessageSquare,
  FileText,
  BarChart3,
  Activity,
  Bot,
  LogOut
} from "lucide-react";

export function getSuperAdminMenu() {
  return [

    // ================= Dashboard =================
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/super-admin",
      end: true,
    },

    // ================= Schools =================
    {
      type: "section",
      label: "Schools"
    },

    {
      label: "Manage Schools",
      icon: School,
      path: "/super-admin/schools",
      end: true,
    },

    {
      label: "Create School",
      icon: PlusCircle,
      path: "/super-admin/schools/create",
      end: true,
    },

    // ================= AI Analytics =================
    {
      type: "section",
      label: "AI Analytics"
    },

    {
      label: "AI Dashboard",
      icon: Bot,
      path: "/super-admin/ai",
      end: true,
    },

    // ================= Communication =================
    {
      type: "section",
      label: "Communication"
    },

    {
      label: "Demo Requests",
      icon: Mail,
      path: "/super-admin/demo-requests",
      end: true,
    },

    {
      label: "Contact Messages",
      icon: MessageSquare,
      path: "/super-admin/contact-messages",
      end: true,
    },

    // ================= Monitoring =================
    {
      type: "section",
      label: "Monitoring"
    },

    {
      label: "Login Logs",
      icon: FileText,
      path: "/super-admin/login-logs",
      end: true,
    },

    {
      label: "Platform Stats",
      icon: BarChart3,
      path: "/super-admin/platform-stats",
      end: true,
    },

    {
      label: "System Health",
      icon: Activity,
      path: "/super-admin/system-health",
      end: true,
    },

    
    // ================= Logout =================
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