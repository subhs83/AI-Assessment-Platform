import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import SEO from "../../components/common/SEO"
import DemoHeroSection from "../../components/landing/demo/DemoHeroSection";
import DemoBenefitsSection from "../../components/landing/demo/DemoBenefitsSection";
import DemoFormSection from "../../components/landing/demo/DemoFormSection";

export default function DemoPage() {

  
  return (
    <>

      <SEO
        title="Book a Free Demo | IndiaEduCore"
        description="Schedule a free IndiaEduCore demo and discover how AI-powered assessments, online exams, and analytics can simplify teaching and improve student evaluation."
        url="/demo"
      />

      <Navbar />

      <DemoHeroSection />

      <DemoBenefitsSection />

      <DemoFormSection />

      <Footer />
    </>
  );
}