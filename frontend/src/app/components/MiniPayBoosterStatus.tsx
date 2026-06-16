"use client";

import React from 'react';
import { useMiniPay } from '@/context/MiniPayContext';

export default function MiniPayBoosterStatus() {
  const { isMiniPay, isMiniPayConnected, minipayBalance } = useMiniPay();

  if (!isMiniPay) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-500/10 border-b border-yellow-500/30 py-1.5 px-3 flex justify-between items-center text-[10px] relative overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 bg-yellow-500/[0.02] animate-pulse pointer-events-none"></div>

      <div className="flex items-center gap-2 relative z-10">
        <span className="flex h-1.5 w-1.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
        </span>
        <span className="font-mono font-black text-yellow-500 tracking-wider uppercase flex items-center gap-1">
          ⚡ MiniPay Active
        </span>
        <span className="hidden sm:inline text-white/40 border-l border-white/10 pl-2">
          Gasless Live
        </span>
      </div>

      <div className="flex items-center gap-2 relative z-10">
        {isMiniPayConnected ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Celo:</span>
            <span className="font-mono font-bold text-white bg-yellow-500/20 px-1.5 py-0.5 border border-yellow-500/20 rounded text-[9px]">
              {minipayBalance} CELO
            </span>
          </div>
        ) : (
          <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-wider animate-pulse">
            Connecting...
          </span>
        )}
      </div>
    </div>
  );
}
