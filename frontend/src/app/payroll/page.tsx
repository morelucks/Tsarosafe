"use client";
import React, { useState, useEffect } from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { getCompanyIdByOwner, getCompanyDetails } from '@/lib/payroll-contract';
import { Company } from '@/types/payroll';

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
      <h1 className="text-4xl font-black text-white uppercase">Corporate Workspace</h1>
      {company && <p className="text-gray-400">Workspace name: {company.name}</p>}
    </div>
  );
}
