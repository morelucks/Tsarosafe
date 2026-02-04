"use client";
import { useState, useEffect } from "react";
import { useUBIClaimInfo, useClaimUBI, useGoodDollarBalance } from "@/hooks/useGoodDollar";
import { useUBIEligibility } from "@/hooks/useUBIEligibility";
import { USDAmount } from "./GDollarAmount";
import { useAccount } from "wagmi";

export default function UBIClaim() {
  const {
    claimableAmountFormatted,
    timeUntilNextClaim,
    canClaim,
    dailyUBIFormatted,
    isLoading: isLoadingClaimInfo
  } = useUBIClaimInfo();

  const { isEligible } = useUBIEligibility();
  const { claimUBI, isLoading: isClaiming, isConfirmed, error } = useClaimUBI();
  const { refetch: refetchBalance } = useGoodDollarBalance();
  const { chain } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isBase = chain?.id === 8453 || chain?.id === 84532;

  const [message, setMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeUntilNextClaim);

  // Update countdown timer
  useEffect(() => {
    setTimeLeft(timeUntilNextClaim);

    if (timeUntilNextClaim > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timeUntilNextClaim]);

  // Handle successful claim
  useEffect(() => {
    if (isConfirmed) {
      setMessage("UBI claimed successfully! 🎉 Your G$ balance has been updated.");
      refetchBalance();
      setTimeout(() => setMessage(null), 6000);
    }
  }, [isConfirmed, refetchBalance]);

  // Handle claim error
  useEffect(() => {
    if (error) {
      let errorMessage = 'Failed to claim UBI';

      if (error.message.includes('User rejected') || error.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled. Please try again when ready.';
      } else if (error.message.includes('insufficient funds') || error.message.includes('gas')) {
        errorMessage = `Insufficient funds for transaction fees. Please add ${isBase ? 'ETH' : 'CELO'} to your wallet.`;
      } else if (error.message.includes('not eligible') || error.message.includes('entitlement')) {
        errorMessage = 'You are not currently eligible for UBI. Please verify your GoodDollar identity.';
      } else if (error.message.includes('already claimed') || error.message.includes('cooldown')) {
        errorMessage = 'You have already claimed UBI recently. Please wait for the next claim period.';
      } else if (error.message) {
        errorMessage = `Claim failed: ${error.message}`;
      }

      setMessage(errorMessage);
      setTimeout(() => setMessage(null), 8000);
    }
  }, [error, isBase]);

  const handleClaim = async () => {
    try {
      await claimUBI();
    } catch (err) {
      console.error('Failed to claim UBI:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  if (!mounted || isLoadingClaimInfo) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const bgClass = isBase
    ? "from-blue-600 to-blue-800"
    : "from-green-500 to-green-600";

  return (
    <div className={`bg-gradient-to-br ${bgClass} rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group transition-all duration-500`}>
      {/* Network Watermark */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.07] pointer-events-none group-hover:opacity-10 transition-opacity">
        <div className="text-9xl font-black text-white transform -rotate-12 translate-x-16 -translate-y-8 uppercase select-none">
          {isBase ? "Base" : "Celo"}
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-black tracking-tight mb-1 uppercase">Universal Basic Income</h3>
            <p className="text-sm opacity-80 font-medium tracking-wide">Daily G$ allocation</p>
          </div>
          <div className="text-4xl filter drop-shadow-lg">{isBase ? "🔵" : "🌍"}</div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl font-bold text-sm flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2 ${message.includes('successfully')
            ? 'bg-white/90 text-green-800 shadow-lg'
            : 'bg-red-500/90 text-white shadow-lg'
            }`}>
            <span>{message.includes('successfully') ? '✅' : '❌'}</span>
            {message}
          </div>
        )}

        <div className="space-y-4 mb-6 pt-2 border-t border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80 font-bold uppercase tracking-widest">Claimable</span>
            <div className="text-right">
              <span className="font-black text-2xl tracking-tighter">
                {claimableAmountFormatted.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                <span className="text-sm ml-1 opacity-70">G$</span>
              </span>
              <div className="text-xs font-medium opacity-70">
                <USDAmount gdollarAmount={claimableAmountFormatted} className="text-white" />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80 font-bold uppercase tracking-widest">Daily Rate</span>
            <div className="text-right">
              <span className="font-bold">
                {dailyUBIFormatted.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                <span className="text-xs ml-1 opacity-70">G$</span>
              </span>
            </div>
          </div>

          {!canClaim && timeLeft > 0 && (
            <div className="flex justify-between items-center p-3 bg-black/10 rounded-lg">
              <span className="text-xs opacity-80 font-bold uppercase tracking-widest">Next claim in</span>
              <span className="font-mono font-bold text-sm tracking-widest">{formatTime(timeLeft)}</span>
            </div>
          )}

          {!isEligible && canClaim && (
            <div className="bg-yellow-400/20 border border-yellow-400/30 text-yellow-100 text-[10px] font-black uppercase tracking-widest p-3 rounded-lg flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              Verify identity to claim
            </div>
          )}
        </div>

        <button
          onClick={handleClaim}
          disabled={!canClaim || isClaiming}
          className={`w-full py-4 px-4 rounded-xl font-black tracking-widest uppercase transition-all shadow-2xl relative group/btn ${canClaim && !isClaiming
            ? 'bg-white text-gray-900 hover:scale-[1.03] active:scale-95'
            : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
        >
          {isClaiming ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
              <span>Processing...</span>
            </div>
          ) : canClaim ? (
            <div className="flex items-center justify-center gap-2">
              <span>Claim</span>
              <span>{claimableAmountFormatted.toLocaleString('en-US', { maximumFractionDigits: 2 })} G$</span>
            </div>
          ) : (
            'Locked'
          )}
        </button>

        {isClaiming && (
          <p className="text-[10px] font-bold text-center mt-3 opacity-60 uppercase tracking-widest animate-pulse font-mono">
            Transaction pending in wallet...
          </p>
        )}
      </div>

      {/* Decorative pulse line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
        <div className={`h-full w-1/4 animate-[translateX_4s_infinite_linear] ${isBase ? "bg-blue-400/40" : "bg-green-400/40"
          }`}></div>
      </div>
    </div>
  );
}