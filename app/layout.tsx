import React from 'react';
import type { Metadata } from "next";
import Script from 'next/script';
import "./globals.css";
import { inter, robotoMono } from './fonts';
import { SITE_URL, BUSINESS, JsonLd, localBusinessJsonLd } from '@/lib/seo';

const defaultDescription =
  'Wedding & event photography, videography, and DJ entertainment in Tifton, GA. Externally Yours Productions serves South Georgia weddings, proms, parties, and corporate events.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Externally Yours Productions | Photography, Videography & DJ in Tifton, GA',
    template: '%s | Externally Yours Productions',
  },
  description: defaultDescription,
  keywords: [
    'Tifton photographer',
    'Tifton wedding photographer',
    'South Georgia wedding photographer',
    'Tifton videographer',
    'South Georgia wedding videographer',
    'Tifton DJ',
    'South Georgia wedding DJ',
    'event DJ Tifton GA',
    'photography videography DJ package',
    'Externally Yours Productions',
  ],
  applicationName: BUSINESS.shortName,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: BUSINESS.name,
    locale: 'en_US',
    url: '/',
    title: 'Externally Yours Productions | Photography, Videography & DJ in Tifton, GA',
    description: defaultDescription,
    images: [{ url: '/EYP Logo_New.png', alt: BUSINESS.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Externally Yours Productions | Photography, Videography & DJ in Tifton, GA',
    description: defaultDescription,
    images: ['/EYP Logo_New.png'],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/EYP Logo_New.png",
  },
};

// Viewport configuration (Next.js 14+ API)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://www.honeybook.com" />
        <link rel="preconnect" href="https://widget.honeybook.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <JsonLd data={localBusinessJsonLd()} />
        {children}
        <Script
          src="/cookie-consent.js"
          strategy="afterInteractive"
        />
        <Script
          src="/analytics.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

