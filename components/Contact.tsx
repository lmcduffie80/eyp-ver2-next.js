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

  useEffect(() => {
    // Ensure container is visible and properly styled
    if (containerRef.current) {
      const container = containerRef.current;
      container.style.display = 'block';
      container.style.width = '100%';
      container.style.minHeight = '600px';
    }

    // Initialize HoneyBook global object
    if (typeof window !== 'undefined') {
      window._HB_ = window._HB_ || {};
      window._HB_.pid = '64f2adb3998a8300079826c0';

      // Wait for script to load and trigger widget detection
      const checkScript = () => {
        const scriptLoaded = document.querySelector('script[src*="honeybook.com"]');
        
        if (scriptLoaded) {
          // Script is loaded - trigger widget to detect container
          // Multiple attempts to ensure widget initializes
          const attempts = [0, 200, 500, 1000, 2000];
          attempts.forEach((delay) => {
            setTimeout(() => {
              // Trigger resize event (widgets often listen for this)
              window.dispatchEvent(new Event('resize'));
              
              // Try to trigger widget initialization
              if (window._HB_ && typeof (window._HB_ as any).init === 'function') {
                try {
                  (window._HB_ as any).init();
                } catch (e) {
                  // Ignore errors
                }
              }
            }, delay);
          });
        } else {
          // Script not loaded yet, check again
          setTimeout(checkScript, 100);
        }
      };

      // Start checking for script
      checkScript();
    }
  }, []);

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

