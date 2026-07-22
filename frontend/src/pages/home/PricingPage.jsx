import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import SEO from "../../components/common/SEO"
import PricingHeroSection from "../../components/landing/pricing/PricingHeroSection";
import PricingPlansSection from "../../components/landing/pricing/PricingPlansSection";
import PricingFAQSection from "../../components/landing/pricing/PricingFAQSection";

export default function PricingPage() {

  return (
    <>

      <SEO
        title="Pricing | IndiaEduCore"
        description="Explore simple and affordable pricing plans for schools. Start with a free trial and scale with AI-powered assessment tools designed for educators."
        url="/pricing"
      />

      <Navbar />

      <PricingHeroSection />

      <PricingPlansSection />

      <PricingFAQSection />


      <Footer />
    </>
  );
}