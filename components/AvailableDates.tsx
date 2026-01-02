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
        if (data.success && data.data) {
          data.data.forEach((bd: any) => {
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
                }
              }
            }
          });
        }
      }

      if (bookingsRes?.ok) {
        const data = await bookingsRes.json();
        if (data.success && data.data) {
          data.data.forEach((booking: any) => {
            if (booking.date) {
              let dateStr = booking.date;
              if (dateStr.includes('T')) {
                dateStr = dateStr.split('T')[0];
              }
              bookingsSet.add(dateStr);
            }
          });
        }
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
    <section id="available-dates" className="py-16 bg-bg-light">
      <div className="max-w-[1200px] mx-auto px-8">
        <h2 className="text-center text-4xl mb-12 text-primary">Available Dates</h2>
        <p className="text-center text-text-light mb-8">
          Check our availability for upcoming bookings. Dates with scheduled events are shown as unavailable.
        </p>
        <div className="bg-white rounded-lg p-8 shadow-[0_5px_15px_rgba(0,0,0,0.1)] max-w-[900px] mx-auto">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
            <button
              onClick={() => generateCalendar(-1)}
              className="px-4 py-2 bg-accent text-white border-none rounded-md cursor-pointer font-bold text-base transition-colors hover:bg-primary"
            >
              ← Previous
            </button>
            <h3 className="m-0 text-2xl text-primary">{monthNames[calendarMonth]} {calendarYear}</h3>
            <button
              onClick={() => generateCalendar(1)}
              className="px-4 py-2 bg-accent text-white border-none rounded-md cursor-pointer font-bold text-base transition-colors hover:bg-primary"
            >
              Next →
            </button>
          </div>
          <div className="text-center mb-4">
            <button
              onClick={() => generateCalendar(0)}
              className="px-4 py-2 bg-text-light text-white border-none rounded-md cursor-pointer text-sm"
            >
              Today
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

              let dayClass = 'p-2 border border-[#e0e0e0] rounded-md text-center min-h-[50px] flex flex-col items-center justify-center transition-all';
              
              if (isToday) {
                dayClass += ' bg-accent text-white font-bold';
              } else if (isUnavailable) {
                dayClass += ' bg-primary border-black text-white font-bold opacity-70';
              }

              return (
                <div key={day} className={dayClass}>
                  {day}
                </div>
              );
            })}
            {Array.from({ length: 42 - firstDay - daysInMonth }).map((_, i) => (
              <div key={`next-${i}`} className="p-2 border border-[#e0e0e0] rounded-md text-center min-h-[50px] opacity-30 bg-bg-light"></div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-8 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-[#ccc] bg-primary border-black"></div>
              <span>Unavailable (Events/Blocked Dates)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-[#ccc] bg-accent"></div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

