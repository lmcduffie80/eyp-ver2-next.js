'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Inquiry {
  id: number;
  inquiry_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  event_type: string;
  event_date: string;
  event_location: string;
  guest_count: number;
  services_requested: string[];
  budget_range: string;
  message: string;
  status: string;
  priority: string;
  assigned_to: number | null;
  assigned_to_username: string | null;
  referral_source: string;
  created_at: string;
}

export default function InquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchInquiries();
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

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/crm/inquiries?${params}`);
      const data = await response.json();

      if (data.success) {
        setInquiries(data.inquiries);
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchInquiries();
    }, 300);

    return () => clearTimeout(debounce);
  }, [filter, searchTerm]);

  const updateInquiryStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/crm/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchInquiries();
      }
    } catch (error) {
      console.error('Failed to update inquiry:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: any = {
      new: '#10b981',
      reviewing: '#3b82f6',
      quoted: '#8b5cf6',
      contracted: '#059669',
      completed: '#6b7280',
      declined: '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityBadgeColor = (priority: string) => {
    const colors: any = {
      low: '#10b981',
      normal: '#3b82f6',
      high: '#f59e0b',
      urgent: '#dc2626'
    };
    return colors[priority] || '#3b82f6';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const viewInquiryDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowModal(true);
  };

  const handleLogout = async () => {
    await fetch('/api/crm-admin/logout', { method: 'POST' });
    router.push('/crm-admin/login');
  };

  return (
    <div className="inquiries-page">
      <div className="top-bar">
        <div className="top-bar-content">
          <h1>Client Inquiries</h1>
          <div className="actions">
            <button onClick={() => router.push('/crm-admin/dashboard')} className="nav-button">
              Dashboard
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
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={filter === 'new' ? 'active' : ''}
              onClick={() => setFilter('new')}
            >
              New
            </button>
            <button
              className={filter === 'reviewing' ? 'active' : ''}
              onClick={() => setFilter('reviewing')}
            >
              Reviewing
            </button>
            <button
              className={filter === 'quoted' ? 'active' : ''}
              onClick={() => setFilter('quoted')}
            >
              Quoted
            </button>
            <button
              className={filter === 'contracted' ? 'active' : ''}
              onClick={() => setFilter('contracted')}
            >
              Contracted
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div className="empty-state">
            <p>No inquiries found</p>
          </div>
        ) : (
          <div className="inquiries-grid">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="inquiry-card">
                <div className="card-header">
                  <div className="inquiry-number">{inquiry.inquiry_number}</div>
                  <div className="badges">
                    <span 
                      className="status-badge"
                      style={{ background: getStatusBadgeColor(inquiry.status) }}
                    >
                      {inquiry.status}
                    </span>
                    <span 
                      className="priority-badge"
                      style={{ background: getPriorityBadgeColor(inquiry.priority) }}
                    >
                      {inquiry.priority}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <h3>{inquiry.client_name}</h3>
                  <p className="email">{inquiry.client_email}</p>
                  
                  {inquiry.event_type && (
                    <p className="event-type">🎉 {inquiry.event_type}</p>
                  )}
                  
                  {inquiry.event_date && (
                    <p className="event-date">📅 {formatDate(inquiry.event_date)}</p>
                  )}

                  {inquiry.services_requested && inquiry.services_requested.length > 0 && (
                    <div className="services">
                      {inquiry.services_requested.map((service, idx) => (
                        <span key={idx} className="service-tag">{service}</span>
                      ))}
                    </div>
                  )}

                  <div className="meta">
                    <span>Received: {formatDate(inquiry.created_at)}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <button 
                    className="view-button"
                    onClick={() => viewInquiryDetails(inquiry)}
                  >
                    View Details
                  </button>
                  
                  <select
                    value={inquiry.status}
                    onChange={(e) => updateInquiryStatus(inquiry.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="new">New</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="quoted">Quoted</option>
                    <option value="contracted">Contracted</option>
                    <option value="completed">Completed</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedInquiry && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            
            <h2>{selectedInquiry.inquiry_number}</h2>
            
            <div className="modal-section">
              <h3>Client Information</h3>
              <p><strong>Name:</strong> {selectedInquiry.client_name}</p>
              <p><strong>Email:</strong> {selectedInquiry.client_email}</p>
              {selectedInquiry.client_phone && (
                <p><strong>Phone:</strong> {selectedInquiry.client_phone}</p>
              )}
            </div>

            <div className="modal-section">
              <h3>Event Details</h3>
              {selectedInquiry.event_type && (
                <p><strong>Type:</strong> {selectedInquiry.event_type}</p>
              )}
              {selectedInquiry.event_date && (
                <p><strong>Date:</strong> {formatDate(selectedInquiry.event_date)}</p>
              )}
              {selectedInquiry.event_location && (
                <p><strong>Location:</strong> {selectedInquiry.event_location}</p>
              )}
              {selectedInquiry.guest_count && (
                <p><strong>Guest Count:</strong> {selectedInquiry.guest_count}</p>
              )}
              {selectedInquiry.budget_range && (
                <p><strong>Budget:</strong> {selectedInquiry.budget_range}</p>
              )}
            </div>

            {selectedInquiry.services_requested && selectedInquiry.services_requested.length > 0 && (
              <div className="modal-section">
                <h3>Services Requested</h3>
                <div className="services">
                  {selectedInquiry.services_requested.map((service, idx) => (
                    <span key={idx} className="service-tag">{service}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedInquiry.message && (
              <div className="modal-section">
                <h3>Message</h3>
                <p className="message-text">{selectedInquiry.message}</p>
              </div>
            )}

            {selectedInquiry.referral_source && (
              <div className="modal-section">
                <h3>Referral Source</h3>
                <p>{selectedInquiry.referral_source}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .inquiries-page {
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
        }

        .top-bar h1 {
          margin: 0;
          font-size: 1.8rem;
        }

        .actions {
          display: flex;
          gap: 10px;
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

        .inquiries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .inquiry-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .inquiry-card:hover {
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

        .inquiry-number {
          font-weight: 700;
          color: #1a1a1a;
          font-family: 'Courier New', monospace;
        }

        .badges {
          display: flex;
          gap: 8px;
        }

        .status-badge,
        .priority-badge {
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
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 1.3rem;
        }

        .email {
          color: #666;
          margin: 0 0 15px 0;
          font-size: 0.9rem;
        }

        .event-type,
        .event-date {
          margin: 8px 0;
          color: #555;
          font-size: 0.95rem;
        }

        .services {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 15px 0;
        }

        .service-tag {
          padding: 6px 12px;
          background: #ffe8de;
          color: #ff6b35;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .meta {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
          font-size: 0.85rem;
          color: #999;
        }

        .card-footer {
          padding: 15px 20px;
          background: #f8f9fa;
          display: flex;
          gap: 10px;
          border-top: 2px solid #e0e0e0;
        }

        .view-button {
          flex: 1;
          padding: 10px;
          background: #ff6b35;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .view-button:hover {
          background: #e55a2b;
        }

        .status-select {
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          min-width: 130px;
        }

        .status-select:focus {
          outline: none;
          border-color: #ff6b35;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal {
          background: white;
          border-radius: 16px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          position: relative;
        }

        .close-button {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border: none;
          background: #f0f0f0;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #e0e0e0;
        }

        .modal h2 {
          margin: 0 0 25px 0;
          color: #1a1a1a;
          font-size: 1.8rem;
        }

        .modal-section {
          margin-bottom: 25px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .modal-section h3 {
          margin: 0 0 15px 0;
          color: #1a1a1a;
          font-size: 1.2rem;
        }

        .modal-section p {
          margin: 8px 0;
          color: #555;
          line-height: 1.6;
        }

        .message-text {
          white-space: pre-wrap;
          background: white;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #ff6b35;
        }

        @media (max-width: 768px) {
          .inquiries-grid {
            grid-template-columns: 1fr;
          }

          .controls {
            flex-direction: column;
          }

          .filters {
            flex-wrap: wrap;
          }

          .top-bar-content {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
