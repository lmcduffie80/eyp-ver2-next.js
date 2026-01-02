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
    // Ensure Honeybook widget detects this container
    if (typeof window === 'undefined') return;
    
    // Wait for container to be in DOM
    const initWidget = () => {
      if (!containerRef.current) {
        setTimeout(initWidget, 50);
        return;
      }
      
      const container = containerRef.current;
      
      // Ensure container is visible and properly styled
      container.style.display = 'block';
      container.style.width = '100%';
      container.style.minHeight = '600px';
      
      // Ensure Honeybook global is set
      window._HB_ = window._HB_ || {};
      window._HB_.pid = '64f2adb3998a8300079826c0';
      
      // Function to trigger widget initialization
      const triggerWidget = () => {
        // Method 1: Trigger resize event (iframeSizer listens for this)
        window.dispatchEvent(new Event('resize'));
        
        // Method 2: Try to manually trigger widget by re-setting pid
        if (window._HB_) {
          const pid = window._HB_.pid;
          (window._HB_ as any).pid = undefined;
          setTimeout(() => {
            if (window._HB_) {
              window._HB_.pid = pid;
            }
          }, 10);
        }
        
        // Method 3: Try calling init if available
        if (window._HB_ && typeof (window._HB_ as any).init === 'function') {
          try {
            (window._HB_ as any).init();
          } catch (e) {
            // Ignore errors
          }
        }
        
        // Method 4: Try to find and manually initialize iframe if it exists
        const iframe = container.querySelector('iframe');
        if (iframe && (window as any).iFrameResize) {
          try {
            (window as any).iFrameResize({}, iframe);
          } catch (e) {
            // Ignore errors
          }
        }
      };
      
      // Check if widget script is loaded
      const checkScript = () => {
        const scriptLoaded = document.querySelector('script[src*="honeybook.com"]');
        
        if (scriptLoaded) {
          // Script is loaded - use MutationObserver to detect when widget injects content
          const observer = new MutationObserver(() => {
            const hasContent = container.querySelector('iframe, form, [id*="hb"], [class*="hb-"]');
            if (hasContent) {
              observer.disconnect();
            }
          });
          
          observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true
          });
          
          // Multiple attempts to trigger widget initialization
          const attempts = [0, 100, 300, 600, 1000, 2000, 3500];
          attempts.forEach((delay) => {
            setTimeout(() => {
              if (!container.querySelector('iframe, form, [id*="hb"]')) {
                triggerWidget();
              }
            }, delay);
          });
          
          // Cleanup observer after 15 seconds
          setTimeout(() => observer.disconnect(), 15000);
        } else {
          // Script not loaded yet, check again
          setTimeout(checkScript, 100);
        }
      };
      
      // Start checking for script
      checkScript();
    };
    
    // Start initialization
    initWidget();
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

