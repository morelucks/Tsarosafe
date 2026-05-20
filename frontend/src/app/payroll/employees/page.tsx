"use client";
import React, { useState, useEffect } from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { getCompanyIdByOwner, getEmployeeDetails } from '@/lib/payroll-contract';
import { Employee } from '@/types/payroll';

export default function EmployeesPage() {
  const { isConnected, userAddress, networkName } = useStacksWallet();
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (isConnected && userAddress) {
      getCompanyIdByOwner(networkName, userAddress).then(id => {
        if (id) getEmployeeDetails(networkName, id, 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM').then(emp => {
          if (emp) setEmployees([emp]);
        });
      });
    }
  }, [isConnected, userAddress, networkName]);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white uppercase">Employees Directory</h1>
      {employees.map(e => <p key={e.wallet} className="text-white">{e.name}</p>)}
    </div>
  );
}
