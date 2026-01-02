'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    _HB_?: any;
  }
}

export default function Contact() {
  useEffect(() => {
    // Load Honeybook widget
    if (typeof window !== 'undefined' && !window._HB_) {
      window._HB_ = window._HB_ || {};
      window._HB_.pid = '64f2adb3998a8300079826c0';
      
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
      script.src = 'https://widget.honeybook.com/assets_users_production/websiteplacements/placement-controller.min.js';
      
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      }
    }
  }, []);

  return (
    <section id="contact" className="py-20">
      <div className="max-w-[1200px] mx-auto px-8">
        <h2 className="text-center text-4xl mb-12 text-primary">Get In Touch</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h3 className="text-2xl mb-4 text-primary">Let&apos;s Work Together</h3>
            <p className="text-text-light mb-6">
              Have a project in mind? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
            </p>
            <p className="text-text-light mb-4">
              <strong>Email:</strong> lee@externallyyoursproductions.com
            </p>
            <p className="text-text-light mb-4">
              <strong>Phone:</strong> 229-326-5408
            </p>
            <p className="text-text-light mb-4">
              <strong>Address:</strong> Tifton, Georgia 31794
            </p>
          </div>
          <div className="hb-p-64f2adb3998a8300079826c0-1 w-full min-h-[600px]">
            {/* Honeybook widget will be injected here */}
          </div>
        </div>
        <img 
          height={1} 
          width={1} 
          style={{ display: 'none' }} 
          src="https://www.honeybook.com/p.png?pid=64f2adb3998a8300079826c0" 
          alt="" 
          loading="lazy"
        />
      </div>
    </section>
  );
}

