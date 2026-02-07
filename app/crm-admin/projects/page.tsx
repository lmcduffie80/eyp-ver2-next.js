'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  id: number;
  project_number: string;
  project_name: string;
  client_name: string;
  event_type: string;
  event_date: string;
  stage: string;
  total_amount: number;
  created_at: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  useEffect(() => {
    checkAuth();
    fetchProjects();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/crm-admin/verify');
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push('/crm-admin/login');
      }
    } catch (error) {
      router.push('/crm-admin/login');
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (stageFilter !== 'all') {
        params.append('stage', stageFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/crm/projects?${params}`);
      const data = await response.json();

      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProjects();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, stageFilter]);

  const getStageBadgeColor = (stage: string) => {
    const colors: any = {
      inquiry: '#6b7280',
      quoted: '#3b82f6',
      contracted: '#8b5cf6',
      deposit_paid: '#10b981',
      in_progress: '#f59e0b',
      final_payment_paid: '#059669',
      completed: '#059669',
      archived: '#6b7280'
    };
    return colors[stage] || '#6b7280';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const viewProjectDetails = (projectId: number) => {
    router.push(`/crm-admin/projects/${projectId}`);
  };

  const handleLogout = async () => {
    await fetch('/api/crm-admin/logout', { method: 'POST' });
    router.push('/crm-admin/login');
  };

  return (
    <div className="projects-page">
      <div className="top-bar">
        <div className="top-bar-content">
          <h1>Projects</h1>
          <div className="actions">
            <button onClick={() => router.push('/crm-admin/dashboard')} className="nav-button">
              Dashboard
            </button>
            <button onClick={() => router.push('/crm-admin/inquiries')} className="nav-button">
              Inquiries
            </button>
            <button onClick={() => router.push('/crm-admin/clients')} className="nav-button">
              Clients
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters">
            <button
              className={stageFilter === 'all' ? 'active' : ''}
              onClick={() => setStageFilter('all')}
            >
              All
            </button>
            <button
              className={stageFilter === 'inquiry' ? 'active' : ''}
              onClick={() => setStageFilter('inquiry')}
            >
              Inquiry
            </button>
            <button
              className={stageFilter === 'contracted' ? 'active' : ''}
              onClick={() => setStageFilter('contracted')}
            >
              Contracted
            </button>
            <button
              className={stageFilter === 'in_progress' ? 'active' : ''}
              onClick={() => setStageFilter('in_progress')}
            >
              In Progress
            </button>
            <button
              className={stageFilter === 'completed' ? 'active' : ''}
              onClick={() => setStageFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects found</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card" onClick={() => viewProjectDetails(project.id)}>
                <div className="card-header">
                  <div className="project-number">{project.project_number}</div>
                  <span 
                    className="stage-badge"
                    style={{ background: getStageBadgeColor(project.stage) }}
                  >
                    {project.stage.replace('_', ' ')}
                  </span>
                </div>

                <div className="card-body">
                  <h3>{project.project_name}</h3>
                  <p className="client-name">👤 {project.client_name}</p>
                  
                  {project.event_type && (
                    <p className="event-type">🎉 {project.event_type}</p>
                  )}
                  
                  {project.event_date && (
                    <p className="event-date">📅 {formatDate(project.event_date)}</p>
                  )}

                  {project.total_amount > 0 && (
                    <p className="amount">💰 {formatCurrency(project.total_amount)}</p>
                  )}

                  <div className="meta">
                    <span>Created: {formatDate(project.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .projects-page {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .top-bar {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .top-bar-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .top-bar h1 {
          margin: 0;
          font-size: 1.8rem;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .nav-button,
        .logout-button {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .nav-button {
          background: #ff6b35;
          color: white;
        }

        .nav-button:hover {
          background: #e55a2b;
        }

        .logout-button {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .logout-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 30px 20px;
        }

        .controls {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
        }

        .search-box input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
        }

        .search-box input:focus {
          outline: none;
          border-color: #ff6b35;
        }

        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filters button {
          padding: 12px 20px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .filters button:hover {
          border-color: #ff6b35;
          color: #ff6b35;
        }

        .filters button.active {
          background: #ff6b35;
          color: white;
          border-color: #ff6b35;
        }

        .loading,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
          font-size: 1.1rem;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .project-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .card-header {
          padding: 15px 20px;
          background: #f8f9fa;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #e0e0e0;
        }

        .project-number {
          font-weight: 700;
          color: #1a1a1a;
          font-family: 'Courier New', monospace;
        }

        .stage-badge {
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .card-body {
          padding: 20px;
        }

        .card-body h3 {
          margin: 0 0 12px 0;
          color: #1a1a1a;
          font-size: 1.3rem;
        }

        .client-name,
        .event-type,
        .event-date,
        .amount {
          margin: 8px 0;
          color: #555;
          font-size: 0.95rem;
        }

        .amount {
          font-weight: 700;
          color: #10b981;
          font-size: 1.1rem;
        }

        .meta {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
          font-size: 0.85rem;
          color: #999;
        }

        @media (max-width: 768px) {
          .projects-grid {
            grid-template-columns: 1fr;
          }

          .controls {
            flex-direction: column;
          }

          .filters {
            width: 100%;
          }

          .top-bar-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
