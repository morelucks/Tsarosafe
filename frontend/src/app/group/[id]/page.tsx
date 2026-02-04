"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAccount, usePublicClient } from "wagmi";
import { useGroup, useGroupMembers, useGroupStats, useMakeContribution, useMakeContributionWithToken, useGroupContributions, useGroupMilestones } from "@/hooks/useTsaroSafe";
import { useGoodDollarBalance, useGoodDollarAllowance, useApproveGoodDollar } from "@/hooks/useGoodDollar";
import { useContractAddress } from "@/hooks/useTsaroSafe";
import { useClaimEngagementReward, useCurrentBlockNumber } from "@/hooks/useEngagementRewards";
import { calculateValidUntilBlock, getInviterAddress, generateSignature } from "@/lib/engagementRewards";
import { Address } from "viem";
import { Group, ContributionHistory, GroupMilestone } from "@/types/group";
import GDollarAmount, { InlineGDollarAmount, USDAmount } from "@/app/components/GDollarAmount";
import GDollarPriceDisplay from "@/app/components/GDollarPriceDisplay";
import EngagementRewardsNotification from "@/components/EngagementRewardsNotification";

export default function GroupDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const groupId = params?.id ? BigInt(params.id as string) : undefined;

  const { group: groupData, isLoading: isLoadingGroup, refetch: refetchGroup } = useGroup(groupId);
  const { members: membersData, isLoading: isLoadingMembers } = useGroupMembers(groupId);
  const { stats, isLoading: isLoadingStats } = useGroupStats(groupId);
  const { contributions: contributionsData, isLoading: isLoadingContributions, refetch: refetchContributions } = useGroupContributions(groupId);
  const { milestones: milestonesData, isLoading: isLoadingMilestones } = useGroupMilestones(groupId);

  // Type assertions for proper TypeScript support
  const group = groupData as Group | undefined;
  const members = membersData as string[] | undefined;
  const contributions = contributionsData as ContributionHistory[] | undefined;
  const milestones = milestonesData as GroupMilestone[] | undefined;
  const { makeContribution, isLoading: isSubmitting, isConfirmed, error: contributionError } = useMakeContribution();
  const { makeContributionWithToken, isLoading: isSubmittingToken, isConfirmed: isConfirmedToken, error: contributionTokenError } = useMakeContributionWithToken();
  const { claimReward } = useClaimEngagementReward();
  const { getCurrentBlock } = useCurrentBlockNumber();
  const [rewardClaimedForContribution, setRewardClaimedForContribution] = useState(false);

  const [showContributionForm, setShowContributionForm] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionDescription, setContributionDescription] = useState("");
  const [selectedToken, setSelectedToken] = useState<"CELO" | "G$">("CELO");

  // Set the selected token based on group's token type when group loads
  useEffect(() => {
    if (group) {
      // Default to CELO if tokenType is not available (for backward compatibility)
      const tokenType = group.tokenType ?? 0;
      setSelectedToken(tokenType === 0 ? "CELO" : "G$");
    }
  }, [group]);

  const { balanceFormatted: gdBalance } = useGoodDollarBalance();
  const contractAddress = useContractAddress();
  const { allowanceFormatted: gdAllowance } = useGoodDollarAllowance(contractAddress as Address | undefined);
  const { approve: approveGd, isLoading: isApproving } = useApproveGoodDollar();

  // Claim engagement rewards after contribution is successfully made
  useEffect(() => {
    const claimRewardsAfterContribution = async () => {
      if ((!isConfirmed && !isConfirmedToken) || rewardClaimedForContribution || !address || !publicClient) return;

      try {
        setRewardClaimedForContribution(true);

        // Get inviter from URL params
        const inviter = getInviterAddress(new URLSearchParams(searchParams.toString()));

        // Get current block and calculate validUntilBlock
        const currentBlock = await getCurrentBlock();
        const validUntilBlock = calculateValidUntilBlock(currentBlock);

        // Generate signature (simplified - use GoodDollar SDK in production)
        const signature = await generateSignature(
          '0x4902045cEF54fBc664591a40fecf22Bb51932a45' as Address,
          inviter,
          validUntilBlock,
          null // Placeholder - use GoodDollar SDK in production
        );

        // Claim reward (non-blocking - don't fail if this errors)
        try {
          await claimReward(inviter, validUntilBlock, signature);
        } catch (rewardError) {
          console.warn('Failed to claim engagement reward:', rewardError);
          // We don't show a blocking error here as the group was created successfully,
          // but we log it. The user can retry from the dashboard.
        }
      } catch (error) {
        console.error('Error in reward claim flow:', error);
        // Don't block user flow
      }
    };

    claimRewardsAfterContribution();
  }, [isConfirmed, isConfirmedToken, rewardClaimedForContribution, address, publicClient, searchParams, getCurrentBlock, claimReward]);

  useEffect(() => {
    if (isConfirmed || isConfirmedToken) {
      setShowContributionForm(false);
      setContributionAmount("");
      setContributionDescription("");
      refetchGroup();
      refetchContributions();
      // Reset reward claim flag for next contribution
      setRewardClaimedForContribution(false);
    }
  }, [isConfirmed, isConfirmedToken, refetchGroup, refetchContributions]);

  const handleMakeContribution = async () => {
    if (!groupId || !contributionAmount || !contractAddress) return;

    try {
      const amountWei = BigInt(Math.floor(parseFloat(contributionAmount) * 1e18));
      const description = contributionDescription || "Contribution";

      // If using G$ or CELO via token function, use makeContributionWithToken
      if (selectedToken === "G$") {
        // Check and request approval first for G$
        if (gdAllowance < parseFloat(contributionAmount)) {
          // Need to approve - approve amount + 50% buffer for future contributions
          const approvalAmount = amountWei + (amountWei / 2n);
          await approveGd(contractAddress as Address, approvalAmount);
          // Wait a bit for approval to confirm
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Make contribution with G$ token (tokenType = 1)
        await makeContributionWithToken(groupId, amountWei, description, 1);
      } else {
        // For CELO, use makeContributionWithToken with native value (tokenType = 0)
        await makeContributionWithToken(groupId, amountWei, description, 0, amountWei);
      }
    } catch (error) {
      console.error("Failed to make contribution:", error);
    }
  };

  const isLoading = isLoadingGroup || isLoadingMembers || isLoadingStats;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Group Not Found</h1>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const targetAmount = Number(group.targetAmount) / 1e18;
  const currentAmount = Number(group.currentAmount) / 1e18;
  const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const memberCount = members?.length || 0;
  const isMember = address && members?.includes(address as Address);
  const isGDollarGroup = (group.tokenType ?? 0) === 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EngagementRewardsNotification />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
          <p className="mt-2 text-gray-600">{group.description}</p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Group Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Privacy</p>
              <p className="font-medium text-gray-900">{group.isPrivate ? "Private" : "Public"}</p>
            </div>
            <div>
              <p className="text-gray-600">Members</p>
              <p className="font-medium text-gray-900">{memberCount} / {Number(group.memberLimit)}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className={`font-medium ${group.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {group.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Currency</p>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${(group.tokenType ?? 0) === 0
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
                }`}>
                {(group.tokenType ?? 0) === 0 ? "CELO" : "G$ (GoodDollar)"}
              </span>
            </div>
            <div>
              <p className="text-gray-600">Progress</p>
              <p className="font-medium text-gray-900">{progressPercentage.toFixed(1)}%</p>
            </div>
            {isGDollarGroup && (
              <div className="col-span-2 md:col-span-1">
                <p className="text-gray-600">G$ Price</p>
                <GDollarPriceDisplay compact className="mt-1" />
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress</h2>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Goal Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <div className="text-left">
                {isGDollarGroup ? (
                  <GDollarAmount
                    amount={currentAmount}
                    format="compact"
                    className="text-gray-900"
                    usdClassName="text-xs text-gray-400"
                  />
                ) : (
                  <div>${currentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                )}
              </div>
              <div className="text-right">
                {isGDollarGroup ? (
                  <GDollarAmount
                    amount={targetAmount}
                    format="compact"
                    className="text-gray-900"
                    usdClassName="text-xs text-gray-400"
                  />
                ) : (
                  <div>${targetAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Form */}
        {isMember && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Make Contribution</h2>
            {!showContributionForm ? (
              <button
                onClick={() => setShowContributionForm(true)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Add Contribution
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contribution Token
                  </label>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <div className={`inline-flex items-center px-3 py-2 rounded text-sm font-medium ${(group.tokenType ?? 0) === 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                      }`}>
                      {(group.tokenType ?? 0) === 0 ? "CELO" : "G$ (GoodDollar)"}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This group accepts contributions in {(group.tokenType ?? 0) === 0 ? "CELO" : "G$ (GoodDollar)"} only.
                    </p>
                  </div>
                  {selectedToken === "G$" && (
                    <div className="text-xs text-gray-500 mt-1 space-y-1">
                      <p>Balance: {gdBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} G$</p>
                      {contractAddress && (
                        <p>Allowance: {gdAllowance.toLocaleString(undefined, { maximumFractionDigits: 2 })} G$</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ({selectedToken})
                  </label>
                  <input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={contributionDescription}
                    onChange={(e) => setContributionDescription(e.target.value)}
                    placeholder="What is this contribution for?"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                {(contributionError || contributionTokenError) && (
                  <div className="text-red-600 text-sm">
                    {(contributionError || contributionTokenError)?.message || "Failed to make contribution"}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleMakeContribution}
                    disabled={isSubmitting || isSubmittingToken || isApproving || !contributionAmount}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isApproving ? "Approving G$..." : (isSubmitting || isSubmittingToken) ? "Submitting..." : "Submit Contribution"}
                  </button>
                  <button
                    onClick={() => {
                      setShowContributionForm(false);
                      setContributionAmount("");
                      setContributionDescription("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* G$ Price Info for G$ groups */}
        {(group.tokenType ?? 0) === 1 && (
          <div className="mt-6">
            <GDollarPriceDisplay compact={true} className="w-full" />
          </div>
        )}

        {/* Contributions History */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Contributions</h2>
            {(group.tokenType ?? 0) === 1 && (
              <GDollarPriceDisplay compact={true} />
            )}
          </div>
          {isLoadingContributions ? (
            <div className="text-center py-4 text-gray-500">Loading contributions...</div>
          ) : contributions && contributions.length > 0 ? (
            <div className="space-y-3">
              {contributions.map((contribution: any) => (
                <div key={contribution.contributionId.toString()} className="border-b border-gray-200 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        {isGDollarGroup ? (
                          <InlineGDollarAmount amount={Number(contribution.amount) / 1e18} className="text-gray-900" />
                        ) : (
                          <p className="font-medium text-gray-900">
                            ${(Number(contribution.amount) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </p>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${(contribution.tokenType ?? 0) === 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                          }`}>
                          {(contribution.tokenType ?? 0) === 0 ? "CELO" : "G$"}
                        </span>
                      </div>
                      {contribution.description && (
                        <p className="text-sm text-gray-600 mt-1">{contribution.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(Number(contribution.timestamp) * 1000).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {contribution.member.slice(0, 6)}...{contribution.member.slice(-4)}
                      </p>
                      {contribution.isVerified && (
                        <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No contributions yet</div>
          )}
        </div>

        {/* Milestones */}
        {milestones && milestones.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Milestones</h2>
            {isLoadingMilestones ? (
              <div className="text-center py-4 text-gray-500">Loading milestones...</div>
            ) : (
              <div className="space-y-3">
                {milestones.map((milestone: any) => (
                  <div key={milestone.milestoneId.toString()} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{milestone.description}</p>
                        <p className="text-sm text-gray-600">
                          Target: ${(Number(milestone.targetAmount) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      {milestone.isReached && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Reached
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
