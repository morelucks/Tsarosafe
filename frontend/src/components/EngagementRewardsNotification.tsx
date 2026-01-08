"use client";

import { useEffect, useState } from "react";
import { useClaimEngagementReward } from "@/hooks/useEngagementRewards";

interface EngagementRewardsNotificationProps {
  onClaimSuccess?: () => void;
  onClaimError?: (error: Error) => void;
}

export default function EngagementRewardsNotification({
  onClaimSuccess,
  onClaimError,
}: EngagementRewardsNotificationProps) {
  const { isConfirmed, error, hash } = useClaimEngagementReward();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    if (isConfirmed) {
      setNotificationMessage("🎉 Engagement rewards claimed successfully!");
      setShowNotification(true);
      onClaimSuccess?.();
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [isConfirmed, onClaimSuccess]);

  useEffect(() => {
    if (error) {
      setNotificationMessage("❌ Failed to claim engagement rewards. Please try again.");
      setShowNotification(true);
      onClaimError?.(error as Error);
      setTimeout(() => setShowNotification(false), 7000);
    }
  }, [error, onClaimError]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`p-4 rounded-lg shadow-lg ${
          isConfirmed
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="font-medium">{notificationMessage}</p>
          <button
            onClick={() => setShowNotification(false)}
            className="ml-4 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        {hash && (
          <p className="text-xs mt-2 opacity-90">
            Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
          </p>
        )}
      </div>
    </div>
  );
}

