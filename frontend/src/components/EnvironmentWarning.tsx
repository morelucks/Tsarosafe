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
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <p className="text-sm font-bold">⚠️ Wallet Connection Disabled</p>
      </div>
    </div>
  );
}
