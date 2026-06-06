import posthog from 'posthog-js';

// Initialize PostHog
// We use environment variables to keep the keys secure
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';

export const initAnalytics = () => {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    console.log("[Analytics] Initializing PostHog...");
    posthog.init(POSTHOG_KEY, {
      api_host: 'https://eu.i.posthog.com',
      autocapture: true,
      capture_pageview: true,
      persistence: 'localStorage',
      person_profiles: 'identified_only',
      disable_session_recording: false,
      debug: true, 
    });
  } else {
    console.error("[Analytics] FATAL: PostHog Key is missing. Tracking will not work.");
  }
};

/**
 * Tactical Event Tracking
 * Use this to track specific high-value actions like "Join Alpha" clicks
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  console.log(`[Analytics] Attempting to track: ${eventName}`, properties);
  
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    // We use a callback or a short delay to ensure the event is sent 
    // before the browser cancels the request during navigation.
    posthog.capture(eventName, properties);
  }
};

/**
 * User Identification
 * Use this after a successful signup to link the anonymous visitor to their new account
 */
export const identifyUser = (userId: string, email: string) => {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.identify(userId, {
      email,
    });
  }
};
