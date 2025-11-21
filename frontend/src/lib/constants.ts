/**
 * Contract addresses and network configurations
 */

// Deployed contract addresses
export const CONTRACT_ADDRESSES = {
  // Celo Mainnet
  42220: '0x5d4005061327a4C97252fB33Ad56787c596A4EC3',
  // Celo Alfajores Testnet
  44787: '0x5d4005061327a4C97252fB33Ad56787c596A4EC3', // Same address if deployed to testnet
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

