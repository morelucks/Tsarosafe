"use client";

import React from 'react';
import { useMiniPay } from '@/context/MiniPayContext';

interface MiniPayBoosterStatusProps {
  variant?: 'banner' | 'card';
}

export default function MiniPayBoosterStatus({ variant = 'banner' }: MiniPayBoosterStatusProps) {
  const { isMiniPay, isMiniPayConnected, minipayBalance } = useMiniPay();

  if (!isMiniPay) return null;

  if (variant === 'card') {
    return (
      <div className="relative group bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border border-yellow-500/20 rounded-2xl p-6 transition-all duration-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)] overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all duration-500 pointer-events-none"></div>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center mr-4 text-yellow-500 text-2xl group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">MiniPay Booster</p>
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Integration Active</h3>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 uppercase tracking-wider">
            Premium Mode
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-yellow-500/10 text-xs">
          <div>
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Celo Balance</p>
            <p className="font-mono font-black text-slate-900 dark:text-white mt-1 text-sm">
              {isMiniPayConnected ? `${minipayBalance} CELO` : 'Connecting...'}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gasless Transact</p>
            <p className="font-bold text-emerald-500 dark:text-emerald-400 mt-1 text-sm flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Enabled
            </p>
          </div>
        </div>

        <div className="mt-5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
          Implicit auto-connection and gasless transactions are optimized for your mobile webview session.
        </div>
      </div>
    );
  }

  // Default: Banner variant (very compact top banner)
  return (
    <div className="w-full bg-gradient-to-r from-amber-500/5 via-yellow-500/15 to-amber-500/5 border-b border-yellow-500/20 py-1 px-3 flex justify-between items-center text-[9px] relative overflow-hidden transition-all duration-300 h-7">
      <div className="absolute inset-0 bg-yellow-500/[0.01] animate-pulse pointer-events-none"></div>

      <div className="flex items-center gap-1.5 relative z-10">
        <span className="flex h-1.5 w-1.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
        </span>
        <span className="font-mono font-black text-yellow-500 tracking-wider uppercase flex items-center gap-0.5">
          ⚡ MiniPay
        </span>
        <span className="hidden xs:inline text-white/30 border-l border-white/10 pl-1.5">
          Gasless Live
        </span>
      </div>

      <div className="flex items-center gap-2 relative z-10">
        {isMiniPayConnected ? (
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Celo:</span>
            <span className="font-mono font-bold text-white bg-yellow-500/20 px-1 py-0.2 border border-yellow-500/25 rounded text-[8px]">
              {minipayBalance} CELO
            </span>
          </div>
        ) : (
          <span className="text-[8px] font-bold text-yellow-500 uppercase tracking-wider animate-pulse">
            Connecting...
          </span>
        )}
      </div>
    </div>
  );
}
