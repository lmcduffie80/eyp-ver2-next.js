'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ContactErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Contact component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section id="contact" className="contact-section">
          <div className="container">
            <h2 className="section-title">Get In Touch</h2>
            <div className="contact-content">
              <div className="contact-info">
                <h3>Contact Us</h3>
                <p><strong>Email:</strong> lee@externallyyoursproductions.com</p>
                <p><strong>Phone:</strong> 229-326-5408</p>
                <p><strong>Address:</strong> Tifton, Georgia 31794</p>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
