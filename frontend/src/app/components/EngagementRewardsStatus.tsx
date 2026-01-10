"use client";
import { useEngagementRewardsStatus } from "@/hooks/useEngagementRewardsStatus";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

export default function EngagementRewardsStatus() {
  const { address } = useAccount();
  const { canClaim, lastClaimBlock, isLoading, error } = useEngagementRewardsStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !address) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  const formatLastClaim = () => {
    if (!lastClaimBlock || lastClaimBlock === 0n) {
      return "Never claimed";
    }
    // Convert block number to approximate time (assuming ~5s per block on Celo)
    const blocksAgo = Number(lastClaimBlock);
    const secondsAgo = blocksAgo * 5;
    const minutesAgo = Math.floor(secondsAgo / 60);
    const hoursAgo = Math.floor(minutesAgo / 60);
    
    if (hoursAgo > 24) {
      const daysAgo = Math.floor(hoursAgo / 24);
      return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    } else if (hoursAgo > 0) {
      return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
    } else if (minutesAgo > 0) {
      return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Engagement Rewards</h3>
          <p className="text-sm opacity-90">Earn G$ for your activity</p>
        </div>
        <div className="text-3xl">🎁</div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-90">Status:</span>
          <span className={`font-medium px-3 py-1 rounded-full text-xs ${
            canClaim 
              ? 'bg-green-200 text-green-800' 
              : 'bg-blue-200 text-blue-800'
          }`}>
            {canClaim ? 'Available' : 'Active'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm opacity-90">Last Claim:</span>
          <span className="font-medium">{formatLastClaim()}</span>
        </div>

        <div className="pt-2 border-t border-purple-400 border-opacity-30">
          <p className="text-xs opacity-75">
            Rewards are automatically claimed when you make contributions or create groups.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 text-xs p-2 rounded mt-2">
            ⚠️ Error loading rewards status
          </div>
        )}
      </div>
    </div>
  );
}

