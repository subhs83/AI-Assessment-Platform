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

  
  return (
    <>

      <SEO
        title="AI Assessment Platform Features | IndiaEduCore"
        description="Explore AI-powered exam creation, assessment, analytics, and school management features."
        url="/features"
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