import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import SEO from "../../components/common/SEO"
import ContactHeroSection from "../../components/landing/contact/ContactHeroSection";
import ContactInfoSection from "../../components/landing/contact/ContactInfoSection";
import ContactFormSection from "../../components/landing/contact/ContactFormSection";

export default function ContactPage() {

  const contactPageSchema = {

  "@context": "https://schema.org",

  "@type": "ContactPage",

  name: "Contact Us | IndiaEduCore",

  url: "https://indiaeducore.com/contact",

  description:
    "Contact IndiaEduCore for product information, support, and demo requests.",

  publisher: {

    "@type": "Organization",

    name: "IndiaEduCore",

    url: "https://indiaeducore.com"

  }

};

  return (
    <>

      <SEO
        title="Contact Us | IndiaEduCore"
        description="Contact IndiaEduCore for demo requests and support."
        url="/contact"
        structuredData={contactPageSchema}
      />

      <Navbar />

      <ContactHeroSection />

      <ContactInfoSection />

      <ContactFormSection />


      <Footer />

    </>
  );

}