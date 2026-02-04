/**
 * Custom hooks for interacting with TsaroSafe contract
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { getContractAddress } from '@/lib/constants'
import TsaroSafeABI from '@/lib/abi/TsaroSafe.json'
import { Address } from 'viem'

/**
 * Hook to get contract address for current chain
 */
export function useContractAddress() {
  const { chain } = useAccount()
  return chain ? getContractAddress(chain.id) : undefined
}

/**
 * Hook to create a new group
 */
export function useCreateGroup() {
  const contractAddress = useContractAddress()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const createGroup = async (
    name: string,
    description: string,
    isPrivate: boolean,
    targetAmount: bigint,
    memberLimit: number,
    endDate: bigint,
    tokenType: number // 0 = CELO, 1 = GSTAR
  ) => {
    if (!contractAddress) {
      throw new Error('Contract address not found. Please connect to Celo network.')
    }

    return writeContract({
      address: contractAddress as Address,
      abi: TsaroSafeABI,
      functionName: 'createGroup',
      args: [name, description, isPrivate, targetAmount, BigInt(memberLimit), endDate, tokenType],
    })
  }

  return {
    createGroup,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    isLoading: isPending || isConfirming,
  }
}

/**
 * Hook to make a contribution
 */
export function useMakeContribution() {
  const contractAddress = useContractAddress()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const makeContribution = async (groupId: bigint, amount: bigint, description: string) => {
    if (!contractAddress) {
      throw new Error('Contract address not found. Please connect to Celo network.')
    }

    return writeContract({
      address: contractAddress as Address,
      abi: TsaroSafeABI,
      functionName: 'makeContribution',
      args: [groupId, amount, description],
    })
  }

  return {
    makeContribution,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    isLoading: isPending || isConfirming,
  }
}

/**
 * Hook to make a contribution with ERC20 tokens (CELO or G$)
 */
export function useMakeContributionWithToken() {
  const contractAddress = useContractAddress()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const makeContributionWithToken = async (
    groupId: bigint,
    amount: bigint,
    description: string,
    tokenType: number, // 0 = CELO, 1 = G$
    value?: bigint // For native CELO transfers
  ) => {
    if (!contractAddress) {
      throw new Error('Contract address not found. Please connect to Celo network.')
    }

    return writeContract({
      address: contractAddress as Address,
      abi: TsaroSafeABI,
      functionName: 'makeContributionWithToken',
      args: [groupId, amount, description, tokenType],
      value: tokenType === 0 ? value : undefined, // Only send value for CELO (native token)
    })
  }

  return {
    makeContributionWithToken,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    isLoading: isPending || isConfirming,
  }
}

/**
 * Hook to join a group
 */
export function useJoinGroup() {
  const contractAddress = useContractAddress()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const joinGroup = async (groupId: bigint) => {
    if (!contractAddress) {
      throw new Error('Contract address not found. Please connect to Celo network.')
    }

    return writeContract({
      address: contractAddress as Address,
      abi: TsaroSafeABI,
      functionName: 'joinGroup',
      args: [groupId],
    })
  }

  return {
    joinGroup,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    isLoading: isPending || isConfirming,
  }
}

/**
 * Hook to get group information
 */
