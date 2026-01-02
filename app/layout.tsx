import type { Metadata } from "next";
import Script from "next/script";
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
        <Script
          id="honeybook-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window._HB_ = window._HB_ || {};
              window._HB_.pid = '64f2adb3998a8300079826c0';
            `,
          }}
        />
        <Script
          id="honeybook-widget"
          strategy="afterInteractive"
          src="https://widget.honeybook.com/assets_users_production/websiteplacements/placement-controller.min.js"
          async
          defer
          onLoad={() => {
            // Script loaded - dispatch event so Contact components know it's ready
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('honeybook-script-loaded'));
            }
          }}
          onError={(e) => {
            // Silently handle Honeybook script errors - the widget may still work
            console.warn('Honeybook widget script error (non-critical):', e);
          }}
        />
        {children}
      </body>
    </html>
  );
}

