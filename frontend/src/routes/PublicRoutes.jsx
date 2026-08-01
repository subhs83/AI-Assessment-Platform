import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import { useAuthStore } from "../store/authStore";
import { getDashboardPath } from "../utils/getDashboardPath";
import BrandLoading from "../components/loading/BrandLoading"

const HomePage = lazy(() => import("../pages/home/HomePage"));
const FeaturesPage = lazy(() => import("../pages/home/FeaturesPage"));
const ContactPage = lazy(() => import("../pages/home/ContactPage"));
const DemoPage = lazy(() => import("../pages/home/DemoPage"));
const AboutPage = lazy(() => import("../pages/home/AboutPage"));
const PricingPage = lazy(() => import("../pages/home/PricingPage"));
const PrivacyPage = lazy(() => import("../pages/home/PrivacyPage"));
const TermsPage = lazy(() => import("../pages/home/TermsPage"));


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
    <Suspense
    fallback={<BrandLoading message="Loading..." />}
>
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

  </Suspense>
  );
}