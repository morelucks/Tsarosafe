"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useUserGroups, useGroup, useGroupMembers, useGroupStats, useGroupContributions } from "@/hooks/useTsaroSafe";
import { Address } from "viem";
import GoodDollarBalance from "@/app/components/GoodDollarBalance";
import UBIClaim from "@/app/components/UBIClaim";
import GDollarPriceDisplay from "@/app/components/GDollarPriceDisplay";
import GDollarPriceChart from "@/app/components/GDollarPriceChart";
import { USDAmount, InlineGDollarAmount } from "@/app/components/GDollarAmount";
import { Group, GroupStats } from "@/types/group";
import { useUBIClaimInfo } from "@/hooks/useGoodDollar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import EngagementRewardsNotification from "@/components/EngagementRewardsNotification";

interface DashboardStats {
  totalSavings: number;
  activeGroups: number;
  totalInvestments: number;
  monthlyGoal: number;
}

interface RecentActivity {
  id: string;
  type: 'deposit' | 'withdrawal' | 'group_join' | 'investment';
  amount?: number;
  tokenType?: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

// Component to fetch stats for a single group and report back
function GroupStatFetcher({ groupId, onAmountUpdate }: { groupId: bigint, onAmountUpdate: (amount: number) => void }) {
  const { stats: statsData } = useGroupStats(groupId);
  const stats = statsData as GroupStats | undefined;
  
  useEffect(() => {
    if (stats) {
      const amount = Number(stats.currentAmount) / 1e18;
      onAmountUpdate(amount);
    }
  }, [stats, onAmountUpdate]);
  
  return null;
}

// Component to fetch contributions for recent activity
function GroupContributionsFetcher({ groupId, groupName, onContributionsUpdate }: { 
  groupId: bigint, 
  groupName: string,
  onContributionsUpdate: (activities: RecentActivity[]) => void 
}) {
  const { contributions: contributionsData } = useGroupContributions(groupId, 0n, 10);
  const contributions = contributionsData as any[] | undefined;
  
  useEffect(() => {
    if (contributions && contributions.length > 0) {
      const activities: RecentActivity[] = contributions.map((contrib: any) => ({
        id: contrib.contributionId.toString(),
        type: 'deposit' as const,
        amount: Number(contrib.amount) / 1e18,
        tokenType: Number(contrib.tokenType ?? 0),
        description: contrib.description || `Contribution to ${groupName}`,
        timestamp: new Date(Number(contrib.timestamp) * 1000).toISOString(),
        status: contrib.isVerified ? 'completed' as const : 'pending' as const
      }));
      onContributionsUpdate(activities);
    }
  }, [contributions, groupName, onContributionsUpdate]);
  
  return null;
}

// Component to display a single group card
function GroupCard({ groupId }: { groupId: bigint }) {
  const { group: groupData, isLoading } = useGroup(groupId);
  const { members: membersData, isLoading: isLoadingMembers } = useGroupMembers(groupId);
  
  const group = groupData as Group | undefined;
  const members = membersData as string[] | undefined;

  if (isLoading || !group) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const memberCount = members?.length || 0;
  const privacy = group.isPrivate ? 'private' : 'public';
  const targetAmount = Number(group.targetAmount) / 1e18; // Convert from wei

  return (
    <Link href={`/group/${groupId}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow block">
      <h3 className="font-semibold text-gray-900">{group.name}</h3>
      <p className="text-sm text-gray-600 mt-1">{group.description}</p>
      <div className="mt-3 flex justify-between items-center text-sm">
        <span className="text-gray-500">{memberCount} members</span>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs ${
            privacy === 'public' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {privacy}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            (group.tokenType ?? 0) === 0 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {(group.tokenType ?? 0) === 0 ? "CELO" : "G$"}
          </span>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Goal: ${targetAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
    </Link>
  );
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSavings: 0,
    activeGroups: 0,
    totalInvestments: 0,
    monthlyGoal: 1000
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  const { address } = useAccount();
  const { groupIds: groupIdsData, isLoading: isLoadingGroups } = useUserGroups(address as Address | undefined);
  const groupIds = groupIdsData as bigint[] | undefined;
  const { claimableAmountFormatted, canClaim } = useUBIClaimInfo();
  
  const [groupAmounts, setGroupAmounts] = useState<Map<string, number>>(new Map());
  const [allActivities, setAllActivities] = useState<Map<string, RecentActivity[]>>(new Map());

  // Calculate total savings from all groups
  const totalSavings = useMemo(() => {
    let total = 0;
    groupAmounts.forEach((amount) => {
      total += amount;
    });
    return total;
  }, [groupAmounts]);

  const handleGroupAmountUpdate = useCallback((groupId: bigint, amount: number) => {
    setGroupAmounts(prev => {
      const newMap = new Map(prev);
      newMap.set(groupId.toString(), amount);
      return newMap;
    });
  }, []);

  const handleContributionsUpdate = useCallback((groupId: bigint, activities: RecentActivity[]) => {
    setAllActivities(prev => {
      const newMap = new Map(prev);
      newMap.set(groupId.toString(), activities);
      return newMap;
    });
  }, []);

  // Aggregate all activities and sort by timestamp
  useEffect(() => {
    const aggregated: RecentActivity[] = [];
    allActivities.forEach((activities) => {
      aggregated.push(...activities);
    });
    
    // Sort by timestamp (newest first) and take top 5
    aggregated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivity(aggregated.slice(0, 5));
  }, [allActivities]);

  useEffect(() => {
    if (!groupIds || groupIds.length === 0) {
      setStats({
        totalSavings: 0,
        activeGroups: 0,
        totalInvestments: 0,
        monthlyGoal: 1000
      });
      return;
    }

    setStats(prev => ({
      ...prev,
      totalSavings,
      activeGroups: groupIds.length,
      totalInvestments: 0, // Not tracked in contract yet
      monthlyGoal: 1000 // User preference, not in contract
    }));
  }, [groupIds, totalSavings]);

  const isLoading = isLoadingGroups;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'group_join':
        return '👥';
      case 'investment':
        return '📈';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const renderAmount = (activity: RecentActivity) => {
    if (activity.tokenType === 1) {
      return (
        <span className="text-sm text-gray-600">
          <InlineGDollarAmount amount={activity.amount || 0} className="text-gray-900" />
        </span>
      );
    }
    if (activity.amount !== undefined) {
      return (
        <span className="text-sm text-gray-600">
          ${activity.amount.toLocaleString()}
        </span>
      );
    }
    return null;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const savingsProgress = (stats.totalSavings / stats.monthlyGoal) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <EngagementRewardsNotification />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here&apos;s your financial overview.</p>
        </div>

        {/* GoodDollar Balance, UBI Claim, and Price */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GoodDollarBalance />
          <UBIClaim />
          <GDollarPriceDisplay showDetails={true} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Savings</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.totalSavings.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Groups</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeGroups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  canClaim ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <span className={`text-lg ${canClaim ? 'text-green-600' : 'text-gray-600'}`}>🌍</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">UBI Available</p>
                <p className={`text-2xl font-semibold ${canClaim ? 'text-green-600' : 'text-gray-900'}`}>
                  {claimableAmountFormatted.toLocaleString(undefined, { maximumFractionDigits: 2 })} G$
                </p>
                <div className="text-sm text-gray-500">
                  <USDAmount gdollarAmount={claimableAmountFormatted} className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-lg">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Goal</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.monthlyGoal.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Savings Progress */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Savings Progress</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Monthly Goal Progress</span>
                  <span>{Math.round(savingsProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-[#0f2a56] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>${stats.totalSavings.toLocaleString()}</span>
                  <span>${stats.monthlyGoal.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Link 
                  href="/savings"
                  className="bg-[#0f2a56] text-white px-4 py-2 rounded-lg text-center hover:bg-[#0f2a56]/90 transition-colors"
                >
                  Add Savings
                </Link>
                <Link 
                  href="/create-group"
                  className="bg-[#0f2a56] text-white px-4 py-2 rounded-lg text-center hover:bg-[#0f2a56]/90 transition-colors"
                >
                  Create Group
                </Link>
              </div>
            </div>

            {/* G$ Price Chart */}
            <GDollarPriceChart height={250} />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    {renderAmount(activity)}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.timestamp)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No recent activity. Make a contribution to see it here!
                </div>
              )}
            </div>
            {recentActivity.length > 0 && (
              <div className="mt-4">
                <Link 
                  href="/dashboard"
                  className="text-blue-600 text-sm hover:text-blue-800"
                >
                  View all activity →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Hidden components to fetch group stats and contributions */}
        {groupIds && groupIds.length > 0 && (
          <>
            {groupIds.map((groupId) => {
              const GroupContributionsWrapper = () => {
                const { group: groupData } = useGroup(groupId);
                const group = groupData as Group | undefined;
                return (
                  <>
                    <GroupStatFetcher 
                      key={`stats-${groupId.toString()}`} 
                      groupId={groupId} 
                      onAmountUpdate={(amount) => handleGroupAmountUpdate(groupId, amount)}
                    />
                    {group && (
                      <GroupContributionsFetcher
                        key={`contribs-${groupId.toString()}`}
                        groupId={groupId}
                        groupName={group.name}
                        onContributionsUpdate={(activities) => handleContributionsUpdate(groupId, activities)}
                      />
                    )}
                  </>
                );
              };
              return <GroupContributionsWrapper key={`wrapper-${groupId.toString()}`} />;
            })}
          </>
        )}

        {/* Your Groups */}
        {groupIds && groupIds.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Groups</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupIds.map((groupId) => (
                  <GroupCard key={groupId.toString()} groupId={groupId} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                href="/savings"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl mb-2">💰</span>
                <span className="text-sm font-medium text-gray-900">Add Savings</span>
              </Link>
              <Link 
                href="/create-group"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl mb-2">👥</span>
                <span className="text-sm font-medium text-gray-900">Create Group</span>
              </Link>
              <Link 
                href="/join-group"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl mb-2">🔍</span>
                <span className="text-sm font-medium text-gray-900">Join Group</span>
              </Link>
              <Link 
                href="/price"
                className="flex flex-col items-center p-4 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-3xl mb-2">💱</span>
                <span className="text-sm font-medium text-blue-800">G$ Price</span>
                <span className="text-xs text-blue-600 mt-1">Charts & Converter</span>
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DashboardPage;
