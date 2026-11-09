import type { Metadata } from 'next';
import { JsonLd, serviceJsonLd } from '@/lib/seo';

const title = 'Wedding & Party DJ in Tifton, GA';
const description =
  'Wedding DJ and event DJ services in Tifton, GA and South Georgia — receptions, proms, graduations, birthday parties, and corporate events with professional sound and lighting.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'Tifton DJ',
    'Tifton wedding DJ',
    'South Georgia wedding DJ',
    'wedding DJ Georgia',
    'party DJ Tifton GA',
    'prom DJ South Georgia',
    'corporate event DJ Tifton',
  ],
  alternates: { canonical: '/dj-entertainment' },
  openGraph: { title, description, url: '/dj-entertainment' },
};

export default function DjEntertainmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: 'Wedding & Event DJ Entertainment',
          serviceType: 'DJ Entertainment',
          path: '/dj-entertainment',
          description,
        })}
      />
      {children}
    </>
  );
}
