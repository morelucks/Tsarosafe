"use client";

import React, { useState } from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { registerCompanyTx } from '@/lib/payroll-contract';
import { useNotification } from '@/context/NotificationContext';

interface RegisterCompanyProps {
  onSuccess: (companyId: number) => void;
}

export default function RegisterCompany({ onSuccess }: RegisterCompanyProps) {
  const { userSession, networkName, network, isConnected, connect } = useStacksWallet();
  const { addNotification } = useNotification();
  const [name, setName] = useState('');
  const [treasury, setTreasury] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !treasury) {
      addNotification('error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      registerCompanyTx(
        {
          userSession,
          networkName,
          network,
          onFinish: (data) => {
            setIsLoading(false);
            addNotification('success', `Registration transaction broadcasted! Tx ID: ${data.txId.slice(0, 10)}...`);
            // Standard timeout to wait or read state
            setTimeout(() => {
              // For demonstration/fallback when blocks confirm, or we prompt for dashboard reload
              onSuccess(1); // Call success handler with fallback ID 1
            }, 3000);
          },
          onCancel: () => {
            setIsLoading(false);
            addNotification('info', 'Registration cancelled');
          },
        },
        name,
        treasury
      );
    } catch (err: any) {
      console.error(err);
      addNotification('error', err.message || 'Failed to trigger contract call');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-[#112240] border border-white/10 p-8 rounded-lg shadow-2xl relative overflow-hidden">
      {/* Decorative styling */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="mb-8 text-center">
        <span className="text-5xl block mb-4">🚀</span>
        <h2 className="text-3xl font-black tracking-tight text-white uppercase">Register Company</h2>
        <p className="text-gray-400 text-sm mt-2">
          Set up your decentralized company workspace on the Stacks blockchain. Onboard workers and execute transparent payouts.
        </p>
      </div>

      {!isConnected ? (
        <div className="text-center p-6 border border-dashed border-white/10 rounded">
          <p className="text-gray-400 mb-6 text-sm">Please connect your Stacks wallet to register a company.</p>
          <button
            onClick={connect}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-none transition-all uppercase tracking-widest text-xs"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
              Company Name
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corporation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              maxLength={64}
              className="w-full bg-[#0a192f] border border-white/10 text-white py-3 px-4 focus:outline-none focus:border-blue-500 rounded transition-all font-medium"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
              Treasury Wallet Address
            </label>
            <input
              type="text"
              placeholder="e.g. SP34MN3DMM..."
              value={treasury}
              onChange={(e) => setTreasury(e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#0a192f] border border-white/10 text-white py-3 px-4 focus:outline-none focus:border-blue-500 rounded transition-all font-mono text-xs"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Payments will be funded from this multi-sig or single-sig treasury wallet address.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white font-bold py-4 rounded-none transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Broadcasting to Stacks...
              </>
            ) : (
              'Register Company On-Chain'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
