import Link from "next/link";
import { Group } from "@/types/group";
import { useGroup, useGroupMembers } from "@/hooks/useTsaroSafe";

export function GroupCard({ groupId }: { groupId: bigint }) {
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${privacy === 'public'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                        {privacy}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${(group.tokenType ?? 0) === 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                        {(group.tokenType ?? 0) === 0 ? "CELO" : "G$"}
                    </span>
                </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
                Goal: ${targetAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
        </Link>
    );
}
