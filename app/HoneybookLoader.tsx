'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    _HB_?: any;
  }
}

export default function HoneybookLoader() {
  useEffect(() => {
    // Load Honeybook widget script once globally
    if (typeof window !== 'undefined') {
      // Check if script is already loaded
      const existingScript = document.querySelector('script[src*="honeybook.com"]');
      
      if (!existingScript) {
        // Initialize Honeybook global object
        window._HB_ = window._HB_ || {};
        window._HB_.pid = '64f2adb3998a8300079826c0';
        
        // Load the script using the exact pattern from original HTML
        (function(h: any, b: Document, s: string, n: string, i: string, p?: any, e?: Element, t?: HTMLScriptElement) {
          h._HB_ = h._HB_ || {};
          h._HB_.pid = i;
          t = b.createElement(s) as HTMLScriptElement;
          t.type = "text/javascript";
          t.async = true;
          t.defer = true;
          t.src = n;
          e = b.getElementsByTagName(s)[0];
          if (e && e.parentNode) {
            e.parentNode.insertBefore(t, e);
          } else {
            b.head.appendChild(t);
          }
        })(window, document, "script", "https://widget.honeybook.com/assets_users_production/websiteplacements/placement-controller.min.js", "64f2adb3998a8300079826c0");
      }
    }
  }, []);

  return null;
}

