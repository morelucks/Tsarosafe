"use client";
import React, { useState } from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { reactivateEmployeeTx } from '@/lib/payroll-contract';
import { Employee } from '@/types/payroll';

export default function EmployeesPage() {
  const { userSession, networkName, network } = useStacksWallet();
  const [employees] = useState<Employee[]>([
    { wallet: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', name: 'Alice Cooper', salary: 3500000000, startDate: 125300, active: false, totalReceived: 7000000000, lastPaidAt: 125300 }
  ]);

  const handleReactivate = (wallet: string) => {
    reactivateEmployeeTx({ userSession, networkName, network }, 1, wallet);
  };

  return (
    <div className="space-y-6">
      {employees.map(e => (
        <div key={e.wallet} className="text-white p-4 bg-[#112240]">
          {e.name} <button onClick={() => handleReactivate(e.wallet)}>Reactivate</button>
        </div>
      ))}
    </div>
  );
}
