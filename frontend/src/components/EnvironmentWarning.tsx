/**
 * EnvironmentWarning component
 * Displays a warning banner when critical environment variables are missing
 */

'use client';

import { useState, useEffect } from 'react';
import { isWalletConnectConfigured } from '@/lib/env';

export function EnvironmentWarning() {
  const [isClient, setIsClient] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const isConfigured = isWalletConnectConfigured();
    setShowWarning(!isConfigured);
  }, []);

  if (!isClient || !showWarning) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
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
          <div className="flex-1">
            <p className="text-sm font-bold">⚠️ Wallet Connection Disabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
