"use client";
import React from 'react';
import { useMiniPay } from '@/context/MiniPayContext';

export default function MiniPayBoosterStatus() {
  const { isMiniPay, isMiniPayConnected, minipayBalance } = useMiniPay();

  if (!isMiniPay) return null;

  return (
    <div className="w-full bg-[#030712] py-2 px-6 flex justify-between items-center text-xs relative overflow-hidden">
      <div className="absolute inset-0 bg-yellow-500/[0.02] animate-pulse pointer-events-none"></div>
      <div className="flex items-center gap-3 relative z-10">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
        </span>
        <span className="font-mono font-black text-yellow-500 tracking-[0.2em] uppercase flex items-center gap-1.5">
          ⚡ MiniPay Integration Booster
        </span>
      </div>
      <div className="flex items-center gap-4 relative z-10">
        {isMiniPayConnected ? (
          <span>Balance: {minipayBalance} CELO</span>
        ) : (
          <span>Connecting...</span>
        )}
      </div>
    </div>
  );
}
