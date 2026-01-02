'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    _HB_?: any;
  }
}

interface ContactProps {
  title?: string;
  description?: string;
}

export default function Contact({ title = "Let's Work Together", description = "Have a project in mind? We'd love to hear from you. Send us a message and we'll respond as soon as possible." }: ContactProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Load Honeybook widget - ensure it loads on every page
    if (typeof window !== 'undefined') {
      // Initialize Honeybook global object
      window._HB_ = window._HB_ || {};
      window._HB_.pid = '64f2adb3998a8300079826c0';
      
      // Check if script is already loaded
      const existingScript = document.querySelector('script[src*="honeybook.com"]');
      
      const loadHoneybookScript = () => {
        if (scriptLoadedRef.current) return;
        
        // Use the same IIFE pattern as the original HTML
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
        
        scriptLoadedRef.current = true;
      };
      
      if (!existingScript) {
        loadHoneybookScript();
      } else {
        scriptLoadedRef.current = true;
      }
      
      // Ensure widget container is ready and visible
      // Use a timeout to ensure DOM is ready
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.display = 'block';
          containerRef.current.style.width = '100%';
          containerRef.current.style.minHeight = '600px';
          
          // Force widget to re-initialize if script is already loaded
          if (existingScript && window._HB_ && window._HB_.pid) {
            // Clear and re-set the pid to trigger re-initialization
            const pid = window._HB_.pid;
            window._HB_.pid = undefined;
            setTimeout(() => {
              window._HB_.pid = pid;
            }, 100);
          }
        }
      }, 100);
    }
  }, []);

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        <div className="contact-content">
          <div className="contact-info">
            <h3>{title}</h3>
            <p>{description}</p>
            <p><strong>Email:</strong> lee@externallyyoursproductions.com</p>
            <p><strong>Phone:</strong> 229-326-5408</p>
            <p><strong>Address:</strong> Tifton, Georgia 31794</p>
          </div>
          <div ref={containerRef} className="hb-p-64f2adb3998a8300079826c0-1"></div>
          <img 
            height={1} 
            width={1} 
            style={{ display: 'none' }} 
            src="https://www.honeybook.com/p.png?pid=64f2adb3998a8300079826c0" 
            alt="" 
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}

