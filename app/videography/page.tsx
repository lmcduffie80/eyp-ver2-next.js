'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Contact from '@/components/ContactWrapper';
import Link from 'next/link';

export default function Videography() {
  const [videoProjects, setVideoProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricingPackages, setPricingPackages] = useState<any[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);

  useEffect(() => {
    fetchVideos();
    fetchPricingPackages();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/videography/projects');
      if (response.ok) {
        const result = await response.json();
        const projects = result.data || [];
        
        // Fetch videos for each project
        const projectsWithVideos = await Promise.all(
          projects.map(async (project: any) => {
            const videosResponse = await fetch(`/api/videography/videos?project_id=${project.id}`);
            if (videosResponse.ok) {
              const videosResult = await videosResponse.json();
              return {
                ...project,
                videos: videosResult.data || []
              };
            }
            return { ...project, videos: [] };
          })
        );
        
        setVideoProjects(projectsWithVideos.filter(p => p.videos.length > 0));
      }
    } catch (error) {
      console.error('Error fetching videography projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingPackages = async () => {
    try {
      setLoadingPricing(true);
      const response = await fetch('/api/pricing/packages?service_type=videography');
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
          background: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/fahrad-norouzi-Dm_XEb4a-Bw-unsplash.jpg') center/cover"
        }}
      >
        <div className="hero-content">
          <h1>Videography</h1>
          <p>Creating cinematic stories that capture your most important moments</p>
          <Link href="#contact" className="cta-button">Book Your Session</Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">Our Videography Services</h2>
          <div className="about-content">
            <div className="about-text">
              <p>At Externally Yours Productions, LLC, we specialize in cinematic videography that tells your story. From weddings to corporate events, we create high-quality videos that you'll treasure forever.</p>
              <p>Our videography services include wedding films, event coverage, promotional videos, music videos, and commercial productions. We use professional equipment and editing techniques to deliver stunning results.</p>
              <p>Every project is unique, and we work closely with you to understand your vision and bring it to life through compelling video content.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services">
        <div className="container">
          <h2 className="section-title">What We Offer</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">💍</div>
              <h3>Wedding Videography</h3>
              <p>Capture every moment of your special day with cinematic wedding films that tell your love story.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🎉</div>
              <h3>Event Coverage</h3>
              <p>Professional video coverage for corporate events, parties, and special occasions.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🎬</div>
              <h3>Promotional Videos</h3>
              <p>High-quality promotional content for businesses, products, and brands.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🎵</div>
              <h3>Music Videos</h3>
              <p>Creative and visually stunning music videos for artists and performers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {pricingPackages.length > 0 && (
        <section id="packages" style={{ padding: '5rem 0', background: '#f9f9f9' }}>
          <div className="container">
            <h2 className="section-title">Videography Packages</h2>
            <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem', color: 'var(--text-light)' }}>
              Choose the perfect videography package for your needs. All packages include professional equipment and expert editing.
            </p>
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
        </section>
      )}

      {/* My Work Section */}
      <section id="portfolio" className="portfolio">
        <div className="container">
          <h2 className="section-title">My Work</h2>
          <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem', color: 'var(--text-light)', fontSize: '1.1rem' }}>
            Watch our latest videography projects and see the quality we deliver.
          </p>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
              Loading videos...
            </div>
          ) : videoProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
              No videos available yet. Check back soon!
            </div>
          ) : (
            <>
              <div className="video-grid-fixed">
                {videoProjects.flatMap(project => project.videos).map((video: any) => (
                  <div key={video.id} style={{
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  >
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${video.video_id}`}
                        title={video.title || 'Video'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                      />
                    </div>
                    {video.title && (
                      <div style={{ padding: '1.25rem', textAlign: 'center' }}>
                        <h4 style={{ 
                          margin: 0, 
                          fontSize: '1.1rem', 
                          color: 'var(--text-dark)',
                          fontWeight: '500'
                        }}>
                          {video.title}
                        </h4>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Contact 
        title="Let's Create Your Video"
        description="Ready to book a videography session? Contact us to discuss your project and get a quote."
      />
      <Footer />
    </main>
  );
}
