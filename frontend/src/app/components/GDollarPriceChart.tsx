"use client";
import { useState, useMemo, useEffect } from "react";
import { useGDollarPriceHistory } from "@/hooks/useGDollarPrice";
import { PRICE_CHART_PERIODS } from "@/lib/constants";

interface GDollarPriceChartProps {
  className?: string;
  height?: number;
}

type Period = keyof typeof PRICE_CHART_PERIODS;

export default function GDollarPriceChart({
  className = "",
  height = 300
}: GDollarPriceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7d');
  const { chartData, isLoading, error, refetch } = useGDollarPriceHistory(selectedPeriod);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartStats = useMemo(() => {
    if (!chartData?.prices || chartData.prices.length === 0) {
      return { min: 0, max: 0, change: 0, changePercent: 0 };
    }

    const prices = chartData.prices.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const first = prices[0];
    const last = prices[prices.length - 1];
    const change = last - first;
    const changePercent = first !== 0 ? (change / first) * 100 : 0;

    return { min, max, change, changePercent };
  }, [chartData]);

  const svgPath = useMemo(() => {
    if (!chartData?.prices || chartData.prices.length < 2) return '';

    const prices = chartData.prices;
    const { min, max } = chartStats;
    const range = max - min || 1; // Avoid division by zero

    const width = 800; // SVG viewBox width
    const chartHeight = height - 40; // Leave space for padding

    const pathPoints = prices.map((point, index) => {
      const x = (index / (prices.length - 1)) * width;
      const y = chartHeight - ((point.price - min) / range) * chartHeight + 20;
      return { x, y };
    });

    // Build SVG path: M x1,y1 L x2,y2 L x3,y3 ...
    const firstPoint = pathPoints[0];
    const path = pathPoints
      .map((point, index) => {
        if (index === 0) {
          return `M ${firstPoint.x},${firstPoint.y}`;
        }
        return `L ${point.x},${point.y}`;
      })
      .join(' ');

    return path;
  }, [chartData, chartStats, height]);

  const formatPrice = (price: number) => {
    if (price < 0.001) return price.toExponential(3);
    return price.toFixed(6);
  };

  const formatChange = (change: number, percent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatPrice(Math.abs(change))} (${sign}${percent.toFixed(2)}%)`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const periods: { key: Period; label: string }[] = [
    { key: '1h', label: '1H' },
    { key: '24h', label: '24H' },
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
    { key: '1y', label: '1Y' },
  ];

  if (!mounted || isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`} style={{ height: `${height + 100}px` }}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-[200px] bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load price chart</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">G$ Price Chart</h3>
          {chartData && (
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-600">
                Range: ${formatPrice(chartStats.min)} - ${formatPrice(chartStats.max)}
              </span>
              <span className={`text-sm font-medium ${getChangeColor(chartStats.change)}`}>
                {formatChange(chartStats.change, chartStats.changePercent)}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={refetch}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh chart"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
        {periods.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedPeriod(key)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedPeriod === key
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: `${height}px` }}>
        {chartData?.prices && chartData.prices.length > 0 ? (
          <svg
            viewBox={`0 0 800 ${height}`}
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="80" height={height / 5} patternUnits="userSpaceOnUse">
                <path d={`M 80 0 L 0 0 0 ${height / 5}`} fill="none" stroke="#f3f4f6" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="800" height={height} fill="url(#grid)" />

            {/* Price line */}
            <path
              d={svgPath}
              fill="none"
              stroke={chartStats.change >= 0 ? "#10b981" : "#ef4444"}
              strokeWidth="2"
              className="drop-shadow-sm"
            />

            {/* Area fill */}
            <path
              d={`${svgPath} L 800,${height} L 0,${height} Z`}
              fill={chartStats.change >= 0 ? "url(#greenGradient)" : "url(#redGradient)"}
              opacity="0.1"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            No chart data available
          </div>
        )}
      </div>

      {/* Chart Info */}
      {chartData && (
        <div className="mt-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">
              {chartData.prices.length} data points
            </span>
            {chartData._isFallback && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                ⚠️ Estimated Data
              </span>
            )}
            {!chartData._isFallback && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                ✓ Live Data
              </span>
            )}
          </div>
          <span className="text-gray-600">
            Period: {periods.find(p => p.key === selectedPeriod)?.label}
          </span>
        </div>
      )}
    </div>
  );
}