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
      throw new Error('GoodDollar token address not found. Please connect to Celo network.')
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
 * Hook to transfer G$ tokens
 */
export function useTransferGoodDollar() {
  const { chain } = useAccount()
  const tokenAddress = chain ? getGoodDollarAddress(chain.id) : undefined
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const transfer = async (to: Address, amount: bigint) => {
    if (!tokenAddress) {
      throw new Error('GoodDollar token address not found. Please connect to Celo network.')
    }

    return writeContract({
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to, amount],
    })
  }

  return {
    transfer,
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

