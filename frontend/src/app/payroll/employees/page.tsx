"use client";
import React, { useState } from 'react';
import { Employee } from '@/types/payroll';
export default function EmployeesPage() {
  const [employees] = useState<Employee[]>([
    { wallet: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', name: 'Alice Cooper', salary: 3500000000, startDate: 125300, active: true, totalReceived: 7000000000, lastPaidAt: 125300 }
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white uppercase">Employees Directory</h1>
      {employees.map(e => <p key={e.wallet} className="text-white">{e.name}</p>)}
    </div>
  );
}
