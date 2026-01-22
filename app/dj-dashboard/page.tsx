'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Review {
  id: number;
  client_name: string;
  rating: number;
  comment: string;
  event_name?: string;
  event_date?: string;
  service_type: string;
  created_at: string;
}

export default function DJDashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [djUsername, setDjUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // For demo purposes, we'll use a simple username input
  // In production, this would use proper authentication
  
  useEffect(() => {
    // Check if DJ username is stored in session
    const storedUsername = sessionStorage.getItem('dj_username');
    if (storedUsername) {
      setDjUsername(storedUsername);
      setIsAuthenticated(true);
      fetchDJReviews(storedUsername);
    } else {
      setLoadingReviews(false);
    }
  }, []);
  
  const fetchDJReviews = async (username: string) => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`/api/reviews?dj_username=${encodeURIComponent(username)}&status=approved`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching DJ reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (djUsername.trim()) {
      sessionStorage.setItem('dj_username', djUsername.trim());
      setIsAuthenticated(true);
      fetchDJReviews(djUsername.trim());
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('dj_username');
    setIsAuthenticated(false);
    setDjUsername('');
    setReviews([]);
  };
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  if (!isAuthenticated) {
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
          maxWidth: '500px',
          width: '100%',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          padding: '3rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Image
              src="/EYP Logo_New.png"
              alt="EYP Logo"
              width={150}
              height={45}
              style={{ height: 'auto', width: 'auto', maxWidth: '150px' }}
              priority
            />
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            DJ Dashboard Login
          </h1>
          
          <p style={{
            fontSize: '1rem',
            color: '#666',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Enter your DJ username to view your reviews
          </p>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#1a1a1a'
              }}>
                DJ Username
              </label>
              <input
                type="text"
                value={djUsername}
                onChange={(e) => setDjUsername(e.target.value)}
                placeholder="Enter your username"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '1rem',
                background: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
              }}
            >
              Login
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link
              href="/"
              style={{
                color: '#666',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '2rem',
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: '0.25rem'
          }}>
            DJ Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            Welcome back, <strong>@{djUsername}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link
            href="/"
            style={{
              padding: '0.5rem 1.5rem',
              background: '#e0e0e0',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Home
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Stats Card */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: '1.5rem'
          }}>
            My Client Reviews
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#ff6b35',
                marginBottom: '0.5rem'
              }}>
                {reviews.length}
              </div>
              <div style={{ color: '#666', fontSize: '1rem' }}>
                Total Reviews
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#ffc107',
                marginBottom: '0.5rem'
              }}>
                {averageRating} ⭐
              </div>
              <div style={{ color: '#666', fontSize: '1rem' }}>
                Average Rating
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews List */}
        {loadingReviews ? (
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: '#666' }}>Loading your reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
            <h3 style={{
              fontSize: '1.5rem',
              color: '#1a1a1a',
              marginBottom: '0.5rem'
            }}>
              No reviews yet
            </h3>
            <p style={{ color: '#666' }}>
              Your approved client reviews will appear here
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1.5rem'
          }}>
            {reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Rating */}
                <div style={{
                  fontSize: '1.5rem',
                  marginBottom: '1rem'
                }}>
                  {'⭐'.repeat(review.rating)}
                  <span style={{
                    marginLeft: '0.5rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: '#ffc107'
                  }}>
                    {review.rating}.0
                  </span>
                </div>
                
                {/* Comment */}
                <p style={{
                  fontSize: '1.1rem',
                  lineHeight: '1.7',
                  color: '#1a1a1a',
                  marginBottom: '1.5rem',
                  fontStyle: 'italic'
                }}>
                  &quot;{review.comment}&quot;
                </p>
                
                {/* Client Info */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  color: '#666',
                  fontSize: '0.95rem'
                }}>
                  <div>
                    <strong style={{ color: '#1a1a1a' }}>Client:</strong> {review.client_name}
                  </div>
                  {review.event_name && (
                    <div>
                      <strong style={{ color: '#1a1a1a' }}>Event:</strong> {review.event_name}
                    </div>
                  )}
                  {review.event_date && (
                    <div>
                      <strong style={{ color: '#1a1a1a' }}>Date:</strong>{' '}
                      {new Date(review.event_date).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <strong style={{ color: '#1a1a1a' }}>Service:</strong> {review.service_type}
                  </div>
                </div>
                
                {/* Submission Date */}
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e0e0e0',
                  color: '#999',
                  fontSize: '0.85rem'
                }}>
                  Submitted on {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
