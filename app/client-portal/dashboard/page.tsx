'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClientData {
  client_name: string;
  client_email: string;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/client-portal/auth/verify');
      const data = await response.json();
      
      if (data.authenticated) {
        setClientData(data.client);
      } else {
        router.push('/client-portal/login');
      }
      setLoading(false);
    } catch (error) {
      router.push('/client-portal/login');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/client-portal/auth/logout', { method: 'POST' });
    router.push('/client-portal/login');
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="top-bar">
        <div className="top-bar-content">
          <h1>Welcome, {clientData?.client_name}!</h1>
          <div className="actions">
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="welcome-card">
          <h2>Your Client Portal</h2>
          <p>
            Welcome to your personal client portal. Here you can view your contracts, track payments, 
            and stay updated on your event details.
          </p>
        </div>

        <div className="actions-grid">
          <div className="action-card">
            <div className="action-icon">📄</div>
            <h3>Contracts</h3>
            <p>View and sign your event contracts</p>
            <button className="action-button" onClick={() => alert('Contracts feature coming soon')}>
              View Contracts
            </button>
          </div>

          <div className="action-card">
            <div className="action-icon">💳</div>
            <h3>Payments</h3>
            <p>Make payments and view payment history</p>
            <button className="action-button" onClick={() => alert('Payments feature coming soon')}>
              View Payments
            </button>
          </div>

          <div className="action-card">
            <div className="action-icon">📋</div>
            <h3>Project Details</h3>
            <p>View your event information and timeline</p>
            <button className="action-button" onClick={() => alert('Project details coming soon')}>
              View Details
            </button>
          </div>

          <div className="action-card">
            <div className="action-icon">📁</div>
            <h3>Files</h3>
            <p>Access shared documents and files</p>
            <button className="action-button" onClick={() => alert('Files feature coming soon')}>
              View Files
            </button>
          </div>
        </div>

        <div className="info-box">
          <h3>Need Help?</h3>
          <p>
            If you have any questions or need assistance, please contact us at{' '}
            <a href="mailto:lee@externallyyoursproductions.com">lee@externallyyoursproductions.com</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .top-bar {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          padding: 25px 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .top-bar-content {
          max-width: 1200px;
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

        .logout-button {
          padding: 10px 25px;
          border-radius: 8px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .logout-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
          color: #666;
          font-size: 1.1rem;
        }

        .welcome-card {
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          margin-bottom: 40px;
          text-align: center;
        }

        .welcome-card h2 {
          color: #1a1a1a;
          margin: 0 0 15px 0;
          font-size: 2rem;
        }

        .welcome-card p {
          color: #666;
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }

        .action-card {
          background: white;
          padding: 35px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          text-align: center;
          transition: all 0.3s ease;
        }

        .action-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }

        .action-icon {
          font-size: 3.5rem;
          margin-bottom: 20px;
        }

        .action-card h3 {
          color: #1a1a1a;
          margin: 0 0 12px 0;
          font-size: 1.4rem;
        }

        .action-card p {
          color: #666;
          margin: 0 0 25px 0;
          font-size: 1rem;
          line-height: 1.5;
        }

        .action-button {
          width: 100%;
          padding: 14px 25px;
          background: linear-gradient(135deg, #ff6b35 0%, #f41b1b 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(255, 107, 53, 0.3);
        }

        .info-box {
          background: linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%);
          padding: 30px;
          border-radius: 16px;
          border-left: 6px solid #6366f1;
        }

        .info-box h3 {
          color: #1a1a1a;
          margin: 0 0 12px 0;
          font-size: 1.3rem;
        }

        .info-box p {
          color: #555;
          margin: 0;
          font-size: 1rem;
          line-height: 1.6;
        }

        .info-box a {
          color: #6366f1;
          font-weight: 600;
          text-decoration: none;
        }

        .info-box a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .actions-grid {
            grid-template-columns: 1fr;
          }

          .welcome-card {
            padding: 30px 25px;
          }

          .action-card {
            padding: 30px 25px;
          }

          .top-bar-content {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
