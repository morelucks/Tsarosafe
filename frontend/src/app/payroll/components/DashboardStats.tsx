"use client";

import React from 'react';
import { Company, DashboardStats as StatsType } from '@/types/payroll';

interface DashboardStatsProps {
  company: Company;
  stats: StatsType;
}

export default function DashboardStats({ company, stats }: DashboardStatsProps) {
  const cards = [
    {
      title: 'Total Payouts',
      value: `${(company.totalPaid / 1000000).toLocaleString(undefined, { minimumFractionDigits: 2 })} STX`,
      description: 'Accumulated corporate payouts',
      icon: '💸',
      color: 'text-blue-500',
    },
    {
      title: 'Active Workers',
      value: company.employeeCount.toString(),
      description: 'Onboarded corporate members',
      icon: '👥',
      color: 'text-green-500',
    },
    {
      title: 'Payment Transactions',
      value: stats.paymentCount.toString(),
      description: 'Historic payments executed',
      icon: '📊',
      color: 'text-purple-500',
    },
    {
      title: 'Treasury Wallet',
      value: `${company.treasury.slice(0, 6)}...${company.treasury.slice(-6)}`,
      description: 'Corporate funding source',
      icon: '🏛️',
      color: 'text-orange-500',
      action: () => {
        navigator.clipboard.writeText(company.treasury);
        alert('Treasury address copied to clipboard!');
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-[#112240] border border-white/10 p-6 rounded-lg relative overflow-hidden transition-all duration-300 hover:border-white/20 hover:-translate-y-1 shadow-lg"
        >
          {/* subtle glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {card.title}
            </span>
            <span className="text-2xl">{card.icon}</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tight mb-2">
            {card.value}
          </h3>

          <p className="text-xs text-gray-400 font-medium">
            {card.description}
          </p>

          {card.action && (
            <button
              onClick={card.action}
              className="mt-4 text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>📋</span> Copy Address
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
