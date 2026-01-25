'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Contact from '@/components/ContactWrapper';
import Link from 'next/link';
import Image from 'next/image';

export default function DJEntertainment() {
  const [pricingPackages, setPricingPackages] = useState<any[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);

  useEffect(() => {
    fetchPricingPackages();
  }, []);

  const fetchPricingPackages = async () => {
    try {
      setLoadingPricing(true);
      const response = await fetch('/api/pricing/packages?service_type=dj');
      if (response.ok) {
        const result = await response.json();
        setPricingPackages(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching pricing packages:', error);
    } finally {
      setLoadingPricing(false);
    }
  };

  return (
    <main>
      <Navigation />
      {/* Hero Section */}
      <section 
        id="home" 
        className="hero"
        style={{
          height: '80vh',
          background: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80') center/cover"
        }}
      >
        <div className="hero-content">
          <h1>DJ Entertainment</h1>
          <p>High-energy professional DJs that bring positive energy and vibrant vibes to your event</p>
          <Link href="#contact" className="cta-button">Book Your DJ</Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">Our DJ Services</h2>
          <div className="about-content">
            <div className="about-text">
              <p>At Externally Yours Productions, LLC, we provide high-energy, professional DJ services that bring positive energy and vibrant vibes to your event. Our experienced DJs are skilled at reading the crowd and keeping the dance floor packed all night long.</p>
              <p>We use professional equipment and seamless mixing techniques to ensure your event has the perfect soundtrack. Whether you&apos;re celebrating a wedding, hosting a corporate event, or throwing a party, our DJs create an atmosphere that gets everyone moving.</p>
              <p>From the first song to the last, we work closely with you to understand your musical preferences and event style, ensuring every moment is perfectly timed and the energy stays high throughout your celebration.</p>
            </div>
            <Image
              src="/DJ Entertainment/mixer-1284507_1280.jpg"
              alt="DJ Mixing Board"
              width={600}
              height={400}
              className="about-image"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services">
        <div className="container">
          <h2 className="section-title">What We Offer</h2>
          <div className="services-grid">
            {/* Wedding DJ Services */}
            <div className="service-card-enhanced">
              <div className="service-icon-wrapper">
                <span className="service-icon-large">💍</span>
              </div>
              <h3>Wedding DJ Services</h3>
              <p>Professional wedding DJ services that keep your reception celebration alive with seamless mixing, perfect timing, and a curated mix of music that appeals to all ages and musical tastes.</p>
              <ul className="service-highlights">
                <li>Custom ceremony & reception music</li>
                <li>MC services & announcements</li>
                <li>All ages playlist curation</li>
              </ul>
            </div>
            
            {/* Party DJ Services */}
            <div className="service-card-enhanced">
              <div className="service-icon-wrapper">
                <span className="service-icon-large">🎉</span>
              </div>
              <h3>Party DJ Services</h3>
              <p>High-energy DJ entertainment for birthdays, anniversaries, graduations, and any celebration that needs great music and an electric atmosphere.</p>
              <ul className="service-highlights">
                <li>Custom playlist creation</li>
                <li>Interactive crowd engagement</li>
                <li>Dance floor lighting effects</li>
              </ul>
            </div>
            
            {/* Corporate Events */}
            <div className="service-card-enhanced">
              <div className="service-icon-wrapper">
                <span className="service-icon-large">🏢</span>
              </div>
              <h3>Corporate Events</h3>
              <p>Professional DJ services for corporate events, company parties, holiday celebrations, and business networking events that need polished, sophisticated entertainment.</p>
              <ul className="service-highlights">
                <li>Professional atmosphere control</li>
                <li>Appropriate music selection</li>
                <li>Seamless event transitions</li>
              </ul>
            </div>
            
            {/* Dynamic Pricing Packages Section */}
            {pricingPackages.length > 0 && (
              <div className="packages-section">
                <div className="service-card-enhanced" style={{ padding: '3rem' }}>
                  <h3 style={{ 
                    fontSize: '2rem', 
                    marginTop: 0, 
                    marginBottom: '2rem',
                    textAlign: 'center',
                    color: 'var(--primary-color)' 
                  }}>
                    DJ Entertainment Packages
                  </h3>
                  {loadingPricing ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      Loading packages...
                    </div>
                  ) : (
                    <div className="packages-grid">
                      {pricingPackages.map((pkg) => (
                        <div key={pkg.id} className="package-card">
                          <h4>{pkg.package_name}</h4>
                          <div className="package-price">
                            ${parseFloat(pkg.price).toLocaleString()}
                          </div>
                          {pkg.description && (
                            <p style={{ 
                              fontSize: '0.9rem', 
                              color: 'var(--text-light)', 
                              marginBottom: '1rem' 
                            }}>
                              {pkg.description}
                            </p>
                          )}
                          {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 && (
                            <ul className="package-features">
                              {pkg.features.map((feature: string, index: number) => (
                                <li key={index}>{feature}</li>
                              ))}
                            </ul>
                          )}
                          <Link href="#contact" className="package-button">Get Quote</Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Music Selection */}
            <div className="service-card-enhanced">
              <div className="service-icon-wrapper">
                <span className="service-icon-large">🎵</span>
              </div>
              <h3>Custom Music Selection</h3>
              <p>Expertly curated music selection and custom playlists tailored to your event style, musical preferences, and guest demographics for the perfect soundtrack.</p>
              <ul className="service-highlights">
                <li>Genre-spanning music library</li>
                <li>Client consultation & requests</li>
                <li>Do-not-play list honored</li>
              </ul>
            </div>
            
            {/* Professional Equipment */}
            <div className="service-card-enhanced">
              <div className="service-icon-wrapper">
                <span className="service-icon-large">🔊</span>
              </div>
              <h3>Professional Equipment</h3>
              <p>State-of-the-art sound systems, intelligent lighting, and professional-grade DJ equipment ensuring crystal-clear audio and an amazing visual atmosphere.</p>
              <ul className="service-highlights">
                <li>Premium sound systems</li>
                <li>Professional DJ controllers</li>
                <li>LED lighting packages</li>
              </ul>
            </div>
            
            {/* Why Choose Us */}
            <div className="service-card-enhanced">
              <div className="service-icon-wrapper">
                <span className="service-icon-large">⭐</span>
              </div>
              <h3>Why Choose Us</h3>
              <p>Years of experience, professional equipment, and a passion for creating unforgettable events. We read the crowd, adapt to the energy, and keep everyone dancing.</p>
              <ul className="service-highlights">
                <li>Experienced professional DJs</li>
                <li>Backup equipment on-site</li>
                <li>Liability insurance included</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Contact 
        title="Let's Get The Party Started"
        description="Ready to book a DJ for your event? Contact us to discuss your needs and get a quote for your celebration."
      />
      <Footer />
    </main>
  );
}
