import Link from "next/link";
import { Group, GroupStats } from "@/types/group";
import { useGroup, useGroupStats } from "@/hooks/useTsaroSafe";

export function SavingsGroupCard({ groupId }: { groupId: bigint }) {
    const { group: groupData, isLoading } = useGroup(groupId);
    const { stats: statsData } = useGroupStats(groupId);

    const group = groupData as Group | undefined;
    const stats = statsData as GroupStats | undefined;

    if (isLoading || !group || !stats) {
        return (
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
        );
    }

    const currentAmount = Number(stats.currentAmount) / 1e18;
    const targetAmount = Number(group.targetAmount) / 1e18;
    const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    const deadlineDate = new Date(Number(group.endDate) * 1000);
    const daysRemaining = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = daysRemaining <= 0;

    return (
        <Link href={`/group/${groupId}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group block relative overflow-hidden">
            {/* Hover Effect Gradient */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#0f2a56] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-bottom"></div>

            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-4">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{group.name}</h3>
                    <div className="flex gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${group.isPrivate ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-700'
                            }`}>
                            {group.isPrivate ? '🔒 Private' : '🌍 Public'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${(group.tokenType ?? 0) === 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                            {(group.tokenType ?? 0) === 0 ? "CELO" : "G$"}
                        </span>
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-500 mb-6 line-clamp-2 min-h-[40px]">{group.description}</p>

            <div className="mb-5">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    <span>Savings Goal</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${progress >= 100 ? 'bg-green-500' : 'bg-[#0f2a56]'
                            }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between items-baseline mt-2">
                    <span className="text-2xl font-bold text-gray-900">${currentAmount.toLocaleString()}</span>
                    <span className="text-sm text-gray-400">of ${targetAmount.toLocaleString()}</span>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm">
                <div className={`flex items-center gap-1 ${isExpired ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    <span>{isExpired ? '⌛' : '🕒'}</span>
                    <span>{isExpired ? 'Ended' : `${daysRemaining} days left`}</span>
                </div>
                <span className="font-medium text-[#0f2a56] group-hover:underline decoration-2 underline-offset-2">View Details →</span>
            </div>
        </Link>
    );
}
