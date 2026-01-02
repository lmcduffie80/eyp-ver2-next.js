import type { Metadata } from "next";
import Script from "next/script";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Externally Yours Productions, LLC",
  description: "Professional video and film production services",
  icons: {
    icon: "/EYP Logo_New.png",
  },
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
        {/* HoneyBook script loaded once */}
        <Script
          src="https://widget.honeybook.com/assets_users_production/websiteplacements/placement-controller.min.js"
          strategy="afterInteractive"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

