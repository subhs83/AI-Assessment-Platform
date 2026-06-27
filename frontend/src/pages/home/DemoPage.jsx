import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import SEO from "../../components/common/SEO"
import DemoHeroSection from "../../components/landing/demo/DemoHeroSection";
import DemoBenefitsSection from "../../components/landing/demo/DemoBenefitsSection";
import DemoFormSection from "../../components/landing/demo/DemoFormSection";

export default function DemoPage() {

  const demoPageSchema = {

  "@context": "https://schema.org",

  "@type": "WebPage",

  name: "Book Free Demo | IndiaEduCore",

  url: "https://indiaeducore.com/demo",

  description:
    "Schedule a free demo and discover how AI-powered assessments can simplify exam management.",

  potentialAction: {

    "@type": "ReserveAction",

    target: {

      "@type": "EntryPoint",

      urlTemplate:
        "https://indiaeducore.com/demo"

    },

    result: {

      "@type": "Reservation",

      name: "Demo Request"

    }

  }

};
  return (
    <>

      <SEO
        title="Book Free Demo | IndiaEduCore"
        description="Schedule a free demo and discover AI-powered assessment workflows."
        url="/demo"
        structuredData={demoPageSchema }
      />

      <Navbar />

      <DemoHeroSection />

      <DemoBenefitsSection />

      <DemoFormSection />

      <Footer />
    </>
  );
}