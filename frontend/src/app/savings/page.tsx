"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useUserGroups, useGroup, useGroupStats } from "@/hooks/useTsaroSafe";
import { Address } from "viem";
import { Group, GroupStats } from "@/types/group";

// Component to fetch stats for a single group and report back
function GroupStatFetcher({ groupId, onAmountUpdate }: { groupId: bigint, onAmountUpdate: (amount: number, target: number) => void }) {
  const { stats: statsData } = useGroupStats(groupId);
  const { group: groupData } = useGroup(groupId);
  const stats = statsData as GroupStats | undefined;
  const group = groupData as Group | undefined;
  
  useEffect(() => {
    if (stats && group) {
      const amount = Number(stats.currentAmount) / 1e18;
      const target = Number(group.targetAmount) / 1e18;
      onAmountUpdate(amount, target);
    }
  }, [stats, group, onAmountUpdate]);
  
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
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
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
  const deadlineDate = new Date(Number(group.endDate) * 1000);
  const daysRemaining = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Link href={`/group/${groupId}`} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all block">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          (group.tokenType ?? 0) === 0 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {(group.tokenType ?? 0) === 0 ? "CELO" : "G$"}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-[#0f2a56] h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-2 font-medium">
          <span>{currentAmount.toLocaleString()}</span>
          <span>{targetAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <span className={daysRemaining < 7 ? 'text-red-500 font-bold' : ''}>
          {daysRemaining > 0 ? `${daysRemaining} days left` : 'Reviewing / Ended'}
        </span>
        <span>{deadlineDate.toLocaleDateString()}</span>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Value Saved</p>
                <p className="text-2xl font-semibold text-gray-900">${totalSaved.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Goals</p>
                <p className="text-2xl font-semibold text-gray-900">{activeGoals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-lg">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{completedGoals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-lg">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

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
