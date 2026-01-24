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
            <div className="service-card" style={{ gridColumn: '1 / -1' }}>
              <div className="service-icon">💍</div>
              <h3>Wedding DJ Services</h3>
              <p>Professional wedding DJ services that keep your reception celebration going with the perfect mix of music for all ages and tastes.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🎉</div>
              <h3>Party DJ Services</h3>
              <p>High-energy DJ entertainment for birthdays, anniversaries, graduations, and any celebration that needs great music.</p>
            </div>
            
            <div className="service-card" style={{ gridColumn: '1 / -1' }}>
              <div className="service-icon">🏢</div>
              <h3>Corporate Events</h3>
              <p>Professional DJ services for corporate events, company parties, and business celebrations that need polished entertainment.</p>
            </div>
            
            {/* Dynamic Pricing Packages Section */}
            {pricingPackages.length > 0 && (
              <div className="service-card" style={{ gridColumn: '1 / -1' }}>
                <div className="packages-section">
                  <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>DJ Entertainment Packages</h3>
                  {loadingPricing ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading packages...</div>
                  ) : (
                    <div className="packages-grid">
                      {pricingPackages.map((pkg) => (
                        <div key={pkg.id} className="package-card">
                          <h4>{pkg.package_name}</h4>
                          <div className="package-price">${parseFloat(pkg.price).toLocaleString()}</div>
                          {pkg.description && (
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
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
            
            <div className="service-card">
              <div className="service-icon">🎵</div>
              <h3>Music Selection</h3>
              <p>Custom music selection and playlists tailored to your event style, preferences, and guest demographics.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🔊</div>
              <h3>Professional Equipment</h3>
              <p>State-of-the-art sound systems, lighting, and professional DJ equipment to ensure crystal-clear sound and amazing atmosphere.</p>
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
