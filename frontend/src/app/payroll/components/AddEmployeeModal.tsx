"use client";

import React, { useState } from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { addEmployeeTx } from '@/lib/payroll-contract';
import { useNotification } from '@/context/NotificationContext';

interface AddEmployeeModalProps {
  companyId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmployeeModal({
  companyId,
  isOpen,
  onClose,
  onSuccess,
}: AddEmployeeModalProps) {
  const { userSession, networkName, network } = useStacksWallet();
  const { addNotification } = useNotification();
  const [wallet, setWallet] = useState('');
  const [name, setName] = useState('');
  const [salary, setSalary] = useState(''); // in STX
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !name || !salary) {
      addNotification('error', 'Please fill in all fields');
      return;
    }

    const numSalary = parseFloat(salary);
    if (isNaN(numSalary) || numSalary <= 0) {
      addNotification('error', 'Salary must be a positive number');
      return;
    }

    // Convert STX to micro-STX (1 STX = 1,000,000 micro-STX)
    const microSalary = Math.round(numSalary * 1000000);

    setIsLoading(true);
    try {
      addEmployeeTx(
        {
          userSession,
          networkName,
          network,
          onFinish: (data) => {
            setIsLoading(false);
            addNotification('success', `Add employee transaction broadcasted! Tx ID: ${data.txId.slice(0, 10)}...`);
            onSuccess();
            onClose();
          },
          onCancel: () => {
            setIsLoading(false);
            addNotification('info', 'Add employee cancelled');
          },
        },
        companyId,
        wallet,
        name,
        microSalary
      );
    } catch (err: any) {
      console.error(err);
      addNotification('error', err.message || 'Failed to submit transaction');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#112240] border border-white/10 p-8 rounded-lg shadow-2xl overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <h3 className="text-xl font-bold uppercase tracking-tight text-white">Onboard New Worker</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all text-xl focus:outline-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
              Employee Wallet Address
            </label>
            <input
              type="text"
              placeholder="e.g. SP34MN3DMM..."
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#0a192f] border border-white/10 text-white py-3 px-4 focus:outline-none focus:border-blue-500 rounded font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Satoshi Nakamoto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              maxLength={64}
              className="w-full bg-[#0a192f] border border-white/10 text-white py-3 px-4 focus:outline-none focus:border-blue-500 rounded text-sm font-semibold"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
              Monthly Salary (STX)
            </label>
            <input
              type="number"
              step="0.000001"
              placeholder="e.g. 500"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#0a192f] border border-white/10 text-white py-3 px-4 focus:outline-none focus:border-blue-500 rounded text-sm font-semibold"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Salary set here will be automatically mapped to this worker's wallet details in the contract registry.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border border-white/10 hover:bg-white/5 text-white font-bold py-3 text-xs uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white font-bold py-3 text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Broadcasting...
                </>
              ) : (
                'Onboard Worker'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
