import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import SEO from "../../components/common/SEO"
import ContactHeroSection from "../../components/landing/contact/ContactHeroSection";
import ContactInfoSection from "../../components/landing/contact/ContactInfoSection";
import ContactFormSection from "../../components/landing/contact/ContactFormSection";

export default function ContactPage() {

  return (
    <>

      <SEO
        title="Contact IndiaEduCore"
        description="Get in touch with the IndiaEduCore team for product demos, sales inquiries, partnerships, or technical support."
        url="/contact"
      />

      <Navbar />

      <ContactHeroSection />

      <ContactInfoSection />

      <ContactFormSection />


      <Footer />

    </>
  );

}