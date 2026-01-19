'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('djs');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Prevent body scroll when dashboard is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Navigation - Modern Design */}
      <nav className={`sidebar sidebar-modern ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo Area */}
        <div style={{ padding: '2rem 1.5rem', background: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); switchTab('djs'); }} 
            style={{ display: 'block', cursor: 'pointer' }}
          >
            <Image
              src="/EYP Logo_New.png"
              alt="EYP Logo"
              width={240}
              height={80}
              style={{ height: 'auto', width: '100%', maxWidth: '240px', margin: '0 auto', display: 'block' }}
              priority
            />
          </a>
        </div>
        
        {/* Navigation Groups */}
        <div className="sidebar-nav-group">
          <div className="nav-group-title">Dashboard</div>
          <a 
            className={`sidebar-nav-link ${activeTab === 'djs' ? 'active' : ''}`}
            onClick={() => switchTab('djs')}
          >
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </a>
          <a 
            className={`sidebar-nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => switchTab('analytics')}
          >
            <span className="nav-icon">📊</span>
            <span>Analytics</span>
          </a>
        </div>

        <div className="sidebar-nav-group">
          <div className="nav-group-title">Management</div>
          <a 
            className={`sidebar-nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => switchTab('bookings')}
          >
            <span className="nav-icon">📋</span>
            <span>Projects</span>
          </a>
          <a 
            className={`sidebar-nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => switchTab('users')}
          >
            <span className="nav-icon">👥</span>
            <span>Users</span>
          </a>
          <a 
            className={`sidebar-nav-link ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => switchTab('calendar')}
          >
            <span className="nav-icon">📅</span>
            <span>Calendar</span>
          </a>
          <a 
            className={`sidebar-nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => switchTab('reviews')}
          >
            <span className="nav-icon">⭐</span>
            <span>Reviews</span>
          </a>
        </div>

        {/* User Profile at Bottom */}
        <div className="sidebar-user-profile">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <div className="user-name">Admin</div>
            <div className="user-role">Super Admin</div>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={closeSidebar}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <div className="dashboard-header-modern">
          <button 
            className="mobile-menu-btn" 
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <div>
            <h1>Welcome back, Admin</h1>
            <p className="subtitle">Here's what's happening today.</p>
          </div>
          <div className="header-actions">
            <div style={{ textAlign: 'right', marginRight: '1rem' }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Administrator</div>
              <div id="admin-name" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Admin</div>
            </div>
            {/* Mobile Hamburger Menu */}
            <div className="mobile-hamburger-menu">
              <button 
                className="hamburger-btn" 
                onClick={() => {
                  const dropdown = document.getElementById('hamburger-menu-dropdown');
                  const btn = document.querySelector('.hamburger-btn');
                  if (dropdown && btn) {
                    dropdown.classList.toggle('show');
                    btn.classList.toggle('active');
                  }
                }}
                aria-label="Toggle menu"
                type="button"
              >
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>☰</span>
              </button>
              <div className="hamburger-menu-dropdown" id="hamburger-menu-dropdown">
                <a 
                  className={`hamburger-menu-item ${activeTab === 'djs' ? 'active' : ''}`}
                  onClick={() => {
                    switchTab('djs');
                    const dropdown = document.getElementById('hamburger-menu-dropdown');
                    const btn = document.querySelector('.hamburger-btn');
                    if (dropdown && btn) {
                      dropdown.classList.remove('show');
                      btn.classList.remove('active');
                    }
                  }}
                  id="hamburger-nav-djs"
                >
                  <span>
                    <span className="hamburger-menu-icon">🏠</span>
                    <span>Home</span>
                  </span>
                </a>
                <a 
                  className={`hamburger-menu-item ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => {
                    switchTab('bookings');
                    const dropdown = document.getElementById('hamburger-menu-dropdown');
                    const btn = document.querySelector('.hamburger-btn');
                    if (dropdown && btn) {
                      dropdown.classList.remove('show');
                      btn.classList.remove('active');
                    }
                  }}
                  id="hamburger-nav-bookings"
                >
                  <span>
                    <span className="hamburger-menu-icon">📋</span>
                    <span>Projects</span>
                  </span>
                </a>
                <a 
                  className={`hamburger-menu-item ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => {
                    switchTab('users');
                    const dropdown = document.getElementById('hamburger-menu-dropdown');
                    const btn = document.querySelector('.hamburger-btn');
                    if (dropdown && btn) {
                      dropdown.classList.remove('show');
                      btn.classList.remove('active');
                    }
                  }}
                  id="hamburger-nav-users"
                >
                  <span>
                    <span className="hamburger-menu-icon">👥</span>
                    <span>Users</span>
                  </span>
                </a>
                <a 
                  className={`hamburger-menu-item ${activeTab === 'calendar' ? 'active' : ''}`}
                  onClick={() => {
                    switchTab('calendar');
                    const dropdown = document.getElementById('hamburger-menu-dropdown');
                    const btn = document.querySelector('.hamburger-btn');
                    if (dropdown && btn) {
                      dropdown.classList.remove('show');
                      btn.classList.remove('active');
                    }
                  }}
                  id="hamburger-nav-calendar"
                >
                  <span>
                    <span className="hamburger-menu-icon">📅</span>
                    <span>Calendar</span>
                  </span>
                </a>
                <a 
                  className={`hamburger-menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => {
                    switchTab('analytics');
                    const dropdown = document.getElementById('hamburger-menu-dropdown');
                    const btn = document.querySelector('.hamburger-btn');
                    if (dropdown && btn) {
                      dropdown.classList.remove('show');
                      btn.classList.remove('active');
                    }
                  }}
                  id="hamburger-nav-analytics"
                >
                  <span>
                    <span className="hamburger-menu-icon">📊</span>
                    <span>Analytics</span>
                  </span>
                </a>
                <a 
                  className={`hamburger-menu-item ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => {
                    switchTab('reviews');
                    const dropdown = document.getElementById('hamburger-menu-dropdown');
                    const btn = document.querySelector('.hamburger-btn');
                    if (dropdown && btn) {
                      dropdown.classList.remove('show');
                      btn.classList.remove('active');
                    }
                  }}
                  id="hamburger-nav-reviews"
                >
                  <span>
                    <span className="hamburger-menu-icon">⭐</span>
                    <span>Reviews</span>
                  </span>
                </a>
              </div>
            </div>
            <button className="logout-btn" onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                window.location.href = '/admin-login';
              }
            }}>
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-container">
          {/* Loading Indicator */}
          <div id="loading-indicator" style={{ display: 'none', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 10000, textAlign: 'center', minWidth: '200px', maxWidth: '90%' }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--primary-color)', marginBottom: '1rem', fontWeight: 500 }}>Loading dashboard...</div>
            <div style={{ width: '40px', height: '40px', border: '4px solid var(--bg-light)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '1rem' }}>Please wait...</div>
          </div>
          
          {/* DJs Tab */}
          <div id="djs-tab" className={`tab-content ${activeTab === 'djs' ? 'active' : ''}`}>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>
                    <span className="stat-icon">📅</span>
                    Total Projects
                  </h3>
                  <span className="stat-info-icon" title="Click to view all projects">ℹ️</span>
                </div>
                <div className="stat-value" id="total-projects">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>
                    <span className="stat-icon">✅</span>
                    Completed
                  </h3>
                  <span className="stat-info-icon" title="Click to filter completed projects">ℹ️</span>
                </div>
                <div className="stat-value" id="completed-projects">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>
                    <span className="stat-icon">⏳</span>
                    Future Bookings
                  </h3>
                  <span className="stat-info-icon" title="Click to filter future bookings">ℹ️</span>
                </div>
                <div className="stat-value" id="future-bookings-projects">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>
                    <span className="stat-icon">💰</span>
                    DJ Revenue
                  </h3>
                  <span className="stat-info-icon" title="Click to view revenue details">ℹ️</span>
                </div>
                <div className="stat-value" id="dj-revenue">$0.00</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>
                    <span className="stat-icon">💵</span>
                    Total Revenue
                  </h3>
                  <span className="stat-info-icon" title="Click to view total revenue details">ℹ️</span>
                </div>
                <div className="stat-value" id="total-revenue">$0.00</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>
                    <span className="stat-icon">🚫</span>
                    Blocked Dates
                  </h3>
                  <span className="stat-info-icon" title="Click to view all blocked dates">ℹ️</span>
                </div>
                <div className="stat-value" id="blocked-dates-count">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>
                    <span className="stat-icon">💰</span>
                    2025 Revenue
                  </h3>
                  <span className="stat-info-icon" title="Click to view 2025 revenue details">ℹ️</span>
                </div>
                <div className="stat-value" id="revenue-2025">$0.00</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>
                    <span className="stat-icon">💰</span>
                    2026 Revenue
                  </h3>
                  <span className="stat-info-icon" title="Click to view 2026 revenue details">ℹ️</span>
                </div>
                <div className="stat-value" id="revenue-2026">$0.00</div>
              </div>
            </div>
            <div className="section-card">
              <h2>All DJs Overview</h2>
              <div id="djs-container" className="dj-list">
                {/* DJs will be populated here */}
              </div>
            </div>

            {/* Two-Column Content Layout */}
            <div className="content-grid-modern">
              {/* Left Column - Recent Orders */}
              <div className="content-section">
                <div className="section-header">
                  <h2>Recent Projects</h2>
                  <a href="#" onClick={(e) => { e.preventDefault(); switchTab('bookings'); }} className="view-all-link">View all</a>
                </div>
                <div className="orders-list-modern">
                  <div className="order-item">
                    <div className="order-info">
                      <div className="order-number">#PRJ-2026-001</div>
                      <div className="order-email">client@example.com</div>
                    </div>
                    <div className="order-price">$2,500.00</div>
                    <span className="status-badge delivered">completed</span>
                  </div>
                  <div className="order-item">
                    <div className="order-info">
                      <div className="order-number">#PRJ-2026-002</div>
                      <div className="order-email">event@company.com</div>
                    </div>
                    <div className="order-price">$3,200.00</div>
                    <span className="status-badge pending">pending</span>
                  </div>
                  <div className="order-item">
                    <div className="order-info">
                      <div className="order-number">#PRJ-2026-003</div>
                      <div className="order-email">booking@venue.com</div>
                    </div>
                    <div className="order-price">$1,800.00</div>
                    <span className="status-badge cancelled">cancelled</span>
                  </div>
                  <div className="order-item">
                    <div className="order-info">
                      <div className="order-number">#PRJ-2026-004</div>
                      <div className="order-email">contact@business.com</div>
                    </div>
                    <div className="order-price">$4,500.00</div>
                    <span className="status-badge delivered">completed</span>
                  </div>
                  <div className="order-item">
                    <div className="order-info">
                      <div className="order-number">#PRJ-2026-005</div>
                      <div className="order-email">info@organization.com</div>
                    </div>
                    <div className="order-price">$2,100.00</div>
                    <span className="status-badge pending">pending</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Recent Activity */}
              <div className="content-section">
                <div className="section-header">
                  <h2>Recent Activity</h2>
                  <a href="#" className="view-all-link">View all</a>
                </div>
                <div className="activity-feed">
                  <div className="activity-item">
                    <div className="activity-icon">📝</div>
                    <div className="activity-content">
                      <div className="activity-text">Admin updated project #PRJ-2026-005</div>
                      <div className="activity-time">Jan 18, 11:40 PM</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">✅</div>
                    <div className="activity-content">
                      <div className="activity-text">Admin status_change project #PRJ-2026-004</div>
                      <div className="activity-time">Jan 18, 11:35 PM</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">📅</div>
                    <div className="activity-content">
                      <div className="activity-text">Admin added new booking for Feb 15, 2026</div>
                      <div className="activity-time">Jan 18, 10:20 PM</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">💰</div>
                    <div className="activity-content">
                      <div className="activity-text">Payment received for #PRJ-2026-001</div>
                      <div className="activity-time">Jan 18, 9:15 PM</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">👤</div>
                    <div className="activity-content">
                      <div className="activity-text">New client registered</div>
                      <div className="activity-time">Jan 18, 8:05 PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Banner */}
            <div className="alert-banner">
              <span className="alert-icon">⚠️</span>
              <span className="alert-text">3 pending projects awaiting processing</span>
              <a href="#" onClick={(e) => { e.preventDefault(); switchTab('bookings'); }} className="alert-action">Review now</a>
            </div>
          </div>

          {/* Bookings Tab */}
          <div id="bookings-tab" className={`tab-content ${activeTab === 'bookings' ? 'active' : ''}`}>
            <div className="section-card" style={{ marginBottom: '2rem' }}>
              <h2>Import Projects from CSV</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
                Upload a CSV file with columns: Data (Date), DJ, Project, Location, Payment, CC Payment 6%, DJ Payout
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input 
                  type="file" 
                  id="csv-file-input" 
                  accept=".csv" 
                  style={{ padding: '0.5rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                />
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    // Import CSV functionality will be added here
                    console.log('Import CSV clicked');
                  }}
                  style={{ padding: '0.5rem 1.5rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Import CSV
                </button>
              </div>
              <div id="import-status-box" style={{ display: 'none', marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: '#f8f9fa', border: '2px solid #e0e0e0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div id="import-status-spinner" style={{ width: '20px', height: '20px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'none' }}></div>
                  <div id="import-status-icon" style={{ fontSize: '1.25rem' }}></div>
                  <strong id="import-status-title" style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>Import Status</strong>
                </div>
                <div id="import-status-message" style={{ color: 'var(--text-dark)', fontSize: '0.95rem', lineHeight: 1.5 }}></div>
                <div id="import-status-details" style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}></div>
              </div>
            </div>
            
            <div className="section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>All Projects</h2>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all projects? This action cannot be undone.')) {
                      // Clear all projects functionality will be added here
                      console.log('Clear all projects');
                    }
                  }}
                  style={{ padding: '0.5rem 1rem', background: 'var(--error-color)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                  title="Clear all projects"
                >
                  Clear All Projects
                </button>
              </div>
              <div className="filter-controls" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <select 
                  id="booking-filter-dj" 
                  onChange={() => {
                    // Handle filter change functionality will be added here
                    console.log('Booking filter DJ changed');
                  }}
                  style={{ padding: '0.5rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                >
                  <option value="">All DJs</option>
                </select>
                <select 
                  id="booking-filter-time" 
                  onChange={() => {
                    // Handle filter change functionality will be added here
                    console.log('Booking filter time changed');
                  }}
                  style={{ padding: '0.5rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                >
                  <option value="">All Time Periods</option>
                  <option value="past">Past/Now</option>
                  <option value="future">Looking Forward</option>
                </select>
                <select 
                  id="booking-filter-year" 
                  onChange={() => {
                    // Handle filter change functionality will be added here
                    console.log('Booking filter year changed');
                  }}
                  style={{ padding: '0.5rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                >
                  <option value="">All Years</option>
                </select>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table className="bookings-table" style={{ tableLayout: 'auto', width: '100%', minWidth: '900px' }}>
                  <thead>
                    <tr>
                      <th 
                        className="sortable" 
                        data-column="date"
                        onClick={() => {
                          // Sort table functionality will be added here
                          console.log('Sort by date');
                        }}
                      >
                        Date
                      </th>
                      <th 
                        className="sortable" 
                        data-column="dj"
                        onClick={() => {
                          // Sort table functionality will be added here
                          console.log('Sort by DJ');
                        }}
                      >
                        DJ
                      </th>
                      <th 
                        className="sortable" 
                        data-column="project"
                        onClick={() => {
                          // Sort table functionality will be added here
                          console.log('Sort by project');
                        }}
                      >
                        Project
                      </th>
                      <th 
                        className="sortable" 
                        data-column="location"
                        onClick={() => {
                          // Sort table functionality will be added here
                          console.log('Sort by location');
                        }}
                      >
                        Location
                      </th>
                      <th 
                        className="sortable" 
                        data-column="totalRevenue"
                        onClick={() => {
                          // Sort table functionality will be added here
                          console.log('Sort by payment');
                        }}
                      >
                        Payment
                      </th>
                      <th 
                        className="sortable" 
                        data-column="ccPayment"
                        onClick={() => {
                          // Sort table functionality will be added here
                          console.log('Sort by CC payment');
                        }}
                      >
                        CC Payment 6%
                      </th>
                      <th 
                        className="sortable" 
                        data-column="payout"
                        onClick={() => {
                          // Sort table functionality will be added here
                          console.log('Sort by payout');
                        }}
                      >
                        DJ Payout
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="all-bookings-container">
                    {/* Projects will be populated here */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Calendar Tab */}
          <div id="calendar-tab" className={`tab-content ${activeTab === 'calendar' ? 'active' : ''}`}>
            <div className="section-card" style={{ marginBottom: '2rem' }}>
              <h2>Pending Blocked Date Requests</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>Review and approve or reject blocked date requests from DJs</p>
              <div id="pending-blocked-dates-container">
                {/* Pending blocked dates will be displayed here */}
              </div>
            </div>
            
            <div className="section-card">
              <h2>Master Calendar - All Blocked Dates & Projects</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>Click on any date in the calendar to block it for a DJ. Blocked dates are automatically approved.</p>
              <div className="filter-controls">
                <select 
                  id="calendar-filter-dj"
                  onChange={async () => {
                    // Generate master calendar functionality will be added here
                    console.log('Calendar filter changed');
                  }}
                >
                  <option value="">All DJs</option>
                </select>
              </div>
              <div id="master-calendar-container">
                {/* Master calendar will be generated here */}
              </div>
            </div>
          </div>

          {/* Reviews Tab */}
          <div id="reviews-tab" className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`}>
            <div className="section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Client Reviews</h2>
                <div className="filter-controls" style={{ margin: 0 }}>
                  <select 
                    id="review-filter-status" 
                    onChange={() => {
                      // Load reviews functionality will be added here
                      console.log('Review filter changed');
                    }}
                    style={{ padding: '0.5rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                  >
                    <option value="">All Reviews</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div id="reviews-container">
                {/* Reviews will be displayed here */}
              </div>
            </div>
          </div>

          {/* Analytics Tab */}
          <div id="analytics-tab" className={`tab-content ${activeTab === 'analytics' ? 'active' : ''}`}>
            <div className="section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Website Analytics</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <select 
                    id="analytics-time-range" 
                    defaultValue="30" 
                    onChange={() => {
                      // Load analytics functionality will be added here
                      console.log('Analytics time range changed');
                    }}
                    style={{ padding: '0.5rem 1rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                  >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="365">Last Year</option>
                    <option value="all">All Time</option>
                  </select>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
                        // Clear analytics functionality will be added here
                        console.log('Clear analytics data');
                      }
                    }}
                    style={{ padding: '0.5rem 1rem', background: 'var(--error-color)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Clear Data
                  </button>
                </div>
              </div>

              {/* Modern Metrics Grid */}
              <div className="metrics-grid-modern">
                <div className="metric-card-modern">
                  <div className="metric-header">
                    <span className="metric-label">Total Visits</span>
                    <span className="metric-icon">👥</span>
                  </div>
                  <div className="metric-value" id="total-visits">0</div>
                  <div className="metric-change positive">
                    <span className="arrow">↑</span> +12.5% from last month
                  </div>
                </div>
                <div className="metric-card-modern">
                  <div className="metric-header">
                    <span className="metric-label">Page Views</span>
                    <span className="metric-icon">📄</span>
                  </div>
                  <div className="metric-value" id="total-page-views">0</div>
                  <div className="metric-change positive">
                    <span className="arrow">↑</span> +8.2% this week
                  </div>
                </div>
                <div className="metric-card-modern">
                  <div className="metric-header">
                    <span className="metric-label">Unique Visitors</span>
                    <span className="metric-icon">🎯</span>
                  </div>
                  <div className="metric-value" id="unique-visitors">0</div>
                  <div className="metric-change positive">
                    <span className="arrow">↑</span> +5.3% this week
                  </div>
                </div>
                <div className="metric-card-modern">
                  <div className="metric-header">
                    <span className="metric-label">Avg. Session</span>
                    <span className="metric-icon">⏱️</span>
                  </div>
                  <div className="metric-value" id="avg-session-duration">0m</div>
                  <div className="metric-change positive">
                    <span className="arrow">↑</span> +2.4% from last month
                  </div>
                </div>
              </div>

              {/* Analytics Charts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px' }}>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Visits Over Time</h3>
                  <div id="visits-chart" style={{ height: '300px', position: 'relative', padding: '1rem 0', width: '100%', minWidth: '400px' }}>
                    {/* Line graph will be generated here */}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px' }}>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Top Pages</h3>
                  <div id="top-pages-list">
                    {/* Top pages will be listed here */}
                  </div>
                </div>
              </div>

              {/* Additional Analytics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Traffic Sources */}
                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px' }}>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Traffic Sources</h3>
                  <div id="traffic-sources-list">
                    {/* Traffic sources will be listed here */}
                  </div>
                </div>

                {/* Device Types */}
                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px' }}>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Device Types</h3>
                  <div id="device-types-list">
                    {/* Device types will be listed here */}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ marginTop: '2rem', background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px' }}>
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Recent Activity</h3>
                <div id="recent-activity-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {/* Recent activity will be listed here */}
                </div>
              </div>
            </div>
          </div>

          {/* User Management Tab */}
          <div id="users-tab" className={`tab-content ${activeTab === 'users' ? 'active' : ''}`}>
            <div className="section-card">
              <h2>User Management</h2>
              
              {/* Create/Edit User Form */}
              <div style={{ background: 'var(--bg-light)', padding: '2rem', borderRadius: '10px', marginBottom: '2rem' }}>
                <h3 id="user-form-title" style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Create New User</h3>
                <form id="create-user-form" onSubmit={(e) => { e.preventDefault(); /* Form submission will be handled here */ }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <input type="hidden" id="edit-mode" value="false" />
                  <input type="hidden" id="edit-original-username" value="" />
                  <input type="hidden" id="edit-original-usertype" value="" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>First Name</label>
                    <input 
                      type="text" 
                      id="new-firstname" 
                      required 
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Last Name</label>
                    <input 
                      type="text" 
                      id="new-lastname" 
                      required 
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                    />
                  </div>
                  <div id="username-field-container">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Username</label>
                    <input 
                      type="text" 
                      id="new-username" 
                      required 
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                    />
                    <small id="username-hint" style={{ display: 'none', marginTop: '0.25rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>For admin users, username is the same as first name</small>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                    <input 
                      type="email" 
                      id="new-email" 
                      required 
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number</label>
                    <input 
                      type="tel" 
                      id="new-phone" 
                      placeholder="(555) 123-4567"
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                    />
                    <small style={{ display: 'block', marginTop: '0.25rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>Required for SMS reminders</small>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>User Type</label>
                    <select 
                      id="new-user-type" 
                      required 
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                    >
                      <option value="dj">DJ</option>
                      <option value="photographer">Photographer</option>
                      <option value="videographer">Videographer</option>
                      <option value="coordination">Coordination</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
                    <input 
                      type="password" 
                      id="new-password" 
                      minLength={8}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                    />
                    <small id="password-hint" style={{ display: 'block', marginTop: '0.25rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>Leave blank to keep existing password</small>
                  </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <button 
                      type="submit"
                      id="submit-user-button"
                      style={{ padding: '0.75rem 2rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}
                    >
                      Create User
                    </button>
                    <button 
                      type="button"
                      id="cancel-edit-button"
                      onClick={() => {
                        // Cancel edit functionality will be added here
                        console.log('Cancel edit');
                      }}
                      style={{ display: 'none', padding: '0.75rem 1.5rem', background: 'var(--text-light)', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                <div id="create-user-message" style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '5px', display: 'none' }}></div>
              </div>

              {/* Users List */}
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>All Users</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div id="users-list-container">
                    {/* Users will be populated here */}
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Global Toast Notification */}
      <div 
        id="toast-notification" 
        style={{ 
          display: 'none', 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          background: 'white', 
          padding: '1rem 1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
          zIndex: 10000, 
          maxWidth: '400px'
        }}
      >
        <div id="toast-message" style={{ fontSize: '0.95rem', fontWeight: 500 }}></div>
      </div>
    </div>
  );
}

