'use client';

import dynamic from 'next/dynamic';
import { ContactErrorBoundary } from './ContactErrorBoundary';

const Contact = dynamic(() => import('./Contact'), {
  ssr: false,
  loading: () => (
    <section id="contact" className="contact-section">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        <div className="contact-content">
          <div className="contact-info">
            <h3>Let&apos;s Work Together</h3>
            <p>Have a project in mind? We&apos;d love to hear from you.</p>
            <p><strong>Email:</strong> lee@externallyyoursproductions.com</p>
            <p><strong>Phone:</strong> 229-326-5408</p>
            <p><strong>Address:</strong> Tifton, Georgia 31794</p>
          </div>
          <div className="contact-form-wrapper">
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading contact form...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  ),
});

function ContactWithErrorBoundary(props: any) {
  return (
    <ContactErrorBoundary>
      <Contact {...props} />
    </ContactErrorBoundary>
  );
}

export default ContactWithErrorBoundary;
