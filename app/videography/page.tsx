import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Contact from '@/components/Contact';
import Link from 'next/link';
import Image from 'next/image';

export default function Videography() {
  return (
    <main>
      <Navigation />
      {/* Hero Section */}
      <section 
        id="home" 
        className="hero"
        style={{
          height: '80vh',
          background: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/Our Videography Services/E72A0960.jpg') center/cover"
        }}
      >
        <div className="hero-content">
          <h1>Videography</h1>
          <p>Bringing your stories to life with cinematic quality and creative storytelling</p>
          <Link href="#contact" className="cta-button">Book Your Project</Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">Our Videography Services</h2>
          <div className="about-content">
            <div className="about-text">
              <p>At Externally Yours Productions, LLC, we specialize in professional videography services that bring your stories to life. From intimate wedding ceremonies to large corporate events, we capture your moments with cinematic quality and creative storytelling.</p>
              <p>Our videography team uses state-of-the-art equipment and techniques to create stunning visual content that engages and captivates your audience. We handle everything from pre-production planning to post-production editing, ensuring your final video exceeds expectations.</p>
              <p>Whether you need a wedding highlight reel, corporate video, event coverage, or a custom production, we work closely with you to understand your vision and deliver results that tell your story in the most compelling way possible.</p>
            </div>
            <Image
              src="/Our Videography Services/E72A0960.jpg"
              alt="Videography services"
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
              <h3>Wedding Videography</h3>
              <p>Beautiful wedding videos and highlight reels that capture every precious moment of your special day, from the ceremony to the reception.</p>
              <div className="packages-section">
                <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Wedding Videography Packages</h3>
                <div className="packages-grid">
                  <div className="package-card">
                    <h4>The Glimpse Package</h4>
                    <div className="package-price">$1,800.00</div>
                    <ul className="package-features">
                      <li>6 hours of coverage</li>
                      <li>One Cinematographer</li>
                      <li>3 to 5 minute Cinematic Film</li>
                      <li>Drone Footage</li>
                      <li>Unlimited Downloads via online storage drive plus all rights to post on all social media platforms</li>
                    </ul>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                  
                  <div className="package-card">
                    <h4>The Memory</h4>
                    <div className="package-price">$2,250.00</div>
                    <ul className="package-features">
                      <li>Eight hours of coverage</li>
                      <li>One Cinematographer</li>
                      <li>Drone Footage</li>
                      <li>Online delivery</li>
                      <li>Unlimited Downloads</li>
                      <li>Bride and Groom Interviews</li>
                      <li>3 to 5 Minute Cinematic Highlight Film</li>
                      <li>8 to 15 minutes Extended Highlight Film</li>
                    </ul>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                  
                  <div className="package-card">
                    <h4>The Exclusive Package</h4>
                    <div className="package-price">$2,800.00</div>
                    <ul className="package-features">
                      <li>Ten hours of coverage</li>
                      <li>One Cinematographer</li>
                      <li>Drone Footage</li>
                      <li>Online delivery</li>
                      <li>Unlimited Downloads</li>
                      <li>Bride and Groom Interviews</li>
                      <li>3 to 5 Minute Cinematic Highlight Film</li>
                      <li>8 to 15 minutes Extended Highlight Film</li>
                    </ul>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🎬</div>
              <h3>Corporate Commercial</h3>
              <p>Professional corporate and commercial video production for businesses, advertising, marketing campaigns, and brand storytelling.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🚁</div>
              <h3>Drone/Aerial Videography</h3>
              <p>Breathtaking aerial footage captured with professional drone technology. Perfect for weddings, real estate, events, and commercial projects to provide stunning cinematic perspectives from above.</p>
            </div>
          </div>
        </div>
      </section>

      <Contact 
        title="Let's Bring Your Story to Life"
        description="Ready to book a videography project? Contact us to discuss your vision and get a quote."
      />
      <Footer />
    </main>
  );
}
