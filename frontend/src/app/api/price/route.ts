/**
 * Next.js API route to proxy CoinGecko price requests
 * This avoids CORS issues in Farcaster and other embedded environments
 */

import { NextResponse } from 'next/server';
import { GDOLLAR_PRICE_CONFIG } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

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
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the data with CORS headers for Farcaster
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Price API route error:', error);
    
    // Return fallback price data
    return NextResponse.json(
      {
        [GDOLLAR_PRICE_CONFIG.GDOLLAR_ID]: {
          usd: GDOLLAR_PRICE_CONFIG.FALLBACK_PRICE,
          usd_24h_change: 0,
          usd_market_cap: 0,
          usd_24h_vol: 0,
        },
      },
      {
        status: 200, // Return 200 with fallback data
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

