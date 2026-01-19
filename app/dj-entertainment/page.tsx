import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Contact from '@/components/Contact';
import Link from 'next/link';
import Image from 'next/image';

export default function DJEntertainment() {
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
              <div className="packages-section">
                <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Wedding DJ Packages</h3>
                <div className="packages-grid">
                  <div className="package-card">
                    <h4>Ceremony Package (Only)</h4>
                    <div className="package-price">$750.00</div>
                    <ul className="package-features">
                      <li>2 hours of coverage</li>
                      <li>Two speakers</li>
                      <li>Sound board</li>
                      <li>Wedding ceremony playlist</li>
                      <li>Sound system and microphone for officiant/minister</li>
                      <li>DJ setup and pack-out services</li>
                    </ul>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                  
                  <div className="package-card">
                    <h4>Ceremony and Reception Package</h4>
                    <div className="package-price">$1,200.00</div>
                    <ul className="package-features">
                      <li>8 hours of coverage</li>
                      <li>DJ setup and breakdown</li>
                      <li>Ceremony top boxes</li>
                      <li>Two subs</li>
                      <li>Two top boxes for main DJ setup</li>
                      <li>Sound and microphone for officiant/minister</li>
                      <li>Announcements for Bridal Party Entrance</li>
                      <li>First Dances announcements</li>
                    </ul>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                  
                  <div className="package-card">
                    <h4>Ceremony, Reception, and Lights Package</h4>
                    <div className="package-price">$1,400.00</div>
                    <ul className="package-features">
                      <li>8 hours of coverage</li>
                      <li>DJ setup and breakdown</li>
                      <li>Ceremony top boxes</li>
                      <li>Two subs</li>
                      <li>Two top boxes for main DJ setup</li>
                      <li>Sound and microphone for officiant/minister</li>
                      <li>Announcements for Bridal Party Entrance</li>
                      <li>First Dances announcements</li>
                      <li>Full production lighting for dance floor</li>
                    </ul>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                  
                  <div className="package-card">
                    <h4>Reception Package (without lights)</h4>
                    <div className="package-price">$900.00</div>
                    <ul className="package-features">
                      <li>MC for all formalities</li>
                      <li>Exceptional Reception Dinner playlist</li>
                      <li>Selection of more than 2,000 songs</li>
                      <li>Keep the dance floor full of energy</li>
                    </ul>
                    <p className="package-note">Plus $150 fuel surcharge beyond 100 miles round trip of Tifton, GA</p>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                  
                  <div className="package-card">
                    <h4>Reception Package (with lights)</h4>
                    <div className="package-price">$1,050.00</div>
                    <ul className="package-features">
                      <li>MC for all formalities</li>
                      <li>Exceptional Reception Dinner playlist</li>
                      <li>Selection of more than 2,000 songs</li>
                      <li>Keep the dance floor full of energy</li>
                      <li>Full production lighting</li>
                    </ul>
                    <p className="package-note">Plus $150 fuel surcharge beyond 100 miles round trip of Tifton, GA</p>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                </div>
              </div>
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
              <div className="packages-section">
                <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Business Parties Package</h3>
                <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>When it&apos;s time to let loose and entertain your guests at corporate events, choose our Business Parties Package. This comprehensive package offers dynamic lights, a skilled DJ, and engaging entertainment for your entire audience.</p>
                <div className="packages-grid">
                  <div className="package-card">
                    <h4>Business Parties Package - Weeknight</h4>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>Sunday - Wednesday (Without Lights)</p>
                    <div className="package-price">$850.00</div>
                    <ul className="package-features">
                      <li>Skilled DJ</li>
                      <li>Engaging entertainment for your entire audience</li>
                      <li>Professional sound system</li>
                    </ul>
                    <p className="package-note">A fuel surcharge of $100-$300 will be applied if beyond 100 miles from Tifton, GA (pending if overnight stay is required)</p>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                  
                  <div className="package-card">
                    <h4>Business Parties Package - Weeknight</h4>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>Sunday - Wednesday (With Lights)</p>
                    <div className="package-price">$1,000.00</div>
                    <ul className="package-features">
                      <li>Skilled DJ</li>
                      <li>Engaging entertainment for your entire audience</li>
                      <li>Professional sound system</li>
                      <li>Dynamic lighting</li>
                    </ul>
                    <p className="package-note">A fuel surcharge of $100-$300 will be applied if beyond 100 miles from Tifton, GA (pending if overnight stay is required)</p>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                  
                  <div className="package-card">
                    <h4>Business Parties Package - Weekend</h4>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>Thursday - Saturday</p>
                    <div className="package-price">$1,400.00</div>
                    <ul className="package-features">
                      <li>Skilled DJ</li>
                      <li>Engaging entertainment for your entire audience</li>
                      <li>Professional sound system</li>
                      <li>Full dance floor lighting included</li>
                    </ul>
                    <p className="package-note">A fuel surcharge of $100-$300 will be applied if beyond 100 miles from Tifton, GA (pending if overnight stay is required)</p>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                </div>
              </div>
            </div>
            
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
