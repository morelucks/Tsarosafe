/**
 * EnvironmentWarning component
 * Displays a warning banner when critical environment variables are missing
 */

'use client';

import { useState, useEffect } from 'react';
import { isWalletConnectConfigured } from '@/lib/env';

export function EnvironmentWarning() {
  const [isClient, setIsClient] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check if WalletConnect is configured
    const isConfigured = isWalletConnectConfigured();
    setShowWarning(!isConfigured);

    // Check if user has previously dismissed the warning
    const dismissed = localStorage.getItem('env-warning-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('env-warning-dismissed', 'true');
  };

  // Don't render on server or if dismissed or if properly configured
  if (!isClient || isDismissed || !showWarning) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">
              ⚠️ Wallet Connection Disabled
            </p>
            <p className="text-sm mt-1 opacity-95">
              <code className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-mono">
                NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
              </code>{' '}
              is not configured. Get your free Project ID from{' '}
              <a
                href="https://cloud.reown.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-white/90 transition-colors"
              >
                cloud.reown.com
              </a>
              , then add it to your <code className="bg-white/20 px-1 py-0.5 rounded text-xs font-mono">.env.local</code> file.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="inline-flex items-center px-3 py-1.5 border border-white/30 text-xs font-semibold rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500"
              aria-label="Dismiss warning"
            >
              Dismiss
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center justify-center p-1 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close warning"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Dev-only reset button */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => {
              localStorage.removeItem('env-warning-dismissed');
              setIsDismissed(false);
            }}
            className="mt-2 text-xs opacity-50 hover:opacity-100 underline"
            aria-label="Reset warning dismissal (dev only)"
          >
            [Dev] Reset dismissal
          </button>
        )}
      </div>
    </div>
  );
}
