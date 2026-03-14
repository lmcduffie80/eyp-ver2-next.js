import React from 'react';
import type { Metadata } from "next";
import Script from 'next/script';
import "./globals.css";
import { inter, robotoMono } from './fonts';

export const metadata: Metadata = {
  title: "Externally Yours Productions, LLC",
  description: "Professional video and film production services",
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

