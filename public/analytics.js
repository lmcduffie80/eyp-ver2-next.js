/**
 * Cookie-based Analytics Tracking
 * Tracks visitors, page views, sessions, and user behavior
 */

// Cookie helper functions
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function generateVisitorId() {
    return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create visitor ID (stored in cookie for 365 days)
function getVisitorId() {
    let visitorId = getCookie('eyp_visitor_id');
    if (!visitorId) {
        visitorId = generateVisitorId();
        setCookie('eyp_visitor_id', visitorId, 365);
    }
    return visitorId;
}

// Get or create session ID (stored in sessionStorage for current session)
function getSessionId() {
    let sessionId = sessionStorage.getItem('eyp_session_id');
    if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem('eyp_session_id', sessionId);
        sessionStorage.setItem('eyp_session_start', new Date().toISOString());
    }
    return sessionId;
}

// Get device type from user agent
function getDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
        return 'Tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
        return 'Mobile';
    }
    return 'Desktop';
}

// Get referrer source
function getReferrerSource(referrer) {
    if (!referrer || referrer === '') return 'Direct';
    
    try {
        const url = new URL(referrer);
        const hostname = url.hostname.toLowerCase();
        
        if (hostname.includes('google')) return 'Google';
        if (hostname.includes('facebook')) return 'Facebook';
        if (hostname.includes('instagram')) return 'Instagram';
        if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter/X';
        if (hostname.includes('linkedin')) return 'LinkedIn';
        if (hostname.includes('bing')) return 'Bing';
        if (hostname.includes('yahoo')) return 'Yahoo';
        
        // Check if it's from the same domain
        if (hostname === window.location.hostname || hostname.includes(window.location.hostname)) {
            return 'Internal';
        }
        
        return 'Other';
    } catch {
        return 'Other';
    }
}

// Track page view by sending to API
function trackPageView() {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const page = window.location.pathname;
    const referrer = document.referrer || '';
    const referrerSource = getReferrerSource(referrer);
    const userAgent = navigator.userAgent;
    const deviceType = getDeviceType();
    const timestamp = new Date().toISOString();
    
    // Skip tracking for admin pages
    if (page.startsWith('/admin') || page.startsWith('/dj-dashboard')) {
        return;
    }
    
    // Send to API
    fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            visitorId,
            sessionId,
            page,
            referrer,
            referrerSource,
            deviceType,
            userAgent,
            timestamp
        })
    }).then(response => {
        if (!response.ok) {
            console.error('Analytics tracking failed:', response.statusText);
        }
    }).catch(error => {
        console.error('Analytics tracking error:', error);
    });
    
    // Log for debugging (can be removed in production)
    console.log('Page view tracked:', {
        visitorId: visitorId.substring(0, 20) + '...',
        sessionId: sessionId.substring(0, 20) + '...',
        page: page,
        referrerSource: referrerSource,
        deviceType: deviceType
    });
}

// Initialize tracking on page load
function initializeTracking() {
    // Check if user has explicitly declined cookies
    const consent = getCookie('eyp_cookie_consent');

    // Only skip tracking if user explicitly declined
    if (consent === 'declined') {
        console.log('Analytics tracking declined by user');
        return;
    }

    // Track by default (consent banner will still show for users to opt-out if desired)
    trackPageView();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Wait a bit for cookie consent banner to initialize
        setTimeout(initializeTracking, 100);
    });
} else {
    setTimeout(initializeTracking, 100);
}

// Note: Session duration tracking would require additional API endpoints
// and more complex session management. This is simplified for initial implementation.

