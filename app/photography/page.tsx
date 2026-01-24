'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Contact from '@/components/ContactWrapper';
import ImageLightbox from '@/components/ImageLightbox';
import Link from 'next/link';
import Image from 'next/image';

export default function Photography() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [pricingPackages, setPricingPackages] = useState<any[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);

  useEffect(() => {
    fetchDatabaseProjects();
    fetchPricingPackages();
  }, []);

  const fetchDatabaseProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await fetch('/api/photography/projects');
      if (response.ok) {
        const result = await response.json();
        const projectsData = result.data || [];
        
        // Fetch photos for each project
        const projectsWithPhotos = await Promise.all(
          projectsData.map(async (project: any) => {
            const photosResponse = await fetch(`/api/photography/photos?project_id=${project.id}`);
            if (photosResponse.ok) {
              const photosResult = await photosResponse.json();
              return {
                ...project,
                photos: photosResult.data || []
              };
            }
            return { ...project, photos: [] };
          })
        );
        
        setDbProjects(projectsWithPhotos.filter(p => p.photos.length > 0));
      }
    } catch (error) {
      console.error('Error fetching database projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchPricingPackages = async () => {
    try {
      setLoadingPricing(true);
      const response = await fetch('/api/pricing/packages?service_type=photography');
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

  const openLightbox = (images: string[], index: number, title: string) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setLightboxOpen(true);
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
          background: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/PhotographyPagePhotos/IMG_4205.jpg') center/cover"
        }}
      >
        <div className="hero-content">
          <h1>Photography</h1>
          <p>Capturing moments that matter with artistic vision and technical excellence</p>
          <Link href="#contact" className="cta-button">Book Your Session</Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">Our Photography Services</h2>
          <div className="about-content">
            <div className="about-text">
              <p>At Externally Yours Productions, LLC, we specialize in high-quality photography services that capture the essence of your most important moments. From intimate wedding ceremonies to grand corporate events, we bring an artistic vision and technical excellence to every shoot.</p>
              <p>Our photography services include wedding photography, event photography, portrait sessions, product photography, and commercial shoots. We work closely with our clients to understand their vision and deliver images that exceed expectations.</p>
              <p>With attention to detail and a passion for storytelling through imagery, we ensure that every photo tells a story and preserves your memories for a lifetime.</p>
            </div>
            <Image
              src="/Grace and Dillon Wedding/7L8A5712.jpg"
              alt="Photography services"
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
              <h3>Wedding Photography</h3>
              <p>Comprehensive wedding photography services to capture every precious moment of your special day, from the ceremony to the reception.</p>
              
              <div className="packages-section">
                <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Wedding Photography Packages</h3>
                <div className="packages-grid">
                  <div className="package-card">
                    <h4>Ceremony</h4>
                    <div className="package-price">$1,800</div>
                    <ul className="package-features">
                      <li>Six Hours of Professional Photography Coverage</li>
                      <li>A minimum of 100 Fully Edited Digital Downloads</li>
                      <li>Delivery of Photos via Online Gallery</li>
                      <li>Exclusive Printing rights</li>
                    </ul>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                  
                  <div className="package-card">
                    <h4>Deluxe Package</h4>
                    <div className="package-price">$2,250</div>
                    <ul className="package-features">
                      <li>8 hours of coverage</li>
                      <li>200+ edited photos</li>
                      <li>Online gallery</li>
                      <li>Digital download</li>
                      <li>Engagement session</li>
                      <li>Second shooter</li>
                      <li>Wedding album</li>
                    </ul>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                  
                  <div className="package-card">
                    <h4>Formal Package</h4>
                    <div className="package-price">$2,800</div>
                    <ul className="package-features">
                      <li>Full day coverage</li>
                      <li>300+ edited photos</li>
                      <li>Online gallery</li>
                      <li>Digital download</li>
                      <li>Engagement session</li>
                      <li>Second shooter</li>
                      <li>Bridal session</li>
                    </ul>
                    <Link href="#contact" className="package-button">Get Quote</Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🎉</div>
              <h3>Event Photography</h3>
              <p>Professional event photography for corporate gatherings, parties, celebrations, and special occasions.</p>
            </div>
            
            <div className="service-card" style={{ gridColumn: '1 / -1' }}>
              <div className="service-icon">👤</div>
              <h3>Portrait Photography</h3>
              <p>Professional portrait sessions for individuals, families, and groups. We create stunning portraits that capture personality and emotion.</p>
              
              {pricingPackages.length > 0 && (
                <div className="packages-section">
                  <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Photography Packages</h3>
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
              )}
            </div>
            
            <div className="service-card">
              <div className="service-icon">📦</div>
              <h3>Product Photography</h3>
              <p>High-quality product photography for e-commerce, catalogs, and marketing materials that showcase your products in the best light.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🏢</div>
              <h3>Commercial Photography</h3>
              <p>Professional commercial photography services for businesses, brands, and marketing campaigns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="portfolio">
        <div className="container">
          <h2 className="section-title">Our Photography Work</h2>
          
          {/* Database Projects - Featured Section */}
          {!loadingProjects && dbProjects.length > 0 && (
            <div style={{ marginBottom: '4rem' }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                color: 'var(--primary-color)', 
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                Recent Projects
              </h3>
              <div className="portfolio-grid">
                {dbProjects.map((project) => (
                  <div
                    key={project.id}
                    className="portfolio-item"
                    onClick={() => openLightbox(
                      project.photos.map((p: any) => p.photo_url),
                      0,
                      project.project_name
                    )}
                    style={{ cursor: 'pointer' }}
                  >
                    <Image
                      src={project.cover_photo_url || project.photos[0]?.photo_url}
                      alt={project.project_name}
                      fill
                      quality={85}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                    />
                    <div className="portfolio-overlay">
                      <h3>{project.project_name}</h3>
                      <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.9 }}>
                        {project.photos.length} photos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        galleryTitle={lightboxTitle}
      />

      <Contact 
        title="Let's Capture Your Moments"
        description="Ready to book a photography session? Contact us to discuss your project and get a quote."
      />
      <Footer />
    </main>
  );
}
