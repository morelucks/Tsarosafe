"use client";

// AppKitProvider wraps the app with Wagmi + React Query.
// It is safe to render even when the AppKit modal failed to initialize.
import { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, modal } from '../config/appkit'

// Ensure the modal module is evaluated (it may be null if projectId is missing,
// but that is handled gracefully — the app will still render without wallet features).
void modal

const queryClient = new QueryClient()

export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
