"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAccount } from "wagmi";
import { useUserGroups, useGroup } from "@/hooks/useTsaroSafe";
import { Address } from "viem";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ActivityFeed } from "@/components/ActivityFeed";
import { GroupContributionsFetcher } from "@/components/dashboard/Fetchers";
import { RecentActivity } from "@/types/activity";
import { Group } from "@/types/group";
import Link from "next/link";

const TransactionsPage = () => {
    const { address } = useAccount();
    const { groupIds: groupIdsData, isLoading: isLoadingGroups } = useUserGroups(address as Address | undefined);
    const groupIds = groupIdsData as bigint[] | undefined;

    const [allActivities, setAllActivities] = useState<Map<string, RecentActivity[]>>(new Map());
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

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

        // Sort by timestamp (newest first)
        aggregated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivity(aggregated);
    }, [allActivities]);

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
                                ← Back to Dashboard
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
                            <p className="mt-2 text-gray-600">View all your contributions and activities across groups.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow min-h-[400px]">
                        {isLoadingGroups ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="p-2">
                                <ActivityFeed activities={recentActivity} showViewAll={false} />
                            </div>
                        )}
                    </div>

                    {/* Hidden components to fetch stats */}
                    {groupIds && groupIds.length > 0 && (
                        <>
                            {groupIds.map((groupId) => {
                                const GroupContributionsWrapper = () => {
                                    const { group: groupData } = useGroup(groupId);
                                    const group = groupData as Group | undefined;
                                    return (
                                        <>
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
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default TransactionsPage;
