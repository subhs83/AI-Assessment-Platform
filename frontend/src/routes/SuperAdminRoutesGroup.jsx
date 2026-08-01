import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout";

// Dashboard
import SuperAdminDashboardPage from "../pages/superAdmin/SuperAdminDashboardPage";

// Schools
import SchoolsPage from "../pages/superAdmin/SchoolsPage";
import CreateSchoolPage from "../pages/superAdmin/CreateSchoolPage";
import EditSchoolPage from "../pages/superAdmin/EditSchoolPage";
import SchoolAdminsPage from "../pages/superAdmin/SchoolAdminsPage";
import CreateSchoolAdminPage from "../pages/superAdmin/CreateSchoolAdminPage";

// Subscription
import SchoolSubscriptionPage from "../pages/superAdmin/SchoolSubscriptionPage";

// Communication
import DemoRequestsPage from "../pages/superAdmin/DemoRequestsPage";
import ContactMessagesPage from "../pages/superAdmin/ContactMessagesPage";

// Monitoring
import LoginLogsPage from "../pages/superAdmin/LoginLogsPage";
import PlatformStatsPage from "../pages/superAdmin/PlatformStatsPage";
import SystemHealthPage from "../pages/superAdmin/SystemHealthPage";

// AI
import AIAnalyticsPage from "../pages/superAdmin/AIAnalyticsPage";

export default function SuperAdminRoutesGroup() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["super_admin"]}>
              <DashboardLayout role="super-admin" />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<SuperAdminDashboardPage />} />

        {/* Schools */}
        <Route path="schools" element={<SchoolsPage />} />
        <Route
          path="schools/create"
          element={<CreateSchoolPage />}
        />
        <Route
          path="schools/:schoolId/edit"
          element={<EditSchoolPage />}
        />
        <Route
          path="schools/:schoolId/admins"
          element={<SchoolAdminsPage />}
        />
        <Route
          path="schools/:schoolId/admins/create"
          element={<CreateSchoolAdminPage />}
        />

        {/* Subscription */}
        <Route
          path="schools/:schoolId/subscription"
          element={<SchoolSubscriptionPage />}
        />

        {/* Communication */}
        <Route
          path="demo-requests"
          element={<DemoRequestsPage />}
        />
        <Route
          path="contact-messages"
          element={<ContactMessagesPage />}
        />

        {/* Monitoring */}
        <Route
          path="login-logs"
          element={<LoginLogsPage />}
        />
        <Route
          path="platform-stats"
          element={<PlatformStatsPage />}
        />
        <Route
          path="system-health"
          element={<SystemHealthPage />}
        />

        {/* AI */}
        <Route
          path="ai"
          element={<AIAnalyticsPage />}
        />
      </Route>
    </Routes>
  );
}