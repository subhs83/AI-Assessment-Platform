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
import SEO from "../../components/common/SEO"

export default function HomePage() {
  
       const organizationSchema = {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "IndiaEduCore",
          url: "https://indiaeducore.com",
          logo: "https://indiaeducore.com/logo.png",
          sameAs: [
            "https://linkedin.com/company/indiaeducore"
          ]
        };
  
  return (
    <div className="bg-white">
   

        <SEO
          title="AI Assessment Platform for Schools | IndiaEduCore"
          description="Generate questions from PDFs, images, topics and text."
          keywords="AI assessment platform, exam software"
          url="/"
          structuredData={organizationSchema}
        />
      <SEO
       title="IndiaEduCore-AI Powered Assessment Platform"
        description="Generate questions from PDFs, images, topics and text. Conduct exams, analyze performance and simplify assessment workflows."
        keywords="AI assessment platform, AI question generator, school exam software, online exams, IndiaEduCore"
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

      <CTASection />

      <Footer />

    </div>
  );
}