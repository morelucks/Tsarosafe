"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStacksWallet } from '@/context/StacksWalletContext';

export default function PayrollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { 
    isConnected, 
    userAddress, 
    connect, 
    disconnect, 
    networkName, 
    setNetworkName 
  } = useStacksWallet();

  const navItems = [
    { name: 'Dashboard', href: '/payroll', icon: '📊' },
    { name: 'Employees', href: '/payroll/employees', icon: '👥' },
    { name: 'Payments', href: '/payroll/payments', icon: '💸' },
    { name: 'Settings', href: '/payroll/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-[#0a192f] text-white flex flex-col md:flex-row pt-20">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-[#112240] border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">💼</span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">TsaroPayroll</h2>
              <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase">Stacks Edition</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 font-semibold transition-all duration-200 border-l-2 ${
                    isActive
                      ? 'bg-blue-600/10 border-blue-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Network & Wallet Controls */}
        <div className="mt-8 space-y-4 pt-6 border-t border-white/10">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">
              Select Network
            </label>
            <select
              value={networkName}
              onChange={(e) => setNetworkName(e.target.value as 'mainnet' | 'testnet' | 'devnet')}
              className="w-full bg-[#0a192f] border border-white/10 text-white text-xs py-2 px-3 focus:outline-none focus:border-blue-500 rounded"
            >
              <option value="mainnet">Stacks Mainnet</option>
              <option value="testnet">Stacks Testnet</option>
              <option value="devnet">Stacks Local Devnet</option>
            </select>
          </div>

          <div>
            {isConnected && userAddress ? (
              <div className="space-y-2">
                <div className="bg-[#0a192f] border border-white/5 p-3 rounded">
                  <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                    Connected Wallet
                  </p>
                  <p className="font-mono text-xs text-gray-300 truncate" title={userAddress}>
                    {userAddress.slice(0, 6)}...{userAddress.slice(-6)}
                  </p>
                </div>
                <button
                  onClick={disconnect}
                  className="w-full bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-500/20 text-xs font-bold py-2 px-4 transition-all"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 px-4 transition-all flex items-center justify-center gap-2"
              >
                <span>🔑</span> Connect Stacks Wallet
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content page area */}
      <main className="flex-1 p-6 md:p-10 bg-[#0a192f] overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
