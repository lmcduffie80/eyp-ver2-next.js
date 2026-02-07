'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Client {
  id: number;
  client_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  portal_activated: boolean;
  project_count: number;
  created_at: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_company: '',
    preferred_contact_method: 'email',
    create_portal_access: true
  });

  useEffect(() => {
    checkAuth();
    fetchClients();
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

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/crm/clients?${params}`);
      const data = await response.json();

      if (data.success) {
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchClients();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/crm/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });

      const data = await response.json();

      if (data.success) {
        setShowAddModal(false);
        setNewClient({
          client_name: '',
          client_email: '',
          client_phone: '',
          client_company: '',
          preferred_contact_method: 'email',
          create_portal_access: true
        });
        fetchClients();
      } else {
        alert(data.error || 'Failed to create client');
      }
    } catch (error) {
      console.error('Failed to create client:', error);
      alert('An error occurred');
    }
  };

  const viewClientDetails = (clientId: number) => {
    router.push(`/crm-admin/clients/${clientId}`);
  };

  const handleLogout = async () => {
    await fetch('/api/crm-admin/logout', { method: 'POST' });
    router.push('/crm-admin/login');
  };

  return (
    <div className="clients-page">
      <div className="top-bar">
        <div className="top-bar-content">
          <h1>Clients</h1>
          <div className="actions">
            <button onClick={() => router.push('/crm-admin/dashboard')} className="nav-button">
              Dashboard
            </button>
            <button onClick={() => router.push('/crm-admin/inquiries')} className="nav-button">
              Inquiries
            </button>
            <button onClick={() => router.push('/crm-admin/projects')} className="nav-button">
              Projects
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
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-button" onClick={() => setShowAddModal(true)}>
            + Add Client
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="empty-state">
            <p>No clients found</p>
          </div>
        ) : (
          <div className="clients-grid">
            {clients.map((client) => (
              <div key={client.id} className="client-card" onClick={() => viewClientDetails(client.id)}>
                <div className="card-header">
                  <div className="client-number">{client.client_number}</div>
                  {client.portal_activated && (
                    <span className="portal-badge">Portal Active</span>
                  )}
                </div>

                <div className="card-body">
                  <h3>{client.client_name}</h3>
                  <p className="email">✉ {client.client_email}</p>
                  {client.client_phone && (
                    <p className="phone">📞 {client.client_phone}</p>
                  )}
                  
                  <div className="meta">
                    <span>{client.project_count} Project{client.project_count !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>Joined {new Date(client.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowAddModal(false)}>×</button>
            
            <h2>Add New Client</h2>
            
            <form onSubmit={handleAddClient}>
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  value={newClient.client_name}
                  onChange={(e) => setNewClient({ ...newClient, client_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={newClient.client_email}
                  onChange={(e) => setNewClient({ ...newClient, client_email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={newClient.client_phone}
                  onChange={(e) => setNewClient({ ...newClient, client_phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={newClient.client_company}
                  onChange={(e) => setNewClient({ ...newClient, client_company: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newClient.create_portal_access}
                    onChange={(e) => setNewClient({ ...newClient, create_portal_access: e.target.checked })}
                  />
                  <span>Create client portal access</span>
                </label>
              </div>

              <button type="submit" className="submit-button">
                Create Client
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .clients-page {
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

        .add-button {
          padding: 12px 30px;
          background: #ff6b35;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .add-button:hover {
          background: #e55a2b;
          transform: translateY(-2px);
        }

        .loading,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
          font-size: 1.1rem;
        }

        .clients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .client-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .client-card:hover {
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

        .client-number {
          font-weight: 700;
          color: #1a1a1a;
          font-family: 'Courier New', monospace;
        }

        .portal-badge {
          padding: 4px 12px;
          background: #10b981;
          color: white;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .card-body {
          padding: 20px;
        }

        .card-body h3 {
          margin: 0 0 12px 0;
          color: #1a1a1a;
          font-size: 1.3rem;
        }

        .email,
        .phone {
          margin: 8px 0;
          color: #555;
          font-size: 0.95rem;
        }

        .meta {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
          font-size: 0.85rem;
          color: #999;
          display: flex;
          gap: 8px;
          align-items: center;
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
          max-width: 500px;
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
          font-size: 1.6rem;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="tel"] {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #ff6b35;
        }

        .form-group label input[type="checkbox"] {
          margin-right: 10px;
        }

        .submit-button {
          width: 100%;
          padding: 14px;
          background: #ff6b35;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 10px;
        }

        .submit-button:hover {
          background: #e55a2b;
        }

        @media (max-width: 768px) {
          .clients-grid {
            grid-template-columns: 1fr;
          }

          .controls {
            flex-direction: column;
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
