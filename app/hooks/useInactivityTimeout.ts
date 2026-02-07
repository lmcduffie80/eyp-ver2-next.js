import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimeoutProps {
  timeoutSeconds: number;
  warningSeconds: number;
  onTimeout: () => void;
  enabled: boolean;
}

interface UseInactivityTimeoutReturn {
  showWarning: boolean;
  countdown: number;
  handleStayLoggedIn: () => void;
  handleLogoutNow: () => void;
  resetTimer: () => void;
}

export function useInactivityTimeout({
  timeoutSeconds,
  warningSeconds,
  onTimeout,
  enabled
}: UseInactivityTimeoutProps): UseInactivityTimeoutReturn {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(warningSeconds);
  
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Start the inactivity timer
  const startInactivityTimer = useCallback(() => {
    clearAllTimers();
    
    inactivityTimerRef.current = setTimeout(() => {
      // Show warning dialog
      setShowWarning(true);
      setCountdown(warningSeconds);
      
      // Start countdown interval
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Time's up - logout
            clearAllTimers();
            onTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Set warning timer for automatic logout
      warningTimerRef.current = setTimeout(() => {
        clearAllTimers();
        onTimeout();
      }, warningSeconds * 1000);
      
    }, timeoutSeconds * 1000);
  }, [timeoutSeconds, warningSeconds, onTimeout, clearAllTimers]);

  // Reset timer (called on user activity)
  const resetTimer = useCallback(() => {
    if (enabled && !showWarning) {
      startInactivityTimer();
    }
  }, [enabled, showWarning, startInactivityTimer]);

  // Handle "Stay Logged In" button click
  const handleStayLoggedIn = useCallback(() => {
    setShowWarning(false);
    setCountdown(warningSeconds);
    clearAllTimers();
    startInactivityTimer();
  }, [warningSeconds, clearAllTimers, startInactivityTimer]);

  // Handle "Logout Now" button click
  const handleLogoutNow = useCallback(() => {
    clearAllTimers();
    onTimeout();
  }, [clearAllTimers, onTimeout]);

  // Activity event handler
  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Setup activity listeners
  useEffect(() => {
    if (!enabled) {
      clearAllTimers();
      return;
    }

    // Start initial timer
    startInactivityTimer();

    // Activity events to track
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
    };
  }, [enabled, handleActivity, startInactivityTimer, clearAllTimers]);

  return {
    showWarning,
    countdown,
    handleStayLoggedIn,
    handleLogoutNow,
    resetTimer
  };
}
