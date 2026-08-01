import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout";

// Teacher Pages
import DashboardPage from "../pages/teacher/DashboardPage";
import ExamsPage from "../pages/teacher/ExamsPage";
import ExamFormPage from "../pages/teacher/ExamFormPage";
import UploadQuestionsPage from "../pages/teacher/UploadQuestionsPage";
import ReviewQuestionsPage from "../pages/teacher/ReviewQuestionsPage";
import ResultsPage from "../pages/teacher/ResultsPage";
import AttemptDetailPage from "../pages/teacher/AttemptDetailPage";
import StudentAttemptsPage from "../pages/teacher/StudentAttemptsPage";
import LeaderboardPage from "../pages/teacher/LeaderboardPage";

import AIGeneratePage from "../pages/teacher/ai/AIGeneratePage";
import AIHistoryPage from "../pages/teacher/ai/AIHistoryPage";
import AIPreviewPage from "../pages/teacher/ai/AIPreviewPage";

import StudentsPage from "../pages/teacher/StudentsPage";
import AcademicStructurePage from "../pages/teacher/AcademicStructurePage";
import SectionsPage from "../pages/teacher/SectionsPage";
import SubscriptionPage from "../pages/teacher/SubscriptionPage";

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route
        path="/"
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

        <Route
          path="exams/create"
          element={<ExamFormPage />}
        />

        <Route
          path="exams/:examUid/edit"
          element={<ExamFormPage />}
        />

        <Route
          path="exams/:examUid/questions/upload"
          element={<UploadQuestionsPage />}
        />

        <Route
          path="exams/:examUid/questions"
          element={<ReviewQuestionsPage />}
        />

        <Route
          path="questions/upload"
          element={<UploadQuestionsPage />}
        />

        <Route
          path="attempts/:attemptId"
          element={<AttemptDetailPage />}
        />

        <Route
          path="exams/:examUid/students/:studentDbId/attempts"
          element={<StudentAttemptsPage />}
        />

        <Route
          path="exams/:examUid/results"
          element={<ResultsPage />}
        />

        <Route
          path="exams/:examUid/leaderboard"
          element={<LeaderboardPage />}
        />

        <Route
          path="ai/generate"
          element={<AIGeneratePage />}
        />

        <Route
          path="ai/history"
          element={<AIHistoryPage />}
        />

        <Route
          path="ai/preview/:requestId"
          element={<AIPreviewPage />}
        />

        <Route
          path="students"
          element={<StudentsPage />}
        />

        <Route
          path="academic-structure"
          element={<AcademicStructurePage />}
        />

        <Route
          path="academic-structure/classes/:classId/sections"
          element={<SectionsPage />}
        />

        <Route
          path="subscription"
          element={<SubscriptionPage />}
        />
      </Route>
    </Routes>
  );
}