import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum, base, optimism, polygon, AppKitNetwork } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { cookieStorage, createStorage } from '@wagmi/core'

// 1. Get projectId from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set')
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, arbitrum, base, optimism, polygon]
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
  defaultNetwork: mainnet,
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