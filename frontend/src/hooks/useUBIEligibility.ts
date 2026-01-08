/**
 * Hook to check UBI eligibility and claim status
 */

import { useReadContract } from 'wagmi'
import { useAccount } from 'wagmi'
import { Address } from 'viem'

// GoodDollar UBI Contract ABI (simplified for eligibility check)
const GOODDOLLAR_UBI_ABI = [
  {
    name: 'nextClaimTime',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
  },
] as const

// GoodDollar UBI Contract Addresses
const UBI_CONTRACT_ADDRESSES = {
  42220: '0x495d133B938596C9984d462F007B676bDc57eCEC', // Celo Mainnet
  44787: '0x495d133B938596C9984d462F007B676bDc57eCEC', // Celo Alfajores
} as const

function getUBIContractAddress(chainId: number): string | undefined {
  return UBI_CONTRACT_ADDRESSES[chainId as keyof typeof UBI_CONTRACT_ADDRESSES]
}

interface UBIEligibility {
  isEligible: boolean
  nextClaimTime: bigint | null
  timeUntilClaim: number
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to check if user is eligible for UBI and when they can claim next
 */
export function useUBIEligibility(): UBIEligibility {
  const { address, chain } = useAccount()
  const ubiContractAddress = chain ? getUBIContractAddress(chain.id) : undefined

  const { data: nextClaimTime, isLoading, error } = useReadContract({
    address: ubiContractAddress as Address | undefined,
    abi: GOODDOLLAR_UBI_ABI,
    functionName: 'nextClaimTime',
    args: address ? [address] : undefined,
    query: {
      enabled: !!ubiContractAddress && !!address,
      refetchInterval: 60000, // Refetch every minute
    },
  })

  const now = Math.floor(Date.now() / 1000)
  const timeUntilClaim = nextClaimTime 
    ? Math.max(0, Number(nextClaimTime) - now)
    : 0

  return {
    isEligible: timeUntilClaim === 0 && nextClaimTime !== null,
    nextClaimTime: nextClaimTime || null,
    timeUntilClaim,
    isLoading,
    error: error as Error | null,
  }
}

