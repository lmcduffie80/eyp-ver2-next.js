'use client';

import React, { useState, useEffect } from 'react';
import { useCSVImport } from '../hooks/useCSVImport';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('djs');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [userTab, setUserTab] = useState('create');
  const [userSearch, setUserSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDJFilter, setCalendarDJFilter] = useState('');
  
  // Photography state
  const [photoProjects, setPhotoProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [projectPhotos, setProjectPhotos] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);
  
  const { importing, status, importCSV} = useCSVImport();

  useEffect(() => {
    // Prevent body scroll when dashboard is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    // Fetch bookings and blocked dates when component mounts
    fetchBookings();
    fetchBlockedDates();
  }, []);

  // Calculate and update dashboard statistics when bookings change
  useEffect(() => {
    if (bookings.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Total Projects
      const totalProjects = bookings.length;
      
      // Completed Projects (past dates)
      const completed = bookings.filter(b => new Date(b.date) < today).length;
      
      // Future Bookings
      const futureBookings = bookings.filter(b => new Date(b.date) >= today).length;
      
      // Total Revenue
      const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalRevenue || 0), 0);
      
      // DJ Revenue (sum of DJ payouts)
      const djRevenue = bookings.reduce((sum, b) => sum + (b.payout || 0), 0);
      
      // Revenue by Year
      const revenue2025 = bookings
        .filter(b => new Date(b.date).getFullYear() === 2025)
        .reduce((sum, b) => sum + (b.totalRevenue || 0), 0);
      
      const revenue2026 = bookings
        .filter(b => new Date(b.date).getFullYear() === 2026)
        .reduce((sum, b) => sum + (b.totalRevenue || 0), 0);
      
      // Calculate percentages
      const completionRate = totalProjects > 0 ? ((completed / totalProjects) * 100) : 0;
      const djRevenuePercentage = totalRevenue > 0 ? ((djRevenue / totalRevenue) * 100) : 0;
      
      // Update DOM elements
      const totalProjectsEl = document.getElementById('total-projects');
      const completedProjectsEl = document.getElementById('completed-projects');
      const futureBookingsEl = document.getElementById('future-bookings-projects');
      const totalRevenueEl = document.getElementById('total-revenue');
      const djRevenueEl = document.getElementById('dj-revenue');
      const revenue2025El = document.getElementById('revenue-2025');
      const revenue2026El = document.getElementById('revenue-2026');
      
      // Progress bar elements
      const completedProgressBar = document.getElementById('completed-progress-bar');
      const completedPercentage = document.getElementById('completed-percentage');
      
      // DJ revenue display and bar
      const djRevenueDisplay = document.getElementById('dj-revenue-display');
      const djRevenueBar = document.getElementById('dj-revenue-bar');
      
      if (totalProjectsEl) totalProjectsEl.textContent = totalProjects.toString();
      if (completedProjectsEl) completedProjectsEl.textContent = completed.toString();
      if (futureBookingsEl) futureBookingsEl.textContent = futureBookings.toString();
      if (totalRevenueEl) totalRevenueEl.textContent = `$${totalRevenue.toFixed(2)}`;
      if (djRevenueEl) djRevenueEl.textContent = `$${djRevenue.toFixed(2)}`;
      if (revenue2025El) revenue2025El.textContent = `$${revenue2025.toFixed(2)}`;
      if (revenue2026El) revenue2026El.textContent = `$${revenue2026.toFixed(2)}`;
      
      // Update progress bar for completed projects
      if (completedProgressBar) completedProgressBar.style.width = `${completionRate}%`;
      if (completedPercentage) completedPercentage.textContent = `${completionRate.toFixed(0)}% completion rate`;
      
      // Update DJ revenue display and bar
      if (djRevenueDisplay) djRevenueDisplay.textContent = `$${djRevenue.toFixed(2)} (${djRevenuePercentage.toFixed(0)}%)`;
      if (djRevenueBar) djRevenueBar.style.width = `${djRevenuePercentage}%`;
    }
  }, [bookings]);

  // Update blocked dates count when blocked dates change
  useEffect(() => {
    if (blockedDates.length > 0) {
      // Count only approved blocked dates
      const approvedCount = blockedDates.filter(bd => 
        bd.status === 'approved' || !bd.status
      ).length;
      
      const blockedDatesEl = document.getElementById('blocked-dates-count');
      if (blockedDatesEl) blockedDatesEl.textContent = approvedCount.toString();
    }
  }, [blockedDates]);

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

  // Calendar helper functions
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const generateCalendar = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    const currentDate = new Date(startDate);
    
    // Generate 6 weeks to ensure consistent calendar height
    for (let i = 0; i < 42; i++) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const filtered = calendarDJFilter 
      ? bookings.filter(b => b.djUser === calendarDJFilter)
      : bookings;
    
    return filtered.filter(b => {
      const bookingDate = new Date(b.date).toISOString().split('T')[0];
      return bookingDate === dateStr;
    });
  };

  const getBlockedDatesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const filtered = calendarDJFilter
      ? blockedDates.filter(bd => bd.djUser === calendarDJFilter)
      : blockedDates;
    
    return filtered.filter(bd => {
      const blockedDateStr = new Date(bd.date).toISOString().split('T')[0];
      return blockedDateStr === dateStr;
    });
  };

  const changeMonth = (delta: number) => {
    let newMonth = calendarMonth + delta;
    let newYear = calendarYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  const goToToday = () => {
    const today = new Date();
    setCalendarMonth(today.getMonth());
    setCalendarYear(today.getFullYear());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === calendarMonth;
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        console.error('Failed to fetch bookings:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchBlockedDates = async () => {
    try {
      const response = await fetch('/api/blocked-dates');
      if (response.ok) {
        const data = await response.json();
        setBlockedDates(data);
      } else {
        console.error('Failed to fetch blocked dates:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch blocked dates:', error);
    }
  };

  // Photography Management Functions
  const fetchPhotoProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await fetch('/api/photography/projects');
      if (response.ok) {
        const result = await response.json();
        setPhotoProjects(result.data || []);
      } else {
        console.error('Failed to fetch photography projects');
      }
    } catch (error) {
      console.error('Error fetching photography projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchProjectPhotos = async (projectId: number) => {
    try {
      setLoadingPhotos(true);
      const response = await fetch(`/api/photography/photos?project_id=${projectId}`);
      if (response.ok) {
        const result = await response.json();
        setProjectPhotos(result.data || []);
      } else {
        console.error('Failed to fetch project photos');
      }
    } catch (error) {
      console.error('Error fetching project photos:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    try {
      const response = await fetch('/api/photography/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: newProjectName,
          description: newProjectDescription
        })
      });

      if (response.ok) {
        const result = await response.json();
        setNewProjectName('');
        setNewProjectDescription('');
        setShowProjectForm(false);
        await fetchPhotoProjects();
        setSelectedProject(result.data);
      } else {
        const error = await response.json();
        alert(`Failed to create project: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  const deleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project? All photos will be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/photography/projects?id=${projectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
          setProjectPhotos([]);
        }
        await fetchPhotoProjects();
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedProject) return;

    setUploadingPhotos(true);
    setUploadProgress(0);
    const totalFiles = files.length;
    let uploadedCount = 0;
    let failedCount = 0;

    try {
      for (const file of Array.from(files)) {
        try {
          // Step 1: Request presigned URL from backend
          const uploadResponse = await fetch('/api/photography/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              project_id: selectedProject.id,
              contentType: file.type
            })
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to get upload URL');
          }

          const uploadData = await uploadResponse.json();
          
          if (!uploadData.success) {
            throw new Error(uploadData.error || 'Failed to get upload URL');
          }

          const { uploadURL, photoURL } = uploadData;

          // Step 2: Upload original file directly to S3 (no compression!)
          const s3Response = await fetch(uploadURL, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type
            }
          });

          if (!s3Response.ok) {
            throw new Error('Failed to upload to S3');
          }

          // Step 3: Save photo metadata to database with S3 URL
          await fetch('/api/photography/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: selectedProject.id,
              photo_url: photoURL,
              filename: file.name
            })
          });

          uploadedCount++;
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));

        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          failedCount++;
        }
      }

      // Refresh the project photos after all uploads
      if (uploadedCount > 0) {
        await fetchProjectPhotos(selectedProject.id);
        await fetchPhotoProjects();
      }

      // Show summary
      if (failedCount > 0) {
        alert(`Uploaded ${uploadedCount} of ${totalFiles} photos. ${failedCount} failed.`);
      }

    } catch (error) {
      console.error('Error during photo upload:', error);
      alert('Upload failed. Please check your AWS S3 configuration.');
    } finally {
      setTimeout(() => {
        setUploadingPhotos(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const deletePhoto = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/photography/photos?id=${photoId}`, {
        method: 'DELETE'
      });

      if (response.ok && selectedProject) {
        await fetchProjectPhotos(selectedProject.id);
        await fetchPhotoProjects();
      } else {
        alert('Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  useEffect(() => {
    if (activeTab === 'photography') {
      fetchPhotoProjects();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectPhotos(selectedProject.id);
    }
  }, [selectedProject]);

  const handleLogout = async () => {
    // Show confirmation
    if (!confirm('Are you sure you want to logout?')) {
      return;
    }

    try {
      // Show loading state
      const logoutBtn = document.querySelector('.logout-btn');
      if (logoutBtn) {
        logoutBtn.textContent = 'Logging out...';
        (logoutBtn as HTMLButtonElement).disabled = true;
      }

      // 1. Call logout API to clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 2. Clear localStorage
      localStorage.clear();

      // 3. Clear sessionStorage
      sessionStorage.clear();

      // 4. Clear any client-side auth data
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // 5. Redirect to login
      window.location.href = '/admin-login';
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed. Please try again.');
      
      // Reset button state
      const logoutBtn = document.querySelector('.logout-btn');
      if (logoutBtn) {
        logoutBtn.textContent = 'Logout';
        (logoutBtn as HTMLButtonElement).disabled = false;
      }
    }
  };

  return (
    <div className={`dashboard-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Navigation - Modern Design */}
      <nav className={`sidebar sidebar-modern ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Admin Panel Header */}
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
            {/* Avatar Circle - Clickable to toggle sidebar */}
            <div 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#ffffff',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
              title="Click to expand/collapse sidebar"
            >
              A
            </div>
            {/* Admin Panel Text */}
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); switchTab('djs'); }} 
              className="admin-panel-text" 
              style={{ 
                fontSize: '1.1rem',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Admin Panel
            </a>
          </div>
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
          <a 
            className={`sidebar-nav-link ${activeTab === 'photography' ? 'active' : ''}`}
            onClick={() => switchTab('photography')}
          >
            <span className="nav-icon">📸</span>
            <span>Photography</span>
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
            <button className="logout-btn" onClick={handleLogout}>
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
              {/* Total Projects */}
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

              {/* Completed Projects with Progress Bar */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3>
                    <span className="stat-icon">✅</span>
                    Completed
                  </h3>
                  <span className="stat-info-icon" title="Click to filter completed projects">ℹ️</span>
                </div>
                <div className="stat-value" id="completed-projects">0</div>
                <div id="completed-progress-container" style={{ marginTop: '0.75rem' }}>
                  <div style={{ 
                    height: '6px',
                    background: '#e0e0e0',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div id="completed-progress-bar" style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981, #059669)',
                      width: '0%',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <small id="completed-percentage" style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    0% completion rate
                  </small>
                </div>
              </div>

              {/* Future Bookings */}
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

              {/* Blocked Dates */}
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

              {/* Consolidated Revenue Overview Card - Spans 2 Columns */}
              <div className="stat-card span-2">
                <div className="stat-card-header">
                  <h3>
                    <span className="stat-icon">💰</span>
                    Revenue Overview
                  </h3>
                  <span className="stat-info-icon" title="Comprehensive revenue breakdown">ℹ️</span>
                </div>
                
                {/* Main Total Revenue */}
                <div className="stat-value" id="total-revenue" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>$0.00</div>
                
                {/* DJ vs Company Revenue Split */}
                <div style={{ margin: '1rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-light)' }}>DJ Payout</span>
                    <span id="dj-revenue-display" style={{ fontSize: '0.95rem', fontWeight: '600' }}>$0.00 (0%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div id="dj-revenue-bar" style={{ 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      width: '0%',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                
                {/* Year Comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
                  <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>2025 Revenue</div>
                    <div id="revenue-2025" style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>$0.00</div>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>2026 Revenue</div>
                    <div id="revenue-2026" style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>$0.00</div>
                  </div>
                </div>
                
                {/* Hidden elements for backward compatibility */}
                <div style={{ display: 'none' }}>
                  <span id="dj-revenue">$0.00</span>
                </div>
              </div>
            </div>
            <div className="section-card">
              <h2>All DJs Overview</h2>
              <div id="djs-container" className="dj-list">
                {/* DJs will be populated here */}
              </div>
            </div>

            {/* All DJs Upcoming Projects Table */}
            <div className="section-card" style={{ marginTop: '2rem' }}>
              <h2>All DJs Upcoming Projects</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
                Showing all future bookings across all DJs
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table className="bookings-table" style={{ width: '100%', minWidth: '900px' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>DJ</th>
                      <th>Project</th>
                      <th>Location</th>
                      <th>Revenue</th>
                      <th>DJ Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingBookings ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                          Loading upcoming projects...
                        </td>
                      </tr>
                    ) : (
                      (() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const upcomingBookings = bookings
                          .filter(b => new Date(b.date) >= today)
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        
                        return upcomingBookings.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                              No upcoming projects scheduled
                            </td>
                          </tr>
                        ) : (
                          upcomingBookings.map(booking => (
                            <tr key={booking.id}>
                              <td>{new Date(booking.date).toLocaleDateString()}</td>
                              <td>{booking.djUser || 'N/A'}</td>
                              <td>{booking.eventType || 'N/A'}</td>
                              <td>{booking.location || 'N/A'}</td>
                              <td>${booking.totalRevenue?.toFixed(2) || '0.00'}</td>
                              <td>${booking.payout?.toFixed(2) || '0.00'}</td>
                            </tr>
                          ))
                        );
                      })()
                    )}
                  </tbody>
                </table>
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
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await importCSV(file);
                      e.target.value = ''; // Clear for next import
                      // Refresh bookings after import
                      await fetchBookings();
                    }
                  }}
                  style={{ padding: '0.5rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                />
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
                    const file = fileInput?.files?.[0];
                    
                    if (!file) {
                      // Trigger file picker instead of showing alert
                      fileInput?.click();
                      return;
                    }
                    
                    // File already selected, import it
                    importCSV(file).then(() => {
                      if (fileInput) {
                        fileInput.value = '';
                      }
                      // Refresh bookings after import
                      fetchBookings();
                    });
                  }}
                  disabled={importing}
                  style={{ 
                    padding: '0.5rem 1.5rem', 
                    background: 'var(--accent-color)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: importing ? 'not-allowed' : 'pointer', 
                    fontWeight: 'bold',
                    opacity: importing ? 0.6 : 1
                  }}
                >
                  {importing ? 'Importing...' : 'Import CSV'}
                </button>
              </div>
              {status.visible && (
                <div style={{ 
                  display: 'block',
                  marginTop: '1rem', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  background: status.type === 'error' ? '#f8d7da' : 
                              status.type === 'success' ? '#d4edda' : 
                              status.type === 'warning' ? '#fff3cd' : '#f8f9fa',
                  border: `2px solid ${
                    status.type === 'error' ? '#f5c6cb' : 
                    status.type === 'success' ? '#c3e6cb' : 
                    status.type === 'warning' ? '#ffeaa7' : '#e0e0e0'
                  }`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    {importing && (
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        border: '3px solid #f3f3f3', 
                        borderTop: '3px solid var(--accent-color)', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite'
                      }}></div>
                    )}
                    <div style={{ fontSize: '1.25rem' }}>
                      {status.type === 'success' ? '✅' : 
                       status.type === 'error' ? '❌' : 
                       status.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>{status.title}</strong>
                  </div>
                  <div style={{ color: 'var(--text-dark)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    {status.message}
                  </div>
                  {status.details && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      {status.details}
                    </div>
                  )}
                </div>
              )}
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
                    {loadingBookings ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                          Loading bookings...
                        </td>
                      </tr>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                          No bookings found. Import a CSV file to add bookings.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>{new Date(booking.date).toLocaleDateString()}</td>
                          <td>{booking.djUser || 'N/A'}</td>
                          <td>{booking.eventType || 'N/A'}</td>
                          <td>{booking.location || 'N/A'}</td>
                          <td>${booking.totalRevenue?.toFixed(2) || '0.00'}</td>
                          <td>${booking.ccPayment?.toFixed(2) || '0.00'}</td>
                          <td>${booking.payout?.toFixed(2) || '0.00'}</td>
                          <td>
                            <button
                              onClick={() => console.log('Edit booking:', booking.id)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.8rem',
                                background: 'var(--primary-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                marginRight: '0.5rem'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this booking?')) {
                                  console.log('Delete booking:', booking.id);
                                }
                              }}
                              style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.8rem',
                                background: 'var(--error-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Calendar Tab */}
          <div id="calendar-tab" className={`tab-content ${activeTab === 'calendar' ? 'active' : ''}`}>
            <div className="section-card">
              <h2 style={{ marginBottom: '1.5rem' }}>Event Calendar</h2>
              
              {/* Calendar Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '500', marginRight: '0.5rem' }}>Filter by DJ:</label>
                  <select 
                    id="calendar-filter-dj"
                    value={calendarDJFilter}
                    onChange={(e) => setCalendarDJFilter(e.target.value)}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      border: '2px solid #e0e0e0', 
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  >
                    <option value="">All DJs</option>
                    {/* DJ options will be populated dynamically */}
                  </select>
                </div>
              </div>

              {/* Calendar Component */}
              <div className="calendar-container">
                {/* Calendar Header with Navigation */}
                <div className="calendar-header">
                  <button 
                    onClick={() => changeMonth(-1)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'white',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1.25rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    ←
                  </button>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                    {monthNames[calendarMonth]} {calendarYear}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={goToToday}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'white',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      Today
                    </button>
                    <button 
                      onClick={() => changeMonth(1)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'white',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1.25rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      →
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid">
                  {/* Day Headers */}
                  {dayNames.map(day => (
                    <div key={day} className="calendar-day-header">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {generateCalendar(calendarYear, calendarMonth).map((week, weekIndex) => (
                    week.map((day, dayIndex) => {
                      const dayBookings = getBookingsForDate(day);
                      const dayBlockedDates = getBlockedDatesForDate(day);
                      const isTodayDate = isToday(day);
                      const isCurrentMonthDate = isCurrentMonth(day);
                      
                      return (
                        <div 
                          key={`${weekIndex}-${dayIndex}`}
                          className={`calendar-day ${!isCurrentMonthDate ? 'other-month' : ''} ${isTodayDate ? 'today' : ''}`}
                          onClick={() => setSelectedDate(day)}
                          title={dayBookings.length > 0 || dayBlockedDates.length > 0 
                            ? `${dayBookings.length} booking(s), ${dayBlockedDates.length} blocked`
                            : 'No events'}
                        >
                          <div className="day-number">{day.getDate()}</div>
                          <div className="day-events">
                            {dayBookings.slice(0, 3).map((booking, i) => (
                              <div 
                                key={i}
                                className="event-indicator"
                                style={{ 
                                  background: '#10b981',
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%'
                                }}
                                title={`${booking.djUser} - ${booking.eventType} @ ${booking.location}`}
                              />
                            ))}
                            {dayBookings.length > 3 && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: '600' }}>
                                +{dayBookings.length - 3}
                              </span>
                            )}
                            {dayBlockedDates.length > 0 && (
                              <div className="blocked-indicator" title={`${dayBlockedDates.length} blocked date(s)`}>
                                🚫
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ))}
                </div>

                {/* Legend */}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                    <span style={{ fontSize: '0.9rem' }}>Booking</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🚫</span>
                    <span style={{ fontSize: '0.9rem' }}>Blocked Date</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', border: '2px solid #000', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '0.9rem' }}>Today</span>
                  </div>
                </div>

                {/* Selected Date Details */}
                {selectedDate && (
                  <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0 }}>
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </h4>
                      <button 
                        onClick={() => setSelectedDate(null)}
                        style={{ 
                          padding: '0.25rem 0.75rem', 
                          background: 'transparent', 
                          border: 'none', 
                          cursor: 'pointer', 
                          fontSize: '1.25rem' 
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    
                    {(() => {
                      const dayBookings = getBookingsForDate(selectedDate);
                      const dayBlockedDates = getBlockedDatesForDate(selectedDate);
                      
                      return (
                        <>
                          {dayBookings.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                              <h5 style={{ marginBottom: '0.75rem' }}>Bookings ({dayBookings.length})</h5>
                              {dayBookings.map((booking, i) => (
                                <div key={i} style={{ padding: '0.75rem', background: 'white', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '4px solid #10b981' }}>
                                  <div style={{ fontWeight: '600' }}>{booking.eventType}</div>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                                    DJ: {booking.djUser} • {booking.location}
                                  </div>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                                    Revenue: ${booking.totalRevenue?.toFixed(2) || '0.00'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {dayBlockedDates.length > 0 && (
                            <div>
                              <h5 style={{ marginBottom: '0.75rem' }}>Blocked Dates ({dayBlockedDates.length})</h5>
                              {dayBlockedDates.map((blocked, i) => (
                                <div key={i} style={{ padding: '0.75rem', background: 'white', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '4px solid #ef4444' }}>
                                  <div style={{ fontWeight: '600' }}>DJ: {blocked.djUser}</div>
                                  {blocked.reason && (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                                      Reason: {blocked.reason}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {dayBookings.length === 0 && dayBlockedDates.length === 0 && (
                            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '1rem' }}>
                              No bookings or blocked dates for this day
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
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

          {/* Photography Tab */}
          <div id="photography-tab" className={`tab-content ${activeTab === 'photography' ? 'active' : ''}`}>
            <div className="section-card" style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Photography Portfolio Manager</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
                Manage your photography projects and upload photos that will appear on the public photography page.
              </p>

              <div className="photography-manager">
                {/* Projects Panel */}
                <div className="projects-panel">
                  <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Projects</h3>
                    <button 
                      onClick={() => setShowProjectForm(!showProjectForm)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}
                    >
                      {showProjectForm ? 'Cancel' : '+ New Project'}
                    </button>
                  </div>

                  {showProjectForm && (
                    <div className="project-form" style={{ 
                      padding: '1.5rem', 
                      background: '#f8f9fa', 
                      borderRadius: '8px', 
                      marginBottom: '1.5rem' 
                    }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                          Project Name *
                        </label>
                        <input
                          type="text"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          placeholder="e.g., Smith Wedding 2025"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '0.95rem'
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                          Description (Optional)
                        </label>
                        <textarea
                          value={newProjectDescription}
                          onChange={(e) => setNewProjectDescription(e.target.value)}
                          placeholder="Brief description of this project..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                      <button
                        onClick={createProject}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'var(--primary-color)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.95rem'
                        }}
                      >
                        Create Project
                      </button>
                    </div>
                  )}

                  <div className="projects-list">
                    {loadingProjects ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                        Loading projects...
                      </div>
                    ) : photoProjects.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                        No projects yet. Create your first project to get started!
                      </div>
                    ) : (
                      photoProjects.map(project => (
                        <div
                          key={project.id}
                          className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                          onClick={() => setSelectedProject(project)}
                        >
                          <div className="project-cover">
                            {project.cover_photo_url ? (
                              <img src={project.cover_photo_url} alt={project.project_name} />
                            ) : (
                              <div className="no-cover">📸</div>
                            )}
                          </div>
                          <div className="project-info">
                            <h4>{project.project_name}</h4>
                            <p>{project.photo_count || 0} photos</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(project.id);
                            }}
                            className="delete-project-btn"
                            title="Delete project"
                          >
                            🗑️
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Photos Panel */}
                <div className="photos-panel">
                  {!selectedProject ? (
                    <div style={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--text-light)',
                      textAlign: 'center',
                      padding: '2rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
                        <p>Select a project from the left to view and upload photos</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{selectedProject.project_name}</h3>
                        {selectedProject.description && (
                          <p style={{ color: 'var(--text-light)', margin: 0 }}>{selectedProject.description}</p>
                        )}
                      </div>

                      <div className="upload-area">
                        <input
                          type="file"
                          id="photo-upload-input"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="photo-upload-input"
                          style={{
                            display: 'block',
                            padding: '3rem 2rem',
                            border: '3px dashed #e0e0e0',
                            borderRadius: '12px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: '#f8f9fa',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary-color)';
                            e.currentTarget.style.background = '#f0f4ff';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#e0e0e0';
                            e.currentTarget.style.background = '#f8f9fa';
                          }}
                        >
                          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                          <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            {uploadingPhotos ? `Uploading... ${uploadProgress}%` : 'Click to upload or drag photos here'}
                          </p>
                          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                            Supports: JPG, PNG, GIF, WEBP • Max 10MB per file
                          </p>
                        </label>
                        {uploadingPhotos && (
                          <div style={{ marginTop: '1rem' }}>
                            <div style={{ 
                              height: '8px', 
                              background: '#e0e0e0', 
                              borderRadius: '4px', 
                              overflow: 'hidden' 
                            }}>
                              <div style={{ 
                                height: '100%', 
                                background: 'var(--primary-color)', 
                                width: `${uploadProgress}%`,
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Photos ({projectPhotos.length})</h4>
                        
                        {loadingPhotos ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                            Loading photos...
                          </div>
                        ) : projectPhotos.length === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                            No photos yet. Upload your first photo!
                          </div>
                        ) : (
                          <div className="photos-grid">
                            {projectPhotos.map(photo => (
                              <div key={photo.id} className="photo-item">
                                <img 
                                  src={photo.thumbnail_url || photo.photo_url} 
                                  alt={photo.caption || 'Project photo'}
                                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                                <button
                                  onClick={() => deletePhoto(photo.id)}
                                  className="delete-photo-btn"
                                  title="Delete photo"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
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
              <h2 style={{ marginBottom: '1.5rem' }}>User Management</h2>
              
              {/* Tab Navigation */}
              <div className="user-management-tabs">
                <button 
                  className={`tab ${userTab === 'create' ? 'active' : ''}`}
                  onClick={() => setUserTab('create')}
                >
                  <span>➕</span> Create User
                </button>
                <button 
                  className={`tab ${userTab === 'manage' ? 'active' : ''}`}
                  onClick={() => setUserTab('manage')}
                >
                  <span>👥</span> Manage Users
                </button>
              </div>

              {/* Create User Tab Content */}
              {userTab === 'create' && (
                <div style={{ background: 'var(--bg-light)', padding: '2rem', borderRadius: '12px' }}>
                  <h3 id="user-form-title" style={{ marginBottom: '1.5rem', color: 'var(--primary-color)', fontSize: '1.25rem' }}>Create New User</h3>
                  <form id="create-user-form" onSubmit={(e) => { e.preventDefault(); /* Form submission will be handled here */ }}>
                    <input type="hidden" id="edit-mode" value="false" />
                    <input type="hidden" id="edit-original-username" value="" />
                    <input type="hidden" id="edit-original-usertype" value="" />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                      <div className="form-field">
                        <label>First Name *</label>
                        <input 
                          type="text" 
                          id="new-firstname" 
                          required 
                        />
                      </div>
                      <div className="form-field">
                        <label>Last Name *</label>
                        <input 
                          type="text" 
                          id="new-lastname" 
                          required 
                        />
                      </div>
                      <div className="form-field" id="username-field-container">
                        <label>Username *</label>
                        <input 
                          type="text" 
                          id="new-username" 
                          required 
                        />
                        <small id="username-hint" style={{ display: 'none', marginTop: '0.25rem', fontSize: '0.85rem' }}>For admin users, username is the same as first name</small>
                      </div>
                      <div className="form-field">
                        <label>Email *</label>
                        <input 
                          type="email" 
                          id="new-email" 
                          required 
                        />
                      </div>
                      <div className="form-field">
                        <label>Phone Number</label>
                        <input 
                          type="tel" 
                          id="new-phone" 
                          placeholder="(555) 123-4567"
                        />
                        <small style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>Required for SMS reminders</small>
                      </div>
                      <div className="form-field">
                        <label>User Type *</label>
                        <select id="new-user-type" required>
                          <option value="dj">DJ</option>
                          <option value="photographer">Photographer</option>
                          <option value="videographer">Videographer</option>
                          <option value="coordination">Coordination</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="form-field" style={{ gridColumn: 'span 3' }}>
                        <label>Password</label>
                        <input 
                          type="password" 
                          id="new-password" 
                          minLength={8}
                        />
                        <small id="password-hint" style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>Leave blank to keep existing password (edit mode)</small>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                      <button 
                        type="submit"
                        id="submit-user-button"
                        style={{ 
                          padding: '0.875rem 2rem', 
                          background: '#000', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '8px', 
                          fontWeight: '600', 
                          cursor: 'pointer',
                          fontSize: '1rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#2d2d2d'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#000'}
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
                        style={{ 
                          display: 'none', 
                          padding: '0.875rem 1.5rem', 
                          background: 'var(--text-light)', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '8px', 
                          fontWeight: '600', 
                          cursor: 'pointer' 
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                  <div id="create-user-message" style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', display: 'none' }}></div>
                </div>
              )}

              {/* Manage Users Tab Content */}
              {userTab === 'manage' && (
                <div>
                  <div className="table-controls">
                    <input 
                      type="search" 
                      placeholder="🔍 Search users by name, email, or username..."
                      className="search-input"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                    <select 
                      className="filter-select"
                      value={userTypeFilter}
                      onChange={(e) => setUserTypeFilter(e.target.value)}
                      style={{ 
                        padding: '0.75rem 1rem', 
                        border: '2px solid #e0e0e0', 
                        borderRadius: '8px',
                        fontSize: '1rem',
                        minWidth: '150px'
                      }}
                    >
                      <option value="">All Types</option>
                      <option value="dj">DJs</option>
                      <option value="photographer">Photographers</option>
                      <option value="videographer">Videographers</option>
                      <option value="coordination">Coordination</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>
                  
                  <div id="users-list-container" className="user-list-modern">
                    {/* Users table will be populated here by existing JS */}
                  </div>
                </div>
              )}
              
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

