
import Navbar from "../../components/landing/Navbar";
import HeroSection from "../../components/landing/HeroSection";
import StatsSection from "../../components/landing/StatsSection";
import AIFeaturesSection from "../../components/landing/AIFeaturesSection";
import FeaturesSection from "../../components/landing/FeaturesSection";
import HowItWorksSection from "../../components/landing/HowItWorksSection";
import AcademicImpactSection from "../../components/landing/AcademicImpactSection";
import TeacherBenefitsSection from "../../components/landing/TeacherBenefitsSection";
import FAQSection from "../../components/landing/FAQSection";
import CTASection from "../../components/landing/CTASection";
import Footer from "../../components/landing/Footer";
import SEO from "../../components/common/SEO";

export default function HomePage() {

  

  return (
    <div className="bg-white">

      <SEO
        title="IndiaEduCore – AI Powered Assessment Platform for Schools"
        description="IndiaEduCore is an AI-powered assessment platform for schools. Create exams from PDFs, images, topics, and text, conduct online assessments, analyze student performance, and simplify school evaluation workflows."
        url="/"
      />

      <Navbar />

      <HeroSection />

      <StatsSection />

      <AIFeaturesSection />

      <FeaturesSection />

      <HowItWorksSection />

      <TeacherBenefitsSection />

      <AcademicImpactSection />

      <FAQSection />

     <CTASection location="home_cta" />

      <Footer />

    </div>
  );
}