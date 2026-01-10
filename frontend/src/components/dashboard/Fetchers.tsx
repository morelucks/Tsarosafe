"use client";
import { useEffect } from "react";
import { useGroup, useGroupStats, useGroupContributions } from "@/hooks/useTsaroSafe";
import { Group, GroupStats } from "@/types/group";
import { RecentActivity } from "@/types/activity";

// Component to fetch stats for a single group and report back
export function GroupStatFetcher({ groupId, onAmountUpdate }: { groupId: bigint, onAmountUpdate: (amount: number, target: number) => void }) {
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

// Component to fetch contributions for recent activity
export function GroupContributionsFetcher({ groupId, groupName, onContributionsUpdate }: {
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
