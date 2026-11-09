import type { Metadata } from 'next';
import { JsonLd, serviceJsonLd } from '@/lib/seo';

const title = 'Wedding & Event Videographer in Tifton, GA';
const description =
  'Cinematic wedding videography, event coverage, promotional videos, and music videos in Tifton, GA and across South Georgia. Videography packages from Externally Yours Productions.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'Tifton videographer',
    'Tifton wedding videographer',
    'South Georgia wedding videographer',
    'wedding videography Georgia',
    'event videographer Tifton GA',
    'promotional video production South Georgia',
    'music video production Tifton',
  ],
  alternates: { canonical: '/videography' },
  openGraph: { title, description, url: '/videography' },
};

export default function VideographyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: 'Wedding & Event Videography',
          serviceType: 'Videography',
          path: '/videography',
          description,
        })}
      />
      {children}
    </>
  );
}
