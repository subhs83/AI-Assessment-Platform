//App.js


import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import AnalyticsTracker from "./components/common/AnalyticsTracker";


import { ToastProvider } from "./components/ui/Toast";
import { useAuthStore } from "./store/authStore";
import ScrollToTop from "./components/common/ScrollToTop";
import ProtectedRoute from "./routes/ProtectedRoute"
import RoleProtectedRoute from "./routes/RoleProtectedRoute"
import GlobalLoadingOverlay from "./components/common/GlobalLoadingOverlay"
import BrandLoading from "./components/loading/BrandLoading"



import LoginPage from "./pages/login/LoginPage";
import ChangePasswordPage from "./pages/login/ChangePasswordPage";

// Student

import QuizInitPage from "./pages/student/QuizInitPage";
import RegisterPage from "./pages/student/RegisterPage";
import Result from "./pages/student/Result";
import ExamPage from "./pages/student/ExamPage";

// Teacher

import DashboardPage from "./pages/teacher/DashboardPage";
import DashboardLayout from "./layouts/DashboardLayout";
import ExamsPage from "./pages/teacher/ExamsPage";
import ExamFormPage from "./pages/teacher/ExamFormPage"
import UploadQuestionsPage from "./pages/teacher/UploadQuestionsPage";
import ReviewQuestionsPage from "./pages/teacher/ReviewQuestionsPage";
import ResultsPage from "./pages/teacher/ResultsPage";
import AttemptDetailPage from "./pages/teacher/AttemptDetailPage";
import StudentAttemptsPage from "./pages/teacher/StudentAttemptsPage";
import LeaderboardPage from "./pages/teacher/LeaderboardPage";
import AIPreviewPage from "./pages/teacher/ai/AIPreviewPage";
import AIGeneratePage from "./pages/teacher/ai/AIGeneratePage";
import AIHistoryPage from "./pages/teacher/ai/AIHistoryPage";
import StudentsPage from "./pages/teacher/StudentsPage";  
import AcademicStructurePage from "./pages/teacher/AcademicStructurePage";
import SectionsPage from "./pages/teacher/SectionsPage";
import SubscriptionPage  from "./pages/teacher/SubscriptionPage";


// Admin

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ViewTeachersPage from "./pages/admin/ViewTeachersPage";
import AddTeacherPage from "./pages/admin/AddTeacherPage";
import TeacherPerformancePage from "./pages/admin/TeacherPerformancePage";
import ExamPerformancePage from "./pages/admin/ExamPerformancePage";
import SchoolAnalyticsPage  from "./pages/admin/SchoolAnalyticsPage";
import DownloadReportPage  from "./pages/admin/DownloadReportPage";
import AdminSubscriptionPage  from "./pages/admin/AdminSubscriptionPage";


// SuperAdmin
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
import SchoolSubscriptionPage  from "./pages/superAdmin/SchoolSubscriptionPage";

import PublicRoutes from "./routes/PublicRoutes";



function AppContent() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />

      <AnalyticsTracker />

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

            <Route path="exams/create" element={<ExamFormPage  />} />

            <Route  path="exams/:examUid/edit"  element={<ExamFormPage />}/>

            <Route path="exams/:examUid/questions/upload" element={<UploadQuestionsPage />}/>

            <Route path="exams/:examUid/questions" element={<ReviewQuestionsPage />}/>

            <Route path="exams/:examUid/students/:studentDbId/attempts" element={<StudentAttemptsPage />} />

            <Route path="attempts/:attemptId" element={<AttemptDetailPage />} />

            <Route path="questions/upload" element={<UploadQuestionsPage />}/>

            <Route path="exams/:examUid/results" element={<ResultsPage />}/>

            <Route path="exams/:examUid/leaderboard" element={<LeaderboardPage />} />

            <Route path="ai/preview/:requestId" element={<AIPreviewPage />} />

            <Route path="ai/generate" element={<AIGeneratePage />} />

            <Route path="ai/history" element={<AIHistoryPage />}/>

            <Route  path="students"  element={<StudentsPage />}/>

            <Route  path="academic-structure"  element={<AcademicStructurePage />}/>

            <Route  path="academic-structure/classes/:classId/sections"  element={<SectionsPage />}/>

            <Route path="subscription" element={<SubscriptionPage />}/>
            
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
            <Route path="performance/exams/:examUid/leaderboard" element={<LeaderboardPage />} />
            <Route path="subscription" element={<AdminSubscriptionPage />}/>

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

            {/* ================= Subscription ================= */}
            <Route path="schools/:schoolId/subscription" element={<SchoolSubscriptionPage />} />

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

  const loadCurrentUser = useAuthStore(
    (s) => s.loadCurrentUser
  );

  const authLoading = useAuthStore(
    (s) => s.authLoading
  );


  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);


  return (
    <ToastProvider>

      <GlobalLoadingOverlay />

      <BrowserRouter>

        {authLoading ? (
          <BrandLoading message="Loading your workspace..." />
        ) : (
          <AppContent />
        )}

      </BrowserRouter>

    </ToastProvider>
  );
}