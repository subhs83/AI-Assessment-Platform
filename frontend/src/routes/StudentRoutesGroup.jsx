import { Routes, Route } from "react-router-dom";

// Student Pages
import QuizInitPage from "../pages/student/QuizInitPage";
import RegisterPage from "../pages/student/RegisterPage";
import ExamPage from "../pages/student/ExamPage";
import Result from "../pages/student/Result";

export default function StudentRoutesGroup() {
  return (
    <Routes>
      <Route
        path="quiz/:quizCode"
        element={<QuizInitPage />}
      />

      <Route
        path="attempt/:attemptId/:index"
        element={<ExamPage />}
      />

      <Route
        path="quiz/:quizCode/register"
        element={<RegisterPage />}
      />

      <Route
        path="result/:attemptId"
        element={<Result />}
      />
    </Routes>
  );
}