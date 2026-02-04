"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useUserGroups, useGroup, useGroupMembers } from "@/hooks/useTsaroSafe";
import { Address } from "viem";
import GoodDollarBalance from "@/app/components/GoodDollarBalance";
import UBIClaim from "@/app/components/UBIClaim";
import GDollarPriceDisplay from "@/app/components/GDollarPriceDisplay";
import GDollarPriceChart from "@/app/components/GDollarPriceChart";
import { USDAmount } from "@/app/components/GDollarAmount";
import { Group } from "@/types/group";
import { useUBIClaimInfo } from "@/hooks/useGoodDollar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import EngagementRewardsNotification from "@/components/EngagementRewardsNotification";
import EngagementRewardsStatus from "@/app/components/EngagementRewardsStatus";
import AdminPanel from "@/app/components/AdminPanel";
import { GroupStatFetcher, GroupContributionsFetcher } from "@/components/dashboard/Fetchers";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { ActivityFeed } from "@/components/ActivityFeed";

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


// Component to display a single group card
function GroupCard({ groupId }: { groupId: bigint }) {
  const { group: groupData, isLoading } = useGroup(groupId);
  const { members: membersData } = useGroupMembers(groupId);

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
          <span className={`px-2 py-1 rounded text-xs ${privacy === 'public'
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
            }`}>
            {privacy}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${(group.tokenType ?? 0) === 0
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
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalSavings: 0,
    activeGroups: 0,
    totalInvestments: 0,
    monthlyGoal: 1000
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  const { address } = useAccount();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);
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
  const savingsProgress = (stats.totalSavings / stats.monthlyGoal) * 100;

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
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

          {/* Engagement Rewards Status */}
          <div className="mb-6">
            <EngagementRewardsStatus />
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1 space-y-6">
              <GoodDollarBalance />
              <UBIClaim />
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Savings</p>
                    <p className="text-3xl font-black text-gray-900">${stats.totalSavings.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Groups</p>
                    <p className="text-3xl font-black text-gray-900">{stats.activeGroups}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 md:col-span-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Monthly Goal Progress</h3>
                <div className="flex justify-between text-sm font-bold text-gray-900 mb-2">
                  <span>${stats.totalSavings.toLocaleString()} of ${stats.monthlyGoal.toLocaleString()}</span>
                  <span>{Math.round(savingsProgress)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Savings Progress */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg shadow p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-4xl transform rotate-12 -translate-y-2 translate-x-2">TSAROSAFE</div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 relative z-10 flex items-center gap-2">
                  <span>🚀</span> Quick Actions
                </h2>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <Link
                    href="/savings"
                    className="bg-blue-600 text-white px-4 py-3 rounded-xl text-center font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>💰</span> Add Savings
                  </Link>
                  <Link
                    href="/create-group"
                    className="bg-indigo-600 text-white px-4 py-3 rounded-xl text-center font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>👥</span> Create Group
                  </Link>
                  <Link
                    href="/join-group"
                    className="bg-purple-600 text-white px-4 py-3 rounded-xl text-center font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>🔍</span> Join Group
                  </Link>
                  <Link
                    href="/invest"
                    className="bg-emerald-600 text-white px-4 py-3 rounded-xl text-center font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>📈</span> Portfolio
                  </Link>
                </div>
              </div>

              {/* G$ Price Chart */}
              <GDollarPriceChart height={250} />
            </div>

            {/* Recent Activity */}
            <ActivityFeed activities={recentActivity} showViewAll={true} />
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

          {/* Quick Actions (Duplicate removed) */}
          <AdminPanel />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DashboardPage;
