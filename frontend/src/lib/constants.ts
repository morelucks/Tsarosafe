/**
 * Contract addresses and network configurations
 */

// Deployed contract addresses
export const CONTRACT_ADDRESSES = {
  // Celo Mainnet
  42220: '0x7BC6274E2DAde23d26a56C2fe8ADf4f561d2427A',
  // Celo Alfajores Testnet
  44787: '0x7BC6274E2DAde23d26a56C2fe8ADf4f561d2427A',
  // Base Mainnet
  8453: '0x7BC6274E2DAde23d26a56C2fe8ADf4f561d2427A', // Placeholder
  // Base Sepolia
  84532: '0x7BC6274E2DAde23d26a56C2fe8ADf4f561d2427A', // Placeholder
} as const

// Network names
export const NETWORK_NAMES = {
  42220: 'Celo Mainnet',
  44787: 'Celo Alfajores',
  8453: 'Base Mainnet',
  84532: 'Base Sepolia',
} as const

// RPC URLs
export const RPC_URLS = {
  42220: 'https://forno.celo.org',
  44787: 'https://alfajores-forno.celo-testnet.org',
  8453: 'https://mainnet.base.org',
  84532: 'https://sepolia.base.org',
} as const

// Block explorers
export const EXPLORER_URLS = {
  42220: 'https://celoscan.io',
  44787: 'https://alfajores.celoscan.io',
  8453: 'https://base.blockscout.com/',
  84532: 'https://sepolia-explorer.base.org',
} as const

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



