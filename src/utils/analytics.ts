/**
 * Analytics and Event Tracking
 * Track user actions and custom events
 */

import * as Sentry from '@sentry/react';

// Event types
export type AnalyticsEvent =
    // User events
    | 'user_signup'
    | 'user_login'
    | 'user_logout'
    | 'profile_updated'

    // Place events
    | 'place_viewed'
    | 'place_checked_in'
    | 'place_saved'
    | 'place_unsaved'

    // Social events
    | 'match_sent'
    | 'match_received'
    | 'message_sent'
    | 'friend_added'

    // AI events
    | 'ai_recommendation_requested'
    | 'ai_recommendation_clicked'

    // App events
    | 'app_installed'
    | 'notification_enabled'
    | 'share_clicked';

interface EventProperties {
    [key: string]: string | number | boolean | undefined;
}

/**
 * Track custom event
 */
export function trackEvent(
    event: AnalyticsEvent,
    properties?: EventProperties
) {
    try {
        // Log to console in development
        if (import.meta.env.DEV) {
            console.log('[Analytics]', event, properties);
        }

        // Send to Sentry as breadcrumb
        Sentry.addBreadcrumb({
            category: 'analytics',
            message: event,
            data: properties,
            level: 'info',
        });

        // Send to Vercel Analytics (if available)
        if (typeof window !== 'undefined' && (window as any).va) {
            (window as any).va('track', event, properties);
        }

        // Send to PostHog (if configured)
        if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture(event, properties);
        }
    } catch (error) {
        console.error('[Analytics] Error tracking event:', error);
    }
}

/**
 * Track page view
 */
export function trackPageView(pageName: string, properties?: EventProperties) {
    trackEvent('place_viewed' as AnalyticsEvent, {
        page: pageName,
        ...properties,
    });
}

/**
 * Track user action
 */
export function trackUserAction(action: string, properties?: EventProperties) {
    trackEvent(action as AnalyticsEvent, properties);
}

/**
 * Track error
 */
export function trackError(error: Error, context?: EventProperties) {
    Sentry.captureException(error, {
        extra: context,
    });
}

/**
 * Track performance metric
 */
export function trackPerformance(metric: string, value: number, unit: string = 'ms') {
    if (import.meta.env.DEV) {
        console.log(`[Performance] ${metric}: ${value}${unit}`);
    }

    Sentry.addBreadcrumb({
        category: 'performance',
        message: metric,
        data: { value, unit },
        level: 'info',
    });
}

/**
 * Track conversion funnel step
 */
export function trackFunnelStep(
    funnel: string,
    step: string,
    properties?: EventProperties
) {
    trackEvent('place_viewed' as AnalyticsEvent, {
        funnel,
        step,
        ...properties,
    });
}

/**
 * Initialize analytics
 */
export function initAnalytics() {
    console.log('[Analytics] Initialized');

    // Track app load time
    if (typeof window !== 'undefined' && window.performance) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        trackPerformance('app_load_time', loadTime);
    }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: EventProperties) {
    if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.people.set(properties);
    }

    Sentry.setContext('user_properties', properties);
}

/**
 * Track A/B test variant
 */
export function trackExperiment(
    experimentName: string,
    variant: string,
    properties?: EventProperties
) {
    trackEvent('place_viewed' as AnalyticsEvent, {
        experiment: experimentName,
        variant,
        ...properties,
    });
}
