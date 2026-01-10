/**
 * G$ Price Oracle Service
 * Fetches real-time and historical price data for GoodDollar
 */

import { GDollarPrice, PriceHistoryPoint, PriceChartData } from '@/types/price';
import { GDOLLAR_PRICE_CONFIG, PRICE_CHART_PERIODS } from './constants';
import { logger } from './logger';

class PriceOracleService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private retryCount: Map<string, number> = new Map();

  /**
   * Get current G$ price from CoinGecko
   */
  async getCurrentPrice(): Promise<GDollarPrice> {
    const cacheKey = 'current-price';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Try using Next.js API route first (avoids CORS issues in Farcaster)
      let response: Response;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        try {
          response = await fetch('/api/price', {
            headers: {
              'Accept': 'application/json',
            },
            signal: controller.signal,
          });
        } catch (apiError) {
          // Fallback to direct CoinGecko API if API route fails
          console.warn('API route failed, trying direct CoinGecko:', apiError);
          response = await fetch(
            `${GDOLLAR_PRICE_CONFIG.COINGECKO_API}/simple/price?ids=${GDOLLAR_PRICE_CONFIG.GDOLLAR_ID}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
            {
              headers: {
                'Accept': 'application/json',
              },
              signal: controller.signal,
            }
          );
        }
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const gdollarData = data[GDOLLAR_PRICE_CONFIG.GDOLLAR_ID];

      if (!gdollarData) {
        throw new Error('GoodDollar price data not found');
      }

      const priceData: GDollarPrice = {
        usd: gdollarData.usd || GDOLLAR_PRICE_CONFIG.FALLBACK_PRICE,
        lastUpdated: Date.now(),
        change24h: gdollarData.usd_24h_change || 0,
        marketCap: gdollarData.usd_market_cap || 0,
        volume24h: gdollarData.usd_24h_vol || 0,
      };

      this.setCachedData(cacheKey, priceData);
      this.retryCount.delete(cacheKey);
      
      logger.info('Successfully fetched G$ price', {
        component: 'PriceOracle',
        action: 'getCurrentPrice',
        metadata: { price: priceData.usd, change24h: priceData.change24h }
      });
      
      return priceData;
    } catch (error) {
      logger.error('Failed to fetch G$ price', error, {
        component: 'PriceOracle',
        action: 'getCurrentPrice',
        metadata: { cacheKey }
      });
      // Return fallback price with error flag
      return this.handlePriceError(cacheKey);
    }
  }

  /**
   * Get historical price data for charts
   */
  async getHistoricalPrices(period: keyof typeof PRICE_CHART_PERIODS): Promise<PriceChartData> {
    const cacheKey = `historical-${period}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const config = PRICE_CHART_PERIODS[period];
      const response = await fetch(
        `${GDOLLAR_PRICE_CONFIG.COINGECKO_API}/coins/${GDOLLAR_PRICE_CONFIG.GDOLLAR_ID}/market_chart?vs_currency=usd&days=${config.days}&interval=${config.interval}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.prices || !Array.isArray(data.prices)) {
        throw new Error('Invalid historical price data format');
      }

      const prices: PriceHistoryPoint[] = data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
        volume: data.total_volumes?.find(([t]: [number, number]) => t === timestamp)?.[1] || 0,
      }));

      const chartData: PriceChartData = {
        prices,
        period,
        currency: 'usd',
      };

      this.setCachedData(cacheKey, chartData);
      this.retryCount.delete(cacheKey);
      
      logger.info(`Successfully fetched G$ historical prices for ${period}`, {
        component: 'PriceOracle',
        action: 'getHistoricalPrices',
        metadata: { period, dataPoints: prices.length }
      });
      
      return chartData;
    } catch (error) {
      logger.error(`Failed to fetch G$ historical prices for ${period}`, error, {
        component: 'PriceOracle',
        action: 'getHistoricalPrices',
        metadata: { period }
      });
      return this.handleHistoricalError(period);
    }
  }

  /**
   * Convert G$ amount to USD
   */
  async convertGDollarToUSD(gdollarAmount: number): Promise<number> {
    const priceData = await this.getCurrentPrice();
    return gdollarAmount * priceData.usd;
  }

  /**
   * Convert USD amount to G$
   */
  async convertUSDToGDollar(usdAmount: number): Promise<number> {
    const priceData = await this.getCurrentPrice();
    return usdAmount / priceData.usd;
  }

  /**
   * Get cached data if still valid
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < GDOLLAR_PRICE_CONFIG.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set data in cache
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle price fetch errors with fallback
   */
  private handlePriceError(cacheKey: string): GDollarPrice {
    const retries = this.retryCount.get(cacheKey) || 0;
    this.retryCount.set(cacheKey, retries + 1);

    // Return fallback price data
    return {
      usd: GDOLLAR_PRICE_CONFIG.FALLBACK_PRICE,
      lastUpdated: Date.now(),
      change24h: 0,
      marketCap: 0,
      volume24h: 0,
    };
  }

  /**
   * Handle historical data errors with fallback
   */
  private handleHistoricalError(period: keyof typeof PRICE_CHART_PERIODS): PriceChartData {
    // Return minimal fallback data
    const now = Date.now();
    const config = PRICE_CHART_PERIODS[period];
    const dayMs = 24 * 60 * 60 * 1000;
    
    const prices: PriceHistoryPoint[] = Array.from({ length: config.days }, (_, i) => ({
      timestamp: now - (config.days - i - 1) * dayMs,
      price: GDOLLAR_PRICE_CONFIG.FALLBACK_PRICE,
      volume: 0,
    }));

    return {
      prices,
      period,
      currency: 'usd',
    };
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
    this.retryCount.clear();
  }
}

// Export singleton instance
export const priceOracle = new PriceOracleService();
export default priceOracle;