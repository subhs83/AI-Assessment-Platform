import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/home/HomePage";
import FeaturesPage from "../pages/home/FeaturesPage";
import ContactPage from "../pages/home/ContactPage";
import DemoPage from "../pages/home/DemoPage";
import AboutPage from "../pages/home/AboutPage";
import PricingPage from "../pages/home/PricingPage";
import PrivacyPage from "../pages/home/PrivacyPage";
import TermsPage from "../pages/home/TermsPage";

export default function PublicRoutes() {
  return (
    <Routes>

      <Route path="/" element={<HomePage />} />

      <Route
        path="/features"
        element={<FeaturesPage />}
      />

      <Route
        path="/contact"
        element={<ContactPage />}
      />

      <Route
        path="/demo"
        element={<DemoPage />}
      />

      <Route
        path="/about"
        element={<AboutPage />}
      />

      <Route
        path="/pricing"
        element={<PricingPage />}
      />

      <Route
        path="/privacy"
        element={<PrivacyPage />}
      />

      <Route
        path="/terms"
        element={<TermsPage />}
      />

    </Routes>
  );
}