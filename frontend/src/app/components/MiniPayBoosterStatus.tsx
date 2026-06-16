"use client";

import React from 'react';
import { useMiniPay } from '@/context/MiniPayContext';

export default function MiniPayBoosterStatus() {
  const { isMiniPay, isMiniPayConnected, minipayBalance } = useMiniPay();

  if (!isMiniPay) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-500/10 border-b border-yellow-500/30 py-2 px-6 flex justify-between items-center text-xs relative overflow-hidden">
      <div className="absolute inset-0 bg-yellow-500/[0.02] animate-pulse pointer-events-none"></div>

      <div className="flex items-center gap-3 relative z-10">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
        </span>
        <span className="font-mono font-black text-yellow-500 tracking-[0.2em] uppercase flex items-center gap-1.5">
          ⚡ MiniPay Integration Booster
        </span>
        <span className="hidden md:inline text-white/50 border-l border-white/10 pl-3">
          Implicit Gasless Engine Activated
        </span>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        {isMiniPayConnected ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Celo Balance:</span>
            <span className="font-mono font-bold text-white bg-yellow-500/20 px-2 py-0.5 border border-yellow-500/20 rounded">
              {minipayBalance} CELO
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest animate-pulse">
            Connecting...
          </span>
        )}
      </div>
    </div>
  );
}

// Optimization: Reduce padding to improve viewport utilization.

// Optimization: Hardcode sensible default values for dimensions.

// Optimization: Ensure color palettes match premium dark mode style.

// Optimization: Resize dot indicator to prevent brand wrapping.
