'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCSVImport } from '../hooks/useCSVImport';
import ImageLightbox from '@/components/ImageLightbox';

// Force fresh deployment - Updated: 2026-01-23T00:00:00Z

export default function AdminDashboard() {
  // Authentication state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminDisplayName, setAdminDisplayName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('djs');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [loadingBlockedDates, setLoadingBlockedDates] = useState(false);
  const [blockedDateFilter, setBlockedDateFilter] = useState('pending');
  const [userTab, setUserTab] = useState('create');
  const [userSearch, setUserSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewStatusFilter, setReviewStatusFilter] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDJFilter, setCalendarDJFilter] = useState('');
  const [selectedDJFilter, setSelectedDJFilter] = useState<string>('');
  
  // All Projects Analytics filters
  const [analyticsFilterDJ, setAnalyticsFilterDJ] = useState<string>('');
  const [analyticsFilterTime, setAnalyticsFilterTime] = useState<string>('');
  const [analyticsFilterYear, setAnalyticsFilterYear] = useState<string>('');
  const [analyticsFilterStatus, setAnalyticsFilterStatus] = useState<string>('active');
  
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
  
  // Lightbox gallery state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');
  
  // Photo modal state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [modalProject, setModalProject] = useState<any | null>(null);
  
  // Video modal state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [modalVideoProject, setModalVideoProject] = useState<any | null>(null);
  
  // Helper to format date as YYYY-MM-DD in local timezone (avoids UTC conversion issues)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to parse YYYY-MM-DD string as local date (not UTC)
  const parseDateLocal = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
  // Videography state
  const [videoProjects, setVideoProjects] = useState<any[]>([]);
  const [selectedVideoProject, setSelectedVideoProject] = useState<any | null>(null);
  const [projectVideos, setProjectVideos] = useState<any[]>([]);
  const [loadingVideoProjects, setLoadingVideoProjects] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [newVideoProjectName, setNewVideoProjectName] = useState('');
  const [newVideoProjectDescription, setNewVideoProjectDescription] = useState('');
  const [showVideoProjectForm, setShowVideoProjectForm] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  
  // Pricing state
  const [pricingServiceTab, setPricingServiceTab] = useState<'photography' | 'videography' | 'dj'>('photography');
  const [pricingPackages, setPricingPackages] = useState<any[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [savingPackage, setSavingPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packageForm, setPackageForm] = useState({
    package_name: '',
    price: '',
    description: '',
    features: [] as string[],
    display_order: 0
  });
  const [newFeature, setNewFeature] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Notes modal state
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [currentEditingBooking, setCurrentEditingBooking] = useState<any | null>(null);
  const [modalNotes, setModalNotes] = useState('');
  
  // Sort state for projects table
  const [upcomingSortField, setUpcomingSortField] = useState<'date' | 'dj' | 'revenue'>('date');
  const [upcomingSortDirection, setUpcomingSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Sort state for recent projects
  const [recentSortDirection, setRecentSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Sort state for analytics table
  const [analyticsSortField, setAnalyticsSortField] = useState<'date' | 'dj' | 'project'>('date');
  const [analyticsSortDirection, setAnalyticsSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<string>('30');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  const { importing, status, importCSV} = useCSVImport();

  // Sort handler functions
  const handleUpcomingSort = (field: 'date' | 'dj' | 'revenue') => {
    if (upcomingSortField === field) {
      // Toggle direction if clicking same field
      setUpcomingSortDirection(upcomingSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setUpcomingSortField(field);
      setUpcomingSortDirection('asc');
    }
  };

  const toggleRecentSort = () => {
    setRecentSortDirection(recentSortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleAnalyticsSort = (field: 'date' | 'dj' | 'project') => {
    if (analyticsSortField === field) {
      setAnalyticsSortDirection(analyticsSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setAnalyticsSortField(field);
      setAnalyticsSortDirection('asc');
    }
  };

  // Sort indicator component
  const SortIndicator = ({ active, direction }: { active: boolean, direction: 'asc' | 'desc' }) => {
    if (!active) return <span style={{ opacity: 0.3, marginLeft: '0.25rem' }}>⇅</span>;
    return <span style={{ marginLeft: '0.25rem' }}>{direction === 'asc' ? '↑' : '↓'}</span>;
  };

  // Authentication check - must be logged in to access admin dashboard
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check for admin session via API
        const response = await fetch('/api/admin-verify');
        const data = await response.json();
        
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAdminUsername(data.user || '');
          setAdminDisplayName(data.displayName || data.user || '');
          
          // Also store in localStorage for display purposes
          localStorage.setItem('admin_user', data.user);
          localStorage.setItem('admin_display_name', data.displayName);
        } else {
          // Not authenticated, redirect to login
          console.log('Not authenticated, redirecting to login');
          router.push('/admin-login');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // On error, redirect to login
        router.push('/admin-login');
      } finally {
        setAuthLoading(false);
      }
    };
    
    verifyAuth();
  }, [router]);

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

  // Click-away handler for dropdown menus
  useEffect(() => {
    const handleClickOutside = () => {
      if ((window as any).openDropdownId) {
        (window as any).openDropdownId = null;
        setBookings([...bookings]);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [bookings]);

  // Calculate and update dashboard statistics when bookings change
  useEffect(() => {
    if (bookings.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Total Projects
      const totalProjects = bookings.length;
      
      // Completed Projects (past dates)
      const completed = bookings.filter(b => parseDateLocal(b.date) < today).length;
      
      // Future Bookings
      const futureBookings = bookings.filter(b => parseDateLocal(b.date) >= today).length;
      
      // Total Revenue
      const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.totalRevenue) || 0), 0);
      
      // DJ Revenue (sum of DJ payouts)
      const djRevenue = bookings.reduce((sum, b) => sum + (Number(b.payout) || 0), 0);
      
      // Revenue by Year
      const revenue2025 = bookings
        .filter(b => parseDateLocal(b.date).getFullYear() === 2025)
        .reduce((sum, b) => sum + (Number(b.totalRevenue) || 0), 0);
      
      const revenue2026 = bookings
        .filter(b => parseDateLocal(b.date).getFullYear() === 2026)
        .reduce((sum, b) => sum + (Number(b.totalRevenue) || 0), 0);
      
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
      if (totalRevenueEl) totalRevenueEl.textContent = `$${(Number(totalRevenue) || 0).toFixed(2)}`;
      if (djRevenueEl) djRevenueEl.textContent = `$${(Number(djRevenue) || 0).toFixed(2)}`;
      if (revenue2025El) revenue2025El.textContent = `$${(Number(revenue2025) || 0).toFixed(2)}`;
      if (revenue2026El) revenue2026El.textContent = `$${(Number(revenue2026) || 0).toFixed(2)}`;
      
      // Update progress bar for completed projects
      if (completedProgressBar) completedProgressBar.style.width = `${completionRate}%`;
      if (completedPercentage) completedPercentage.textContent = `${(Number(completionRate) || 0).toFixed(0)}% completion rate`;
      
      // Update DJ revenue display and bar
      if (djRevenueDisplay) djRevenueDisplay.textContent = `$${(Number(djRevenue) || 0).toFixed(2)} (${(Number(djRevenuePercentage) || 0).toFixed(0)}%)`;
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
    
    // Fetch data when switching to specific tabs
    if (tab === 'pricing') {
      fetchPricingPackages(pricingServiceTab);
    } else if (tab === 'users') {
      fetchUsers();
    } else if (tab === 'reviews') {
      fetchReviews();
    }
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
    const dateStr = formatDateLocal(date);
    const filtered = calendarDJFilter 
      ? bookings.filter(b => b.djUser === calendarDJFilter)
      : bookings;
    
    return filtered.filter(b => {
      // Extract date portion from booking.date string (might be YYYY-MM-DD or ISO format)
      const bookingDateStr = b.date.split('T')[0];
      return bookingDateStr === dateStr;
    });
  };

  const getBlockedDatesForDate = (date: Date) => {
    const dateStr = formatDateLocal(date);
    const filtered = calendarDJFilter
      ? blockedDates.filter(bd => bd.djUser === calendarDJFilter)
      : blockedDates;
    
    return filtered.filter(bd => {
      // Extract date portion from blocked date string
      const blockedDateStr = bd.date.split('T')[0];
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
        setBookings(data.success ? data.data : []);
      } else {
        console.error('Failed to fetch bookings:', response.statusText);
        setBookings([]);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchBlockedDates = async () => {
    setLoadingBlockedDates(true);
    try {
      const response = await fetch('/api/blocked-dates');
      if (response.ok) {
        const data = await response.json();
        setBlockedDates(data.success ? data.data : []);
      } else {
        console.error('Failed to fetch blocked dates:', response.statusText);
        setBlockedDates([]);
      }
    } catch (error) {
      console.error('Failed to fetch blocked dates:', error);
      setBlockedDates([]);
    } finally {
      setLoadingBlockedDates(false);
    }
  };

  // Approve blocked date request
  const approveBlockedDate = async (id: number) => {
    try {
      const response = await fetch(`/api/blocked-dates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        alert('Blocked date approved successfully!');
        fetchBlockedDates();
      } else {
        alert('Failed to approve blocked date');
      }
    } catch (error) {
      console.error('Error approving blocked date:', error);
      alert('Failed to approve blocked date');
    }
  };

  // Reject blocked date request
  const rejectBlockedDate = async (id: number) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      const response = await fetch(`/api/blocked-dates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', reason: reason || '' })
      });

      if (response.ok) {
        alert('Blocked date rejected');
        fetchBlockedDates();
      } else {
        alert('Failed to reject blocked date');
      }
    } catch (error) {
      console.error('Error rejecting blocked date:', error);
      alert('Failed to reject blocked date');
    }
  };

  // Delete blocked date
  const deleteBlockedDate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blocked date request?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blocked-dates/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Blocked date deleted successfully');
        fetchBlockedDates();
      } else {
        alert('Failed to delete blocked date');
      }
    } catch (error) {
      console.error('Error deleting blocked date:', error);
      alert('Failed to delete blocked date');
    }
  };

  // Open project notes modal
  const openNotesModal = (booking: any) => {
    setCurrentEditingBooking(booking);
    setModalNotes(booking.notes || '');
    setNotesModalOpen(true);
    
    // Focus on textarea after a brief delay
    setTimeout(() => {
      const textarea = document.getElementById('project-notes-textarea');
      if (textarea) textarea.focus();
    }, 100);
  };

  // Close project notes modal
  const closeNotesModal = () => {
    setNotesModalOpen(false);
    setCurrentEditingBooking(null);
    setModalNotes('');
  };

  // Save project notes from modal
  const saveNotesFromModal = async () => {
    if (!currentEditingBooking) return;
    
    try {
      const response = await fetch(`/api/bookings/${currentEditingBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: modalNotes })
      });
      
      if (response.ok) {
        // Update local bookings state
        setBookings(prev => prev.map(b => 
          b.id === currentEditingBooking.id ? {...b, notes: modalNotes} : b
        ));
        
        closeNotesModal();
        alert('Project notes saved successfully!');
      } else {
        alert('Failed to save notes. Please try again.');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    }
  };

  // Print/Save Project Notes as PDF
  const printProjectNotesAsPDF = () => {
    if (!currentEditingBooking) return;
    
    const projectName = currentEditingBooking.eventType || 'Project';
    const date = parseDateLocal(currentEditingBooking.date).toLocaleDateString();
    const dj = currentEditingBooking.djUser || 'Unassigned';
    const notes = modalNotes || '';
    
    // Create HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Project Notes - ${projectName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 40px;
            line-height: 1.6;
            color: #333;
        }
        h1 {
            color: #ff6b35;
            border-bottom: 3px solid #ff6b35;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        .info-section {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .info-item {
            margin-bottom: 15px;
        }
        .info-label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 150px;
        }
        .notes-section {
            margin-top: 30px;
        }
        .notes-label {
            font-weight: bold;
            font-size: 1.1rem;
            color: #333;
            margin-bottom: 15px;
        }
        .notes-content {
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            background: #fff;
            border: 2px solid #ddd;
            padding: 20px;
            border-radius: 5px;
            line-height: 1.8;
        }
        @media print {
            body { padding: 20px; }
        }
    </style>
</head>
<body>
    <h1>📋 Project Notes</h1>
    <div class="info-section">
        <div class="info-item">
            <span class="info-label">Project Name:</span>
            <span>${projectName}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Date:</span>
            <span>${date}</span>
        </div>
        <div class="info-item">
            <span class="info-label">DJ:</span>
            <span>${dj}</span>
        </div>
    </div>
    <div class="notes-section">
        <div class="notes-label">Event Details & Notes:</div>
        <div class="notes-content">${notes || '(No notes added yet)'}</div>
    </div>
</body>
</html>`;
    
    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const getDJSummary = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get future bookings with 'upcoming' status
    const futureBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      const isUpcoming = (b as any).status === 'upcoming' || !(b as any).status;
      return bookingDate >= today && isUpcoming;
    });
    
    // Group by DJ
    const djMap = new Map();
    futureBookings.forEach(booking => {
      const dj = booking.djUser || 'Unknown';
      if (!djMap.has(dj)) {
        djMap.set(dj, { name: dj, projects: [], dates: [] });
      }
      djMap.get(dj).projects.push(booking);
      djMap.get(dj).dates.push(new Date(booking.date));
    });
    
    return Array.from(djMap.values()).map(dj => ({
      ...dj,
      projectCount: dj.projects.length,
      dates: dj.dates.sort((a: Date, b: Date) => a.getTime() - b.getTime())
    }));
  };

  // Booking Status Management
  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      // Get the current booking data first
      const bookingResponse = await fetch(`/api/bookings/${bookingId}`);
      if (!bookingResponse.ok) {
        throw new Error('Failed to fetch booking');
      }
      const bookingData = await bookingResponse.json();
      const booking = bookingData.data;

      // Update the booking with new status
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...booking,
          status: newStatus
        })
      });

      if (response.ok) {
        // Refresh bookings list
        await fetchBookings();
        alert(`Booking status updated to ${newStatus}!`);
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
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

  // Open project gallery in lightbox
  const openProjectGallery = (project: any, startIndex: number = 0) => {
    if (!projectPhotos || projectPhotos.length === 0) return;
    
    const imageUrls = projectPhotos.map(photo => photo.photo_url);
    setLightboxImages(imageUrls);
    setLightboxStartIndex(startIndex);
    setLightboxTitle(project.project_name);
    setLightboxOpen(true);
  };

  // Open project in modal view
  const openProjectModal = (project: any) => {
    setModalProject(project);
    setPhotoModalOpen(true);
    if (project) {
      fetchProjectPhotos(project.id);
    }
  };

  // Open video project in modal view
  const openVideoModal = (project: any) => {
    setModalVideoProject(project);
    setVideoModalOpen(true);
    if (project) {
      fetchProjectVideos(project.id);
    }
  };

  // Helper function to check image dimensions
  const checkImageDimensions = (file: File): Promise<{width: number, height: number}> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedProject) return;

    // Validate each file before uploading
    try {
      for (const file of Array.from(files)) {
        // File size validation (10MB max)
        if (file.size > 20 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum file size is 20MB.`);
          return;
        }

        // File type validation
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not a valid image file.`);
          return;
        }

        // Check image dimensions
        const dimensions = await checkImageDimensions(file);
        if (dimensions.width < 1200 || dimensions.height < 800) {
          if (!confirm(`${file.name} is ${dimensions.width}x${dimensions.height}. Recommended minimum is 1200x800px. Upload anyway?`)) {
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error validating images:', error);
      alert('Failed to validate images. Please try again.');
      return;
    }

    setUploadingPhotos(true);
    setUploadProgress(0);
    const totalFiles = files.length;
    let successCount = 0;
    let failCount = 0;
    const filesArray = Array.from(files);

    try {
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        
        try {
          console.log(`Uploading ${i + 1} of ${totalFiles}: ${file.name}`);
          
          // Step 1: Process the image (compress and create thumbnail)
          const processFormData = new FormData();
          processFormData.append('file', file);

          const processResponse = await fetch('/api/photography/process', {
            method: 'POST',
            body: processFormData
          });

          const processResult = await processResponse.json();

          if (!processResult.success) {
            console.error('Failed to process:', processResult.error);
            alert(`Failed to process ${file.name}: ${processResult.error}`);
            failCount++;
            continue;
          }

          const { fullImage, thumbnail, metadata } = processResult;

          // Step 2: Get presigned URLs for direct S3 upload
          const fullImagePresignedResponse = await fetch('/api/photography/presigned-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              fileType: 'image/webp',
              projectId: selectedProject.id.toString(),
              isThumb: false
            })
          });

          const fullImagePresigned = await fullImagePresignedResponse.json();

          if (!fullImagePresigned.success) {
            console.error('Failed to get presigned URL:', fullImagePresigned.error);
            alert(`Failed to get upload URL for ${file.name}`);
            failCount++;
            continue;
          }

          // Step 3: Upload full image directly to S3
          const fullImageBlob = await fetch(`data:image/webp;base64,${fullImage}`).then(r => r.blob());
          const fullUploadResponse = await fetch(fullImagePresigned.presignedUrl, {
            method: 'PUT',
            body: fullImageBlob,
            headers: {
              'Content-Type': 'image/webp'
            }
          });

          if (!fullUploadResponse.ok) {
            console.error('Failed to upload full image to S3:', fullUploadResponse.statusText);
            failCount++;
            continue;
          }

          // Step 4: Get presigned URL for thumbnail
          const thumbnailPresignedResponse = await fetch('/api/photography/presigned-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              fileType: 'image/webp',
              projectId: selectedProject.id.toString(),
              isThumb: true
            })
          });

          const thumbnailPresigned = await thumbnailPresignedResponse.json();

          if (thumbnailPresigned.success) {
            // Step 5: Upload thumbnail directly to S3
            const thumbnailBlob = await fetch(`data:image/webp;base64,${thumbnail}`).then(r => r.blob());
            await fetch(thumbnailPresigned.presignedUrl, {
              method: 'PUT',
              body: thumbnailBlob,
              headers: {
                'Content-Type': 'image/webp'
              }
            });
          }

          // Step 6: Save photo metadata to database
          await fetch('/api/photography/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: selectedProject.id,
              photo_url: fullImagePresigned.publicUrl,
              thumbnail_url: thumbnailPresigned.publicUrl || fullImagePresigned.publicUrl,
              filename: file.name
            })
          });

          successCount++;
          setUploadProgress(Math.round(((successCount + failCount) / totalFiles) * 100));
          
          // No delay needed - direct S3 upload doesn't overwhelm Vercel
          
        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError);
          failCount++;
          setUploadProgress(Math.round(((successCount + failCount) / totalFiles) * 100));
          continue;
        }
      }

      // Show summary
      if (successCount > 0) {
        const message = failCount > 0 
          ? `Successfully uploaded ${successCount} photo(s). ${failCount} failed.`
          : `All ${successCount} photo(s) uploaded successfully!`;
        alert(message);
        await fetchProjectPhotos(selectedProject.id);
        await fetchPhotoProjects();
      } else if (failCount > 0) {
        alert(`All ${failCount} upload(s) failed. Please try again.`);
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
    } else if (activeTab === 'videography') {
      fetchVideoProjects();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectPhotos(selectedProject.id);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedVideoProject) {
      fetchProjectVideos(selectedVideoProject.id);
    }
  }, [selectedVideoProject]);

  useEffect(() => {
    if (activeTab === 'users' && userTab === 'manage') {
      fetchUsers();
    }
  }, [userSearch, userTypeFilter, activeTab, userTab]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [reviewStatusFilter, activeTab]);

  useEffect(() => {
    if (activeTab === 'blocked-dates') {
      fetchBlockedDates();
    }
  }, [blockedDateFilter, activeTab]);

  // Load analytics when analytics tab is active
  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, analyticsTimeRange]);

  // ESC key handler for photo modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && photoModalOpen) {
        setPhotoModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [photoModalOpen]);

  // ESC key handler for video modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && videoModalOpen) {
        setVideoModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [videoModalOpen]);

  // Analytics Functions
  const loadAnalytics = () => {
    try {
      setLoadingAnalytics(true);
      
      // Load analytics data from localStorage
      const rawData = localStorage.getItem('analytics_data');
      if (!rawData) {
        setAnalyticsData({
          visits: [],
          pageViews: [],
          sessions: {},
          uniqueVisitors: []
        });
        setLoadingAnalytics(false);
        return;
      }

      const data = JSON.parse(rawData);
      
      // Convert uniqueVisitors to array if it's an object
      if (data.uniqueVisitors && typeof data.uniqueVisitors === 'object' && !Array.isArray(data.uniqueVisitors)) {
        data.uniqueVisitors = Object.keys(data.uniqueVisitors);
      } else if (!data.uniqueVisitors) {
        data.uniqueVisitors = [];
      }

      // Filter by time range
      const now = new Date();
      const daysAgo = analyticsTimeRange === 'all' ? null : parseInt(analyticsTimeRange);
      
      if (daysAgo) {
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        data.visits = data.visits.filter((v: any) => new Date(v.timestamp) >= cutoffDate);
        data.pageViews = data.pageViews.filter((p: any) => new Date(p.timestamp) >= cutoffDate);
      }

      setAnalyticsData(data);
      
      // Update the display
      setTimeout(() => {
        displayAnalytics(data);
      }, 100);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalyticsData({
        visits: [],
        pageViews: [],
        sessions: {},
        uniqueVisitors: []
      });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const displayAnalytics = (data: any) => {
    try {
      // Calculate metrics
      const totalVisits = data.visits?.length || 0;
      const totalPageViews = data.pageViews?.length || 0;
      const uniqueVisitors = data.uniqueVisitors?.length || 0;
      
      // Calculate average session duration
      const sessions = Object.values(data.sessions || {}) as any[];
      const avgDuration = sessions.length > 0
        ? sessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / sessions.length
        : 0;
      const avgMinutes = Math.round(avgDuration / 60000);

      // Update metric cards
      const totalVisitsEl = document.getElementById('total-visits');
      const totalPageViewsEl = document.getElementById('total-page-views');
      const uniqueVisitorsEl = document.getElementById('unique-visitors');
      const avgSessionEl = document.getElementById('avg-session-duration');

      if (totalVisitsEl) totalVisitsEl.textContent = totalVisits.toLocaleString();
      if (totalPageViewsEl) totalPageViewsEl.textContent = totalPageViews.toLocaleString();
      if (uniqueVisitorsEl) uniqueVisitorsEl.textContent = uniqueVisitors.toLocaleString();
      if (avgSessionEl) avgSessionEl.textContent = `${avgMinutes}m`;

      // Display top pages
      displayTopPages(data);
      
      // Display traffic sources
      displayTrafficSources(data);
      
      // Display device types
      displayDeviceTypes(data);
      
      // Display visits over time chart
      displayVisitsChart(data);
      
      // Display recent activity
      displayRecentActivity(data);
      
    } catch (error) {
      console.error('Error displaying analytics:', error);
    }
  };

  const displayTopPages = (data: any) => {
    const topPagesEl = document.getElementById('top-pages-list');
    if (!topPagesEl) return;

    // Count page views by page
    const pageCounts: { [key: string]: number } = {};
    (data.pageViews || []).forEach((pv: any) => {
      pageCounts[pv.page] = (pageCounts[pv.page] || 0) + 1;
    });

    // Sort and get top 5
    const sortedPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sortedPages.length === 0) {
      topPagesEl.innerHTML = '<div class="analytics-empty-state"><div class="analytics-empty-state-icon">📄</div><div class="analytics-empty-state-text">No page data yet</div></div>';
      return;
    }

    const maxViews = sortedPages[0][1];
    topPagesEl.innerHTML = `
      <div class="analytics-list">
        ${sortedPages.map(([page, count]) => `
          <div class="analytics-list-item">
            <span class="analytics-list-item-label">${page}</span>
            <div class="analytics-list-item-bar">
              <div class="analytics-list-item-bar-fill" style="width: ${(count / maxViews) * 100}%"></div>
            </div>
            <span class="analytics-list-item-value">${count}</span>
          </div>
        `).join('')}
      </div>
    `;
  };

  const displayTrafficSources = (data: any) => {
    const trafficSourcesEl = document.getElementById('traffic-sources-list');
    if (!trafficSourcesEl) return;

    // Count by referrer source
    const sourceCounts: { [key: string]: number } = {};
    (data.visits || []).forEach((v: any) => {
      const source = v.referrerSource || 'Direct';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const sortedSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sortedSources.length === 0) {
      trafficSourcesEl.innerHTML = '<div class="analytics-empty-state"><div class="analytics-empty-state-icon">🌐</div><div class="analytics-empty-state-text">No traffic data yet</div></div>';
      return;
    }

    const maxCount = sortedSources[0][1];
    trafficSourcesEl.innerHTML = `
      <div class="analytics-list">
        ${sortedSources.map(([source, count]) => `
          <div class="analytics-list-item">
            <span class="analytics-list-item-label">${source}</span>
            <div class="analytics-list-item-bar">
              <div class="analytics-list-item-bar-fill" style="width: ${(count / maxCount) * 100}%"></div>
            </div>
            <span class="analytics-list-item-value">${count}</span>
          </div>
        `).join('')}
      </div>
    `;
  };

  const displayDeviceTypes = (data: any) => {
    const deviceTypesEl = document.getElementById('device-types-list');
    if (!deviceTypesEl) return;

    // Count by device type
    const deviceCounts: { [key: string]: number } = {};
    (data.visits || []).forEach((v: any) => {
      const device = v.deviceType || 'Unknown';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    const sortedDevices = Object.entries(deviceCounts)
      .sort((a, b) => b[1] - a[1]);

    if (sortedDevices.length === 0) {
      deviceTypesEl.innerHTML = '<div class="analytics-empty-state"><div class="analytics-empty-state-icon">📱</div><div class="analytics-empty-state-text">No device data yet</div></div>';
      return;
    }

    const maxCount = sortedDevices[0][1];
    deviceTypesEl.innerHTML = `
      <div class="analytics-list">
        ${sortedDevices.map(([device, count]) => `
          <div class="analytics-list-item">
            <span class="analytics-list-item-label">${device}</span>
            <div class="analytics-list-item-bar">
              <div class="analytics-list-item-bar-fill" style="width: ${(count / maxCount) * 100}%"></div>
            </div>
            <span class="analytics-list-item-value">${count}</span>
          </div>
        `).join('')}
      </div>
    `;
  };

  const displayVisitsChart = (data: any) => {
    const chartEl = document.getElementById('visits-chart');
    if (!chartEl) return;

    const visits = data.visits || [];
    if (visits.length === 0) {
      chartEl.innerHTML = '<div class="analytics-empty-state"><div class="analytics-empty-state-icon">📊</div><div class="analytics-empty-state-text">No visit data yet</div></div>';
      return;
    }

    // Group visits by date
    const visitsByDate: { [key: string]: number } = {};
    visits.forEach((v: any) => {
      const date = new Date(v.timestamp).toLocaleDateString();
      visitsByDate[date] = (visitsByDate[date] || 0) + 1;
    });

    // Sort dates and prepare chart data
    const sortedDates = Object.entries(visitsByDate)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-14); // Last 14 days

    if (sortedDates.length === 0) {
      chartEl.innerHTML = '<div class="analytics-empty-state"><div class="analytics-empty-state-icon">📊</div><div class="analytics-empty-state-text">No visit data yet</div></div>';
      return;
    }

    const maxVisits = Math.max(...sortedDates.map(([, count]) => count));
    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Create SVG
    const points = sortedDates.map(([date, count], i) => {
      const x = padding.left + (i / (sortedDates.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - (count / maxVisits) * chartHeight;
      return { x, y, date, count };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaData = `${pathData} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

    chartEl.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" class="line-chart-svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:var(--accent-color);stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:var(--accent-color);stop-opacity:0.05" />
          </linearGradient>
        </defs>
        
        <!-- Grid lines -->
        ${Array.from({ length: 5 }, (_, i) => {
          const y = padding.top + (i * chartHeight / 4);
          return `<line class="line-chart-grid" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" />`;
        }).join('')}
        
        <!-- Area -->
        <path class="line-chart-area" d="${areaData}" />
        
        <!-- Line -->
        <path class="line-chart-line" d="${pathData}" />
        
        <!-- Points -->
        ${points.map(p => `
          <circle class="line-chart-point" cx="${p.x}" cy="${p.y}" r="5">
            <title>${p.date}: ${p.count} visits</title>
          </circle>
        `).join('')}
        
        <!-- Y-axis labels -->
        ${Array.from({ length: 5 }, (_, i) => {
          const value = Math.round((maxVisits * (4 - i)) / 4);
          const y = padding.top + (i * chartHeight / 4);
          return `<text class="line-chart-label" x="${padding.left - 10}" y="${y + 5}" text-anchor="end">${value}</text>`;
        }).join('')}
        
        <!-- X-axis labels (every other date) -->
        ${points.filter((_, i) => i % Math.ceil(points.length / 7) === 0).map(p => `
          <text class="line-chart-label" x="${p.x}" y="${height - padding.bottom + 25}" text-anchor="middle" transform="rotate(-45 ${p.x} ${height - padding.bottom + 25})">${p.date.split('/').slice(0, 2).join('/')}</text>
        `).join('')}
      </svg>
    `;
  };

  const displayRecentActivity = (data: any) => {
    const activityEl = document.getElementById('recent-activity-list');
    if (!activityEl) return;

    const visits = (data.visits || []).slice(-20).reverse();
    
    if (visits.length === 0) {
      activityEl.innerHTML = '<div class="analytics-empty-state"><div class="analytics-empty-state-icon">📝</div><div class="analytics-empty-state-text">No activity yet</div></div>';
      return;
    }

    activityEl.innerHTML = `
      <div class="activity-timeline">
        ${visits.map((v: any) => {
          const time = new Date(v.timestamp);
          const timeStr = time.toLocaleString();
          return `
            <div class="activity-timeline-item">
              <div class="activity-timeline-content">
                Visitor from <strong>${v.referrerSource || 'Direct'}</strong> viewed <strong>${v.page}</strong>
              </div>
              <div class="activity-timeline-meta">
                <span>🕐 ${timeStr}</span>
                <span>📱 ${v.deviceType || 'Unknown'}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  const clearAnalyticsData = () => {
    if (!confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
      return;
    }

    try {
      localStorage.removeItem('analytics_data');
      setAnalyticsData({
        visits: [],
        pageViews: [],
        sessions: {},
        uniqueVisitors: []
      });
      loadAnalytics();
      alert('Analytics data cleared successfully!');
    } catch (error) {
      console.error('Error clearing analytics:', error);
      alert('Failed to clear analytics data');
    }
  };

  // Videography Management Functions
  const fetchVideoProjects = async () => {
    try {
      setLoadingVideoProjects(true);
      const response = await fetch('/api/videography/projects');
      if (response.ok) {
        const result = await response.json();
        setVideoProjects(result.data || []);
      } else {
        console.error('Failed to fetch videography projects');
      }
    } catch (error) {
      console.error('Error fetching videography projects:', error);
    } finally {
      setLoadingVideoProjects(false);
    }
  };

  const fetchProjectVideos = async (projectId: number) => {
    try {
      setLoadingVideos(true);
      const response = await fetch(`/api/videography/videos?project_id=${projectId}`);
      if (response.ok) {
        const result = await response.json();
        setProjectVideos(result.data || []);
      } else {
        console.error('Failed to fetch project videos');
      }
    } catch (error) {
      console.error('Error fetching project videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const createVideoProject = async () => {
    if (!newVideoProjectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    try {
      const response = await fetch('/api/videography/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: newVideoProjectName,
          description: newVideoProjectDescription
        })
      });

      if (response.ok) {
        const result = await response.json();
        setNewVideoProjectName('');
        setNewVideoProjectDescription('');
        setShowVideoProjectForm(false);
        await fetchVideoProjects();
        setSelectedVideoProject(result.data);
      } else {
        const error = await response.json();
        alert(`Failed to create project: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  const addVideo = async () => {
    if (!newVideoUrl.trim()) {
      alert('Please enter a YouTube URL');
      return;
    }

    if (!selectedVideoProject) {
      alert('Please select a project first');
      return;
    }

    try {
      const response = await fetch('/api/videography/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedVideoProject.id,
          video_url: newVideoUrl,
          title: newVideoTitle || null
        })
      });

      if (response.ok) {
        setNewVideoUrl('');
        setNewVideoTitle('');
        await fetchProjectVideos(selectedVideoProject.id);
        await fetchVideoProjects();
        alert('Video added successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to add video: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Failed to add video');
    }
  };

  const deleteVideo = async (videoId: number) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const response = await fetch(`/api/videography/videos?id=${videoId}`, {
        method: 'DELETE'
      });

      if (response.ok && selectedVideoProject) {
        await fetchProjectVideos(selectedVideoProject.id);
        await fetchVideoProjects();
      } else {
        alert('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  const deleteVideoProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this video project? All videos will be removed.')) {
      return;
    }

    try {
      const response = await fetch(`/api/videography/projects?id=${projectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (selectedVideoProject?.id === projectId) {
          setSelectedVideoProject(null);
          setProjectVideos([]);
        }
        await fetchVideoProjects();
      } else {
        alert('Failed to delete video project');
      }
    } catch (error) {
      console.error('Error deleting video project:', error);
      alert('Failed to delete video project');
    }
  };

  // Pricing Management Functions
  const fetchPricingPackages = async (serviceType: 'photography' | 'videography' | 'dj') => {
    setLoadingPricing(true);
    try {
      const response = await fetch(`/api/pricing/packages?service_type=${serviceType}`);
      const data = await response.json();
      if (data.success) {
        setPricingPackages(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pricing packages:', error);
    } finally {
      setLoadingPricing(false);
    }
  };

  const createOrUpdatePackage = async () => {
    if (!packageForm.package_name || !packageForm.price) {
      alert('Please fill in package name and price');
      return;
    }

    setSavingPackage(true);
    setSaveSuccess(false);

    try {
      const payload = {
        ...packageForm,
        service_type: pricingServiceTab,
        features: packageForm.features,
        ...(editingPackage && { id: editingPackage.id })
      };

      const response = await fetch('/api/pricing/packages', {
        method: editingPackage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSaveSuccess(true);
        setShowPackageForm(false);
        setEditingPackage(null);
        setPackageForm({
          package_name: '',
          price: '',
          description: '',
          features: [],
          display_order: 0
        });
        await fetchPricingPackages(pricingServiceTab);
        
        // Show success message briefly
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert(`Failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Failed to save package');
    } finally {
      setSavingPackage(false);
    }
  };

  const editPackage = (pkg: any) => {
    setEditingPackage(pkg);
    setPackageForm({
      package_name: pkg.package_name,
      price: pkg.price.toString(),
      description: pkg.description || '',
      features: Array.isArray(pkg.features) ? pkg.features : [],
      display_order: pkg.display_order || 0
    });
    setShowPackageForm(true);
  };

  const deletePackage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this package?')) {
      return;
    }

    try {
      const response = await fetch(`/api/pricing/packages?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Package deleted!');
        await fetchPricingPackages(pricingServiceTab);
      } else {
        alert('Failed to delete package');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package');
    }
  };

  const addFeatureToForm = () => {
    if (newFeature.trim()) {
      setPackageForm({
        ...packageForm,
        features: [...packageForm.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeatureFromForm = (index: number) => {
    setPackageForm({
      ...packageForm,
      features: packageForm.features.filter((_, i) => i !== index)
    });
  };

  // User Management Functions
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      if (userTypeFilter) params.append('type', userTypeFilter);
      
      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const createUser = async (formData: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('User created successfully!');
        await fetchUsers();
        return true;
      } else {
        alert(`Failed to create user: ${data.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
      return false;
    }
  };

  const updateUser = async (formData: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('User updated successfully!');
        await fetchUsers();
        setEditingUser(null);
        return true;
      } else {
        alert(`Failed to update user: ${data.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
      return false;
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('User deleted successfully!');
        await fetchUsers();
      } else {
        alert(`Failed to delete user: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = {
      first_name: (form.querySelector('#new-firstname') as HTMLInputElement).value,
      last_name: (form.querySelector('#new-lastname') as HTMLInputElement).value,
      username: (form.querySelector('#new-username') as HTMLInputElement).value,
      email: (form.querySelector('#new-email') as HTMLInputElement).value,
      phone: (form.querySelector('#new-phone') as HTMLInputElement).value,
      user_type: (form.querySelector('#new-user-type') as HTMLSelectElement).value,
      password: (form.querySelector('#new-password') as HTMLInputElement).value
    };

    if (editingUser) {
      // Update existing user
      const success = await updateUser({
        id: editingUser.id,
        ...formData,
        ...(formData.password ? {} : { password: undefined }) // Don't send password if empty
      });
      
      if (success) {
        form.reset();
      }
    } else {
      // Create new user
      if (!formData.password) {
        alert('Password is required for new users');
        return;
      }
      
      const success = await createUser(formData);
      if (success) {
        form.reset();
      }
    }
  };

  const startEditUser = (user: any) => {
    setEditingUser(user);
    setUserTab('create');
    
    // Populate form
    setTimeout(() => {
      (document.querySelector('#new-firstname') as HTMLInputElement).value = user.first_name;
      (document.querySelector('#new-lastname') as HTMLInputElement).value = user.last_name;
      (document.querySelector('#new-username') as HTMLInputElement).value = user.username;
      (document.querySelector('#new-email') as HTMLInputElement).value = user.email;
      (document.querySelector('#new-phone') as HTMLInputElement).value = user.phone || '';
      (document.querySelector('#new-user-type') as HTMLSelectElement).value = user.user_type;
      (document.querySelector('#new-password') as HTMLInputElement).value = '';
      
      // Update form title
      const titleEl = document.querySelector('#user-form-title');
      if (titleEl) {
        titleEl.textContent = 'Edit User';
      }
      
      // Update button text
      const buttonEl = document.querySelector('#submit-user-button');
      if (buttonEl) {
        buttonEl.textContent = '💾 Save Changes';
      }
      
      // Show cancel button
      const cancelBtn = document.querySelector('#cancel-edit-button') as HTMLElement;
      if (cancelBtn) {
        cancelBtn.style.display = 'block';
      }
    }, 100);
  };

  const cancelEditUser = () => {
    setEditingUser(null);
    
    // Reset form
    const form = document.querySelector('#create-user-form') as HTMLFormElement;
    if (form) {
      form.reset();
    }
    
    // Update form title
    const titleEl = document.querySelector('#user-form-title');
    if (titleEl) {
      titleEl.textContent = 'Create New User';
    }
    
    // Update button text
    const buttonEl = document.querySelector('#submit-user-button');
    if (buttonEl) {
      buttonEl.textContent = 'Create User';
    }
    
    // Hide cancel button
    const cancelBtn = document.querySelector('#cancel-edit-button') as HTMLElement;
    if (cancelBtn) {
      cancelBtn.style.display = 'none';
    }
  };

  // Reviews Management Functions
  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const params = new URLSearchParams();
      if (reviewStatusFilter) params.append('status', reviewStatusFilter);
      
      const response = await fetch(`/api/reviews?${params.toString()}`);
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

  const approveReview = async (reviewId: number) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, status: 'approved' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Review approved successfully!');
        await fetchReviews();
      } else {
        alert(`Failed to approve review: ${data.error}`);
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Failed to approve review');
    }
  };

  const rejectReview = async (reviewId: number) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, status: 'rejected' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Review rejected successfully!');
        await fetchReviews();
      } else {
        alert(`Failed to reject review: ${data.error}`);
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Failed to reject review');
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews?id=${reviewId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Review deleted successfully!');
        await fetchReviews();
      } else {
        alert(`Failed to delete review: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

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

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f8f8f8'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #ff6b35',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

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
            className={`sidebar-nav-link ${activeTab === 'photography' ? 'active' : ''}`}
            onClick={() => switchTab('photography')}
          >
            <span className="nav-icon">📸</span>
            <span>Photography</span>
          </a>
          <a 
            className={`sidebar-nav-link ${activeTab === 'videography' ? 'active' : ''}`}
            onClick={() => switchTab('videography')}
          >
            <span className="nav-icon">📹</span>
            <span>Videography</span>
          </a>
          <a 
            className={`sidebar-nav-link ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => switchTab('pricing')}
          >
            <span className="nav-icon">💰</span>
            <span>Pricing</span>
          </a>
          <a
            className={`sidebar-nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => switchTab('reviews')}
          >
            <span className="nav-icon">⭐</span>
            <span>Reviews</span>
          </a>
          <a
            className={`sidebar-nav-link ${activeTab === 'blocked-dates' ? 'active' : ''}`}
            onClick={() => switchTab('blocked-dates')}
          >
            <span className="nav-icon">🚫</span>
            <span>Blocked Dates</span>
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
            <h1>Welcome back, Admin <span style={{fontSize: '0.7em', color: '#10b981'}}>v2.0</span></h1>
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
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '1rem',
                marginTop: '1rem'
              }}>
                {getDJSummary().map(dj => (
                  <div
                    key={dj.name}
                    onClick={() => setSelectedDJFilter(dj.name === selectedDJFilter ? '' : dj.name)}
                    style={{
                      padding: '1.25rem',
                      background: selectedDJFilter === dj.name ? '#e8f4ff' : '#f8f9fa',
                      border: selectedDJFilter === dj.name ? '2px solid #3b82f6' : '1px solid #e0e0e0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedDJFilter !== dj.name) {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDJFilter !== dj.name) {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{dj.name}</h3>
                      <span style={{
                        background: selectedDJFilter === dj.name ? '#3b82f6' : '#6b7280',
                        color: 'white',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        {dj.projectCount} {dj.projectCount === 1 ? 'project' : 'projects'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
                      <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Upcoming Dates:</div>
                      {dj.dates.slice(0, 4).map((date: Date, idx: number) => (
                        <div key={idx} style={{ paddingLeft: '0.5rem', marginBottom: '0.25rem' }}>
                          • {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      ))}
                      {dj.dates.length > 4 && (
                        <div style={{ paddingLeft: '0.5rem', color: '#3b82f6', fontStyle: 'italic' }}>
                          +{dj.dates.length - 4} more...
                        </div>
                      )}
                    </div>
                    {selectedDJFilter === dj.name && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        color: '#3b82f6',
                        fontSize: '1.25rem',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                ))}
                {getDJSummary().length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                    No upcoming DJ projects scheduled
                  </div>
                )}
              </div>
            </div>

            {/* All DJs Upcoming Projects Table */}
            <div className="section-card" style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0 }}>All DJs Upcoming Projects</h2>
                  <p style={{ color: 'var(--text-light)', margin: '0.5rem 0 0 0' }}>
                    {selectedDJFilter 
                      ? `Showing future bookings for ${selectedDJFilter}` 
                      : 'Showing all future bookings across all DJs'}
                  </p>
                </div>
                {selectedDJFilter && (
                  <button
                    onClick={() => setSelectedDJFilter('')}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="bookings-table" style={{ width: '100%', minWidth: '1100px' }}>
                  <thead>
                    <tr>
                      <th onClick={() => handleUpcomingSort('date')} style={{ cursor: 'pointer' }}>
                        Date <SortIndicator active={upcomingSortField === 'date'} direction={upcomingSortDirection} />
                      </th>
                      <th onClick={() => handleUpcomingSort('dj')} style={{ cursor: 'pointer' }}>
                        DJ <SortIndicator active={upcomingSortField === 'dj'} direction={upcomingSortDirection} />
                      </th>
                      <th>Project</th>
                      <th>Location</th>
                      <th onClick={() => handleUpcomingSort('revenue')} style={{ cursor: 'pointer' }}>
                        Revenue <SortIndicator active={upcomingSortField === 'revenue'} direction={upcomingSortDirection} />
                      </th>
                      <th>DJ Payout</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingBookings ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                          Loading upcoming projects...
                        </td>
                      </tr>
                    ) : (
                      (() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const upcomingBookings = bookings
                          .filter(b => {
                            const bookingDate = parseDateLocal(b.date);
                            const isUpcoming = (b as any).status === 'upcoming' || !(b as any).status;
                            return bookingDate >= today && isUpcoming;
                          })
                          .filter(b => !selectedDJFilter || b.djUser === selectedDJFilter)
                          .sort((a, b) => {
                            let comparison = 0;
                            if (upcomingSortField === 'date') {
                              comparison = parseDateLocal(a.date).getTime() - parseDateLocal(b.date).getTime();
                            } else if (upcomingSortField === 'dj') {
                              comparison = (a.djUser || '').localeCompare(b.djUser || '');
                            } else if (upcomingSortField === 'revenue') {
                              comparison = (a.totalRevenue || 0) - (b.totalRevenue || 0);
                            }
                            return upcomingSortDirection === 'asc' ? comparison : -comparison;
                          });
                        
                        return upcomingBookings.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                              No upcoming projects scheduled
                            </td>
                          </tr>
                        ) : (
                          upcomingBookings.map(booking => {
                            const bookingStatus = (booking as any).status || 'upcoming';
                            return (
                              <tr key={booking.id}>
                                <td>{parseDateLocal(booking.date).toLocaleDateString()}</td>
                                <td>{booking.djUser || 'N/A'}</td>
                                <td>{booking.eventType || 'N/A'}</td>
                                <td>{booking.location || 'N/A'}</td>
                                <td>${(Number(booking.totalRevenue) || 0).toFixed(2)}</td>
                                <td>${(Number(booking.payout) || 0).toFixed(2)}</td>
                                <td>
                                  <span className={`status-badge ${bookingStatus}`}>
                                    {bookingStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        );
                      })()
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Two-Column Content Layout */}
            <div className="content-grid-modern">
              {/* Left Column - Recent Projects */}
              <div className="content-section">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Recent Projects</h2>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={toggleRecentSort}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {recentSortDirection === 'desc' ? '↓ Newest First' : '↑ Oldest First'}
                    </button>
                    <a href="#" onClick={(e) => { e.preventDefault(); switchTab('bookings'); }} className="view-all-link">View all</a>
                  </div>
                </div>
                <div className="orders-list-modern">
                  {loadingBookings ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      Loading recent projects...
                    </div>
                  ) : (
                    (() => {
                      // Get completed bookings, sorted by date, limited to 10
                      const completedBookings = bookings
                        .filter(b => (b as any).status === 'completed')
                        .sort((a, b) => {
                          const comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
                          return recentSortDirection === 'desc' ? comparison : -comparison;
                        })
                        .slice(0, 10);
                      
                      return completedBookings.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                          No completed projects yet
                        </div>
                      ) : (
                        completedBookings.map(booking => (
                          <div key={booking.id} className="order-item">
                            <div className="order-info">
                              <div className="order-number">
                                #{booking.id} - {booking.djUser || 'N/A'}
                              </div>
                              <div className="order-email">
                                {booking.eventType || 'N/A'} • {parseDateLocal(booking.date).toLocaleDateString()}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                                {booking.clientName || 'N/A'} • {booking.location || 'N/A'}
                              </div>
                            </div>
                            <div className="order-price">${(Number(booking.totalRevenue) || 0).toFixed(2)}</div>
                            <span className="status-badge completed">completed</span>
                          </div>
                        ))
                      );
                    })()
                  )}
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
                  value={analyticsFilterDJ}
                  onChange={(e) => setAnalyticsFilterDJ(e.target.value)}
                  style={{ padding: '0.5rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                >
                  <option value="">All DJs</option>
                  {Array.from(new Set(bookings.map(b => b.djUser).filter(Boolean))).sort().map(dj => (
                    <option key={dj} value={dj}>{dj}</option>
                  ))}
                </select>
                <select 
                  id="booking-filter-time"
                  value={analyticsFilterTime}
                  onChange={(e) => setAnalyticsFilterTime(e.target.value)}
                  style={{ padding: '0.5rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                >
                  <option value="">All Time Periods</option>
                  <option value="past">Past/Now</option>
                  <option value="future">Looking Forward</option>
                </select>
                <select 
                  id="booking-filter-year"
                  value={analyticsFilterYear}
                  onChange={(e) => setAnalyticsFilterYear(e.target.value)}
                  style={{ padding: '0.5rem', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                >
                  <option value="">All Years</option>
                  {Array.from(new Set(bookings.map(b => new Date(b.date).getFullYear()))).sort((a, b) => b - a).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  value={analyticsFilterStatus}
                  onChange={(e) => setAnalyticsFilterStatus(e.target.value)}
                  style={{
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="active">Active Only</option>
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed Only</option>
                  <option value="cancelled">Cancelled Only</option>
                  <option value="upcoming">Upcoming Only</option>
                </select>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table className="bookings-table" style={{ tableLayout: 'auto', width: '100%', minWidth: '900px' }}>
                  <thead>
                    <tr>
                      <th 
                        onClick={() => handleAnalyticsSort('date')}
                        style={{ cursor: 'pointer' }}
                      >
                        Date <SortIndicator active={analyticsSortField === 'date'} direction={analyticsSortDirection} />
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
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="all-bookings-container">
                    {loadingBookings ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                          Loading bookings...
                        </td>
                      </tr>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                          No bookings found. Import a CSV file to add bookings.
                        </td>
                      </tr>
                    ) : (
                      (() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        // Filter bookings based on analytics filters
                        let filteredBookings = bookings.filter(booking => {
                          // DJ Filter
                          if (analyticsFilterDJ && booking.djUser !== analyticsFilterDJ) {
                            return false;
                          }
                          
                          // Time Period Filter
                          if (analyticsFilterTime) {
                            const bookingDate = parseDateLocal(booking.date);
                            bookingDate.setHours(0, 0, 0, 0);
                            
                            if (analyticsFilterTime === 'future' && bookingDate < today) {
                              return false;
                            }
                            if (analyticsFilterTime === 'past' && bookingDate >= today) {
                              return false;
                            }
                          }
                          
                          // Year Filter
                          if (analyticsFilterYear) {
                            const bookingYear = parseDateLocal(booking.date).getFullYear();
                            if (bookingYear !== parseInt(analyticsFilterYear)) {
                              return false;
                            }
                          }
                          
                          // Status Filter
                          if (analyticsFilterStatus !== 'all') {
                            const bookingStatus = (booking as any).status || 'upcoming';
                            
                            if (analyticsFilterStatus === 'active') {
                              // Active = upcoming projects (not completed or cancelled)
                              if (bookingStatus === 'completed' || bookingStatus === 'cancelled') {
                                return false;
                              }
                            } else if (analyticsFilterStatus !== bookingStatus) {
                              return false;
                            }
                          }
                          
                          return true;
                        });
                        
                        // Sort filtered bookings based on analytics sort state
                        const sortedBookings = [...filteredBookings].sort((a, b) => {
                          let comparison = 0;
                          if (analyticsSortField === 'date') {
                            comparison = parseDateLocal(a.date).getTime() - parseDateLocal(b.date).getTime();
                          } else if (analyticsSortField === 'dj') {
                            comparison = (a.djUser || '').localeCompare(b.djUser || '');
                          } else if (analyticsSortField === 'project') {
                            comparison = (a.eventType || '').localeCompare(b.eventType || '');
                          }
                          return analyticsSortDirection === 'asc' ? comparison : -comparison;
                        });
                        
                        return sortedBookings.map((booking) => {
                          const bookingStatus = (booking as any).status || 'upcoming';
                          return (
                          <tr key={booking.id}>
                            <td>{parseDateLocal(booking.date).toLocaleDateString()}</td>
                            <td>{booking.djUser || 'N/A'}</td>
                            <td>{booking.eventType || 'N/A'}</td>
                            <td>{booking.location || 'N/A'}</td>
                            <td>${(Number(booking.totalRevenue) || 0).toFixed(2)}</td>
                            <td>${(Number(booking.ccPayment) || 0).toFixed(2)}</td>
                            <td>${(Number(booking.payout) || 0).toFixed(2)}</td>
                            <td>
                              <span 
                                className={`status-badge status-${bookingStatus}`}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  display: 'inline-block',
                                  ...(bookingStatus === 'completed' && {
                                    background: '#dcfce7',
                                    color: '#166534',
                                    border: '1px solid #86efac'
                                  }),
                                  ...(bookingStatus === 'cancelled' && {
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    border: '1px solid #fca5a5'
                                  }),
                                  ...(bookingStatus === 'upcoming' && {
                                    background: '#dbeafe',
                                    color: '#1e40af',
                                    border: '1px solid #93c5fd'
                                  })
                                }}
                              >
                                {bookingStatus}
                              </span>
                            </td>
                            <td>
                              <div style={{ position: 'relative' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentOpenId = (window as any).openDropdownId;
                                    if (currentOpenId === booking.id) {
                                      (window as any).openDropdownId = null;
                                    } else {
                                      (window as any).openDropdownId = booking.id;
                                    }
                                    // Force re-render by triggering state update
                                    setBookings([...bookings]);
                                  }}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: '#f3f4f6',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: '500'
                                  }}
                                  title="Actions"
                                >
                                  Actions
                                  <span style={{ fontSize: '0.7rem' }}>▼</span>
                                </button>
                                
                                {(window as any).openDropdownId === booking.id && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      top: '100%',
                                      right: 0,
                                      marginTop: '0.25rem',
                                      background: 'white',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '8px',
                                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                      minWidth: '160px',
                                      zIndex: 1000,
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateBookingStatus(booking.id, 'completed');
                                        (window as any).openDropdownId = null;
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      <span style={{ color: '#10b981' }}>✓</span> Mark Complete
                                    </button>
                                    
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateBookingStatus(booking.id, 'cancelled');
                                        (window as any).openDropdownId = null;
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      <span style={{ color: '#ef4444' }}>✕</span> Cancel Project
                                    </button>
                                    
                                    <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.25rem 0' }} />
                                    
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openNotesModal(booking);
                                        (window as any).openDropdownId = null;
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      {booking.notes ? '📝 Edit Notes' : '📝 Add Notes'}
                                    </button>
                                    
                                    <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.25rem 0' }} />
                                    
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to delete this booking?')) {
                                          console.log('Delete booking:', booking.id);
                                        }
                                        (window as any).openDropdownId = null;
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#ef4444'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                          );
                        });
                      })()
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Project Notes Modal */}
          {notesModalOpen && (
            <div 
              style={{ 
                display: 'flex', 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                background: 'rgba(0, 0, 0, 0.5)', 
                zIndex: 10000, 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflowY: 'auto' 
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeNotesModal();
                }
              }}
            >
              <div 
                style={{ 
                  background: 'white', 
                  borderRadius: '10px', 
                  padding: '2rem', 
                  maxWidth: '900px', 
                  width: '90%', 
                  maxHeight: '90vh', 
                  margin: '2rem auto', 
                  position: 'relative', 
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)', 
                  overflowY: 'auto' 
                }}
              >
                <button
                  onClick={closeNotesModal}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--text-light)',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                >
                  &times;
                </button>
                
                <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem', paddingRight: '3rem' }}>
                  Project Notes
                </h2>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                      Project Name:
                    </div>
                    <div style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                      {currentEditingBooking?.eventType || 'N/A'}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                      Date:
                    </div>
                    <div>
                      {currentEditingBooking?.date ? parseDateLocal(currentEditingBooking.date).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                      DJ:
                    </div>
                    <div>
                      {currentEditingBooking?.djUser || 'Unassigned'}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label 
                      htmlFor="project-notes-textarea" 
                      style={{ 
                        display: 'block', 
                        fontWeight: 600, 
                        color: 'var(--text-dark)', 
                        marginBottom: '0.5rem' 
                      }}
                    >
                      Event Details & Notes:
                    </label>
                    <textarea
                      id="project-notes-textarea"
                      rows={20}
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '5px',
                        fontSize: '1rem',
                        fontFamily: "'Courier New', monospace",
                        resize: 'vertical',
                        lineHeight: '1.6'
                      }}
                      placeholder="Enter detailed event notes, wedding details, ceremony information, reception plans, song requests, special instructions, etc."
                    />
                    <small style={{ display: 'block', color: 'var(--text-light)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                      These notes will be visible to the assigned DJ in their dashboard.
                    </small>
                  </div>
                </div>
                
                <div 
                  style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    justifyContent: 'flex-end', 
                    borderTop: '1px solid #e0e0e0', 
                    paddingTop: '1.5rem' 
                  }}
                >
                  <button
                    onClick={closeNotesModal}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'var(--text-light)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={printProjectNotesAsPDF}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'var(--info-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    📄 Print/Save as PDF
                  </button>
                  <button
                    onClick={saveNotesFromModal}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'var(--accent-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}

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
                      const hasEvents = dayBookings.length > 0 || dayBlockedDates.length > 0;
                      const totalUnavailable = dayBookings.length + dayBlockedDates.length;
                      
                      return (
                        <div 
                          key={`${weekIndex}-${dayIndex}`}
                          className={`calendar-day ${!isCurrentMonthDate ? 'other-month' : ''} ${isTodayDate ? 'today' : ''} ${hasEvents ? 'has-events' : ''}`}
                          onClick={() => setSelectedDate(day)}
                          style={{
                            background: hasEvents ? '#ffebee' : 'white',
                            borderColor: hasEvents ? '#f44336' : '#e0e0e0',
                            cursor: 'pointer'
                          }}
                          title={hasEvents
                            ? `${dayBookings.length} booking(s), ${dayBlockedDates.length} blocked`
                            : 'Available'}
                        >
                          <div className="day-number" style={{ fontWeight: hasEvents ? '700' : '500' }}>
                            {day.getDate()}
                          </div>
                          {hasEvents && (
                            <div style={{
                              background: '#f44336',
                              color: 'white',
                              borderRadius: '12px',
                              padding: '2px 8px',
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              marginTop: '4px',
                              display: 'inline-block'
                            }}>
                              🔴 {totalUnavailable} Booked
                            </div>
                          )}
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
                        📅 {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                      
                      // Get all DJs from users and determine availability
                      const allDJs = users.filter((u: any) => u.user_type === 'dj');
                      const unavailableDJs = new Set<string>();
                      
                      dayBookings.forEach((b: any) => {
                        if (b.djUser) unavailableDJs.add(b.djUser.toLowerCase());
                      });
                      dayBlockedDates.forEach((bd: any) => {
                        if (bd.djUser) unavailableDJs.add(bd.djUser.toLowerCase());
                      });
                      
                      const availableDJs = allDJs.filter((dj: any) => 
                        !unavailableDJs.has(dj.username.toLowerCase())
                      );
                      
                      return (
                        <>
                          {/* Unavailable DJs Section */}
                          {(dayBookings.length > 0 || dayBlockedDates.length > 0) && (
                            <div style={{ marginBottom: '1.5rem' }}>
                              <h5 style={{ 
                                marginBottom: '0.75rem', 
                                padding: '0.5rem', 
                                background: '#ffebee', 
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                ❌ UNAVAILABLE DJs ({dayBookings.length + dayBlockedDates.length})
                              </h5>
                              
                              {dayBookings.map((booking, i) => (
                                <div key={`booking-${i}`} style={{ 
                                  padding: '1rem', 
                                  background: 'white', 
                                  borderRadius: '8px', 
                                  marginBottom: '0.75rem', 
                                  borderLeft: '4px solid #f44336',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>🎵</span>
                                    <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>DJ {booking.djUser}</span>
                                  </div>
                                  <div style={{ fontSize: '0.95rem', marginLeft: '1.75rem' }}>
                                    <div style={{ marginBottom: '0.25rem' }}>
                                      <strong>Booked:</strong> {booking.eventType}
                                    </div>
                                    <div style={{ color: 'var(--text-light)', marginBottom: '0.25rem' }}>
                                      <strong>Client:</strong> {booking.clientName || 'N/A'}
                                    </div>
                                    <div style={{ color: 'var(--text-light)' }}>
                                      <strong>Location:</strong> {booking.location}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {dayBlockedDates.map((blocked, i) => (
                                <div key={`blocked-${i}`} style={{ 
                                  padding: '1rem', 
                                  background: 'white', 
                                  borderRadius: '8px', 
                                  marginBottom: '0.75rem', 
                                  borderLeft: '4px solid #ff9800',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>🎵</span>
                                    <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>DJ {blocked.djUser}</span>
                                  </div>
                                  <div style={{ fontSize: '0.95rem', marginLeft: '1.75rem' }}>
                                    <div style={{ color: 'var(--text-light)' }}>
                                      <strong>Blocked:</strong> {blocked.reason || 'Personal Time Off'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Available DJs Section */}
                          <div>
                            <h5 style={{ 
                              marginBottom: '0.75rem', 
                              padding: '0.5rem', 
                              background: '#e8f5e9', 
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              ✅ AVAILABLE DJs ({availableDJs.length})
                            </h5>
                            
                            {availableDJs.length > 0 ? (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                {availableDJs.map((dj: any) => (
                                  <div key={dj.id} style={{ 
                                    padding: '0.75rem', 
                                    background: 'white', 
                                    borderRadius: '8px', 
                                    borderLeft: '4px solid #4caf50',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                  }}>
                                    <span style={{ fontSize: '1.25rem' }}>🎵</span>
                                    <span style={{ fontWeight: '600' }}>DJ {dj.first_name} {dj.last_name}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ 
                                padding: '1rem', 
                                background: 'white', 
                                borderRadius: '8px', 
                                textAlign: 'center',
                                color: 'var(--text-light)'
                              }}>
                                All DJs are unavailable on this date
                              </div>
                            )}
                          </div>
                          
                          {dayBookings.length === 0 && dayBlockedDates.length === 0 && (
                            <p style={{ 
                              color: '#4caf50', 
                              textAlign: 'center', 
                              padding: '1rem',
                              background: '#e8f5e9',
                              borderRadius: '8px',
                              fontWeight: '600'
                            }}>
                              ✅ All DJs available - No bookings or blocked dates for this day
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

          {/* Pricing Tab */}
          <div id="pricing-tab" className={`tab-content ${activeTab === 'pricing' ? 'active' : ''}`}>
            <div className="section-card" style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Pricing Package Manager</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
                Manage pricing packages for all your services. Update prices, features, and descriptions without editing code.
              </p>

              {/* Service Type Tabs */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
                <button
                  onClick={() => {
                    setPricingServiceTab('photography');
                    fetchPricingPackages('photography');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: pricingServiceTab === 'photography' ? 'var(--primary-color)' : 'transparent',
                    color: pricingServiceTab === 'photography' ? 'white' : 'var(--text-color)',
                    border: 'none',
                    borderBottom: pricingServiceTab === 'photography' ? '3px solid var(--primary-color)' : 'none',
                    cursor: 'pointer',
                    fontWeight: pricingServiceTab === 'photography' ? 'bold' : 'normal'
                  }}
                >
                  📸 Photography
                </button>
                <button
                  onClick={() => {
                    setPricingServiceTab('videography');
                    fetchPricingPackages('videography');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: pricingServiceTab === 'videography' ? 'var(--primary-color)' : 'transparent',
                    color: pricingServiceTab === 'videography' ? 'white' : 'var(--text-color)',
                    border: 'none',
                    borderBottom: pricingServiceTab === 'videography' ? '3px solid var(--primary-color)' : 'none',
                    cursor: 'pointer',
                    fontWeight: pricingServiceTab === 'videography' ? 'bold' : 'normal'
                  }}
                >
                  📹 Videography
                </button>
                <button
                  onClick={() => {
                    setPricingServiceTab('dj');
                    fetchPricingPackages('dj');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: pricingServiceTab === 'dj' ? 'var(--primary-color)' : 'transparent',
                    color: pricingServiceTab === 'dj' ? 'white' : 'var(--text-color)',
                    border: 'none',
                    borderBottom: pricingServiceTab === 'dj' ? '3px solid var(--primary-color)' : 'none',
                    cursor: 'pointer',
                    fontWeight: pricingServiceTab === 'dj' ? 'bold' : 'normal'
                  }}
                >
                  🎵 DJ Entertainment
                </button>
              </div>

              {/* Success Message */}
              {saveSuccess && (
                <div style={{
                  padding: '1rem 1.5rem',
                  marginBottom: '1.5rem',
                  background: '#4caf50',
                  color: 'white',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                  animation: 'slideDown 0.3s ease-out'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>✓</span>
                  <span style={{ fontWeight: '500' }}>Package saved successfully!</span>
                </div>
              )}

              {/* Add New Package Button */}
              {!showPackageForm && (
                <button 
                  onClick={() => {
                    setEditingPackage(null);
                    setPackageForm({
                      package_name: '',
                      price: '',
                      description: '',
                      features: [],
                      display_order: 0
                    });
                    setShowPackageForm(true);
                  }}
                  className="cta-button" 
                  style={{ marginBottom: '2rem' }}
                >
                  + Add New Package
                </button>
              )}

              {/* Package Form */}
              {showPackageForm && (
                <div style={{ 
                  marginBottom: '2rem', 
                  padding: '1.5rem', 
                  border: '2px solid var(--primary-color)', 
                  borderRadius: '8px', 
                  background: '#f9f9f9' 
                }}>
                  <h3 style={{ marginBottom: '1rem' }}>
                    {editingPackage ? 'Edit Package' : 'Create New Package'}
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Package Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Ceremony Package, Premium Package"
                        value={packageForm.package_name}
                        onChange={(e) => setPackageForm({ ...packageForm, package_name: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '5px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Price (USD) *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 1800"
                        value={packageForm.price}
                        onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '5px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Description
                      </label>
                      <textarea
                        placeholder="Brief description of the package"
                        value={packageForm.description}
                        onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                        rows={3}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '5px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Features / What's Included
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                          type="text"
                          placeholder="Add a feature"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addFeatureToForm();
                            }
                          }}
                          style={{ flexGrow: 1, padding: '0.75rem', border: '1px solid #ccc', borderRadius: '5px' }}
                        />
                        <button 
                          onClick={addFeatureToForm}
                          className="cta-button"
                          type="button"
                        >
                          Add
                        </button>
                      </div>
                      
                      {packageForm.features.length > 0 && (
                        <ul style={{ 
                          listStyle: 'none', 
                          padding: 0, 
                          background: 'white', 
                          borderRadius: '5px', 
                          border: '1px solid #e0e0e0' 
                        }}>
                          {packageForm.features.map((feature, index) => (
                            <li 
                              key={index}
                              style={{ 
                                padding: '0.75rem', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                borderBottom: index < packageForm.features.length - 1 ? '1px solid #e0e0e0' : 'none'
                              }}
                            >
                              <span>✓ {feature}</span>
                              <button
                                onClick={() => removeFeatureFromForm(index)}
                                style={{
                                  background: '#ff4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '3px',
                                  padding: '0.25rem 0.5rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Display Order
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={packageForm.display_order}
                        onChange={(e) => setPackageForm({ ...packageForm, display_order: parseInt(e.target.value) || 0 })}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '5px' }}
                      />
                      <small style={{ color: 'var(--text-light)' }}>Lower numbers appear first</small>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button 
                      onClick={createOrUpdatePackage} 
                      className="cta-button"
                      disabled={savingPackage || !packageForm.package_name || !packageForm.price}
                      style={{
                        opacity: (savingPackage || !packageForm.package_name || !packageForm.price) ? 0.6 : 1,
                        cursor: (savingPackage || !packageForm.package_name || !packageForm.price) ? 'not-allowed' : 'pointer',
                        position: 'relative',
                        minWidth: '150px'
                      }}
                    >
                      {savingPackage ? (
                        <>
                          <span style={{ opacity: 0.7 }}>Saving...</span>
                        </>
                      ) : (
                        editingPackage ? '💾 Save Changes' : '💾 Save Package'
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        setShowPackageForm(false);
                        setEditingPackage(null);
                        setPackageForm({
                          package_name: '',
                          price: '',
                          description: '',
                          features: [],
                          display_order: 0
                        });
                      }}
                      className="secondary-button"
                      disabled={savingPackage}
                      style={{
                        opacity: savingPackage ? 0.6 : 1,
                        cursor: savingPackage ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {/* Validation message */}
                  {(!packageForm.package_name || !packageForm.price) && (
                    <p style={{ 
                      color: '#ff6b6b', 
                      fontSize: '0.9rem', 
                      marginTop: '0.5rem',
                      fontStyle: 'italic'
                    }}>
                      * Package name and price are required
                    </p>
                  )}
                </div>
              )}

              {/* Existing Packages List */}
              <div>
                <h3 style={{ marginBottom: '1rem' }}>
                  Existing Packages ({pricingPackages.length})
                </h3>
                
                {loadingPricing ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                    Loading packages...
                  </div>
                ) : pricingPackages.length === 0 ? (
                  <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    color: 'var(--text-light)',
                    background: '#f5f5f5',
                    borderRadius: '8px'
                  }}>
                    No packages yet. Create your first package above!
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {pricingPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        style={{
                          padding: '1.5rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          background: 'white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                          <div>
                            <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>{pkg.package_name}</h4>
                            <p style={{ 
                              fontSize: '1.5rem', 
                              fontWeight: 'bold', 
                              color: 'var(--primary-color)', 
                              margin: 0 
                            }}>
                              ${parseFloat(pkg.price).toLocaleString()}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => editPackage(pkg)}
                              className="cta-button"
                              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deletePackage(pkg.id)}
                              style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                background: '#ff4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        {pkg.description && (
                          <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
                            {pkg.description}
                          </p>
                        )}
                        
                        {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 && (
                          <div>
                            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Includes:</strong>
                            <ul style={{ 
                              margin: 0, 
                              paddingLeft: '1.5rem',
                              color: 'var(--text-color)'
                            }}>
                              {pkg.features.map((feature: string, index: number) => (
                                <li key={index} style={{ marginBottom: '0.25rem' }}>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                          Display Order: {pkg.display_order}
                        </div>
                      </div>
                    ))}
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
                    value={reviewStatusFilter}
                    onChange={(e) => setReviewStatusFilter(e.target.value)}
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
                {loadingReviews ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p>Loading reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div style={{ 
                    padding: '3rem', 
                    textAlign: 'center', 
                    color: 'var(--text-light)',
                    background: '#f5f5f5',
                    borderRadius: '12px'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                    <h3 style={{ marginBottom: '0.5rem' }}>No reviews found</h3>
                    <p>Reviews from clients will appear here</p>
                  </div>
                ) : (
                  <>
                    <div style={{ 
                      marginBottom: '1.5rem', 
                      padding: '1rem', 
                      background: '#fff3cd', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>⭐</span>
                      <span style={{ fontWeight: '600' }}>
                        {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                        {reviews.filter((r: any) => r.status === 'pending').length > 0 && (
                          <span style={{ 
                            marginLeft: '1rem', 
                            padding: '0.25rem 0.75rem', 
                            background: '#ff6b6b', 
                            color: 'white', 
                            borderRadius: '20px',
                            fontSize: '0.85rem'
                          }}>
                            {reviews.filter((r: any) => r.status === 'pending').length} Pending
                          </span>
                        )}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {reviews.map((review: any) => (
                        <div
                          key={review.id}
                          style={{
                            padding: '1.5rem',
                            background: 'white',
                            border: `2px solid ${review.status === 'pending' ? '#ffc107' : review.status === 'approved' ? '#4CAF50' : '#ff4444'}`,
                            borderRadius: '12px',
                            position: 'relative'
                          }}
                        >
                          {/* Status badge */}
                          <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            padding: '0.25rem 0.75rem',
                            background: review.status === 'pending' ? '#ffc107' : review.status === 'approved' ? '#4CAF50' : '#ff4444',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {review.status}
                          </div>
                          
                          {/* Rating */}
                          {review.rating && (
                            <div style={{ marginBottom: '1rem' }}>
                              {'⭐'.repeat(review.rating)}
                            </div>
                          )}
                          
                          {/* Client and Service Info */}
                          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <strong>Client:</strong> {review.client_name}
                            <span>|</span>
                            <strong>Service:</strong> {review.service_type}
                            {review.dj_username && (
                              <>
                                <span>|</span>
                                <strong>DJ:</strong> @{review.dj_username}
                              </>
                            )}
                          </div>
                          
                          {/* Comment */}
                          <p style={{ 
                            color: 'var(--text-color)', 
                            marginBottom: '1rem',
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            fontStyle: 'italic'
                          }}>
                            &quot;{review.comment}&quot;
                          </p>
                          
                          {/* Event details */}
                          {(review.event_name || review.event_date) && (
                            <div style={{ 
                              color: 'var(--text-light)', 
                              fontSize: '0.9rem',
                              marginBottom: '1rem'
                            }}>
                              {review.event_name && <><strong>Event:</strong> {review.event_name}</>}
                              {review.event_date && (
                                <>
                                  {review.event_name && ' | '}
                                  <strong>Date:</strong> {new Date(review.event_date).toLocaleDateString()}
                                </>
                              )}
                            </div>
                          )}
                          
                          {/* Submission date */}
                          <div style={{ 
                            color: 'var(--text-light)', 
                            fontSize: '0.85rem',
                            marginBottom: '1rem'
                          }}>
                            Submitted: {new Date(review.created_at).toLocaleString()}
                          </div>
                          
                          {/* Action buttons */}
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {review.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => approveReview(review.id)}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => rejectReview(review.id)}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: '#ff9800',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                  ✗ Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => deleteReview(review.id)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#ff4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s ease',
                                marginLeft: review.status === 'pending' ? '0' : 'auto'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Blocked Dates Tab */}
          <div id="blocked-dates-tab" className={`tab-content ${activeTab === 'blocked-dates' ? 'active' : ''}`}>
            <div className="section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Blocked Date Requests</h2>
                <div className="filter-controls" style={{ margin: 0 }}>
                  <select
                    value={blockedDateFilter}
                    onChange={(e) => setBlockedDateFilter(e.target.value)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '2px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="blocked-dates-container">
                {loadingBlockedDates ? (
                  <p>Loading blocked date requests...</p>
                ) : blockedDates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                    <h3>No blocked date requests</h3>
                    <p>DJs can submit blocked dates from their portal</p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>
                      Showing {blockedDates.filter(bd => blockedDateFilter === 'all' || bd.status === blockedDateFilter).length} of {blockedDates.length} requests
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {blockedDates
                        .filter(bd => blockedDateFilter === 'all' || bd.status === blockedDateFilter)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((blockedDate) => (
                          <div
                            key={blockedDate.id}
                            style={{
                              border: `2px solid ${
                                blockedDate.status === 'pending' ? '#FFA500' : 
                                blockedDate.status === 'approved' ? '#4CAF50' : '#DC3545'
                              }`,
                              borderRadius: '10px',
                              padding: '1.5rem',
                              background: 'white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                              <div style={{ flex: 1 }}>
                                {/* Status Badge */}
                                <div style={{
                                  display: 'inline-block',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '20px',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  marginBottom: '0.75rem',
                                  background: blockedDate.status === 'pending' ? '#FFF3CD' :
                                             blockedDate.status === 'approved' ? '#D4EDDA' : '#F8D7DA',
                                  color: blockedDate.status === 'pending' ? '#856404' :
                                         blockedDate.status === 'approved' ? '#155724' : '#721C24'
                                }}>
                                  {blockedDate.status.toUpperCase()}
                                </div>

                                {/* DJ and Date Info */}
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
                                  {blockedDate.djUser}
                                </h3>
                                <div style={{ color: 'var(--text)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                                  📅 {new Date(blockedDate.date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </div>

                                {/* Reason */}
                                {blockedDate.reason && (
                                  <div style={{ 
                                    color: 'var(--text-light)', 
                                    marginBottom: '0.75rem',
                                    fontStyle: 'italic'
                                  }}>
                                    Reason: {blockedDate.reason}
                                  </div>
                                )}

                                {/* Metadata */}
                                <div style={{ 
                                  color: 'var(--text-light)', 
                                  fontSize: '0.85rem'
                                }}>
                                  Requested: {new Date(blockedDate.createdAt).toLocaleString()}
                                  {blockedDate.blockedBy && ` by ${blockedDate.blockedBy}`}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', minWidth: '150px' }}>
                                {blockedDate.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => approveBlockedDate(blockedDate.id)}
                                      style={{
                                        padding: '0.75rem 1.25rem',
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                      ✓ Approve
                                    </button>
                                    <button
                                      onClick={() => rejectBlockedDate(blockedDate.id)}
                                      style={{
                                        padding: '0.75rem 1.25rem',
                                        background: '#DC3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                      ✗ Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => deleteBlockedDate(blockedDate.id)}
                                  style={{
                                    padding: '0.75rem 1.25rem',
                                    background: '#6C757D',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
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

              {/* Modern Grid Layout */}
              <div className="photography-manager-grid">
                {/* Project Creation Header */}
                <div className="projects-header">
                  <h3 style={{ margin: 0 }}>Albums</h3>
                  <button 
                    onClick={() => setShowProjectForm(!showProjectForm)}
                    className="btn-new-project"
                  >
                    {showProjectForm ? 'Cancel' : '+ New Album'}
                  </button>
                </div>

                {/* Project Creation Form */}
                {showProjectForm && (
                  <div className="project-form-card">
                    <div className="form-field-group">
                      <label className="form-label">
                        Album Name *
                      </label>
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="e.g., Smith Wedding 2025"
                        className="form-input"
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="form-label">
                        Description (Optional)
                      </label>
                      <textarea
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                        placeholder="Brief description of this album..."
                        rows={3}
                        className="form-textarea"
                      />
                    </div>
                    <button
                      onClick={createProject}
                      className="btn-create-project"
                    >
                      Create Album
                    </button>
                  </div>
                )}

                {/* Albums Grid */}
                {loadingProjects ? (
                  <div className="albums-loading">
                    <div className="spinner"></div>
                    <p>Loading albums...</p>
                  </div>
                ) : photoProjects.length === 0 ? (
                  <div className="albums-empty">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
                    <p>No albums yet. Create your first album to get started!</p>
                  </div>
                ) : (
                  <div className="albums-grid">
                    {photoProjects.map(project => (
                      <div
                        key={project.id}
                        className="album-card"
                      >
                        {/* Album Cover Image */}
                        <div className="album-card-image-wrapper">
                          {project.cover_photo_url ? (
                            <img 
                              src={project.cover_photo_url} 
                              alt={project.project_name}
                              className="album-card-image"
                            />
                          ) : (
                            <div className="album-card-placeholder">
                              <span style={{ fontSize: '4rem' }}>📸</span>
                            </div>
                          )}
                          
                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(project.id);
                            }}
                            className="album-card-delete"
                            title="Delete album"
                          >
                            🗑️
                          </button>
                        </div>

                        {/* Album Info & Actions Overlay */}
                        <div className="album-card-overlay">
                          <div className="album-card-info">
                            <h4 className="album-card-title">{project.project_name}</h4>
                            <p className="album-card-count">{project.photo_count || 0} photos</p>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="album-card-actions">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openProjectModal(project);
                              }}
                              className="album-action-btn primary"
                            >
                              Manage Photos
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openProjectGallery(project);
                              }}
                              className="album-action-btn secondary"
                            >
                              View Gallery
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Photo Gallery Lightbox */}
          <ImageLightbox
            images={lightboxImages}
            currentIndex={lightboxStartIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            galleryTitle={lightboxTitle}
          />

          {/* Photo Management Modal */}
          {photoModalOpen && modalProject && (
            <div 
              className="photo-modal-overlay"
              onClick={() => setPhotoModalOpen(false)}
            >
              <div 
                className="photo-modal-container"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="photo-modal-header">
                  <div>
                    <h2 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.75rem' }}>
                      {modalProject.project_name}
                    </h2>
                    {modalProject.description && (
                      <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.95rem' }}>
                        {modalProject.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setPhotoModalOpen(false)}
                    className="photo-modal-close"
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>

                {/* Modal Content */}
                <div className="photo-modal-content">
                  {/* Upload Area */}
                  <div className="photo-modal-upload-section">
                    <input
                      type="file"
                      id="modal-photo-upload-input"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="modal-photo-upload-input"
                      className="photo-modal-upload-label"
                    >
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                      <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        {uploadingPhotos ? `Uploading... ${uploadProgress}%` : 'Click to upload or drag photos here'}
                      </p>
                      <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        Supports: JPG, PNG, GIF, WEBP • Max 20MB per file
                      </p>
                      <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <strong>Recommended:</strong> Minimum 1200x800px for best quality
                      </p>
                      <p style={{ color: '#4CAF50', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        Images will be automatically optimized for web display
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
                            background: 'var(--accent-color)', 
                            width: `${uploadProgress}%`,
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Photos Grid */}
                  <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                      Photos ({projectPhotos.length})
                    </h3>
                    
                    {loadingPhotos ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
                        <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                        Loading photos...
                      </div>
                    ) : projectPhotos.length === 0 ? (
                      <div className="photo-modal-empty-state">
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
                        <p>No photos yet. Upload your first photo!</p>
                      </div>
                    ) : (
                      <div className="photo-modal-grid">
                        {projectPhotos.map((photo, index) => (
                          <div 
                            key={photo.id} 
                            className="photo-modal-grid-item"
                          >
                            <img 
                              src={photo.thumbnail_url || photo.photo_url} 
                              alt={photo.caption || 'Project photo'}
                              onClick={() => {
                                const imageUrls = projectPhotos.map(p => p.photo_url);
                                setLightboxImages(imageUrls);
                                setLightboxStartIndex(index);
                                setLightboxTitle(modalProject.project_name);
                                setLightboxOpen(true);
                              }}
                              style={{ 
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                cursor: 'pointer'
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePhoto(photo.id);
                              }}
                              className="photo-modal-delete-btn"
                              title="Delete photo"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Videography Tab */}
          <div id="videography-tab" className={`tab-content ${activeTab === 'videography' ? 'active' : ''}`}>
            <div className="section-card" style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Videography Portfolio Manager</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
                Manage your videography projects and add YouTube video links that will appear on the home page.
              </p>
              
              {/* Modern Grid Layout */}
              <div className="videography-manager-grid">
                {/* Project Creation Header */}
                <div className="projects-header">
                  <h3 style={{ margin: 0 }}>Video Projects</h3>
                  <button 
                    onClick={() => setShowVideoProjectForm(!showVideoProjectForm)}
                    className="btn-new-project"
                  >
                    {showVideoProjectForm ? 'Cancel' : '+ New Project'}
                  </button>
                </div>

                {/* Project Creation Form */}
                {showVideoProjectForm && (
                  <div className="project-form-card">
                    <div className="form-field-group">
                      <label className="form-label">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={newVideoProjectName}
                        onChange={(e) => setNewVideoProjectName(e.target.value)}
                        placeholder="e.g., Wedding Highlight Reels 2025"
                        className="form-input"
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="form-label">
                        Description (Optional)
                      </label>
                      <textarea
                        value={newVideoProjectDescription}
                        onChange={(e) => setNewVideoProjectDescription(e.target.value)}
                        placeholder="Brief description of this video project..."
                        rows={3}
                        className="form-textarea"
                      />
                    </div>
                    <button
                      onClick={createVideoProject}
                      className="btn-create-project"
                    >
                      Create Project
                    </button>
                  </div>
                )}

                {/* Video Projects Grid */}
                {loadingVideoProjects ? (
                  <div className="albums-loading">
                    <div className="spinner"></div>
                    <p>Loading video projects...</p>
                  </div>
                ) : videoProjects.length === 0 ? (
                  <div className="albums-empty">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎬</div>
                    <p>No video projects yet. Create your first project to get started!</p>
                  </div>
                ) : (
                  <div className="video-projects-grid">
                    {videoProjects.map(project => {
                      // Use first_video_id from project data for cover image
                      const coverImage = project.first_video_id 
                        ? `https://img.youtube.com/vi/${project.first_video_id}/maxresdefault.jpg`
                        : null;
                      
                      return (
                        <div
                          key={project.id}
                          className="video-project-card"
                        >
                          {/* Video Project Cover */}
                          <div className="video-card-image-wrapper">
                            {coverImage ? (
                              <img 
                                src={coverImage}
                                alt={project.project_name}
                                className="video-card-image"
                                onError={(e) => {
                                  // Fallback to medium quality if maxres fails
                                  e.currentTarget.src = `https://img.youtube.com/vi/${project.first_video_id}/mqdefault.jpg`;
                                }}
                              />
                            ) : (
                              <div className="video-card-placeholder">
                                <span style={{ fontSize: '4rem' }}>🎬</span>
                              </div>
                            )}
                            
                            {/* Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteVideoProject(project.id);
                              }}
                              className="video-card-delete"
                              title="Delete project"
                            >
                              🗑️
                            </button>
                          </div>

                          {/* Video Project Info & Actions Overlay */}
                          <div className="video-card-overlay">
                            <div className="video-card-info">
                              <h4 className="video-card-title">{project.project_name}</h4>
                              <p className="video-card-count">{project.video_count || 0} videos</p>
                            </div>
                            
                            {/* Action Button */}
                            <div className="video-card-actions">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openVideoModal(project);
                                }}
                                className="video-action-btn primary"
                              >
                                Manage Videos
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Management Modal */}
          {videoModalOpen && modalVideoProject && (
            <div 
              className="video-modal-overlay"
              onClick={() => setVideoModalOpen(false)}
            >
              <div 
                className="video-modal-container"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="video-modal-header">
                  <div>
                    <h2 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.75rem' }}>
                      {modalVideoProject.project_name}
                    </h2>
                    {modalVideoProject.description && (
                      <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.95rem' }}>
                        {modalVideoProject.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setVideoModalOpen(false)}
                    className="video-modal-close"
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>

                {/* Modal Content */}
                <div className="video-modal-content">
                  {/* Add Video Form */}
                  <div className="video-modal-add-section">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Add YouTube Video</h3>
                    <div className="form-field-group">
                      <input
                        type="text"
                        placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-field-group">
                      <input
                        type="text"
                        placeholder="Video title (optional)"
                        value={newVideoTitle}
                        onChange={(e) => setNewVideoTitle(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <button
                      onClick={addVideo}
                      className="btn-add-video"
                    >
                      Add Video
                    </button>
                  </div>

                  {/* Videos Grid */}
                  <div style={{ marginTop: '2.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                      Videos ({projectVideos.length})
                    </h3>
                    
                    {loadingVideos ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
                        <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                        Loading videos...
                      </div>
                    ) : projectVideos.length === 0 ? (
                      <div className="video-modal-empty-state">
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎬</div>
                        <p>No videos yet. Add your first video!</p>
                      </div>
                    ) : (
                      <div className="video-modal-grid">
                        {projectVideos.map((video) => (
                          <div 
                            key={video.id} 
                            className="video-modal-grid-item"
                          >
                            <div className="video-modal-thumbnail">
                              <img
                                src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                                alt={video.title || 'Video thumbnail'}
                                style={{ 
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = `https://img.youtube.com/vi/${video.video_id}/default.jpg`;
                                }}
                              />
                              <div className="video-play-icon">▶</div>
                            </div>
                            <div className="video-modal-info">
                              {video.title && (
                                <div className="video-modal-title">
                                  {video.title}
                                </div>
                              )}
                              <div className="video-modal-date">
                                {new Date(video.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteVideo(video.id);
                              }}
                              className="video-modal-delete-btn"
                              title="Delete video"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          <div id="analytics-tab" className={`tab-content ${activeTab === 'analytics' ? 'active' : ''}`}>
            <div className="section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Website Analytics</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <select 
                    id="analytics-time-range" 
                    value={analyticsTimeRange}
                    onChange={(e) => setAnalyticsTimeRange(e.target.value)}
                    style={{ padding: '0.5rem 1rem', border: '2px solid #e0e0e0', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="365">Last Year</option>
                    <option value="all">All Time</option>
                  </select>
                  <button 
                    onClick={clearAnalyticsData}
                    style={{ padding: '0.5rem 1rem', background: 'var(--error-color)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#c0392b'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'var(--error-color)'}
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

              {/* Loading State */}
              {loadingAnalytics && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                  <p style={{ color: 'var(--text-light)' }}>Loading analytics data...</p>
                </div>
              )}

              {/* Analytics Charts Grid */}
              {!loadingAnalytics && (
                <>
                  <div className="analytics-charts-grid-main" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div className="analytics-chart-container">
                      <h3>Visits Over Time</h3>
                      <div id="visits-chart" style={{ height: '300px', position: 'relative', padding: '1rem 0', width: '100%', minWidth: '400px' }}>
                        {/* Line graph will be generated here */}
                      </div>
                    </div>
                    <div className="analytics-chart-container">
                      <h3>Top Pages</h3>
                      <div id="top-pages-list">
                        {/* Top pages will be listed here */}
                      </div>
                    </div>
                  </div>

                  {/* Additional Analytics */}
                  <div className="analytics-charts-grid-secondary" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Traffic Sources */}
                    <div className="analytics-chart-container">
                      <h3>Traffic Sources</h3>
                      <div id="traffic-sources-list">
                        {/* Traffic sources will be listed here */}
                      </div>
                    </div>

                    {/* Device Types */}
                    <div className="analytics-chart-container">
                      <h3>Device Types</h3>
                      <div id="device-types-list">
                        {/* Device types will be listed here */}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div style={{ marginTop: '2rem' }} className="analytics-chart-container">
                    <h3>Recent Activity</h3>
                    <div id="recent-activity-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {/* Recent activity will be listed here */}
                    </div>
                  </div>
                </>
              )}
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
                  <form id="create-user-form" onSubmit={handleUserSubmit}>
                    <input type="hidden" id="edit-mode" value="false" />
                    <input type="hidden" id="edit-original-username" value="" />
                    <input type="hidden" id="edit-original-usertype" value="" />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
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
                        onClick={cancelEditUser}
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
                    {loadingUsers ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                        <p>Loading users...</p>
                      </div>
                    ) : users.length === 0 ? (
                      <div style={{ 
                        padding: '3rem', 
                        textAlign: 'center', 
                        color: 'var(--text-light)',
                        background: '#f5f5f5',
                        borderRadius: '12px'
                      }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>No users found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ 
                          marginBottom: '1.5rem', 
                          padding: '1rem', 
                          background: '#f0f9ff', 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{ fontSize: '1.5rem' }}>👥</span>
                          <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                            {users.length} {users.length === 1 ? 'User' : 'Users'} Found
                          </span>
                        </div>
                        
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          {users.map((user: any) => (
                            <div
                              key={user.id}
                              style={{
                                padding: '1.5rem',
                                background: 'white',
                                border: '2px solid #e0e0e0',
                                borderRadius: '12px',
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr auto',
                                gap: '1.5rem',
                                alignItems: 'center',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary-color)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e0e0e0';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {/* Avatar */}
                              <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: user.profile_picture ? `url(${user.profile_picture})` : 'var(--primary-color)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                              }}>
                                {!user.profile_picture && `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
                              </div>
                              
                              {/* User Info */}
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                                    {user.first_name} {user.last_name}
                                  </h3>
                                  <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: user.user_type === 'admin' ? '#ff6b6b' : 
                                               user.user_type === 'dj' ? '#4CAF50' : 
                                               user.user_type === 'photographer' ? '#2196F3' :
                                               user.user_type === 'videographer' ? '#9C27B0' : '#FF9800',
                                    color: 'white',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase'
                                  }}>
                                    {user.user_type}
                                  </span>
                                  {user.is_super_user && (
                                    <span style={{
                                      padding: '0.25rem 0.75rem',
                                      background: '#FFD700',
                                      color: '#000',
                                      borderRadius: '20px',
                                      fontSize: '0.75rem',
                                      fontWeight: '600'
                                    }}>
                                      ⭐ SUPER ADMIN
                                    </span>
                                  )}
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                  <div>
                                    <strong>Username:</strong> @{user.username}
                                  </div>
                                  <div>
                                    <strong>Email:</strong> {user.email}
                                  </div>
                                  {user.phone && (
                                    <div>
                                      <strong>Phone:</strong> {user.phone}
                                    </div>
                                  )}
                                  <div>
                                    <strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditUser(user);
                                  }}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteUser(user.id);
                                  }}
                                  disabled={user.is_super_user}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: user.is_super_user ? '#ccc' : '#ff4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: user.is_super_user ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease',
                                    opacity: user.is_super_user ? 0.5 : 1
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!user.is_super_user) {
                                      e.currentTarget.style.opacity = '0.8';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!user.is_super_user) {
                                      e.currentTarget.style.opacity = '1';
                                    }
                                  }}
                                  title={user.is_super_user ? 'Cannot delete super admin' : 'Delete user'}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
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
      
      {/* Build verification - Jan 23, 2026 */}
      <div style={{display: 'none'}} data-build="2026-01-23-v2"></div>
    </div>
  );
}

