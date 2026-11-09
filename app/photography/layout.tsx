import type { Metadata } from 'next';
import { JsonLd, serviceJsonLd } from '@/lib/seo';

const title = 'Wedding & Event Photographer in Tifton, GA';
const description =
  'Tifton, GA wedding photographer for South Georgia weddings, engagements, portraits, proms, and corporate events. View our photography packages from Externally Yours Productions.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'Tifton photographer',
    'Tifton wedding photographer',
    'South Georgia wedding photographer',
    'engagement photographer Tifton GA',
    'portrait photographer Tifton',
    'event photographer South Georgia',
    'prom photographer Tifton',
  ],
  alternates: { canonical: '/photography' },
  openGraph: { title, description, url: '/photography' },
};

export default function PhotographyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: 'Wedding & Event Photography',
          serviceType: 'Photography',
          path: '/photography',
          description,
        })}
      />
      {children}
    </>
  );
}
