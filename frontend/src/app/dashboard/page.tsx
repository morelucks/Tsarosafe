// Dashboard: main user dashboard showing groups, balances, and activity
"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAccount, useSwitchChain } from "wagmi";
import { useUserGroups, useGroup, useGroupMembers } from "@/hooks/useTsaroSafe";
import { Address } from "viem";
import { Group } from "@/types/group";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AdminPanel from "@/app/components/AdminPanel";
import { GroupStatFetcher, GroupContributionsFetcher } from "@/components/dashboard/Fetchers";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { ActivityFeed } from "@/components/ActivityFeed";
import MiniPayBoosterCard from "@/app/components/MiniPayBoosterStatus";

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
      <div className="bg-[#0c0d1e]/60 border border-white/5 rounded-xl p-5 backdrop-blur-md">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/10 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse"></div>
          <div className="h-8 bg-white/10 rounded w-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  const memberCount = members?.length || 0;
  const privacy = group.isPrivate ? 'private' : 'public';
  const targetAmount = Number(group.targetAmount) / 1e18; // Convert from wei

  return (
    <Link
      href={`/group/${groupId}`}
      className="group bg-[#0c0d1e]/85 border border-white/5 rounded-xl p-5 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.05)] transition-all duration-300 block relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/5 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>
      <h3 className="font-bold text-white text-lg group-hover:text-cyan-400 transition-colors uppercase tracking-wide">{group.name}</h3>
      <p className="text-xs text-slate-400 mt-2 font-medium line-clamp-2 leading-relaxed">{group.description}</p>
      
      <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
        <span className="text-slate-400 font-medium">{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            privacy === 'public'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
          }`}>
            {privacy}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            CELO
          </span>
        </div>
      </div>
      
      <div className="mt-3 text-xs font-semibold text-slate-300 flex items-center justify-between">
        <span>Target Goal:</span>
        <span className="text-white font-extrabold">{targetAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} CELO</span>
      </div>
    </Link>
  );
}

// Wrapper component to fetch group stats and contributions without nesting
function GroupFetchers({
  groupId,
  onAmountUpdate,
  onContributionsUpdate
}: {
  groupId: bigint;
  onAmountUpdate: (groupId: bigint, amount: number) => void;
  onContributionsUpdate: (groupId: bigint, activities: RecentActivity[]) => void;
}) {
  const { group: groupData } = useGroup(groupId);
  const group = groupData as Group | undefined;

  return (
    <>
      <GroupStatFetcher
        groupId={groupId}
        onAmountUpdate={(amount) => onAmountUpdate(groupId, amount)}
      />
      {group && (
        <GroupContributionsFetcher
          groupId={groupId}
          groupName={group.name}
          onContributionsUpdate={(activities) => onContributionsUpdate(groupId, activities)}
        />
      )}
    </>
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

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // UX refinement: displaying LoadingSkeleton cards
  // Return early if not mounted to prevent hooks from being called during SSR
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return <DashboardContent stats={stats} setStats={setStats} recentActivity={recentActivity} setRecentActivity={setRecentActivity} />;
};

// Separate component that uses wagmi hooks - only rendered client-side
function DashboardContent({ stats, setStats, recentActivity, setRecentActivity }: {
  stats: DashboardStats;
  setStats: React.Dispatch<React.SetStateAction<DashboardStats>>;
  recentActivity: RecentActivity[];
  setRecentActivity: React.Dispatch<React.SetStateAction<RecentActivity[]>>;
}) {
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const isCelo = chain?.id === 42220 || chain?.id === 44787;

  const { groupIds: groupIdsData, isLoading: isLoadingGroups } = useUserGroups(address as Address | undefined);
  const groupIds = groupIdsData as bigint[] | undefined;

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

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center p-8">
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
      <div className="min-h-screen bg-[#030014] text-white py-12 relative overflow-hidden">
        {/* Background decorative glowing meshes */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none"></div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 pb-6 border-b border-white/5">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white uppercase leading-none">
                Dashboard <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-black">Overview</span>
              </h1>
              <p className="mt-2 text-slate-400 text-sm font-medium">
                Welcome back! Monitor your digital wealth, community savings, and active circles.
              </p>
            </div>
            {address && (
              <div className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Total Savings Card */}
            <div className="relative group bg-[#0b0c16]/80 border border-white/5 hover:border-cyan-500/30 rounded-2xl p-6 transition-all duration-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] hover:-translate-y-1 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500 pointer-events-none"></div>
              <div className="relative flex items-center">
                <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/25 rounded-xl flex items-center justify-center mr-4 text-cyan-400 text-2xl group-hover:scale-110 transition-transform">
                  💰
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Savings</p>
                  <p className="text-2xl font-black text-white mt-1">{stats.totalSavings.toLocaleString('en-US')} CELO</p>
                </div>
              </div>
            </div>

            {/* Active Groups Card */}
            <div className="relative group bg-[#0b0c16]/80 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:-translate-y-1 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none"></div>
              <div className="relative flex items-center">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex items-center justify-center mr-4 text-indigo-400 text-2xl group-hover:scale-110 transition-transform">
                  👥
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Groups</p>
                  <p className="text-2xl font-black text-white mt-1">{stats.activeGroups}</p>
                </div>
              </div>
            </div>

            {/* Goal Progress Card */}
            <div className="relative group bg-[#0b0c16]/80 border border-white/5 hover:border-blue-500/30 rounded-2xl p-6 transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none"></div>
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Goal Progress</p>
                  <span className="text-xs font-bold text-blue-400">{Math.round(savingsProgress)}%</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white mb-2">
                  <span>{stats.totalSavings.toLocaleString('en-US')} of {stats.monthlyGoal.toLocaleString('en-US')} CELO</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-3.5 relative overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Quick Actions Card */}
              <div className="bg-[#0b0c16]/70 border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-2xl backdrop-blur-xl flex-1 flex flex-col justify-between">
                <div className="absolute bottom-4 right-6 text-3xl font-black tracking-widest text-white/[0.015] select-none pointer-events-none font-mono">
                  TSAROSAFE
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
                    <span className="text-cyan-400">🚀</span> Quick Actions
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/savings"
                      className="group relative flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(59,130,246,0.15)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.3)] active:scale-95 text-sm uppercase tracking-wider text-center"
                    >
                      <span>💰</span> Add Savings
                    </Link>
                    <Link
                      href="/create-group"
                      className="group relative flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(99,102,241,0.15)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.3)] active:scale-95 text-sm uppercase tracking-wider text-center"
                    >
                      <span>👥</span> Create Group
                    </Link>
                    <Link
                      href="/join-group"
                      className="group relative flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(168,85,247,0.15)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.3)] active:scale-95 text-sm uppercase tracking-wider text-center"
                    >
                      <span>🔍</span> Join Group
                    </Link>
                    <Link
                      href="/invest"
                      className="group relative flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.15)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.3)] active:scale-95 text-sm uppercase tracking-wider text-center"
                    >
                      <span>📈</span> Portfolio
                    </Link>
                  </div>
                </div>
              </div>

              {/* MiniPay Booster Card */}
              <MiniPayBoosterCard />
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-1 flex flex-col h-full">
              <ActivityFeed activities={recentActivity} showViewAll={true} />
            </div>
          </div>

          {/* Hidden components to fetch group stats and contributions */}
          {groupIds && groupIds.length > 0 && (
            <>
              {groupIds.map((groupId) => (
                <GroupFetchers
                  key={`fetcher-${groupId.toString()}`}
                  groupId={groupId}
                  onAmountUpdate={handleGroupAmountUpdate}
                  onContributionsUpdate={handleContributionsUpdate}
                />
              ))}
            </>
          )}

          {/* Your Groups */}
          {groupIds && groupIds.length > 0 ? (
            <div className="mt-12">
              <div className="bg-[#0b0c16]/75 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
                <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider border-b border-white/5 pb-4">
                  Your Savings Circles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupIds.map((groupId) => (
                    <GroupCard key={groupId.toString()} groupId={groupId} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-12 text-center p-12 bg-[#0b0c16]/70 border border-dashed border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-4 animate-bounce">🔍</div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider animate-pulse">No Active Groups Found</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed font-medium">
                  We couldn&apos;t find any community savings groups registered for your address on the <strong className="text-cyan-400">{chain?.name || 'current'}</strong> network.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  {!isCelo && (
                    <button
                      onClick={() => switchChain({ chainId: 42220 })}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-full transition-all active:scale-95 text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    >
                      <span>🌍</span> Switch to Celo Network
                    </button>
                  )}
                  <Link
                    href="/create-group"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-full transition-all active:scale-95 text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                  >
                    <span>👥</span> Create Savings Circle
                  </Link>
                  <Link
                    href="/join-group"
                    className="inline-flex items-center gap-2 border border-white/10 hover:bg-white/5 text-white font-bold py-3 px-8 rounded-full transition-all active:scale-95 text-xs uppercase tracking-wider"
                  >
                    <span>🔍</span> Find Circles
                  </Link>
                </div>
              </div>
            </div>
          )}

          <AdminPanel />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DashboardPage;
