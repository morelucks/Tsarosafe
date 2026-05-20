"use client";
import React, { useState, useEffect } from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { getCompanyIdByOwner, getCompanyDetails } from '@/lib/payroll-contract';
import { Company } from '@/types/payroll';
import RegisterCompany from './components/RegisterCompany';

export default function PayrollDashboard() {
  const { isConnected, userAddress, networkName } = useStacksWallet();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && userAddress) {
      getCompanyIdByOwner(networkName, userAddress).then(id => {
        if (id) getCompanyDetails(networkName, id).then(setCompany);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [isConnected, userAddress, networkName]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {!company ? (
        <RegisterCompany onSuccess={() => {}} />
      ) : (
        <h1 className="text-4xl font-black text-white uppercase">{company.name} Workspace</h1>
      )}
    </div>
  );
}
