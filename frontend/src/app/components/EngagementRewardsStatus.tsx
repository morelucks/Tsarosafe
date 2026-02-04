"use client";
import { useEngagementRewardsStatus } from "@/hooks/useEngagementRewardsStatus";
import { useClaimEngagementReward, useCurrentBlockNumber } from "@/hooks/useEngagementRewards";
import { useAccount, useBlockNumber, useSwitchChain } from "wagmi";
import { useEffect, useState } from "react";
import { calculateValidUntilBlock, generateSignature } from "@/lib/engagementRewards";
import { Address } from "viem";

export default function EngagementRewardsStatus() {
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { canClaim, lastClaimBlock, isLoading, error } = useEngagementRewardsStatus();
  const { data: currentBlock } = useBlockNumber();
  const { claimReward, isLoading: isClaiming, isConfirmed } = useClaimEngagementReward();
  const { getCurrentBlock } = useCurrentBlockNumber();
  const [mounted, setMounted] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !address) {
    return null;
  }

  // Check if current network supports GoodDollar Engagement Rewards (mainly Celo)
  const isCelo = chain?.id === 42220 || chain?.id === 44787;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  const formatLastClaim = () => {
    if (!lastClaimBlock || lastClaimBlock === 0n || !currentBlock) {
      return "Never claimed";
    }

    const blocksAgo = Number(currentBlock) - Number(lastClaimBlock);
    if (blocksAgo < 0) return "Just now";

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

  const handleManualClaim = async () => {
    if (!isCelo) {
      setLocalMessage("Please switch to Celo network to claim rewards.");
      return;
    }

    try {
      setLocalMessage("Preparing claim...");
      const curBlock = await getCurrentBlock();
      const validUntil = calculateValidUntilBlock(curBlock);
      const signature = await generateSignature(
        '0x4902045cEF54fBc664591a40fecf22Bb51932a45' as Address,
        undefined, // No inviter for manual dashboard claim
        validUntil,
        null
      );

      await claimReward(undefined, validUntil, signature);
    } catch (err) {
      console.error(err);
      setLocalMessage("Failed to initiate claim.");
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      setLocalMessage("🎉 Reward claim submitted!");
      setTimeout(() => setLocalMessage(null), 5000);
    }
  }, [isConfirmed]);

  const bgGradient = isCelo
    ? "from-purple-600 to-indigo-700"
    : "from-gray-700 to-gray-800";

  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group transition-all duration-300`}>
      {/* Background icon */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <span className="text-8xl">🎁</span>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-black tracking-tight mb-1 uppercase">Engagement Rewards</h3>
            <p className="text-sm opacity-80 font-medium tracking-wide">Earn G$ for saving and sharing</p>
          </div>
          {!isCelo && (
            <button
              onClick={() => switchChain({ chainId: 42220 })}
              className="bg-purple-500/30 hover:bg-purple-500/50 border border-purple-400/30 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              Switch to Celo
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isCelo ? 'bg-green-400' : 'bg-gray-400'}`}></span>
              <span className="font-bold text-sm">{isCelo ? (canClaim ? 'Available' : 'Active') : 'Unavailable'}</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Last Claim</span>
            <span className="font-bold text-sm tracking-tight">{isCelo ? formatLastClaim() : 'N/A'}</span>
          </div>
        </div>

        {!isCelo ? (
          <div className="bg-yellow-400/20 border border-yellow-400/30 p-3 rounded-xl mb-4">
            <p className="text-[10px] font-bold text-yellow-100 uppercase leading-relaxed">
              Engagement rewards are currently only available on the Celo network. Switch networks to access your rewards.
            </p>
          </div>
        ) : (
          <button
            onClick={handleManualClaim}
            disabled={isClaiming || !canClaim}
            className={`w-full py-3 px-4 rounded-xl font-black tracking-widest uppercase transition-all shadow-lg ${canClaim && !isClaiming
              ? 'bg-white text-gray-900 hover:scale-[1.02] active:scale-95'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
          >
            {isClaiming ? "Processing..." : canClaim ? "Claim Available Rewards" : "Rewards Active"}
          </button>
        )}

        {localMessage && (
          <p className="text-[10px] font-black text-center mt-3 uppercase tracking-widest animate-pulse">
            {localMessage}
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          <p className="text-[10px] font-medium opacity-60 leading-normal italic">
            Rewards are automatically triggered after group creation or contribution.
            If a claim fails, you can try manual recovery here.
          </p>
          <p className="text-[10px] font-bold text-white/80 leading-normal">
            💡 First-time users: You must be registered with GoodDollar to receive rewards.
            If claims fail, make sure you have verified your identity in the GoodDollar app.
          </p>
        </div>
      </div>
    </div>
  );
}
