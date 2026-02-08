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
  
  // Website Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState('30');
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  
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
  
  // DJ Entertainment state
  const [djProjects, setDjProjects] = useState<any[]>([]);
  const [selectedDjProject, setSelectedDjProject] = useState<any | null>(null);
  const [djVideos, setDjVideos] = useState<any[]>([]);
  const [loadingDjProjects, setLoadingDjProjects] = useState(false);
  const [loadingDjVideos, setLoadingDjVideos] = useState(false);
  const [newDjProjectName, setNewDjProjectName] = useState('');
  const [newDjProjectDescription, setNewDjProjectDescription] = useState('');
  const [showDjProjectForm, setShowDjProjectForm] = useState(false);
  const [newDjVideoUrl, setNewDjVideoUrl] = useState('');
  const [newDjVideoTitle, setNewDjVideoTitle] = useState('');
  
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
      const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.totalRevenue) || 0), 0);
      
      // DJ Revenue (sum of DJ payouts)
      const djRevenue = bookings.reduce((sum, b) => sum + (Number(b.payout) || 0), 0);
      
      // Revenue by Year
      const revenue2025 = bookings
        .filter(b => new Date(b.date).getFullYear() === 2025)
        .reduce((sum, b) => sum + (Number(b.totalRevenue) || 0), 0);
      
      const revenue2026 = bookings
        .filter(b => new Date(b.date).getFullYear() === 2026)
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

  // Fetch analytics data
  const fetchAnalytics = async (days: string) => {
    try {
      setLoadingAnalytics(true);
      const response = await fetch(`/api/analytics/stats?days=${days}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalyticsData(data);
      setLoadingAnalytics(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoadingAnalytics(false);
    }
  };

  // Clear analytics data
  const clearAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/clear', {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to clear analytics');
      }
      const result = await response.json();
      alert(result.message || 'Analytics data cleared successfully');
      // Refresh data
      fetchAnalytics(analyticsTimeRange);
    } catch (error) {
      console.error('Error clearing analytics:', error);
      alert('Failed to clear analytics data');
    }
  };

  // Auto-refresh analytics when on analytics tab
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics(analyticsTimeRange);
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchAnalytics(analyticsTimeRange);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab, analyticsTimeRange]);

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
    const date = new Date(currentEditingBooking.date).toLocaleDateString();
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedProject) return;

    setUploadingPhotos(true);
    setUploadProgress(0);
    const totalFiles = files.length;
    let uploadedCount = 0;

    try {
      for (const file of Array.from(files)) {
        // Create FormData for server upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', selectedProject.id.toString());

        // Upload to server (which uploads to S3)
        const uploadResponse = await fetch('/api/photography/upload', {
          method: 'POST',
          body: formData
        });
        
        const { photoURL, success, error } = await uploadResponse.json();

        if (!success) {
          console.error('Failed to upload:', error);
          alert(`Failed to upload ${file.name}: ${error}`);
          continue;
        }

        // Save photo metadata to database
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
      }

      if (uploadedCount === totalFiles) {
        alert('All photos uploaded successfully!');
        await fetchProjectPhotos(selectedProject.id);
        await fetchPhotoProjects();
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
    } else if (activeTab === 'dj-entertainment') {
      fetchDjProjects();
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
    if (selectedDjProject) {
      fetchDjVideos(selectedDjProject.id);
    }
  }, [selectedDjProject]);

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

  // DJ Entertainment Management Functions
  const fetchDjProjects = async () => {
    try {
      setLoadingDjProjects(true);
      const response = await fetch('/api/dj-entertainment/projects');
      if (response.ok) {
        const result = await response.json();
        setDjProjects(result.data || []);
      } else {
        console.error('Failed to fetch DJ Entertainment projects');
      }
    } catch (error) {
      console.error('Error fetching DJ Entertainment projects:', error);
    } finally {
      setLoadingDjProjects(false);
    }
  };

  const fetchDjVideos = async (projectId: number) => {
    try {
      setLoadingDjVideos(true);
      const response = await fetch(`/api/dj-entertainment/videos?project_id=${projectId}`);
      if (response.ok) {
        const result = await response.json();
        setDjVideos(result.data || []);
      } else {
        console.error('Failed to fetch DJ Entertainment videos');
      }
    } catch (error) {
      console.error('Error fetching DJ Entertainment videos:', error);
    } finally {
      setLoadingDjVideos(false);
    }
  };

  const createDjProject = async () => {
    if (!newDjProjectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    try {
      const response = await fetch('/api/dj-entertainment/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: newDjProjectName,
          description: newDjProjectDescription
        })
      });

      if (response.ok) {
        const result = await response.json();
        setNewDjProjectName('');
        setNewDjProjectDescription('');
        setShowDjProjectForm(false);
        await fetchDjProjects();
        setSelectedDjProject(result.data);
      } else {
        const error = await response.json();
        alert(`Failed to create project: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  const addDjVideo = async () => {
    if (!newDjVideoUrl.trim()) {
      alert('Please enter a video URL (YouTube, TikTok, or Instagram)');
      return;
    }

    if (!selectedDjProject) {
      alert('Please select a project first');
      return;
    }

    try {
      const response = await fetch('/api/dj-entertainment/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedDjProject.id,
          video_url: newDjVideoUrl,
          title: newDjVideoTitle || null
        })
      });

      if (response.ok) {
        setNewDjVideoUrl('');
        setNewDjVideoTitle('');
        await fetchDjVideos(selectedDjProject.id);
        await fetchDjProjects();
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

  const deleteDjVideo = async (videoId: number) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const response = await fetch(`/api/dj-entertainment/videos?id=${videoId}`, {
        method: 'DELETE'
      });

      if (response.ok && selectedDjProject) {
        await fetchDjVideos(selectedDjProject.id);
        await fetchDjProjects();
      } else {
        alert('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  const deleteDjProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project and all its videos?')) {
      return;
    }

    try {
      const response = await fetch(`/api/dj-entertainment/projects?id=${projectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSelectedDjProject(null);
        setDjVideos([]);
        await fetchDjProjects();
        alert('Project deleted successfully');
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
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
            className={`sidebar-nav-link ${activeTab === 'dj-entertainment' ? 'active' : ''}`}
            onClick={() => switchTab('dj-entertainment')}
          >
            <span className="nav-icon">🎧</span>
            <span>DJ Entertainment</span>
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingBookings ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                          Loading upcoming projects...
                        </td>
                      </tr>
                    ) : (
                      (() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const upcomingBookings = bookings
                          .filter(b => {
                            const bookingDate = new Date(b.date);
                            const isUpcoming = (b as any).status === 'upcoming' || !(b as any).status;
                            return bookingDate >= today && isUpcoming;
                          })
                          .filter(b => !selectedDJFilter || b.djUser === selectedDJFilter)
                          .sort((a, b) => {
                            let comparison = 0;
                            if (upcomingSortField === 'date') {
                              comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                            } else if (upcomingSortField === 'dj') {
                              comparison = (a.djUser || '').localeCompare(b.djUser || '');
                            } else if (upcomingSortField === 'revenue') {
                              comparison = (a.totalRevenue || 0) - (b.totalRevenue || 0);
                            }
                            return upcomingSortDirection === 'asc' ? comparison : -comparison;
                          });
                        
                        return upcomingBookings.length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                              No upcoming projects scheduled
                            </td>
                          </tr>
                        ) : (
                          upcomingBookings.map(booking => {
                            const bookingStatus = (booking as any).status || 'upcoming';
                            return (
                              <tr key={booking.id}>
                                <td>{new Date(booking.date).toLocaleDateString()}</td>
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
                                <td>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                                      className="mark-complete-btn"
                                      title="Mark as complete"
                                    >
                                      ✓ Complete
                                    </button>
                                    <button
                                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                      className="mark-cancelled-btn"
                                      title="Mark as cancelled"
                                    >
                                      ✕ Cancel
                                    </button>
                                  </div>
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
                                {booking.eventType || 'N/A'} • {new Date(booking.date).toLocaleDateString()}
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
                            const bookingDate = new Date(booking.date);
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
                            const bookingYear = new Date(booking.date).getFullYear();
                            if (bookingYear !== parseInt(analyticsFilterYear)) {
                              return false;
                            }
                          }
                          
                          return true;
                        });
                        
                        // Sort filtered bookings based on analytics sort state
                        const sortedBookings = [...filteredBookings].sort((a, b) => {
                          let comparison = 0;
                          if (analyticsSortField === 'date') {
                            comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                          } else if (analyticsSortField === 'dj') {
                            comparison = (a.djUser || '').localeCompare(b.djUser || '');
                          } else if (analyticsSortField === 'project') {
                            comparison = (a.eventType || '').localeCompare(b.eventType || '');
                          }
                          return analyticsSortDirection === 'asc' ? comparison : -comparison;
                        });
                        
                        return sortedBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>{new Date(booking.date).toLocaleDateString()}</td>
                          <td>{booking.djUser || 'N/A'}</td>
                          <td>{booking.eventType || 'N/A'}</td>
                          <td>{booking.location || 'N/A'}</td>
                          <td>${(Number(booking.totalRevenue) || 0).toFixed(2)}</td>
                          <td>${(Number(booking.ccPayment) || 0).toFixed(2)}</td>
                          <td>${(Number(booking.payout) || 0).toFixed(2)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <button
                                onClick={() => openNotesModal(booking)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: 'var(--accent-color)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}
                                title="Add or edit project notes"
                              >
                                {booking.notes && <span>📝</span>}
                                <span>{booking.notes ? 'Edit Notes' : 'Add Notes'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this booking?')) {
                                    console.log('Delete booking:', booking.id);
                                  }
                                }}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  fontSize: '0.85rem',
                                  background: 'var(--error-color)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '5px',
                                  cursor: 'pointer'
                                }}
                                title="Delete project"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                        ));
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
                      {currentEditingBooking?.date ? new Date(currentEditingBooking.date).toLocaleDateString() : 'N/A'}
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

          {/* Videography Tab */}
          <div id="videography-tab" className={`tab-content ${activeTab === 'videography' ? 'active' : ''}`}>
            <div className="section-card" style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Videography Portfolio Manager</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
                Manage your videography projects and add YouTube video links that will appear on the home page.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* Projects Sidebar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Projects</h3>
                    <button
                      onClick={() => setShowVideoProjectForm(!showVideoProjectForm)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      + New
                    </button>
                  </div>

                  {showVideoProjectForm && (
                    <div style={{ 
                      padding: '1rem', 
                      background: '#f8f9fa', 
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <input
                        type="text"
                        placeholder="Project name"
                        value={newVideoProjectName}
                        onChange={(e) => setNewVideoProjectName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          marginBottom: '0.5rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px'
                        }}
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={newVideoProjectDescription}
                        onChange={(e) => setNewVideoProjectDescription(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          marginBottom: '0.5rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          minHeight: '60px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={createVideoProject}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Create
                        </button>
                        <button
                          onClick={() => setShowVideoProjectForm(false)}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: '#e0e0e0',
                            color: '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {loadingVideoProjects ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      Loading...
                    </div>
                  ) : videoProjects.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                      No projects yet. Create your first project!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {videoProjects.map(project => (
                        <div
                          key={project.id}
                          onClick={() => setSelectedVideoProject(project)}
                          style={{
                            padding: '1rem',
                            background: selectedVideoProject?.id === project.id ? '#e8f4ff' : 'white',
                            border: selectedVideoProject?.id === project.id ? '2px solid var(--primary-color)' : '1px solid #e0e0e0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{project.project_name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                            {project.video_count || 0} videos
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Management Area */}
                <div>
                  {!selectedVideoProject ? (
                    <div style={{ 
                      padding: '4rem 2rem', 
                      textAlign: 'center', 
                      color: 'var(--text-light)',
                      border: '2px dashed #e0e0e0',
                      borderRadius: '8px'
                    }}>
                      <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No project selected</p>
                      <p style={{ fontSize: '0.9rem' }}>Select a project from the left or create a new one</p>
                    </div>
                  ) : (
                    <>
                      <h3 style={{ marginBottom: '1rem' }}>{selectedVideoProject.project_name}</h3>
                      
                      {/* Add Video Form */}
                      <div style={{ 
                        padding: '1.5rem', 
                        background: '#f8f9fa', 
                        borderRadius: '8px',
                        marginBottom: '2rem'
                      }}>
                        <h4 style={{ marginBottom: '1rem' }}>Add YouTube Video</h4>
                        <input
                          type="text"
                          placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                          value={newVideoUrl}
                          onChange={(e) => setNewVideoUrl(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            marginBottom: '0.5rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            fontSize: '0.95rem'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Video title (optional)"
                          value={newVideoTitle}
                          onChange={(e) => setNewVideoTitle(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            fontSize: '0.95rem'
                          }}
                        />
                        <button
                          onClick={addVideo}
                          style={{
                            padding: '0.75rem 2rem',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '500'
                          }}
                        >
                          Add Video
                        </button>
                      </div>

                      {/* Videos List */}
                      <div>
                        <h4 style={{ marginBottom: '1rem' }}>Videos ({projectVideos.length})</h4>
                        
                        {loadingVideos ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                            Loading videos...
                          </div>
                        ) : projectVideos.length === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                            No videos yet. Add your first video!
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {projectVideos.map(video => (
                              <div key={video.id} style={{ 
                                border: '1px solid #e0e0e0', 
                                borderRadius: '8px',
                                overflow: 'hidden',
                                background: 'white'
                              }}>
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                                  <img
                                    src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                                    alt={video.title || 'Video thumbnail'}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </div>
                                <div style={{ padding: '1rem' }}>
                                  {video.title && (
                                    <div style={{ fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                                      {video.title}
                                    </div>
                                  )}
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
                                    {new Date(video.created_at).toLocaleDateString()}
                                  </div>
                                  <button
                                    onClick={() => deleteVideo(video.id)}
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      background: '#dc2626',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.9rem'
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
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

          {/* DJ Entertainment Tab */}
          <div id="dj-entertainment-tab" className={`tab-content ${activeTab === 'dj-entertainment' ? 'active' : ''}`}>
            <div className="section-card" style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>DJ Entertainment Portfolio Manager</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
                Manage your DJ Entertainment projects and add video links (YouTube, TikTok, Instagram) that will appear on the DJ Entertainment page.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* Projects Sidebar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Projects</h3>
                    <button
                      onClick={() => setShowDjProjectForm(!showDjProjectForm)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      + New
                    </button>
                  </div>

                  {showDjProjectForm && (
                    <div style={{ 
                      padding: '1rem', 
                      background: '#f8f9fa', 
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <input
                        type="text"
                        placeholder="Project name"
                        value={newDjProjectName}
                        onChange={(e) => setNewDjProjectName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          marginBottom: '0.5rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px'
                        }}
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={newDjProjectDescription}
                        onChange={(e) => setNewDjProjectDescription(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          marginBottom: '0.5rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          minHeight: '60px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={createDjProject}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Create
                        </button>
                        <button
                          onClick={() => setShowDjProjectForm(false)}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: '#e0e0e0',
                            color: '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {loadingDjProjects ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      Loading...
                    </div>
                  ) : djProjects.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                      No projects yet. Create your first project!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {djProjects.map(project => (
                        <div
                          key={project.id}
                          onClick={() => setSelectedDjProject(project)}
                          style={{
                            padding: '1rem',
                            background: selectedDjProject?.id === project.id ? '#e8f4ff' : 'white',
                            border: selectedDjProject?.id === project.id ? '2px solid var(--primary-color)' : '1px solid #e0e0e0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{project.project_name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                            {project.video_count || 0} videos
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Management Area */}
                <div>
                  {!selectedDjProject ? (
                    <div style={{ 
                      padding: '4rem 2rem', 
                      textAlign: 'center', 
                      color: 'var(--text-light)',
                      border: '2px dashed #e0e0e0',
                      borderRadius: '8px'
                    }}>
                      <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No project selected</p>
                      <p style={{ fontSize: '0.9rem' }}>Select a project from the left or create a new one</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>{selectedDjProject.project_name}</h3>
                        <button
                          onClick={() => deleteDjProject(selectedDjProject.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Delete Project
                        </button>
                      </div>
                      
                      {/* Add Video Form */}
                      <div style={{ 
                        padding: '1.5rem', 
                        background: '#f8f9fa', 
                        borderRadius: '8px',
                        marginBottom: '2rem'
                      }}>
                        <h4 style={{ marginBottom: '0.5rem' }}>Add Video</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
                          Supports YouTube, TikTok, and Instagram video links
                        </p>
                        <input
                          type="text"
                          placeholder="Video URL (YouTube, TikTok, or Instagram)"
                          value={newDjVideoUrl}
                          onChange={(e) => setNewDjVideoUrl(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            marginBottom: '0.5rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            fontSize: '0.95rem'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Video title (optional)"
                          value={newDjVideoTitle}
                          onChange={(e) => setNewDjVideoTitle(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            fontSize: '0.95rem'
                          }}
                        />
                        <button
                          onClick={addDjVideo}
                          style={{
                            padding: '0.75rem 2rem',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '500'
                          }}
                        >
                          Add Video
                        </button>
                      </div>

                      {/* Videos List */}
                      <div>
                        <h4 style={{ marginBottom: '1rem' }}>Videos ({djVideos.length})</h4>
                        
                        {loadingDjVideos ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                            Loading videos...
                          </div>
                        ) : djVideos.length === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                            No videos yet. Add your first video!
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {djVideos.map(video => (
                              <div key={video.id} style={{ 
                                border: '1px solid #e0e0e0', 
                                borderRadius: '8px',
                                overflow: 'hidden',
                                background: 'white'
                              }}>
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#f0f0f0' }}>
                                  {video.platform === 'youtube' && (
                                    <img
                                      src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                                      alt={video.title || 'Video thumbnail'}
                                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  )}
                                  {video.platform === 'tiktok' && (
                                    <div style={{ 
                                      position: 'absolute', 
                                      top: '50%', 
                                      left: '50%', 
                                      transform: 'translate(-50%, -50%)',
                                      fontSize: '3rem'
                                    }}>
                                      🎵
                                    </div>
                                  )}
                                  {video.platform === 'instagram' && (
                                    <div style={{ 
                                      position: 'absolute', 
                                      top: '50%', 
                                      left: '50%', 
                                      transform: 'translate(-50%, -50%)',
                                      fontSize: '3rem'
                                    }}>
                                      📷
                                    </div>
                                  )}
                                </div>
                                <div style={{ padding: '1rem' }}>
                                  {video.title && (
                                    <div style={{ fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                                      {video.title}
                                    </div>
                                  )}
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                                    Platform: {video.platform}
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
                                    {new Date(video.created_at).toLocaleDateString()}
                                  </div>
                                  <button
                                    onClick={() => deleteDjVideo(video.id)}
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      background: '#dc2626',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.9rem'
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
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
                    value={analyticsTimeRange}
                    onChange={(e) => setAnalyticsTimeRange(e.target.value)}
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
                        clearAnalytics();
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
                  <div className="metric-value" id="total-visits">
                    {loadingAnalytics ? '...' : (analyticsData?.totalVisits || 0).toLocaleString()}
                  </div>
                  <div className="metric-change positive">
                    <span className="arrow">↑</span> Real-time tracking
                  </div>
                </div>
                <div className="metric-card-modern">
                  <div className="metric-header">
                    <span className="metric-label">Page Views</span>
                    <span className="metric-icon">📄</span>
                  </div>
                  <div className="metric-value" id="total-page-views">
                    {loadingAnalytics ? '...' : (analyticsData?.totalPageViews || 0).toLocaleString()}
                  </div>
                  <div className="metric-change positive">
                    <span className="arrow">↑</span> Auto-refreshes
                  </div>
                </div>
                <div className="metric-card-modern">
                  <div className="metric-header">
                    <span className="metric-label">Unique Visitors</span>
                    <span className="metric-icon">🎯</span>
                  </div>
                  <div className="metric-value" id="unique-visitors">
                    {loadingAnalytics ? '...' : (analyticsData?.uniqueVisitors || 0).toLocaleString()}
                  </div>
                  <div className="metric-change positive">
                    <span className="arrow">↑</span> Unique tracking
                  </div>
                </div>
                <div className="metric-card-modern">
                  <div className="metric-header">
                    <span className="metric-label">Avg. Session</span>
                    <span className="metric-icon">⏱️</span>
                  </div>
                  <div className="metric-value" id="avg-session-duration">
                    {loadingAnalytics ? '...' : (analyticsData?.avgSessionDuration || '0m')}
                  </div>
                  <div className="metric-change positive">
                    <span className="arrow">↑</span> Session data
                  </div>
                </div>
              </div>

              {/* Analytics Charts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px' }}>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Visits Over Time</h3>
                  <div id="visits-chart" style={{ height: '300px', position: 'relative', padding: '1rem 0', width: '100%', minWidth: '400px' }}>
                    {loadingAnalytics ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading chart data...</div>
                    ) : analyticsData?.visitsOverTime && analyticsData.visitsOverTime.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
                        {analyticsData.visitsOverTime.slice(-14).map((item: any, index: number) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ width: '100px', fontSize: '0.85rem', color: '#666' }}>
                              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <div style={{ flex: 1, background: '#e0e0e0', borderRadius: '4px', height: '20px', position: 'relative' }}>
                              <div style={{ 
                                background: 'var(--primary-color)', 
                                borderRadius: '4px', 
                                height: '100%', 
                                width: `${Math.min((item.count / Math.max(...analyticsData.visitsOverTime.map((v: any) => v.count))) * 100, 100)}%`,
                                transition: 'width 0.3s ease'
                              }}></div>
                            </div>
                            <span style={{ width: '50px', textAlign: 'right', fontSize: '0.9rem', fontWeight: '600' }}>
                              {item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No visit data available</div>
                    )}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px' }}>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Top Pages</h3>
                  <div id="top-pages-list">
                    {loadingAnalytics ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading...</div>
                    ) : analyticsData?.topPages && analyticsData.topPages.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {analyticsData.topPages.slice(0, 10).map((item: any, index: number) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '0.5rem',
                            background: index % 2 === 0 ? '#f9f9f9' : 'transparent',
                            borderRadius: '4px'
                          }}>
                            <span style={{ fontSize: '0.9rem', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.page || '/'}
                            </span>
                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary-color)', minWidth: '50px', textAlign: 'right' }}>
                              {item.views} views
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No page data available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Analytics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Traffic Sources */}
                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px' }}>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Traffic Sources</h3>
                  <div id="traffic-sources-list">
                    {loadingAnalytics ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading...</div>
                    ) : analyticsData?.trafficSources && analyticsData.trafficSources.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {analyticsData.trafficSources.map((item: any, index: number) => {
                          const total = analyticsData.trafficSources.reduce((sum: number, s: any) => sum + s.count, 0);
                          const percentage = total > 0 ? (item.count / total * 100).toFixed(1) : 0;
                          return (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: '#333', fontWeight: '500' }}>{item.source}</span>
                                <span style={{ color: '#666' }}>{item.count} ({percentage}%)</span>
                              </div>
                              <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                                <div style={{ 
                                  background: 'var(--primary-color)', 
                                  height: '100%', 
                                  width: `${percentage}%`,
                                  transition: 'width 0.3s ease'
                                }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No traffic data available</div>
                    )}
                  </div>
                </div>

                {/* Device Types */}
                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px' }}>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Device Types</h3>
                  <div id="device-types-list">
                    {loadingAnalytics ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading...</div>
                    ) : analyticsData?.deviceTypes && analyticsData.deviceTypes.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {analyticsData.deviceTypes.map((item: any, index: number) => {
                          const total = analyticsData.deviceTypes.reduce((sum: number, d: any) => sum + d.count, 0);
                          const percentage = total > 0 ? (item.count / total * 100).toFixed(1) : 0;
                          const deviceIcons: any = {
                            'Desktop': '💻',
                            'Mobile': '📱',
                            'Tablet': '📱'
                          };
                          return (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: '#333', fontWeight: '500' }}>
                                  {deviceIcons[item.device] || '💻'} {item.device}
                                </span>
                                <span style={{ color: '#666' }}>{item.count} ({percentage}%)</span>
                              </div>
                              <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                                <div style={{ 
                                  background: 'var(--primary-color)', 
                                  height: '100%', 
                                  width: `${percentage}%`,
                                  transition: 'width 0.3s ease'
                                }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No device data available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ marginTop: '2rem', background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px' }}>
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Recent Activity</h3>
                <div id="recent-activity-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {loadingAnalytics ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading...</div>
                  ) : analyticsData?.recentActivity && analyticsData.recentActivity.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {analyticsData.recentActivity.map((item: any, index: number) => (
                        <div key={index} style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '150px 1fr 100px 80px 120px',
                          gap: '1rem',
                          padding: '0.75rem',
                          background: index % 2 === 0 ? '#f9f9f9' : 'transparent',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          alignItems: 'center'
                        }}>
                          <span style={{ color: '#666', fontSize: '0.8rem' }}>
                            {new Date(item.timestamp).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          <span style={{ color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.page}
                          </span>
                          <span style={{ color: '#666', fontSize: '0.8rem' }}>
                            {item.source}
                          </span>
                          <span style={{ color: '#666', fontSize: '0.8rem' }}>
                            {item.device}
                          </span>
                          <span style={{ 
                            color: '#999', 
                            fontSize: '0.75rem', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            fontFamily: 'monospace'
                          }}>
                            {item.visitorId}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No recent activity</div>
                  )}
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
                  <form id="create-user-form" onSubmit={handleUserSubmit}>
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
    </div>
  );
}

