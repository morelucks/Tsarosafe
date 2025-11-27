"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGroup, useGroupMembers, useGroupStats } from "@/hooks/useTsaroSafe";

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params?.id ? BigInt(params.id as string) : undefined;

  const { group, isLoading: isLoadingGroup } = useGroup(groupId);
  const { members, isLoading: isLoadingMembers } = useGroupMembers(groupId);
  const { stats, isLoading: isLoadingStats } = useGroupStats(groupId);

  const isLoading = isLoadingGroup || isLoadingMembers || isLoadingStats;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Group Not Found</h1>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const targetAmount = Number(group.targetAmount) / 1e18;
  const currentAmount = Number(group.currentAmount) / 1e18;
  const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const memberCount = members?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
          <p className="mt-2 text-gray-600">{group.description}</p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Group Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Privacy</p>
              <p className="font-medium text-gray-900">{group.isPrivate ? "Private" : "Public"}</p>
            </div>
            <div>
              <p className="text-gray-600">Members</p>
              <p className="font-medium text-gray-900">{memberCount} / {Number(group.memberLimit)}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className={`font-medium ${group.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {group.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Progress</p>
              <p className="font-medium text-gray-900">{progressPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress</h2>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Goal Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>${currentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              <span>${targetAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
