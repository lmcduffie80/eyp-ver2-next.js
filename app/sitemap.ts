import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number }[] = [
    { path: '', priority: 1 },
    { path: '/photography', priority: 0.9 },
    { path: '/videography', priority: 0.9 },
    { path: '/dj-entertainment', priority: 0.9 },
    { path: '/about', priority: 0.6 },
    { path: '/contact', priority: 0.7 },
  ];

  return pages.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority,
  }));
}
