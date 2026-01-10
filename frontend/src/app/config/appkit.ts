"use client";

import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum, base, optimism, polygon, AppKitNetwork } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { cookieStorage, createStorage } from '@wagmi/core'

// 1. Get projectId from https://cloud.reown.com
// Using a placeholder if not set - wallet connection won't work but app will load
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '00000000000000000000000000000000'

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn(
    '⚠️ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. ' +
    'Wallet connection will not work. ' +
    'Get your project ID from https://cloud.reown.com and add it to your .env.local file'
  )
}

// Celo Mainnet network configuration
// Using type assertion with unknown first to satisfy TypeScript
const celo = {
  id: 42220,
  name: 'Celo',
  explorerUrl: 'https://celoscan.io',
  rpcUrl: 'https://forno.celo.org'
} as unknown as AppKitNetwork

// Celo Alfajores Testnet network configuration
const celoAlfajores = {
  id: 44787,
  name: 'Celo Alfajores',
  explorerUrl: 'https://alfajores.celoscan.io',
  rpcUrl: 'https://alfajores-forno.celo-testnet.org'
} as unknown as AppKitNetwork

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  celo,
  celoAlfajores,
  mainnet,
  arbitrum,
  base,
  optimism,
  polygon
]
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

// 3. Create modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: celo, // Set Celo as default network
  metadata: {
    name: 'Tsarosafe',
    description: 'Save smarter, together or individually',
    url: 'https://tsarosafe.com',
    icons: ['https://tsarosafe.com/icon.png']
  },
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'x', 'github', 'discord', 'apple', 'facebook'],
    emailShowWallets: true
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#0f2a56',
    '--w3m-border-radius-master': '8px'
  }
})

export const config = wagmiAdapter.wagmiConfig