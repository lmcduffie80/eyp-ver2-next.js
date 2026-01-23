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

  // Load script inline - ensure container exists first
  useEffect(() => {
    let mounted = true;
    
    const loadScript = () => {
      if (!mounted || !containerRef.current) {
        return false;
      }

      const container = containerRef.current;
      
      // Verify container is actually in the DOM
      if (!document.body.contains(container)) {
        console.log('⏳ Container not in DOM yet, retrying...');
        return false;
      }

      // Check if widget already loaded in this container
      if (container.querySelector('iframe, form')) {
        // Widget already loaded, don't re-initialize
        return true;
      }
      
      // Check if script already loaded
      const existingScript = document.querySelector('script[src*="placement-controller.min.js"]');
      if (existingScript) {
        // Script already loaded, trigger scan
        // Initialize and force scan multiple times
        window._HB_ = window._HB_ || {};
        window._HB_.pid = '64f2adb3998a8300079826c0';
        
        // Get container reference
        const container = containerRef.current;
        if (!container) {
          console.warn('Container ref not available');
          return true;
        }
        
        // Ensure container is ready
        Object.assign(container.style, {
          display: 'block',
          width: '100%',
          minHeight: '600px',
          position: 'relative',
          visibility: 'visible',
          opacity: '1'
        });
        
        // Aggressive retry with multiple methods
        [0, 50, 100, 200, 500, 1000, 2000, 3000, 5000].forEach(delay => {
          setTimeout(() => {
            if (!mounted || !containerRef.current) return;
            
            const currentContainer = containerRef.current;
            
            window._HB_.pid = '64f2adb3998a8300079826c0';
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new Event('DOMContentLoaded'));
            window.dispatchEvent(new CustomEvent('hb-widget-init'));
            
            if (window._HB_) {
              // Try all available methods
              ['scan', 'loadWidgets', 'init', 'refresh', 'reload'].forEach(method => {
                if (typeof (window._HB_ as any)[method] === 'function') {
                  try {
                    // Call method silently
                    (window._HB_ as any)[method]();
                  } catch {
                    // Ignore
                  }
                }
              });
            }
            
            // Check if widget loaded
            const hasWidget = currentContainer.querySelector('iframe, form, [id*="hb-widget"]');
            if (hasWidget) {
              // Widget loaded successfully - stop retries
              return;
            } else if (delay === 5000) {
              console.warn('⚠️ Widget still not loaded after 5 seconds');
              
              // Detailed debug info
              const debugInfo: any = {
                containerInDOM: document.body.contains(currentContainer),
                containerClass: currentContainer.className,
                containerChildren: currentContainer.children.length,
                containerHTML: currentContainer.innerHTML || '(empty)',
                containerRect: currentContainer.getBoundingClientRect(),
                _HB_exists: !!window._HB_,
                _HB_pid: window._HB_?.pid,
                _HB_keys: window._HB_ ? Object.keys(window._HB_) : []
              };
              
              // Check for all containers with hb class
              const allHBContainers = document.querySelectorAll('[class*="hb-p-"], [data-hb-pid]');
              debugInfo.allHBContainers = allHBContainers.length;
              debugInfo.allHBContainersDetails = Array.from(allHBContainers).map(el => ({
                class: el.className,
                id: el.id,
                children: el.children.length,
                inDOM: document.body.contains(el)
              }));
              
              // Check for any iframes in document
              const allIframes = document.querySelectorAll('iframe');
              debugInfo.allIframes = allIframes.length;
              debugInfo.iframeDetails = Array.from(allIframes).map(iframe => ({
                src: iframe.src,
                id: iframe.id,
                parent: iframe.parentElement?.tagName,
                parentClass: iframe.parentElement?.className
              }));
              
              // Log _HB_ object structure (without functions)
              if (window._HB_) {
                debugInfo._HB_structure = {};
                Object.keys(window._HB_).forEach(key => {
                  const value = (window._HB_ as any)[key];
                  if (typeof value !== 'function') {
                    debugInfo._HB_structure[key] = value;
                  } else {
                    debugInfo._HB_structure[key] = '[Function]';
                  }
                });
              }
              
              console.log('Final debug:', debugInfo);
              
              // Try one last manual attempt
              console.log('🔄 Attempting final manual injection...');
              if (window._HB_ && typeof (window._HB_ as any).loadWidgets === 'function') {
                try {
                  (window._HB_ as any).loadWidgets();
                } catch (e) {
                  console.error('Error calling loadWidgets:', e);
                }
              }
            }
          }, delay);
        });
        return true;
      }

      // Initialize _HB_ before script loads
      window._HB_ = window._HB_ || {};
      window._HB_.pid = '64f2adb3998a8300079826c0';
      
      // Create script element exactly like original embed
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://widget.honeybook.com/assets_users_production/websiteplacements/placement-controller.min.js';
      
      // Insert using original embed pattern (before first script)
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
      
      script.onload = () => {
        if (!mounted || !containerRef.current) return;
        console.log('✅ Honeybook script loaded, waiting for widget...');
        
        const container = containerRef.current;
        
        // Watch for widget injection with MutationObserver
        const observer = new MutationObserver(() => {
          const hasWidget = container.querySelector('iframe, form, [id*="hb-widget"]');
          if (hasWidget) {
            observer.disconnect();
          }
        });
        
        observer.observe(container, {
          childList: true,
          subtree: true,
          attributes: true
        });
        
        // Trigger scan multiple times with delays
        [0, 100, 300, 500, 1000, 2000].forEach(delay => {
          setTimeout(() => {
            if (!mounted || !containerRef.current) return;
            
            if (window._HB_) {
              window._HB_.pid = '64f2adb3998a8300079826c0';
              window.dispatchEvent(new Event('resize'));
              
              // Try all methods
              ['scan', 'loadWidgets', 'init', 'refresh'].forEach(method => {
                if (typeof (window._HB_ as any)[method] === 'function') {
                  try {
                    (window._HB_ as any)[method]();
                  } catch {
                    // Ignore
                  }
                }
              });
            }
          }, delay);
        });
        
        // Cleanup observer after 10 seconds
        setTimeout(() => {
          observer.disconnect();
          if (!container.querySelector('iframe, form')) {
            console.warn('⚠️ Widget did not load after 10 seconds');
            console.log('Container state:', {
              innerHTML: container.innerHTML,
              children: container.children.length,
              inDOM: document.body.contains(container)
            });
          }
        }, 10000);
      };
      
      console.log('✅ Script injection initiated');
      return true;
    };

    // Try immediately, then retry if needed
    if (!loadScript()) {
      const retryTimer = setTimeout(() => {
        if (mounted) loadScript();
      }, 200);
      return () => {
        mounted = false;
        clearTimeout(retryTimer);
      };
    }

    return () => {
      mounted = false;
    };
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
            } catch {
              // Ignore
            }
          }
          
          // Then try loadWidgets
          if (typeof (window._HB_ as any).loadWidgets === 'function') {
            try {
              (window._HB_ as any).loadWidgets();
            } catch {
              // Ignore
            }
          }

          // Then other methods
          const otherMethods = ['init', 'refresh', 'reload'];
          otherMethods.forEach(method => {
            if (typeof (window._HB_ as any)[method] === 'function') {
              try {
                (window._HB_ as any)[method]();
              } catch {
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

