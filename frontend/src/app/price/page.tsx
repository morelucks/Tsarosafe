"use client";
import Link from "next/link";
import GDollarPriceDisplay from "@/app/components/GDollarPriceDisplay";
import GDollarPriceChart from "@/app/components/GDollarPriceChart";
import { useGDollarPrice, useGDollarConversion } from "@/hooks/useGDollarPrice";
import { useState } from "react";

export default function PricePage() {
  const { price, isLoading, error, refetch } = useGDollarPrice();
  const { convertToUSD, convertFromUSD } = useGDollarConversion();
  const [gdollarInput, setGDollarInput] = useState("");
  const [usdInput, setUSDInput] = useState("");
  const [conversionError, setConversionError] = useState<string | null>(null);

  const handleGDollarConvert = async () => {
    const amount = parseFloat(gdollarInput);
    if (isNaN(amount) || amount <= 0) {
      setConversionError("Enter a valid G$ amount");
      return;
    }
    setConversionError(null);
    
    const result = await convertToUSD(amount);
    if (result) {
      setUSDInput(result.usdAmount.toFixed(6));
    }
  };

  const handleUSDConvert = async () => {
    const amount = parseFloat(usdInput);
    if (isNaN(amount) || amount <= 0) {
      setConversionError("Enter a valid USD amount");
      return;
    }
    setConversionError(null);
    
    const result = await convertFromUSD(amount);
    if (result) {
      setGDollarInput(result.gdollarAmount.toFixed(2));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">GoodDollar Price</h1>
          <p className="mt-2 text-gray-600">
            Real-time G$ price data, historical charts, and conversion tools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Price Info and Converter */}
          <div className="space-y-6">
            {/* Current Price */}
            <GDollarPriceDisplay showDetails={true} />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={refetch} className="underline hover:text-red-800">Retry</button>
                </div>
              </div>
            )}

            {/* Price Converter */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Converter</h3>
              
              <div className="space-y-4">
                {/* G$ to USD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GoodDollar (G$)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={gdollarInput}
                      onChange={(e) => setGDollarInput(e.target.value)}
                      placeholder="Enter G$ amount"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      onClick={handleGDollarConvert}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Convert
                    </button>
                  </div>
                </div>

                {/* Conversion Arrow */}
                <div className="flex justify-center">
                  <div className="text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </div>

                {/* USD to G$ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    US Dollar (USD)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={usdInput}
                      onChange={(e) => setUSDInput(e.target.value)}
                      placeholder="Enter USD amount"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      onClick={handleUSDConvert}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Convert
                    </button>
                  </div>
                </div>
              </div>
              {conversionError && (
                <p className="text-sm text-red-600 mt-2">{conversionError}</p>
              )}

              {price && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Current rate: 1 G$ = ${price.usd.toFixed(6)} USD
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {new Date(price.lastUpdated).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Market Stats */}
            {price && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Statistics</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Price:</span>
                    <span className="font-medium">${price.usd.toFixed(6)}</span>
                  </div>
                  
                  {price.change24h !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">24h Change:</span>
                      <span className={`font-medium ${
                        price.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                      </span>
                    </div>
                  )}
                  
                  {price.marketCap && price.marketCap > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Market Cap:</span>
                      <span className="font-medium">
                        ${(price.marketCap / 1000000).toFixed(2)}M
                      </span>
                    </div>
                  )}
                  
                  {price.volume24h && price.volume24h > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">24h Volume:</span>
                      <span className="font-medium">
                        ${(price.volume24h / 1000000).toFixed(2)}M
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Price Chart */}
          <div className="lg:col-span-2">
            <GDollarPriceChart height={400} />
          </div>
        </div>

        {/* About GoodDollar */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About GoodDollar (G$)</h2>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              GoodDollar is a digital currency designed to provide universal basic income (UBI) 
              to people around the world. Built on blockchain technology, G$ aims to reduce 
              wealth inequality by distributing free money to verified users daily.
            </p>
            <p className="mb-4">
              The GoodDollar protocol operates on multiple blockchains including Ethereum and 
              Celo, making it accessible to users globally. The currency is backed by a reserve 
              of cryptocurrencies and generates yield through DeFi protocols.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🌍</div>
                <h4 className="font-semibold">Global UBI</h4>
                <p className="text-sm">Daily income for verified users worldwide</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🔗</div>
                <h4 className="font-semibold">Multi-Chain</h4>
                <p className="text-sm">Available on Ethereum, Celo, and other networks</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">💰</div>
                <h4 className="font-semibold">DeFi Backed</h4>
                <p className="text-sm">Supported by yield-generating protocols</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}