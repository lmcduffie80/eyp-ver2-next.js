'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [honeyBookLoaded, setHoneyBookLoaded] = useState(false);

  // Simplified HoneyBook loading with fallback
  useEffect(() => {
    let mounted = true;
    
    // Reset loading state when pathname changes
    setHoneyBookLoaded(false);
    
    const loadScript = () => {
      if (!mounted || !containerRef.current) {
        return false;
      }

      const container = containerRef.current;
      
      // Verify container is in DOM
      if (!document.body.contains(container)) {
        return false;
      }

      // Initialize _HB_ before script loads
      window._HB_ = window._HB_ || {};
      window._HB_.pid = '64f2adb3998a8300079826c0';
      
      // Create script element
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://widget.honeybook.com/assets_users_production/websiteplacements/placement-controller.min.js';
      
      script.onload = () => {
        if (!mounted || !containerRef.current) return;
        
        // Simple initialization with multiple checks
        setTimeout(() => {
          if (window._HB_ && typeof (window._HB_ as any).scan === 'function') {
            window._HB_.scan();
          }
          
          // Check if loaded after 2 seconds
          setTimeout(() => {
            if (containerRef.current) {
              const hasWidget = containerRef.current.querySelector('iframe, form');
              if (hasWidget) {
                setHoneyBookLoaded(true);
              }
            }
          }, 2000);
          
          // Check again at 4 seconds (in case widget loads slowly)
          setTimeout(() => {
            if (containerRef.current) {
              const hasWidget = containerRef.current.querySelector('iframe, form');
              if (hasWidget) {
                setHoneyBookLoaded(true);
              }
            }
          }, 4000);
          
          // Final check at 6 seconds
          setTimeout(() => {
            if (containerRef.current) {
              const hasWidget = containerRef.current.querySelector('iframe, form');
              if (hasWidget) {
                setHoneyBookLoaded(true);
              }
            }
          }, 6000);
        }, 500);
      };
      
      script.onerror = () => {
        // Script failed to load, will show fallback
      };
      
      document.head.appendChild(script);
      return true;
    };

    // Try loading script
    loadScript();

    return () => {
      mounted = false;
      // Clean up old HoneyBook widget iframe/form if it exists
      if (containerRef.current) {
        const oldWidget = containerRef.current.querySelector('iframe, form');
        if (oldWidget) {
          oldWidget.remove();
        }
      }
      // Remove the HoneyBook script entirely to force fresh reload
      const honeyBookScript = document.querySelector('script[src*="placement-controller.min.js"]');
      if (honeyBookScript) {
        honeyBookScript.remove();
      }
      // Clear HoneyBook global state
      if (window._HB_) {
        delete window._HB_;
      }
    };
  }, [pathname]);

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
          
          <div className="contact-form-wrapper">
            {/* HoneyBook Container */}
            <div 
              ref={containerRef} 
              className="hb-p-64f2adb3998a8300079826c0-1"
              data-hb-pid="64f2adb3998a8300079826c0"
              id="honeybook-contact-form"
              suppressHydrationWarning
              style={{ 
                width: '100%',
                minHeight: '600px',
                position: honeyBookLoaded ? 'relative' : 'absolute',
                left: honeyBookLoaded ? '0' : '-9999px',
                opacity: honeyBookLoaded ? '1' : '0',
              }}
            />
            
            {/* Loading Indicator - shown until HoneyBook loads */}
            {!honeyBookLoaded && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Loading contact form...</p>
              </div>
            )}
            
            {/* HoneyBook tracking pixel */}
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
      </div>
    </section>
  );
}

