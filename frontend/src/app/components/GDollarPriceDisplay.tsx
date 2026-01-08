"use client";
import { useState, useEffect } from "react";
import { useGDollarPrice } from "@/hooks/useGDollarPrice";
import { GDOLLAR_PRICE_CONFIG } from "@/lib/constants";
import { priceHealthChecker } from "@/lib/priceHealthCheck";

interface GDollarPriceDisplayProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export default function GDollarPriceDisplay({ 
  showDetails = false, 
  compact = false,
  className = ""
}: GDollarPriceDisplayProps) {
  const { price, isLoading, error, refetch, lastUpdated } = useGDollarPrice();
  const [showRefresh, setShowRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiHealth, setApiHealth] = useState<{ isHealthy: boolean; lastCheck: number } | null>(null);

  // Check API health on mount and periodically
  useEffect(() => {
    const checkHealth = async () => {
      const status = await priceHealthChecker.checkHealth();
      setApiHealth({ isHealthy: status.isHealthy, lastCheck: status.lastCheck });
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  if (isLoading && !price) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error && !price) {
    return (
      <div className={`bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white ${className}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold mb-1">G$ Price</h3>
            <p className="text-sm opacity-90">GoodDollar to USD</p>
          </div>
          <div className="text-2xl">💱</div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-90">Current Rate:</span>
            <span className="font-bold text-xl">
              ${GDOLLAR_PRICE_CONFIG.FALLBACK_PRICE.toFixed(6)} (Est.)
            </span>
          </div>
          <div className="bg-yellow-100 text-yellow-800 text-xs p-2 rounded">
            ⚠️ Using estimated price. Unable to fetch live data.
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full mt-2 py-2 px-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Retry Connection'}
          </button>
        </div>
      </div>
    );
  }

  if (!price) return null;

  const formatPrice = (value: number) => {
    if (value < 0.001) {
      return value.toExponential(3);
    }
    return value.toFixed(6);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = Date.now();
    const diff = now - lastUpdated;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <span className="text-sm font-medium text-gray-900">
          1 G$ = ${formatPrice(price.usd)}
        </span>
        {price.change24h !== undefined && (
          <span className={`text-xs font-medium ${getChangeColor(price.change24h)}`}>
            {formatChange(price.change24h)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white ${className}`}
      onMouseEnter={() => setShowRefresh(true)}
      onMouseLeave={() => setShowRefresh(false)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold mb-1">G$ Price</h3>
          <p className="text-sm opacity-90">GoodDollar to USD</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-2xl">💱</div>
          {showRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-white hover:text-blue-200 transition-colors disabled:opacity-50"
              title="Refresh price"
            >
              <svg 
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-90">Current Rate:</span>
          <span className="font-bold text-xl">
            ${formatPrice(price.usd)}
          </span>
        </div>

        {price.change24h !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-90">24h Change:</span>
            <span className={`font-medium ${
              price.change24h >= 0 ? 'text-green-200' : 'text-red-200'
            }`}>
              {formatChange(price.change24h)}
            </span>
          </div>
        )}

        {showDetails && (
          <>
            {price.marketCap && price.marketCap > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-90">Market Cap:</span>
                <span className="font-medium">
                  ${(price.marketCap / 1000000).toFixed(2)}M
                </span>
              </div>
            )}

            {price.volume24h && price.volume24h > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-90">24h Volume:</span>
                <span className="font-medium">
                  ${(price.volume24h / 1000000).toFixed(2)}M
                </span>
              </div>
            )}
          </>
        )}

        <div className="pt-2 border-t border-blue-400 border-opacity-30">
          <div className="flex justify-between items-center">
            <span className="text-xs opacity-75">Last Updated:</span>
            <span className="text-xs opacity-75">{formatLastUpdated()}</span>
          </div>
          {apiHealth && (
            <div className="flex items-center justify-end mt-1">
              <div className={`w-2 h-2 rounded-full mr-1 ${
                apiHealth.isHealthy ? 'bg-green-300' : 'bg-red-300'
              }`}></div>
              <span className="text-xs opacity-75">
                {apiHealth.isHealthy ? 'API Online' : 'API Offline'}
              </span>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="absolute top-2 right-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}