import React from 'react';
import type { Metadata } from "next";
import Providers from "./providers";
import HoneybookErrorHandler from "./HoneybookErrorHandler";
import HoneybookLoader from "@/components/HoneybookLoader";
import "./globals.css";

// Force fresh build - Jan 23, 2026 02:00

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
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href="https://www.honeybook.com" />
        <link rel="preconnect" href="https://widget.honeybook.com" crossOrigin="anonymous" />
      </head>
      <body>
        <HoneybookErrorHandler />
        {/* Honeybook script is now loaded inline in Contact component */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

