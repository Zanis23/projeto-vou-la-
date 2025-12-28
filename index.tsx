import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
// import { initSentry, SentryErrorBoundary } from './utils/sentry';
import { initAnalytics } from './utils/analytics';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './index.css';

// Initialize monitoring
// initSentry(); // Temporarily disabled for debugging
initAnalytics();

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './src/core/queryClient';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
        <Analytics />
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);