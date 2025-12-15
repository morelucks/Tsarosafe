/**
 * Contract addresses and network configurations
 */

// Deployed contract addresses
export const CONTRACT_ADDRESSES = {
  // Celo Mainnet
  42220: '0x7BC6274E2DAde23d26a56C2fe8ADf4f561d2427A',
  // Celo Alfajores Testnet
  44787: '0x7BC6274E2DAde23d26a56C2fe8ADf4f561d2427A', // Update with testnet address if deployed separately
} as const

// Network names
export const NETWORK_NAMES = {
  42220: 'Celo Mainnet',
  44787: 'Celo Alfajores',
} as const

// RPC URLs
export const RPC_URLS = {
  42220: 'https://forno.celo.org',
  44787: 'https://alfajores-forno.celo-testnet.org',
} as const

// Block explorers
export const EXPLORER_URLS = {
  42220: 'https://celoscan.io',
  44787: 'https://alfajores.celoscan.io',
} as const

// GoodDollar (G$) Token Addresses
export const GOODDOLLAR_ADDRESSES = {
  // Celo Mainnet
  42220: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A',
  // Celo Alfajores Testnet (if available)
  44787: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A', // Update with testnet address if different
} as const

/**
 * Get GoodDollar token address for a given chain ID
 */
export function getGoodDollarAddress(chainId: number): string | undefined {
  return GOODDOLLAR_ADDRESSES[chainId as keyof typeof GOODDOLLAR_ADDRESSES]
}

/**
 * Get contract address for a given chain ID
 */
export function getContractAddress(chainId: number): string | undefined {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
}

/**
 * Get network name for a given chain ID
 */
export function getNetworkName(chainId: number): string | undefined {
  return NETWORK_NAMES[chainId as keyof typeof NETWORK_NAMES]
}

/**
 * Get RPC URL for a given chain ID
 */
export function getRpcUrl(chainId: number): string | undefined {
  return RPC_URLS[chainId as keyof typeof RPC_URLS]
}

/**
 * Get explorer URL for a given chain ID
 */
export function getExplorerUrl(chainId: number): string | undefined {
  return EXPLORER_URLS[chainId as keyof typeof EXPLORER_URLS]
}

// G$ Price Oracle Configuration
export const GDOLLAR_PRICE_CONFIG = {
  // CoinGecko API for G$ price data
  COINGECKO_API: 'https://api.coingecko.com/api/v3',
  GDOLLAR_ID: 'gooddollar', // GoodDollar's CoinGecko ID
  UPDATE_INTERVAL: 300000, // 5 minutes
  FALLBACK_PRICE: 0.001, // Fallback price in USD if API fails
  MAX_RETRIES: 3,
  CACHE_DURATION: 300000, // 5 minutes cache
} as const

// Price chart periods
export const PRICE_CHART_PERIODS = {
  '1h': { days: 1, interval: 'hourly' },
  '24h': { days: 1, interval: 'hourly' },
  '7d': { days: 7, interval: 'daily' },
  '30d': { days: 30, interval: 'daily' },
  '90d': { days: 90, interval: 'daily' },
  '1y': { days: 365, interval: 'daily' },
} as const


