import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout";

// Admin Pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ViewTeachersPage from "../pages/admin/ViewTeachersPage";
import AddTeacherPage from "../pages/admin/AddTeacherPage";
import TeacherPerformancePage from "../pages/admin/TeacherPerformancePage";
import ExamPerformancePage from "../pages/admin/ExamPerformancePage";
import SchoolAnalyticsPage from "../pages/admin/SchoolAnalyticsPage";
import DownloadReportPage from "../pages/admin/DownloadReportPage";
import AdminSubscriptionPage from "../pages/admin/AdminSubscriptionPage";

// Shared
import LeaderboardPage from "../pages/teacher/LeaderboardPage";

export default function AdminRoutesGroup() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["school_admin"]}>
              <DashboardLayout role="admin" />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />

        <Route
          path="teachers"
          element={<ViewTeachersPage />}
        />

        <Route
          path="teachers/add"
          element={<AddTeacherPage />}
        />

        <Route
          path="performance/teachers"
          element={<TeacherPerformancePage />}
        />

        <Route
          path="performance/exams"
          element={<ExamPerformancePage />}
        />

        <Route
          path="performance/exams/:examUid/leaderboard"
          element={<LeaderboardPage />}
        />

        <Route
          path="reports/analytics"
          element={<SchoolAnalyticsPage />}
        />

        <Route
          path="reports/download"
          element={<DownloadReportPage />}
        />

        <Route
          path="subscription"
          element={<AdminSubscriptionPage />}
        />
      </Route>
    </Routes>
  );
}