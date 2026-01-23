'use client';

import { useEffect } from 'react';

export default function HoneybookErrorHandler() {
  useEffect(() => {
    // Suppress non-critical Honeybook branding data script errors
    const originalError = console.error.bind(console);
    
    // Also handle error events from scripts
    const handleScriptError = (event: ErrorEvent) => {
      const errorSource = event.filename || '';
      const errorMessage = event.message || '';
      
      // Suppress Honeybook branding data script errors
      if (errorSource.includes('honeybook.com') || 
          errorSource.includes('placement-controller') ||
          errorMessage.includes('brandingDataScript')) {
        event.preventDefault();
        return;
      }
    };
    
    console.error = (...args: any[]) => {
      // Filter out Honeybook branding data script errors
      const errorString = String(args[0] || '');
      if (errorString.includes('brandingDataScript.onerror') || 
          errorString.includes('placement-controller.min.js') ||
          (typeof args[0] === 'object' && args[0]?.type === 'error' && 
           (args[0]?.target as any)?.src?.includes('honeybook.com'))) {
        // Suppress this non-critical error
        return;
      }
      // Log all other errors normally
      originalError(...args);
    };

    // Add global error handler for script errors
    window.addEventListener('error', handleScriptError, true);

    return () => {
      // Restore original console.error on unmount
      console.error = originalError;
      window.removeEventListener('error', handleScriptError, true);
    };
  }, []);

  return null;
}

