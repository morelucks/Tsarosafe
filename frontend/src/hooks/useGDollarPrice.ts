/**
 * React hooks for G$ price data management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GDollarPrice, PriceChartData, ConversionResult } from '@/types/price';
import { priceOracle } from '@/lib/priceOracle';
import { GDOLLAR_PRICE_CONFIG, PRICE_CHART_PERIODS } from '@/lib/constants';

/**
 * Hook to get current G$ price with auto-refresh
 */
export function useGDollarPrice() {
  const [price, setPrice] = useState<GDollarPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      setError(null);
      const priceData = await priceOracle.getCurrentPrice();
      setPrice(priceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPrice();

    // Set up auto-refresh interval
    intervalRef.current = setInterval(fetchPrice, GDOLLAR_PRICE_CONFIG.UPDATE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPrice]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetchPrice();
  }, [fetchPrice]);

  return {
    price,
    isLoading,
    error,
    refetch,
    lastUpdated: price?.lastUpdated,
  };
}

/**
 * Hook to get historical G$ price data for charts
 */
export function useGDollarPriceHistory(period: keyof typeof PRICE_CHART_PERIODS = '7d') {
  const [chartData, setChartData] = useState<PriceChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await priceOracle.getHistoricalPrices(period);
      setChartData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  const refetch = useCallback(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  return {
    chartData,
    isLoading,
    error,
    refetch,
    period,
  };
}

/**
 * Hook for G$ to USD conversions
 */
export function useGDollarConversion() {
  const { price, isLoading: isPriceLoading } = useGDollarPrice();
  const [isConverting, setIsConverting] = useState(false);

  const convertToUSD = useCallback(async (gdollarAmount: number): Promise<ConversionResult | null> => {
    if (!price || gdollarAmount < 0) return null;

    setIsConverting(true);
    try {
      const usdAmount = await priceOracle.convertGDollarToUSD(gdollarAmount);
      return {
        gdollarAmount,
        usdAmount,
        rate: price.usd,
        lastUpdated: price.lastUpdated,
      };
    } catch (error) {
      console.error('Conversion failed:', error);
      return null;
    } finally {
      setIsConverting(false);
    }
  }, [price]);

  const convertFromUSD = useCallback(async (usdAmount: number): Promise<ConversionResult | null> => {
    if (!price || usdAmount < 0) return null;

    setIsConverting(true);
    try {
      const gdollarAmount = await priceOracle.convertUSDToGDollar(usdAmount);
      return {
        gdollarAmount,
        usdAmount,
        rate: price.usd,
        lastUpdated: price.lastUpdated,
      };
    } catch (error) {
      console.error('Conversion failed:', error);
      return null;
    } finally {
      setIsConverting(false);
    }
  }, [price]);

  const getUSDValue = useCallback((gdollarAmount: number): number => {
    if (!price || gdollarAmount < 0) return 0;
    return gdollarAmount * price.usd;
  }, [price]);

  const getGDollarValue = useCallback((usdAmount: number): number => {
    if (!price || usdAmount < 0) return 0;
    return usdAmount / price.usd;
  }, [price]);

  return {
    price,
    convertToUSD,
    convertFromUSD,
    getUSDValue,
    getGDollarValue,
    isLoading: isPriceLoading || isConverting,
    rate: price?.usd || 0,
  };
}

/**
 * Hook for real-time price monitoring with alerts
 */
export function useGDollarPriceMonitor(alertThreshold?: number) {
  const { price, isLoading, error } = useGDollarPrice();
  const [priceAlert, setPriceAlert] = useState<{
    type: 'increase' | 'decrease';
    oldPrice: number;
    newPrice: number;
    change: number;
  } | null>(null);
  const previousPriceRef = useRef<number | null>(null);

  useEffect(() => {
    if (price && previousPriceRef.current !== null && alertThreshold) {
      const oldPrice = previousPriceRef.current;
      const newPrice = price.usd;
      const change = ((newPrice - oldPrice) / oldPrice) * 100;

      if (Math.abs(change) >= alertThreshold) {
        setPriceAlert({
          type: change > 0 ? 'increase' : 'decrease',
          oldPrice,
          newPrice,
          change,
        });

        // Clear alert after 5 seconds
        setTimeout(() => setPriceAlert(null), 5000);
      }
    }

    if (price) {
      previousPriceRef.current = price.usd;
    }
  }, [price, alertThreshold]);

  return {
    price,
    isLoading,
    error,
    priceAlert,
    clearAlert: () => setPriceAlert(null),
  };
}