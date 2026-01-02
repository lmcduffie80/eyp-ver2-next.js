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
        
        // Method 2: Dispatch DOMContentLoaded event (some widgets listen for this)
        window.dispatchEvent(new Event('DOMContentLoaded'));
        
        // Method 3: Dispatch a custom event that Honeybook might listen for
        window.dispatchEvent(new CustomEvent('hb-widget-init'));
        
        // Method 4: Try to manually trigger widget by re-setting pid
        if (window._HB_) {
          const pid = window._HB_.pid;
          (window._HB_ as any).pid = undefined;
          setTimeout(() => {
            if (window._HB_) {
              window._HB_.pid = pid;
            }
          }, 10);
        }
        
        // Method 5: Try calling init if available
        if (window._HB_ && typeof (window._HB_ as any).init === 'function') {
          try {
            (window._HB_ as any).init();
          } catch (e) {
            // Ignore errors
          }
        }
        
        // Method 6: Try calling scan or refresh if available
        if (window._HB_) {
          if (typeof (window._HB_ as any).scan === 'function') {
            try {
              (window._HB_ as any).scan();
            } catch (e) {
              // Ignore errors
            }
          }
          if (typeof (window._HB_ as any).refresh === 'function') {
            try {
              (window._HB_ as any).refresh();
            } catch (e) {
              // Ignore errors
            }
          }
        }
        
        // Method 7: Try to find and manually initialize iframe if it exists
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
        const scriptElement = document.querySelector('script[src*="honeybook.com"]') as HTMLScriptElement;
        
        if (scriptElement) {
          // Check if script has loaded by checking if it has an onload handler or if _HB_ is available
          const isScriptReady = () => {
            // Check if window._HB_ exists and has the pid set
            if (window._HB_ && window._HB_.pid === '64f2adb3998a8300079826c0') {
              return true;
            }
            // Check if script element has loaded
            if (scriptElement.getAttribute('data-loaded') === 'true') {
              return true;
            }
            return false;
          };
          
          // If script is ready, initialize widget
          if (isScriptReady()) {
            scriptElement.setAttribute('data-loaded', 'true');
            initializeWidget();
            return;
          }
          
          // Script element exists but may not be ready yet
          // Listen for load event on the script element
          const handleScriptLoad = () => {
            scriptElement.setAttribute('data-loaded', 'true');
            initializeWidget();
          };
          
          // Check if script already loaded (for cached scripts)
          const scriptReadyState = (scriptElement as any).readyState;
          if (scriptReadyState === 'complete' || scriptReadyState === 'loaded') {
            handleScriptLoad();
            return;
          }
          
          scriptElement.addEventListener('load', handleScriptLoad);
          scriptElement.addEventListener('error', () => {
            // Silently handle errors - widget may still work
            console.warn('Honeybook widget script error (non-critical)');
          });
          
          // Fallback: try after delays
          const fallbackAttempts = [500, 1000, 2000, 3000];
          fallbackAttempts.forEach((delay) => {
            setTimeout(() => {
              if (isScriptReady() && !container.querySelector('iframe, form, [id*="hb"]')) {
                scriptElement.setAttribute('data-loaded', 'true');
                initializeWidget();
              }
            }, delay);
          });
        } else {
          // Script not loaded yet, check again
          setTimeout(checkScript, 100);
        }
      };
      
      // Function to initialize the widget once script is ready
      const initializeWidget = () => {
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
            <div 
              ref={containerRef} 
              className="hb-p-64f2adb3998a8300079826c0-1"
              data-hb-pid="64f2adb3998a8300079826c0"
            ></div>
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

