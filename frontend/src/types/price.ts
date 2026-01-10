// Type definitions for G$ price data and conversions
export interface GDollarPrice {
  usd: number;
  lastUpdated: number;
  change24h?: number;
  marketCap?: number;
  volume24h?: number;
}

export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface PriceChartData {
  prices: PriceHistoryPoint[];
  period: '1h' | '24h' | '7d' | '30d' | '90d' | '1y';
  currency: 'usd';
  _isFallback?: boolean; // Flag to indicate if this is fallback data
}

export interface ConversionResult {
  gdollarAmount: number;
  usdAmount: number;
  rate: number;
  lastUpdated: number;
}

export interface PriceOracleConfig {
  apiUrl: string;
  updateInterval: number;
  fallbackPrice: number;
  maxRetries: number;
}