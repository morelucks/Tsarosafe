"use client"

// FarcasterProvider: initializes Farcaster miniapp SDK on mount

import { useEffect } from "react"
import { sdk } from "@farcaster/miniapp-sdk"

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    sdk.actions.ready().then(() => {
      // Farcaster SDK is ready
    })
  }, [])

  return <>{children}</>
}