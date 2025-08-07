import mondaySdk from 'monday-sdk-js';

// Initialize Monday SDK
const monday = mondaySdk();

// For development: Add debugging
if (typeof window !== 'undefined') {
  console.log('Monday SDK initialized:', monday);
  console.log('Environment:', {
    isInIframe: window.self !== window.top,
    userAgent: navigator.userAgent,
    location: window.location.href
  });
}

export default monday;