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
        title="About IndiaEduCore"
        description="Learn about IndiaEduCore, our mission to simplify school assessments with AI, and our commitment to empowering teachers through technology."
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