import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import BackgroundSync from './components/performance/BackgroundSync';

import OfflineIndicator from './components/performance/OfflineIndicator';

import DevPerformancePanel from './components/performance/DevPerformancePanel';

import Setup from './components/Setup';
import ErrorBoundary from './components/ErrorBoundary';
import { logger } from './lib/logger';
import './index.css';

if (typeof window !== 'undefined') {
  // Wrap console.error to intercept and demote benign network offline fetch errors
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    const joined = args.map(a => typeof a === 'string' ? a : (a?.message || JSON.stringify(a || ''))).join(' ');
    if (joined.includes('Failed to fetch') || joined.includes('fetch failed')) {
      console.warn('[NETWORK-OFFLINE]', ...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reasonMsg = event.reason?.message || String(event.reason || '');
    if (reasonMsg.includes('Failed to fetch') || reasonMsg.includes('fetch failed')) {
      event.preventDefault();
      logger.warn('Suppressed unhandled network rejection', { reason: event.reason });
      return;
    }
    logger.error('Unhandled Promise Rejection', { reason: event.reason });
  });

  window.addEventListener('error', (event) => {
    const errMsg = event.message || event.error?.message || '';
    if (errMsg.includes('Failed to fetch') || errMsg.includes('fetch failed')) {
      event.preventDefault();
      logger.warn('Suppressed global network error', { message: errMsg });
      return;
    }
    logger.fatal('Global Uncaught Error', { message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno, error: event.error });
  });
}

// Register PWA service worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.info('New content available, please refresh.');
  },
  onOfflineReady() {
    console.info('App ready to work offline');
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const hasSupabaseCredentials = 
  !!import.meta.env.VITE_SUPABASE_URL && 
  !!import.meta.env.VITE_SUPABASE_ANON_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BackgroundSync />
        <OfflineIndicator />
        {import.meta.env.DEV && <DevPerformancePanel />}
        {hasSupabaseCredentials ? <App /> : <Setup />}
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
