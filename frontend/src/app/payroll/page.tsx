"use client";
import React, { useState, useEffect } from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { getCompanyIdByOwner, getCompanyDetails } from '@/lib/payroll-contract';
import { Company } from '@/types/payroll';
import Link from 'next/link';

export default function PayrollDashboard() {
  const { isConnected, userAddress, networkName } = useStacksWallet();
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (isConnected && userAddress) {
      getCompanyIdByOwner(networkName, userAddress).then(id => {
        if (id) getCompanyDetails(networkName, id).then(setCompany);
      });
    }
  }, [isConnected, userAddress, networkName]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <h1 className="text-4xl font-black text-white uppercase">Corporate Workspace</h1>
        <div className="flex gap-4">
          <Link href="/payroll/payments" className="bg-blue-600 p-3 text-xs uppercase font-bold text-white">Execute Payment</Link>
          <Link href="/payroll/employees" className="border border-white/10 p-3 text-xs uppercase font-bold text-white">Employees</Link>
        </div>
      </div>
    </div>
  );
}
