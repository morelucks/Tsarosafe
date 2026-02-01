/**
 * Custom hooks for interacting with GoodDollar (G$) token
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { getGoodDollarAddress } from '@/lib/constants'
import { Address, erc20Abi } from 'viem'

/**
 * Hook to get G$ token balance for current user
 */
export function useGoodDollarBalance() {
  const { address, chain } = useAccount()
  const tokenAddress = chain ? getGoodDollarAddress(chain.id) : undefined

  const { data: balance, isLoading, error, refetch } = useReadContract({
    address: tokenAddress as Address | undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!tokenAddress && !!address,
    },
  })

  return {
    balance: balance || 0n,
    balanceFormatted: balance ? Number(balance) / 1e18 : 0,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to approve G$ token spending
 */
export function useApproveGoodDollar() {
  const { chain } = useAccount()
  const tokenAddress = chain ? getGoodDollarAddress(chain.id) : undefined
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = async (spender: Address, amount: bigint) => {
    if (!tokenAddress) {
      throw new Error('GoodDollar token address not found on this network. Please switch to a supported network (Celo or Base).')
    }

    return writeContract({
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, amount],
    })
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    isLoading: isPending || isConfirming,
  }
}

/**
 * Hook to get G$ token allowance for a spender
 */
export function useGoodDollarAllowance(spender: Address | undefined) {
  const { address, chain } = useAccount()
  const tokenAddress = chain ? getGoodDollarAddress(chain.id) : undefined

  const { data: allowance, isLoading, error, refetch } = useReadContract({
    address: tokenAddress as Address | undefined,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && spender ? [address, spender] : undefined,
    query: {
      enabled: !!tokenAddress && !!address && !!spender,
    },
  })

  return {
    allowance: allowance || 0n,
    allowanceFormatted: allowance ? Number(allowance) / 1e18 : 0,
    isLoading,
    error,
    refetch,
  }
}

// GoodDollar UBI Contract ABI (simplified for claiming)
const GOODDOLLAR_UBI_ABI = [
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
  },
  {
    name: 'checkEntitlement',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
  },
  {
    name: 'nextClaimTime',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
  },
  {
    name: 'dailyUbi',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
  },
] as const

// GoodDollar UBI Contract Addresses
const UBI_CONTRACT_ADDRESSES = {
  // Celo Mainnet - GoodDollar UBI contract
  42220: '0x495d133B938596C9984d462F007B676bDc57eCEC',
  // Celo Alfajores Testnet
  44787: '0x495d133B938596C9984d462F007B676bDc57eCEC',
  // Base Mainnet
  8453: '0x0000000000000000000000000000000000000000', // Update once UBI contract is on Base
  // Base Sepolia
  84532: '0x0000000000000000000000000000000000000000', // Update once UBI contract is on Base Sepolia
} as const

function getUBIContractAddress(chainId: number): string | undefined {
  return UBI_CONTRACT_ADDRESSES[chainId as keyof typeof UBI_CONTRACT_ADDRESSES]
}

/**
 * Hook to get UBI claim information for current user
 */
export function useUBIClaimInfo() {
  const { address, chain } = useAccount()
  const ubiContractAddress = chain ? getUBIContractAddress(chain.id) : undefined

  const { data: claimableAmount, isLoading: isLoadingAmount } = useReadContract({
    address: ubiContractAddress as Address | undefined,
    abi: GOODDOLLAR_UBI_ABI,
    functionName: 'checkEntitlement',
    args: address ? [address] : undefined,
    query: {
      enabled: !!ubiContractAddress && !!address,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  })

  const { data: nextClaimTime, isLoading: isLoadingTime } = useReadContract({
    address: ubiContractAddress as Address | undefined,
    abi: GOODDOLLAR_UBI_ABI,
    functionName: 'nextClaimTime',
    args: address ? [address] : undefined,
    query: {
      enabled: !!ubiContractAddress && !!address,
      refetchInterval: 30000,
    },
  })

  const { data: dailyUBI, isLoading: isLoadingDaily } = useReadContract({
    address: ubiContractAddress as Address | undefined,
    abi: GOODDOLLAR_UBI_ABI,
    functionName: 'dailyUbi',
    query: {
      enabled: !!ubiContractAddress,
    },
  })

  const isLoading = isLoadingAmount || isLoadingTime || isLoadingDaily
  const canClaim = claimableAmount ? claimableAmount > 0n : false
  const timeUntilNextClaim = nextClaimTime ? Number(nextClaimTime) - Math.floor(Date.now() / 1000) : 0

  return {
    claimableAmount: claimableAmount || 0n,
    claimableAmountFormatted: claimableAmount ? Number(claimableAmount) / 1e18 : 0,
    nextClaimTime: nextClaimTime || 0n,
    timeUntilNextClaim: Math.max(0, timeUntilNextClaim),
    canClaim,
    dailyUBI: dailyUBI || 0n,
    dailyUBIFormatted: dailyUBI ? Number(dailyUBI) / 1e18 : 0,
    isLoading,
  }
}

/**
 * Hook to claim UBI
 */
export function useClaimUBI() {
  const { chain } = useAccount()
  const ubiContractAddress = chain ? getUBIContractAddress(chain.id) : undefined
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const claimUBI = async () => {
    if (!ubiContractAddress) {
      throw new Error('UBI contract address not found on this network. Please switch to a supported network (Celo).')
    }

    return writeContract({
      address: ubiContractAddress as Address,
      abi: GOODDOLLAR_UBI_ABI,
      functionName: 'claim',
    })
  }

  return {
    claimUBI,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    isLoading: isPending || isConfirming,
  }
}


