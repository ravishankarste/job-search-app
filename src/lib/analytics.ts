import posthog from 'posthog-js';

// Initialize PostHog
// We use environment variables to keep the keys secure
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';

export const initAnalytics = () => {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: 'https://eu.i.posthog.com',
      autocapture: true,
      capture_pageview: true,
      persistence: 'localStorage',
      person_profiles: 'identified_only',
    });
  }
};

/**
 * Tactical Event Tracking
 * Use this to track specific high-value actions like "Join Alpha" clicks
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
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
