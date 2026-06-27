import { Helmet } from "react-helmet-async";

export default function SEO({
  title,
  description,
  keywords,
  url = "/",
  image = "https://indiaeducore.com/og-image.png",
}) {

  const fullUrl = `https://indiaeducore.com${url}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IndiaEduCore",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description,
    url: "https://indiaeducore.com",
    logo: "https://indiaeducore.com/logo.png",
    sameAs: [
      "https://linkedin.com/company/indiaeducore"
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR"
    }
  };

  return (

    <Helmet>

      {/* Primary SEO */}

      <title>{title}</title>

      <meta
        name="description"
        content={description}
      />

      <meta
        name="keywords"
        content={keywords}
      />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://indiaeducore.com${url}`} />
        <meta
          property="og:image"
          content="https://indiaeducore.com/og-image.png"
        />

      {/* Open Graph */}

      <meta
        property="og:type"
        content="website"
      />

      <meta
        property="og:title"
        content={title}
      />

      <meta
        property="og:description"
        content={description}
      />

      <meta
        property="og:url"
        content={fullUrl}
      />

      <meta
        property="og:image"
        content={image}
      />

      {/* Twitter */}

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={title}
      />

      <meta
        name="twitter:description"
        content={description}
      />

      <meta
        name="twitter:image"
        content={image}
      />

      {/* Structured Data */}

      {
  structuredData && (
    <script type="application/ld+json">
      {JSON.stringify(structuredData)}
    </script>
  )
}

    </Helmet>

  );

}