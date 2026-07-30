import { Routes, Route, Navigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";
import { getDashboardPath } from "../utils/getDashboardPath";

import HomePage from "../pages/home/HomePage";
import FeaturesPage from "../pages/home/FeaturesPage";
import ContactPage from "../pages/home/ContactPage";
import DemoPage from "../pages/home/DemoPage";
import AboutPage from "../pages/home/AboutPage";
import PricingPage from "../pages/home/PricingPage";
import PrivacyPage from "../pages/home/PrivacyPage";
import TermsPage from "../pages/home/TermsPage";


export default function PublicRoutes() {

  const user = useAuthStore(
    (s) => s.user
  );

  const isAuthenticated = useAuthStore(
    (s) => s.isAuthenticated
  );

  const authLoading = useAuthStore(
    (s) => s.authLoading
  );


  const isStandalone =
    window.matchMedia(
      "(display-mode: standalone)"
    ).matches;


  if (
    authLoading
  ) {
    return null;
  }


  if (
    isStandalone &&
    isAuthenticated &&
    user
  ) {
    return (
      <Navigate
        to={getDashboardPath(user)}
        replace
      />
    );
  }


  return (
    <Routes>

      <Route path="/" element={<HomePage />} />

      <Route path="/features" element={<FeaturesPage />} />

      <Route path="/contact" element={<ContactPage />} />

      <Route path="/demo" element={<DemoPage />} />

      <Route path="/about" element={<AboutPage />} />

      <Route path="/pricing" element={<PricingPage />} />

      <Route path="/privacy" element={<PrivacyPage />} />

      <Route path="/terms" element={<TermsPage />} />

    </Routes>
  );
}