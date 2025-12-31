/**
 * Sentry Configuration
 * Error tracking and performance monitoring
 */

import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry
 * Call this in main.tsx before rendering the app
 */
export function initSentry() {
    // Only initialize in production or if explicitly enabled
    const isDev = import.meta.env.DEV;
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

    if (!sentryDsn) {
        console.warn('[Sentry] DSN not configured, skipping initialization');
        return;
    }

    Sentry.init({
        dsn: sentryDsn,

        // Environment
        environment: import.meta.env.MODE,

        // Release tracking
        release: `voula@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,

        // Integrations
        integrations: [
            // Browser tracing for performance monitoring
            Sentry.browserTracingIntegration({
                // Set sampling rate for performance monitoring
                // tracePropagationTargets: [
                //    "localhost",
                //    /^https:\/\/.*\.vercel\.app/,
                //    /^https:\/\/.*\.supabase\.co/
                // ],
            }),

            // Session replay for debugging
            Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],

        // Performance Monitoring
        tracesSampleRate: isDev ? 1.0 : 0.1, // 100% in dev, 10% in prod

        // Session Replay
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

        // Before send hook - filter sensitive data
        beforeSend(event, _hint) {
            // Don't send events in development unless explicitly enabled
            if (isDev && !import.meta.env.VITE_SENTRY_ENABLED) {
                return null;
            }

            // Filter out sensitive data
            if (event.request) {
                delete event.request.cookies;
                delete event.request.headers;
            }

            return event;
        },

        // Ignore certain errors
        ignoreErrors: [
            // Browser extensions
            'top.GLOBALS',
            'chrome-extension://',
            'moz-extension://',

            // Network errors (handled separately)
            'NetworkError',
            'Failed to fetch',

            // ResizeObserver (benign)
            'ResizeObserver loop limit exceeded',
        ],
    });

    console.log('[Sentry] Initialized successfully');
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: {
    id: string;
    email?: string;
    username?: string;
}) {
    Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
    });
}

/**
 * Clear user context (on logout)
 */
export function clearSentryUser() {
    Sentry.setUser(null);
}

/**
 * Capture custom error
 */
export function captureError(error: Error, context?: Record<string, any>) {
    Sentry.captureException(error, {
        extra: context,
    });
}

/**
 * Capture custom message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb (for debugging context)
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
        message,
        data,
        level: 'info',
    });
}

/**
 * Start a performance transaction
 */
export function startTransaction(_name: string, _op: string) {
    // Sentry v8 removed startTransaction. Stubbing for now.
    return { finish: () => { } };
    /* return Sentry.startTransaction({
        name,
        op,
    }); */
}

/**
 * Wrap component with Sentry error boundary
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;
