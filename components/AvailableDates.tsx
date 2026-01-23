'use client';

import { useState, useEffect } from 'react';

export default function AvailableDates() {
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [bookingDates, setBookingDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAvailableDates();
  }, []);

  const loadAvailableDates = async () => {
    try {
      const [blockedRes, bookingsRes] = await Promise.all([
        fetch('/api/blocked-dates').catch(() => null),
        fetch('/api/bookings').catch(() => null)
      ]);

      const blockedSet = new Set<string>();
      const bookingsSet = new Set<string>();

      if (blockedRes?.ok) {
        const data = await blockedRes.json();
        // Handle both {success, data} format and direct array format
        const blockedArray = Array.isArray(data) ? data : (data.success && data.data ? data.data : []);
        
        blockedArray.forEach((bd: any) => {
          if (bd.status === 'approved' && bd.date) {
            const djUser = (bd.djUser || '').trim().toLowerCase();
            const normalized = djUser.replace(/[:]+/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');
            if (normalized === 'dj-admin' || normalized === 'admin') {
              let dateStr = bd.date;
              if (dateStr.includes('T')) {
                dateStr = dateStr.split('T')[0];
              }
              if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                blockedSet.add(dateStr);
                console.log(`[AvailableDates] Added blocked date: ${dateStr}`);
              }
            }
          }
        });
        
        console.log(`[AvailableDates] Total blocked dates loaded: ${blockedSet.size}`);
      }

      if (bookingsRes?.ok) {
        const data = await bookingsRes.json();
        // Handle both {success, data} format and direct array format
        const bookingsArray = Array.isArray(data) ? data : (data.success && data.data ? data.data : []);
        
        bookingsArray.forEach((booking: any) => {
          if (booking.date) {
            // Normalize date string
            let dateStr = booking.date;
            if (dateStr.includes('T')) {
              dateStr = dateStr.split('T')[0];
            }
            // Ensure YYYY-MM-DD format before adding
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              bookingsSet.add(dateStr);
              console.log(`[AvailableDates] Added booking date: ${dateStr}`);
            }
          }
        });
        
        console.log(`[AvailableDates] Total booking dates loaded: ${bookingsSet.size}`);
      }

      setBlockedDates(blockedSet);
      setBookingDates(bookingsSet);
    } catch (error) {
      console.error('Error loading dates:', error);
    }
  };

  const generateCalendar = (monthOffset = 0) => {
    const newDate = new Date(calendarYear, calendarMonth + monthOffset, 1);
    setCalendarMonth(newDate.getMonth());
    setCalendarYear(newDate.getFullYear());
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  return (
    <section id="available-dates" className="available-dates-section">
      <div className="container">
        <h2 className="section-title">Available Dates</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '2rem' }}>
          Check our availability for upcoming bookings. Dates with scheduled events are shown as unavailable.
        </p>
        <div id="dates-calendar-container" className="dates-calendar-wrapper">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <button
              onClick={() => generateCalendar(-1)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e55a2b'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ff6b35'}
            >
              ← Previous
            </button>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.75rem', 
              fontWeight: 'bold',
              color: '#1a1a1a'
            }}>
              {monthNames[calendarMonth]} {calendarYear}
            </h3>
            <button
              onClick={() => generateCalendar(1)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e55a2b'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ff6b35'}
            >
              Next →
            </button>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <button
              onClick={() => generateCalendar(0)}
              style={{
                padding: '0.5rem 1.25rem',
                background: '#2d2d2d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#2d2d2d'}
            >
              📅 Today
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4 text-sm">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold p-2 bg-bg-light text-text-dark">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 border border-[#e0e0e0] rounded-md text-center min-h-[50px] opacity-30 bg-bg-light"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dateObj = new Date(calendarYear, calendarMonth, day);
              dateObj.setHours(0, 0, 0, 0);
              
              const isToday = dateObj.getTime() === today.getTime();
              const isBlocked = blockedDates.has(dateStr);
              const hasBooking = bookingDates.has(dateStr);
              const isUnavailable = isBlocked || hasBooking;
              const isPast = dateObj < today;
              
              // Log unavailable dates for debugging
              if (isUnavailable && !isPast) {
                console.log(`[AvailableDates] Date ${dateStr} is unavailable - Blocked: ${isBlocked}, Booking: ${hasBooking}`);
              }

              return (
                <div 
                  key={day} 
                  className="p-2 rounded-md text-center min-h-[50px] flex flex-col items-center justify-center transition-all font-semibold"
                  style={{
                    background: isUnavailable ? '#ffebee' : '#e8f5e9',
                    border: isUnavailable ? '2px solid #f44336' : '2px solid #4caf50',
                    color: isUnavailable ? '#c62828' : '#2e7d32',
                    opacity: isPast ? 0.5 : 1,
                    cursor: isUnavailable ? 'not-allowed' : 'default',
                    fontWeight: isToday ? 'bold' : 'semibold',
                    boxShadow: isToday ? '0 0 0 3px rgba(255,107,53,0.4)' : 'none'
                  }}
                  title={isUnavailable ? 'Unavailable' : 'Available'}
                >
                  {day}
                  {isUnavailable && (
                    <span style={{ fontSize: '0.65rem', marginTop: '2px' }}>🔴</span>
                  )}
                  {!isUnavailable && !isPast && (
                    <span style={{ fontSize: '0.65rem', marginTop: '2px' }}>✅</span>
                  )}
                </div>
              );
            })}
            {Array.from({ length: 42 - firstDay - daysInMonth }).map((_, i) => (
              <div key={`next-${i}`} className="p-2 border border-[#e0e0e0] rounded-md text-center min-h-[50px] opacity-30 bg-bg-light"></div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-8 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded" style={{ background: '#e8f5e9', border: '2px solid #4caf50' }}></div>
              <span>✅ Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded" style={{ background: '#ffebee', border: '2px solid #f44336' }}></div>
              <span>🔴 Unavailable (Booked/Blocked)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

