/**
 * Hook for interacting with GoodDollar EngagementRewards via TsaroSafeRewardsAdapter
 */

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { useAccount } from 'wagmi'
import { getRewardsAdapterAddress } from '@/lib/constants'
import TsaroSafeRewardsAdapterABI from '@/lib/abi/TsaroSafeRewardsAdapter.json'
import { Address } from 'viem'
import { usePublicClient } from 'wagmi'

/**
 * Hook to get rewards adapter address for current chain
 */
export function useRewardsAdapterAddress() {
  const { chain } = useAccount()
  return chain ? getRewardsAdapterAddress(chain.id) : undefined
}

/**
 * Hook to claim engagement rewards after a TsaroSafe action
 */
export function useClaimEngagementReward() {
  const adapterAddress = useRewardsAdapterAddress()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const claimReward = async (
    inviter: Address | undefined,
    validUntilBlock: bigint,
    signature: `0x${string}`
  ) => {
    if (!adapterAddress) {
      throw new Error('Rewards adapter address not found. Please connect to Celo network.')
    }

    return writeContract({
      address: adapterAddress as Address,
      abi: TsaroSafeRewardsAdapterABI,
      functionName: 'claimAfterAction',
      args: [inviter || '0x0000000000000000000000000000000000000000', validUntilBlock, signature],
    })
  }

  return {
    claimReward,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    isLoading: isPending || isConfirming,
  }
}

/**
 * Hook to get current block number (needed for validUntilBlock calculation)
 */
export function useCurrentBlockNumber() {
  const publicClient = usePublicClient()
  const { data, isLoading, error } = useReadContract({
    address: undefined,
    abi: [],
    functionName: '',
    query: {
      enabled: false,
    },
  })

  const getCurrentBlock = async (): Promise<bigint> => {
    if (!publicClient) {
      throw new Error('Public client not available')
    }
    const blockNumber = await publicClient.getBlockNumber()
    return blockNumber
  }

  return {
    getCurrentBlock,
    isLoading,
    error,
  }
}

