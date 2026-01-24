'use client';

import React, { useEffect, useRef, useState } from 'react';

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
  const [honeyBookLoaded, setHoneyBookLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Simplified HoneyBook loading with fallback
  useEffect(() => {
    let mounted = true;
    
    const loadScript = () => {
      if (!mounted || !containerRef.current) {
        return false;
      }

      const container = containerRef.current;
      
      // Verify container is in DOM
      if (!document.body.contains(container)) {
        return false;
      }

      // Check if widget already loaded
      if (container.querySelector('iframe, form')) {
        setHoneyBookLoaded(true);
        return true;
      }
      
      // Check if script already loaded
      const existingScript = document.querySelector('script[src*="placement-controller.min.js"]');
      if (existingScript) {
        // Script already loaded from previous page navigation
        // Force HoneyBook to scan this NEW container multiple times
        window._HB_ = window._HB_ || {};
        window._HB_.pid = '64f2adb3998a8300079826c0';
        
        if (!container) {
          console.warn('Container ref not available');
          return true;
        }
        
        // Aggressive multi-attempt scanning for client-side navigation
        const scanAttempts = [0, 500, 1000, 2000, 3000, 4000, 6000];
        
        scanAttempts.forEach(delay => {
          setTimeout(() => {
            if (!mounted || !containerRef.current) return;
            
            const currentContainer = containerRef.current;
            
            // Check if widget already loaded
            const hasWidget = currentContainer.querySelector('iframe, form');
            if (hasWidget) {
              setHoneyBookLoaded(true);
              return;
            }
            
            // Force scan
            if (window._HB_ && typeof (window._HB_ as any).scan === 'function') {
              window._HB_.scan();
            }
          }, delay);
        });
        
        return true;
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
    };
  }, []);

  // Show fallback after timeout if HoneyBook doesn't load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!honeyBookLoaded) {
        setShowFallback(true);
      }
    }, 10000); // Give HoneyBook 10 seconds to load
    
    return () => clearTimeout(timer);
  }, [honeyBookLoaded]);

  // Handle fallback form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      // Use SendGrid API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          service: formData.get('service'),
          message: formData.get('message'),
        }),
      });
      
      if (response.ok) {
        setFormSubmitted(true);
        form.reset();
      } else {
        alert('Failed to send message. Please try again or email us directly at lee@externallyyoursproductions.com');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to send message. Please try again or email us directly at lee@externallyyoursproductions.com');
    } finally {
      setFormLoading(false);
    }
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
          </div>
          
          <div className="contact-form-wrapper">
            {/* HoneyBook Container - Try to load first */}
            <div 
              ref={containerRef} 
              className="hb-p-64f2adb3998a8300079826c0-1"
              data-hb-pid="64f2adb3998a8300079826c0"
              id="honeybook-contact-form"
              suppressHydrationWarning
              style={{ 
                display: honeyBookLoaded ? 'block' : 'none',
                width: '100%',
                minHeight: '600px',
              }}
            />
            
            {/* Loading Indicator */}
            {!honeyBookLoaded && !showFallback && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Loading contact form...</p>
              </div>
            )}
            
            {/* Fallback Contact Form */}
            {showFallback && (
              <div className="fallback-form">
                {formSubmitted ? (
                  <div className="success-message">
                    <h3>Thank You!</h3>
                    <p>Your message has been sent successfully. We'll get back to you as soon as possible.</p>
                    <button 
                      onClick={() => setFormSubmitted(false)}
                      className="submit-btn"
                      style={{ marginTop: '1rem' }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h3>Contact Form</h3>
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label htmlFor="name">Name *</label>
                        <input 
                          type="text" 
                          id="name" 
                          name="name" 
                          required 
                          disabled={formLoading}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input 
                          type="email" 
                          id="email" 
                          name="email" 
                          required 
                          disabled={formLoading}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input 
                          type="tel" 
                          id="phone" 
                          name="phone" 
                          disabled={formLoading}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="service">Service Type *</label>
                        <select 
                          id="service" 
                          name="service" 
                          required 
                          disabled={formLoading}
                        >
                          <option value="">Select a service...</option>
                          <option value="photography">Photography</option>
                          <option value="videography">Videography</option>
                          <option value="dj">DJ Entertainment</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="message">Message *</label>
                        <textarea 
                          id="message" 
                          name="message" 
                          rows={5} 
                          required 
                          disabled={formLoading}
                        />
                      </div>
                      
                      <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={formLoading}
                      >
                        {formLoading ? 'Sending...' : 'Send Message'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
            
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

