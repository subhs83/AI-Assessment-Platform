//App.js


import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import AnalyticsTracker from "./components/common/AnalyticsTracker";


import { ToastProvider } from "./components/ui/Toast";
import { useAuthStore } from "./store/authStore";
import ScrollToTop from "./components/common/ScrollToTop";
import GlobalLoadingOverlay from "./components/common/GlobalLoadingOverlay"
import BrandLoading from "./components/loading/BrandLoading"



import LoginPage from "./pages/login/LoginPage";
import ChangePasswordPage from "./pages/login/ChangePasswordPage";


import StudentRoutesGroup from "./routes/StudentRoutesGroup";
import TeacherRoutesGroup from "./routes/TeacherRoutesGroup";
import AdminRoutesGroup from "./routes/AdminRoutesGroup";
import SuperAdminRoutesGroup from "./routes/SuperAdminRoutesGroup";

import PublicRoutes from "./routes/PublicRoutes";



function AppContent() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />

      <AnalyticsTracker />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* Public */}
          <Route path="/*" element={<PublicRoutes />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/change-password"
            element={<ChangePasswordPage />}
          />

          {/* Student */}
          <Route
            path="/school/:schoolSlug/*"
            element={<StudentRoutesGroup />}
          />

          {/* Teacher */}
          <Route
            path="/school/:schoolSlug/teacher/*"
            element={<TeacherRoutesGroup />}
          />

          {/* Admin */}
          <Route
            path="/school/:schoolSlug/admin/*"
            element={<AdminRoutesGroup />}
          />

          {/* Super Admin */}
          <Route
            path="/super-admin/*"
            element={<SuperAdminRoutesGroup />}
          />

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

      <BrowserRouter>

        {authLoading ? (
          <BrandLoading message="Loading your workspace..." />
        ) : (
          <>
          <GlobalLoadingOverlay />
          <AppContent />
          </>
        )}

      </BrowserRouter>

    </ToastProvider>
  );

}