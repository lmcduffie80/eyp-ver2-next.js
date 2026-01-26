'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function DJPortal() {
  const router = useRouter();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    clearMessages();
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!loginUsername || !loginPassword) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      // First try localStorage for development
      const existingUsers = JSON.parse(localStorage.getItem('dj_users') || '[]');
      const user = existingUsers.find(
        (u: any) => (u.username === loginUsername || u.email === loginUsername) && u.password === loginPassword
      );

      if (user) {
        // Set authentication data (localStorage fallback for development)
        const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
        const tokenExpiry = Date.now() + SESSION_TIMEOUT;
        
        // Compute normalized display name
        const displayName = (user.first_name && user.last_name)
          ? `${user.first_name} ${user.last_name}`
          : user.username;
        
        localStorage.setItem('dj_token', 'dev_token_' + Date.now());
        localStorage.setItem('dj_user', user.username);
        localStorage.setItem('dj_display_name', displayName);
        localStorage.setItem('dj_token_expiry', tokenExpiry.toString());
        localStorage.setItem('dj_last_activity', Date.now().toString());
        
        router.push('/dj-dashboard');
        return;
      }

      // Try API call if localStorage fails
      const response = await fetch('/api/dj-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: loginUsername, 
          password: loginPassword 
        })
      });

      const data = await response.json();

      if (data.success) {
        // Set authentication data
        localStorage.setItem('dj_token', data.token);
        localStorage.setItem('dj_user', data.user);
        localStorage.setItem('dj_display_name', data.displayName || data.user);
        localStorage.setItem('dj_token_expiry', data.tokenExpiry?.toString() || (Date.now() + 30 * 60 * 1000).toString());
        localStorage.setItem('dj_last_activity', Date.now().toString());
        
        router.push('/dj-dashboard');
      } else {
        setErrorMessage(data.message || 'Invalid username or password.');
      }
    } catch {
      setErrorMessage('Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Validation
    if (!signupUsername || !signupEmail || !signupPassword || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (signupUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    if (signupPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // Check if username or email already exists
      const existingUsers = JSON.parse(localStorage.getItem('dj_users') || '[]');
      const userExists = existingUsers.find(
        (u: any) => u.username === signupUsername || u.email === signupEmail
      );

      if (userExists) {
        setErrorMessage('Username or email already exists.');
        setIsLoading(false);
        return;
      }

      // Create new user (localStorage for development)
      const newUser = {
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        createdAt: new Date().toISOString()
      };

      existingUsers.push(newUser);
      localStorage.setItem('dj_users', JSON.stringify(existingUsers));

      // Show success message and switch to login
      setSuccessMessage('Account created successfully! Please sign in.');
      
      // Clear signup form
      setSignupUsername('');
      setSignupEmail('');
      setSignupPassword('');
      setConfirmPassword('');

      // Switch to login mode after 2 seconds
      setTimeout(() => {
        setIsSignupMode(false);
        clearMessages();
      }, 2000);
    } catch {
      setErrorMessage('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        padding: '3rem',
        width: '100%',
        maxWidth: '450px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Image
              src="/EYP Logo_New.png"
              alt="Externally Yours Productions, LLC"
              width={300}
              height={80}
              style={{ height: 'auto', width: 'auto', maxWidth: '300px' }}
              priority
            />
          </div>
          <h1 style={{
            color: '#1a1a1a',
            fontSize: '2rem',
            marginBottom: '0.5rem',
            fontWeight: 'bold'
          }}>
            DJ Portal
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            {isSignupMode ? 'Create your DJ portal account' : 'Sign in to access your calendar and bookings'}
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            background: '#fee',
            color: '#dc3545',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #dc3545',
            fontSize: '0.9rem'
          }}>
            {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div style={{
            background: '#efe',
            color: '#28a745',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #28a745',
            fontSize: '0.9rem'
          }}>
            {successMessage}
          </div>
        )}

        {/* Login Form */}
        {!isSignupMode && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>
                Username or Email
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                autoComplete="username"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: isLoading ? '#ccc' : '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link
                href="/dj-request-reset"
                style={{
                  color: '#666',
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        )}

        {/* Signup Form */}
        {isSignupMode && (
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>
                Username
              </label>
              <input
                type="text"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                required
                minLength={3}
                autoComplete="username"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>
                Email
              </label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>
                Password
              </label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
              <small style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', display: 'block' }}>
                Password must be at least 8 characters long
              </small>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontWeight: '500'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: isLoading ? '#ccc' : '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Toggle Mode */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            {isSignupMode ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff6b35',
              textDecoration: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {isSignupMode ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            href="/"
            style={{
              color: '#666',
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
