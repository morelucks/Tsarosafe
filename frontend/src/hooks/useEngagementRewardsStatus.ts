/**
 * Hook to check engagement rewards status and eligibility
 */

import { useReadContract } from 'wagmi'
import { useAccount } from 'wagmi'
import { getRewardsAdapterAddress } from '@/lib/constants'
import TsaroSafeRewardsAdapterABI from '@/lib/abi/TsaroSafeRewardsAdapter.json'
import { Address } from 'viem'
import { useState, useEffect } from 'react'

interface RewardsStatus {
  canClaim: boolean
  lastClaimBlock: bigint | null
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to get engagement rewards claim status for current user
 */
export function useEngagementRewardsStatus(): RewardsStatus {
  const { address, chain } = useAccount()
  const adapterAddress = chain ? getRewardsAdapterAddress(chain.id) : undefined
  const [status, setStatus] = useState<RewardsStatus>({
    canClaim: false,
    lastClaimBlock: null,
    isLoading: true,
    error: null,
  })

  const { data: lastClaimBlock, isLoading, error } = useReadContract({
    address: adapterAddress as Address | undefined,
    abi: TsaroSafeRewardsAdapterABI,
    functionName: 'lastClaimBlock',
    args: address ? [address] : undefined,
    query: {
      enabled: !!adapterAddress && !!address,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  })

  useEffect(() => {
    if (lastClaimBlock !== undefined) {
      setStatus({
        canClaim: lastClaimBlock === 0n, // Can claim if never claimed before
        lastClaimBlock: lastClaimBlock || null,
        isLoading: false,
        error: error as Error | null,
      })
    } else if (!isLoading) {
      setStatus(prev => ({ ...prev, isLoading: false }))
    }
  }, [lastClaimBlock, isLoading, error])

  return status
}

