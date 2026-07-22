import { Helmet } from "react-helmet-async";

const SITE_URL = "https://indiaeducore.com";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export default function SEO({
  title,
  description,
  url = "/",
  image = DEFAULT_IMAGE,
}) {
  const fullUrl = `${SITE_URL}${url}`;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IndiaEduCore",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      "https://linkedin.com/company/indiaeducore",
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "IndiaEduCore",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description,
    url: SITE_URL,
    image,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };

  return (
    <Helmet>
      <html lang="en" />
      {/* Primary SEO */}
      <title>{title}</title>

      <meta
        name="description"
        content={description}
      />
      <meta
        name="robots"
        content="index,follow"
      />

      <link
        rel="canonical"
        href={fullUrl}
      />

      {/* Open Graph */}
      <meta
        property="og:type"
        content="website"
      />

      <meta
        property="og:site_name"
        content="IndiaEduCore"
      />

      <meta
        property="og:locale"
        content="en_IN"
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

      <meta
        property="og:image:width"
        content="1200"
      />

      <meta
        property="og:image:height"
        content="630"
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

      <meta
        name="twitter:url"
        content={fullUrl}
      />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      <script type="application/ld+json">
        {JSON.stringify(softwareSchema)}
      </script>
    </Helmet>
  );
}