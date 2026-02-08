'use client';

import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Contact from '@/components/ContactWrapper';
import Link from 'next/link';
import Image from 'next/image';

function VideoModal({ video, isOpen, onClose }: { video: any; isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen && video.platform === 'tiktok') {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        try {
          document.body.removeChild(script);
        } catch {}
      };
    }
  }, [isOpen, video.platform]);

  if (!isOpen) return null;

  const renderFullEmbed = () => {
    switch (video.platform) {
      case 'youtube':
        return (
          <iframe
            src={`https://www.youtube.com/embed/${video.video_id}?autoplay=1`}
            title={video.title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        );
      
      case 'tiktok': {
        const tiktokUrl = video.video_url || `https://www.tiktok.com/@user/video/${video.video_id}`;
        return (
          <blockquote
            className="tiktok-embed"
            cite={tiktokUrl}
            data-video-id={video.video_id}
            style={{ maxWidth: '605px', minWidth: '325px', margin: '0 auto' }}
          >
            <section>
              <a target="_blank" rel="noopener noreferrer" href={tiktokUrl}>View on TikTok</a>
            </section>
          </blockquote>
        );
      }
      
      case 'instagram':
        return (
          <iframe
            src={`https://www.instagram.com/p/${video.video_id}/embed`}
            title={video.title || 'Instagram Video'}
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: video.platform === 'tiktok' ? '500px' : '900px',
          height: video.platform === 'tiktok' ? '80vh' : '70vh',
          backgroundColor: '#000',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
        {renderFullEmbed()}
      </div>
    </div>
  );
}

function VideoEmbed({ video, onClick }: { video: any; onClick: () => void }) {
  const [isHovering, setIsHovering] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load TikTok script when hovering over TikTok videos
  useEffect(() => {
    if (showPreview && video.platform === 'tiktok') {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        try {
          document.body.removeChild(script);
        } catch {}
      };
    }
  }, [showPreview, video.platform]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    // Delay preview to avoid accidental triggers
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 500); // 500ms delay
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowPreview(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const getThumbnail = () => {
    switch (video.platform) {
      case 'youtube':
        return `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`;
      case 'tiktok':
        return null; // Use placeholder
      case 'instagram':
        return null; // Use placeholder
      default:
        return null;
    }
  };

  const getPlatformIcon = () => {
    switch (video.platform) {
      case 'youtube':
        return '▶️';
      case 'tiktok':
        return '🎵';
      case 'instagram':
        return '📷';
      default:
        return '▶️';
    }
  };

  const renderPreview = () => {
    switch (video.platform) {
      case 'youtube':
        return (
          <iframe
            src={`https://www.youtube.com/embed/${video.video_id}?autoplay=1&mute=0&controls=0&loop=1&playlist=${video.video_id}`}
            title={video.title || 'Video preview'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              pointerEvents: 'none' // Prevent interaction with preview
            }}
          />
        );
      
      case 'tiktok': {
        const tiktokUrl = video.video_url || `https://www.tiktok.com/@user/video/${video.video_id}`;
        return (
          <blockquote
            className="tiktok-embed"
            cite={tiktokUrl}
            data-video-id={video.video_id}
            style={{ 
              maxWidth: '100%', 
              minWidth: '100%', 
              margin: '0 auto',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          >
            <section>
              <a target="_blank" rel="noopener noreferrer" href={tiktokUrl}>View on TikTok</a>
            </section>
          </blockquote>
        );
      }
      
      case 'instagram':
        return (
          <iframe
            src={`https://www.instagram.com/p/${video.video_id}/embed`}
            title={video.title || 'Instagram preview'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              pointerEvents: 'none'
            }}
          />
        );
      
      default:
        return null;
    }
  };

  const thumbnail = getThumbnail();

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: isHovering ? '0 8px 24px rgba(0, 0, 0, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: isHovering ? 'scale(1.03)' : 'scale(1)'
      }}
    >
      <div style={{ 
        position: 'relative', 
        paddingBottom: video.platform === 'tiktok' ? '125%' : '56.25%',
        height: 0,
        overflow: 'hidden',
        background: thumbnail ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        {showPreview ? (
          // Show video preview on hover
          renderPreview()
        ) : (
          // Show thumbnail when not hovering
          <>
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={video.title || 'Video thumbnail'}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem'
              }}>
                {getPlatformIcon()}
              </div>
            )}
            
            {/* Play button overlay - hide when showing preview */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: 'white',
              opacity: isHovering ? 0.8 : 1,
              transition: 'opacity 0.2s'
            }}>
              ▶
            </div>
          </>
        )}

        {/* Platform badge */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '500',
          textTransform: 'capitalize',
          zIndex: 10
        }}>
          {video.platform}
        </div>
      </div>
      
      {video.title && (
        <div style={{ padding: '1rem' }}>
          <h4 style={{ margin: 0, fontSize: '1rem' }}>{video.title}</h4>
        </div>
      )}
    </div>
  );
}

export default function DJEntertainment() {
  const [pricingPackages, setPricingPackages] = useState<any[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [djProjects, setDjProjects] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedVideo(null), 300); // Delay to allow fade out animation
  };

  useEffect(() => {
    fetchPricingPackages();
    fetchDjVideos();
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

  const fetchDjVideos = async () => {
    try {
      setLoadingVideos(true);
      const response = await fetch('/api/dj-entertainment/projects');
      if (response.ok) {
        const result = await response.json();
        const projects = result.data || [];
        
        const projectsWithVideos = await Promise.all(
          projects.map(async (project: any) => {
            const videosResponse = await fetch(`/api/dj-entertainment/videos?project_id=${project.id}`);
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
        
        setDjProjects(projectsWithVideos.filter(p => p.videos.length > 0));
      }
    } catch (error) {
      console.error('Error fetching DJ videos:', error);
    } finally {
      setLoadingVideos(false);
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

      {/* Our Work Section */}
      <section id="portfolio" className="portfolio">
        <div className="container">
          <h2 className="section-title">Our Work</h2>
          <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem', color: 'var(--text-light)', fontSize: '1.1rem' }}>
            Check out our DJ performances and event highlights.
          </p>
          
          {loadingVideos ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
              Loading videos...
            </div>
          ) : djProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
              No videos available yet. Check back soon!
            </div>
          ) : (
            <div className="video-grid-fixed">
              {djProjects.flatMap(project => project.videos).map((video: any) => (
                <VideoEmbed 
                  key={video.id} 
                  video={video}
                  onClick={() => handleVideoClick(video)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Contact 
        title="Let's Get The Party Started"
        description="Ready to book a DJ for your event? Contact us to discuss your needs and get a quote for your celebration."
      />
      <Footer />
      
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
}
