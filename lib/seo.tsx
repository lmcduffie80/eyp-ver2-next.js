// Single source of truth for public business details used in page metadata,
// structured data (JSON-LD), and the sitemap. Keep this in sync with the
// Google Business Profile — Google cross-checks name, phone, and location.

export const SITE_URL = 'https://www.externallyyoursproductions.com';

export const BUSINESS = {
  name: 'Externally Yours Productions, LLC',
  shortName: 'Externally Yours Productions',
  phone: '+1-229-326-5408',
  email: 'lee@externallyyoursproductions.com',
  city: 'Tifton',
  region: 'GA',
  postalCode: '31794',
  country: 'US',
  logo: `${SITE_URL}/EYP%20Logo_New.png`,
  // Add only cities you actually serve; this feeds Google's local results.
  areaServed: ['Tifton, GA', 'South Georgia', 'Georgia'],
  // Paste Facebook, Instagram, YouTube, TikTok, Google Business Profile URLs here.
  sameAs: [] as string[],
};

const ORG_ID = `${SITE_URL}/#business`;

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': ORG_ID,
    name: BUSINESS.name,
    alternateName: BUSINESS.shortName,
    description:
      'Wedding and event photography, videography, and DJ entertainment based in Tifton, Georgia, serving South Georgia.',
    url: SITE_URL,
    logo: BUSINESS.logo,
    image: BUSINESS.logo,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.region,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.country,
    },
    areaServed: BUSINESS.areaServed,
    ...(BUSINESS.sameAs.length ? { sameAs: BUSINESS.sameAs } : {}),
    makesOffer: ['Photography', 'Videography', 'DJ Entertainment'].map((name) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name },
    })),
  };
}

export function serviceJsonLd(options: { name: string; serviceType: string; path: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: options.name,
    serviceType: options.serviceType,
    description: options.description,
    url: `${SITE_URL}${options.path}`,
    provider: { '@id': ORG_ID },
    areaServed: BUSINESS.areaServed,
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
