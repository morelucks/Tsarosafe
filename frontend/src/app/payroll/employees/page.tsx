"use client";
import React, { useState } from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { updateSalaryTx } from '@/lib/payroll-contract';
import { Employee } from '@/types/payroll';

export default function EmployeesPage() {
  const { userSession, networkName, network } = useStacksWallet();
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [editingSalary, setEditingSalary] = useState('');
  const [employees] = useState<Employee[]>([
    { wallet: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', name: 'Alice Cooper', salary: 3500000000, startDate: 125300, active: true, totalReceived: 7000000000, lastPaidAt: 125300 }
  ]);

  const handleUpdate = (wallet: string) => {
    updateSalaryTx({ userSession, networkName, network }, 1, wallet, parseFloat(editingSalary) * 1000000);
  };

  return (
    <div className="space-y-6">
      {employees.map(e => (
        <div key={e.wallet} className="text-white p-4 bg-[#112240]">
          {e.name} - {editingWallet === e.wallet ? (
            <button onClick={() => handleUpdate(e.wallet)}>Save</button>
          ) : (
            <button onClick={() => setEditingWallet(e.wallet)}>Edit</button>
          )}
        </div>
      ))}
    </div>
  );
}
