//App.js

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";


import { ToastProvider } from "./components/ui/Toast";
import { useAuthStore } from "./store/authStore";
import ScrollToTop from "./components/common/ScrollToTop";
import ProtectedRoute from "./routes/ProtectedRoute"
import RoleProtectedRoute from "./routes/RoleProtectedRoute"
import GlobalLoadingOverlay from "./components/common/GlobalLoadingOverlay"



import LoginPage from "./pages/login/LoginPage";
import ChangePasswordPage from "./pages/login/ChangePasswordPage";

import QuizInitPage from "./pages/student/QuizInitPage";
import RegisterPage from "./pages/student/RegisterPage";
import Result from "./pages/student/Result";
import ExamPage from "./pages/student/ExamPage";

import DashboardPage from "./pages/teacher/DashboardPage";
import DashboardLayout from "./layouts/DashboardLayout";
import ExamsPage from "./pages/teacher/ExamsPage";
import CreateExamPage from "./pages/teacher/CreateExamPage"
import UploadQuestionsPage from "./pages/teacher/UploadQuestionsPage";
import ReviewQuestionsPage from "./pages/teacher/ReviewQuestionsPage";
import ResultsPage from "./pages/teacher/ResultsPage";
import AttemptDetailPage from "./pages/teacher/AttemptDetailPage";
import StudentAttemptsPage from "./pages/teacher/StudentAttemptsPage";
import LeaderboardPage from "./pages/teacher/LeaderboardPage";
import AIPreviewPage from "./pages/teacher/ai/AIPreviewPage";
import AIGeneratePage from "./pages/teacher/ai/AIGeneratePage";
import AIHistoryPage from "./pages/teacher/ai/AIHistoryPage";


import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ViewTeachersPage from "./pages/admin/ViewTeachersPage";
import AddTeacherPage from "./pages/admin/AddTeacherPage";
import TeacherPerformancePage from "./pages/admin/TeacherPerformancePage";
import ExamPerformancePage from "./pages/admin/ExamPerformancePage";
import SchoolAnalyticsPage  from "./pages/admin/SchoolAnalyticsPage";
import DownloadReportPage  from "./pages/admin/DownloadReportPage";


import SuperAdminDashboardPage from "./pages/superAdmin/SuperAdminDashboardPage";
import SchoolsPage from "./pages/superAdmin/SchoolsPage";
import CreateSchoolPage from "./pages/superAdmin/CreateSchoolPage";
import EditSchoolPage from "./pages/superAdmin/EditSchoolPage";
import SchoolAdminsPage from "./pages/superAdmin/SchoolAdminsPage";
import CreateSchoolAdminPage  from "./pages/superAdmin/CreateSchoolAdminPage";
import DemoRequestsPage  from "./pages/superAdmin/DemoRequestsPage";
import ContactMessagesPage  from "./pages/superAdmin/ContactMessagesPage";
import LoginLogsPage  from "./pages/superAdmin/LoginLogsPage";
import PlatformStatsPage  from "./pages/superAdmin/PlatformStatsPage";
import SystemHealthPage  from "./pages/superAdmin/SystemHealthPage";
import AIAnalyticsPage  from "./pages/superAdmin/AIAnalyticsPage";

import PublicRoutes from "./routes/PublicRoutes";



function AppContent() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* ALL YOUR EXISTING ROUTES */}
           {/* Public Website */}
        <Route path="/*" element={<PublicRoutes />} />
        {/* Login Module */}
        <Route path="/login" element={<LoginPage />} />
        <Route  path="/change-password"  element={<ChangePasswordPage />}/>

         {/* Student Module */}

        <Route path="/school/:schoolSlug/quiz/:quizCode" element={<QuizInitPage />} />

        <Route path="/school/:schoolSlug/attempt/:attemptId/:index" element={<ExamPage />} />

        <Route path="/school/:schoolSlug/quiz/:quizCode/register" element={<RegisterPage />}/>
        
        <Route path="/school/:schoolSlug/result/:attemptId" element={<Result />} />

        

        {/* Teacher Module */}
        <Route
            path="/school/:schoolSlug/teacher"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["teacher"]}>
                  <DashboardLayout role="teacher" />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          >

            <Route index element={<DashboardPage />} />

            <Route path="exams" element={<ExamsPage />} />

            <Route path="exams/create" element={<CreateExamPage  />} />

            <Route path="exams/:examId/questions/upload" element={<UploadQuestionsPage />}/>

            <Route path="exams/:examId/questions" element={<ReviewQuestionsPage />}/>

            <Route path="exams/:examId/students/:studentDbId/attempts" element={<StudentAttemptsPage />} />

            <Route path="attempts/:attemptId" element={<AttemptDetailPage />} />

            <Route path="questions/upload" element={<UploadQuestionsPage />}/>

            <Route path="exams/:examId/results" element={<ResultsPage />}/>

            <Route path="exams/:examId/leaderboard" element={<LeaderboardPage />} />

            <Route path="ai/preview/:requestId" element={<AIPreviewPage />} />

            <Route path="ai/generate" element={<AIGeneratePage />} />

            <Route path="ai/history" element={<AIHistoryPage />}/>

            
          </Route>
 
          {/* Admin Module */}
 
          <Route
              path="/school/:schoolSlug/admin"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["school_admin"]}>
                    <DashboardLayout role="admin" />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            >
           <Route index element={<AdminDashboardPage />} />
           <Route  path="teachers"  element={<ViewTeachersPage />}/>
           <Route  path="teachers/add"  element={<AddTeacherPage />}/>
           <Route path="performance/teachers" element={<TeacherPerformancePage />} />
            <Route path="performance/exams" element={<ExamPerformancePage />} />
            <Route path="reports/analytics" element={<SchoolAnalyticsPage  />} />
            <Route path="reports/download" element={<DownloadReportPage  />} /> 
            <Route path="performance/exams/:examId/leaderboard" element={<LeaderboardPage />} />

         </Route>


         <Route
            path="/super-admin"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["super_admin"]}>
                  <DashboardLayout role="super-admin" />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          >
            {/* ================= Dashboard ================= */}
            <Route index element={<SuperAdminDashboardPage />} />

            {/* ================= Schools ================= */}
            <Route path="schools" element={<SchoolsPage />} />
            <Route path="schools/create" element={<CreateSchoolPage />} />
            <Route path="schools/:schoolId/edit" element={<EditSchoolPage />} />
            <Route path="schools/:schoolId/admins" element={<SchoolAdminsPage />} />
            <Route path="schools/:schoolId/admins/create" element={<CreateSchoolAdminPage />} />

            {/* ================= Communication ================= */}
            <Route path="demo-requests" element={<DemoRequestsPage />} />
            <Route path="contact-messages" element={<ContactMessagesPage />} />

            {/* ================= Monitoring ================= */}
            <Route path="login-logs" element={<LoginLogsPage />} />
            <Route path="platform-stats" element={<PlatformStatsPage />} />
            <Route path="system-health" element={<SystemHealthPage />} />

            {/* ================= AI Analytics ================= */}
            <Route path="ai" element={<AIAnalyticsPage />} />

            
          </Route>

        </Routes>
      </AnimatePresence>
    </>
  );
}


export default function App() {

  const loadCurrentUser = useAuthStore((s) => s.loadCurrentUser);

      useEffect(() => {
        loadCurrentUser();
      }, []);

      return (
        <ToastProvider>
          <GlobalLoadingOverlay />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ToastProvider>
      );
}