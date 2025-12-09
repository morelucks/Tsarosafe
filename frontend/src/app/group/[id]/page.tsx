"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useGroup, useGroupMembers, useGroupStats, useMakeContribution, useGroupContributions, useGroupMilestones } from "@/hooks/useTsaroSafe";
import { useGoodDollarBalance, useGoodDollarAllowance, useApproveGoodDollar } from "@/hooks/useGoodDollar";
import { useContractAddress } from "@/hooks/useTsaroSafe";
import { Address } from "viem";

export default function GroupDetailPage() {
  const params = useParams();
  const { address } = useAccount();
  const groupId = params?.id ? BigInt(params.id as string) : undefined;

  const { group, isLoading: isLoadingGroup, refetch: refetchGroup } = useGroup(groupId);
  const { members, isLoading: isLoadingMembers } = useGroupMembers(groupId);
  const { stats, isLoading: isLoadingStats } = useGroupStats(groupId);
  const { contributions, isLoading: isLoadingContributions, refetch: refetchContributions } = useGroupContributions(groupId);
  const { milestones, isLoading: isLoadingMilestones } = useGroupMilestones(groupId);
  const { makeContribution, isLoading: isSubmitting, isConfirmed, error: contributionError } = useMakeContribution();

  const [showContributionForm, setShowContributionForm] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionDescription, setContributionDescription] = useState("");
  const [selectedToken, setSelectedToken] = useState<"CELO" | "G$">("CELO");
  
  const { balanceFormatted: gdBalance } = useGoodDollarBalance();
  const contractAddress = useContractAddress();
  const { allowanceFormatted: gdAllowance } = useGoodDollarAllowance(contractAddress as Address | undefined);
  const { approve: approveGd, isLoading: isApproving } = useApproveGoodDollar();

  useEffect(() => {
    if (isConfirmed) {
      setShowContributionForm(false);
      setContributionAmount("");
      setContributionDescription("");
      refetchGroup();
      refetchContributions();
    }
  }, [isConfirmed, refetchGroup, refetchContributions]);

  const handleMakeContribution = async () => {
    if (!groupId || !contributionAmount || !contractAddress) return;
    
    try {
      const amountWei = BigInt(Math.floor(parseFloat(contributionAmount) * 1e18));
      
      // If using G$, check and request approval first
      if (selectedToken === "G$") {
        if (gdAllowance < parseFloat(contributionAmount)) {
          // Need to approve
          await approveGd(contractAddress as Address, amountWei * 2n); // Approve 2x for future contributions
          // Wait a bit for approval to confirm
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        // TODO: Call contract function that accepts G$ tokens
        // For now, fall through to regular contribution
      }
      
      await makeContribution(groupId, amountWei, contributionDescription || "Contribution");
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
              <p className="text-gray-600">Progress</p>
              <p className="font-medium text-gray-900">{progressPercentage.toFixed(1)}%</p>
            </div>
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
              <span>${currentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              <span>${targetAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
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
                    Select Token
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedToken("CELO")}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        selectedToken === "CELO"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700"
                      }`}
                    >
                      CELO
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedToken("G$")}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        selectedToken === "G$"
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-300 bg-white text-gray-700"
                      }`}
                    >
                      GoodDollar (G$)
                    </button>
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
                {contributionError && (
                  <div className="text-red-600 text-sm">
                    {contributionError.message || "Failed to make contribution"}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleMakeContribution}
                    disabled={isSubmitting || isApproving || !contributionAmount}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isApproving ? "Approving..." : isSubmitting ? "Submitting..." : "Submit Contribution"}
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

        {/* Contributions History */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contributions</h2>
          {isLoadingContributions ? (
            <div className="text-center py-4 text-gray-500">Loading contributions...</div>
          ) : contributions && contributions.length > 0 ? (
            <div className="space-y-3">
              {contributions.map((contribution: any) => (
                <div key={contribution.contributionId.toString()} className="border-b border-gray-200 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        ${(Number(contribution.amount) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
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
