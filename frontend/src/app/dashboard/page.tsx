"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useUserGroups, useGroup } from "@/hooks/useTsaroSafe";
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
import { GroupCard } from "@/components/GroupCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { GroupStatFetcher, GroupContributionsFetcher } from "@/components/dashboard/Fetchers";
import { RecentActivity } from "@/types/activity";

interface DashboardStats {
  totalSavings: number;
  activeGroups: number;
  totalInvestments: number;
  monthlyGoal: number;
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${canClaim ? 'bg-green-100' : 'bg-gray-100'
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
