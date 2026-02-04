"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useUserGroups, useGroup, useGroupStats } from "@/hooks/useTsaroSafe";
import { Address } from "viem";
import { Group, GroupStats } from "@/types/group";
import GoodDollarBalance from "@/app/components/GoodDollarBalance";
import UBIClaim from "@/app/components/UBIClaim";
import EngagementRewardsStatus from "@/app/components/EngagementRewardsStatus";
import EngagementRewardsNotification from "@/components/EngagementRewardsNotification";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Component to fetch stats for a single group and report back
function GroupStatFetcher({ groupId, onAmountUpdate }: { groupId: bigint, onAmountUpdate: (groupId: bigint, current: number, target: number) => void }) {
  const { stats: statsData } = useGroupStats(groupId);
  const { group: groupData } = useGroup(groupId);
  const stats = statsData as GroupStats | undefined;
  const group = groupData as Group | undefined;

  useEffect(() => {
    if (stats && group) {
      const amount = Number(stats.currentAmount) / 1e18;
      const target = Number(group.targetAmount) / 1e18;
      onAmountUpdate(groupId, amount, target);
    }
  }, [stats, group, groupId, onAmountUpdate]);

  return null;
}

// Component to display a single group card in Savings Overview
function SavingsGroupCard({ groupId }: { groupId: bigint }) {
  const { group: groupData, isLoading } = useGroup(groupId);
  const { stats: statsData } = useGroupStats(groupId);

  const group = groupData as Group | undefined;
  const stats = statsData as GroupStats | undefined;

  if (isLoading || !group || !stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-2 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  const currentAmount = Number(stats.currentAmount) / 1e18;
  const targetAmount = Number(group.targetAmount) / 1e18;
  const progress = (currentAmount / targetAmount) * 100;
  const isCelo = (group.tokenType ?? 0) === 0;

  return (
    <Link href={`/group/${groupId}`} className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden block">
      {/* Decorative background element */}
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 ${isCelo ? 'bg-blue-600' : 'bg-green-600'}`}></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1">
          <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{group.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1 font-medium">{group.description}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${isCelo ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isCelo ? 'bg-blue-600' : 'bg-green-600'} animate-pulse`}></span>
          {isCelo ? "CELO" : "G$"}
        </div>
      </div>

      <div className="mb-6 relative z-10">
        <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
          <span>Current Progress</span>
          <span className="text-gray-900">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isCelo ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'
              }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-end mt-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Saved</span>
            <span className="text-lg font-black text-gray-900">${currentAmount.toLocaleString()}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Goal</span>
            <span className="text-sm font-bold text-gray-600">${targetAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center text-[11px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Manage Circle <span className="ml-2">→</span>
      </div>
    </Link>
  );
}

export default function SavingsPage() {
  const { address } = useAccount();
  const { groupIds: groupIdsData, isLoading: isLoadingGroupIds } = useUserGroups(address as Address | undefined);
  const groupIds = groupIdsData as bigint[] | undefined;

  const [groupDataMap, setGroupDataMap] = useState<Map<string, { current: number, target: number }>>(new Map());

  const handleStatUpdate = useCallback((groupId: bigint, current: number, target: number) => {
    setGroupDataMap(prev => {
      const newMap = new Map(prev);
      const id = groupId.toString();
      if (newMap.get(id)?.current !== current || newMap.get(id)?.target !== target) {
        newMap.set(id, { current, target });
        return newMap;
      }
      return prev;
    });
  }, []);

  const { totalSaved, totalTarget, activeGoals, completedGoals } = useMemo(() => {
    let saved = 0;
    let target = 0;
    let active = 0;
    let completed = 0;

    groupDataMap.forEach((data) => {
      saved += data.current;
      target += data.target;
      active++;
      if (data.current >= data.target) {
        completed++;
      }
    });

    return {
      totalSaved: saved,
      totalTarget: target,
      activeGoals: active,
      completedGoals: completed
    };
  }, [groupDataMap]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Savings Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your on-chain savings and collaborative wealth circles.</p>
        </div>

        <ErrorBoundary>
          <EngagementRewardsNotification />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1 space-y-6">
              <GoodDollarBalance />
              <UBIClaim />
              <EngagementRewardsStatus />
            </div>

            <div className="lg:col-span-2">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6 border border-blue-50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-lg">💰</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Value Saved</p>
                      <p className="text-2xl font-bold text-gray-900">${totalSaved.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-green-50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg">🎯</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Goals</p>
                      <p className="text-2xl font-bold text-gray-900">{activeGoals}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-purple-50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-lg">✅</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{completedGoals}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-orange-50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-lg">📊</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Progress</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* Fetchers (Invisible) */}
        {groupIds?.map(id => (
          <GroupStatFetcher key={id.toString()} groupId={id} onAmountUpdate={handleStatUpdate} />
        ))}

        {/* On-Chain Groups Overview */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Savings Circles</h2>
            <Link
              href="/create-group"
              className="bg-[#0f2a56] text-white px-6 py-2 rounded-lg hover:bg-[#0f2a56]/90 transition-colors shadow-sm"
            >
              Start New Circle
            </Link>
          </div>

          {isLoadingGroupIds ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-white rounded-lg shadow animate-pulse"></div>
              ))}
            </div>
          ) : groupIds && groupIds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupIds.map((id) => (
                <SavingsGroupCard key={id.toString()} groupId={id} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-dashed border-gray-300 py-12 text-center">
              <span className="text-5xl mb-4 block">🏔️</span>
              <h3 className="text-xl font-bold text-gray-900">Quiet in here...</h3>
              <p className="text-gray-500 mb-6 mx-auto max-w-sm">
                You haven&apos;t joined any savings groups yet. Start your journey by creating a group or joining an existing one.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/create-group"
                  className="bg-[#0f2a56] text-white px-6 py-2 rounded-lg"
                >
                  Create Goal
                </Link>
                <Link
                  href="/join-group"
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                >
                  Discover Groups
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Solo Savings Info / Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#0f2a56] to-[#1e3a8a] rounded-xl p-8 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Solo On-Chain Vaults</h2>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Want to save alone? Simply create a private group with a member limit of 1.
              Your funds, your goals, absolute transparency.
            </p>
            <Link
              href="/create-group"
              className="inline-block bg-white text-[#0f2a56] px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              Create Private Vault
            </Link>
          </div>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Investment Insights</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              TsaroSafe is building automated yield generation for your Idle savings.
              Stay tuned for DeFi integration coming in Q1 2026.
            </p>
            <div className="flex items-center text-blue-600 font-semibold cursor-not-allowed">
              Explore Alpha Portfolio <span className="ml-2">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
