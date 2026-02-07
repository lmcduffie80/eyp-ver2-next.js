'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ClientPortalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/client-portal/auth/verify');
      const data = await response.json();
      
      if (data.authenticated) {
        router.push('/client-portal/dashboard');
      }
    } catch (error) {
      // Not authenticated, stay on login page
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/client-portal/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        router.push('/client-portal/dashboard');
      } else {
        setError(data.message || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Image 
            src="/EYP Logo_New.png" 
            alt="EYP" 
            width={300}
            height={80}
            className="logo"
            priority
          />
          <h1>Client Portal</h1>
          <p>Access your event details and contracts</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="info-box">
          <p>Haven't activated your portal yet? Check your email for the activation link.</p>
        </div>

        <div className="back-link">
          <a href="/">← Back to Website</a>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-container {
          width: 100%;
          max-width: 450px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          padding: 50px 40px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo {
          height: auto;
          width: auto;
          max-width: 100%;
          margin-bottom: 20px;
        }

        .login-header h1 {
          color: #1a1a1a;
          font-size: 2rem;
          margin: 0 0 10px 0;
          font-weight: 700;
        }

        .login-header p {
          color: #666;
          margin: 0;
          font-size: 1rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .form-group input {
          padding: 14px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #ff6b35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
        }

        .form-group input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .login-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #ff6b35 0%, #f41b1b 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          background: #fee;
          color: #dc3545;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          text-align: center;
          border: 1px solid #dc3545;
        }

        .info-box {
          margin-top: 25px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 10px;
          text-align: center;
        }

        .info-box p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .back-link {
          text-align: center;
          margin-top: 25px;
        }

        .back-link a {
          color: #999;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .back-link a:hover {
          color: #ff6b35;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 40px 30px;
          }

          .login-header h1 {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
}
