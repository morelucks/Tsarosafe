/**
 * Hook for managing price refresh operations with debouncing
 */

import { useState, useCallback, useRef } from 'react'
import { useGDollarPrice } from './useGDollarPrice'

interface UsePriceRefreshReturn {
  refresh: () => Promise<void>
  isRefreshing: boolean
  lastRefreshTime: number | null
  refreshCount: number
}

/**
 * Hook to manage price refresh with debouncing and tracking
 */
export function usePriceRefresh(): UsePriceRefreshReturn {
  const { refetch } = useGDollarPrice()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const refresh = useCallback(async () => {
    // Debounce: prevent multiple rapid refreshes
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(async () => {
      setIsRefreshing(true)
      try {
        await refetch()
        setLastRefreshTime(Date.now())
        setRefreshCount(prev => prev + 1)
      } catch (error) {
        console.error('Price refresh failed:', error)
      } finally {
        setIsRefreshing(false)
      }
    }, 300) // 300ms debounce
  }, [refetch])

  return {
    refresh,
    isRefreshing,
    lastRefreshTime,
    refreshCount,
  }
}

