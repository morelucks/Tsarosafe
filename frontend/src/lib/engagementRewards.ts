/**
 * Utility functions for GoodDollar EngagementRewards integration
 * 
 * Note: For full signature support, you may want to integrate the GoodDollar SDK:
 * @see https://docs.gooddollar.org/for-developers/apis-and-sdks/engagement-rewards
 */

import { Address } from 'viem'
import { PublicClient } from 'viem'
import { logger } from './logger'

/**
 * Calculate validUntilBlock (current block + buffer)
 * @param currentBlock Current block number
 * @param blocksBuffer Number of blocks to add (default: 600 blocks ~5 min on Celo)
 */
export function calculateValidUntilBlock(
  currentBlock: bigint,
  blocksBuffer: bigint = 600n
): bigint {
  const validUntil = currentBlock + blocksBuffer
  logger.debug('Calculated validUntilBlock', {
    component: 'EngagementRewards',
    action: 'calculateValidUntilBlock',
    metadata: { currentBlock: currentBlock.toString(), validUntil: validUntil.toString() }
  })
  return validUntil
}

/**
 * Get inviter address from URL params or localStorage
 * @param searchParams URL search params
 */
export function getInviterAddress(searchParams: URLSearchParams): Address | undefined {
  const inviteCode = searchParams.get('invite')
  if (!inviteCode) {
    logger.debug('No invite code found in URL params', {
      component: 'EngagementRewards',
      action: 'getInviterAddress'
    })
    return undefined
  }

  // Try to get inviter from localStorage (set when invite link is created)
  try {
    const inviteData = localStorage.getItem(`invite_${inviteCode}`)
    if (inviteData) {
      const parsed = JSON.parse(inviteData)
      logger.info('Found inviter address from localStorage', {
        component: 'EngagementRewards',
        action: 'getInviterAddress',
        metadata: { inviteCode, inviter: parsed.inviter }
      })
      return parsed.inviter as Address
    }
  } catch (error) {
    logger.warn('Failed to get inviter from localStorage', {
      component: 'EngagementRewards',
      action: 'getInviterAddress',
      metadata: { inviteCode, error: error instanceof Error ? error.message : 'Unknown' }
    })
  }

  return undefined
}

/**
 * Check if user needs to sign (first-time registration)
 * This is a placeholder - in production, check with EngagementRewards contract
 * or use the GoodDollar SDK's isUserRegistered method
 */
export async function needsSignature(
  adapterAddress: Address,
  userAddress: Address,
  publicClient: PublicClient
): Promise<boolean> {
  // For now, we'll always try with signature on first call
  // In production, check: await engagementRewards.isUserRegistered(adapterAddress, userAddress)
  return true
}

/**
 * Generate signature for engagement rewards claim
 * This is a simplified version - for production, use GoodDollar SDK:
 * 
 * @example
 * ```typescript
 * import { useEngagementRewards } from '@goodsdks/engagement-sdk'
 * const engagementRewards = useEngagementRewards(REWARDS_CONTRACT)
 * const signature = await engagementRewards.signClaim(adapterAddress, inviter, validUntilBlock)
 * ```
 */
export async function generateSignature(
  adapterAddress: Address,
  inviter: Address | undefined,
  validUntilBlock: bigint,
  signer: any // Wallet signer - in production use GoodDollar SDK
): Promise<`0x${string}`> {
  // Simplified signature generation
  // In production, use GoodDollar SDK's signClaim method
  // For now, return empty signature (0x) for subsequent claims
  // First-time users will need to use the SDK or manual signing
  
  // Placeholder: return empty signature
  // TODO: Integrate GoodDollar SDK for proper signature generation
  return '0x' as `0x${string}`
}

