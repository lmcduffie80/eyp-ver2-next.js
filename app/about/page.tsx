import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Contact from '@/components/Contact';
import Link from 'next/link';
import Image from 'next/image';

export default function About() {
  return (
    <main>
      <Navigation />
      {/* Hero Section */}
      <section 
        id="home" 
        className="hero"
        style={{
          height: '60vh',
          background: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/Our Videography Services/IMG_0515.jpeg') center/cover"
        }}
      >
        <div className="hero-content">
          <h1>About Us</h1>
          <p>Externally Yours Productions, LLC</p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">Our Story</h2>
          <div className="about-content">
            <div className="about-text">
              <p>Welcome to Externally Yours Productions, LLC, where creativity meets excellence and every moment is captured with passion and precision. We are a full-service production company specializing in photography, videography, and DJ entertainment services that bring your most important events to life.</p>
              <p>With years of experience in the industry, we understand that every celebration, whether it&apos;s a wedding, corporate event, or special occasion, deserves to be captured with artistic vision and technical excellence. Our team is dedicated to creating compelling visual stories and unforgettable entertainment experiences that exceed your expectations.</p>
              <p>From intimate wedding ceremonies to grand celebrations, we combine professional photography that preserves your precious moments, cinematic videography that tells your story with emotion and artistry, and high-energy DJ entertainment that keeps the party vibrant and unforgettable. Our commitment to quality, attention to detail, and personalized approach ensures that every project we undertake reflects your unique vision and style.</p>
              <p>At Externally Yours Productions, LLC, we don&apos;t just document events—we create timeless memories. Let us be part of your special moments and help you relive them for years to come.</p>
            </div>
            <Image
              src="/AboutUs/7L8A9573.jpg"
              alt="Externally Yours Productions team"
              width={600}
              height={400}
              className="about-image"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">What We Stand For</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3>Excellence</h3>
              <p>We strive for excellence in every project, ensuring the highest quality results that exceed our clients&apos; expectations.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💡</div>
              <h3>Creativity</h3>
              <p>Our creative approach brings fresh perspectives and innovative solutions to every project we undertake.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Partnership</h3>
              <p>We work closely with our clients as partners, ensuring their vision is brought to life with care and attention.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">⭐</div>
              <h3>Quality</h3>
              <p>Quality is at the heart of everything we do, from the equipment we use to the final delivery of your project.</p>
            </div>
          </div>
        </div>
      </section>

      <Contact />
      <Footer />
    </main>
  );
}
