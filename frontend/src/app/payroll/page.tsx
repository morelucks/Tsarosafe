"use client";

import React, { useState, useEffect } from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { getCompanyIdByOwner, getCompanyDetails, getPaymentCount } from '@/lib/payroll-contract';
import RegisterCompany from './components/RegisterCompany';
import DashboardStats from './components/DashboardStats';
import { Company, DashboardStats as StatsType } from '@/types/payroll';
import Link from 'next/link';

export default function PayrollDashboard() {
  const { isConnected, userAddress, networkName, connect } = useStacksWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<StatsType>({
    totalPaid: 0,
    employeeCount: 0,
    paymentCount: 0,
    treasuryBalance: '0.00',
    activeEmployees: 0,
  });

  // Fetch or mock dashboard data
  const fetchData = async (address: string) => {
    setIsLoading(true);
    try {
      const companyId = await getCompanyIdByOwner(networkName, address);
      if (companyId) {
        const details = await getCompanyDetails(networkName, companyId);
        if (details) {
          setCompany(details);
          const payCount = await getPaymentCount(networkName, companyId);
          setStats({
            totalPaid: details.totalPaid,
            employeeCount: details.employeeCount,
            paymentCount: payCount,
            treasuryBalance: '15,000.00', // Mock treasury balance for demo
            activeEmployees: details.employeeCount,
          });
        }
      } else {
        // Clear if not registered
        setCompany(null);
      }
    } catch (err) {
      console.error('Error fetching company details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && userAddress) {
      fetchData(userAddress);
    } else {
      setIsLoading(false);
    }
  }, [isConnected, userAddress, networkName]);

  const handleRegisterSuccess = (companyId: number) => {
    if (userAddress) {
      fetchData(userAddress);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-block py-1 px-3 border border-blue-400 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase mb-6">
            Stacks Clarity Smart Contract
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            DECENTRALIZED <br />
            <span className="text-blue-500">PAYROLL.</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
            Automate corporate payouts and employee salaries with total security. Built on Stacks, secured by Bitcoin consensus.
          </p>
          <button
            onClick={connect}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-none transition-all uppercase tracking-widest text-xs"
          >
            Connect Stacks Wallet
          </button>
        </div>

        <div className="flex-1 w-full max-w-md bg-[#112240] border border-white/10 p-6 rounded-lg shadow-xl">
          <div className="border-b border-white/10 pb-4 mb-4">
            <h3 className="text-lg font-bold text-white">Features Included</h3>
          </div>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">✓</span> Onboard employees with locked salaries
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">✓</span> Role-based contract administration (Admin/Manager)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">✓</span> Support for automated batch payments
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">✓</span> Absolute transparency on corporate finances
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase">Loading Workspace Details...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="py-12">
        <RegisterCompany onSuccess={handleRegisterSuccess} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            {company.name} Workspace
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Company ID: #{company.id} • Owner: {company.owner.slice(0, 10)}...{company.owner.slice(-6)}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/payroll/payments"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-none text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center"
          >
            💸 Execute Payout
          </Link>
          <Link
            href="/payroll/employees"
            className="border border-white/10 hover:bg-white/5 text-white font-bold py-3 px-6 rounded-none text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center"
          >
            👥 Manage Workers
          </Link>
        </div>
      </div>

      {/* Corporate Dashboard Stats */}
      <DashboardStats company={company} stats={stats} />

      {/* Main dashboard widgets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick analytics info */}
        <div className="lg:col-span-2 bg-[#112240] border border-white/10 p-6 rounded-lg relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="border-b border-white/10 pb-4 mb-6 flex justify-between items-center">
            <h3 className="font-bold text-white text-lg">Active Payroll Status</h3>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold uppercase tracking-wider rounded">
              Active Registry
            </span>
          </div>

          <div className="space-y-6">
            <p className="text-gray-400 text-sm leading-relaxed">
              Your company has onboarding capability activated. To run payments, ensure that your Stacks Treasury wallet (<span className="font-mono text-white text-xs">{company.treasury.slice(0, 8)}...</span>) holds a sufficient balance of STX or SIP-010 custom tokens.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0a192f] border border-white/5 p-4 rounded">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Weekly Forecast</p>
                <p className="text-xl font-bold text-white">0.00 STX</p>
              </div>
              <div className="bg-[#0a192f] border border-white/5 p-4 rounded">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Monthly Forecast</p>
                <p className="text-xl font-bold text-white">0.00 STX</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Help Guide panel */}
        <div className="bg-[#112240] border border-white/10 p-6 rounded-lg shadow-xl space-y-6">
          <h3 className="font-bold text-white text-lg border-b border-white/10 pb-4">
            Getting Started Guide
          </h3>

          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 w-6 h-6 shrink-0 flex items-center justify-center font-bold text-xs rounded-full">1</span>
              <div>
                <h4 className="font-bold text-white text-sm">Add Corporate Employees</h4>
                <p className="text-xs text-gray-400 mt-1">Onboard staff with fixed wallets and set basic salaries.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 w-6 h-6 shrink-0 flex items-center justify-center font-bold text-xs rounded-full">2</span>
              <div>
                <h4 className="font-bold text-white text-sm">Fund Stacks Treasury</h4>
                <p className="text-xs text-gray-400 mt-1">Make sure you hold enough STX to clear batch transaction events.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 w-6 h-6 shrink-0 flex items-center justify-center font-bold text-xs rounded-full">3</span>
              <div>
                <h4 className="font-bold text-white text-sm">Initiate Monthly Run</h4>
                <p className="text-xs text-gray-400 mt-1">Trigger single or batch payments safely inside our payments portal.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
