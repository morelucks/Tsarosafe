/**
 * Next.js API route to proxy CoinGecko price requests
 * This avoids CORS issues in Farcaster and other embedded environments
 */

import { NextResponse } from 'next/server';
import { GDOLLAR_PRICE_CONFIG } from '@/lib/constants';

interface PriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET() {
  try {
    const response = await fetch(
      `${GDOLLAR_PRICE_CONFIG.COINGECKO_API}/simple/price?ids=${GDOLLAR_PRICE_CONFIG.GDOLLAR_ID}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`CoinGecko API error: ${response.status} - ${errorText}`);
    }

    const data: PriceResponse = await response.json();
    
    // Validate response structure
    if (!data[GDOLLAR_PRICE_CONFIG.GDOLLAR_ID]) {
      throw new Error('Invalid price data structure received from CoinGecko');
    }
    
    // Return the data with CORS headers for Farcaster
    return NextResponse.json(data, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Price API route error:', errorMessage, error);
    
    // Return fallback price data with error indicator
    return NextResponse.json(
      {
        [GDOLLAR_PRICE_CONFIG.GDOLLAR_ID]: {
          usd: GDOLLAR_PRICE_CONFIG.FALLBACK_PRICE,
          usd_24h_change: 0,
          usd_market_cap: 0,
          usd_24h_vol: 0,
          _fallback: true,
          _error: errorMessage,
        },
      },
      {
        status: 200, // Return 200 with fallback data
        headers: corsHeaders,
      }
    );
  }
}

