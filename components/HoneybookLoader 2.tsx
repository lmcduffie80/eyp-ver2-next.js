'use client';

import Script from 'next/script';
import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    _HB_?: any;
  }
}

export default function HoneybookLoader() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize HoneyBook global immediately
    if (typeof window !== 'undefined') {
      window._HB_ = window._HB_ || {};
      window._HB_.pid = '64f2adb3998a8300079826c0';
    }
  }, []);

  // Function to trigger widget initialization
  const triggerInit = useCallback(() => {
    if (typeof window !== 'undefined' && window._HB_) {
      window._HB_.pid = '64f2adb3998a8300079826c0';
      
      // Wait a bit to ensure containers are in DOM
      setTimeout(() => {
        // Check if containers exist
        const containers = document.querySelectorAll('.hb-p-64f2adb3998a8300079826c0-1, [data-hb-pid="64f2adb3998a8300079826c0"]');
        if (containers.length > 0) {
          console.log(`Found ${containers.length} Honeybook container(s), triggering scan...`);
        }
        
        // Trigger resize event (most important)
        window.dispatchEvent(new Event('resize'));
        
        // Try scan first (most reliable method)
        if (typeof (window._HB_ as any).scan === 'function') {
          try {
            (window._HB_ as any).scan();
          } catch (e) {
            // Ignore
          }
        }
        
        // Then try loadWidgets
        if (typeof (window._HB_ as any).loadWidgets === 'function') {
          try {
            (window._HB_ as any).loadWidgets();
          } catch (e) {
            // Ignore
          }
        }
      }, 200);
    }
  }, []);

  // Trigger initialization on every route change
  useEffect(() => {
    triggerInit();
  }, [pathname, triggerInit]);

  // Also trigger on any click (for navigation links)
  useEffect(() => {
    const handleClick = () => {
      // Small delay to allow navigation to start
      setTimeout(() => {
        triggerInit();
      }, 200);
    };

    // Listen for clicks on navigation links
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [triggerInit]);

  return (
    <Script
      id="honeybook-global"
      strategy="afterInteractive"
      onLoad={() => {
        // Initialize immediately when script loads
        if (typeof window !== 'undefined' && window._HB_) {
          window._HB_.pid = '64f2adb3998a8300079826c0';
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            if (typeof (window._HB_ as any).loadWidgets === 'function') {
              try { (window._HB_ as any).loadWidgets(); } catch(e) {}
            }
            if (typeof (window._HB_ as any).scan === 'function') {
              try { (window._HB_ as any).scan(); } catch(e) {}
            }
          }, 100);
        }
      }}
      dangerouslySetInnerHTML={{
        __html: `
          (function(h,b,s,n,i,p,e,t) {
            if (document.querySelector('script[src="' + n + '"]')) return;
            h._HB_ = h._HB_ || {};h._HB_.pid = i;
            t=b.createElement(s);t.type="text/javascript";t.async=!0;t.src=n;
            t.onload = function() {
              if (h._HB_ && h._HB_.pid) {
                setTimeout(function() {
                  h.dispatchEvent(new Event('resize'));
                  if (typeof h._HB_.loadWidgets === 'function') {
                    try { h._HB_.loadWidgets(); } catch(e) {}
                  }
                  if (typeof h._HB_.scan === 'function') {
                    try { h._HB_.scan(); } catch(e) {}
                  }
                }, 50);
              }
            };
            e=b.getElementsByTagName(s)[0];e.parentNode.insertBefore(t,e);
          })(window,document,"script","https://widget.honeybook.com/assets_users_production/websiteplacements/placement-controller.min.js","64f2adb3998a8300079826c0");
        `,
      }}
    />
  );
}

