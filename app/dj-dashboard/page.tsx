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
  status?: string;
}

interface BlockedDate {
  id: number;
  djUser: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  blockedBy?: string;
}

type Section = 'dashboard' | 'projects' | 'reviews';
type ProjectFilter = 'all' | 'upcoming' | 'past';

export default function DJDashboard() {
  // Authentication
  const [djUsername, setDjUsername] = useState('');
  const [djDisplayName, setDjDisplayName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Inactivity tracking
  const INACTIVITY_TIMEOUT = 30 * 1000; // 30 seconds
  const WARNING_TIME = 10 * 1000; // Show warning 10 seconds before logout
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [secondsUntilLogout, setSecondsUntilLogout] = useState(30);
  
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
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>('upcoming');
  
  // Blocked date form
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  
  // Selected booking for modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Helper to format date as YYYY-MM-DD in local timezone (avoids UTC conversion issues)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to parse date strings as local dates (avoids UTC timezone shift)
  const parseLocalDate = (dateString: string) => {
    if (!dateString) return new Date();
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    const yearNum = Number(year);
    const monthNum = Number(month);
    const dayNum = Number(day);
    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) return new Date();
    return new Date(yearNum, monthNum - 1, dayNum);
  };

  // Expanded notes tracking
  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);

  useEffect(() => {
    // Verify session server-side via HttpOnly cookie
    fetch('/api/dj-verify')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          const username = data.user;
          const displayName = data.displayName || data.user;

          setDjUsername(username);
          setDjDisplayName(displayName);
          // Keep display name in localStorage for UI use only
          localStorage.setItem('dj_display_name', displayName);
          setIsAuthenticated(true);
          setIsCheckingAuth(false);

          fetchReviews(username);
          fetchBookings(displayName);
          fetchBlockedDates(displayName);
        } else {
          setIsCheckingAuth(false);
          window.location.href = '/DJ';
        }
      })
      .catch(() => {
        setIsCheckingAuth(false);
        window.location.href = '/DJ';
      });
  }, []);

  // Activity tracking and auto-logout
  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer: ReturnType<typeof setTimeout>;
    let warningTimer: ReturnType<typeof setTimeout>;
    let countdownInterval: ReturnType<typeof setInterval>;

    const updateLastActivity = () => {
      setShowInactivityWarning(false);
      resetInactivityTimer();
    };

    const startCountdown = () => {
      let seconds = 10;
      setSecondsUntilLogout(seconds);
      countdownInterval = setInterval(() => {
        seconds--;
        setSecondsUntilLogout(seconds);
        if (seconds <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
    };

    const resetInactivityTimer = () => {
      // Clear existing timers
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);

      // Set warning timer (20 seconds - shows warning at 10 seconds remaining)
      warningTimer = setTimeout(() => {
        setShowInactivityWarning(true);
        startCountdown();
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Set logout timer (30 seconds)
      inactivityTimer = setTimeout(() => {
        console.log('Auto-logout due to inactivity');
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    };

    // Activity event listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, updateLastActivity);
    });

    // Initialize timer
    updateLastActivity();

    // Cleanup
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
    };
  }, [isAuthenticated, INACTIVITY_TIMEOUT, WARNING_TIME]);

  // Periodic server-side session check (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const sessionCheckInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/dj-verify');
        if (!res.ok) {
          alert('Your session has expired. Please log in again.');
          handleLogout();
        }
      } catch {
        // Network error — don't force logout
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(sessionCheckInterval);
  }, [isAuthenticated]);

  const fetchReviews = async (username: string) => {
    setLoadingReviews(true);
    try {
      console.log('=== Fetching Reviews ===');
      console.log('Querying for DJ username:', username);
      
      const response = await fetch(`/api/reviews?dj_username=${encodeURIComponent(username)}&status=approved`);
      const data = await response.json();
      
      console.log('Reviews API response:', data);
      console.log('Reviews count:', data.data?.length || 0);
      
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
      console.log('=== Fetching Bookings ===');
      console.log('Requesting for username:', username);
      const url = `/api/bookings?dj_user=${encodeURIComponent(username)}`;
      console.log('API URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('API Response:', data);
      console.log('Response type:', typeof data);
      console.log('Is array?:', Array.isArray(data));
      console.log('data.success:', data.success);
      console.log('data.data:', data.data);
      console.log('data.data type:', typeof data.data);
      console.log('data.data is array?:', Array.isArray(data.data));
      console.log('Bookings count:', data.data?.length || 0);
      
      // Robust parsing with multiple fallbacks
      if (data.success && data.data && Array.isArray(data.data)) {
        console.log('✅ Setting bookings from data.data:', data.data.length, 'items');
        setBookings(data.data);
      } else if (Array.isArray(data)) {
        // Fallback: if response is directly an array
        console.log('✅ Setting bookings directly from array:', data.length, 'items');
        setBookings(data);
      } else if (data.data && Array.isArray(data.data)) {
        // Fallback: if there's a data property but success is missing/false
        console.log('✅ Setting bookings from data.data (no success flag):', data.data.length, 'items');
        setBookings(data.data);
      } else {
        console.log('❌ Could not parse bookings from response');
        setBookings([]);
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
        // Get all blocked dates for this DJ
        const djBlockedDates = (data.data || []).filter(
          (bd: BlockedDate) => bd.djUser === username
        );
        setBlockedDates(djBlockedDates);
        
        console.log(`=== Blocked Dates for ${username} ===`);
        console.log('Total requests:', djBlockedDates.length);
        console.log('Pending:', djBlockedDates.filter((bd: BlockedDate) => bd.status === 'pending').length);
        console.log('Approved:', djBlockedDates.filter((bd: BlockedDate) => bd.status === 'approved').length);
        console.log('Rejected:', djBlockedDates.filter((bd: BlockedDate) => bd.status === 'rejected').length);
      }
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    } finally {
      setLoadingBlockedDates(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/dj-logout', { method: 'POST' });
    } catch {
      // Continue with redirect even if API call fails
    }
    localStorage.removeItem('dj_display_name');
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
          djUser: djDisplayName,
          date: newBlockedDate,
          reason: newBlockedReason || 'Unavailable'
        })
      });

      if (response.ok) {
        setNewBlockedDate('');
        setNewBlockedReason('');
        fetchBlockedDates(djDisplayName);
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
        fetchBlockedDates(djDisplayName);
      }
    } catch (error) {
      console.error('Error deleting blocked date:', error);
    }
  };

  // Toggle notes visibility
  const toggleBookingNotes = (bookingId: number) => {
    setExpandedNoteId(expandedNoteId === bookingId ? null : bookingId);
  };

  // Print booking notes as PDF
  const printBookingNotesAsPDF = (booking: Booking) => {
    const clientName = booking.clientName || 'N/A';
    let date = 'No date';
    try {
      date = booking.date ? parseLocalDate(booking.date).toLocaleDateString() : 'No date';
    } catch (error) {
      console.error('Error formatting date for PDF:', error);
    }
    const eventType = booking.eventType || 'Event';
    const notes = booking.notes || '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>${eventType} - Event Details</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              h2 { color: #555; margin-top: 20px; }
              p { margin-bottom: 10px; }
              pre { background-color: #f4f4f4; padding: 15px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', monospace; }
          </style>
      </head>
      <body>
          <h1>Event Details: ${eventType}</h1>
          <p><strong>Client:</strong> ${clientName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${booking.time || 'Not specified'}</p>
          <p><strong>Location:</strong> ${booking.location || 'Not specified'}</p>
          <p><strong>Payout:</strong> $${(Number(booking.payout) || 0).toFixed(2)}</p>
          <h2>Event Details & Notes:</h2>
          <pre>${notes}</pre>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Calculate stats with defensive checks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter and sort with null checks to prevent runtime errors
  const upcomingBookings = bookings.filter(b => {
    try {
      return b && b.date && new Date(b.date) >= today;
    } catch (error) {
      console.error('Error filtering booking:', b, error);
      return false;
    }
  });
  
  const nextBooking = upcomingBookings.length > 0 
    ? upcomingBookings.sort((a, b) => {
        try {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } catch (error) {
          console.error('Error sorting bookings:', error);
          return 0;
        }
      })[0]
    : null;
  
  const totalRevenue = Array.isArray(upcomingBookings) 
    ? upcomingBookings.reduce((sum, b) => sum + (Number(b.totalRevenue) || 0), 0) 
    : 0;

  // Filter bookings for projects section with defensive checks
  const getFilteredBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filtered = [...bookings];
    
    if (projectFilter === 'upcoming') {
      // Filter: Only future dates AND not completed status
      filtered = filtered.filter(b => {
        try {
          if (!b || !b.date) return false;
          const bookingDate = new Date(b.date);
          const isUpcoming = bookingDate >= today;
          const isNotCompleted = b.status !== 'completed';
          return isUpcoming && isNotCompleted;
        } catch (error) {
          console.error('Error filtering upcoming booking:', b, error);
          return false;
        }
      });
      
      // Sort: Earliest date first (ascending order) - DJ sees next project first
      return filtered.sort((a, b) => {
        try {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } catch (error) {
          console.error('Error sorting upcoming bookings:', error);
          return 0;
        }
      });
    } else if (projectFilter === 'past') {
      // Filter: Past dates OR completed status
      filtered = filtered.filter(b => {
        try {
          if (!b || !b.date) return false;
          const bookingDate = new Date(b.date);
          const isPast = bookingDate < today;
          const isCompleted = b.status === 'completed';
          return isPast || isCompleted;
        } catch (error) {
          console.error('Error filtering past booking:', b, error);
          return false;
        }
      });
      
      // Sort: Most recent first (descending order)
      return filtered.sort((a, b) => {
        try {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } catch (error) {
          console.error('Error sorting past bookings:', error);
          return 0;
        }
      });
    }
    
    // All: Show all bookings sorted by date (upcoming first)
    return filtered.filter(b => b && b.date).sort((a, b) => {
      try {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } catch (error) {
        console.error('Error sorting all bookings:', error);
        return 0;
      }
    });
  };

  // Handle Next Booking click - navigate to project details
  const handleNextBookingClick = () => {
    if (!nextBooking) return;
    
    // Switch to projects section
    setActiveSection('projects');
    
    // Wait for section to render, then scroll to the specific project
    setTimeout(() => {
      const projectElement = document.getElementById(`booking-${nextBooking.id}`);
      if (projectElement) {
        projectElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add brief highlight animation
        projectElement.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.5)';
        setTimeout(() => {
          projectElement.style.boxShadow = '';
        }, 2000);
      }
    }, 100);
  };

  // Handle navigation click - closes mobile menu after navigating
  const handleNavClick = (section: Section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
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
    try {
      const dateStr = formatDateLocal(date);
      return bookings.filter(b => b && b.date && b.date.startsWith(dateStr));
    } catch (error) {
      console.error('Error getting bookings for date:', date, error);
      return [];
    }
  };

  const getBlockedDateForDate = (date: Date) => {
    try {
      const dateStr = formatDateLocal(date);
      // Only show approved blocked dates on calendar
      return blockedDates.find(bd => bd && bd.date && bd.date.startsWith(dateStr) && bd.status === 'approved');
    } catch (error) {
      console.error('Error getting blocked date for date:', date, error);
      return undefined;
    }
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
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  if (isCheckingAuth || !isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255,107,53,0.2)',
          borderTopColor: '#ff6b35',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1.5rem'
        }} />
        <p style={{ fontSize: '1.25rem', fontWeight: '500' }}>
          {isCheckingAuth ? 'Verifying credentials...' : 'Redirecting to login...'}
        </p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Inactivity Warning Modal
  const InactivityWarning = () => {
    if (!showInactivityWarning) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#1a1a1a', marginBottom: '1rem' }}>Inactivity Detected</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            You will be logged out in <strong style={{ color: '#ff6b35', fontSize: '1.5rem' }}>{secondsUntilLogout}</strong> seconds due to inactivity.
          </p>
          <button
            onClick={() => {
              setShowInactivityWarning(false);
              localStorage.setItem('dj_last_activity', Date.now().toString());
            }}
            style={{
              background: '#ff6b35',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e55a2b'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#ff6b35'}
          >
            I&apos;m Still Here
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <InactivityWarning />
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
              onClick={() => handleNavClick('dashboard')}
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
              onClick={() => handleNavClick('dashboard')} 
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
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'none',
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                lineHeight: 1
              }}
              className="sidebar-close-btn"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Navigation Group */}
        <div className="sidebar-nav-group">
          <div className="nav-group-title">Dashboard</div>
          <a 
            className={`sidebar-nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a 
            className={`sidebar-nav-link ${activeSection === 'projects' ? 'active' : ''}`}
            onClick={() => handleNavClick('projects')}
          >
            <span className="nav-icon">📅</span>
            <span>Projects</span>
          </a>
          <a 
            className={`sidebar-nav-link ${activeSection === 'reviews' ? 'active' : ''}`}
            onClick={() => handleNavClick('reviews')}
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
            style={{
              display: 'none',
              fontSize: '1.75rem',
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#333',
              lineHeight: 1
            }}
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
                <div 
                  style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    cursor: nextBooking ? 'pointer' : 'default',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                  onClick={nextBooking ? handleNextBookingClick : undefined}
                  onMouseEnter={(e) => {
                    if (nextBooking) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (nextBooking) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📅</div>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: '600', 
                    color: '#666',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Next Booking
                  </div>
                  {loadingBookings ? (
                    <div style={{ fontSize: '1rem', color: '#999' }}>Loading...</div>
                  ) : nextBooking ? (
                    <>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: '#ff6b35' 
                      }}>
                        {(() => {
                          try {
                            return parseLocalDate(nextBooking.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            });
                          } catch (error) {
                            console.error('Error formatting next booking date:', error);
                            return 'Invalid date';
                          }
                        })()}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#999', 
                        marginTop: '0.5rem' 
                      }}>
                        Click to view details →
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '1rem', color: '#999' }}>
                      No upcoming bookings
                    </div>
                  )}
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📅 Total Bookings</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a' }}>
                    {loadingBookings ? '...' : upcomingBookings.length}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>💰 Total Revenue</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a' }}>
                    {loadingBookings ? '...' : `$${(Number(totalRevenue) || 0).toFixed(2)}`}
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
                          <div style={{ fontSize: '0.7rem', color: '#c62828', marginTop: '0.25rem', fontWeight: 'bold' }}>
                            {blockedDate.djUser} Not Available
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
                        borderRadius: '6px',
                        border: `2px solid ${
                          bd.status === 'pending' ? '#FFA500' : 
                          bd.status === 'approved' ? '#4CAF50' : '#DC3545'
                        }`
                      }}>
                        <div style={{ flex: 1 }}>
                          {/* Status Badge */}
                          <div style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            background: bd.status === 'pending' ? '#FFF3CD' :
                                       bd.status === 'approved' ? '#D4EDDA' : '#F8D7DA',
                            color: bd.status === 'pending' ? '#856404' :
                                   bd.status === 'approved' ? '#155724' : '#721C24'
                          }}>
                            {bd.status === 'pending' ? '⏳ PENDING' : 
                             bd.status === 'approved' ? '✓ APPROVED' : '✗ REJECTED'}
                          </div>
                          
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {(() => {
                              try {
                                return bd.date ? parseLocalDate(bd.date).toLocaleDateString() : 'No date';
                              } catch (error) {
                                console.error('Error formatting blocked date:', error);
                                return 'Invalid date';
                              }
                            })()}
                          </div>
                          {bd.reason && <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>{bd.reason}</div>}
                          
                          {bd.status === 'pending' && (
                            <div style={{ color: '#856404', fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                              Waiting for admin approval
                            </div>
                          )}
                          {bd.status === 'rejected' && (
                            <div style={{ color: '#721C24', fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                              This request was rejected by admin
                            </div>
                          )}
                        </div>
                        
                        {/* Only show remove button for pending requests */}
                        {bd.status === 'pending' && (
                          <button
                            onClick={() => handleDeleteBlockedDate(bd.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              marginLeft: '1rem'
                            }}
                          >
                            Cancel
                          </button>
                        )}
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
                  {getFilteredBookings().map(booking => {
                    let isUpcoming = false;
                    try {
                      isUpcoming = !!(booking && booking.date && new Date(booking.date) >= today);
                    } catch (error) {
                      console.error('Error checking if booking is upcoming:', booking, error);
                    }
                    const isExpanded = expandedNoteId === booking.id;
                    return (
                      <div 
                        key={booking.id}
                        id={`booking-${booking.id}`}
                        style={{
                          background: 'white',
                          border: '2px solid #e0e0e0',
                          borderLeft: `4px solid ${isUpcoming ? '#28a745' : '#666'}`,
                          borderRadius: '10px',
                          padding: '1.5rem',
                          transition: 'all 0.3s ease',
                          opacity: isUpcoming ? 1 : 0.7
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
                        }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        {/* Booking Header */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'start', 
                          marginBottom: '1rem' 
                        }}>
                          <div>
                            <div style={{ 
                              fontSize: '1.2rem', 
                              fontWeight: '600', 
                              color: '#333',
                              marginBottom: '0.25rem'
                            }}>
                              {booking.clientName || 'No client name'}
                            </div>
                            <div style={{ color: '#666', fontSize: '0.95rem' }}>
                              {(() => {
                                try {
                                  return booking.date ? parseLocalDate(booking.date).toLocaleDateString() : 'No date';
                                } catch (error) {
                                  console.error('Error formatting booking date:', error);
                                  return 'Invalid date';
                                }
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Booking Details Grid */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(2, 1fr)', 
                          gap: '0.75rem',
                          marginBottom: '0.5rem'
                        }}>
                          <div>
                            <span style={{ 
                              display: 'block',
                              color: '#888', 
                              fontSize: '0.85rem',
                              marginBottom: '0.25rem'
                            }}>
                              Event Type
                            </span>
                            <span style={{ 
                              display: 'block',
                              color: '#333', 
                              fontSize: '0.95rem',
                              fontWeight: '500'
                            }}>
                              {booking.eventType}
                            </span>
                          </div>
                          <div>
                            <span style={{ 
                              display: 'block',
                              color: '#888', 
                              fontSize: '0.85rem',
                              marginBottom: '0.25rem'
                            }}>
                              Time
                            </span>
                            <span style={{ 
                              display: 'block',
                              color: '#333', 
                              fontSize: '0.95rem',
                              fontWeight: '500'
                            }}>
                              {booking.time || 'Not specified'}
                            </span>
                          </div>
                          <div>
                            <span style={{ 
                              display: 'block',
                              color: '#888', 
                              fontSize: '0.85rem',
                              marginBottom: '0.25rem'
                            }}>
                              Location
                            </span>
                            <span style={{ 
                              display: 'block',
                              color: '#333', 
                              fontSize: '0.95rem',
                              fontWeight: '500'
                            }}>
                              {booking.location || 'Not specified'}
                            </span>
                          </div>
                          {booking.payout && (
                            <div>
                              <span style={{ 
                                display: 'block',
                                color: '#888', 
                                fontSize: '0.85rem',
                                marginBottom: '0.25rem'
                              }}>
                                Payout
                              </span>
                              <span style={{ 
                                display: 'block',
                                color: '#28a745', 
                                fontSize: '0.95rem',
                                fontWeight: 'bold'
                              }}>
                                ${(Number(booking.payout) || 0).toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div style={{ gridColumn: booking.payout ? 'auto' : '1 / -1' }}>
                            <span style={{ 
                              display: 'block',
                              color: '#888', 
                              fontSize: '0.85rem',
                              marginBottom: '0.25rem'
                            }}>
                              Contact
                            </span>
                            <span style={{ 
                              display: 'block',
                              color: '#333', 
                              fontSize: '0.95rem',
                              fontWeight: '500'
                            }}>
                              {booking.contactEmail || 'No email'}
                              <br />
                              {booking.contactPhone || 'No phone'}
                            </span>
                          </div>
                        </div>

                        {/* Notes Section */}
                        {booking.notes && (
                          <div style={{ 
                            marginTop: '1rem', 
                            paddingTop: '1rem', 
                            borderTop: '1px solid #e0e0e0' 
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              gap: '1rem', 
                              alignItems: 'center', 
                              flexWrap: 'wrap' 
                            }}>
                              <button
                                onClick={() => toggleBookingNotes(booking.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ff6b35',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  fontSize: '1rem',
                                  padding: 0,
                                  textDecoration: 'underline',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}
                              >
                                <span style={{ 
                                  transition: 'transform 0.2s',
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}>
                                  ▼
                                </span>
                                <span>View Event Details & Notes</span>
                              </button>
                              <button
                                onClick={() => printBookingNotesAsPDF(booking)}
                                style={{
                                  background: '#17a2b8',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  padding: '0.5rem 1rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontWeight: '500'
                                }}
                              >
                                📄 PDF
                              </button>
                            </div>
                            {isExpanded && (
                              <div style={{ 
                                marginTop: '0.75rem',
                                whiteSpace: 'pre-wrap',
                                fontFamily: "'Courier New', monospace",
                                background: '#f8f8f8',
                                padding: '1rem',
                                borderRadius: '5px',
                                lineHeight: '1.6',
                                color: '#333',
                                fontSize: '0.95rem'
                              }}>
                                {booking.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                          {(() => {
                            try {
                              return review.created_at ? new Date(review.created_at).toLocaleDateString() : 'No date';
                            } catch (error) {
                              console.error('Error formatting review date:', error);
                              return 'Invalid date';
                            }
                          })()}
                        </div>
                      </div>
                      <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '1rem' }}>
                        {review.comment}
                      </p>
                      {review.event_name && (
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          Event: {review.event_name}
                          {review.event_date && ` • ${(() => {
                            try {
                              return new Date(review.event_date).toLocaleDateString();
                            } catch (error) {
                              console.error('Error formatting event date:', error);
                              return 'Invalid date';
                            }
                          })()}`}
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
                    <div style={{ fontWeight: '500' }}>
                      {(() => {
                        try {
                          return selectedBooking.date ? parseLocalDate(selectedBooking.date).toLocaleDateString() : 'No date';
                        } catch (error) {
                          console.error('Error formatting modal date:', error);
                          return 'Invalid date';
                        }
                      })()}
                    </div>
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
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${(Number(selectedBooking.totalRevenue) || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>CC Payment</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${(Number(selectedBooking.ccPayment) || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Your Payout</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2e7d32' }}>${(Number(selectedBooking.payout) || 0).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  marginTop: '2rem' 
                }}>
                  <button
                    onClick={() => printBookingNotesAsPDF(selectedBooking)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>📄</span>
                    <span>Print Notes</span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedBooking(null)}
                    style={{
                      flex: 1,
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
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
