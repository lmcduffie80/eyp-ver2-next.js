'use client';

import { useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Load script inline right after container (like original embed)
  useEffect(() => {
    if (!containerRef.current) return;

    // Check if script already loaded globally
    const existingScript = document.querySelector('script[src*="placement-controller.min.js"]');
    if (existingScript) {
      console.log('✅ Honeybook script already loaded globally');
      return;
    }

    // Load script inline exactly like original embed
    const container = containerRef.current;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://widget.honeybook.com/assets_users_production/websiteplacements/placement-controller.min.js';
    
    // Initialize _HB_ before script loads
    window._HB_ = window._HB_ || {};
    window._HB_.pid = '64f2adb3998a8300079826c0';
    
    // Insert script right after container (like original embed)
    if (container.parentNode) {
      container.parentNode.insertBefore(script, container.nextSibling);
    }
  }, []);

  // Initialize widget when component mounts or pathname changes
  useEffect(() => {
    // Wait for container to be ready and stable
    const initTimer = setTimeout(() => {
      if (!containerRef.current) {
        console.warn('Container ref not available');
        return;
      }

      const container = containerRef.current;
      
      // Ensure container is visible and ready - set all styles at once
      Object.assign(container.style, {
        display: 'block',
        width: '100%',
        minHeight: '600px',
        position: 'relative',
        visibility: 'visible',
        opacity: '1',
        overflow: 'visible'
      });

      // Verify container is in DOM
      if (!document.body.contains(container)) {
        console.warn('Container not in DOM');
        return;
      }

      // Initialize _HB_ immediately
      window._HB_ = window._HB_ || {};
      window._HB_.pid = '64f2adb3998a8300079826c0';

      // Function to force widget initialization
      const forceInit = () => {
        // Double-check container is still in DOM
        if (!containerRef.current || !document.body.contains(containerRef.current)) {
          return;
        }

        // Ensure PID is set
        if (window._HB_) {
          window._HB_.pid = '64f2adb3998a8300079826c0';
        }

        // Trigger resize event (most important for Honeybook)
        window.dispatchEvent(new Event('resize'));

        // Try all initialization methods
        if (window._HB_) {
          // Try scan first (most common method)
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

          // Then other methods
          const otherMethods = ['init', 'refresh', 'reload'];
          otherMethods.forEach(method => {
            if (typeof (window._HB_ as any)[method] === 'function') {
              try {
                (window._HB_ as any)[method]();
              } catch (e) {
                // Ignore
              }
            }
          });
        }

        // Check if widget loaded - check for multiple possible indicators
        const iframe = container.querySelector('iframe');
        const form = container.querySelector('form');
        const hbElements = container.querySelectorAll('[id*="hb"], [class*="hb-widget"], [class*="hb-"]');
        
        if (iframe) {
          console.log('✅ Honeybook iframe found!', {
            src: iframe.getAttribute('src'),
            width: iframe.getAttribute('width'),
            height: iframe.getAttribute('height'),
            style: iframe.getAttribute('style')
          });
          return true;
        }
        
        if (form) {
          console.log('✅ Honeybook form found!', form);
          return true;
        }
        
        if (hbElements.length > 0) {
          console.log(`✅ Found ${hbElements.length} Honeybook element(s):`, Array.from(hbElements).map(el => ({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            innerHTML: el.innerHTML.substring(0, 50)
          })));
          return true;
        }
        
        // Log container state for debugging
        const containerState = {
          innerHTML: container.innerHTML || '(empty)',
          innerHTMLLength: container.innerHTML.length,
          children: container.children.length,
          childDetails: Array.from(container.children).map(child => ({
            tag: child.tagName,
            id: child.id,
            className: child.className,
            innerHTML: child.innerHTML.substring(0, 100)
          })),
          computedStyle: {
            display: window.getComputedStyle(container).display,
            visibility: window.getComputedStyle(container).visibility,
            opacity: window.getComputedStyle(container).opacity,
            width: window.getComputedStyle(container).width,
            height: window.getComputedStyle(container).height
          }
        };
        console.log('🔍 Container state during init:', JSON.stringify(containerState, null, 2));
        
        // Also check for any iframes in the entire document
        const allIframes = document.querySelectorAll('iframe');
        if (allIframes.length > 0) {
          console.log(`🔍 Found ${allIframes.length} iframe(s) in document:`, Array.from(allIframes).map(iframe => ({
            src: iframe.src,
            id: iframe.id,
            className: iframe.className,
            parentElement: iframe.parentElement?.tagName,
            parentId: iframe.parentElement?.id,
            parentClassName: iframe.parentElement?.className
          })));
        }
        
        return false;
      };

      // Log initial container state with detailed info
      const initialState = {
        inDOM: document.body.contains(container),
        className: container.className,
        id: container.id,
        hasDataPid: container.hasAttribute('data-hb-pid'),
        children: container.children.length,
        innerHTML: container.innerHTML || '(empty)',
        computedStyle: {
          display: window.getComputedStyle(container).display,
          visibility: window.getComputedStyle(container).visibility,
          opacity: window.getComputedStyle(container).opacity,
          width: window.getComputedStyle(container).width,
          height: window.getComputedStyle(container).height
        }
      };
      console.log('📦 Initial container state:', JSON.stringify(initialState, null, 2));
      console.log('📦 Container element:', container);

      // Check if script is loaded
      const checkAndInit = () => {
        const script = document.querySelector('script[src*="honeybook.com"]') as HTMLScriptElement;
        if (script && script.src && script.src.includes('placement-controller')) {
          console.log('✅ Honeybook script found, initializing widget...');
          
          // Wait a bit for script to fully initialize
          setTimeout(() => {
            // Try initialization with multiple attempts
            const attempts = [0, 200, 500, 1000, 2000, 3000];
            let loaded = false;
            
            attempts.forEach((delay) => {
              setTimeout(() => {
                if (!loaded && containerRef.current) {
                  const result = forceInit();
                  if (result) {
                    loaded = true;
                    console.log('🎉 Widget loaded successfully!');
                  } else if (delay === attempts[attempts.length - 1]) {
                    console.warn('⚠️ Honeybook widget did not load after all attempts');
                    console.log('📊 Final container state:', {
                      inDOM: document.body.contains(container),
                      className: container.className,
                      id: container.id,
                      hasDataPid: container.hasAttribute('data-hb-pid'),
                      children: container.children.length,
                      innerHTML: container.innerHTML || '(empty)',
                      allChildren: Array.from(container.children).map(child => ({
                        tag: child.tagName,
                        id: child.id,
                        className: child.className
                      }))
                    });
                  }
                }
              }, delay);
            });
          }, 300);
        } else {
          // Script not loaded yet, check again
          setTimeout(checkAndInit, 100);
        }
      };

      // Start checking
      checkAndInit();
    }, 200);

    return () => clearTimeout(initTimer);
  }, [pathname]);

  const handleOpenForm = () => {
    document.getElementById("open-honeybook")?.click();
  };

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
            <button
              onClick={handleOpenForm}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 2rem',
                background: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              Book Now
            </button>
          </div>
          <div 
            ref={containerRef} 
            key="honeybook-container"
            className="hb-p-64f2adb3998a8300079826c0-1"
            data-hb-pid="64f2adb3998a8300079826c0"
            data-honeybook-pid="64f2adb3998a8300079826c0"
            id="honeybook-contact-form"
            suppressHydrationWarning
            style={{ 
              display: 'block',
              width: '100%',
              minHeight: '600px',
              position: 'relative',
              visibility: 'visible',
              opacity: '1',
              overflow: 'visible'
            }}
          />
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

