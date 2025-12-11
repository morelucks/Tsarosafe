"use client";
import { useState, useEffect } from "react";
import { useUBIClaimInfo, useClaimUBI, useGoodDollarBalance } from "@/hooks/useGoodDollar";

export default function UBIClaim() {
  const { 
    claimableAmountFormatted, 
    timeUntilNextClaim, 
    canClaim, 
    dailyUBIFormatted,
    isLoading: isLoadingClaimInfo 
  } = useUBIClaimInfo();
  
  const { claimUBI, isLoading: isClaiming, isConfirmed, error } = useClaimUBI();
  const { refetch: refetchBalance } = useGoodDollarBalance();
  
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
      setMessage("UBI claimed successfully! 🎉");
      refetchBalance(); // Refresh balance after claim
      setTimeout(() => setMessage(null), 5000);
    }
  }, [isConfirmed, refetchBalance]);

  // Handle claim error
  useEffect(() => {
    if (error) {
      setMessage(`Claim failed: ${error.message}`);
      setTimeout(() => setMessage(null), 5000);
    }
  }, [error]);

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
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (isLoadingClaimInfo) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Universal Basic Income</h3>
          <p className="text-sm opacity-90">Daily G$ allocation</p>
        </div>
        <div className="text-3xl">🌍</div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-90">Claimable Amount:</span>
          <span className="font-bold text-lg">
            {claimableAmountFormatted.toLocaleString(undefined, { maximumFractionDigits: 2 })} G$
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm opacity-90">Daily UBI:</span>
          <span className="font-medium">
            {dailyUBIFormatted.toLocaleString(undefined, { maximumFractionDigits: 2 })} G$
          </span>
        </div>

        {!canClaim && timeLeft > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-90">Next claim in:</span>
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={!canClaim || isClaiming}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
            canClaim && !isClaiming
              ? 'bg-white text-green-600 hover:bg-gray-100 shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isClaiming ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              Claiming...
            </div>
          ) : canClaim ? (
            `Claim ${claimableAmountFormatted.toLocaleString(undefined, { maximumFractionDigits: 2 })} G$`
          ) : (
            'No UBI Available'
          )}
        </button>

        {!canClaim && timeLeft === 0 && claimableAmountFormatted === 0 && (
          <p className="text-xs opacity-75 text-center">
            You may not be eligible for UBI or have already claimed today's allocation.
          </p>
        )}
      </div>
    </div>
  );
}