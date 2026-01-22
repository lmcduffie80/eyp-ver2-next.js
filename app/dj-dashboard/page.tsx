'use client';

import React, { useState, useEffect } from 'react';

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

interface Booking {
  id: number;
  djUser: string;
  clientName: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  totalRevenue: number;
  ccPayment: number;
  payout: number;
}

interface BlockedDate {
  id: number;
  djUser: string;
  date: string;
  reason: string;
}

type Section = 'dashboard' | 'projects' | 'reviews';
type ProjectFilter = 'all' | 'upcoming' | 'past';

export default function DJDashboard() {
  // Authentication
  const [djUsername, setDjUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Navigation
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  
  // Loading states
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingBlockedDates, setLoadingBlockedDates] = useState(true);
  
  // Calendar
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Projects filter
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>('all');
  
  // Blocked date form
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  
  // Selected booking for modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    // Check if DJ is authenticated from main login
    const storedUsername = localStorage.getItem('dj_user');
    const storedToken = localStorage.getItem('dj_token');
    
    if (storedUsername && storedToken) {
      setDjUsername(storedUsername);
      setIsAuthenticated(true);
      // Fetch all data
      fetchReviews(storedUsername);
      fetchBookings(storedUsername);
      fetchBlockedDates(storedUsername);
    } else {
      // Redirect to main login if not authenticated
      window.location.href = '/DJ';
    }
  }, []);

  const fetchReviews = async (username: string) => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`/api/reviews?dj_username=${encodeURIComponent(username)}&status=approved`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchBookings = async (username: string) => {
    setLoadingBookings(true);
    try {
      const response = await fetch(`/api/bookings`);
      const data = await response.json();
      if (data.success) {
        // Filter bookings for this DJ
        const djBookings = (data.data || []).filter(
          (b: Booking) => b.djUser === username
        );
        setBookings(djBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchBlockedDates = async (username: string) => {
    setLoadingBlockedDates(true);
    try {
      const response = await fetch(`/api/blocked-dates`);
      const data = await response.json();
      if (data.success) {
        // Filter blocked dates for this DJ
        const djBlockedDates = (data.data || []).filter(
          (bd: BlockedDate) => bd.djUser === username
        );
        setBlockedDates(djBlockedDates);
      }
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    } finally {
      setLoadingBlockedDates(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dj_user');
    localStorage.removeItem('dj_token');
    localStorage.removeItem('dj_token_expiry');
    localStorage.removeItem('dj_last_activity');
    window.location.href = '/DJ';
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) return;

    try {
      const response = await fetch('/api/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          djUser: djUsername,
          date: newBlockedDate,
          reason: newBlockedReason || 'Unavailable'
        })
      });

      if (response.ok) {
        setNewBlockedDate('');
        setNewBlockedReason('');
        fetchBlockedDates(djUsername);
      }
    } catch (error) {
      console.error('Error adding blocked date:', error);
    }
  };

  const handleDeleteBlockedDate = async (id: number) => {
    try {
      const response = await fetch(`/api/blocked-dates/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchBlockedDates(djUsername);
      }
    } catch (error) {
      console.error('Error deleting blocked date:', error);
    }
  };

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingBookings = bookings.filter(b => new Date(b.date) >= today);
  const nextBooking = upcomingBookings.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )[0];
  
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalRevenue || 0), 0);

  // Filter bookings for projects section
  const getFilteredBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filtered = [...bookings];
    
    if (projectFilter === 'upcoming') {
      filtered = filtered.filter(b => new Date(b.date) >= today);
    } else if (projectFilter === 'past') {
      filtered = filtered.filter(b => new Date(b.date) < today);
    }
    
    return filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  // Calendar helpers
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, prevMonthDays - i)
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, day)
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, day)
      });
    }

    return days;
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.date.startsWith(dateStr));
  };

  const getBlockedDateForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.find(bd => bd.date.startsWith(dateStr));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Navigation */}
      <nav className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* DJ Portal Header */}
        <div style={{ 
          padding: '1rem', 
          background: '#1a1a1a', 
          borderBottom: '1px solid #2d2d2d',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          position: 'relative'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: 1
          }}>
            {/* Avatar Circle with "D" */}
            <div 
              onClick={() => setActiveSection('dashboard')}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6b35 0%, #f5436f 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#ffffff',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)'
              }}
              title="DJ Dashboard"
            >
              D
            </div>
            {/* DJ Portal Text */}
            <div 
              onClick={() => setActiveSection('dashboard')} 
              style={{ 
                fontSize: '1.1rem',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              DJ Portal
            </div>
          </div>
        </div>
        
        {/* Navigation Group */}
        <div className="sidebar-nav-group">
          <div className="nav-group-title">Dashboard</div>
          <a 
            className={`sidebar-nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a 
            className={`sidebar-nav-link ${activeSection === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveSection('projects')}
          >
            <span className="nav-icon">📅</span>
            <span>Projects</span>
          </a>
          <a 
            className={`sidebar-nav-link ${activeSection === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveSection('reviews')}
          >
            <span className="nav-icon">⭐</span>
            <span>Reviews</span>
          </a>
        </div>

        {/* User Profile at Bottom */}
        <div className="sidebar-user-profile">
          <div className="user-avatar">
            {djUsername.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{djUsername}</div>
            <div className="user-role">DJ</div>
          </div>
        </div>

        {/* Logout Button Below Profile */}
        <div style={{ padding: '1rem', borderTop: '1px solid #2d2d2d' }}>
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            style={{ width: '100%' }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'show' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <div className="dashboard-header-modern">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <div>
            <h1>Welcome back, {djUsername}</h1>
            <p className="subtitle">
              {activeSection === 'dashboard' && "View your stats, calendar, and upcoming bookings"}
              {activeSection === 'projects' && "Manage your current and past projects"}
              {activeSection === 'reviews' && "See what your clients are saying"}
            </p>
          </div>
        </div>

        <div className="dashboard-container">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div>
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: nextBooking ? 'pointer' : 'default'
                }}
                onClick={() => nextBooking && setActiveSection('projects')}>
                  <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📆 Next Booking</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a1a1a' }}>
                    {loadingBookings ? 'Loading...' : (
                      nextBooking 
                        ? `${new Date(nextBooking.date).toLocaleDateString()} - ${nextBooking.eventType}`
                        : 'No upcoming bookings'
                    )}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📅 Total Bookings</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a' }}>
                    {loadingBookings ? '...' : bookings.length}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>💰 Total Revenue</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a' }}>
                    {loadingBookings ? '...' : `$${totalRevenue.toFixed(2)}`}
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div style={{ background: 'white', padding: '1.21rem', borderRadius: '16.12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '645px', margin: '0 auto 2rem auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <button onClick={previousMonth} style={{
                    padding: '0.5rem 1rem',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}>
                    ← Prev
                  </button>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                  <button onClick={nextMonth} style={{
                    padding: '0.5rem 1rem',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}>
                    Next →
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.34rem' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{ 
                      textAlign: 'center', 
                      fontWeight: 'bold', 
                      padding: '0.34rem',
                      color: '#666',
                      fontSize: '0.89rem'
                    }}>
                      {day}
                    </div>
                  ))}
                  
                  {generateCalendarDays().map((dayInfo, idx) => {
                    const bookingsOnDate = getBookingsForDate(dayInfo.date);
                    const blockedDate = getBlockedDateForDate(dayInfo.date);
                    const today = isToday(dayInfo.date);

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (bookingsOnDate.length > 0) {
                            setSelectedBooking(bookingsOnDate[0]);
                          }
                        }}
                        style={{
                          padding: '0.5rem',
                          textAlign: 'center',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          background: blockedDate ? '#fcc' : bookingsOnDate.length > 0 ? '#cfe' : today ? '#fff3cd' : 'white',
                          opacity: dayInfo.isCurrentMonth ? 1 : 0.4,
                          cursor: bookingsOnDate.length > 0 ? 'pointer' : 'default',
                          position: 'relative',
                          minHeight: '60px',
                          fontSize: '0.89rem'
                        }}
                      >
                        <div style={{ fontWeight: today ? 'bold' : 'normal' }}>{dayInfo.day}</div>
                        {bookingsOnDate.length > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#2e7d32', marginTop: '0.25rem' }}>
                            {bookingsOnDate.length} booking{bookingsOnDate.length > 1 ? 's' : ''}
                          </div>
                        )}
                        {blockedDate && (
                          <div style={{ fontSize: '0.7rem', color: '#c62828', marginTop: '0.25rem' }}>
                            Blocked
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Blocked Dates Management */}
              <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Blocked Dates</h3>
                
                <form onSubmit={handleAddBlockedDate} style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <input
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    required
                    style={{
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      flex: '1',
                      minWidth: '200px'
                    }}
                  />
                  <input
                    type="text"
                    value={newBlockedReason}
                    onChange={(e) => setNewBlockedReason(e.target.value)}
                    placeholder="Reason (optional)"
                    style={{
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      flex: '2',
                      minWidth: '200px'
                    }}
                  />
                  <button type="submit" style={{
                    padding: '0.75rem 1.5rem',
                    background: '#ff6b35',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}>
                    Block Date
                  </button>
                </form>

                {loadingBlockedDates ? (
                  <p>Loading blocked dates...</p>
                ) : blockedDates.length === 0 ? (
                  <p style={{ color: '#666' }}>No blocked dates</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {blockedDates.map(bd => (
                      <div key={bd.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: '#f5f5f5',
                        borderRadius: '6px'
                      }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{new Date(bd.date).toLocaleDateString()}</div>
                          <div style={{ color: '#666', fontSize: '0.9rem' }}>{bd.reason}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteBlockedDate(bd.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {activeSection === 'projects' && (
            <div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setProjectFilter('all')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: projectFilter === 'all' ? '#ff6b35' : '#f5f5f5',
                    color: projectFilter === 'all' ? 'white' : '#1a1a1a',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  All ({bookings.length})
                </button>
                <button
                  onClick={() => setProjectFilter('upcoming')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: projectFilter === 'upcoming' ? '#ff6b35' : '#f5f5f5',
                    color: projectFilter === 'upcoming' ? 'white' : '#1a1a1a',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Upcoming ({upcomingBookings.length})
                </button>
                <button
                  onClick={() => setProjectFilter('past')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: projectFilter === 'past' ? '#ff6b35' : '#f5f5f5',
                    color: projectFilter === 'past' ? 'white' : '#1a1a1a',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Past ({bookings.length - upcomingBookings.length})
                </button>
              </div>

              {loadingBookings ? (
                <p>Loading bookings...</p>
              ) : getFilteredBookings().length === 0 ? (
                <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ color: '#666' }}>No bookings found</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {getFilteredBookings().map(booking => (
                    <div key={booking.id} style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedBooking(booking)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {booking.eventType}
                          </h3>
                          <p style={{ color: '#666' }}>{booking.clientName || 'No client name'}</p>
                        </div>
                        <div style={{
                          padding: '0.5rem 1rem',
                          background: new Date(booking.date) >= today ? '#e8f5e9' : '#f5f5f5',
                          color: new Date(booking.date) >= today ? '#2e7d32' : '#666',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}>
                          {new Date(booking.date) >= today ? 'Upcoming' : 'Past'}
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                        <div>
                          <div style={{ color: '#666', marginBottom: '0.25rem' }}>📅 Date</div>
                          <div style={{ fontWeight: '500' }}>{new Date(booking.date).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div style={{ color: '#666', marginBottom: '0.25rem' }}>🕐 Time</div>
                          <div style={{ fontWeight: '500' }}>{booking.time || 'Not specified'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#666', marginBottom: '0.25rem' }}>📍 Location</div>
                          <div style={{ fontWeight: '500' }}>{booking.location || 'Not specified'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#666', marginBottom: '0.25rem' }}>💰 Revenue</div>
                          <div style={{ fontWeight: '500' }}>${booking.totalRevenue?.toFixed(2) || '0.00'}</div>
                        </div>
                        <div>
                          <div style={{ color: '#666', marginBottom: '0.25rem' }}>💵 Your Payout</div>
                          <div style={{ fontWeight: '500', color: '#2e7d32' }}>${booking.payout?.toFixed(2) || '0.00'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Section */}
          {activeSection === 'reviews' && (
            <div>
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ff6b35', marginBottom: '0.5rem' }}>
                  {averageRating}
                </div>
                <div style={{ fontSize: '2rem', color: '#ffd700', marginBottom: '0.5rem' }}>
                  {'★'.repeat(Math.round(parseFloat(averageRating)))}
                  {'☆'.repeat(5 - Math.round(parseFloat(averageRating)))}
                </div>
                <div style={{ color: '#666' }}>{reviews.length} Reviews</div>
              </div>

              {loadingReviews ? (
                <p>Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ color: '#666' }}>No reviews yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map(review => (
                    <div key={review.id} style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            {review.client_name}
                          </h3>
                          <div style={{ color: '#ffd700', fontSize: '1.25rem' }}>
                            {'★'.repeat(review.rating)}
                            {'☆'.repeat(5 - review.rating)}
                          </div>
                        </div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '1rem' }}>
                        {review.comment}
                      </p>
                      {review.event_name && (
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          Event: {review.event_name}
                          {review.event_date && ` • ${new Date(review.event_date).toLocaleDateString()}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Booking Details Modal */}
          {selectedBooking && (
            <div
              onClick={() => setSelectedBooking(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  maxWidth: '600px',
                  width: '90%',
                  maxHeight: '80vh',
                  overflow: 'auto'
                }}
              >
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                  Booking Details
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Event Type</div>
                    <div style={{ fontWeight: '500' }}>{selectedBooking.eventType}</div>
                  </div>
                  
                  <div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Client Name</div>
                    <div style={{ fontWeight: '500' }}>{selectedBooking.clientName || 'Not specified'}</div>
                  </div>
                  
                  <div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Date</div>
                    <div style={{ fontWeight: '500' }}>{new Date(selectedBooking.date).toLocaleDateString()}</div>
                  </div>
                  
                  <div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Time</div>
                    <div style={{ fontWeight: '500' }}>{selectedBooking.time || 'Not specified'}</div>
                  </div>
                  
                  <div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Location</div>
                    <div style={{ fontWeight: '500' }}>{selectedBooking.location || 'Not specified'}</div>
                  </div>
                  
                  {selectedBooking.contactEmail && (
                    <div>
                      <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Contact Email</div>
                      <div style={{ fontWeight: '500' }}>{selectedBooking.contactEmail}</div>
                    </div>
                  )}
                  
                  {selectedBooking.contactPhone && (
                    <div>
                      <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Contact Phone</div>
                      <div style={{ fontWeight: '500' }}>{selectedBooking.contactPhone}</div>
                    </div>
                  )}
                  
                  {selectedBooking.notes && (
                    <div>
                      <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Notes</div>
                      <div style={{ fontWeight: '500' }}>{selectedBooking.notes}</div>
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
                    <div>
                      <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Revenue</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${selectedBooking.totalRevenue?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                      <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>CC Payment</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${selectedBooking.ccPayment?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                      <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Your Payout</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2e7d32' }}>${selectedBooking.payout?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedBooking(null)}
                  style={{
                    marginTop: '2rem',
                    width: '100%',
                    padding: '0.75rem',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
