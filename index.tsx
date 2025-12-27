import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { initSentry, SentryErrorBoundary } from './utils/sentry';
import { initAnalytics } from './utils/analytics';
import App from './App';
import './index.css';

// Initialize monitoring
initSentry();
initAnalytics();

// Error fallback component
function ErrorFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0E1121',
      color: '#fff',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😔</div>
      <h1 style={{ color: '#ccff00', marginBottom: '1rem' }}>Algo deu errado</h1>
      <p style={{ color: '#999', marginBottom: '2rem' }}>
        Estamos trabalhando para resolver o problema.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: '#ccff00',
          color: '#0E1121',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Recarregar Página
      </button>
    </div>
  );
}

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './src/core/queryClient';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SentryErrorBoundary fallback={<ErrorFallback />}>
        <App />
        <Analytics />
      </SentryErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);