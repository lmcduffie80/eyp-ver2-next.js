'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin-verify');
        const data = await response.json();
        
        if (data.authenticated) {
          // Already logged in, redirect to dashboard
          router.push('/admin');
        }
      } catch (err) {
        // Not authenticated, stay on login page
        console.log('Not authenticated');
      }
    };
    
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic validation
      if (!username.trim() || !password) {
        setError('Please enter both username and password.');
        setLoading(false);
        return;
      }

      // Call admin login API
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          password 
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store user info in localStorage (display purposes only - session is in HTTP-only cookie)
        localStorage.setItem('admin_user', data.user);
        localStorage.setItem('admin_display_name', data.displayName);
        
        // Redirect to admin dashboard
        router.push('/admin');
      } else {
        setError(data.message || 'Invalid username or password. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Image 
            src="/EYP Logo_New.png" 
            alt="Externally Yours Productions" 
            width={507}
            height={135}
            className="login-logo"
            priority
          />
          <h1>Admin Portal</h1>
          <span className="admin-badge">Administrator Access</span>
          <p>Sign in to access the administrative dashboard</p>
        </div>

        {error && (
          <div className="error-message show">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="back-link">
          <a href="/">← Back to Website</a>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        }

        .login-container {
          background: white;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          padding: 3rem;
          width: 100%;
          max-width: 450px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo {
          margin-bottom: 1rem;
          height: auto;
          width: auto;
          max-width: 100%;
        }

        .login-header h1 {
          color: #1a1a1a;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: #666;
          font-size: 0.9rem;
        }

        .admin-badge {
          display: inline-block;
          background: #ff6b35;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: bold;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #ff6b35;
        }

        .form-group input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .login-button {
          width: 100%;
          padding: 0.75rem;
          background: #ff6b35;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .login-button:hover:not(:disabled) {
          background: #e55a2b;
          transform: translateY(-2px);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee;
          color: #dc3545;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: none;
          border: 1px solid #dc3545;
        }

        .error-message.show {
          display: block;
        }

        .back-link {
          text-align: center;
          margin-top: 1.5rem;
        }

        .back-link a {
          color: #666;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .back-link a:hover {
          color: #ff6b35;
        }

        @media (max-width: 768px) {
          .login-page {
            padding: 1rem;
            align-items: flex-start;
            padding-top: 2rem;
          }

          .login-container {
            padding: 1.5rem;
            border-radius: 10px;
            max-width: 100%;
          }

          .login-header {
            margin-bottom: 1.5rem;
          }

          .login-logo {
            height: 101px;
            margin-bottom: 0.75rem;
          }

          .login-header h1 {
            font-size: 1.25rem;
            margin-bottom: 0.25rem;
          }

          .login-header p {
            font-size: 0.8rem;
          }

          .admin-badge {
            font-size: 0.75rem;
            padding: 0.2rem 0.6rem;
            margin-top: 0.25rem;
          }

          .form-group {
            margin-bottom: 1rem;
          }

          .form-group label {
            font-size: 0.875rem;
            margin-bottom: 0.4rem;
          }

          .form-group input {
            padding: 0.6rem 0.75rem;
            font-size: 0.9rem;
          }

          .login-button {
            padding: 0.65rem;
            font-size: 0.95rem;
          }

          .error-message {
            padding: 0.6rem;
            font-size: 0.85rem;
            margin-bottom: 0.75rem;
          }

          .back-link {
            margin-top: 1rem;
          }

          .back-link a {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
