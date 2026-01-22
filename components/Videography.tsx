'use client';

import { useState, useEffect } from 'react';

export default function Videography() {
  const [videoProjects, setVideoProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
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

  if (loading) {
    return (
      <section id="videography" className="py-20" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <h2 className="section-title">Our Videography Work</h2>
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
            Loading videos...
          </div>
        </div>
      </section>
    );
  }

  if (videoProjects.length === 0) {
    return null; // Don't show section if no videos
  }

  return (
    <section id="videography" className="py-20" style={{ background: '#f8f9fa' }}>
      <div className="container">
        <h2 className="section-title">Our Videography Work</h2>
        <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem', color: 'var(--text-light)', fontSize: '1.1rem' }}>
          Watch our latest videography projects and see what we can create for you.
        </p>
        
        {videoProjects.map((project) => (
          <div key={project.id} style={{ marginBottom: '4rem' }}>
            <h3 style={{ 
              fontSize: '1.75rem', 
              marginBottom: '1.5rem',
              color: 'var(--text-dark)',
              textAlign: 'center'
            }}>
              {project.project_name}
            </h3>
            
            {project.description && (
              <p style={{ 
                textAlign: 'center', 
                maxWidth: '600px', 
                margin: '0 auto 2rem', 
                color: 'var(--text-light)' 
              }}>
                {project.description}
              </p>
            )}
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              marginTop: '2rem'
            }}>
              {project.videos.map((video: any) => (
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
                    <div style={{ padding: '1.25rem' }}>
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
          </div>
        ))}
      </div>
    </section>
  );
}
