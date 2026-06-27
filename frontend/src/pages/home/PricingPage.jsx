import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import SEO from "../../components/common/SEO"
import PricingHeroSection from "../../components/landing/pricing/PricingHeroSection";
import PricingPlansSection from "../../components/landing/pricing/PricingPlansSection";
import PricingFAQSection from "../../components/landing/pricing/PricingFAQSection";

export default function PricingPage() {

 const softwareApplicationSchema = {

  "@context": "https://schema.org",

  "@type": "SoftwareApplication",

  name: "IndiaEduCore",

  applicationCategory: "EducationalApplication",

  operatingSystem: "Web",

  url: "https://indiaeducore.com",

  description:
    "AI-powered assessment platform for schools and institutions.",

  offers: {

    "@type": "Offer",

    price: "0",

    priceCurrency: "INR"

  },

  publisher: {

    "@type": "Organization",

    name: "IndiaEduCore"

  }

};
  return (
    <>

      <SEO
        title="Pricing | IndiaEduCore"
        description="Flexible pricing plans for schools and institutions."
        url="/pricing"
        structuredData={softwareApplicationSchema}
      />

      <Navbar />

      <PricingHeroSection />

      <PricingPlansSection />

      <PricingFAQSection />


      <Footer />
    </>
  );
}