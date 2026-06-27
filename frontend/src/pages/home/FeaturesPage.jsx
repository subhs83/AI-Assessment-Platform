import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import CTASection from "../../components/landing/CTASection";
import TeacherBenefitsSection from "../../components/landing/TeacherBenefitsSection";
import AcademicImpactSection from "../../components/landing/AcademicImpactSection";
import FeatureHeroSection from "../../components/landing/features/FeatureHeroSection";
import AIQuestionSection from "../../components/landing/features/AIQuestionSection";
import PlatformFeaturesSection from "../../components/landing/features/PlatformFeaturesSection";
import AnalyticsSection from "../../components/landing/features/AnalyticsSection";
import WorkflowSection from "../../components/landing/features/WorkflowSection";
import SEO from "../../components/common/SEO"

export default function FeaturesPage() {

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Features | IndiaEduCore",
    url: "https://indiaeducore.com/features",
    description:
      "Explore AI-powered question generation, online exams, analytics, and assessment workflows.",
    isPartOf: {
      "@type": "WebSite",
      name: "IndiaEduCore",
      url: "https://indiaeducore.com"
    }
  };
  return (
    <>

      <SEO
        title="Features | IndiaEduCore"
        description="Explore AI-powered question generation, analytics and assessment workflows."
        keywords="AI question generation, online exams, assessment platform"
        url="/features"
        structuredData={webPageSchema}
      />

      <Navbar />

      <FeatureHeroSection />

      <AIQuestionSection />

      <PlatformFeaturesSection />

      <AnalyticsSection />

      <WorkflowSection />

      <TeacherBenefitsSection />

      <AcademicImpactSection />

      <CTASection />

      <Footer />
    </>
  );
}