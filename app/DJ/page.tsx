'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function DJPortal() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        padding: '3rem',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem' }}>
          <Image
            src="/EYP Logo_New.png"
            alt="EYP Logo"
            width={150}
            height={45}
            style={{ height: 'auto', width: 'auto', maxWidth: '150px' }}
            priority
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#1a1a1a',
          marginBottom: '1rem'
        }}>
          DJ Portal
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.1rem',
          color: '#666',
          marginBottom: '2.5rem',
          lineHeight: '1.6'
        }}>
          Welcome to the Externally Yours Productions DJ Portal. Access your dashboard, manage bookings, and view your schedule.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <Link
            href="/dj-dashboard"
            style={{
              display: 'block',
              padding: '1rem 2rem',
              background: '#ff6b35',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
            }}
          >
            DJ Dashboard Login
          </Link>
          
          <Link
            href="/admin"
            style={{
              display: 'block',
              padding: '1rem 2rem',
              background: '#4CAF50',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
            }}
          >
            Admin Dashboard Login
          </Link>

          <Link
            href="/"
            style={{
              display: 'block',
              padding: '1rem 2rem',
              background: 'transparent',
              color: '#1a1a1a',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            Back to Home
          </Link>
        </div>

        {/* Info Section */}
        <div style={{
          borderTop: '1px solid #e0e0e0',
          paddingTop: '2rem',
          marginTop: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '1rem'
          }}>
            DJ Resources
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '0.95rem',
            color: '#666',
            lineHeight: '2'
          }}>
            <li>📅 View Upcoming Events</li>
            <li>⭐ View Client Reviews</li>
            <li>💰 Track Your Earnings</li>
            <li>🎵 Manage Music Library</li>
            <li>📊 Performance Analytics</li>
          </ul>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e0e0e0',
          fontSize: '0.85rem',
          color: '#999'
        }}>
          <p>Need help? Contact us at{' '}
            <a
              href="mailto:lee@externallyyoursproductions.com"
              style={{ color: '#ff6b35', textDecoration: 'none' }}
            >
              lee@externallyyoursproductions.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
