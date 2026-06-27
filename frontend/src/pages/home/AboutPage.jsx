import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";

import AboutHeroSection from "../../components/landing/about/AboutHeroSection";
import MissionSection from "../../components/landing/about/MissionSection";
import WhyIndiaEduCoreSection from "../../components/landing/about/WhyIndiaEduCoreSection";
import ValuesSection from "../../components/landing/about/ValuesSection";
import SEO from "../../components/common/SEO"

export default function AboutPage() {
  return (
    <>

      <SEO
        title="About Us | IndiaEduCore"
        description="Learn about our mission and vision to transform assessments using AI."
        url="/about"
      />

      <Navbar />

      <AboutHeroSection />

      <MissionSection />

      <WhyIndiaEduCoreSection />

      <ValuesSection />

      <Footer />
    </>
  );
}