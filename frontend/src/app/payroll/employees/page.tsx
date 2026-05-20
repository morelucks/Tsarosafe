"use client";
import React, { useState } from 'react';
import { Employee } from '@/types/payroll';

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees] = useState<Employee[]>([
    { wallet: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', name: 'Alice Cooper', salary: 3500000000, startDate: 125300, active: true, totalReceived: 7000000000, lastPaidAt: 125300 }
  ]);

  const filtered = employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-3 bg-[#112240] text-white" />
      {filtered.map(e => <p key={e.wallet} className="text-white">{e.name}</p>)}
    </div>
  );
}