export function useGroup(groupId: bigint | undefined) {
  const contractAddress = useContractAddress()

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress as Address | undefined,
    abi: TsaroSafeABI,
    functionName: 'getGroup',
    args: groupId !== undefined ? [groupId] : undefined,
    query: {
      enabled: !!contractAddress && groupId !== undefined,
    },
  })

  return {
    group: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get group members
 */
export function useGroupMembers(groupId: bigint | undefined) {
  const contractAddress = useContractAddress()

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress as Address | undefined,
    abi: TsaroSafeABI,
    functionName: 'getGroupMembers',
    args: groupId !== undefined ? [groupId] : undefined,
    query: {
      enabled: !!contractAddress && groupId !== undefined,
    },
  })

  return {
    members: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get group stats
 */
export function useGroupStats(groupId: bigint | undefined) {
  const contractAddress = useContractAddress()

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress as Address | undefined,
    abi: TsaroSafeABI,
    functionName: 'getGroupStats',
    args: groupId !== undefined ? [groupId] : undefined,
    query: {
      enabled: !!contractAddress && groupId !== undefined,
    },
  })

  return {
    stats: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get user's groups
 */
export function useUserGroups(userAddress: Address | undefined) {
  const contractAddress = useContractAddress()

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress as Address | undefined,
    abi: TsaroSafeABI,
    functionName: 'getUserGroups',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!contractAddress && !!userAddress,
    },
  })

  return {
    groupIds: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get public groups
 */
export function usePublicGroups(offset: bigint = 0n, limit: number = 10) {
  const contractAddress = useContractAddress()

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress as Address | undefined,
    abi: TsaroSafeABI,
    functionName: 'getPublicGroups',
    args: [offset, BigInt(limit)],
    query: {
      enabled: !!contractAddress,
    },
  })

  return {
    groups: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get group contributions
 */
export function useGroupContributions(groupId: bigint | undefined, offset: bigint = 0n, limit: number = 20) {
  const contractAddress = useContractAddress()

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress as Address | undefined,
    abi: TsaroSafeABI,
    functionName: 'getGroupContributions',
    args: groupId !== undefined ? [groupId, offset, BigInt(limit)] : undefined,
    query: {
      enabled: !!contractAddress && groupId !== undefined,
    },
  })

  return {
    contributions: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get group milestones
 */
export function useGroupMilestones(groupId: bigint | undefined) {
  const contractAddress = useContractAddress()

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress as Address | undefined,
    abi: TsaroSafeABI,
    functionName: 'getGroupMilestones',
    args: groupId !== undefined ? [groupId] : undefined,
    query: {
      enabled: !!contractAddress && groupId !== undefined,
    },
  })

  return {
    milestones: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get group progress
 */
export function useGroupProgress(groupId: bigint | undefined) {
  const contractAddress = useContractAddress()

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress as Address | undefined,
    abi: TsaroSafeABI,
    functionName: 'getGroupProgress',
    args: groupId !== undefined ? [groupId] : undefined,
    query: {
      enabled: !!contractAddress && groupId !== undefined,
    },
  })

  return {
    progress: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get public groups filtered by token type
 */
export function usePublicGroupsByTokenType(tokenType: number, offset: bigint = 0n, limit: number = 10) {
  const contractAddress = useContractAddress()

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress as Address | undefined,
    abi: TsaroSafeABI,
    functionName: 'getPublicGroupsByTokenType',
    args: [tokenType, offset, BigInt(limit)],
    query: {
      enabled: !!contractAddress,
    },
  })

  return {
    groups: data,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get group token type
 */
export function useGroupTokenType(groupId: bigint | undefined) {
  const contractAddress = useContractAddress()

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress as Address | undefined,
    abi: TsaroSafeABI,
    functionName: 'getGroupTokenType',
    args: groupId !== undefined ? [groupId] : undefined,
    query: {
      enabled: !!contractAddress && groupId !== undefined,
    },
  })

  return {
    tokenType: data,
    isLoading,
    error,
    refetch,
  }
}








/**
 * Hook to get contract owner
 */
export function useTsaroSafeOwner() {
  const contractAddress = useContractAddress()

  const { data: owner, isLoading, error } = useReadContract({
    address: contractAddress as Address | undefined,
    abi: TsaroSafeABI,
    functionName: 'owner',
    query: {
      enabled: !!contractAddress,
    },
  })

  return {
    owner: owner as Address | undefined,
    isLoading,
    error,
  }
}

/**
 * Hook for administrative functions
 */
export function useTsaroSafeAdmin() {
  const contractAddress = useContractAddress()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const withdrawNative = async (amount: bigint) => {
    if (!contractAddress) throw new Error('Contract address not found')
    return writeContract({
      address: contractAddress as Address,
      abi: TsaroSafeABI,
      functionName: 'withdrawNative',
      args: [amount],
    })
  }

  const withdrawERC20 = async (token: Address, amount: bigint) => {
    if (!contractAddress) throw new Error('Contract address not found')
    return writeContract({
      address: contractAddress as Address,
      abi: TsaroSafeABI,
      functionName: 'withdrawERC20',
      args: [token, amount],
    })
  }

  return {
    withdrawNative,
    withdrawERC20,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    isLoading: isPending || isConfirming,
  }
}
